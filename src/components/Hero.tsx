import { contact, profile } from "@/lib/content";
import PaperField from "./PaperField";
import Portrait from "./Portrait";

/**
 * Two columns, vertically centred on each other: the copy (with the
 * name as a real, fully readable heading) on the left, the framed
 * portrait on the right. Stacked on screens under 1024px.
 *
 * Behind the portrait, a WebGL field of paper drifts in fog — boxed so
 * it can never sit behind text (see .paper-field in globals.css).
 */
export default function Hero() {
  return (
    <section id="top" className="hero-section relative isolate overflow-clip bg-ground-2">
      <div aria-hidden="true" className="paper-field pointer-events-none z-0">
        <PaperField />
      </div>

      {/* The portrait keeps its own aspect ratio, centered beside the copy. */}
      <div className="hero-layout relative z-10 mx-auto max-w-[1340px] px-6 lg:px-10">
        {/* ── Copy ── */}
        <div className="hero-copy">
          <p data-reveal data-eager className="label hero-eyebrow text-pigment">
            <span aria-hidden="true" />
            {profile.discipline}
          </p>

          <h1
            data-reveal
            data-eager
            className="display hero-name text-ink"
            style={{ "--reveal-delay": "60ms" } as React.CSSProperties}
          >
            {profile.fullName.slice(0, -profile.lastName.length).trim()}<br />
            <span className="hero-surname">{profile.lastName}<span className="text-pigment">.</span></span>
          </h1>

          <p
            data-reveal
            data-eager
            className="display hero-headline text-ink-2"
            style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
          >
            {profile.headline.before}{" "}
            <em className="display-em">{profile.headline.emphasis}</em>
            {profile.headline.after}
          </p>

          <p
            data-reveal
            data-eager
            className="copy mt-6 max-w-[48ch]"
            style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
          >
            {profile.lede}
          </p>

          <div
            data-reveal
            data-eager
            className="mt-9 flex flex-wrap gap-3"
            style={{ "--reveal-delay": "240ms" } as React.CSSProperties}
          >
            <a href="#work" className="btn btn-primary">
              Explore my work <span aria-hidden="true">↗</span>
            </a>
            {contact.resumeHref && (
              <a href={contact.resumeHref} className="btn btn-pigment">
                Résumé
              </a>
            )}
          </div>

          <p
            data-reveal
            data-eager
            className="label mt-10 text-muted"
            style={{ "--reveal-delay": "300ms" } as React.CSSProperties}
          >
            <span className="whitespace-nowrap">{profile.heroCaption.place}</span>
            {" · "}
            <span className="whitespace-nowrap">{profile.heroCaption.coordinates}</span>
          </p>
        </div>

        {/* ── Portrait ── */}
        <div
          data-reveal
          data-eager
          className="hero-visual"
          style={{ "--reveal-delay": "150ms" } as React.CSSProperties}
        >
          <Portrait />
        </div>
      </div>
      <div className="hero-bottom relative z-10 mx-auto max-w-[1260px]">
        <p className="label text-muted">Thoughtful interfaces. <span className="text-ink-2">Useful software.</span></p>
        <a href="#work" className="label hero-scroll text-ink-2">Selected work <span aria-hidden="true">↓</span></a>
      </div>
    </section>
  );
}
