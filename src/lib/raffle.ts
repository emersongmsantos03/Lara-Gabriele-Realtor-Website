// Lara's Christmas Pie Raffle. People enter through Lara's Flodesk email;
// /pie-raffle is the thank-you page they land on afterwards.
// For next year's raffle, change the dates.

export const raffle = {
  path: "/pie-raffle",
  winners: 3,
  /** Entries close Sun, Dec 13, 11:59:59 p.m. Pacific; the countdown runs to this moment. */
  closesAt: "2026-12-13T23:59:59-08:00",
  closesLabel: "Sun, Dec 13",
  drawLabel: "Mon, Dec 14",
};
