"use client";

import { useEffect, useRef } from "react";
import type * as THREE_NS from "three";

/**
 * WebGL background for the hero: a drift of paper forms, lit and
 * fogged, in real 3D. It is the visual counterpart of the headline —
 * software for places that still run on paper.
 *
 * Budget and safety:
 *   - three.js is imported dynamically, so it is a separate chunk that
 *     loads after the page has rendered and never blocks first paint.
 *   - Rendering pauses whenever the hero is off screen or the tab is
 *     hidden.
 *   - No WebGL? The renderer throws, we return, and the page is simply
 *     without the effect.
 *   - Changes to reduced motion pause/resume the loop immediately.
 */
export default function PaperField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    let disposed = false;
    let teardown: () => void = () => {};

    void (async () => {
      const THREE = await import("three");
      // React StrictMode mounts effects twice in development; the first
      // pass is already torn down by the time the import resolves.
      if (disposed) return;

      const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

      let renderer: THREE_NS.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
          powerPreference: "low-power",
        });
      } catch {
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      // Kept low: the paper is backdrop, and the cream wordmark in front
      // of it has to stay the brightest thing in the hero.
      renderer.toneMappingExposure = 0.8;

      const scene = new THREE.Scene();
      // Fog to the hero ground colour, so distant sheets dissolve into it.
      scene.fog = new THREE.Fog(new THREE.Color("#1f1c19"), 11, 25);

      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
      camera.position.set(0, 0, 14);

      scene.add(new THREE.HemisphereLight(0xfff0de, 0x15110e, 0.55));
      const key = new THREE.DirectionalLight(0xffe2c6, 1.55);
      key.position.set(-5, 7, 9);
      scene.add(key);
      // Copper rim light from low right — the accent colour, as light.
      const rim = new THREE.PointLight(0xe07a4b, 34, 28, 1.5);
      rim.position.set(7, -4, 5);
      scene.add(rim);

      // Deterministic pseudo-random, so the arrangement is the same on
      // every visit rather than reshuffling.
      let seed = 1337;
      const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      const textures = [0, 1, 2].map((variant) => {
        const tex = new THREE.CanvasTexture(drawSheet(variant, rand));
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = maxAniso;
        return tex;
      });

      const group = new THREE.Group();
      scene.add(group);

      type Sheet = {
        mesh: THREE_NS.Mesh;
        base: THREE_NS.Vector3;
        rot: THREE_NS.Euler;
        phase: number;
        speed: number;
      };
      const sheets: Sheet[] = [];
      const geometries: THREE_NS.BufferGeometry[] = [];
      const materials: THREE_NS.Material[] = [];

      const COUNT = 11;
      const W = 1.7;
      const H = W * 1.414; // A-series paper proportion

      for (let i = 0; i < COUNT; i++) {
        // Each sheet is gently curled, like paper that has been handled.
        const geo = new THREE.PlaneGeometry(W, H, 12, 16);
        const curl = 0.08 + rand() * 0.24;
        const wave = 0.03 + rand() * 0.05;
        const pos = geo.attributes.position;
        for (let v = 0; v < pos.count; v++) {
          const nx = pos.getX(v) / (W / 2);
          const y = pos.getY(v);
          pos.setZ(v, curl * nx * nx + wave * Math.sin(y * 1.7 + i));
        }
        geo.computeVertexNormals();
        geometries.push(geo);

        const mat = new THREE.MeshStandardMaterial({
          map: textures[i % textures.length],
          roughness: 0.9,
          metalness: 0,
          side: THREE.DoubleSide,
        });
        materials.push(mat);

        const mesh = new THREE.Mesh(geo, mat);

        // The canvas box itself already excludes the copy (see
        // .paper-field), so sheets can spread across all of it.
        const x = (rand() - 0.5) * 7;
        const y = (rand() - 0.5) * 7.2;
        const z = -8 + rand() * 9.5;
        mesh.position.set(x, y, z);
        mesh.rotation.set((rand() - 0.5) * 1.0, (rand() - 0.5) * 1.4, (rand() - 0.5) * 0.9);

        group.add(mesh);
        sheets.push({
          mesh,
          base: mesh.position.clone(),
          rot: mesh.rotation.clone(),
          phase: rand() * Math.PI * 2,
          speed: 0.22 + rand() * 0.3,
        });
      }

      /* ── Sizing ── */
      const resize = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        if (w === 0 || h === 0) return;
        const compact = window.innerWidth < 1024;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.5 : 1.75));
        sheets.forEach((sheet, index) => { sheet.mesh.visible = !compact || index < 7; });
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(() => {
        resize();
      });
      ro.observe(host);

      /* ── Inputs ── */
      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const onPointer = (e: PointerEvent) => {
        if (motionPreference.matches || !finePointer.matches || e.pointerType === "touch") return;
        pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onPointer, { passive: true });
      const resetPointer = () => { pointer.tx = pointer.ty = 0; };
      finePointer.addEventListener("change", resetPointer);

      // Progress through the whole hero, not just this canvas's box
      // (which is only the bottom band on small screens).
      const section = host.closest("section") ?? host;
      const scrollProgress = () => {
        const travel = Math.max(section.offsetHeight, 1);
        return Math.min(Math.max(window.scrollY / travel, 0), 1);
      };

      /* ── Frame ── */
      let elapsed = 0;
      const frame = (delta: number) => {
        elapsed += delta / 1000;
        const t = elapsed;
        const p = scrollProgress();

        const ease = 1 - Math.exp(-delta / 325);
        pointer.x += (pointer.tx - pointer.x) * ease;
        pointer.y += (pointer.ty - pointer.y) * ease;

        // The whole field turns toward the pointer; scrolling lifts it
        // and draws the sheets toward the camera.
        group.rotation.y = pointer.x * 0.32 + p * 0.25;
        group.rotation.x = pointer.y * 0.18;
        group.position.y = p * 2.6;

        for (const s of sheets) {
          s.mesh.position.y = s.base.y + Math.sin(t * s.speed + s.phase) * 0.2;
          s.mesh.position.z = s.base.z + p * 4.5;
          s.mesh.rotation.x = s.rot.x + Math.sin(t * s.speed * 0.8 + s.phase) * 0.14;
          s.mesh.rotation.y = s.rot.y + Math.sin(t * s.speed * 0.55 + s.phase) * 0.24;
          s.mesh.rotation.z = s.rot.z + Math.sin(t * s.speed * 0.4 + s.phase) * 0.08;
        }

        renderer.render(scene, camera);
      };

      /* ── Run only while visible ── */
      let raf = 0;
      let inView = false;
      let previousTime = 0;
      const loop = (time: number) => {
        frame(previousTime ? time - previousTime : 0);
        previousTime = time;
        // Fade in only after rendering, including when motion is re-enabled.
        canvas.style.opacity = "1";
        raf = requestAnimationFrame(loop);
      };
      const start = () => {
        if (!raf && inView && !document.hidden && !motionPreference.matches) {
          raf = requestAnimationFrame(loop);
        }
      };
      const stop = () => {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        previousTime = 0;
      };

      const io = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView) start();
        else stop();
      });
      io.observe(host);

      const onVisibility = () => (document.hidden ? stop() : start());
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("pageshow", onVisibility);
      const onMotion = () => {
        if (motionPreference.matches) stop();
        else { resize(); start(); }
      };
      motionPreference.addEventListener("change", onMotion);

      function dispose() {
        geometries.forEach((g) => g.dispose());
        materials.forEach((m) => m.dispose());
        textures.forEach((t) => t.dispose());
        renderer.dispose();
      }

      teardown = () => {
        stop();
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("pageshow", onVisibility);
        window.removeEventListener("pointermove", onPointer);
        finePointer.removeEventListener("change", resetPointer);
        motionPreference.removeEventListener("change", onMotion);
        dispose();
      };
    })();

    return () => {
      disposed = true;
      teardown();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 block h-full w-full opacity-0 transition-opacity duration-[1400ms]"
    />
  );
}

