import { readFileSync } from 'node:fs';

let z;
try { z = (await import('@deepseek-ai/schemastery')).default } catch { z = undefined }

/** Cordis host plugin name. */
export const name = 'redqueen-splash';

/**
 * @typedef {object} SplashConfig
 * @property {boolean} enabled Whether to play on launch.
 * @property {boolean} uiTheme Whether to inject the Red Queen interface theme.
 * @property {boolean} brand Whether to replace brand artwork.
 * @property {'octagon' | 'eye'} logo Brand logo scheme.
 * @property {string} title Main heading.
 * @property {string} subtitle Secondary heading.
 * @property {string} code Corner HUD identifier.
 * @property {string} whisper Ghost message flashed before the exit.
 * @property {string} accentLight Accent color for light mode.
 * @property {string} accentDark Accent color for dark mode.
 * @property {'auto' | 'light' | 'dark'} theme Theme selection.
 * @property {'random' | 'hive' | 'scan' | 'system' | 'lockdown'} intro Boot intro variant.
 * @property {'random' | 'blast' | 'purge' | 'signal' | 'iris'} exit Exit animation.
 * @property {number} duration Minimum on-screen time in milliseconds.
 * @property {number} maxWait Maximum wait in milliseconds.
 * @property {boolean} skippable Whether clicking can skip the animation.
 * @property {boolean} replayOnReload Whether reloading replays the animation.
 */

/** @type {Readonly<SplashConfig>} Default configuration shared with the bundle patch. */
export const DEFAULTS = Object.freeze({
  enabled: true,
  uiTheme: true,
  brand: true,
  logo: 'octagon',
  title: 'DEEPSEEK HARNESS',
  subtitle: 'RED QUEEN MAINFRAME · SECURITY & SURVEILLANCE DIVISION',
  code: 'RQ-DSH/0.1',
  whisper: 'YOU ARE ALL GOING TO DIE DOWN HERE.',
  accentLight: '#c8102e',
  accentDark: '#ff3348',
  theme: 'auto',
  intro: 'random',
  exit: 'wipe',
  duration: 4000,
  maxWait: 8000,
  skippable: true,
  replayOnReload: false,
});

export const Config = z ? z.object({
  enabled: z.boolean().default(DEFAULTS.enabled).volatile().description('开屏动画开关'),
  exit: z.union(['random', 'wipe', 'blast', 'purge', 'signal', 'iris']).default(DEFAULTS.exit).volatile().description('退场动画'),
  intro: z.union(['random', 'hive', 'scan', 'system', 'lockdown']).default(DEFAULTS.intro).volatile().description('启动动画'),
  theme: z.union(['auto', 'light', 'dark']).default(DEFAULTS.theme).volatile().description('开屏主题'),
  duration: z.number().min(0).max(15000).step(100).default(DEFAULTS.duration).volatile().description('显示时长（毫秒）'),
  maxWait: z.number().min(0).max(20000).step(100).default(DEFAULTS.maxWait).volatile().description('最长等待（毫秒）'),
  title: z.string().default(DEFAULTS.title).volatile().description('主标题'),
  subtitle: z.string().default(DEFAULTS.subtitle).volatile().description('副标题'),
  code: z.string().default(DEFAULTS.code).volatile().description('角落编号'),
  whisper: z.string().default(DEFAULTS.whisper).volatile().description('幽灵提示语（留空则不显示）'),
  accentLight: z.string().default(DEFAULTS.accentLight).volatile().description('浅色强调色'),
  accentDark: z.string().default(DEFAULTS.accentDark).volatile().description('深色强调色'),
  skippable: z.boolean().default(DEFAULTS.skippable).volatile().description('允许跳过'),
  replayOnReload: z.boolean().default(DEFAULTS.replayOnReload).volatile().description('刷新时重播'),
  uiTheme: z.boolean().default(DEFAULTS.uiTheme).volatile().description('红后界面主题'),
  brand: z.boolean().default(DEFAULTS.brand).volatile().description('品牌替换'),
  logo: z.union(['octagon', 'eye', 'seal']).default(DEFAULTS.logo).volatile().description('Logo 方案'),
}) : undefined;

/** Unwrap volatile settings at the point of use. */
export function readConfig(config) {
  const values = {};
  for (const key of Object.keys(DEFAULTS)) {
    const v = config?.[key];
    values[key] = v && typeof v.get === 'function' ? v.get() : v;
  }
  return resolveConfig(values);
}

/**
 * Normalize user configuration without retaining unknown keys or mutating input.
 * Invalid types and enum/color values use defaults; finite timings are clamped.
 *
 * @param {unknown} [input] User-supplied Cordis configuration.
 * @returns {SplashConfig} A fresh, plain configuration object.
 */
