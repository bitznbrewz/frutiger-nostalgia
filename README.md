# Frutiger Nostalgia

VS Code color themes that bring back Windows Vista Aero and the Frutiger Aero era: smoked glass, glossy orbs, sky blue, grass green and sunlight.

| Theme | Type | Look |
| --- | --- | --- |
| **Aero Glass** | Dark | Vista's smoked-glass taskbar and Start menu at night |
| **Aero Sky** | Light | A bright Frutiger Aero morning: sky, water, grass |

## Palette

Every syntax color meets 4.5:1 contrast against the editor background (comments meet 3:1). Run `npm run check` to print the report.

| Name | Used for | Aero Glass | Aero Sky |
| --- | --- | --- | --- |
| Clear Sky | keywords, tags | `#4fc3f7` | `#0062b8` |
| Meadow | strings | `#9ee36a` | `#2b7614` |
| Sunbeam | functions, decorators | `#ffd166` | `#925400` |
| Lagoon | types, classes, attributes | `#5ee6c8` | `#00766a` |
| Ember | numbers, constants | `#ffa25c` | `#b33f0d` |
| Aurora | parameters | `#c3b2ff` | `#7041b5` |
| Periwinkle | storage, modifiers | `#82a8ff` | `#4b4fc0` |
| Frost | properties, keys | `#a9d8f2` | `#155c86` |
| Editor glass | background | `#0e2130` | `#f6fafd` |

## Install

**Package a VSIX**

```sh
git clone https://github.com/bitznbrewz/frutiger-nostalgia
cd frutiger-nostalgia
npx @vscode/vsce package
code --install-extension frutiger-nostalgia-1.0.0.vsix
```

**Or link the folder** (macOS / Linux), then reload VS Code:

```sh
ln -s "$PWD/frutiger-nostalgia" ~/.vscode/extensions/frutiger-nostalgia
```

Then open the Command Palette, run **Preferences: Color Theme**, and pick **Aero Glass** or **Aero Sky**.

## Make it even more Vista

These settings pair well with the themes:

```jsonc
{
  "editor.fontFamily": "Consolas, 'Cascadia Mono', monospace",
  "workbench.fontAliasing": "antialiased",
  "window.titleBarStyle": "custom",
  "editor.bracketPairColorization.enabled": true
}
```

## Editing the themes

Both themes are generated from one palette in `scripts/build-themes.mjs`, so the dark and light variants stay in step. Edit the palette there, then run:

```sh
npm run build   # regenerate themes/*.json
npm run check   # regenerate and print the contrast report
```

`preview/index.html` is a standalone preview page showing both themes in a mock editor window.

## License

MIT
