import { services } from "@/lib/content";
import Tilt3D from "./Tilt3D";

/**
 * What Kennedy builds. Each panel is a 3D plane: the big index number
 * floats in front of it and the stack chips sit slightly above it, so
 * they shear apart as the panel tilts toward the pointer.
 *
 * A panel links to real proof only where a shipped project exists.
 */
export default function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="section-space hair-t bg-ground-2">
      <div className="mx-auto max-w-[1340px] px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p data-reveal className="label text-pigment">
              02 — Services
            </p>
            <h2
              data-reveal
              id="services-title"
              className="display section-title mt-5 max-w-[20ch] text-ink"
              style={{ "--reveal-delay": "70ms" } as React.CSSProperties}
            >
              What I <em className="display-em">build</em> for people.
            </h2>
          </div>
          <p
            data-reveal
            className="copy max-w-[40ch]"
            style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
          >
            Business websites, offline records and workflow tools —
            software that makes everyday work easier.
          </p>
        </div>

        <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <li
              key={service.title}
              data-reveal
              style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
            >
              <Tilt3D
                max={7}
                className="service-card group relative flex h-full flex-col border border-hair bg-ground p-6 transition-colors duration-300 hover:border-pigment/60 xl:p-8"
              >
                <div className="flex items-start justify-between gap-5">
                <h3 className="display text-[30px] leading-[1.1] text-ink">
                  {service.title}
                </h3>
                <span
                  aria-hidden="true"
                  className="display pointer-events-none shrink-0 text-[38px] leading-none text-pigment"
                  style={{ transform: "translateZ(24px)" }}
                >
                  {service.index}
                </span>

                </div>

                <p className="copy relative mt-4 max-w-[46ch]">{service.summary}</p>

                <ul className="relative mb-7 mt-6 grid gap-2">
                  {service.includes.map((item) => (
                    <li key={item} className="detail flex items-start gap-2.5 text-ink-2">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-pigment" />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Stack chips, lifted slightly off the plane */}
                <div
                  className="hair-t relative mt-auto flex flex-wrap items-center justify-between gap-4 pt-5"
                  style={{ transform: "translateZ(22px)" }}
                >
                  <ul className="flex flex-wrap gap-2" aria-label={`${service.title} stack`}>
                    {service.stack.map((tech) => (
                      <li
                        key={tech}
                        className="chip"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>

                  {service.proof ? (
                    <a
                      href={service.proof.href}
                      className="navlink label inline-flex min-h-11 items-center text-pigment"
                    >
                      See {service.proof.label} →
                    </a>
                  ) : (
                    <span className="label inline-flex min-h-11 items-center text-muted">Available to build</span>
                  )}
                </div>
              </Tilt3D>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
