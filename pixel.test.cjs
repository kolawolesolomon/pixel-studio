const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const { runInNewContext } = require("node:vm");

const script = readFileSync(require.resolve("./dist/pixel.js"), "utf8");

function startEditor() {
  const events = {};
  const pixels = new Map();
  const context = {
    fillRect(x, y, width, height) {
      assert.equal(width, 20);
      assert.equal(height, 20);
      pixels.set(`${x},${y}`, this.fillStyle);
    },
  };
  const canvas = {
    getContext: () => context,
    getBoundingClientRect: () => ({ left: 10, top: 20, width: 160, height: 160 }),
    addEventListener: (type, listener) => { events[type] = listener; },
    toDataURL: () => "data:image/png;base64,fixture",
  };
  const color = { value: "#336699" };
  const button = (name) => ({
    addEventListener(type, listener) {
      assert.equal(type, "click");
      events[name] = listener;
    },
  });
  const nodes = {
    "#board": canvas, "#color": color, "#clear": button("clear"), "#export": button("export"),
  };
  const downloads = [];
  const document = {
    querySelector: (selector) => nodes[selector],
    createElement(tag) {
      assert.equal(tag, "a");
      return { click() { downloads.push({ name: this.download, url: this.href }); } };
    },
  };
  runInNewContext(script, { document });
  return { events, pixels, color, downloads };
}

test("mouse and touch paint scaled cells with the selected color", () => {
  const { events, pixels, color } = startEditor();
  assert.equal(pixels.size, 256);
  assert.equal(pixels.get("0,0"), "#ffffff");
  events.pointerdown({ clientX: 31, clientY: 51, pointerType: "mouse" });
  assert.equal(pixels.get("40,60"), "#336699");
  color.value = "#ff0000";
  events.pointerdown({ clientX: 169, clientY: 179, pointerType: "touch" });
  assert.equal(pixels.get("300,300"), "#ff0000");
  events.pointerdown({ clientX: 170, clientY: 180, pointerType: "touch" });
  assert.equal([...pixels.values()].filter((pixel) => pixel !== "#ffffff").length, 2);
});

test("clear repaints the board and export downloads the canvas PNG", () => {
  const { events, pixels, downloads } = startEditor();
  events.pointerdown({ clientX: 10, clientY: 20, pointerType: "mouse" });
  events.export();
  assert.deepEqual(downloads, [{ name: "pixel-art.png", url: "data:image/png;base64,fixture" }]);
  events.clear();
  assert.equal([...pixels.values()].filter((pixel) => pixel !== "#ffffff").length, 0);
});
