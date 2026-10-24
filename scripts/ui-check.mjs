import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium } from "playwright-core";

const base = process.argv[2] || "http://127.0.0.1:3100";
const executablePath = [process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((path) => path && existsSync(path));
const browser = await chromium.launch({ executablePath, headless: true });
const errors = [];
try {
  for (const [width, height] of [[1920,1080],[1440,900],[1280,600],[1024,768],[820,1180],[768,1024],[428,926],[390,844],[375,667],[320,740]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
    page.on("pageerror", (error) => errors.push(error.message));
    assert((await page.goto(base, { waitUntil: "networkidle" }))?.ok());
    await page.evaluate(() => document.fonts.ready);
    const report = await page.evaluate(() => {
      const visible = (element) => element.getBoundingClientRect().width > 1 && !element.closest('[aria-hidden="true"], .sr-only');
      const clipped = [...document.querySelectorAll("h1,h2,h3,.copy,.detail,.label,.chip,.tile-face")]
        .filter((element) => visible(element) && element.clientWidth > 0 &&
          (element.scrollWidth > element.clientWidth + 1 ||
            (getComputedStyle(element).overflowY !== "visible" && element.scrollHeight > element.clientHeight + 1)))
        .map((element) => ({ text: element.textContent.trim().slice(0,70), class: element.className }));
      // Both 3D faces must fit even when the back face is not being shown.
      const tileOverflow = [...document.querySelectorAll(".tile-face")].some((element) =>
        element.scrollHeight > element.clientHeight + 1 || element.scrollWidth > element.clientWidth + 1);
      const smallTargets = [...document.querySelectorAll('header a, nav[aria-label="Sections"] a, .btn, footer a')]
        .filter((element) => visible(element) && element.getBoundingClientRect().height < 43.5)
        .map((element) => element.textContent.trim());
      const missingAnchors = [...document.querySelectorAll('a[href^="#"]')]
        .map((element) => element.getAttribute("href").slice(1)).filter((id) => !document.getElementById(id));
      return { clipped, tileOverflow, smallTargets, missingAnchors,
        overflow: document.documentElement.scrollWidth > innerWidth,
        bodySize: parseFloat(getComputedStyle(document.querySelector(".copy")).fontSize),
        imagesLoaded: [...document.images].every((image) => image.complete && image.naturalWidth > 0),
        headingCount: document.querySelectorAll("h1").length,
        studentPortalPresent: /student portal|lyceum|leaportal/i.test(document.body.innerText),
        sections: [...document.querySelectorAll("main > section")].map((element) => element.id),
      };
    });
    assert(!report.overflow && !report.tileOverflow, `${width}px: overflow ${JSON.stringify(report)}`);
    assert.deepEqual(report.clipped, [], `${width}px: clipped text`);
    assert.deepEqual(report.smallTargets, [], `${width}px: small controls`);
    assert.deepEqual(report.missingAnchors, [], `${width}px: broken section links`);
    assert(report.bodySize >= 16 && report.headingCount === 1 && !report.studentPortalPresent);
    assert.deepEqual(report.sections, ["top","work","services","practice","stack","about","close"]);
    // Lazy images are checked after visiting the work section.
    await page.locator("#work").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll("#work img")].every((image) => image.complete && image.naturalWidth > 0));
    const serviceLink = page.getByRole("link", { name: "See Bella's Takoyaki" });
    await serviceLink.click();
    assert.equal(new URL(page.url()).hash, "#project-bellas-takoyaki");
    await page.waitForFunction(() => document.querySelector('header a[aria-current="location"]')?.getAttribute("href") === "#work");
    const targetTop = await page.locator("#project-bellas-takoyaki").evaluate((element) => element.getBoundingClientRect().top);
    assert(targetTop >= (width < 1024 ? 112 : 60), `${width}px: anchor hidden by navigation`);
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
    await page.waitForFunction(() => !document.querySelector('header a[aria-current="location"]'));
    await page.goto(`${base}/resume`, { waitUntil: "networkidle" });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px: resume overflow`);
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(await page.getByRole("link", { name: "Download PDF" }).getAttribute("href"), "/resume.pdf");
    console.log(`PASS: ${width}×${height}, readable text, controls, cards, project links, résumé`);
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").textContent(), "Skip to content");
  await page.keyboard.press("Enter");
  assert.equal(await page.locator(":focus").getAttribute("id"), "main");
  const tile = page.getByRole("button", { name: "HTML5 — Markup" });
  await tile.focus();
  await page.keyboard.press("Space");
  assert.equal(await tile.getAttribute("aria-pressed"), "true");
  await page.keyboard.press("Space");
  assert.equal(await tile.getAttribute("aria-pressed"), "false");
  assert((await page.request.get(`${base}/resume.pdf`)).ok(), "PDF download must exist");
  assert.deepEqual(errors, [], "Browser errors");
  console.log("PASS: keyboard skip link, accessible technology controls, PDF download, no runtime errors");
} finally {
  await browser.close();
}
