/**
 * ─────────────────────────────────────────────────────────────
 *  SINGLE SOURCE OF TRUTH
 *
 *  Claims here come from Kennedy's résumé, or from Kennedy directly
 *  (Java, and student portals as a service). Nothing is invented —
 *  no awards, testimonials, client logos or proficiency scores.
 *  If you add something, make sure you can stand behind it in an
 *  interview.
 * ─────────────────────────────────────────────────────────────
 */

export const profile = {
  firstName: "Kennedy",
  lastName: "Pronto",
  fullName: "Kennedy Dhryx Pronto",
  /** Rendered in the nav as "Pronto." with the period in pigment. */
  shortMark: "Pronto",
  discipline: "Full-Stack & Application Developer",
  location: "Baler, Aurora, Philippines",

  /** Hero headline. The phrase in `emphasis` is set in italic pigment. */
  headline: {
    before: "I build software for places that still run on",
    emphasis: "paper",
    after: ".",
  },

  lede:
    "Full-stack and desktop application developer based in Baler, Aurora. I build student portals, business websites and offline-first desktop systems in PHP, JavaScript, Electron and plain web standards.",

  /** Corner caption. Two unbreakable runs, so a narrow screen wraps
      between them rather than orphaning the "E". */
  heroCaption: {
    place: "Baler, Aurora",
    coordinates: "15.7589° N, 121.5623° E",
  },
};

export const contact = {
  email: "dhryxsabas21@gmail.com",
  phone: "0985-269-0952",
  phoneHref: "tel:+639852690952",
  linkedin: "https://linkedin.com/in/kennedy-dhryx-pronto-692863367",
  /**
   * Every way to reach Kennedy, shown in the closing section.
   * Pending: Telegram — need the t.me/… link (the QR's name reads "LJ").
   */
  channels: [
    { label: "WhatsApp", value: "Message me", href: "https://wa.me/qr/4ZSR3FP5R265A1" },
    { label: "Instagram", value: "@kenz.ie021", href: "https://www.instagram.com/kenz.ie021/" },
    {
      label: "Facebook",
      value: "Kennedy Dhryx N Pronto",
      // TODO: replace with the page's own URL (page → ⋯ → Copy link).
      // Until then this searches Facebook for the exact page name.
      href: "https://www.facebook.com/search/top?q=Kennedy%20Dhryx%20N%20Pronto",
    },
    {
      label: "LinkedIn",
      value: "Kennedy Dhryx Pronto",
      href: "https://linkedin.com/in/kennedy-dhryx-pronto-692863367",
    },
  ] as { label: string; value: string; href: string }[],
  /** The résumé page (src/app/resume). It links to the PDF at /resume.pdf,
      regenerated with `npm run resume:pdf`. Set to null to hide the buttons. */
  resumeHref: "/resume",
};

/**
 * The cut-out subject bracketed between the two wordmark lines.
 *
 * Leave `src` as null and a drawn stand-in is shown. To use a real
 * photo: remove its background, save it as a PNG at public/subject.png,
 * then set `src`, `width` and `height` to the file's REAL pixel
 * dimensions. Stale numbers silently stretch the art.
 */
export const subject: {
  src: string | null;
  width: number;
  height: number;
  alt: string;
} = {
  // Made from the studio portrait with `npm run cutout -- photo.jpg`
  src: "/subject.webp",
  width: 720,
  height: 900,
  alt: "Kennedy Dhryx Pronto in a dark suit and tie",
};

export const nav = [
  { id: "practice", label: "Practice" },
  { id: "services", label: "Services" },
  { id: "stack", label: "Stack" },
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
] as const;

/* ─────────────────────────── Practice ─────────────────────────── */

export const practice = {
  heading: {
    before: "Built to work",
    emphasis: "offline first",
    after: ", then online.",
  },
  lede:
    "Most of my work is for small establishments, schools and a rural health facility. Connectivity is not a given, so data lives close to the user and the interface has to hold up on whatever machine is already on the desk.",
  rows: [
    {
      label: "Local-first",
      description: "SQLite on disk, so records survive a dropped connection",
      value: "SQLite",
    },
    {
      label: "Packaged",
      description: "Shipped as a desktop app, not a URL to remember",
      value: "Electron",
    },
    {
      label: "Responsive",
      description: "One layout from 375px phones to 1440px desktops",
      value: "4 breakpoints",
    },
    {
      label: "Server-side",
      description: "PHP and MySQL where many users share one set of records",
      value: "PHP · MySQL",
    },
  ],
};

/**
 * The breakpoint ladder in the Practice drawing — the real values this
 * stylesheet uses, drawn strictly to scale.
 */
export const breakpoints = [
  { name: "sm", widthPx: 375, note: "Small phone" },
  { name: "md", widthPx: 768, note: "Tablet portrait" },
  { name: "lg", widthPx: 1024, note: "Tablet landscape" },
  { name: "xl", widthPx: 1440, note: "Desktop" },
] as const;

