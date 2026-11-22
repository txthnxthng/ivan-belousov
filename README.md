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

Изменяйте Markdown-файлы в `src/content/ru/` и `src/content/en/`. Метаданные в YAML между строками `---` определяют `id`, заголовок, год и порядок проекта.

## Фото и видео

В `public/media/` у каждого проекта своя папка с именем, совпадающим с его `id` в Markdown. Для команды `главная` используется папка `statement`, для `cv` — папка `cv`. Русская и английская версии страницы могут использовать одни и те же файлы.

```text
public/media/
├── statement/
│   ├── photos/
│   └── videos/
├── cv/
│   ├── photos/
│   └── videos/
├── the-bridge/
│   ├── photos/
│   └── videos/
└── non-zero-sum-game/
    ├── photos/
    └── videos/
```

Храните здесь версии для сайта. Для фото подойдут WebP или JPEG, для видео — MP4 с H.264. Используйте короткие названия латиницей, в нижнем регистре, с дефисами вместо пробелов.

Например, положите `installation-view.webp` в `public/media/the-bridge/photos/`, а `documentation.mp4` — в `public/media/the-bridge/videos/`. В файле проекта укажите:

```md
![Общий вид инсталляции](media/the-bridge/photos/installation-view.webp)

::video{src="media/the-bridge/videos/documentation.mp4"}
```

Путь начинается с `media/` без начального слеша и без `public/`. Директива видео должна стоять на отдельной строке без обратных кавычек. Файлы `.gitkeep` сохраняют пустые папки в Git.

Для фото на главной укажите в `src/content/ru/statement.md` путь вида `media/statement/photos/portrait.webp`. Для видео в CV укажите в `src/content/ru/cv.md` путь вида `media/cv/videos/interview.mp4`.

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
