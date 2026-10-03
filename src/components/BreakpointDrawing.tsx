import { breakpoints } from "@/lib/content";

/**
 * The breakpoint ladder, drawn strictly to scale.
 *
 * One SVG user unit = SCALE CSS pixels, and every bar is exactly
 * widthPx / SCALE units long — nothing is nudged for looks.
 *
 * The SVG itself is then stretched to its column, so "1 unit = 4px"
 * stops being literally true on screen. The honest way to state scale
 * on a drawing that can be resized is a SCALE BAR, which is drawn in
 * the same units and so stays correct at any size.
 *
 * Geometry lives in the SVG; labels are HTML. SVG text scales with the
 * drawing, which put the labels at ~5.7px on a phone.
 */
const SCALE = 4;
const SCALE_BAR_PX = 100;

const X0 = 24;
const MAX_W = Math.max(...breakpoints.map((b) => b.widthPx)) / SCALE;
const LEAD = 22;
const W = X0 + MAX_W + LEAD;

const Y0 = 34;
const ROW_H = 62;
const rowY = (i: number) => Y0 + i * ROW_H;
const SCALE_Y = rowY(breakpoints.length - 1) + 54;
const H = SCALE_Y + 18;

const SB_X2 = W - 1;
const SB_X1 = SB_X2 - SCALE_BAR_PX / SCALE;

/** Strokes stay at true screen-pixel weight however the SVG scales. */
const NS = { vectorEffect: "non-scaling-stroke" } as const;

export default function BreakpointDrawing() {
  return (
    <figure className="m-0 [transform-style:preserve-3d]">
      <div className="flex items-stretch [transform-style:preserve-3d]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto min-w-0 flex-1"
          style={{ aspectRatio: `${W} / ${H}` }}
          role="img"
          aria-label={`Breakpoint ladder drawn to scale: ${breakpoints
            .map((b) => `${b.name} at ${b.widthPx} pixels`)
            .join(", ")}.`}
        >
          {/* ── Hairline construction geometry ── */}
          <g stroke="rgba(237,230,218,0.2)" strokeWidth="1" fill="none">
            {/* Origin axis */}
            <line x1={X0} y1={6} x2={X0} y2={SCALE_Y - 20} {...NS} />
            {/* A vertical datum at each measured width */}
            {breakpoints.map((b) => {
              const x = X0 + b.widthPx / SCALE;
              return (
                <line
                  key={`datum-${b.name}`}
                  x1={x}
                  y1={6}
                  x2={x}
                  y2={SCALE_Y - 20}
                  strokeDasharray="3 5"
                  {...NS}
                />
              );
            })}
          </g>

          {/* ── The drawing's own line — heavier, so it can't be read as
                 one more leader ── */}
          <g stroke="#ede6da" strokeWidth="1.75" data-part="bars" fill="none" strokeLinecap="square">
            {breakpoints.map((b, i) => {
              const y = rowY(i);
              const xe = X0 + b.widthPx / SCALE;
              return (
                <g key={`bar-${b.name}`}>
                  <line x1={X0} y1={y} x2={xe} y2={y} {...NS} />
                  <line x1={X0} y1={y - 8} x2={X0} y2={y + 8} {...NS} />
                  <line x1={xe} y1={y - 8} x2={xe} y2={y + 8} {...NS} />
                </g>
              );
            })}
          </g>

          {/* ── Thin leaders from each terminus out to its label ── */}
          <g stroke="rgba(237,230,218,0.34)" strokeWidth="0.75" fill="none">
            {breakpoints.map((b, i) => {
              const y = rowY(i);
              const xe = X0 + b.widthPx / SCALE;
              return (
                <line key={`lead-${b.name}`} x1={xe + 5} y1={y} x2={W} y2={y} {...NS} />
              );
            })}
          </g>

          {/* ── Pigment markers. A near-zero-length path with a square cap
                 and a non-scaling stroke draws a 6×6 screen-pixel square at
                 every size, where a <rect> would shrink to 2px on a phone. ── */}
          <g stroke="#e07a4b" strokeWidth="6" strokeLinecap="square">
            {breakpoints.map((b, i) => {
              const xe = X0 + b.widthPx / SCALE;
              return (
                <path
                  key={`marker-${b.name}`}
                  d={`M${xe} ${rowY(i)} l0.001 0`}
                  {...NS}
                />
              );
            })}
          </g>

          {/* ── Scale bar: SCALE_BAR_PX CSS pixels in drawing units, set
                 against the right edge so it sits beside its label ── */}
          <g stroke="#ede6da" strokeWidth="1.25" data-part="scale-bar" fill="none">
            {/* Both ends inset by the same 1 unit (to keep the end tick
                inside the viewBox), so the bar is exactly SCALE_BAR_PX /
                SCALE units long. */}
            <line x1={SB_X1} y1={SCALE_Y} x2={SB_X2} y2={SCALE_Y} {...NS} />
            <line x1={SB_X1} y1={SCALE_Y - 5} x2={SB_X1} y2={SCALE_Y + 5} {...NS} />
            <line x1={SB_X2} y1={SCALE_Y - 5} x2={SB_X2} y2={SCALE_Y + 5} {...NS} />
          </g>
        </svg>

        {/* Labels, on the same row centres as the bars — lifted 24px off
            the drawing's plane so they float above it while it tilts.
            No scale compensation on purpose: Tilt3D removes its
            perspective when it comes to rest, and at that point a
            compensating scale() would shrink the labels off their rows. */}
        <div
          className="relative w-[124px] shrink-0 sm:w-[150px]"
          style={{ transform: "translateZ(24px)" }}
          aria-hidden="true"
        >
          {breakpoints.map((b, i) => (
            <div
              key={`label-${b.name}`}
              className="absolute left-2 right-0 -translate-y-1/2"
              style={{ top: `${(rowY(i) / H) * 100}%` }}
            >
              <p className="label whitespace-nowrap font-semibold text-ink">
                {b.name} · {b.widthPx}px
              </p>
              <p className="label mt-0.5 whitespace-nowrap text-[9.5px] text-muted">
                {b.note}
              </p>
            </div>
          ))}

          <p
            className="label absolute left-2 -translate-y-1/2 whitespace-nowrap text-muted"
            style={{ top: `${(SCALE_Y / H) * 100}%` }}
          >
            = {SCALE_BAR_PX} css px
          </p>
        </div>
      </div>

      <figcaption className="label mt-5 text-muted">
        Fig. 01 — Viewport widths, to scale
      </figcaption>
    </figure>
  );
}
