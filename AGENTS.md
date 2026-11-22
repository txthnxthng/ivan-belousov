# Instructions for coding agents — Ivan Belousov website

Read `PROJECT_CONTEXT.md` before making architectural changes. Treat the **current repository files** as the source of truth; this handoff summarizes prior ChatGPT discussions and the last provided v0.2 snapshot, not guaranteed to match subsequent local changes.

## Goal
Build a minimalist, command-driven media-art portfolio that behaves like a terminal, not a conventional portfolio disguised as one. The interface is an almost-empty white page, black monospaced type, Linux-style smoothly pulsing block cursor, and a single shared keyboard/mobile input. Commands render text and rich media into a scrolling terminal stream and can launch independent interactive artworks. Keep it artistic, spare, and extendable.

## Technical boundaries
- Static hosting: GitHub Pages; Vite + vanilla JavaScript + CSS. No required backend or external database.
- Markdown + YAML frontmatter for editable content under `src/content/`; project media in `public/media/`. Preserve clean separation of content, command parsing, rendering, and artworks.
- Reuse `src/core/registry.js`, `src/core/content.js`, `src/core/output.js`, `src/commands/index.js`, `src/artworks/`, `src/main.js`, and `src/styles/main.css` when present. Do not rewrite the architecture wholesale to make a small change.
- Russian is the current UI language. Preserve the existing `en` content for possible later use, but do not implement translation switches unless requested.
- Current intended commands: `меню`, `архив проектов`, `главная`, `cv`, `мост`, `игра с ненулевой суммой`, `очистить`. Hidden test command: `демо`.
- Commands may contain spaces. Keep recognition of multiword commands correct and predictable.
- Click/tap on neutral page space should focus the input, but don't steal clicks from links, text selection, video controls or artwork interactions. Support smartphone keyboards and appropriate focus/scroll behavior.
- Initial placeholder/hint: `введите команду меню чтобы начать`. Cursor should pulse smoothly rather than blink abruptly. Prefer accessible motion fallback.
- Avoid artificial mock CV/project facts. Ask for real content or leave clearly marked placeholders.
- Preserve hash-based navigation (if that's what current code uses) so GitHub Pages reloads don't depend on server rewrites.
- Do not hardcode GitHub Pages paths when Vite can handle base URL; check `vite.config.js` and `public` asset paths before modifying.

## Git/release workflow
- Repo: `https://github.com/txthnxthng/ivan-belousov`.
- Public site: `https://txthnxthng.github.io/ivan-belousov/`.
- `dev` = ongoing development; `main` = production. A GitHub Actions workflow publishes from `main` to GitHub Pages. Do NOT push/merge to `main` or alter deployment settings without explicit user approval.
- Work inside the user's local VS Code workspace and current branch. Check `git status` before edits. Do not overwrite uncommitted changes. Prefer small, reviewable changes; summarize files edited and commands/tests run.
- Useful local commands: `npm install`, `npm run dev`, `npm run build`. Run `npm run build` after code changes where possible.

## Future extension principles
- Commands should be registrable as modules without changing the terminal's main event loop.
- Output renderer should handle Markdown text, images, videos and future custom directives/artwork mounts without compromising input accessibility or safety.
- Artworks are isolated/lazily loaded where practical, may use Canvas/WebGL/Three.js/GLSL/GSAP in the future, and should clean up on exit.
- Local/browser LLM via WebLLM or Transformers.js is a possible future plug-in, NOT an active dependency or implementation requirement.

## Current working priorities
1. Verify v0.2 behavior on desktop/mobile: click-to-focus, initial hint, smooth block cursor, Russian commands including multiword names, Markdown CV page.
2. Replace placeholder texts with approved artist statement, real CV, project descriptions and media.
3. Refine typography, rhythm of terminal output, scroll, and media presentation before visual feature expansion.
