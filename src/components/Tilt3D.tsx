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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const usePointer = mode === "pointer" && finePointer;

    let rx = 0;
    let ry = 0;
    let trx = 0;
    let try_ = 0;
    let raf = 0;

    const apply = () => {
      el.style.transform = `perspective(${perspective}px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`;
    };

    // Ease toward the target; stop the loop once settled.
    const tick = () => {
      rx += (trx - rx) * 0.12;
      ry += (try_ - ry) * 0.12;
      apply();
      if (Math.abs(trx - rx) > 0.01 || Math.abs(try_ - ry) > 0.01) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        // Settled flat: drop the transform entirely, so the box is back
        // to its exact untransformed geometry with no residual perspective.
        if (trx === 0 && try_ === 0) el.style.transform = "";
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    if (usePointer) {
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        trx = -py * max * 2;
        try_ = px * max * 2;
        kick();
      };
      const onLeave = () => {
        trx = 0;
        try_ = 0;
        kick();
      };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        cancelAnimationFrame(raf);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    }

    // Scroll-driven: tilted back while below the middle of the screen,
    // flat as it crosses the middle, tilted forward above it.
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const offset = (r.top + r.height / 2 - vh / 2) / (vh / 2);
      trx = Math.max(-1, Math.min(1, offset)) * max;
      try_ = 0;
      kick();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [max, mode, perspective]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transformStyle: "preserve-3d",
        transformOrigin,
        willChange: "transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
