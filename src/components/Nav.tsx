"use client";

import { useEffect, useState } from "react";
import { nav, profile } from "@/lib/content";

export default function Nav() {
  const [current, setCurrent] = useState<string | null>(null);

  // Mark the section occupying the reading band.
  useEffect(() => {
    const targets = nav
      .map((n) => document.getElementById(n.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) ratios.set(entry.target.id, entry.intersectionRatio);
          else ratios.delete(entry.target.id);
        }
        let best: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        setCurrent(best);
      },
      { rootMargin: "-25% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <a
        href="#main"
        className="label sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-4 focus:z-[90] focus:bg-pigment focus:px-4 focus:py-3 focus:text-ground"
      >
        Skip to content
      </a>

      <header
        className="fixed inset-x-0 top-0 z-50 h-[60px] border-b border-hair"
        style={{
          backgroundColor: "rgb(24 22 20 / 0.78)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div className="mx-auto flex h-full max-w-[1340px] items-center justify-between px-6 lg:px-10">
          <a href="#top" className="display text-[19px] leading-none text-ink">
            {profile.shortMark}
            <span className="text-pigment">.</span>
          </a>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    data-current={current === item.id}
                    aria-current={current === item.id ? "true" : undefined}
                    className="navlink label text-ink-2 transition-colors hover:text-ink"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a href="#close" className="btn btn-pigment h-[38px] min-h-[38px] md:h-[40px]">
            Get in touch
          </a>
        </div>
      </header>

      {/* Mobile section links sit below the bar rather than behind a
          toggle — four items do not need a dialog. */}
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 top-[60px] z-40 border-b border-hair md:hidden"
        style={{
          backgroundColor: "rgb(24 22 20 / 0.78)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <ul className="flex h-[52px] items-center justify-between px-6">
          {nav.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                data-current={current === item.id}
                aria-current={current === item.id ? "true" : undefined}
                className="navlink label flex min-h-[32px] items-center text-ink-2"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