export function resolveConfig(input) {
  const source = input !== null && typeof input === 'object' && !Array.isArray(input)
    ? input
    : {};
  const resolved = { ...DEFAULTS };

  if (typeof source.logo === 'string') {
    const logo = source.logo.trim();
    if (['octagon', 'eye', 'seal'].includes(logo)) resolved.logo = logo;
  }

  if (typeof source.intro === 'string') {
    const intro = source.intro.trim();
    if (['random', 'hive', 'scan', 'system', 'lockdown'].includes(intro)) resolved.intro = intro;
  }

  for (const key of ['title', 'subtitle', 'code', 'whisper']) {
    if (typeof source[key] === 'string') {
      resolved[key] = source[key].trim().slice(0, 80);
    }
  }

  for (const key of ['accentLight', 'accentDark']) {
    if (typeof source[key] === 'string') {
      const color = source[key].trim();
      if (/^#[0-9a-fA-F]{3,8}$/.test(color)) resolved[key] = color;
    }
  }

  if (typeof source.theme === 'string') {
    const theme = source.theme.trim();
    if (['auto', 'light', 'dark'].includes(theme)) resolved.theme = theme;
  }

  if (typeof source.exit === 'string') {
    const exit = source.exit.trim();
    if (['random', 'wipe', 'blast', 'purge', 'signal', 'iris'].includes(exit)) resolved.exit = exit;
  }

  const duration = typeof source.duration === 'number' && Number.isFinite(source.duration)
    ? source.duration
    : DEFAULTS.duration;
  resolved.duration = Math.min(15000, Math.max(0, duration));

  const maxWait = typeof source.maxWait === 'number' && Number.isFinite(source.maxWait)
    ? source.maxWait
    : DEFAULTS.maxWait;
  resolved.maxWait = Math.min(20000, Math.max(resolved.duration, maxWait));

  for (const key of ['enabled', 'uiTheme', 'brand', 'skippable', 'replayOnReload']) {
    if (typeof source[key] === 'boolean') resolved[key] = source[key];
  }

  return resolved;
}

/**
 * Build host injection rows for both the web and desktop profiles.
 * Escape inline HTML terminators and JavaScript line separators in configuration.
 *
 * @param {SplashConfig} config Resolved configuration.
 * @param {{ css: string, js: string, themeCss?: string, brand?: {mark: string, hero: string, name: string} }} assets Loaded sources.
 * @returns {Array<{kind: 'style', text: string} | {kind: 'script', placement: 'body', text: string}>}
 */
export function buildInjections(config, assets) {
  const safeJson = (value) => JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  const safeStyle = (css) => css.replace(/<\/style/gi, '<\\/style');

  return [
    ...(config.uiTheme && assets.themeCss ? [{ kind: 'style', text: safeStyle(assets.themeCss) }] : []),
    { kind: 'style', text: safeStyle(assets.css) },
    {
      kind: 'script',
      placement: 'body',
      text: 'globalThis.__RQ_BRAND__=' + safeJson(assets.brand || { mark: '', hero: '', name: '' })
        + ';globalThis.__RQ_SPLASH__=' + safeJson(config) + ';\n' + assets.js,
    },
  ];
}

/** Report unavailable assets while allowing hosts without a logger to start. */
function warn(ctx, message) {
  try {
    const logger = ctx.logger?.('redqueen-splash');
    if (typeof logger?.warn === 'function') {
      logger.warn(message);
      return;
    }
  } catch {
    // Logging support is optional and must not prevent host startup.
  }
  console.warn(message);
}

/**
 * Register the host half of the splash plugin. Assets are read once at apply
 * time and reused on every index injection; live config is read on each emission.
 *
 * @param {object} ctx Cordis context providing on() and an optional logger().
 * @param {unknown} [config] User-supplied configuration.
 * @returns {void}
 */
export function apply(ctx, config) {
  if (typeof ctx.inject === 'function') ctx.inject(['settings'], (child) => {
    child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
  });

  let assets;
  try {
    assets = {
      css: readFileSync(new URL('./splash.css', import.meta.url), 'utf8'),
      js: readFileSync(new URL('./splash.js', import.meta.url), 'utf8'),
    };
  } catch (error) {
    warn(ctx, `Unable to load Red Queen splash assets; injection disabled. ${error instanceof Error ? error.message : String(error)}`);
    return;
  }

  const missingExtras = [];
  const optionalText = (filename, { quiet = false } = {}) => {
    try { return readFileSync(new URL(filename, import.meta.url), 'utf8'); }
    catch { if (!quiet) missingExtras.push(filename); return ''; }
  };
  assets.themeCss = optionalText('./theme.css');
  const marks = {
    octagon: optionalText('./brand/mark-octagon.svg'),
    eye: optionalText('./brand/mark-eye.svg'),
    seal: optionalText('./brand/mark-seal.svg'),
  };
  const heroes = {
    // Hero artwork is optional per scheme (the mark is reused), so its
    // absence is not worth a startup warning.
    octagon: optionalText('./brand/hero-octagon.svg', { quiet: true }),
    eye: optionalText('./brand/hero-eye.svg', { quiet: true }),
    seal: optionalText('./brand/hero-seal.svg', { quiet: true }),
  };
  assets.brandName = optionalText('./brand/name.html');
  if (missingExtras.length) warn(ctx, `Unable to load optional Red Queen UI assets: ${missingExtras.join(', ')}.`);

  // Append after theme bootstrap rows: do not pass Cordis's prepend option.
  ctx.on('webserver/index-inject', (table) => {
    const resolved = readConfig(config);
    const { logo } = resolved;
    const brand = { mark: marks[logo], hero: heroes[logo] || marks[logo], name: assets.brandName };
    table.push(...buildInjections(resolved, { ...assets, brand }));
  });
}
