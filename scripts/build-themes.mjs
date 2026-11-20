// Generates both color themes from a single palette definition so the
// light and dark variants stay structurally identical.
//   node scripts/build-themes.mjs          -> writes themes/*.json
//   node scripts/build-themes.mjs --check  -> also prints a contrast report
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// ---------------------------------------------------------------------------
// Palettes
// ---------------------------------------------------------------------------
// Aero Glass: Vista's smoked-glass taskbar and Start menu at night.
// Aero Sky:   a bright Frutiger Aero morning - sky, water, grass, sunlight.
const palettes = {
  "Aero Glass": {
    type: "dark",
    file: "aero-glass-color-theme.json",
    ui: {
      bg0: "#07131d", // activity bar, deepest glass
      bg1: "#0b1b28", // side bar, panel
      bg2: "#0e2130", // editor
      bg3: "#13293b", // widgets, inputs
      bg4: "#1a3850", // selection in lists
      title: "#0f2a3e",
      border: "#1d4260",
      sheen: "#2c6386", // glass edge highlight
      fg: "#d6e9f5",
      muted: "#8fb3cb",
      dim: "#5f86a2",
      accent: "#3fb5f0", // sky
      orb: "#1672b6", // start orb blue
      orbHover: "#1d82cc",
      status: "#155f94",
      statusFg: "#f2f9ff",
      shadow: "#00000066",
    },
    syntax: {
      comment: "#5f8bab",
      keyword: "#4fc3f7",
      storage: "#82a8ff",
      string: "#9ee36a",
      escape: "#c8f59a",
      func: "#ffd166",
      type: "#5ee6c8",
      number: "#ffa25c",
      constant: "#ffa25c",
      property: "#a9d8f2",
      param: "#c3b2ff",
      variable: "#d6e9f5",
      operator: "#8fb8d0",
      tag: "#4fc3f7",
      attr: "#5ee6c8",
      regex: "#6eeaff",
      decorator: "#ffd166",
      invalid: "#ff6b7a",
      heading: "#4fc3f7",
      link: "#6eeaff",
    },
    ansi: {
      black: "#0b1b28", red: "#ff6b7a", green: "#8fdc5a", yellow: "#ffd166",
      blue: "#3fb5f0", magenta: "#c3b2ff", cyan: "#5ee6c8", white: "#c6dcea",
      brightBlack: "#5f86a2", brightRed: "#ff8f9a", brightGreen: "#b4f08a",
      brightYellow: "#ffe08f", brightBlue: "#7fd0ff", brightMagenta: "#dacfff",
      brightCyan: "#8ff2de", brightWhite: "#f2f9ff",
    },
    state: { error: "#ff6b7a", warning: "#ffc35c", info: "#4fc3f7", ok: "#8fdc5a" },
  },

  "Aero Sky": {
    type: "light",
    file: "aero-sky-color-theme.json",
    ui: {
      bg0: "#cfe3f2",
      bg1: "#e4f0f9",
      bg2: "#f6fafd",
      bg3: "#ffffff",
      bg4: "#cde6f7",
      title: "#d6e9f6",
      border: "#b3d1e6",
      sheen: "#ffffff",
      fg: "#17293a",
      muted: "#456780",
      dim: "#7895ab",
      accent: "#0a74c9",
      orb: "#0067c0",
      orbHover: "#0a7ad8",
      status: "#1f78c1",
      statusFg: "#ffffff",
      shadow: "#0a3a6033",
    },
    syntax: {
      comment: "#5f7f98",
      keyword: "#0062b8",
      storage: "#4b4fc0",
      string: "#2b7614",
      escape: "#4a7a00",
      func: "#925400",
      type: "#00766a",
      number: "#b33f0d",
      constant: "#b33f0d",
      property: "#155c86",
      param: "#7041b5",
      variable: "#17293a",
      operator: "#3e6079",
      tag: "#0062b8",
      attr: "#00766a",
      regex: "#0a7484",
      decorator: "#925400",
      invalid: "#c4283b",
      heading: "#0062b8",
      link: "#0a7484",
    },
    ansi: {
      black: "#17293a", red: "#c4283b", green: "#2b7614", yellow: "#925400",
      blue: "#0062b8", magenta: "#7041b5", cyan: "#00766a", white: "#a9c4d8",
      brightBlack: "#5f7f98", brightRed: "#e0475a", brightGreen: "#3f9a1f",
      brightYellow: "#b06a00", brightBlue: "#1a86de", brightMagenta: "#8c5fd6",
      brightCyan: "#079585", brightWhite: "#ffffff",
    },
    state: { error: "#c4283b", warning: "#b06a00", info: "#0a74c9", ok: "#2b7614" },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const a = (hex, alpha) => hex + Math.round(alpha * 255).toString(16).padStart(2, "0");

function lum(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const contrast = (x, y) => {
  const [l1, l2] = [lum(x), lum(y)].sort((p, q) => q - p);
  return (l1 + 0.05) / (l2 + 0.05);
};

// ---------------------------------------------------------------------------
// Workbench colors
// ---------------------------------------------------------------------------
function workbench(p) {
  const { ui: u, syntax: s, ansi, state } = p;
  const dark = p.type === "dark";
  const sel = dark ? a(u.accent, 0.28) : a(u.accent, 0.2);
  return {
    focusBorder: a(u.accent, 0.8),
    foreground: u.fg,
    disabledForeground: u.dim,
    descriptionForeground: u.muted,
    errorForeground: state.error,
    "icon.foreground": u.muted,
    "widget.shadow": u.shadow,
    "widget.border": u.border,
    "selection.background": sel,
    "textLink.foreground": u.accent,
    "textLink.activeForeground": dark ? s.link : u.orb,
    "textBlockQuote.background": u.bg1,
    "textBlockQuote.border": u.accent,
    "textCodeBlock.background": u.bg1,
    "textPreformat.foreground": s.func,
    "textSeparator.foreground": u.border,
    "sash.hoverBorder": u.accent,
    "progressBar.background": u.accent,
    "scrollbar.shadow": u.shadow,
    "scrollbarSlider.background": a(u.dim, 0.3),
    "scrollbarSlider.hoverBackground": a(u.dim, 0.5),
    "scrollbarSlider.activeBackground": a(u.accent, 0.6),

    // Title bar - the Vista window frame
    "titleBar.activeBackground": u.title,
    "titleBar.activeForeground": u.fg,
    "titleBar.inactiveBackground": u.bg1,
    "titleBar.inactiveForeground": u.dim,
    "titleBar.border": u.border,
    "menubar.selectionBackground": a(u.accent, 0.2),
    "menu.background": u.bg3,
    "menu.foreground": u.fg,
    "menu.selectionBackground": u.orb,
    "menu.selectionForeground": "#ffffff",
    "menu.separatorBackground": u.border,
    "menu.border": u.border,
    "commandCenter.background": a(u.bg3, 0.7),
    "commandCenter.activeBackground": u.bg3,
    "commandCenter.border": u.border,
    "commandCenter.foreground": u.muted,
    "commandCenter.activeForeground": u.fg,

    // Activity bar - the taskbar
    "activityBar.background": u.bg0,
    "activityBar.foreground": u.accent,
    "activityBar.inactiveForeground": u.dim,
    "activityBar.border": u.border,
    "activityBar.activeBorder": u.accent,
    "activityBar.activeBackground": a(u.accent, 0.12),
    "activityBar.activeFocusBorder": u.accent,
    "activityBarBadge.background": u.orb,
    "activityBarBadge.foreground": "#ffffff",
    "activityBarTop.foreground": u.accent,
    "activityBarTop.inactiveForeground": u.dim,
    "activityBarTop.activeBorder": u.accent,

    // Side bar
    "sideBar.background": u.bg1,
    "sideBar.foreground": u.fg,
    "sideBar.border": u.border,
    "sideBarTitle.foreground": u.muted,
    "sideBarSectionHeader.background": u.bg1,
    "sideBarSectionHeader.foreground": u.fg,
    "sideBarSectionHeader.border": u.border,

    // Lists and trees
    "list.activeSelectionBackground": u.bg4,
    "list.activeSelectionForeground": u.fg,
    "list.activeSelectionIconForeground": u.accent,
    "list.inactiveSelectionBackground": a(u.bg4, 0.7),
    "list.inactiveSelectionForeground": u.fg,
    "list.hoverBackground": a(u.accent, dark ? 0.1 : 0.1),
    "list.hoverForeground": u.fg,
    "list.focusBackground": u.bg4,
    "list.focusOutline": a(u.accent, 0.7),
    "list.highlightForeground": u.accent,
    "list.focusHighlightForeground": u.accent,
    "list.dropBackground": a(u.accent, 0.2),
    "list.errorForeground": state.error,
    "list.warningForeground": state.warning,
    "list.invalidItemForeground": state.error,
    "tree.indentGuidesStroke": a(u.dim, 0.5),
    "tree.inactiveIndentGuidesStroke": a(u.dim, 0.25),

    // Inputs and controls
    "input.background": u.bg3,
    "input.foreground": u.fg,
    "input.border": u.border,
    "input.placeholderForeground": u.dim,
    "inputOption.activeBackground": a(u.accent, 0.25),
    "inputOption.activeBorder": u.accent,
    "inputOption.activeForeground": u.fg,
    "inputValidation.errorBackground": dark ? "#3a1620" : "#fde8eb",
    "inputValidation.errorBorder": state.error,
    "inputValidation.warningBackground": dark ? "#3a2c10" : "#fff4dc",
    "inputValidation.warningBorder": state.warning,
    "inputValidation.infoBackground": dark ? "#0f2e46" : "#e3f2fd",
    "inputValidation.infoBorder": state.info,
    "dropdown.background": u.bg3,
    "dropdown.listBackground": u.bg3,
    "dropdown.border": u.border,
    "dropdown.foreground": u.fg,
    "checkbox.background": u.bg3,
    "checkbox.border": u.border,
    "checkbox.foreground": u.accent,
    "button.background": u.orb,
    "button.foreground": "#ffffff",
    "button.hoverBackground": u.orbHover,
    "button.border": a("#ffffff", 0.18),
    "button.separator": a("#ffffff", 0.35),
    "button.secondaryBackground": u.bg4,
    "button.secondaryForeground": u.fg,
    "button.secondaryHoverBackground": a(u.accent, 0.3),
    "badge.background": u.orb,
    "badge.foreground": "#ffffff",
    "keybindingLabel.background": u.bg3,
    "keybindingLabel.foreground": u.fg,
    "keybindingLabel.border": u.border,
    "keybindingLabel.bottomBorder": u.border,
    "toolbar.hoverBackground": a(u.accent, 0.15),

    // Editor groups and tabs
    "editorGroup.border": u.border,
    "editorGroup.dropBackground": a(u.accent, 0.15),
    "editorGroupHeader.tabsBackground": u.bg1,
    "editorGroupHeader.tabsBorder": u.border,
    "editorGroupHeader.noTabsBackground": u.bg1,
    "tab.activeBackground": u.bg2,
    "tab.activeForeground": u.fg,
    "tab.activeBorderTop": u.accent,
    "tab.activeBorder": u.bg2,
    "tab.inactiveBackground": u.bg1,
    "tab.inactiveForeground": u.muted,
    "tab.hoverBackground": a(u.accent, 0.08),
    "tab.unfocusedActiveForeground": u.muted,
    "tab.unfocusedActiveBorderTop": a(u.accent, 0.4),
    "tab.unfocusedInactiveForeground": u.dim,
    "tab.border": u.border,
    "tab.lastPinnedBorder": u.border,
    "tab.activeModifiedBorder": s.func,
    "tab.inactiveModifiedBorder": a(s.func, 0.5),
    "breadcrumb.foreground": u.muted,
    "breadcrumb.focusForeground": u.fg,
    "breadcrumb.activeSelectionForeground": u.accent,
    "breadcrumbPicker.background": u.bg3,

    // Editor
    "editor.background": u.bg2,
    "editor.foreground": u.fg,
    "editorLineNumber.foreground": a(u.dim, 0.75),
    "editorLineNumber.activeForeground": u.accent,
    "editorCursor.foreground": u.accent,
    "editor.selectionBackground": sel,
    "editor.inactiveSelectionBackground": a(u.accent, 0.13),
    "editor.selectionHighlightBackground": a(u.accent, 0.14),
    "editor.selectionHighlightBorder": a(u.accent, 0.3),
    "editor.wordHighlightBackground": a(s.type, 0.13),
    "editor.wordHighlightStrongBackground": a(s.type, 0.22),
    "editor.findMatchBackground": a(s.func, dark ? 0.35 : 0.45),
    "editor.findMatchBorder": s.func,
    "editor.findMatchHighlightBackground": a(s.func, 0.18),
    "editor.findRangeHighlightBackground": a(u.accent, 0.08),
    "editor.hoverHighlightBackground": a(u.accent, 0.12),
    "editor.lineHighlightBackground": a(u.accent, dark ? 0.07 : 0.07),
    "editor.lineHighlightBorder": "#00000000",
    "editor.rangeHighlightBackground": a(u.accent, 0.08),
    "editor.linkedEditingBackground": a(s.type, 0.12),
    "editorLink.activeForeground": u.accent,
    "editorWhitespace.foreground": a(u.dim, 0.35),
    "editorIndentGuide.background1": a(u.dim, 0.18),
    "editorIndentGuide.activeBackground1": a(u.accent, 0.5),
    "editorRuler.foreground": a(u.dim, 0.2),
    "editorCodeLens.foreground": u.dim,
    "editorInlayHint.background": a(u.accent, 0.1),
    "editorInlayHint.foreground": u.muted,
    "editorBracketMatch.background": a(s.type, 0.15),
    "editorBracketMatch.border": a(s.type, 0.6),
    "editorBracketHighlight.foreground1": s.keyword,
    "editorBracketHighlight.foreground2": ansi.green,
    "editorBracketHighlight.foreground3": s.func,
    "editorBracketHighlight.foreground4": s.type,
    "editorBracketHighlight.foreground5": s.param,
    "editorBracketHighlight.foreground6": s.number,
    "editorBracketHighlight.unexpectedBracket.foreground": state.error,
    "editorError.foreground": state.error,
    "editorWarning.foreground": state.warning,
    "editorInfo.foreground": state.info,
    "editorHint.foreground": state.ok,
    "editorUnnecessaryCode.opacity": "#000000a0",
    "editorGutter.background": u.bg2,
    "editorGutter.addedBackground": ansi.green,
    "editorGutter.modifiedBackground": u.accent,
    "editorGutter.deletedBackground": state.error,
    "editorGutter.foldingControlForeground": u.dim,
    "editorOverviewRuler.border": "#00000000",
    "editorOverviewRuler.findMatchForeground": a(s.func, 0.8),
    "editorOverviewRuler.selectionHighlightForeground": a(u.accent, 0.6),
    "editorOverviewRuler.errorForeground": state.error,
    "editorOverviewRuler.warningForeground": state.warning,
    "editorOverviewRuler.infoForeground": state.info,
    "editorOverviewRuler.addedForeground": a(ansi.green, 0.7),
    "editorOverviewRuler.modifiedForeground": a(u.accent, 0.7),
    "editorOverviewRuler.deletedForeground": a(state.error, 0.7),
    "editorStickyScroll.background": u.bg2,
    "editorStickyScroll.shadow": u.shadow,
    "editorStickyScrollHover.background": u.bg3,

    // Floating widgets - glass panes
    "editorWidget.background": u.bg3,
    "editorWidget.foreground": u.fg,
    "editorWidget.border": u.sheen === "#ffffff" ? u.border : u.sheen,
    "editorWidget.resizeBorder": u.accent,
    "editorSuggestWidget.background": u.bg3,
    "editorSuggestWidget.border": u.border,
    "editorSuggestWidget.foreground": u.fg,
    "editorSuggestWidget.selectedBackground": u.bg4,
    "editorSuggestWidget.selectedForeground": u.fg,
    "editorSuggestWidget.highlightForeground": u.accent,
    "editorSuggestWidget.focusHighlightForeground": u.accent,
    "editorHoverWidget.background": u.bg3,
    "editorHoverWidget.border": u.border,
    "editorHoverWidget.statusBarBackground": u.bg1,
    "debugExceptionWidget.background": u.bg3,
    "debugExceptionWidget.border": state.error,
    "peekView.border": u.accent,
    "peekViewTitle.background": u.bg1,
    "peekViewTitleLabel.foreground": u.fg,
    "peekViewTitleDescription.foreground": u.muted,
    "peekViewEditor.background": u.bg1,
    "peekViewEditor.matchHighlightBackground": a(s.func, 0.3),
    "peekViewResult.background": u.bg1,
    "peekViewResult.selectionBackground": u.bg4,
    "peekViewResult.matchHighlightBackground": a(s.func, 0.3),
    "quickInput.background": u.bg3,
    "quickInput.foreground": u.fg,
    "quickInputTitle.background": u.bg1,
    "quickInputList.focusBackground": u.bg4,
    "quickInputList.focusForeground": u.fg,
    "quickInputList.focusIconForeground": u.accent,
    "pickerGroup.foreground": u.accent,
    "pickerGroup.border": u.border,
    "notifications.background": u.bg3,
    "notifications.foreground": u.fg,
    "notifications.border": u.border,
    "notificationCenterHeader.background": u.bg1,
    "notificationToast.border": u.border,
    "notificationsErrorIcon.foreground": state.error,
    "notificationsWarningIcon.foreground": state.warning,
    "notificationsInfoIcon.foreground": state.info,
    "notificationLink.foreground": u.accent,

    // Diff
    "diffEditor.insertedTextBackground": a(ansi.green, 0.16),
    "diffEditor.removedTextBackground": a(state.error, 0.16),
    "diffEditor.insertedLineBackground": a(ansi.green, 0.08),
    "diffEditor.removedLineBackground": a(state.error, 0.08),
    "diffEditor.diagonalFill": a(u.dim, 0.2),
    "merge.currentHeaderBackground": a(ansi.green, 0.35),
    "merge.currentContentBackground": a(ansi.green, 0.12),
    "merge.incomingHeaderBackground": a(u.accent, 0.35),
    "merge.incomingContentBackground": a(u.accent, 0.12),

    // Panel, terminal
    "panel.background": u.bg1,
    "panel.border": u.border,
    "panelTitle.activeForeground": u.fg,
    "panelTitle.activeBorder": u.accent,
    "panelTitle.inactiveForeground": u.dim,
    "panelSection.border": u.border,
    "panelInput.border": u.border,
    "terminal.background": u.bg1,
    "terminal.foreground": u.fg,
    "terminal.border": u.border,
    "terminal.selectionBackground": sel,
    "terminalCursor.foreground": u.accent,
    "terminal.ansiBlack": ansi.black,
    "terminal.ansiRed": ansi.red,
    "terminal.ansiGreen": ansi.green,
    "terminal.ansiYellow": ansi.yellow,
    "terminal.ansiBlue": ansi.blue,
    "terminal.ansiMagenta": ansi.magenta,
    "terminal.ansiCyan": ansi.cyan,
    "terminal.ansiWhite": ansi.white,
    "terminal.ansiBrightBlack": ansi.brightBlack,
    "terminal.ansiBrightRed": ansi.brightRed,
    "terminal.ansiBrightGreen": ansi.brightGreen,
    "terminal.ansiBrightYellow": ansi.brightYellow,
    "terminal.ansiBrightBlue": ansi.brightBlue,
    "terminal.ansiBrightMagenta": ansi.brightMagenta,
    "terminal.ansiBrightCyan": ansi.brightCyan,
    "terminal.ansiBrightWhite": ansi.brightWhite,
    "terminalCommandDecoration.successBackground": ansi.green,
    "terminalCommandDecoration.errorBackground": state.error,
    "terminalCommandDecoration.defaultBackground": u.dim,

    // Status bar - the glowing Vista taskbar strip
    "statusBar.background": u.status,
    "statusBar.foreground": u.statusFg,
    "statusBar.border": a("#ffffff", dark ? 0.08 : 0.35),
    "statusBar.noFolderBackground": dark ? "#1d4a6b" : "#4b8fc6",
    "statusBar.noFolderForeground": u.statusFg,
    "statusBar.debuggingBackground": dark ? "#9a5a12" : "#c26a00",
    "statusBar.debuggingForeground": "#ffffff",
    "statusBarItem.hoverBackground": a("#ffffff", 0.15),
    "statusBarItem.activeBackground": a("#ffffff", 0.25),
    "statusBarItem.remoteBackground": dark ? "#2b8f3a" : "#3a9a2a",
    "statusBarItem.remoteForeground": "#ffffff",
    "statusBarItem.prominentBackground": a("#000000", 0.2),
    "statusBarItem.errorBackground": state.error,
    "statusBarItem.errorForeground": "#ffffff",
    "statusBarItem.warningBackground": dark ? "#9a6a12" : "#b06a00",
    "statusBarItem.warningForeground": "#ffffff",

    // Git decorations and SCM
    "gitDecoration.addedResourceForeground": ansi.green,
    "gitDecoration.untrackedResourceForeground": ansi.green,
    "gitDecoration.modifiedResourceForeground": dark ? s.func : s.func,
    "gitDecoration.deletedResourceForeground": state.error,
    "gitDecoration.renamedResourceForeground": s.type,
    "gitDecoration.conflictingResourceForeground": s.param,
    "gitDecoration.ignoredResourceForeground": u.dim,
    "gitDecoration.stageModifiedResourceForeground": s.func,
    "gitDecoration.stageDeletedResourceForeground": state.error,
    "gitDecoration.submoduleResourceForeground": u.accent,

    // Misc
    "minimap.background": u.bg2,
    "minimap.selectionHighlight": a(u.accent, 0.5),
    "minimap.findMatchHighlight": a(s.func, 0.6),
    "minimapSlider.background": a(u.dim, 0.15),
    "minimapSlider.hoverBackground": a(u.dim, 0.25),
    "minimapSlider.activeBackground": a(u.accent, 0.3),
    "minimapGutter.addedBackground": ansi.green,
    "minimapGutter.modifiedBackground": u.accent,
    "minimapGutter.deletedBackground": state.error,
    "welcomePage.tileBackground": u.bg3,
    "welcomePage.tileHoverBackground": u.bg4,
    "welcomePage.tileBorder": u.border,
    "walkThrough.embeddedEditorBackground": u.bg1,
    "settings.headerForeground": u.fg,
    "settings.modifiedItemIndicator": u.accent,
    "settings.focusedRowBackground": a(u.accent, 0.06),
    "settings.rowHoverBackground": a(u.accent, 0.04),
    "debugToolBar.background": u.bg3,
    "debugToolBar.border": u.border,
    "debugIcon.breakpointForeground": state.error,
    "editor.stackFrameHighlightBackground": a(s.func, 0.15),
    "editor.focusedStackFrameHighlightBackground": a(ansi.green, 0.15),
    "charts.foreground": u.fg,
    "charts.lines": u.dim,
    "charts.red": ansi.red,
    "charts.blue": ansi.blue,
    "charts.yellow": ansi.yellow,
    "charts.orange": s.number,
    "charts.green": ansi.green,
    "charts.purple": ansi.magenta,
  };
}

// ---------------------------------------------------------------------------
// Syntax (TextMate) rules
// ---------------------------------------------------------------------------
function tokens(s) {
  const r = (name, scope, foreground, fontStyle) => ({
    name, scope, settings: { foreground, ...(fontStyle !== undefined && { fontStyle }) },
  });
  return [
    r("Comments", ["comment", "punctuation.definition.comment", "string.comment"], s.comment, "italic"),
    r("Doc comment tags", ["comment.block.documentation storage.type", "comment.block.documentation entity.name.type", "storage.type.class.jsdoc", "comment keyword.codetag"], s.storage, "italic"),
    r("Keywords", ["keyword", "keyword.control", "keyword.other.using", "keyword.other.import", "storage.type.function.arrow"], s.keyword),
    r("Storage", ["storage", "storage.type", "storage.modifier", "keyword.other.special-method", "support.type.primitive.ts"], s.storage),
    r("Operators", ["keyword.operator", "punctuation.accessor", "punctuation.separator.key-value"], s.operator, ""),
    r("Logical/word operators", ["keyword.operator.new", "keyword.operator.expression", "keyword.operator.logical.python", "keyword.operator.word"], s.keyword),
    r("Punctuation", ["punctuation", "meta.brace", "punctuation.definition.parameters", "punctuation.definition.block"], s.operator),
    r("Strings", ["string", "string.quoted", "string.template", "punctuation.definition.string"], s.string),
    r("String escapes / interpolation", ["constant.character.escape", "punctuation.definition.template-expression", "punctuation.section.embedded"], s.escape),
    r("Regex", ["string.regexp", "constant.other.character-class.regexp"], s.regex),
    r("Numbers", ["constant.numeric", "keyword.other.unit"], s.number),
    r("Language constants", ["constant.language", "support.constant", "constant.other.symbol", "variable.other.constant"], s.constant),
    r("Functions", ["entity.name.function", "support.function", "meta.function-call entity.name.function", "variable.function", "entity.name.method"], s.func),
    r("Types & classes", ["entity.name.type", "entity.name.class", "support.type", "support.class", "entity.other.inherited-class", "entity.name.namespace", "storage.type.java", "storage.type.cs", "entity.name.type.module"], s.type),
    r("Variables", ["variable", "variable.other", "variable.other.readwrite", "meta.definition.variable"], s.variable),
    r("Parameters", ["variable.parameter", "meta.parameters variable", "entity.name.variable.parameter"], s.param, "italic"),
    r("Language variables", ["variable.language", "variable.language.this", "variable.language.self", "variable.language.super"], s.keyword, "italic"),
    r("Properties", ["variable.other.property", "variable.other.object.property", "support.variable.property", "meta.object-literal.key", "entity.name.tag.yaml", "support.type.property-name"], s.property),
    r("Decorators", ["meta.decorator", "entity.name.function.decorator", "punctuation.decorator", "storage.type.annotation", "meta.attribute"], s.decorator, "italic"),
    r("Tags", ["entity.name.tag", "meta.tag.sgml", "punctuation.definition.tag"], s.tag),
    r("Tag punctuation", ["punctuation.definition.tag.begin", "punctuation.definition.tag.end"], s.operator),
    r("Attributes", ["entity.other.attribute-name"], s.attr, "italic"),
    r("CSS selectors", ["entity.other.attribute-name.class.css", "entity.other.attribute-name.id.css", "entity.name.tag.css", "entity.other.attribute-name.pseudo-class.css", "entity.other.attribute-name.pseudo-element.css"], s.func, ""),
    r("CSS properties", ["support.type.property-name.css", "support.type.vendored.property-name.css"], s.property),
    r("CSS values", ["support.constant.property-value.css", "support.constant.color", "constant.other.color.rgb-value", "support.constant.font-name"], s.number),
    r("JSON keys", ["support.type.property-name.json", "support.type.property-name.json punctuation.definition.string"], s.keyword),
    r("Markdown headings", ["markup.heading", "markup.heading entity.name", "punctuation.definition.heading.markdown"], s.heading, "bold"),
    r("Markdown bold", ["markup.bold"], s.number, "bold"),
    r("Markdown italic", ["markup.italic"], s.param, "italic"),
    r("Markdown code", ["markup.inline.raw", "markup.fenced_code.block", "markup.raw"], s.string),
    r("Markdown links", ["markup.underline.link", "string.other.link"], s.link, "underline"),
    r("Markdown quote", ["markup.quote"], s.comment, "italic"),
    r("Markdown lists", ["punctuation.definition.list.begin.markdown", "beginning.punctuation.definition.list.markdown"], s.func),
    r("Diff inserted", ["markup.inserted", "meta.diff.header.to-file"], s.string),
    r("Diff deleted", ["markup.deleted", "meta.diff.header.from-file"], s.invalid),
    r("Diff changed", ["markup.changed"], s.func),
    r("Invalid", ["invalid", "invalid.illegal"], s.invalid),
    r("Deprecated", ["invalid.deprecated"], s.number, "strikethrough"),
    r("Shell variables", ["variable.other.normal.shell", "punctuation.definition.variable.shell"], s.param),
    r("Python self / builtins", ["support.function.builtin.python", "support.type.python"], s.type),
    r("Rust lifetimes / macros", ["entity.name.type.lifetime.rust", "punctuation.definition.lifetime.rust"], s.param),
    r("Macros", ["entity.name.function.macro", "entity.name.function.preprocessor", "keyword.control.directive", "meta.preprocessor"], s.decorator),
  ];
}

function semantic(s) {
  return {
    namespace: s.type,
    class: s.type,
    enum: s.type,
    interface: { foreground: s.type, italic: true },
    struct: s.type,
    typeParameter: { foreground: s.type, italic: true },
    type: s.type,
    parameter: { foreground: s.param, italic: true },
    variable: s.variable,
    "variable.readonly": s.constant,
    "variable.defaultLibrary": s.type,
    property: s.property,
    "property.readonly": s.property,
    enumMember: s.constant,
    function: s.func,
    method: s.func,
    macro: s.decorator,
    decorator: { foreground: s.decorator, italic: true },
    keyword: s.keyword,
    comment: s.comment,
    string: s.string,
    number: s.number,
    regexp: s.regex,
    operator: s.operator,
    "*.deprecated": { strikethrough: true },
    "selfKeyword": { foreground: s.keyword, italic: true },
    "builtinConstant": s.constant,
  };
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------
const check = process.argv.includes("--check");
mkdirSync(join(root, "themes"), { recursive: true });

for (const [name, p] of Object.entries(palettes)) {
  const theme = {
    $schema: "vscode://schemas/color-theme",
    name,
    type: p.type,
    semanticHighlighting: true,
    colors: workbench(p),
    tokenColors: tokens(p.syntax),
    semanticTokenColors: semantic(p.syntax),
  };
  writeFileSync(join(root, "themes", p.file), JSON.stringify(theme, null, 2) + "\n");
  console.log(`wrote themes/${p.file} (${Object.keys(theme.colors).length} UI colors, ${theme.tokenColors.length} token rules)`);

  if (check) {
    const bg = p.ui.bg2;
    for (const [k, v] of Object.entries(p.syntax)) {
      const c = contrast(v, bg);
      const min = k === "comment" ? 3 : 4.5;
      console.log(`  ${c >= min ? "ok  " : "LOW "} ${k.padEnd(10)} ${v} ${c.toFixed(2)}:1`);
    }
    for (const [k, fg, b] of [["ui fg", p.ui.fg, p.ui.bg1], ["muted", p.ui.muted, p.ui.bg1], ["status", p.ui.statusFg, p.ui.status], ["button", "#ffffff", p.ui.orb]]) {
      const c = contrast(fg, b);
      console.log(`  ${c >= 4.5 ? "ok  " : "LOW "} ${k.padEnd(10)} ${c.toFixed(2)}:1`);
    }
  }
}