/* ─────────────────────────── Services ─────────────────────────── */

export type Service = {
  index: string;
  title: string;
  summary: string;
  includes: string[];
  stack: string[];
  /** A real project that proves it, or null. Never invent one. */
  proof: { label: string; href: string } | null;
};

export const services: Service[] = [
  {
    index: "01",
    title: "Student portals",
    summary:
      "Web portals for schools: one login for students, faculty and the registrar, each seeing only what their role allows.",
    includes: ["Enrolment & profiles", "Grades & schedules", "Announcements", "Role-based access"],
    stack: ["PHP", "MySQL", "HTML", "CSS", "JavaScript"],
    proof: { label: "the Lyceum portal", href: "#work" },
  },
  {
    index: "02",
    title: "Business websites",
    summary:
      "Responsive sites for local establishments — what they offer, when they're open, where to find them, and how to get in touch.",
    includes: ["Responsive layout", "Menus & catalogues", "Contact & location", "Deployment"],
    stack: ["HTML", "CSS", "JavaScript", "Bootstrap"],
    proof: { label: "Bella's Takoyaki", href: "#work" },
  },
  {
    index: "03",
    title: "Desktop record systems",
    summary:
      "Offline-first desktop applications with a local database, for clinics and offices that can't depend on the internet.",
    includes: ["Digital forms", "Patient & client records", "Search & history", "Runs offline"],
    stack: ["Electron", "Node.js", "SQLite"],
    proof: { label: "MedSys", href: "#work" },
  },
  {
    index: "04",
    title: "Admin & workflow tools",
    summary:
      "Small internal tools that replace spreadsheets and paper logs, so routine office work takes minutes instead of an afternoon.",
    includes: ["Inventory & logs", "Data entry", "Reports", "Automation"],
    stack: ["Electron", "Node.js", "Java", "MySQL"],
    proof: null,
  },
];

/* ──────────────────────────── Stack ──────────────────────────── */

export type Tech = {
  name: string;
  /** Short monogram set large on the tile face. */
  mark: string;
  category: string;
  /** Back of the tile: what it has actually been used for. */
  usedFor: string;
};

export const stack: Tech[] = [
  { name: "HTML5", mark: "Ht", category: "Markup", usedFor: "Every web project, from Bella's Takoyaki to the MedSys interface." },
  { name: "CSS3", mark: "Cs", category: "Styling", usedFor: "Responsive layouts that hold from 375px phones to 1440px desktops." },
  { name: "JavaScript", mark: "Js", category: "Language", usedFor: "Interactive interfaces on the web and inside Electron apps." },
  { name: "PHP", mark: "Ph", category: "Back end", usedFor: "Server-side logic and database-backed web apps like student portals." },
  { name: "Java", mark: "Jv", category: "Language", usedFor: "Object-oriented programming and application development." },
  { name: "Node.js", mark: "No", category: "Runtime", usedFor: "Local file and database access for offline desktop apps." },
  { name: "Electron.js", mark: "El", category: "Desktop", usedFor: "MedSys and cross-platform desktop tools that run offline." },
  { name: "Bootstrap", mark: "Bs", category: "Framework", usedFor: "The responsive Bella's Takoyaki business website." },
  { name: "Tailwind CSS", mark: "Tw", category: "Framework", usedFor: "This website — every style on this page." },
  { name: "MySQL", mark: "My", category: "Database", usedFor: "Multi-user web apps where everyone shares one set of records." },
  { name: "SQLite", mark: "Sq", category: "Database", usedFor: "MedSys's offline patient and maternal records." },
  { name: "Git & GitHub", mark: "Gt", category: "Tooling", usedFor: "Version control and history for every project." },
];

/* ──────────────────────────── Work ──────────────────────────── */

export type WorkRow = {
  name: string;
  client: string;
  role: string;
  stack: string;
  year: string;
  note: string;
  /** A public link, with an honest status if it isn't finished. */
  live?: { href: string; label: string; status?: string };
  /** Featured projects get a screenshot and a full case-study layout. */
  featured?: {
    image: { src: string; width: number; height: number; alt: string };
    /** "browser" draws an address bar; "window" for desktop-app captures
        that already include their own title bar. */
    chrome: "browser" | "window";
    chromeTitle?: string;
    features: string[];
  };
};

