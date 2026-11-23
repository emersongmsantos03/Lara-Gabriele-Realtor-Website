import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { recordLead } from "@/lib/admin/analytics";
import { addEntry } from "@/lib/admin/raffle";
import { memoryLimit, rateLimit } from "@/lib/admin/security";
import { leadHtml, leadSubject, leadText, type Lead } from "@/lib/lead-email";
import { PIES, RAFFLE_AREAS, raffle, raffleOpen } from "@/lib/raffle";

// Same inboxes as the contact form.
const LEAD_EMAILS = [
  "larag.realty@gmail.com",
  "lara.gabriele@exprealty.com",
  "lara@pacificfriendlyrealty.com",
  "emerson@wisprnetwork.com",
];
const FROM = process.env.RESEND_FROM || "Lara Gabriele Website <onboarding@resend.dev>";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(request: NextRequest) {
  if (!raffleOpen()) return fail("The raffle is closed — thank you for stopping by!", 410);

  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const tooMany = "Too many tries. Please wait a few minutes and try again.";
  if (!memoryLimit(`raffle:${ip}`, 10, 10 * 60_000)) return fail(tooMany, 429);
  if (!(await rateLimit(`raffle:${ip}`, 6, 600).catch(() => true))) return fail(tooMany, 429);
  if (Number(request.headers.get("content-length") || 0) > 10_000) return fail("Request is too large.", 413);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) ?? {};
  } catch {
    return fail("Invalid request.");
  }

  // Honeypot: real people never see or fill this field.
  if (str(body.company, 200)) return NextResponse.json({ ok: true });

  const name = str(body.name, 120);
  const email = str(body.email, 254).toLowerCase();
  const phone = str(body.phone, 30);
  const area = RAFFLE_AREAS.includes(str(body.area, 80)) ? str(body.area, 80) : "";
  const pie = PIES.find((p) => p.id === body.pie)?.label ?? "Surprise me";
  const marketingOk = body.marketingOk === true;

  if (name.length < 2) return fail("Please enter your name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Please enter a valid email.");
  if (!area) return fail("Please choose your area.");
  if (body.agree !== true) return fail("Please confirm you're 18+ and agree to the rules.");

  let isNew: boolean;
  try {
    isNew = await addEntry(raffle.id, { name, email, phone, area, pie, marketingOk, ip });
  } catch (e) {
    console.error("[raffle] could not save entry", e);
    return fail("We couldn't save your entry. Please try again in a minute.", 500);
  }
  if (!isNew) return NextResponse.json({ ok: true, already: true });

  // Let Lara's team know. An email hiccup never loses the entry: it's already saved.
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const lead: Lead = { kind: "raffle", name, email, phone: phone || undefined, area, pie, marketingOk };
    const ctx = {
      pageUrl: request.headers.get("referer") ?? undefined,
      device: (/Mobi|Android|iPhone/i.test(request.headers.get("user-agent") ?? "") ? "Mobile" : "Desktop") as "Mobile" | "Desktop",
      receivedAt: new Date(),
    };
    const resend = new Resend(apiKey);
    await resend.emails
      .send({ from: FROM, to: LEAD_EMAILS, replyTo: email, subject: leadSubject(lead), html: leadHtml(lead, ctx), text: leadText(lead, ctx) })
      .then(({ error }) => error && console.error("[raffle] Resend error:", error))
      .catch((e) => console.error("[raffle] email failed", e));
  }
  await recordLead("pacific").catch(() => {});

  return NextResponse.json({ ok: true });
}
