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
    <section id="top" className="relative isolate overflow-clip bg-ground-2">
      <div aria-hidden="true" className="paper-field pointer-events-none z-0">
        <PaperField />
      </div>

      {/* content-center keeps the row exactly as tall as the copy (rather
          than stretching it to the hero's min-height), so the portrait,
          which stretches to the row, matches the copy edge for edge. */}
      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-60px)] max-w-[1340px] grid-cols-1 content-center items-center gap-x-16 gap-y-20 px-6 pb-14 pt-[88px] md:pt-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-10 lg:py-[clamp(32px,6vh,72px)]">
        {/* ── Copy ── */}
        <div className="lg:max-w-[min(40vw,560px)]">
          <p data-reveal data-eager className="label text-pigment">
            {profile.discipline}
          </p>

          <h1
            data-reveal
            data-eager
            className="display mt-5 text-[clamp(42px,5.4vw,78px)] leading-[0.98] text-ink"
            style={{ "--reveal-delay": "60ms" } as React.CSSProperties}
          >
            {profile.fullName}
          </h1>

          <p
            data-reveal
            data-eager
            className="display mt-5 text-[clamp(22px,2.2vw,30px)] leading-[1.15] text-ink-2"
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
            <a href="#work" className="btn">
              See the work
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
          className="justify-self-center lg:self-stretch lg:justify-self-end"
          style={{ "--reveal-delay": "150ms" } as React.CSSProperties}
        >
          <Portrait />
        </div>
      </div>
    </section>
  );
}
