"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Maximum tilt in degrees. */
  max?: number;
  /**
   * "pointer": follow the pointer on mouse/trackpad devices, and fall
   *            back to scroll position on touch screens.
   * "scroll":  always driven by the element's position in the viewport.
   */
  mode?: "pointer" | "scroll";
  /** Perspective distance in px. Smaller = more dramatic. */
  perspective?: number;
  transformOrigin?: string;
};

/**
 * Turns its box into a 3D plane. Children are in the same 3D rendering
 * context (preserve-3d), so any child given a translateZ floats above
 * or sinks below the plane and shears against it as it tilts.
 *
 * Writes the transform straight to the DOM inside rAF — no React state
 * per frame. Does nothing under prefers-reduced-motion.
 */
export default function Tilt3D({
  children,
  className,
  style,
  max = 8,
  mode = "pointer",
  perspective = 1000,
  transformOrigin = "50% 50%",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let usePointer = mode === "pointer" && finePointer.matches;
    let inView = false;
    let dirty = true;
    let lastTime = 0;

    let rx = 0;
    let ry = 0;
    let trx = 0;
    let try_ = 0;
    let raf = 0;

    const apply = () => {
      el.style.transform = `perspective(${perspective}px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`;
      el.style.setProperty("--light-x", `${50 + ry * 4}%`);
      el.style.setProperty("--light-y", `${35 - rx * 4}%`);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      lastTime = 0;
      el.style.removeProperty("will-change");
    };
    const reset = () => {
      stop();
      rx = ry = trx = try_ = 0;
      el.style.transform = "";
      el.style.removeProperty("--light-x");
      el.style.removeProperty("--light-y");
    };

    // Layout coordinates do not include our transform (or a parent's reveal).
    // Reading a transformed bounding box here creates feedback while scrolling.
    const layoutPosition = () => {
      let top = 0;
      let left = 0;
      for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) {
        top += node.offsetTop;
        left += node.offsetLeft;
      }
      return { top: top - window.scrollY, left: left - window.scrollX };
    };
    const scrollTarget = () => {
      const viewport = window.visualViewport;
      const height = viewport?.height ?? window.innerHeight;
      const center = (viewport?.offsetTop ?? 0) + height / 2;
      const offset = Math.max(-1, Math.min(1, (layoutPosition().top + el.offsetHeight / 2 - center) / (height / 2)));
      trx = offset * max;
      // Give touch screens the same depth and moving light as pointer input.
      try_ = mode === "pointer" ? -offset * max * 0.4 : 0;
    };

    // Ease toward the target; stop the loop once settled.
    const tick = (time: number) => {
      if (dirty && !usePointer) scrollTarget();
      dirty = false;
      // Same easing duration on 60 Hz, 90 Hz and 120 Hz screens.
      const delta = lastTime ? time - lastTime : 1000 / 60;
      lastTime = time;
      const ease = 1 - Math.exp(-delta / 130);
      rx += (trx - rx) * ease;
      ry += (try_ - ry) * ease;
      apply();
      if (Math.abs(trx - rx) > 0.01 || Math.abs(try_ - ry) > 0.01) {
        raf = requestAnimationFrame(tick);
      } else {
        stop();
        // Settled flat: drop the transform entirely, so the box is back
        // to its exact untransformed geometry with no residual perspective.
        if (trx === 0 && try_ === 0) el.style.transform = "";
      }
    };
    const kick = () => {
      if (!raf && inView && !document.hidden && !motionPreference.matches) {
        el.style.willChange = "transform";
        raf = requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      dirty = true;
      if (!usePointer) kick();
    };
    const onMove = (event: PointerEvent) => {
      if (mode !== "pointer" || motionPreference.matches) return;
      usePointer = event.pointerType !== "touch" && finePointer.matches;
      if (!usePointer) {
        onScroll();
        return;
      }
      const position = layoutPosition();
      const px = Math.max(-0.5, Math.min(0.5, (event.clientX - position.left) / el.offsetWidth - 0.5));
      const py = Math.max(-0.5, Math.min(0.5, (event.clientY - position.top) / el.offsetHeight - 0.5));
      trx = -py * max * 2;
      try_ = px * max * 2;
      kick();
    };
    const onLeave = () => {
      if (!usePointer) return;
      trx = try_ = 0;
      kick();
    };
    const onPreference = () => {
      reset();
      usePointer = mode === "pointer" && finePointer.matches;
      onScroll();
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else { dirty = true; kick(); }
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) { dirty = true; kick(); }
      else stop();
    });
    observer.observe(el);
    const resize = new ResizeObserver(onScroll);
    resize.observe(el);
    el.addEventListener("pointerdown", onMove, { passive: true });
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointercancel", onLeave);
    motionPreference.addEventListener("change", onPreference);
    finePointer.addEventListener("change", onPreference);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.visualViewport?.addEventListener("resize", onScroll, { passive: true });
    window.visualViewport?.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onVisibility);
    return () => {
      reset();
      observer.disconnect();
      resize.disconnect();
      el.removeEventListener("pointerdown", onMove);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointercancel", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
      window.visualViewport?.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onVisibility);
      motionPreference.removeEventListener("change", onPreference);
      finePointer.removeEventListener("change", onPreference);
    };
  }, [max, mode, perspective]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transformStyle: "preserve-3d",
        transformOrigin,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
