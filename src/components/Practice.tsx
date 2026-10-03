import { practice } from "@/lib/content";
import BreakpointDrawing from "./BreakpointDrawing";
import Tilt3D from "./Tilt3D";

export default function Practice() {
  return (
    <section id="practice" className="hair-t scroll-mt-[60px] py-24 lg:py-32">
      <div className="mx-auto max-w-[1340px] px-6 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20">
          {/* Prose and data */}
          <div>
            <p data-reveal className="label text-pigment">
              01 — Practice
            </p>

            <h2
              data-reveal
              className="display mt-6 max-w-[22ch] text-[clamp(28px,3.6vw,48px)] text-ink"
              style={{ "--reveal-delay": "70ms" } as React.CSSProperties}
            >
              {practice.heading.before}{" "}
              <em className="display-em">{practice.heading.emphasis}</em>
              {practice.heading.after}
            </h2>

            <p
              data-reveal
              className="copy mt-7 max-w-[52ch]"
              style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
            >
              {practice.lede}
            </p>

            {/* Hairline-ruled definition list */}
            <dl className="mt-12">
              {practice.rows.map((row, i) => (
                <div
                  key={row.label}
                  data-reveal="flip"
                  className="hair-t grid grid-cols-[minmax(0,auto)_1fr] items-baseline gap-x-6 gap-y-1 py-4 sm:grid-cols-[130px_1fr_auto]"
                  style={
                    { "--reveal-delay": `${210 + i * 70}ms` } as React.CSSProperties
                  }
                >
                  <dt className="label text-pigment">{row.label}</dt>
                  <dd className="copy max-sm:col-span-2">{row.description}</dd>
                  <dd className="label whitespace-nowrap text-right text-muted max-sm:col-span-2 max-sm:text-left">
                    {row.value}
                  </dd>
                </div>
              ))}
              <div className="hair-t" />
            </dl>
          </div>

          {/* To-scale drawing, on a plane that tilts in 3D */}
          <div data-reveal className="lg:pt-16">
            <Tilt3D max={9} className="p-2">
              <BreakpointDrawing />
            </Tilt3D>
          </div>
        </div>
      </div>
    </section>
  );
}
