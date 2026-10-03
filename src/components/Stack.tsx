"use client";

import { useState } from "react";
import { stack, type Tech } from "@/lib/content";

function Tile({ tech, order }: { tech: Tech; order: number }) {
  const [pinned, setPinned] = useState(false);

  return (
    <li
      data-reveal
      style={{ "--reveal-delay": `${(order % 4) * 70}ms` } as React.CSSProperties}
    >
      <button
        type="button"
        className="tile"
        aria-pressed={pinned}
        onClick={() => setPinned((p) => !p)}
      >
        <span className="tile-inner">
          {/* Front */}
          <span className="tile-face">
            <span className="flex items-start justify-between">
              <span className="label text-muted">{tech.category}</span>
              <span aria-hidden="true" className="h-1.5 w-1.5 bg-pigment" />
            </span>
            <span
              aria-hidden="true"
              className="display extrude block text-[64px] leading-none text-ink"
            >
              {tech.mark}
            </span>
            <span className="label-lg label block text-ink">{tech.name}</span>
          </span>

          {/* Back */}
          <span className="tile-face tile-back">
            <span className="label text-pigment">Used for</span>
            <span className="copy block text-ink">{tech.usedFor}</span>
            <span className="label block text-muted">{tech.name}</span>
          </span>
        </span>
      </button>
    </li>
  );
}

export default function Stack() {
  return (
    <section id="stack" className="hair-t scroll-mt-[60px] py-24 lg:py-32">
      <div className="mx-auto max-w-[1340px] px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p data-reveal className="label text-pigment">
              03 — Stack
            </p>
            <h2
              data-reveal
              className="display mt-6 max-w-[22ch] text-[clamp(28px,3.6vw,48px)] text-ink"
              style={{ "--reveal-delay": "70ms" } as React.CSSProperties}
            >
              Languages, frameworks and the <em className="display-em">tools</em>{" "}
              behind them.
            </h2>
          </div>
          <p
            data-reveal
            className="label text-muted"
            style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
          >
            <span className="max-md:hidden">Hover</span>
            <span className="md:hidden">Tap</span> a tile to see where it&apos;s used
          </p>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {stack.map((tech, i) => (
            <Tile key={tech.name} tech={tech} order={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
