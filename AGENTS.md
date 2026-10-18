# AGENTS.md — dsh-redqueen-splash

A DeepSeek Harness (dsh) **bundle** that plays a Resident Evil Red Queen style boot splash in the desktop app and in `dsh web`, re-themes the interface through design tokens, and replaces the brand marks. Read this before installing, configuring, removing, or changing it. Reply to the user in their language (the owner writes Chinese).

## Facts

| Item | Value |
| --- | --- |
| Package / bundle name | `dsh-redqueen-splash` |
| Plugin entry id | `redqueen-splash` |
| Version | see `package.json` |
| Install source (local) | absolute path of this repository root — the directory containing this file. Get it with `pwd`; it may contain spaces. Prefer this when you are working inside a clone. |
| Install source (remote) | `github:Neriah-Ado/dsh-resident-theme` |
| DSH peer dependencies | `@deepseek-ai/schemastery` (optional) → never request or grant a version exemption for anything else |
| Install scripts | none → never pass `approvedBuilds` |
| Takes effect | on the next app launch; the splash plays once per launch |

## Install with the `plugin_manager` tool (inside dsh)

1. Call `plugin_manager` with `{ "action": "list_bundles" }`. Look for `dsh-redqueen-splash`.
   - Present and enabled → already installed. Tell the user and stop.
   - Present but disabled → call `{ "action": "set_bundle", "target": "dsh-redqueen-splash", "enabled": true }`, then go to step 3.
2. Call `{ "action": "install_bundle", "target": "<source>" }`, where `<source>` is the absolute repository path when you are inside a clone. Pass paths exactly, spaces included, without quotes. The bundle is enabled by default.
3. Tell the user to fully quit DeepSeek Harness (⌘Q on macOS, close on Windows) and reopen it to see the splash.

Each call asks the user for approval; that is expected. If `plugin_manager` is not available in this session, do not edit profile files by hand. Tell the user to either switch the session to the **Creator** preset or install from the sidebar: **插件 → 添加插件**, paste the repository path, then **立即启用** and restart.

## Install from a shell (other coding agents)

Run this only if the user asks for a terminal install. The desktop app must be fully quit first, because it holds the profile.

```bash
dsh plugin --profile desktop add "<absolute repository path>"
```

- Web app (`dsh web`): stop it, then run `dsh plugin --profile web add "<source>"` and start `dsh web` again. dsh calls the `pnpm` on PATH; if it is missing, tell the user rather than installing it.
- The error `Open DeepSeek Harness Desktop once to initialize its profile, then fully quit it` means the app has never run, or it is still running.
- A successful install adds `dsh-redqueen-splash` to `dsh.profile.bundles` in `~/.dsh/profiles/desktop/package.json` (or `web`). That file is the read-only way to verify the install.

## Configure

Prefer the UI: the config page (sidebar **插件** → this plugin → **配置**) or the `/redqueen` command; both save through dsh settings. The page saves each change immediately (text fields on blur or Enter), its single **恢复默认** button resets every changed field at once, and **预览开屏** plays the current settings. Otherwise, append an override to `~/.dsh/profiles/desktop/cordis.patch.yml` (web: `profiles/web/`) and keep the existing content. The override replaces the whole `config` block; omitted keys fall back to their defaults. Restart the app afterwards.

```yaml
- id: redqueen-splash
  config:
    exit: iris
    duration: 5000
```

| Key | Default | Allowed |
| --- | --- | --- |
| `enabled` | `true` | boolean — splash on launch (theme/brand unaffected) |
| `uiTheme` | `true` | boolean — Red Queen interface theme |
| `brand` | `true` | boolean — replace sidebar and conversation brand marks |
| `logo` | `octagon` | `octagon` \| `eye` \| `seal` |
| `title`, `subtitle`, `code` | `DEEPSEEK HARNESS`, `RED QUEEN MAINFRAME · SECURITY & SURVEILLANCE DIVISION`, `RQ-DSH/0.1` | strings, ≤ 80 chars |
| `whisper` | `YOU ARE ALL GOING TO DIE DOWN HERE.` | string ≤ 80 chars; empty hides the ghost message |
| `accentLight`, `accentDark` | `#c8102e`, `#ff3348` | quoted `#` hex, 3–8 digits |
| `theme` | `auto` | `auto` \| `light` \| `dark` |
| `intro` | `random` | `random` (rotates, never repeats the last one) \| `hive` \| `scan` \| `system` \| `lockdown` |
| `exit` | `wipe` | `random` (never repeats the last one) \| `wipe` \| `blast` \| `purge` \| `signal` \| `iris` |
| `duration` | `4000` | ms, 0–15000; the timeline scales with it |
| `maxWait` | `8000` | ms, ≥ `duration`, ≤ 20000 |
| `skippable` | `true` | boolean |
| `replayOnReload` | `false` | boolean |

