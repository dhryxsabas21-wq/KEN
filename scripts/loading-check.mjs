import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { chromium, webkit, devices } from "playwright-core";

const base = process.argv[2] || "http://127.0.0.1:3300";
const executablePath = [process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((path) => path && existsSync(path));
mkdirSync(".preview", { recursive: true });

for (const [engine, type, options] of [
  ["chromium", chromium, { executablePath }], ["webkit", webkit, {}],
]) {
  const browser = await type.launch({ headless: true, ...options });
  const errors = [];
  const context = async (options = {}) => {
    const instance = await browser.newContext({ reducedMotion: "no-preference", ...options });
    instance.on("page", (page) => {
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error" && /hydration|hydrated|did not match|Minified React error/i.test(message.text())) errors.push(message.text());
      });
    });
    return instance;
  };
  const finished = async (page) => {
    await page.waitForFunction(() => !document.documentElement.classList.contains("entry-active") && !document.getElementById("portfolio-content")?.inert, null, { timeout: 6000 });
    assert(await page.locator(".entry-screen").isHidden());
    assert.equal(await page.locator("#portfolio-content").getAttribute("aria-busy"), null);
  };
  try {
    // Real first entry, followed by a reload and a direct résumé visit.
    let instance = await context();
    let page = await instance.newPage();
    await page.goto(base, { waitUntil: "domcontentloaded" });
    assert(await page.locator(".entry-screen").isVisible(), `${engine}: first entry is visible`);
    await finished(page);
    await page.waitForFunction(() => [...document.querySelectorAll("[data-eager]")].every((element) => element.getAttribute("data-shown") === "true"));
    assert.equal(await page.evaluate(() => sessionStorage.getItem("pronto:entry-seen")), "1");
    await page.reload({ waitUntil: "networkidle" });
    assert(await page.locator(".entry-screen").isHidden(), `${engine}: reload does not replay the intro`);
    await page.goto(`${base}/resume`, { waitUntil: "networkidle" });
    assert.equal(await page.locator(".entry-screen").count(), 0);
    assert(!await page.evaluate(() => document.documentElement.classList.contains("entry-active")));
    await instance.close();
    console.log(`PASS: ${engine}: first visit, reveal, session replay prevention, résumé bypass`);

    // Keep hydration blocked: the HTML/CSS intro and skip controls must still work.
    for (const [width, height] of [[1440,900],[390,844],[320,568],[740,360]]) {
      instance = await context({ viewport: { width, height } });
      await instance.route(/\/_next\/static\/.*\.js(?:\?.*)?$/, (route) => route.abort());
      page = await instance.newPage();
      await page.goto(base, { waitUntil: "domcontentloaded" });
      assert(await page.locator(".entry-screen").isVisible());
      assert(await page.locator("#portfolio-content").evaluate((element) => element.inert), `${engine}: background is inert before hydration`);
      const layout = await page.locator(".entry-screen").evaluate((screen) => ({
        fits: screen.scrollHeight <= screen.clientHeight + 1 && screen.scrollWidth <= screen.clientWidth + 1,
        controls: [...screen.querySelectorAll("button")].every((button) => button.getBoundingClientRect().height >= 44),
        titleVisible: (() => { const title = screen.querySelector(".entry-title").getBoundingClientRect(); return title.top >= 0 && title.bottom <= innerHeight; })(),
      }));
      assert(layout.fits && layout.controls && layout.titleVisible, `${engine}: intro fits ${width}×${height}: ${JSON.stringify(layout)}`);
      if (width === 1440 || width === 390) await page.screenshot({ path: `.preview/loader-${engine}-${width}.png`, animations: "disabled" });
      if (width === 1440) await page.keyboard.press("Escape");
      else await page.getByRole("button", { name: "Skip intro" }).click();
      await finished(page);
      await instance.close();
    }
    console.log(`PASS: ${engine}: desktop, phone, small phone, landscape; skip before hydration`);

    instance = await context();
    await instance.route(/\/_next\/static\/.*\.js(?:\?.*)?$/, (route) => route.abort());
    page = await instance.newPage();
    await page.goto(base, { waitUntil: "domcontentloaded" });
    await finished(page);
    assert(await page.locator("h1").isVisible());
    await instance.close();
    console.log(`PASS: ${engine}: failed hydration releases the page automatically`);

    // An image that never completes must not trap the visitor on the intro.
    instance = await context(engine === "webkit" ? devices["iPhone 13"] : devices["Pixel 7"]);
    let heldImage;
    await instance.route((url) => url.searchParams.get("url") === "/subject.webp" || url.pathname === "/subject.webp", (route) => { heldImage = route; });
    page = await instance.newPage();
    await page.goto(base, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.getElementById("portfolio-content")?.inert);
    await page.keyboard.press("Tab");
    assert(await page.getByRole("button", { name: "Skip intro" }).evaluate((element) => element === document.activeElement));
    await page.keyboard.press("Enter");
    await finished(page);
    await heldImage?.abort();
    await instance.close();
    console.log(`PASS: ${engine}: keyboard skip and content unlock`);

    instance = await context();
    heldImage = undefined;
    await instance.route((url) => url.searchParams.get("url") === "/subject.webp", (route) => { heldImage = route; });
    page = await instance.newPage();
    await page.goto(base, { waitUntil: "domcontentloaded" });
    await finished(page);
    await heldImage?.abort();
    await instance.close();
    console.log(`PASS: ${engine}: stalled image has a bounded wait`);

    for (const options of [{ reducedMotion: "reduce" }, { javaScriptEnabled: false }]) {
      instance = await context(options);
      page = await instance.newPage();
      await page.goto(base, { waitUntil: "domcontentloaded" });
      assert(await page.locator(".entry-screen").isHidden());
      assert(await page.locator("h1").isVisible());
      assert(!await page.locator("#portfolio-content").evaluate((element) => element.inert));
      await instance.close();
    }
    instance = await context();
    page = await instance.newPage();
    await page.goto(`${base}/#work`, { waitUntil: "domcontentloaded" });
    assert(await page.locator(".entry-screen").isHidden());
    await instance.close();
    console.log(`PASS: ${engine}: reduced motion, no JavaScript, and deep links bypass the intro`);

    instance = await context();
    await instance.route((url) => url.searchParams.get("url") === "/subject.webp", () => {});
    page = await instance.newPage();
    await page.goto(base, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.getElementById("portfolio-content")?.inert);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await finished(page);
    await instance.close();

    instance = await context();
    await instance.addInitScript(() => Object.defineProperty(window, "sessionStorage", { get() { throw new DOMException("Storage disabled", "SecurityError"); } }));
    page = await instance.newPage();
    await page.goto(base, { waitUntil: "domcontentloaded" });
    await finished(page);
    await instance.close();
    assert.deepEqual(errors, [], `${engine}: browser errors`);
    console.log(`PASS: ${engine}: live reduced-motion change, blocked storage, no runtime errors`);
  } finally {
    await browser.close();
  }
}
