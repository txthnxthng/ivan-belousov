# Ivan Terminal — стартовый проект

Минималистичный терминальный сайт на Vite и ванильном JavaScript. Белый фон, мигающий блочный курсор, Markdown-архив и модульные команды.

## Запуск

Установите Node.js 22+ и выполните в папке проекта:

```bash
npm install
npm run dev
```

Откройте адрес, который покажет Vite (обычно http://localhost:5173).

## Команды

`help`, `projects`, `open the-bridge`, `open non-zero-sum-game`, `statement`, `lang en`, `lang ru`, `run demo`, `clear`.

Стрелки ↑/↓ листают историю. Tab дополняет имя команды. Escape закрывает демо.

## Как редактировать содержание

Изменяйте Markdown-файлы в `src/content/ru/` и `src/content/en/`. Метаданные в YAML между строками `---` определяют id, заголовок, год и порядок. Изображения кладите в `public/media/...` и вставляйте как `![Описание](media/путь.webp)`. Видео: отдельная строка `::video{src="media/путь.mp4"}`.

Всё, что в `public/`, доступно из корня сайта: в Markdown пишите `media/...` без `/` в начале. Сборка автоматически учитывает префикс GitHub Pages.

## Добавление команд

Откройте `src/commands/index.js`. Новая команда регистрируется через `registry.register('имя', 'описание', async ({ args, output, signal }) => {...})`. Используйте `output.text()` или `output.markdown()`.

## Публикация

1. Создайте **пустой** репозиторий на GitHub.
2. Скопируйте проект и выполните:

```bash
git init
git add .
git commit -m "Initial terminal site"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

3. В репозитории откройте **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Вкладка **Actions** покажет сборку, а **Settings → Pages** — адрес сайта.

Vite настроен на `base: './'`, поэтому ресурсы работают и на `username.github.io/repository/`, и на собственном домене. Для навигации используем hash-адреса `#/project/<id>`, чтобы Github Pages не возвращал 404 при обновлении страницы.

## Дальше

Привести в порядок систему вывода, добавить потоковый рендеринг медиаблоков, улучшить отображение выделения текста и курсора при длинных командах, сделать мобильные тесты, подключить работы как модули.
