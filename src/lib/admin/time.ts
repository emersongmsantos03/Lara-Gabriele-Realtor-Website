// Scheduling always uses San Diego time, whatever time zone the browser is in
// (Emerson may be posting from Brazil).

export const TZ = "America/Los_Angeles";

function tzOffsetMs(utc: number) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(utc))
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return asUtc - utc;
}

/** "2026-12-01" + "09:30" in San Diego time → ISO string (UTC). */
export function pacificToIso(date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const first = guess - tzOffsetMs(guess);
  // Second pass settles DST transitions.
  return new Date(guess - tzOffsetMs(first)).toISOString();
}

/** ISO → { date: "YYYY-MM-DD", time: "HH:mm" } in San Diego time. */
export function isoToPacific(iso: string) {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const time = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
  return { date, time };
}

export function formatPacific(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
