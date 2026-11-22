import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ gfm: true, breaks: false });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function commandButton(command) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'terminal-command';
  button.dataset.command = command;
  button.textContent = command;
  return button;
}

const asset = (path) => {
  if (/^(https?:|data:|blob:|#)/i.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\/?(?:public\/)?/, '')}`;
};

function wrapPhoto(image) {
  const media = image.closest('picture') ?? image;
  const frame = document.createElement('span');
  frame.className = 'terminal-photo';
  frame.hidden = true;
  media.before(frame);
  frame.append(media);
  return frame;
}

async function printPhoto(image, frame, signal, scroll) {
  image.loading = 'eager';
  const loaded = await image.decode().then(() => true, () => false);
  if (signal?.aborted) return;
  frame.hidden = false;
  scroll();
  if (!loaded || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cursor = document.createElement('span');
  cursor.className = 'block-cursor photo-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.textContent = ' ';
  frame.append(cursor);

  const rows = Math.max(1, Math.ceil(image.offsetHeight / 10));
  const timing = { duration: rows * 22, easing: `steps(${rows})` };
  const reveal = image.animate(
    [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0)' }],
    timing,
  );
  const move = cursor.animate([{ top: '0%' }, { top: 'max(0px, calc(100% - 1.2em))' }], timing);
  const finish = () => { reveal.finish(); move.finish(); };
  signal?.addEventListener('abort', finish, { once: true });
  try {
    await reveal.finished;
  } finally {
    signal?.removeEventListener('abort', finish);
    cursor.remove();
  }
}

export class Output {
  constructor(root) { this.root = root; }
  clear() { this.root.replaceChildren(); }
  scroll() { window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); }
  command(raw) {
    const line = document.createElement('div');
    line.className = 'command-history';
    line.append('> ', commandButton(raw));
    this.root.append(line);
    this.scroll();
  }
  async commands(names, signal) {
    if (signal?.aborted) return;
    const list = document.createElement('ul');
    list.className = 'terminal-output command-list';
    this.root.append(list);
    for (const name of names) {
      const item = document.createElement('li');
      const button = commandButton(name);
      button.textContent = '';
      button.setAttribute('aria-label', name);
      const cursor = document.createElement('span');
      cursor.className = 'block-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      cursor.textContent = ' ';
      item.append(button, cursor);
      list.append(item);
      this.scroll();
      for (const character of name) {
        if (signal?.aborted) break;
        button.textContent += character;
        await sleep(7);
      }
      button.textContent = name;
      cursor.remove();
      if (signal?.aborted) return;
    }
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
        const nodes = [];
        const walker = document.createTreeWalker(section, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (node instanceof HTMLImageElement || node.nodeType === Node.TEXT_NODE) nodes.push(node);
        }
        const parts = nodes.map((node) => {
          if (node instanceof HTMLImageElement) return { node, frame: wrapPhoto(node) };
          const value = node.textContent;
          node.textContent = '';
          return { node, value };
        });
        this.root.append(section);
        for (const { node, value, frame } of parts) {
          if (signal?.aborted) return;
          if (frame) {
            await printPhoto(node, frame, signal, () => this.scroll());
            continue;
          }
          for (let j = 0; j < value.length; j += 2) {
            if (signal?.aborted) return;
            node.textContent += value.slice(j, j + 2);
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
