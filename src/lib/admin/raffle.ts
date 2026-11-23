import "server-only";
import { randomInt } from "crypto";
import { sql, transaction } from "./db";

export type RaffleEntry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  pie: string;
  marketingOk: boolean;
  createdAt: string;
  winnerAt: string | null;
};

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  pie: string;
  marketing_ok: boolean;
  created_at: Date | string;
  winner_at: Date | string | null;
};

const iso = (d: Date | string) => new Date(d).toISOString();
const toEntry = (r: Row): RaffleEntry => ({
  id: String(r.id),
  name: r.name,
  email: r.email,
  phone: r.phone,
  area: r.area,
  pie: r.pie,
  marketingOk: r.marketing_ok,
  createdAt: iso(r.created_at),
  winnerAt: r.winner_at ? iso(r.winner_at) : null,
});

export type NewEntry = { name: string; email: string; phone: string; area: string; pie: string; marketingOk: boolean; ip: string };

/** Saves an entry. Returns false when this email has already entered (one entry per person). */
export async function addEntry(raffle: string, e: NewEntry) {
  const rows = await sql(
    `INSERT INTO raffle_entries (raffle, name, email, phone, area, pie, marketing_ok, ip)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (raffle, email) DO NOTHING RETURNING id`,
    [raffle, e.name, e.email.toLowerCase(), e.phone, e.area, e.pie, e.marketingOk, e.ip],
  );
  return rows.length > 0;
}

export async function listEntries(raffle: string) {
  const rows = await sql<Row>(
    `SELECT id, name, email, phone, area, pie, marketing_ok, created_at, winner_at
     FROM raffle_entries WHERE raffle = $1 ORDER BY winner_at ASC NULLS LAST, created_at DESC`,
    [raffle],
  );
  return rows.map(toEntry);
}

/** Picks `count` random people who haven't won yet (crypto-grade randomness). */
export async function drawWinners(raffle: string, count: number) {
  return transaction(async (q) => {
    const pool = await q<{ id: string }>(`SELECT id FROM raffle_entries WHERE raffle = $1 AND winner_at IS NULL FOR UPDATE`, [raffle]);
    const ids = pool.map((r) => String(r.id));
    const picked: string[] = [];
    while (picked.length < count && ids.length) picked.push(ids.splice(randomInt(ids.length), 1)[0]);
    if (picked.length) {
      await q(`UPDATE raffle_entries SET winner_at = now() WHERE raffle = $1 AND id = ANY($2::bigint[])`, [raffle, picked]);
    }
    return picked;
  });
}

export async function unmarkWinner(raffle: string, id: string) {
  await sql(`UPDATE raffle_entries SET winner_at = NULL WHERE raffle = $1 AND id = $2`, [raffle, id]);
}

export function entriesCsv(entries: RaffleEntry[]) {
  const cell = (v: string) => {
    // Neutralize spreadsheet formulas, then quote.
    const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const head = ["Name", "Email", "Phone", "Area", "Pie", "Market updates OK", "Entered (UTC)", "Winner"];
  const lines = entries.map((e) =>
    [e.name, e.email, e.phone, e.area, e.pie, e.marketingOk ? "yes" : "no", e.createdAt, e.winnerAt ? "WINNER" : ""].map(cell).join(","),
  );
  return [head.map(cell).join(","), ...lines].join("\r\n");
}
