"use client";

import { useEffect } from "react";

/**
 * Reveal controller.
 *
 * The `.anim` class is added by an inline script in the document head
 * (see layout.tsx) so nothing flashes in before being hidden. That
 * script also arms a failsafe timer: if this component never mounts,
 * the class is dropped and every block becomes visible. Hidden-forever
 * content is a far worse failure than a missing animation.
 *
 * Two populations:
 *
 *   [data-eager]  Already on screen at load (hero copy, wordmark,
 *                 subject). Revealed on the next frame, never tracked.
 *
 *   the rest      Bound to scroll POSITION, not to intersection
 *                 events: anything whose top is above the reveal line
 *                 is shown — including everything already scrolled
 *                 past. An IntersectionObserver only reports what was
 *                 on screen at a rendered frame, so a fast fling, a nav
 *                 jump or a slow device can skip a block entirely and
 *                 leave it invisible. Position can't be skipped.
 */
export default function Reveal() {
  useEffect(() => {
    const root = document.documentElement;

    const failsafe = (window as unknown as { __revealFailsafe?: number })
      .__revealFailsafe;
    if (failsafe) clearTimeout(failsafe);

    // The head script decided against animating (reduced motion):
    // nothing is hidden, nothing to do.
    if (!root.classList.contains("anim")) return;

    const show = (el: Element) => el.setAttribute("data-shown", "true");

    const eager = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal][data-eager]"),
    );
    const raf = requestAnimationFrame(() => eager.forEach(show));

    let pending = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-eager])"),
    );

    let frame = 0;

    const check = () => {
      frame = 0;
      // The line a block's top must cross: 8% above the bottom edge.
      const line = window.innerHeight * 0.92;

      // All reads first, then all writes — no layout thrash.
      const due: HTMLElement[] = [];
      const still: HTMLElement[] = [];
      for (const el of pending) {
        (el.getBoundingClientRect().top < line ? due : still).push(el);
      }
      due.forEach(show);
      pending = still;

      if (pending.length === 0) detach();
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    const detach = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    const raf2 = requestAnimationFrame(check);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(raf2);
      if (frame) cancelAnimationFrame(frame);
      detach();
    };
  }, []);

  return null;
}