## Uninstall

Use `plugin_manager` `{ "action": "remove_bundle", "target": "dsh-redqueen-splash" }`. From a shell, with the app quit, run `dsh plugin --profile desktop remove dsh-redqueen-splash`. Either way, restart the app afterwards. To pause the splash without uninstalling, use `set_bundle` with `"enabled": false`.

## Never

- Modify anything inside the installed DeepSeek Harness app bundle (signed, integrity-checked).
- Hand-edit `~/.dsh/profiles/*/package.json` or `pnpm-workspace.yaml`.
- Grant version exemptions, or pass `approvedBuilds`.

## Development

- `cordis.patch.yml` must not carry a `config` block: defaults live in the `Config` schema in `lib/index.js`. dsh copies the whole merged config into the user layer on the first save, so a bundle-level block would mark every field as overridden.
- `lib/index.js`: host half. It validates config (`resolveConfig`) and injects a style row and a body script through the `webserver/index-inject` event (`buildInjections`), so the splash appears before the shell boots. Inline JSON escapes `<`, U+2028 and U+2029.
- Host config is a schemastery `Config` (all fields `.volatile()`), read on every index render; `@deepseek-ai/schemastery` is an optional peer resolved from the dsh runtime.
- `lib/theme.css`: interface theme, `--dsw-*` token overrides only (never component class names), `html body` selectors to win the cascade against the theme plugin. `lib/brand/`: `mark-octagon.svg`, `mark-eye.svg` (optional `hero-<logo>.svg`), `name.html`; injected as `globalThis.__RQ_BRAND__` and consumed by the client's `sidebar.brand.*` and `conversation.hero.brand.mark` slots. The bundle patch disables `ui-brand-official` to free those slots.
- `lib/client.js`: browser half in the shipped `window.__ModuleLoader__.load` format, no build step. Occupies `sidebar.brand.mark`, `sidebar.brand.name`, `conversation.hero.brand.mark`, the Plugins-page `plugins.row.config` page (scope `redqueen-splash` via `ctx.configForms`), and the `/redqueen` popup command (`ctx.commandUi`). Locale namespace: `redqueenSplash`, registered as `{ zh, en }` with strict key parity.
- `lib/splash.css` and `lib/splash.js`: the splash itself; `globalThis.__redqueenSplash.replay({ exit })` replays it on demand. All CSS stays scoped under `#redqueen-splash` with an `rq-` prefix.
  - Beats: `--B`, `--G`, `--R` in CSS must match `BEAT` in JS (`scripts/test-host.mjs` asserts this).
  - Exits are registered in `EXITS`; boot intros in `INTROS` (rotation state in `localStorage['redqueen-splash:last-intro']`, exits in `...last-exit`); `fade` is the fallback. The reduced-motion setting always uses a plain fade and pins the intro to `hive`.
  - The Umbrella-style seal is a programmatic vector rendering (`sealSvg()` in splash.js, `lib/brand/mark-seal.svg` for the sidebar); never ship official logo image assets.
  - Exit handoff: `.is-leaving` makes the root transparent and powers the board down, so every exit ends by revealing the live app; keep new exits consistent with that contract (end transparent, no pop).
  - Act isolation: `is-seal-done` (760ms) display-nones the seal and `is-actb` (act B entry) visibility-hides act A; both persist through `is-leaving`, so finished acts never repaint and never co-exist on screen. Any new act must gate its base visibility the same way.
  - Idle loops use multiples of `--beat: 1.2s`.
- Checks: `npm test` (no network, no child processes — safe in restricted environments). Preview with `npm run preview`, then open `http://localhost:4173/preview/`; the page has selectors for exit, theme and duration, and `R` replays.
- Version control: work on a branch, merge with `--no-ff`, tag releases (`vX.Y.Z`), keep `package.json` `version` in sync.
- Changelog: `CHANGELOG.md` follows Keep a Changelog; add entries under `[未发布]`.
