# Pixel Studio

[![Tests](https://github.com/kolawolesolomon/pixel-studio/actions/workflows/tests.yml/badge.svg)](https://github.com/kolawolesolomon/pixel-studio/actions/workflows/tests.yml)

A TypeScript and Canvas editor for creating 16×16 pixel art. Choose a color, paint individual cells and export your image as PNG.

## Setup and use

Install Node.js 22, then run these commands from the repository root.

```sh
npm install
npm run build
```

Open `index.html` in a browser. Click or tap a cell to paint it. Use **Clear** to reset the canvas and **Export PNG** to save a 320×320 image.

## Tests

```sh
npm test
```

This compiles TypeScript and verifies coordinate scaling, selected colors, clearing and the download action with Canvas and DOM test doubles. The Chrome scenario verifies mouse and emulated touch input, responsive sizing and a real PNG download. To run it locally, install Google Chrome and use these commands.

```sh
npm install --no-save --package-lock=false playwright@1.58.2
node --test browser.test.cjs
```

The browser test captures a running editor in `pixel-studio.png`.

## Limitations

The grid size is fixed. Drawings live in the current page until exported, and painting is one cell per click or tap.

## Screenshot

Open the latest successful [Actions run](https://github.com/kolawolesolomon/pixel-studio/actions/workflows/tests.yml) and download `pixel-studio-preview` from **Artifacts** to see a screenshot captured from the running application.
