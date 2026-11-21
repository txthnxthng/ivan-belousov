import { getContent } from '../core/content.js';
import { startDemo } from '../artworks/demo.js';

export function registerCommands(registry, site) {
  registry.register('help', 'list available commands', async ({ output, signal }) => {
    await output.text('AVAILABLE COMMANDS\n\nhelp             show commands\nprojects         list projects\nopen <id>        open project\nstatement        artist statement\nlang <ru|en>     switch language\nrun demo         interactive artwork\nclear            clear output\n\n↑ / ↓ command history  ·  ESC exit artwork', signal, 5);
  });
  registry.register('projects', 'list projects', async ({ output, signal }) => {
    const { projects } = getContent(site.lang);
    const list = projects.map((p, i) => `${String(i + 1).padStart(2, '0')}  ${p.metadata.title.toUpperCase()}  /  ${p.metadata.year}\n     open ${p.metadata.id}`).join('\n\n');
    await output.text(list || 'No projects found.', signal, 5);
  });
  registry.register('open', 'open project', async ({ args, output, signal }) => {
    const id = args.join('-').toLowerCase();
    const project = getContent(site.lang).project(id);
    if (!project) { await output.text(`Project not found: ${id}\nType 'projects'.`, signal); return; }
    site.navigate(`project/${id}`);
    await output.markdown(project.body, signal);
  });
  registry.register('statement', 'artist statement', async ({ output, signal }) => {
    site.navigate('statement');
    const doc = getContent(site.lang).statement;
    if (doc) await output.markdown(doc.body, signal);
  });
  registry.register('lang', 'switch language', async ({ args, output, signal }) => {
    const choice = args[0];
    if (!['ru', 'en'].includes(choice)) { await output.text('Usage: lang ru | lang en', signal); return; }
    site.lang = choice;
    document.documentElement.lang = choice;
    await output.text(`language: ${choice}`, signal);
  });
  registry.register('clear', 'clear terminal', async () => { site.clear(); site.navigate(''); });
  registry.register('run', 'launch artwork', async ({ args, output, signal }) => {
    if (args[0] !== 'demo') { await output.text('Available artwork: run demo', signal); return; }
    site.startArtwork(startDemo);
  });
}
