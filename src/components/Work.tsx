import Image from "next/image";
import { work, type WorkRow } from "@/lib/content";
import Tilt3D from "./Tilt3D";

/** A screenshot in a frame: a browser with an address bar, or a bare
    window for desktop-app captures that carry their own title bar. */
function Screen({ project, order }: { project: WorkRow; order: number }) {
  const f = project.featured!;
  return (
    <div data-reveal>
      <Tilt3D max={6} perspective={1200} className="relative">
        <figure className="screen m-0">
          {f.chrome === "browser" && (
            <div className="screen-bar" aria-hidden="true">
              <span className="flex gap-1.5">
                <i />
                <i />
                <i />
              </span>
              <span className="screen-url">{f.chromeTitle}</span>
            </div>
          )}
          <Image
            src={f.image.src}
            width={f.image.width}
            height={f.image.height}
            alt={f.image.alt}
            sizes="(min-width: 1340px) 720px, (min-width: 1024px) 54vw, 100vw"
            className="block h-auto w-full"
          />
        </figure>

        {/* Index tag floating above the frame — not over the browser bar,
            where it would hide the dots and the page title */}
        <span
          aria-hidden="true"
          className="label absolute -top-11 left-0 border border-pigment bg-ground px-2.5 py-1.5 text-pigment"
          style={{ transform: "translateZ(60px)" }}
        >
          {String(order + 1).padStart(2, "0")} · {project.name}
        </span>
      </Tilt3D>
    </div>
  );
}

function CaseStudy({ project, order }: { project: WorkRow; order: number }) {
  const f = project.featured!;
  const flip = order % 2 === 1;
  return (
    // grid-cols-1 = minmax(0, 1fr): without an explicit column the single
    // mobile track grows to its widest content and the page scrolls sideways.
    <article className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
      <div className={flip ? "lg:order-2" : undefined}>
        <Screen project={project} order={order} />
      </div>

      <div className={flip ? "lg:order-1" : undefined}>
        <p data-reveal className="label flex flex-wrap gap-x-3 text-muted">
          <span className="text-pigment">{project.role}</span>
          <span aria-hidden="true">/</span>
          <span className="tabular-nums">{project.year}</span>
        </p>

        <h3
          data-reveal
          className="display mt-4 text-[clamp(30px,3.4vw,46px)] text-ink"
          style={{ "--reveal-delay": "70ms" } as React.CSSProperties}
        >
          {project.name}
        </h3>
        <p data-reveal className="label mt-2 text-ink-2">
          {project.client}
        </p>

        <p
          data-reveal
          className="copy mt-6 max-w-[54ch]"
          style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
        >
          {project.note}
        </p>

        <ul
          data-reveal
          className="mt-7 grid gap-x-6 gap-y-2.5 sm:grid-cols-2"
          style={{ "--reveal-delay": "210ms" } as React.CSSProperties}
        >
          {f.features.map((feature) => (
            <li key={feature} className="label flex items-start gap-2.5 text-ink-2">
              <span aria-hidden="true" className="mt-[3px] h-1.5 w-1.5 shrink-0 bg-pigment" />
              {feature}
            </li>
          ))}
        </ul>

        <ul
          data-reveal
          className="hair-t mt-8 flex flex-wrap gap-2 pt-6"
          aria-label={`${project.name} stack`}
          style={{ "--reveal-delay": "280ms" } as React.CSSProperties}
        >
          {project.stack.split(",").map((tech) => (
            <li key={tech} className="label border border-hair bg-surface px-2.5 py-1.5 text-ink">
              {tech.trim()}
            </li>
          ))}
        </ul>

        {project.live && (
          <div
            data-reveal
            className="mt-7 flex flex-wrap items-center gap-4"
            style={{ "--reveal-delay": "340ms" } as React.CSSProperties}
          >
            <a
              href={project.live.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-pigment"
            >
              Visit live site ↗<span className="sr-only">(opens in a new tab)</span>
            </a>
            {project.live.status && (
              <span className="label flex items-center gap-2 text-muted">
                <span aria-hidden="true" className="h-1.5 w-1.5 bg-muted" />
                {project.live.status}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function Work() {
  const featured = work.filter((w) => w.featured);
  const rest = work.filter((w) => !w.featured);

  return (
    <section id="work" className="hair-t scroll-mt-[60px] py-24 lg:py-32">
      <div className="mx-auto max-w-[1340px] px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p data-reveal className="label text-pigment">
              04 — Work
            </p>
            <h2
              data-reveal
              className="display mt-6 text-[clamp(28px,3.6vw,48px)] text-ink"
              style={{ "--reveal-delay": "70ms" } as React.CSSProperties}
            >
              Selected <em className="display-em">work</em>.
            </h2>
          </div>
          <p data-reveal className="label text-muted">
            {work.length} projects
          </p>
        </div>

        {/* Case studies with screenshots */}
        <div className="mt-16 space-y-24 lg:mt-20 lg:space-y-32">
          {featured.map((project, i) => (
            <CaseStudy key={project.name} project={project} order={i} />
          ))}
        </div>

        {/* Everything else, as a ruled list */}
        {rest.length > 0 && (
          <>
            <p data-reveal className="label mt-28 text-muted">
              More work
            </p>
            <table className="worktable mt-6">
              <thead>
                <tr>
                  <th scope="col" className="label w-[24%]">
                    Project
                  </th>
                  <th scope="col" className="label w-[40%]">
                    Detail
                  </th>
                  <th scope="col" className="label w-[22%]">
                    Stack
                  </th>
                  <th scope="col" className="label w-[14%] text-right">
                    Year
                  </th>
                </tr>
              </thead>
              <tbody>
                {rest.map((row, i) => (
                  <tr
                    key={row.name}
                    data-reveal
                    style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
                  >
                    <td>
                      <h3 className="display text-[clamp(17px,1.7vw,24px)] text-ink">
                        <span className="lift">{row.name}</span>
                      </h3>
                      <p className="label mt-1.5 text-pigment">{row.role}</p>
                    </td>
                    <td>
                      <p className="copy">{row.note}</p>
                      <p className="label mt-2 text-muted">{row.client}</p>
                    </td>
                    <td>
                      <p className="label text-ink-2">{row.stack}</p>
                    </td>
                    <td>
                      <p className="label whitespace-nowrap text-right tabular-nums text-muted">
                        {row.year}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </section>
  );
}
