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
    <section id="services" className="hair-t scroll-mt-[60px] bg-ground-2 py-24 lg:py-32">
      <div className="mx-auto max-w-[1340px] px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p data-reveal className="label text-pigment">
              02 — Services
            </p>
            <h2
              data-reveal
              className="display mt-6 max-w-[20ch] text-[clamp(28px,3.6vw,48px)] text-ink"
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
            From a school&apos;s student portal to a clinic&apos;s offline records —
            software that replaces a paper process.
          </p>
        </div>

        <ul className="mt-14 grid gap-5 md:grid-cols-2">
          {services.map((service, i) => (
            <li
              key={service.title}
              data-reveal
              style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
            >
              <Tilt3D
                max={7}
                className="group relative h-full border border-hair bg-ground p-7 transition-colors duration-300 hover:border-pigment/60 lg:p-9"
              >
                {/* Index number, floating 50px in front of the plane */}
                <span
                  aria-hidden="true"
                  className="display extrude pointer-events-none absolute right-6 top-3 text-[clamp(64px,7vw,96px)] leading-none text-pigment lg:right-8"
                  style={{ transform: "translateZ(50px)" }}
                >
                  {service.index}
                </span>

                <h3 className="display relative max-w-[70%] text-[clamp(24px,2.4vw,34px)] text-ink">
                  {service.title}
                </h3>

                <p className="copy relative mt-4 max-w-[46ch]">{service.summary}</p>

                <ul className="relative mt-6 grid grid-cols-2 gap-x-6 gap-y-2">
                  {service.includes.map((item) => (
                    <li key={item} className="label flex items-center gap-2.5 text-ink-2">
                      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-pigment" />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Stack chips, lifted slightly off the plane */}
                <div
                  className="hair-t relative mt-8 flex flex-wrap items-center justify-between gap-4 pt-5"
                  style={{ transform: "translateZ(22px)" }}
                >
                  <ul className="flex flex-wrap gap-2" aria-label={`${service.title} stack`}>
                    {service.stack.map((tech) => (
                      <li
                        key={tech}
                        className="label border border-hair bg-surface px-2.5 py-1.5 text-ink"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>

                  {service.proof ? (
                    <a
                      href={service.proof.href}
                      className="navlink label inline-flex min-h-[32px] items-center text-pigment"
                    >
                      See {service.proof.label} →
                    </a>
                  ) : (
                    <span className="label text-muted">Available to build</span>
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
