"use client";

// Jumps to the contact form with an intent pre-selected (and an optional
// starter message), so leads arrive already labelled.
export default function IntentLink({
  intent,
  message,
  className,
  children,
}: {
  intent: string;
  message?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href="#contact"
      className={className}
      onClick={() => {
        const radio = document.querySelector<HTMLInputElement>(
          `#contact input[name="intent"][value="${intent}"]`
        );
        if (radio) radio.checked = true;
        const textarea = document.querySelector<HTMLTextAreaElement>("#contact textarea[name='message']");
        if (message && textarea && !textarea.value.trim()) textarea.value = message;
      }}
    >
      {children}
    </a>
  );
}
