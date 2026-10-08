import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { chromium, webkit, devices } from "playwright-core";

// Install WebKit with Playwright's CLI; PLAYWRIGHT_BROWSERS_PATH can point
// at .preview/browsers to keep downloaded browsers out of the repository.
const base = process.argv[2] || "http://127.0.0.1:3100";
const executablePath = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((path) => path && existsSync(path));
mkdirSync(".preview", { recursive: true });

async function place(page, selector, fraction) {
  await page.evaluate(({ selector, fraction }) => {
    const element = document.querySelector(selector);
    const box = element.getBoundingClientRect();
    window.scrollTo({ top: scrollY + box.top + box.height / 2 - innerHeight * fraction, behavior: "instant" });
  }, { selector, fraction });
  await page.waitForTimeout(1100);
  await page.waitForFunction((selector) => document.querySelector(selector).style.willChange !== "transform", selector);
}

async function tilt(page) {
  return page.locator(".hero-portrait").evaluate((el) => ({
    transform: el.style.transform,
    x: Number(el.style.transform.match(/rotateX\(([-\d.]+)deg\)/)?.[1] || 0),
    light: el.style.getPropertyValue("--light-x"),
  }));
}

for (const [engine, browserType, launchOptions, profiles] of [
  ["chromium", chromium, { executablePath }, ["Pixel 7", "Galaxy S9+"]],
  ["webkit", webkit, {}, ["iPhone 13", "iPhone SE", "iPad Mini"]],
]) {
  if (process.env.MOTION_ENGINE && process.env.MOTION_ENGINE !== engine) continue;
  const browser = await browserType.launch({ headless: true, ...launchOptions });
  try {
    for (const name of profiles) {
      if (process.env.MOTION_DEVICE && process.env.MOTION_DEVICE !== name) continue;
      const context = await browser.newContext({ ...devices[name], reducedMotion: "no-preference" });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.addInitScript(() => {
        window.__motionFrames = 0;
        const request = window.requestAnimationFrame.bind(window);
        window.requestAnimationFrame = (callback) => request((time) => {
          window.__motionFrames++;
          callback(time);
        });
      });
      try {
        assert((await page.goto(base, { waitUntil: "networkidle" }))?.ok());
        await page.evaluate(() => document.fonts.ready);
        assert(await page.evaluate(() => matchMedia("(pointer: coarse)").matches), `${name}: touch input`);
        await place(page, ".hero-portrait", 0.7);
        const before = await tilt(page);
        assert(before.x > 1, `${name}: tilt follows scroll below center: ${JSON.stringify(before)}`);
        await place(page, ".hero-portrait", 0.4);
        const after = await tilt(page);
        assert(after.x < -0.5 && before.light !== after.light, `${name}: tilt and light respond to scroll`);
        const settled = after.transform;
        await page.waitForTimeout(300);
        assert.equal((await tilt(page)).transform, settled, `${name}: no stationary drift`);
        assert(await page.locator(".portrait-img").evaluate((el) => el.complete && el.naturalWidth > 0 && getComputedStyle(el).objectFit === "contain"));

        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.waitForTimeout(350);
        assert.equal((await tilt(page)).transform, "", `${name}: reduced motion resets tilt`);
        assert(await page.locator(".paper-field").isHidden(), `${name}: reduced motion hides WebGL`);
        const stopped = await page.evaluate(() => window.__motionFrames);
        await page.waitForTimeout(300);
        assert.equal(await page.evaluate(() => window.__motionFrames), stopped, `${name}: reduced motion stops animation callbacks`);
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await page.waitForFunction(() => Number(document.querySelector(".hero-portrait").style.transform.match(/rotateX\(([-\d.]+)deg\)/)?.[1] || 0) < -0.5, null, { timeout: 10000 });
        assert((await tilt(page)).x < -0.5, `${name}: effects resume after preference change`);

        // A mobile toolbar height change and a portrait/landscape rotation.
        const { width, height } = devices[name].viewport;
        for (const viewport of [{ width, height: height - 90 }, { width: height, height: width }, { width, height }]) {
          await page.setViewportSize(viewport);
          await place(page, ".hero-portrait", 0.6);
          const layout = await page.evaluate(() => ({
            width: innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            overflowing: [...document.querySelectorAll("body *")].filter((el) => el.getBoundingClientRect().right > innerWidth + 1).slice(0, 12).map((el) => ({ tag: el.tagName, class: el.className, right: el.getBoundingClientRect().right })),
          }));
          assert(layout.scrollWidth <= layout.width, `${name}: no overflow after resize ${JSON.stringify({ viewport, ...layout })}`);
          // In tablet landscape the portrait can be too near the page top
          // to scroll to the requested position. Check its actual position.
          const expected = await page.locator(".hero-portrait").evaluate((el) => {
            const box = el.getBoundingClientRect();
            const height = visualViewport?.height ?? innerHeight;
            const center = (visualViewport?.offsetTop ?? 0) + height / 2;
            return Math.max(-1, Math.min(1, (box.top + box.height / 2 - center) / (height / 2))) * 9;
          });
          assert(Math.abs((await tilt(page)).x - expected) < 0.3, `${name}: tilt updates after resize`);
        }
        await page.screenshot({ path: `.preview/${engine}-${name.replaceAll(" ", "-")}.png` });

        const tile = page.locator(".tile").first();
        await tile.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1100);
        assert(await page.locator(".tile-touch-hint").isVisible(), `${name}: tap instruction`);
        assert(await page.locator(".tile-hover-hint").isHidden(), `${name}: no hover instruction`);
        for (const pressed of ["true", "false", "true", "false"]) {
          await tile.tap();
          await page.waitForTimeout(850);
          assert.equal(await tile.getAttribute("aria-pressed"), pressed);
          const rotated = await tile.locator(".tile-inner").evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m11 < 0);
          assert.equal(rotated, pressed === "true", `${name}: repeated tap flips both ways`);
          if (pressed === "true") await tile.screenshot({ path: `.preview/${engine}-${name.replaceAll(" ", "-")}-tile-back.png` });
        }
        await page.screenshot({ path: `.preview/${engine}-${name.replaceAll(" ", "-")}-tiles.png` });

        // A fast fling must not leave skipped sections hidden.
        await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
        await page.waitForTimeout(1300);
        assert.equal(await page.locator('[data-reveal]:not([data-shown="true"])').count(), 0, `${name}: all sections revealed`);
        const idle = await page.evaluate(() => window.__motionFrames);
        await page.waitForTimeout(300);
        assert.equal(await page.evaluate(() => window.__motionFrames), idle, `${name}: offscreen animations pause`);

        // An initial reduced-motion visit must also be able to resume effects.
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(base, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        await place(page, ".hero-portrait", 0.7);
        assert.equal((await tilt(page)).transform, "");
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await page.waitForFunction(() => Number(document.querySelector(".hero-portrait").style.transform.match(/rotateX\(([-\d.]+)deg\)/)?.[1] || 0) > 1, null, { timeout: 10000 });
        assert((await tilt(page)).x > 1, `${name}: resume from initial reduced motion`);
        assert.deepEqual(errors, [], `${name}: no runtime errors`);
        console.log(`PASS: ${engine} ${name}: scroll/light, rotation, taps, reduced motion, idle, reveals`);
      } catch (error) {
        await page.screenshot({ path: `.preview/${engine}-failure.png` });
        throw error;
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
