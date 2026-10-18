/**
 * dsh-redqueen-splash — browser half.
 *
 * Replaces the sidebar and conversation brand marks, provides the plugin
 * settings page, and registers the /redqueen popup command. The splash
 * itself is injected by the host half (lib/splash.js), so this module never
 * touches it except through globalThis.__redqueenSplash.replay().
 *
 * Bundle format: a parser-loaded registration for the shell's module table
 * (window.__ModuleLoader__.load), no build step.
 */

window.__ModuleLoader__.load({
  id: "dsh-redqueen-splash",
  factory: (require) => {
    const module = { exports: {} };
    const React = require("react");
    const { jsx, jsxs } = require("react/jsx-runtime");
    const P = require("@deepseek-ai/dsh-client-ui-primitives");

    const NS = "redqueenSplash";
    const CONFIG = globalThis.__RQ_SPLASH__ || {};
    const BRAND = globalThis.__RQ_BRAND__ || {};

    const exits = ["random", "wipe", "blast", "purge", "signal", "iris"];
    const intros = ["random", "hive", "scan", "system", "lockdown"];
    const themes = ["auto", "light", "dark"];
    const logos = ["octagon", "eye", "seal"];
    const switches = ["enabled", "skippable", "replayOnReload", "uiTheme", "brand"];
    const texts = ["title", "subtitle", "code", "whisper", "accentLight", "accentDark"];

    const zh = {
      summary: "设置红后开屏、界面主题和品牌。",
      command: "红后", commandDescription: "预览开屏或更改红后主题设置。",
      splash: "开屏", text: "文字", color: "颜色", interface: "界面", actions: "操作",
      exit: "退场", theme: "主题", logo: "Logo 方案",
      enabled: "开屏动画", skippable: "允许跳过", replayOnReload: "刷新时重播",
      uiTheme: "界面主题", brand: "品牌替换",
      octagon: "隔离八角", eye: "后之眼", seal: "保护伞印记",
      logoOctagon: "Logo：隔离八角", logoEye: "Logo：后之眼", logoSeal: "Logo：保护伞印记",
      duration: "显示时长（ms）", title: "主标题", subtitle: "副标题", code: "角落编号",
      whisper: "幽灵提示语", accentLight: "浅色强调色", accentDark: "深色强调色",
      random: "随机", wipe: "垂帘", blast: "防爆门", purge: "数据清洗", signal: "信号丢失", iris: "红后之眼",
      intro: "启动动画", hive: "蜂巢握手", scan: "身份扫描", system: "终端引导", lockdown: "封锁警报",
      auto: "跟随", light: "浅色", dark: "深色", on: "开启", off: "关闭",
      uiThemeOn: "界面主题 开", uiThemeOff: "界面主题 关",
      brandOn: "品牌替换 开", brandOff: "品牌替换 关",
      preview: "预览开屏", previewNow: "立即预览",
      resetAll: "恢复默认", restart: "重启 Harness 后生效；预览立即播放。",
      readOnly: "此配置当前为只读。", unavailable: "配置服务暂不可用。",
      saveFailed: "保存失败，请重试。", invalidNumber: "请输入 0–15000 的毫秒数。",
      search: "搜索…", empty: "暂无内容", noResults: "没有匹配项",
      whisperHint: "退场前一闪而过的红色文字；留空则不显示。颜色值请加 #。",
    };
    const en = {
      summary: "Configure the Red Queen splash, interface theme and brand.",
      command: "Red Queen", commandDescription: "Preview the splash or change Red Queen settings.",
      splash: "Splash", text: "Text", color: "Color", interface: "Interface", actions: "Actions",
      exit: "Exit", theme: "Theme", logo: "Logo scheme",
      enabled: "Splash animation", skippable: "Skippable", replayOnReload: "Replay on reload",
      uiTheme: "Interface theme", brand: "Brand replacement",
      octagon: "Containment octagon", eye: "Queen's eye", seal: "Umbrella seal",
      logoOctagon: "Logo: containment octagon", logoEye: "Logo: Queen's eye", logoSeal: "Logo: Umbrella seal",
      duration: "Duration (ms)", title: "Main heading", subtitle: "Sub heading", code: "Corner identifier",
      whisper: "Ghost message", accentLight: "Accent (light)", accentDark: "Accent (dark)",
      random: "Random", wipe: "Curtain", blast: "Blast doors", purge: "Data purge", signal: "Signal loss", iris: "Queen's eye",
      intro: "Boot intro", hive: "Hive handshake", scan: "Identity scan", system: "Terminal boot", lockdown: "Lockdown alert",
      auto: "Auto", light: "Light", dark: "Dark", on: "On", off: "Off",
      uiThemeOn: "Interface theme on", uiThemeOff: "Interface theme off",
      brandOn: "Brand replacement on", brandOff: "Brand replacement off",
      preview: "Preview splash", previewNow: "Preview now",
      resetAll: "Reset to defaults", restart: "Takes effect after restarting Harness; previews play at once.",
      readOnly: "This configuration is currently read-only.", unavailable: "The configuration service is unavailable.",
      saveFailed: "Saving failed, please retry.", invalidNumber: "Enter a value between 0 and 15000 ms.",
      search: "Search…", empty: "Nothing here", noResults: "No matches",
      whisperHint: "A red line that flashes before the exit; leave empty to hide. Quote hex colors with #.",
    };

    const CSS = [
      ".rq-brand{display:inline-flex}",
      ".rq-brand-mark>svg,.rq-brand-hero>svg{width:100%;height:100%}",
      ".rq-cfg{display:flex;flex-direction:column;gap:20px;max-width:720px;color:var(--dsw-alias-label-primary)}",
      ".rq-cfg-note{margin:0;font-size:13px;color:var(--dsw-alias-label-tertiary)}",
      ".rq-cfg-section{display:flex;flex-direction:column;gap:12px}",
      ".rq-cfg-h{margin:0;font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--dsw-alias-label-tertiary)}",
      ".rq-cfg-row{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:32px}",
      ".rq-cfg-label{font-size:13px;color:var(--dsw-alias-label-secondary)}",
      ".rq-cfg-field{display:flex;flex-direction:column;gap:4px}",
      ".rq-cfg-hint{margin:0;font-size:11.5px;color:var(--dsw-alias-label-tertiary)}",
      ".rq-cfg-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}",
      ".rq-cfg-preview,.rq-cfg-reset{display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 16px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md);background:transparent;font:500 13px/1 var(--dsw-font-family);color:var(--dsw-alias-label-primary);white-space:nowrap;cursor:pointer}",
      ".rq-cfg-preview:hover:not(:disabled),.rq-cfg-reset:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
      ".rq-cfg-preview i{width:7px;height:7px;background:var(--dsw-static-deepseek-500);clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)}",
      ".rq-cfg-preview:disabled,.rq-cfg-reset:disabled{opacity:.45;cursor:default}",
    ].join("");

    function specs() {
      const number = P.settingsNumberField("duration");
      return [
        ...switches.map((field) => ({ field,
          format: (value) => String(typeof value === "boolean" ? value : CONFIG[field] ?? true),
          parse: (text) => ["true", "false"].includes(text) ? { kind: "set", value: text === "true" } : undefined
        })),
        ...[ ["exit", exits], ["intro", intros], ["theme", themes], ["logo", logos] ].map(([field, choices]) => ({ field,
          format: (value) => value ?? CONFIG[field] ?? choices[0],
          parse: (text) => choices.includes(text) ? { kind: "set", value: text } : undefined
        })),
        { ...number, parse: (text) => {
          const parsed = number.parse(text);
          return parsed?.kind === "set" && (parsed.value < 0 || parsed.value > 15000) ? undefined : parsed;
        } },
        ...texts.map(P.settingsTextField)
      ];
    }

    // ---- brand slots -------------------------------------------------------

    function Mark({ size }) {
      return CONFIG.brand !== false && BRAND.mark ? jsx("span", {
        className: "rq-brand rq-brand-mark", style: { display: "inline-flex", width: size, height: size },
        dangerouslySetInnerHTML: { __html: BRAND.mark }
      }) : jsx(P.FishLogo, { size });
    }

    function Name() {
      return CONFIG.brand !== false && BRAND.name ? jsx("span", {
        className: "rq-brand rq-brand-name",
        dangerouslySetInnerHTML: { __html: BRAND.name }
      }) : jsx(P.BrandWordmark, { includeMark: false });
    }

    function Hero({ size, className }) {
      return jsx("span", { className: `${className || ""} rq-brand rq-brand-hero`,
        style: { display: "inline-flex", width: size, height: size }, dangerouslySetInnerHTML: { __html: BRAND.hero }
      });
    }

    // ---- settings page ------------------------------------------------------

    function Card(props) {
      const { t } = props;
      const state = props.useRedqueenSplash((snapshot) => snapshot);
      React.useEffect(() => {
        if (props.view !== "summary") return () => props.scheduleSave(0);
      }, []);
      if (props.view === "summary") return t("summary");
      if (!state.available) return jsx("p", { className: "rq-cfg-note", role: "status", children: t("unavailable") });
      const disabled = !state.writable;
      const overriddenKeys = Object.keys(state.fields).filter((key) => state.fields[key].overridden);
      const field = (key) => {
        const value = state.fields[key];
        const id = `redqueen-splash-${key}`;
        const onEdit = (text) => props.edit(key, text);
        if (switches.includes(key) || ["exit", "intro", "theme", "logo"].includes(key)) {
          return jsxs("div", { className: "rq-cfg-row", children: [
            jsx("span", { className: "rq-cfg-label", children: t(key) }),
            switches.includes(key) ? jsx(P.Switch, { checked: value.text === "true", label: t(key), disabled,
              onChange: (checked) => { onEdit(String(checked)); props.scheduleSave(0); }
            }) : jsx(P.SegmentedControl, { id, value: value.text, label: t(key), disabled,
              options: (key === "exit" ? exits : key === "intro" ? intros : key === "logo" ? logos : themes).map((choice) => ({ value: choice, label: t(choice) })),
              onChange: (text) => { onEdit(text); props.scheduleSave(0); }
            })
          ] }, key);
        }
        return jsx("div", { className: "rq-cfg-field", onBlur: () => props.scheduleSave(0),
          onKeyDown: (event) => { if (event.key === "Enter") props.scheduleSave(0); },
          children: jsx(P.SettingsValueField, { id, label: t(key), disabled, ...value, overridden: false,
            numeric: key === "duration",
            invalidLabel: t("invalidNumber"), onEdit
          })
        }, key);
      };
      const group = (title, keys, hint) => jsxs("section", { className: "rq-cfg-section", children: [
        jsx("h3", { className: "rq-cfg-h", children: t(title) }),
        ...keys.map(field),
        ...(hint ? [jsx("p", { className: "rq-cfg-hint", children: t(hint) })] : [])
      ] }, title);
      return jsxs("div", { className: "rq-cfg", children: [
        !state.writable && jsx("p", { className: "rq-cfg-note", children: t("readOnly") }),
        group("splash", ["enabled", "intro", "exit", "theme", "duration", "skippable", "replayOnReload"]),
        group("text", ["title", "subtitle", "code", "whisper"], "whisperHint"),
        group("color", ["accentLight", "accentDark"]),
        group("interface", ["uiTheme", "brand", "logo"]),
        jsxs("div", { className: "rq-cfg-actions", children: [
          jsxs("button", { type: "button", className: "rq-cfg-preview", onClick: () => props.preview(), children: [jsx("i", {}), t("preview")] }),
          jsx("button", { type: "button", className: "rq-cfg-reset", disabled: !state.writable || !overriddenKeys.length,
            onClick: () => { overriddenKeys.forEach((key) => props.resetField(key)); props.scheduleSave(0); }, children: t("resetAll") }),
          jsx("p", { className: "rq-cfg-hint", children: t("restart") })
        ] }),
        state.failed && jsx("p", { className: "rq-cfg-note", role: "alert", children: t("saveFailed") })
      ] });
    }

    // ---- module body --------------------------------------------------------

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }));
      const t = ctx.locale.bind(NS);

      ctx.effect(() => {
        const style = document.createElement("style");
        style.textContent = CSS;
        document.head.append(style);
        return () => style.remove();
      });

      ctx.slots.inject("sidebar.brand.mark", () => ctx.slots.inject("sidebar.brand.name", function* () {
        yield ctx.slots.register({ name: "sidebar.brand.mark" }, Mark);
        yield ctx.slots.register({ name: "sidebar.brand.name" }, Name);
      }));
      if (CONFIG.brand !== false && BRAND.hero) ctx.slots.inject("conversation.hero.brand.mark", function* () {
        yield ctx.slots.register({ name: "conversation.hero.brand.mark" }, Hero);
      });

      const scope = ctx.configForms.get("redqueen-splash");
      const form = new P.SettingsFormModel(scope, specs());
      let saveTimer = 0;
      const autoSave = () => {
        clearTimeout(saveTimer);
        const shell = form.shell();
        if (shell.available && shell.writable && shell.dirty && !shell.invalid && !shell.saving && !shell.failed) form.save();
      };
      const scheduleSave = (delay = 0) => { clearTimeout(saveTimer); saveTimer = setTimeout(autoSave, delay); };
      // Preview what the page shows, including text typed but not yet saved.
      const previewSplash = () => {
        const value = { ...CONFIG, ...(scope.getSnapshot().value || {}) };
        for (const spec of specs()) {
          const write = spec.parse(form.field(spec.field).text);
          if (write?.kind === "set") value[spec.field] = write.value;
        }
        globalThis.__redqueenSplash?.replay({ ...value, enabled: true });
      };
      const fields = specs().map((spec) => spec.field);
      const store = form.bind(() => ({ ...form.shell(), fields: Object.fromEntries(fields.map((key) => [key, form.field(key)])) }));
      // Only catch up after a save settles (an edit made while it was in
      // flight); typing in a text field must not save per keystroke.
      let wasSaving = false;
      ctx.effect(() => store.subscribe(() => {
        const shell = form.shell();
        if (wasSaving && !shell.saving && shell.dirty && !shell.failed) scheduleSave(0);
        wasSaving = shell.saving;
      }));
      ctx.effect(() => () => clearTimeout(saveTimer));
      ctx.effect(() => () => form.dispose());
      ctx.effect(() => ctx.configForms.whileServed(["redqueen-splash"], () => ctx.slots.inject("plugins.row.config", () => ctx.slots.register({
        name: "plugins.row.config", key: "dsh-redqueen-splash#redqueen-splash", locale: NS,
        inject: () => ({ hooks: { redqueenSplash: store }, ...form.actions(), scheduleSave, preview: () => previewSplash() })
      }, Card))));

      const current = (field) => scope.getSnapshot().value?.[field] ?? CONFIG[field];
      const option = (id, label, group, field, value) => ({ id, label: t(label),
        group: { name: group, label: t(group) },
        ...(field ? { active: current(field) === value } : {}), detail: t("restart")
      });
      ctx.effect(() => ctx.commandUi.register({
        name: "redqueen", label: () => t("command"), description: () => t("commandDescription"), icon: P.IconPlayOutlineRegular,
        ui: { kind: "popupSelect", searchMode: "fuzzy-label",
          searchLabels: () => ({ placeholder: t("search"), empty: t("empty"), noResults: t("noResults") }),
          options: async () => {
            const rows = [option("preview", "previewNow", "actions")];
            if (scope.getSnapshot().status !== "ready" || !scope.getSnapshot().writable) return rows;
            rows.push(option("enabled:true", "on", "splash", "enabled", true), option("enabled:false", "off", "splash", "enabled", false));
            for (const intro of intros) rows.push(option(`intro:${intro}`, intro, "splash", "intro", intro));
            for (const exit of exits) rows.push(option(`exit:${exit}`, exit, "splash", "exit", exit));
            for (const field of ["uiTheme", "brand"]) for (const value of [true, false]) rows.push(option(`${field}:${value}`, `${field}${value ? "On" : "Off"}`, "interface", field, value));
            for (const logo of logos) rows.push(option(`logo:${logo}`, `logo${logo[0].toUpperCase()}${logo.slice(1)}`, "interface", "logo", logo));
            return rows;
          },
          onSelect: async (selected) => {
            if (selected.id === "preview") { previewSplash(); return; }
            const [field, raw] = selected.id.split(":");
            if (!(field === "exit" ? exits.includes(raw) : field === "intro" ? intros.includes(raw) : field === "logo" ? logos.includes(raw) : ["enabled", "uiTheme", "brand"].includes(field) && ["true", "false"].includes(raw))) return;
            // A separate draft prevents a slash command from saving page edits.
            const commandForm = new P.SettingsFormModel(scope, specs());
            try {
              commandForm.actions().edit(field, raw);
              await commandForm.save();
              if (commandForm.shell().failed || commandForm.shell().dirty) throw new Error(t("saveFailed"));
            } finally { commandForm.dispose(); }
          }
        }
      }));
    }

    module.exports = { inject: ["slots", "locale", "configForms", "commandUi"], apply };
    return module.exports;
  }
});
