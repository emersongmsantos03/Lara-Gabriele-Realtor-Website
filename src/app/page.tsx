import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Paths from "@/components/Paths";
import HomeValuation from "@/components/HomeValuation";
import Areas from "@/components/Areas";
import Faq from "@/components/Faq";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import StickyMobileBar from "@/components/StickyMobileBar";
import BackToTop from "@/components/BackToTop";

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="flex-1">
        <Hero />
        <About />
        <Paths />
        <HomeValuation />
        <Areas />
        <Faq />
        <ContactSection />
      </main>
      <Footer />
      <StickyMobileBar />
      <BackToTop />
    </>
  );
}
