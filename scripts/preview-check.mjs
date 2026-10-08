import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const executablePath = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((path) => path && existsSync(path));
const base = process.argv[2] || "http://127.0.0.1:3000";
mkdirSync(".preview", { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const errors = [];
try {
  const page = await browser.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 960 });
    const response = await page.goto(base, { waitUntil: "networkidle" });
    assert(response?.ok(), `Home failed at ${width}px`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator(".portrait-img").waitFor({ state: "visible" });
    await page.waitForTimeout(1400);
    const layout = await page.evaluate(() => {
      const image = document.querySelector(".portrait-img");
      const frame = document.querySelector(".portrait-frame").getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        loaded: image.complete && image.naturalWidth > 0,
        fit: getComputedStyle(image).objectFit,
        ratio: frame.width / frame.height,
        frameVisible: frame.left >= 0 && frame.right <= innerWidth,
      };
    });
    assert(!layout.overflow, `Horizontal overflow at ${width}px`);
    assert(layout.loaded && layout.fit === "contain", `Photo not loaded or cropped at ${width}px`);
    assert(Math.abs(layout.ratio - 0.8) < 0.03 && layout.frameVisible, `Portrait alignment at ${width}px`);
    if (width === 1440 || width === 390) {
      if (width === 390) await page.setViewportSize({ width, height: 1450 });
      await page.screenshot({ path: `.preview/${width === 1440 ? "desktop" : "mobile"}.png` });
    }
    console.log(`PASS: ${width}px layout, photo, no horizontal overflow`);
  }
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const portrait = page.locator(".hero-portrait");
  const box = await portrait.boundingBox();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.3);
  await page.waitForTimeout(500);
  assert(await portrait.evaluate((el) => el.style.transform.includes("rotateY")), "Pointer tilt missing");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(150);
  assert.equal(await portrait.evaluate((el) => el.style.transform), "", "Reduced motion must reset tilt");
  assert(await page.locator(".paper-field").isHidden(), "Reduced motion must hide the animated background");
  await page.getByRole("link", { name: "Explore my work" }).click();
  assert.equal(new URL(page.url()).hash, "#work");
  assert((await page.goto(`${base}/resume`, { waitUntil: "networkidle" }))?.ok(), "Resume route failed");
  assert.deepEqual(errors, [], "Browser runtime errors");
  console.log("PASS: pointer tilt, reduced motion, work navigation, resume, no runtime errors");
} finally {
  await browser.close();
}
