"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <a
      href="#top"
      aria-label="Back to top"
      className="fixed bottom-20 md:bottom-6 right-5 md:right-6 z-40 w-11 h-11 rounded-full bg-ink text-cream shadow-lg flex items-center justify-center hover:bg-gold hover:text-ink transition-colors"
    >
      <ArrowUp size={18} />
    </a>
  );
}
