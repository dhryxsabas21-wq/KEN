"use client";

import { useEffect, useRef } from "react";
import { profile } from "@/lib/content";

export default function EntryLoader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("entry-active")) return;

    const shell = document.getElementById("portfolio-content");
    const screen = ref.current;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const controller = new AbortController();
    const started = performance.now();
    let done = false;
    let leaving = false;
    let readyTimer = 0;
    let minimumTimer: number | undefined;
    let exitTimer: number | undefined;

    if (shell) {
      shell.inert = true;
      shell.setAttribute("aria-busy", "true");
    }

    const complete = () => {
      if (done) return;
      done = true;
      controller.abort();
      window.clearTimeout(readyTimer);
      window.clearTimeout(minimumTimer);
      window.clearTimeout(exitTimer);
      const failsafe = (window as Window & { __entryFailsafe?: number }).__entryFailsafe;
      window.clearTimeout(failsafe);
      root.classList.remove("entry-active", "entry-leaving");
      if (shell) {
        shell.inert = false;
        shell.removeAttribute("aria-busy");
      }
      try { sessionStorage.setItem("pronto:entry-seen", "1"); } catch { /* Storage is optional. */ }
      window.dispatchEvent(new Event("portfolio:entry-complete"));
    };

    const finish = () => {
      if (done || leaving || controller.signal.aborted) return;
      if (preference.matches || !root.classList.contains("entry-active")) {
        complete();
        return;
      }
      leaving = true;
      root.classList.add("entry-leaving");
      exitTimer = window.setTimeout(complete, 600);
    };

    const options = { signal: controller.signal };
    screen?.addEventListener("transitionend", (event) => {
      if (event.target === screen && event.propertyName === "transform") complete();
    }, options);
    screen?.querySelector("button")?.addEventListener("click", complete, options);
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") complete();
    }, options);
    preference.addEventListener("change", () => { if (preference.matches) complete(); }, options);
    window.addEventListener("portfolio:entry-complete", () => {
      if (!root.classList.contains("entry-active")) complete();
    }, options);

    if (preference.matches) {
      complete();
      return;
    }

    const photo = document.querySelector<HTMLImageElement>(".portrait-img");
    const imageReady = !photo || photo.complete ? Promise.resolve() : new Promise<void>((resolve) => {
      photo.addEventListener("load", () => resolve(), { ...options, once: true });
      photo.addEventListener("error", () => resolve(), { ...options, once: true });
    });
    const fontsReady = document.fonts.ready.catch(() => undefined);
    void Promise.all([imageReady, fontsReady]).then(() => {
      if (done || leaving || controller.signal.aborted) return;
      minimumTimer = window.setTimeout(finish, Math.max(0, 600 - (performance.now() - started)));
    });
    // A slow asset never holds the visitor on the intro indefinitely.
    readyTimer = window.setTimeout(finish, 1800);
    return () => {
      controller.abort();
      window.clearTimeout(readyTimer);
      window.clearTimeout(minimumTimer);
      window.clearTimeout(exitTimer);
      if (shell) {
        shell.inert = false;
        shell.removeAttribute("aria-busy");
      }
      // StrictMode replays effects without removing the screen. A real
      // navigation removes it, and must also release the document lock.
      queueMicrotask(() => { if (!document.querySelector("[data-entry-loader]")) complete(); });
    };
  }, []);

  return (
    <div ref={ref} className="entry-screen no-print" data-entry-loader>
      <div aria-hidden="true" className="entry-grid" />
      <div className="entry-topline" aria-hidden="true">
        <span className="display">{profile.shortMark}<span className="text-pigment">.</span></span>
        <span className="label text-muted">Independent developer</span>
      </div>
      <div className="entry-center">
        <div className="entry-emblem" aria-hidden="true">
          <span className="entry-emblem-back" />
          <svg viewBox="0 0 128 128" fill="none">
            <path d="M16 1H1V16M112 1H127V16M127 112V127H112M16 127H1V112" />
          </svg>
          <span className="display">KP<span className="text-pigment">.</span></span>
        </div>
        <p className="display entry-title">A little <em className="display-em">perspective.</em></p>
        <p className="label entry-status" role="status" aria-live="polite">Opening the portfolio</p>
        <div className="entry-track" aria-hidden="true"><span /></div>
      </div>
      <div className="entry-bottomline">
        <p className="label text-muted">{profile.firstName} {profile.lastName}<span className="entry-bottom-detail"> · Web & desktop development</span></p>
        <button type="button" data-entry-skip className="entry-skip label">Skip intro <span aria-hidden="true">↗</span></button>
      </div>
    </div>
  );
}
