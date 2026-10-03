import About from "@/components/About";
import Close from "@/components/Close";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import Practice from "@/components/Practice";
import Reveal from "@/components/Reveal";
import Services from "@/components/Services";
import Stack from "@/components/Stack";
import Work from "@/components/Work";

export default function Home() {
  return (
    <>
      <Reveal />
      <Nav />

      {/* Offset for the fixed 60px bar, so the hero is exactly the
          viewport minus the nav rather than starting underneath it. */}
      <main id="main" className="pt-[60px]">
        <Hero />
        <Practice />
        <Services />
        <Stack />
        <Work />
        <About />
        <Close />
      </main>

      {/* Outside <main>, so it is the page's footer landmark */}
      <Footer />
    </>
  );
}
