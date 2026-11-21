import { parse as parseYaml } from 'yaml';

const files = import.meta.glob('../content/**/*.md', { eager: true, query: '?raw', import: 'default' });

function extract(raw) {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/);
  if (!match) return { metadata: {}, body: raw };
  return { metadata: parseYaml(match[1]) || {}, body: raw.slice(match[0].length) };
}

export function getContent(language = 'ru') {
  const prefix = `../content/${language}/`;
  const documents = Object.entries(files)
    .filter(([path]) => path.startsWith(prefix))
    .map(([path, raw]) => ({ path: path.slice(prefix.length), ...extract(raw) }));
  const projects = documents.filter((item) => item.path.startsWith('projects/'));
  projects.sort((a, b) => (a.metadata.order ?? 999) - (b.metadata.order ?? 999));
  return {
    documents,
    projects,
    statement: documents.find((item) => item.path === 'statement.md'),
    project: (id) => projects.find((item) => item.metadata.id === id),
  };
}
