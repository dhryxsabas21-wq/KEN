"use client";

import { useEffect, useState } from "react";
import { nav, profile } from "@/lib/content";

export default function Nav() {
  const [current, setCurrent] = useState<string | null>(null);

  // Follow section positions, including long sections and anchor jumps.
  useEffect(() => {
    const targets = nav
      .map((n) => document.getElementById(n.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const marker = (window.innerWidth < 1024 ? 112 : 60) + 80;
      let active: string | null = null;
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= marker) active = target.id;
      }
      if ((document.getElementById("close")?.getBoundingClientRect().top ?? Infinity) <= marker) active = null;
      setCurrent(active);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
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
          <a href="#top" aria-label={`${profile.firstName} ${profile.lastName} — home`} className="display flex min-h-11 items-center text-[24px] leading-none text-ink">
            {profile.shortMark}
            <span className="text-pigment">.</span>
          </a>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    data-current={current === item.id}
                    aria-current={current === item.id ? "location" : undefined}
                    className="navlink label inline-flex min-h-11 items-center text-ink-2 transition-colors hover:text-ink"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a href="#close" className="btn btn-pigment min-h-11">
            Get in touch
          </a>
        </div>
      </header>

      {/* Mobile section links sit below the bar rather than behind a
          toggle — four items do not need a dialog. */}
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 top-[60px] z-40 border-b border-hair lg:hidden"
        style={{
          backgroundColor: "rgb(24 22 20 / 0.78)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <ul className="flex h-[52px] items-center justify-between px-6">
          {nav.filter((item) => ["work", "services", "about"].includes(item.id)).map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                data-current={current === item.id}
                aria-current={current === item.id ? "location" : undefined}
                className="navlink label flex min-h-11 items-center px-2 text-ink-2"
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
