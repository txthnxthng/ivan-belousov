# Ivan Belousov — terminal portfolio / context handoff

**Purpose:** Pass accumulated project decisions from a ChatGPT conversation into Codex running in VS Code. Written 2026-11-22. This is a *project briefing*, not a complete verbatim chat transcript.

## 1. Creative brief
Ivan Belousov is a media artist working across programming, sound design and engineering. He wants a website that is also an interactive artistic environment and archive, not a generic portfolio. Inspirations previously discussed include Ryoji Ikeda's archival browsing aesthetic and 404.zero's immersive interactive web experiences. His desired own language is cybernetic, informational, bionic, sometimes unsettling/generative; **however the current base UI must stay minimal** and not be cluttered with visual effects before its interaction language is right.

Entry view: blank pure-white canvas, monospace black text, a Linux-terminal-like square cursor that **smoothly pulses**, not binary flicker. Hint in ghost gray: `введите команду меню чтобы начать`. Visitors type with a physical or smartphone keyboard. Click/tap open page space to focus input. The terminal is a real unified interaction mechanism: navigate, display archives/projects, run artworks, and later potentially handle AI commands. No conventional header/menu/cards needed at this stage.

A project page should appear as a **terminal stream**: sequentially typed text combined with photographs and playable videos inline, scrollable as a continuous log. Distinguish *content* (Markdown and media), *command logic*, *renderer*, and *artwork runtime*. Artworks may replace or take over the visual environment while remaining accessible via the global interaction system; future effects may include shader-driven WebGL/generative objects.

## 2. Stack and deployment decisions
- Editor: VS Code on local Windows machine (Git Bash terminal); optionally Codex extension for agentic file editing, rather than downloading zip files each iteration.
- Stack: Vite, Node.js/npm, vanilla ES modules, CSS. No React/Next.js needed now. Package in last v0.2 snapshot: `vite`, `marked`, `yaml`, `dompurify`. Installed libraries can be bundled for static hosting.
- Content: local `.md` files with YAML frontmatter, checked into Git. Files can contain text, image references, video/custom media directives (verify actual renderer support before relying on any particular directive). No database, CMS or backend currently wanted.
- GitHub account: `txthnxthng` (from screenshots). Repo: `ivan-belousov` at `https://github.com/txthnxthng/ivan-belousov`.
- Published Pages URL: `https://txthnxthng.github.io/ivan-belousov/` (user confirmed opens on desktop and phone).
- Release model: `dev` branch for experiments; `main` for published stable version. Changes can go via PR `dev` -> `main`. Deployment is GitHub Actions with Pages Source = **GitHub Actions**. Initially Source was incorrectly 'Deploy from a branch / main / root' and the site was blank; switching to GitHub Actions fixed it. No need to maintain `gh-pages` branch.
- Vite `base`: a **previous chat suggested** `/ivan-belousov/` as valid project path. Last v0.2 packaged code has `base: './'`; the actual live local file may differ. Inspect current code and verify deployment before changing.
- Browser reload/deep links: last code notes hash navigation instead of server rewrites.

## 3. Files and modules observed in starter/v0.2
```
.github/workflows/deploy.yml
public/media/
src/artworks/demo.js
src/commands/index.js
src/content/en/projects/{the-bridge,non-zero-sum-game}.md
src/content/en/statement.md
src/content/ru/projects/{the-bridge,non-zero-sum-game}.md
src/content/ru/statement.md
src/content/ru/cv.md                  # added in v0.2
src/core/content.js
src/core/output.js
src/core/registry.js
src/styles/main.css
src/main.js
index.html
package.json
package-lock.json
vite.config.js
README.md
```

**Observed code structure from v0.2 snapshot:**
- `src/core/content.js` uses `import.meta.glob('../content/**/*.md', { eager: true, query: '?raw', import: 'default' })`; parses YAML frontmatter via `yaml`; exports `getContent(language)` returning documents/projects/statement/cv/project(id).
- `src/commands/index.js` exports `registerCommands(registry, site)`. It imports `getContent` and demo artwork; registers Russian commands. `главная` renders `statement.md`; `cv` renders `cv.md`; project commands resolve by `metadata.id`; `архив проектов` lists the metadata titles/years; `очистить` clears output; `демо` runs the Canvas test.
- `src/core/registry.js` was updated in v0.2 to support **multiword commands**; do not revert to naive parsing by first whitespace token.
- `src/core/output.js` drives typed text and Markdown/media output; inspect before editing.
- `src/main.js` implements terminal input/navigation/focus; CSS houses cursor and interface styling.

