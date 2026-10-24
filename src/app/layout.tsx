import type { Metadata, Viewport } from "next";
import { Azeret_Mono, Instrument_Serif } from "next/font/google";
import { profile } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import { bodyFont } from "@/lib/fonts";
import "./globals.css";

/* Instrument Serif ships a single weight with a true italic — the
   italic is reserved for the emphasised phrase set in pigment. */
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const azeretMono = Azeret_Mono({
  variable: "--font-azeret-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Absolute base for the link-preview image (app/opengraph-image.png)
  // and canonical URL — the Vercel production domain once deployed.
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.fullName} — ${profile.discipline}`,
    template: `%s — ${profile.fullName}`,
  },
  description: profile.lede,
  keywords: [
    profile.fullName,
    "web developer",
    "PHP developer",
    "Electron developer",
    "desktop application developer",
    "Baler Aurora",
    "Philippines",
    "ASCOT",
  ],
  authors: [{ name: profile.fullName }],
  creator: profile.fullName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "/",
    title: `${profile.fullName} — ${profile.discipline}`,
    description: profile.lede,
    siteName: profile.fullName,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.fullName} — ${profile.discipline}`,
    description: profile.lede,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#181614",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${azeretMono.variable} ${bodyFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
              var r=document.documentElement;
              if(location.pathname!=='/'||location.hash||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
              try{if(sessionStorage.getItem('pronto:entry-seen'))return}catch(e){}
              function lock(){var s=document.getElementById('portfolio-content');if(s&&r.classList.contains('entry-active')){s.inert=true;s.setAttribute('aria-busy','true')}}
              function cleanup(){document.removeEventListener('DOMContentLoaded',lock);document.removeEventListener('keydown',key);document.removeEventListener('click',click);window.removeEventListener('portfolio:entry-complete',cleanup)}
              function unlock(){
                clearTimeout(window.__entryFailsafe);cleanup();r.classList.remove('entry-active','entry-leaving');
                var s=document.getElementById('portfolio-content');if(s){s.inert=false;s.removeAttribute('aria-busy')}
                try{sessionStorage.setItem('pronto:entry-seen','1')}catch(e){}
                dispatchEvent(new Event('portfolio:entry-complete'));
              }
              function key(e){if(e.key==='Escape')unlock()}
              function click(e){if(e.target instanceof Element&&e.target.closest('[data-entry-skip]'))unlock()}
              r.classList.add('entry-active');
              if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',lock,{once:true});else lock();
              document.addEventListener('keydown',key);document.addEventListener('click',click);
              window.addEventListener('portfolio:entry-complete',cleanup,{once:true});
              window.__entryFailsafe=setTimeout(unlock,3500);
            }catch(e){}})()`,
          }}
        />
        {/*
          Decide about motion before first paint, so reveal blocks are
          never visible-then-hidden. The failsafe timer means a broken
          or blocked hydration shows the page rather than leaving it
          permanently invisible; Reveal.tsx clears it on mount.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var r=document.documentElement;r.classList.add('anim');window.__revealFailsafe=setTimeout(function(){r.classList.remove('anim')},3000)}}catch(e){}})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
