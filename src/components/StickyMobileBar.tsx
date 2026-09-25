import { Phone, MessageCircle } from "lucide-react";
import { site } from "@/lib/site";

export default function StickyMobileBar() {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-cream/95 backdrop-blur-md border-t border-line px-4 py-3 flex items-center gap-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
      <a
        href={site.phoneHref}
        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-ink/20 text-ink text-sm font-medium py-3"
      >
        <Phone size={16} className="text-gold" />
        Call Lara
      </a>
      <a
        href="#contact"
        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-ink text-cream text-sm font-medium py-3"
      >
        <MessageCircle size={16} className="text-gold-light" />
        Message
      </a>
    </div>
  );
}