/**
 * Paints one sheet of paper onto a 2D canvas, used as a texture.
 * Three layouts — a form, a ruled ledger, a record grid — in the same
 * cream, ink and copper as the page.
 */
function drawSheet(variant: number, rand: () => number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 724;
  const g = c.getContext("2d");
  if (!g) return c;

  const PAPER = "#d6ccba"; // mid-tan, deliberately darker than the cream type
  const INK = "#2f2924";
  const RULE = "#bdb19e";
  const FAINT = "#d3c9b8";
  const COPPER = "#c8663a";
  const M = 42;

  g.fillStyle = PAPER;
  g.fillRect(0, 0, c.width, c.height);

  // Fibre grain
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(90, 70, 50, ${rand() * 0.05})`;
    g.fillRect(rand() * c.width, rand() * c.height, 1.5, 1.5);
  }

  // Header: copper tab, title, and a reference number
  g.fillStyle = COPPER;
  g.fillRect(M, M, 64, 9);
  g.fillStyle = INK;
  g.font = "600 22px ui-monospace, Menlo, Consolas, monospace";
  g.fillText(["FORM", "LEDGER", "RECORD"][variant], M, M + 46);
  g.fillStyle = "#8a7f70";
  g.font = "500 13px ui-monospace, Menlo, Consolas, monospace";
  g.fillText(`NO. ${String(100 + Math.floor(rand() * 899))}`, c.width - M - 72, M + 46);

  g.strokeStyle = INK;
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(M, M + 62);
  g.lineTo(c.width - M, M + 62);
  g.stroke();

  const bar = (x: number, y: number, w: number, h = 7, color = FAINT) => {
    g.fillStyle = color;
    g.fillRect(x, y, w, h);
  };

  if (variant === 0) {
    // A form: labelled fields and checkboxes
    let y = M + 100;
    for (let i = 0; i < 7; i++) {
      bar(M, y, 70 + rand() * 50, 6, "#9c907e");
      g.strokeStyle = RULE;
      g.lineWidth = 1.5;
      g.strokeRect(M, y + 14, c.width - 2 * M, 34);
      bar(M + 12, y + 28, 60 + rand() * 180, 7, "#cdbfa9");
      y += 70;
    }
    for (let i = 0; i < 3; i++) {
      g.strokeStyle = INK;
      g.lineWidth = 1.5;
      g.strokeRect(M, y + i * 26, 14, 14);
      bar(M + 26, y + i * 26 + 4, 110 + rand() * 120, 6, "#a99d8a");
    }
  } else if (variant === 1) {
    // A ruled ledger with a margin rule and entries
    g.strokeStyle = COPPER;
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(M + 54, M + 74);
    g.lineTo(M + 54, c.height - M);
    g.stroke();
    for (let y = M + 100; y < c.height - M; y += 28) {
      g.strokeStyle = FAINT;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(M, y);
      g.lineTo(c.width - M, y);
      g.stroke();
      if (rand() > 0.2) bar(M + 66, y - 13, 80 + rand() * 230, 6, "#b3a690");
      if (rand() > 0.5) bar(c.width - M - 60, y - 13, 46, 6, "#9c907e");
    }
  } else {
    // A record grid
    const cols = 4;
    const top = M + 96;
    const rowH = 36;
    const colW = (c.width - 2 * M) / cols;
    for (let r = 0; r < 14; r++) {
      for (let k = 0; k < cols; k++) {
        g.strokeStyle = RULE;
        g.lineWidth = 1;
        g.strokeRect(M + k * colW, top + r * rowH, colW, rowH);
        if (r === 0) bar(M + k * colW + 10, top + 14, colW - 40, 7, "#7d7262");
        else if (rand() > 0.25) bar(M + k * colW + 10, top + r * rowH + 14, (colW - 24) * (0.3 + rand() * 0.6), 6, "#c4b7a2");
      }
    }
  }

  // Signature line
  g.strokeStyle = INK;
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(c.width - M - 170, c.height - M - 8);
  g.lineTo(c.width - M, c.height - M - 8);
  g.stroke();

  return c;
}