export const work: WorkRow[] = [
  {
    name: "Student Portal",
    client: "Lyceum of the East-Aurora",
    role: "Full-stack",
    // TODO(confirm): stack and year are not visible in the screenshot.
    stack: "PHP, MySQL, HTML, CSS, JavaScript",
    year: "2025 — 2026",
    note:
      "Registration and cashiering system for the Lyceum of the East-Aurora. Students register once, choose the subjects their curriculum lists for the term, see exactly how their fees were computed, and keep every Official Receipt on record — while the Office of the Registrar reviews every application.",
    featured: {
      image: {
        src: "/work/lyceum-student-portal.png",
        width: 1353,
        height: 632,
        alt: "Lyceum of the East-Aurora student portal home page, headed 'Enroll, get assessed and pay, all in one place', with the enrollment period card showing 1st Semester, school year 2025–2026, enrollment open.",
      },
      chrome: "browser",
      chromeTitle: "Lyceum of the East-Aurora — Registration and Cashiering",
      features: [
        "Student registration & accounts",
        "Registrar review of applications",
        "Subject selection by curriculum",
        "Fee assessment breakdown",
        "Cashiering & Official Receipts",
        "Enrollment periods per semester",
      ],
    },
  },
  {
    name: "MedSys",
    client: "Dr. Andres Aragon Angara Health Center & Birthing Facility",
    role: "Capstone · Full-stack",
    stack: "Electron, SQLite, HTML",
    year: "2026",
    note:
      "Integrated medical records and patient management system. Handles patient check-ins and medical histories, with a digital record module that replaces the paper forms used for maternal and birthing data.",
    featured: {
      image: {
        src: "/work/medsys-sign-in.png",
        width: 1337,
        height: 714,
        alt: "MedSys desktop app sign-in window with the MedSys logo and the name of Dr. Andres Aragon Angara Health Center & Birthing Facility, over a photo of the health center.",
      },
      chrome: "window",
      features: [
        "Accounts issued by the records supervisor",
        "Patient check-ins",
        "Medical histories",
        "Digital maternal & birthing records",
        "Replaces paper forms",
        "Runs as a desktop app",
      ],
    },
  },
  {
    name: "Bella's Takoyaki",
    client: "Local establishment, Baler, Aurora",
    role: "Freelance · Frontend",
    stack: "HTML, CSS, JavaScript, Bootstrap",
    year: "2026",
    note:
      "Designed, developed and deployed a responsive business website for a takoyaki stall in Baler — the menu, ordering, payment and contact in one place — building interactive interface features to improve brand visibility and customer engagement.",
    live: {
      href: "https://bellas-takoyaki.vercel.app/",
      label: "bellas-takoyaki.vercel.app",
      status: "Work in progress",
    },
    featured: {
      image: {
        src: "/work/bellas-takoyaki.png",
        width: 1352,
        height: 680,
        alt: "Bella's Takoyaki website home page headed 'Takoyaki worth queueing for.', with See the menu and Ask a question buttons over a photo of takoyaki, and an Order cart in the navigation.",
      },
      chrome: "browser",
      chromeTitle: "bellas-takoyaki.vercel.app",
      features: [
        "Menu of ten takoyaki flavours",
        "Order cart",
        "How to order & payment",
        "Ask-a-question chat",
        "Responsive layout",
        "Deployed on Vercel",
      ],
    },
  },
  {
    name: "Desktop software projects",
    client: "Self-directed",
    role: "Developer",
    stack: "Electron.js, Node.js",
    year: "2025 — 2026",
    note:
      "Self-contained, cross-platform desktop applications with offline database interactions and administrative workflow automation.",
  },
];

/* ──────────────────────────── About ──────────────────────────── */

export const about = {
  heading: {
    before: "Where I",
    emphasis: "come from",
    after: ".",
  },
  paragraphs: [
    "I came to software through the ICT track at senior high school and stayed for the parts that are unglamorous — data that has to be right, forms that replace paper, interfaces that have to work on whatever machine is already on the desk.",
    "Electron is most of my desktop work because it puts a real database on a real machine without asking a clinic or a food stall to maintain a server. For anything many people share — a school's records, a portal — it's PHP and MySQL.",
  ],
};

export const education = [
  {
    school: "Aurora State College of Technology",
    place: "Baler, Aurora",
    entries: [
      { credential: "BS Information Technology", period: "2026 — 2027", current: true },
      { credential: "Associate in Information Technology", period: "2024 — 2025", current: false },
    ],
  },
  {
    school: "Dingalan National High School",
    place: "Dingalan, Aurora",
    entries: [
      { credential: "Senior High School, TVL Track — ICT", period: "2022 — 2023", current: false },
    ],
  },
];

export const certificate = {
  title: "Basic Photography",
  issuer: "ASCOT — School of Distance and Online Education (SDOE)",
  date: "30 June 2023",
};

/* ──────────────────────────── Close ──────────────────────────── */

export const close = {
  heading: {
    before: "Open to work, and to",
    emphasis: "difficult requirements",
    after: ".",
  },
  fineprint:
    "Currently finishing a BS in Information Technology at ASCOT. Available for freelance and project-based work — portals, websites and desktop systems.",
};
