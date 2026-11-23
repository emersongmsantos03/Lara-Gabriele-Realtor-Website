// Lara's Christmas Pie Raffle. Safe to import from client code.
// For next year's raffle, change `id` (entries are stored per id) and the dates.

export const raffle = {
  id: "pie-2026",
  path: "/pie-raffle",
  winners: 3,
  /** Last moment to enter: Sun, Dec 13, 11:59:59 p.m. Pacific. */
  closesAt: "2026-12-13T23:59:59-08:00",
  /** Drawing day, shown on the page. */
  drawOn: "2026-12-14",
  closesLabel: "Sun, Dec 13",
  drawLabel: "Mon, Dec 14",
};

export const PIES = [
  { id: "apple", label: "Apple", note: "Classic lattice, cinnamon" },
  { id: "pumpkin", label: "Pumpkin", note: "Spiced, silky, whipped cream" },
  { id: "pecan", label: "Pecan", note: "Buttery, toasted, a little gooey" },
  { id: "surprise", label: "Surprise me", note: "Lara picks a favorite" },
] as const;

export type PieId = (typeof PIES)[number]["id"];

export const RAFFLE_AREAS = [
  "San Marcos",
  "Poway",
  "Escondido",
  "Carlsbad",
  "Vista",
  "Rancho Bernardo",
  "4S Ranch",
  "Del Mar",
  "Other San Diego County",
];

export const raffleOpen = (now = Date.now()) => now <= new Date(raffle.closesAt).getTime();
