import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ gfm: true, breaks: false });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const asset = (path) => {
  if (/^(https?:|data:|blob:|#)/i.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\/?(?:public\/)?/, '')}`;
};

export class Output {
  constructor(root) { this.root = root; }
  clear() { this.root.replaceChildren(); }
  scroll() { window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); }
  command(raw) {
    const line = document.createElement('div');
    line.className = 'command-history';
    line.textContent = `> ${raw}`;
    this.root.append(line);
    this.scroll();
  }
  async text(value, signal, speed = 9) {
    const line = document.createElement('div');
    line.className = 'terminal-output plain';
    this.root.append(line);
    for (const character of String(value)) {
      if (signal?.aborted) return;
      line.textContent += character;
      if (character === '\n') this.scroll();
      await sleep(speed);
    }
    this.scroll();
  }
  async markdown(raw, signal) {
    const lines = raw.split(/\r?\n/);
    let buffer = [];
    const flush = async () => {
      if (!buffer.length) return;
      const tokens = marked.lexer(buffer.join('\n'));
      buffer = [];
      for (const token of tokens) {
        if (signal?.aborted) return;
        const section = document.createElement('div');
        section.className = 'terminal-output markdown';
        section.innerHTML = DOMPurify.sanitize(marked.parser([token]));
        section.querySelectorAll('img, source, video').forEach((node) => {
          if (node.hasAttribute('src')) node.setAttribute('src', asset(node.getAttribute('src')));
        });
        section.querySelectorAll('a[href]').forEach((node) => {
          const href = node.getAttribute('href');
          if (href.startsWith('media/')) node.setAttribute('href', asset(href));
          if (/^https?:\/\//i.test(href)) { node.target = '_blank'; node.rel = 'noopener noreferrer'; }
        });
        this.root.append(section);
        const textNodes = [];
        const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) textNodes.push(walker.currentNode);
        const originalTexts = textNodes.map((node) => node.textContent);
        textNodes.forEach((node) => { node.textContent = ''; });
        for (let i = 0; i < textNodes.length; i++) {
          const value = originalTexts[i];
          for (let j = 0; j < value.length; j += 2) {
            if (signal?.aborted) return;
            textNodes[i].textContent += value.slice(j, j + 2);
            if (j % 14 === 0) this.scroll();
            await sleep(5);
          }
        }
        this.scroll();
      }
    };
    for (const line of lines) {
      const video = line.trim().match(/^::video\{src="([^"]+)"\}$/);
      const artwork = line.trim().match(/^::artwork\{id="([^"]+)"\}$/);
      if (video || artwork) {
        await flush();
        if (signal?.aborted) return;
        if (video) {
          const player = document.createElement('video');
          player.src = asset(video[1]); player.controls = true; player.preload = 'metadata';
          player.className = 'terminal-media';
          this.root.append(player);
        } else {
          const note = document.createElement('div');
          note.className = 'terminal-output';
          note.textContent = `[artwork: ${artwork[1]}] run ${artwork[1]}`;
          this.root.append(note);
        }
        this.scroll();
      } else buffer.push(line);
    }
    await flush();
  }
}
