// Font and size choices offered in the post editor. The CSS values are stored
// inline in post HTML, so they must work on all three sites: the CSS variables
// pick up the main site's fonts, the named fallbacks match the Santa Fe Hills /
// Lomas Verdes sites (Playfair Display + Montserrat).

export const FONT_OPTIONS = [
  { label: "Default font", value: "" },
  { label: "Elegant", value: "var(--font-display, 'Playfair Display'), Georgia, serif" },
  { label: "Clean", value: "var(--font-body, Montserrat), Helvetica, Arial, sans-serif" },
  { label: "Classic", value: "Georgia, 'Times New Roman', serif" },
  { label: "Typewriter", value: "'Courier New', Courier, monospace" },
];

export const SIZE_OPTIONS = [
  { label: "Small", value: "14px" },
  { label: "Normal size", value: "" },
  { label: "Large", value: "22px" },
  { label: "Extra large", value: "28px" },
  { label: "Huge", value: "36px" },
];

export const TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Navy", value: "#0e2b40" },
  { label: "Gray", value: "#5b6b77" },
  { label: "Orange", value: "#c9671f" },
  { label: "Teal", value: "#1b8a99" },
  { label: "Green", value: "#2f7d4f" },
  { label: "Red", value: "#b8452f" },
  { label: "Purple", value: "#6b4fa0" },
];

export const HIGHLIGHT_COLORS = [
  { label: "None", value: "" },
  { label: "Yellow", value: "#fff3a3" },
  { label: "Peach", value: "#ffd9bf" },
  { label: "Mint", value: "#cdeedd" },
  { label: "Sky", value: "#cfe8f6" },
  { label: "Pink", value: "#f8d3e0" },
];
