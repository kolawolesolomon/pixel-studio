const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");
const { test } = require("node:test");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

test("mouse and touch paint the canvas and export a valid PNG", async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 590 }, hasTouch: true, isMobile: true });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(pathToFileURL(require.resolve("./index.html")).href);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const canvas = page.locator("#board");
    const pixel = (x, y) => canvas.evaluate(
      (board, [left, top]) => Array.from(board.getContext("2d").getImageData(left, top, 1, 1).data),
      [x, y],
    );
    assert.deepEqual(await pixel(10, 10), [255, 255, 255, 255]);
    await page.locator("#color").fill("#336699");
    await canvas.click({ position: { x: 7, y: 7 } });
    assert.deepEqual(await pixel(10, 10), [51, 102, 153, 255]);
    await page.locator("#color").fill("#cc5500");
    await canvas.tap({ position: { x: 25, y: 7 } });
    assert.deepEqual(await pixel(30, 10), [204, 85, 0, 255]);
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Export PNG" }).click(),
    ]);
    assert.equal(download.suggestedFilename(), "pixel-art.png");
    const png = await readFile(await download.path());
    assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(png.readUInt32BE(16), 320);
    assert.equal(png.readUInt32BE(20), 320);
    await page.getByRole("button", { name: "Clear" }).tap();
    assert.deepEqual(await pixel(10, 10), [255, 255, 255, 255]);
    assert.deepEqual(await pixel(30, 10), [255, 255, 255, 255]);
    assert.deepEqual(errors, []);

    await page.setViewportSize({ width: 600, height: 560 });
    const art = [
      "................", "................", "....##....##....", "...####..####...",
      "..############..", "..############..", "..############..", "...##########...",
      "....########....", ".....######.....", "......####......", ".......##.......",
      "................", "................", "................", "................",
    ];
    for (const [y, row] of art.entries()) {
      for (const [x, cell] of [...row].entries()) {
        if (cell === "#") await canvas.click({ position: { x: x * 20 + 10, y: y * 20 + 10 } });
      }
    }
    await page.screenshot({ path: "pixel-studio.png" });
  } finally {
    await browser.close();
  }
});
