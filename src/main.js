import './styles/main.css';
import { CommandRegistry } from './core/registry.js';
import { Output } from './core/output.js';
import { registerCommands } from './commands/index.js';

const app = document.getElementById('app');
app.innerHTML = `
  <section id="history" aria-live="polite" aria-relevant="additions"></section>
  <form id="prompt" autocomplete="off">
    <span aria-hidden="true" class="prompt-sign">&gt;</span>
    <div class="input-shell">
      <div id="visual-input"><span id="before" aria-hidden="true"></span><span id="cursor" class="block-cursor" aria-hidden="true"> </span><span id="after" aria-hidden="true"></span><span id="input-hint">Введите <button class="terminal-command" type="button" data-command="меню">«меню»</button>, чтобы посмотреть список команд.</span></div>
      <input id="real-input" aria-label="Terminal command" aria-describedby="input-hint" type="text" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false" />
    </div>
  </form>`;

const historyElement = document.getElementById('history');
const form = document.getElementById('prompt');
const input = document.getElementById('real-input');
const before = document.getElementById('before');
const after = document.getElementById('after');
const cursor = document.getElementById('cursor');
const hint = document.getElementById('input-hint');
const output = new Output(historyElement);
const registry = new CommandRegistry();
const commandHistory = [];
let historyPosition = 0;
let currentJob = null;
let artworkStop = null;
const site = {
  lang: 'ru',
  navigate: (path) => { const url = path ? `#/${path}` : '#/'; if (location.hash !== url) history.replaceState(null, '', url); },
  clear: () => { currentJob?.abort(); output.clear(); },
  startArtwork: (start) => { if (artworkStop) artworkStop(); artworkStop = start(() => { artworkStop = null; input.focus(); }); },
};
registerCommands(registry, site);

function drawInput() {
  const value = input.value;
  const pos = input.selectionStart ?? value.length;
  before.textContent = value.slice(0, pos);
  const char = value[pos] || ' ';
  cursor.textContent = char;
  after.textContent = value.slice(pos + (value[pos] ? 1 : 0));
  hint.hidden = value.length > 0;
}
input.addEventListener('input', drawInput);
input.addEventListener('click', drawInput);
input.addEventListener('keyup', drawInput);
input.addEventListener('select', drawInput);
form.addEventListener('click', () => input.focus());
app.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-command]');
  if (!button) return;
  input.value = button.dataset.command;
  historyPosition = commandHistory.length;
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
  drawInput();
  output.scroll();
});
// Клик по свободному месту страницы переводит фокус в командную строку.
// Не перехватываем ссылки, видео, выделение текста и элементы произведений.
app.addEventListener('pointerdown', (event) => {
  if (event.target.closest('a, button, input, textarea, select, video, audio, [contenteditable], .artwork-overlay')) return;
  if (window.getSelection()?.toString()) return;
  requestAnimationFrame(() => input.focus({ preventScroll: true }));
});

async function submit(raw, record = true) {
  const value = raw.trim();
  if (!value) return;
  currentJob?.abort();
  currentJob = new AbortController();
  if (record) {
    commandHistory.push(value);
    historyPosition = commandHistory.length;
    output.command(value);
  }
  input.value = ''; drawInput();
  try { await registry.execute(value, { output, signal: currentJob.signal }); }
  catch (error) { console.error(error); await output.text(`ERROR: ${error.message}`, currentJob.signal); }
  finally { output.scroll(); }
}
form.addEventListener('submit', (event) => {
  event.preventDefault();
  void submit(input.value);
});
input.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    historyPosition = Math.max(0, historyPosition - 1);
    input.value = commandHistory[historyPosition] || '';
    input.setSelectionRange(input.value.length, input.value.length);
    drawInput();
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    historyPosition = Math.min(commandHistory.length, historyPosition + 1);
    input.value = commandHistory[historyPosition] || '';
    input.setSelectionRange(input.value.length, input.value.length);
    drawInput();
  } else if (event.key === 'Tab') {
    const names = registry.entries().map((command) => command.name);
    const matches = names.filter((name) => name.startsWith(input.value));
    if (!event.shiftKey && matches.length === 1) {
      event.preventDefault();
      input.value = `${matches[0]} `;
      drawInput();
    }
  } else if (event.key === 'Escape' && artworkStop) artworkStop();
});

function routeFromHash() {
  const path = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  if (path === 'project/the-bridge') return 'мост';
  if (path === 'project/non-zero-sum-game') return 'игра с ненулевой суммой';
  if (path === 'statement') return 'главная';
  if (path === 'cv') return 'cv';
  return null;
}
window.addEventListener('hashchange', () => {
  const command = routeFromHash();
  site.clear();
  if (command) void submit(command, false);
});
drawInput();
if (performance.getEntriesByType('navigation')[0]?.type === 'reload') {
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
} else {
  const initialRoute = routeFromHash();
  if (initialRoute) void submit(initialRoute, false);
}
// Desktop starts ready to type; on mobile don't force the virtual keyboard open.
if (window.matchMedia('(pointer: fine)').matches) input.focus();
