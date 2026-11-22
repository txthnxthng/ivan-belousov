import { getContent } from '../core/content.js';
import { startDemo } from '../artworks/demo.js';

export function registerCommands(registry, site) {
  const projectCommands = new Map([
    ['the-bridge', 'мост'],
    ['non-zero-sum-game', 'игра с ненулевой суммой'],
  ]);

  registry.register('меню', 'список команд', ({ output, signal }) => {
    return output.commands(registry.entries().map(({ name }) => name).filter((name) => name !== 'демо'), signal);
  });

  registry.register('архив проектов', 'список проектов', async ({ output, signal }) => {
    const { projects } = getContent('ru');
    const names = projects.map(({ metadata }) => projectCommands.get(metadata.id)).filter(Boolean);
    if (names.length) await output.commands(names, signal);
    else await output.text('Архив пока пуст.', signal);
  });

  registry.register('главная', 'артист-стейтмент', async ({ output, signal }) => {
    site.navigate('statement');
    const doc = getContent('ru').statement;
    if (doc) await output.markdown(doc.body, signal);
  });

  registry.register('cv', 'резюме', async ({ output, signal }) => {
    site.navigate('cv');
    const doc = getContent('ru').cv;
    if (doc) await output.markdown(doc.body, signal);
    else await output.text('Файл CV пока не создан.', signal);
  });

  for (const [id, command] of projectCommands) {
    registry.register(command, `проект ${id}`, async ({ output, signal }) => {
      const project = getContent('ru').project(id);
      if (!project) return output.text('Проект пока не найден.', signal);
      site.navigate(`project/${id}`);
      await output.markdown(project.body, signal);
    });
  }

  registry.register('очистить', 'очистить терминал', async () => {
    site.clear();
    site.navigate('');
  });

  // Техническая команда для проверки интерактивных модулей (в меню не показываем).
  registry.register('демо', 'тест Canvas', async () => site.startArtwork(startDemo));
}
