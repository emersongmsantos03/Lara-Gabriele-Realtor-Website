import { NextResponse, type NextRequest } from "next/server";
import { adminApi, err, json, readJson } from "@/lib/admin/http";
import { drawWinners, entriesCsv, listEntries, unmarkWinner } from "@/lib/admin/raffle";
import { audit } from "@/lib/admin/security";
import { raffle } from "@/lib/raffle";

/** Downloads every raffle entry as a spreadsheet (CSV). */
export async function GET(req: NextRequest) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  const entries = await listEntries(raffle.id);
  await audit("raffle.exported", user, raffle.id, { entries: entries.length });
  return new NextResponse("﻿" + entriesCsv(entries), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${raffle.id}-entries.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

/** { action: "draw", count } picks random winners; { action: "unmark", id } removes one. */
export async function POST(req: NextRequest) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  const body = await readJson<{ action?: string; count?: number; id?: string }>(req, 10_000);
  if (!body) return err("Invalid request.");

  if (body.action === "draw") {
    const count = Math.min(Math.max(1, Math.floor(Number(body.count) || 1)), 10);
    const picked = await drawWinners(raffle.id, count);
    await audit("raffle.drawn", user, raffle.id, { picked });
    return json({ ok: true, picked });
  }
  if (body.action === "unmark" && typeof body.id === "string" && /^\d+$/.test(body.id)) {
    await unmarkWinner(raffle.id, body.id);
    await audit("raffle.unmarked", user, raffle.id, { id: body.id });
    return json({ ok: true });
  }
  return err("Unknown action.");
}
