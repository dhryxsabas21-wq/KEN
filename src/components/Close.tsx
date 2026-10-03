import { close, contact } from "@/lib/content";

/* One row on desktop however many channels there are, so a fourth or
   fifth card never ends up alone on a second row. (Static class names,
   so Tailwind can see them.) */
const LG_COLS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

/** Closing call to action: headline, primary contacts, every channel. */
export default function Close() {
  const lgCols = LG_COLS[Math.min(contact.channels.length, 6)] ?? "lg:grid-cols-4";

  return (
    <section id="close" className="hair-t scroll-mt-[60px] py-24 lg:py-32">
      <div className="mx-auto max-w-[1340px] px-6 lg:px-10">
        <h2
          data-reveal
          className="display max-w-[24ch] text-[clamp(30px,4.6vw,64px)] text-ink"
        >
          {close.heading.before}{" "}
          <em className="display-em">{close.heading.emphasis}</em>
          {close.heading.after}
        </h2>

        <p data-reveal className="copy mt-7 max-w-[58ch]">
          {close.fineprint}
        </p>

        {/* Primary contact on the left, résumé and phone on the right */}
        <div
          data-reveal
          className="mt-12 flex flex-wrap items-center justify-between gap-6"
          style={{ "--reveal-delay": "70ms" } as React.CSSProperties}
        >
          <a href={`mailto:${contact.email}`} className="btn btn-pigment">
            {contact.email}
          </a>

          <div className="flex flex-wrap gap-3">
            {contact.resumeHref && (
              <a href={contact.resumeHref} className="btn">
                Résumé
              </a>
            )}
            <a href={contact.phoneHref} className="btn">
              {contact.phone}
            </a>
          </div>
        </div>

        {/* Every other channel, as ruled cards that lift off a slab */}
        <ul
          data-reveal
          className={`mt-10 grid gap-4 sm:grid-cols-2 ${lgCols}`}
          style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
        >
          {contact.channels.map((channel) => (
            <li key={channel.label}>
              <a
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="channel group h-full"
              >
                <span className="flex items-center justify-between">
                  <span className="label text-muted">{channel.label}</span>
                  <span
                    aria-hidden="true"
                    className="label text-pigment transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  >
                    ↗
                  </span>
                </span>
                {/* Mono, not the display serif: handles get typed, and in
                    Instrument Serif "021" reads as "02l". */}
                <span className="mt-4 block font-mono text-[15px] font-medium text-ink [overflow-wrap:anywhere]">
                  {channel.value}
                </span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
