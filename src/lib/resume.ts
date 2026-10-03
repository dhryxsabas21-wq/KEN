/**
 * Résumé content.
 *
 * Contact details, education and the certificate are imported from
 * content.ts, so the portfolio and the résumé can never disagree.
 * Experience and project bullets follow Kennedy's own résumé wording.
 *
 * After editing, regenerate the PDF:  npm run resume:pdf
 */
import { certificate, contact, education, profile } from "./content";

export { certificate, contact, education, profile };

export const summary =
  "Full-stack and desktop application developer from Baler, Aurora, completing a BS in Information Technology at Aurora State College of Technology. Builds offline-first desktop systems with Electron, Node.js and SQLite, and responsive web applications with PHP, MySQL, HTML, CSS and JavaScript. Has delivered a medical records system for a rural health facility and a business website for a local establishment.";

export type ResumeEntry = {
  title: string;
  org?: string;
  place?: string;
  role?: string;
  period?: string;
  bullets: string[];
  stack?: string[];
};

export const experience: ResumeEntry[] = [
  {
    title: "Full-Stack & Application Developer",
    org: "Bella's Takoyaki",
    place: "Baler, Aurora",
    role: "Freelance / Project-Based",
    period: "Sep 2026",
    bullets: [
      "Designed, developed and deployed a responsive frontend business website for a local establishment in Baler, Aurora.",
      "Engineered interactive user interface features using HTML, CSS, JavaScript and Bootstrap to improve brand visibility and customer engagement.",
    ],
    stack: ["HTML", "CSS", "JavaScript", "Bootstrap"],
  },
  {
    title: "MedSys: Integrated Medical Records & Patient Management System",
    org: "Dr. Andres Aragon Angara Health Center & Birthing Facility",
    role: "Capstone Project",
    period: "Jul – Sep 2026",
    bullets: [
      "Developed a desktop and web-based system using HTML, SQLite and Electron to manage patient check-ins and medical histories.",
      "Created a digital record module to replace paper-based forms for maternal and birthing patient data.",
    ],
    stack: ["Electron", "SQLite", "HTML"],
  },
];

export const projects: ResumeEntry[] = [
  {
    title: "Desktop Software Development Projects",
    bullets: [
      "Built self-contained, cross-platform desktop applications with Electron.js and Node.js for offline database interactions and administrative workflow automation.",
    ],
    stack: ["Electron.js", "Node.js"],
  },
];

/** Grouped for scanning — no proficiency bars or percentages. */
export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["HTML5", "CSS3", "JavaScript", "PHP", "Java"] },
  { group: "Frameworks & Runtime", items: ["Node.js", "Electron.js", "Bootstrap", "Tailwind CSS"] },
  { group: "Databases", items: ["MySQL", "SQLite"] },
  { group: "Tools", items: ["Git", "GitHub", "VS Code"] },
];

export const specialised = [
  "Desktop application development (Electron / Node.js)",
  "Responsive web design",
  "Offline-first data storage",
  "Digital photography & media production",
];
