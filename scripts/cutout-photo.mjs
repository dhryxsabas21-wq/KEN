/**
 * Turns a studio portrait on a plain light background into the hero's
 * cut-out subject: background removed, edges cleaned, cropped to a bust.
 *
 *   npm run cutout -- path/to/photo.jpg
 *
 * Writes public/subject.webp and prints the width/height to put in
 * `subject` in src/lib/content.ts. Uses your installed Chrome/Edge as
 * the image engine (canvas), so there is nothing extra to install.
 *
 * How it works, and why:
 *   1. Estimates the backdrop colour from the top and upper sides.
 *   2. Flood-fills the backdrop from the TOP, LEFT and RIGHT edges only.
 *      Not the bottom: a white shirt usually touches the bottom edge and
 *      would be eaten. Light areas not connected to those edges (shirt,
 *      collar, highlights) are kept.
 *   3. Edge pixels are part subject, part backdrop. For each one, the
 *      backdrop's share is solved for (alpha) and removed from its colour,
 *      so dark hair doesn't get a pale halo on a dark page.
 *   4. Crops to a portrait bust (head top to the bottom edge) and fades
 *      the shoulders where the frame cuts them.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";

const input = process.argv[2];
const output = process.argv[3] ?? join("public", "subject.webp");
if (!input || !existsSync(input)) {
  console.error("Usage: npm run cutout -- path/to/photo.jpg [output.webp]");
  process.exit(1);
}

const OUT_H = 900; // ≈ 2× the largest size it is shown at
const ASPECT = 0.8; // width / height of the bust crop

const browsers = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];
const executablePath = browsers.find((p) => p && existsSync(p));
if (!executablePath) {
  console.error("✗ No Chrome or Edge found. Set CHROME_PATH.");
  process.exit(1);
}

const mime = extname(input).toLowerCase() === ".png" ? "image/png" : "image/jpeg";
const b64 = readFileSync(input).toString("base64");

const browser = await chromium.launch({ executablePath, headless: true });
try {
  const page = await browser.newPage();
  const result = await page.evaluate(
    async ({ b64, mime, OUT_H, ASPECT }) => {
      const img = new Image();
      img.src = `data:${mime};base64,${b64}`;
      await img.decode();
      const W = img.naturalWidth;
      const H = img.naturalHeight;

      const src = document.createElement("canvas");
      src.width = W;
      src.height = H;
      const sg = src.getContext("2d", { willReadFrequently: true });
      sg.drawImage(img, 0, 0);
      const id = sg.getImageData(0, 0, W, H);
      const d = id.data;
      const N = W * H;

      /* 1. Backdrop colour */
      let r = 0, g = 0, b = 0, n = 0;
      const add = (x, y) => {
        const i = (y * W + x) * 4;
        r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
      };
      for (let x = 0; x < W; x += 3) { add(x, 1); add(x, 6); }
      for (let y = 0; y < H * 0.55; y += 3) { add(1, y); add(W - 2, y); }
      const B = [r / n, g / n, b / n];
      const distB = (k) => {
        const i = k * 4;
        return Math.hypot(d[i] - B[0], d[i + 1] - B[1], d[i + 2] - B[2]);
      };

      /* 2. Flood fill from top, left, right */
      const T = 30;
      const bg = new Uint8Array(N);
      const stack = [];
      const seed = (x, y) => {
        const k = y * W + x;
        if (!bg[k] && distB(k) <= T) { bg[k] = 1; stack.push(k); }
      };
      for (let x = 0; x < W; x++) seed(x, 0);
      for (let y = 0; y < H; y++) { seed(0, y); seed(W - 1, y); }
      while (stack.length) {
        const k = stack.pop();
        const x = k % W;
        const y = (k - x) / W;
        if (x > 0) seed(x - 1, y);
        if (x < W - 1) seed(x + 1, y);
        if (y > 0) seed(x, y - 1);
        if (y < H - 1) seed(x, y + 1);
      }

      /* Distance (in px, up to 8) from each subject pixel to the backdrop */
      const MAXD = 8;
      const dist = new Uint8Array(N).fill(255);
      let frontier = [];
      for (let k = 0; k < N; k++) if (bg[k]) { dist[k] = 0; frontier.push(k); }
      for (let step = 1; step <= MAXD; step++) {
        const next = [];
        for (const k of frontier) {
          const x = k % W;
          const y = (k - x) / W;
          const nb = [x > 0 && k - 1, x < W - 1 && k + 1, y > 0 && k - W, y < H - 1 && k + W];
          for (const m of nb) {
            if (m !== false && dist[m] === 255) { dist[m] = step; next.push(m); }
          }
        }
        frontier = next;
      }

      /* 3. Alpha and colour for edge pixels.
         The band is 6px wide: hair blends into the backdrop over several
         pixels, and JPEG ringing adds pale pixels beside dark edges, so a
         narrow band leaves a speckled halo. The true subject colour is
         sampled from deeper inside (more than MAXD px from the backdrop). */
      const alpha = new Float32Array(N);
      for (let k = 0; k < N; k++) alpha[k] = bg[k] ? 0 : 1;

      const BAND = 6;
      const R = 10;
      const sampleInterior = (x, y, minDist) => {
        let fr = 0, fg = 0, fb = 0, fn = 0;
        for (let yy = Math.max(0, y - R); yy <= Math.min(H - 1, y + R); yy += 2) {
          for (let xx = Math.max(0, x - R); xx <= Math.min(W - 1, x + R); xx += 2) {
            const m = yy * W + xx;
            if (dist[m] >= minDist) {
              const i = m * 4;
              fr += d[i]; fg += d[i + 1]; fb += d[i + 2]; fn++;
            }
          }
        }
        return fn ? [fr / fn, fg / fn, fb / fn] : null;
      };

      for (let k = 0; k < N; k++) {
        if (bg[k] || dist[k] > BAND) continue;
        const x = k % W;
        const y = (k - x) / W;
        // Prefer truly interior pixels; fall back for thin structures
        const F = sampleInterior(x, y, 255) ?? sampleInterior(x, y, 4);
        if (!F) continue;
        const i = k * 4;
        const P = [d[i], d[i + 1], d[i + 2]];
        const u = [B[0] - F[0], B[1] - F[1], B[2] - F[2]];
        const uu = u[0] * u[0] + u[1] * u[1] + u[2] * u[2];
        if (uu < 400) continue; // subject colour ≈ backdrop: keep opaque
        // Fraction of the way from subject colour to backdrop colour
        const t = ((P[0] - F[0]) * u[0] + (P[1] - F[1]) * u[1] + (P[2] - F[2]) * u[2]) / uu;
        // Slight choke: anything under ~8% coverage is backdrop residue
        const a = Math.min(1, Math.max(0, (1 - t - 0.08) / 0.92));
        alpha[k] = a;
        if (a > 0.02) {
          // Remove the backdrop's share from the colour (no pale halo),
          // and never let an edge pixel end up much lighter than the
          // subject right beside it — that's what reads as pale flecks
          // along dark hair.
          for (let c = 0; c < 3; c++) {
            const clean = (P[c] - (1 - a) * B[c]) / a;
            d[i + c] = Math.min(255, F[c] + 40, Math.max(0, clean));
          }
        }
      }

      // Soften the stair-steps: 3×3 average of alpha, on the subject's own
      // edge pixels only. Never on backdrop pixels — they still carry the
      // backdrop's colour, so giving them any opacity would draw a halo.
      const soft = alpha.slice();
      for (let k = 0; k < N; k++) {
        if (bg[k] || dist[k] > 2) continue;
        const x = k % W;
        const y = (k - x) / W;
        if (x === 0 || y === 0 || x === W - 1 || y === H - 1) continue;
        let s = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += alpha[k + dy * W + dx];
        soft[k] = s / 9;
      }
      for (let k = 0; k < N; k++) d[k * 4 + 3] = Math.round(soft[k] * 255);
      sg.putImageData(id, 0, 0);

      /* 4. Bust crop: from just above the head to the bottom edge */
      let top = 0;
      search: for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) if (!bg[y * W + x]) { top = y; break search; }
      }
      const cropY = Math.max(0, top - Math.round(H * 0.012));
      const cropH = H - cropY;
      const cropW = Math.min(W, Math.round(cropH * ASPECT));
      const cropX = Math.round((W - cropW) / 2);

      const outH = Math.min(OUT_H, cropH);
      const outW = Math.round(outH * (cropW / cropH));
      const out = document.createElement("canvas");
      out.width = outW;
      out.height = outH;
      const og = out.getContext("2d", { willReadFrequently: true });
      og.imageSmoothingQuality = "high";
      og.drawImage(src, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

      // Fade the shoulders where the crop cuts them
      const od = og.getImageData(0, 0, outW, outH);
      const fade = Math.round(outW * 0.1);
      for (let y = 0; y < outH; y++) {
        for (let x = 0; x < fade; x++) {
          const s = x / fade;
          const f = s * s * (3 - 2 * s); // smoothstep
          const li = (y * outW + x) * 4 + 3;
          const ri = (y * outW + (outW - 1 - x)) * 4 + 3;
          od.data[li] *= f;
          od.data[ri] *= f;
        }
      }
      og.putImageData(od, 0, 0);

      let bgCount = 0;
      for (let k = 0; k < N; k++) bgCount += bg[k];

      return {
        dataUrl: out.toDataURL("image/webp", 0.9),
        width: outW,
        height: outH,
        source: `${W}x${H}`,
        backdrop: B.map(Math.round),
        backdropRemovedPct: +((bgCount / N) * 100).toFixed(1),
        crop: { x: cropX, y: cropY, w: cropW, h: cropH },
      };
    },
    { b64, mime, OUT_H, ASPECT },
  );

  const bytes = Buffer.from(result.dataUrl.split(",")[1], "base64");
  writeFileSync(output, bytes);
  console.log(`✓ ${output} — ${result.width}×${result.height}, ${(bytes.length / 1024).toFixed(0)} KB`);
  console.log(`  source ${result.source}, backdrop rgb(${result.backdrop.join(", ")}), ${result.backdropRemovedPct}% removed`);
  console.log(`\n  In src/lib/content.ts set:\n    src: "/${output.replace(/\\/g, "/").replace(/^public\//, "")}", width: ${result.width}, height: ${result.height}`);
} finally {
  await browser.close();
}