## 4. Current planned commands
| Command (exact) | Meaning |
| --- | --- |
| `меню` | List available commands |
| `архив проектов` | List known projects |
| `главная` | Render artist statement |
| `cv` | Render CV content |
| `мост` | Open The Bridge project |
| `игра с ненулевой суммой` | Open Non-Zero-Sum Game project |
| `очистить` | Clear terminal |
| `демо` | Hidden technical command for Canvas demo |

Other commands (`help`, `projects`, `open`, `lang`, `run`) were present or discussed in the **earlier prototype**, but the user subsequently explicitly requested the Russian command set above. Do not revive English interface commands without a request.

## 5. Content and project context
- **The Bridge / МОСТ**: interactive installation revealing relationships between weather/river conditions and Saint Petersburg tourist boat departures, mediated by modified instrument-panel controls and data visualizations. User has real project texts and photo/video documentation but starter `.md` content is placeholder/example; do not mistake it for final approved copy.
- **Non-Zero-Sum Game / Игра с ненулевой суммой**: user thesis combining Unity, ML-Agents, Conway's Game of Life, and physical/controller interaction. Need approved text/images for the public project page.
- **Artist statement**: exists as Markdown draft; user cares about personal authorship, accurate phrasing and artistic identity. Do not invent or drastically rewrite it without request.
- **CV**: `src/content/ru/cv.md` in v0.2 is a provisional scaffold, not a confirmed full professional CV. Do not fabricate exhibitions, dates, degrees beyond user-provided source material.
- Additional possible future projects: Raver's Heart, Domovoi, Dissociation, Heat Archive / 'Warm Me', etc. Don't add without request.

## 6. Decisions about interaction and output
- Input usable with physical keyboard *and* phone keyboard.
- Clicking empty space should focus text input; don't hijack links/video or artwork.
- Auto-complete and keyboard history were features discussed/built in prototype; preserve if working.
- Initial white empty page, with subtle hint and prompt; do not add extraneous GUI decorations.
- Cursor square/block 'Linux aesthetic', smooth opacity fade/pulse.
- Progressive/typed text should be configurable; photos/video appear as media in log, not independent pages.
- One input system should be reusable for future custom commands and web-artworks.
- Keep Russian default; English content exists for future localization.

## 7. What has happened and what's next
1. Starter project generated, local Vite development successful enough for user to deploy. Initial Git created on Windows. LF/CRLF Git warnings are expected, not fatal.
2. Repository created as `ivan-belousov`, code pushed; dev/main branch workflow proposed.
3. GitHub Pages initially blank due to publishing source files from `main` root. Switching Source to GitHub Actions fixed it; user verified website on desktop and smartphone.
4. v0.2 update generated with click-to-focus, gray hint, Russian commands, multiword parsing, smooth cursor, CV Markdown scaffold. The user has **not explicitly confirmed installation of v0.2** in the local folder, so inspect current working tree before assuming it's live.
5. User now wants to use Codex inside VS Code instead of downloading zip files, and carry this conversation's context to it. This handoff is for that purpose.

Next recommended step: Inspect repository, `git status`, determine current branch/version; check v0.2 input and commands in browser; fix any remaining UX bugs; then refine terminal feel and fill approved Markdown content. Maintain small commits in `dev`; publish to `main` only on request.

## 8. Optional future directions (not immediate tasks)
- Plugin-like artwork modules for Three.js, GLSL/WebGL, Canvas, GSAP, etc., loaded on demand; artworks should be stoppable and clean up events/resources.
- Browser-side small LLM via WebLLM or Transformers.js, potentially allowing natural-language navigation and command invocation; large model downloads/performance on mobile require thought. No backend or API required initially.
- Domain and hosting can change without redesign because this is a statically built Vite site; avoid vendor-specific dependencies.

## 9. Agent behavior
- Work with actual code in the VS Code workspace; this document is memory/handoff, not permission to make speculative edits.
- Summarize intended changes before large refactors; don't overwrite user-written content.
- Validate with `npm run build` and browser tests when available.
- Treat portfolio prose as authored material rather than filler.
- Preserve current GitHub Actions deployment and stable production branch.
