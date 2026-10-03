/**
 * Generates public/resume.pdf from the /resume page, so the PDF is
 * always the same document as the web version.
 *
 *   1. Start the site:     npm run dev
 *   2. In a second shell:  npm run resume:pdf
 *
 * Optional: pass a base URL (npm run resume:pdf -- http://localhost:4000)
 * or set CHROME_PATH if Chrome/Edge is installed somewhere unusual.
 *
 * Refuses to write the file if the résumé runs past one A4 page.
 */
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";

const base = (process.argv[2] ?? process.env.RESUME_URL ?? "http://localhost:3000").replace(/\/$/, "");

const browsers = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];
const executablePath = browsers.find((p) => p && existsSync(p));
if (!executablePath) {
  console.error("✗ No Chrome or Edge found. Set CHROME_PATH to your browser's executable.");
  process.exit(1);
}

const browser = await chromium.launch({ executablePath, headless: true });
try {
  const page = await browser.newPage();
  const res = await page.goto(`${base}/resume`, { waitUntil: "networkidle" }).catch(() => null);
  if (!res || !res.ok()) {
    console.error(`✗ Couldn't load ${base}/resume — is the site running? (npm run dev)`);
    process.exitCode = 1;
  } else {
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: "print" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true, // accessible PDF: headings and lists survive
    });

    // Count page objects ("/Type /Page", not "/Type /Pages").
    const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
    if (pages !== 1) {
      console.error(`✗ The résumé is ${pages} pages. Trim src/lib/resume.ts to fit one A4 page.`);
      process.exitCode = 1;
    } else {
      const out = join(process.cwd(), "public", "resume.pdf");
      writeFileSync(out, pdf);
      console.log(`✓ public/resume.pdf — 1 page, ${(pdf.length / 1024).toFixed(0)} KB`);
    }
  }
} finally {
  await browser.close();
}
