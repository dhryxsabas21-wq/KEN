import { about, certificate, education } from "@/lib/content";

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="section-space hair-t bg-ground-2">
      <div className="mx-auto max-w-[1340px] px-6 lg:px-10">
        <p data-reveal className="label text-pigment">
          05 — About
        </p>

        <h2
          data-reveal
          id="about-title"
          className="display section-title mt-5 max-w-[20ch] text-ink"
          style={{ "--reveal-delay": "70ms" } as React.CSSProperties}
        >
          {about.heading.before}{" "}
          <em className="display-em">{about.heading.emphasis}</em>
          {about.heading.after}
        </h2>

        <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Prose */}
          <div>
            {about.paragraphs.map((paragraph, i) => (
              <p
                key={i}
                data-reveal
                className="copy mb-4 max-w-[52ch]"
                style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Education and certificate — ruled rows that flip in like
              index cards */}
          <div>
            <p data-reveal className="label text-muted">
              Education
            </p>

            <div className="mt-5">
              {education.map((school, i) => (
                <div
                  key={school.school}
                  data-reveal="flip"
                  className="hair-t py-5"
                  style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 className="display text-[25px] leading-snug text-ink">{school.school}</h3>
                    <span className="label text-muted">{school.place}</span>
                  </div>

                  <ul className="mt-3 space-y-1.5">
                    {school.entries.map((entry) => (
                      <li
                        key={entry.credential}
                        className="flex flex-wrap items-baseline justify-between gap-x-6"
                      >
                        <span className="copy">
                          {entry.credential}
                          {entry.current && (
                            <span className="label ml-2.5 text-pigment">In progress</span>
                          )}
                        </span>
                        <span className="label tabular-nums text-muted">{entry.period}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div
                data-reveal="flip"
                className="hair-t py-5"
                style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 className="display text-[25px] leading-snug text-ink">{certificate.title}</h3>
                  <span className="label tabular-nums text-muted">{certificate.date}</span>
                </div>
                <p className="copy mt-2">{certificate.issuer}</p>
              </div>

              <div className="hair-t" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
