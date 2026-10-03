import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ResumeToolbar from "@/components/ResumeToolbar";
import {
  certificate,
  contact,
  education,
  experience,
  profile,
  projects,
  skills,
  specialised,
  summary,
  type ResumeEntry,
} from "@/lib/resume";
import "./resume.css";

/* Body face for the résumé only. A sans reads better than mono at
   9.5pt on paper; the serif and mono from the site carry the name and
   the labels, so it still looks like the same person's document. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Résumé",
  description: `Résumé of ${profile.fullName}, ${profile.discipline} based in ${profile.location}.`,
};

const PDF_NAME = "Kennedy-Dhryx-Pronto-Resume.pdf";

function Entry({ entry }: { entry: ResumeEntry }) {
  const meta = [entry.org, entry.place, entry.role].filter(Boolean) as string[];
  return (
    <div className="rs-entry">
      <div className="rs-entry-head">
        <h3 className="rs-entry-title">{entry.title}</h3>
        {entry.period && <span className="rs-period">{entry.period}</span>}
      </div>
      {meta.length > 0 && (
        <p className="rs-org">
          {meta.map((part, i) => (
            <span key={part}>
              {i > 0 && (
                <span className="rs-sep" aria-hidden="true">
                  /
                </span>
              )}
              {part}
            </span>
          ))}
        </p>
      )}
      <ul className="rs-bullets">
        {entry.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      {entry.stack && (
        <ul className="rs-chips" aria-label="Technologies used">
          {entry.stack.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ResumePage() {
  return (
    <div className={inter.variable}>
      <ResumeToolbar pdfName={PDF_NAME} />

      <main className="rs-stage">
        <article className="rs-sheet" aria-label={`Résumé of ${profile.fullName}`}>
          {/* ── Header ── */}
          <header className="rs-header">
            <div>
              <h1 className="rs-name">{profile.fullName}</h1>
              <p className="rs-role">{profile.discipline}</p>
            </div>

            <dl className="rs-contact">
              <div>
                <dt>Location</dt>
                <dd>{profile.location}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={contact.phoneHref}>{contact.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </dd>
              </div>
              <div>
                <dt>LinkedIn</dt>
                <dd>
                  {/* Shown as the handle, labelled "LinkedIn"; the link
                      (clickable in the PDF too) is the full URL. */}
                  <a href={contact.linkedin}>
                    {contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\//, "")}
                  </a>
                </dd>
              </div>
            </dl>
          </header>

          <div className="rs-rule" aria-hidden="true" />

          <div className="rs-body">
            {/* ── Main column (first in the DOM) ── */}
            <div className="rs-main">
              <section className="rs-section" aria-labelledby="rs-profile">
                <h2 id="rs-profile" className="rs-h">
                  Profile
                </h2>
                <p className="rs-summary">{summary}</p>
              </section>

              <section className="rs-section" aria-labelledby="rs-experience">
                <h2 id="rs-experience" className="rs-h">
                  Experience
                </h2>
                {experience.map((e) => (
                  <Entry key={e.title} entry={e} />
                ))}
              </section>

              <section className="rs-section" aria-labelledby="rs-projects">
                <h2 id="rs-projects" className="rs-h">
                  Projects
                </h2>
                {projects.map((p) => (
                  <Entry key={p.title} entry={p} />
                ))}
              </section>

              <section className="rs-section" aria-labelledby="rs-education">
                <h2 id="rs-education" className="rs-h">
                  Education
                </h2>
                {education.map((school) => (
                  <div key={school.school} className="rs-entry">
                    <div className="rs-entry-head">
                      <h3 className="rs-entry-title">{school.school}</h3>
                      <span className="rs-period">{school.place}</span>
                    </div>
                    {school.entries.map((e) => (
                      <div key={e.credential} className="rs-entry-head" style={{ marginTop: "2pt" }}>
                        <p className="rs-org">
                          {e.credential}
                          {e.current && <span className="rs-current">In progress</span>}
                        </p>
                        <span className="rs-period">{e.period.replace("—", "–")}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </section>
            </div>

            {/* ── Sidebar ── */}
            <aside className="rs-aside" aria-label="Skills and certification">
              <section className="rs-section" aria-labelledby="rs-skills">
                <h2 id="rs-skills" className="rs-h">
                  Skills
                </h2>
                {skills.map((g) => (
                  <div key={g.group} className="rs-group">
                    <h3 className="rs-group-label">{g.group}</h3>
                    <ul className="rs-list">
                      {g.items.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>

              <section className="rs-section" aria-labelledby="rs-special">
                <h2 id="rs-special" className="rs-h">
                  Focus
                </h2>
                <ul className="rs-list">
                  {specialised.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </section>

              <section className="rs-section" aria-labelledby="rs-cert">
                <h2 id="rs-cert" className="rs-h">
                  Certification
                </h2>
                <p className="rs-entry-title">{certificate.title}</p>
                <p className="rs-note">Certificate of Completion</p>
                <p className="rs-note">{certificate.issuer}</p>
                <p className="rs-period" style={{ marginTop: "3pt" }}>
                  {certificate.date}
                </p>
              </section>
            </aside>
          </div>
        </article>
      </main>
    </div>
  );
}
