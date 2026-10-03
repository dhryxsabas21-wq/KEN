import { contact, nav, profile } from "@/lib/content";
import Tilt3D from "./Tilt3D";

/**
 * Site footer: the brand mark shown in full (extruded, tilting gently
 * in 3D), a sitemap, contact details, and a bottom bar.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="hair-t bg-ground-2">
      <div className="mx-auto max-w-[1340px] px-6 pt-16 lg:px-10 lg:pt-20">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-6">
            <Tilt3D max={6} className="inline-block">
              <a
                href="#top"
                aria-label={`${profile.fullName} — back to top`}
                className="display extrude block text-[clamp(72px,11vw,156px)] leading-[0.9] text-ink"
              >
                {profile.shortMark}
                <span className="text-pigment">.</span>
              </a>
            </Tilt3D>
            <p className="label mt-8 text-ink-2">{profile.discipline}</p>
            <p className="label mt-2 text-muted">{profile.location}</p>
          </div>

          {/* Sitemap */}
          <nav aria-label="Footer" className="lg:col-span-3">
            <p className="label text-pigment">Sections</p>
            <ul className="mt-5 space-y-1">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="navlink label inline-flex min-h-[32px] items-center text-ink-2 hover:text-ink"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              {contact.resumeHref && (
                <li>
                  <a
                    href={contact.resumeHref}
                    className="navlink label inline-flex min-h-[32px] items-center text-ink-2 hover:text-ink"
                  >
                    Résumé
                  </a>
                </li>
              )}
            </ul>
          </nav>

          {/* Contact */}
          <div className="lg:col-span-3">
            <p className="label text-pigment">Contact</p>
            <ul className="mt-5 space-y-1">
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="navlink label inline-block py-[9px] normal-case tracking-[0.04em] text-ink-2 hover:text-ink"
                >
                  {/* Allowed to wrap only at the "@", never mid-word */}
                  {contact.email.split("@")[0]}
                  <wbr />@{contact.email.split("@")[1]}
                </a>
              </li>
              <li>
                <a
                  href={contact.phoneHref}
                  className="navlink label inline-flex min-h-[32px] items-center text-ink-2 hover:text-ink"
                >
                  {contact.phone}
                </a>
              </li>
              {contact.channels.map((channel) => (
                <li key={channel.label}>
                  <a
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="navlink label inline-flex min-h-[32px] items-center text-ink-2 hover:text-ink"
                  >
                    {channel.label}
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="hair-t mt-16 flex flex-col-reverse items-start justify-between gap-5 py-7 sm:flex-row sm:items-center">
          <p className="label text-muted">
            © {year} {profile.fullName}
          </p>
          <a href="#top" className="btn h-[40px] min-h-[40px]">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
