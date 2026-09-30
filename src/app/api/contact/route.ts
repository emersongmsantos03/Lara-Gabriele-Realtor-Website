import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Every lead goes to all of these inboxes.
const LEAD_EMAILS = [
  "larag.realty@gmail.com",
  "lara.gabriele@exprealty.com",
  "lara@pacificfriendlyrealty.com",
  "emerson@wisprnetwork.com",
];

// Resend's shared test sender (onboarding@resend.dev) only delivers to the
// Resend account owner. Verify pacificfriendlyrealty.com in Resend and set
// RESEND_FROM (e.g. "Lara Gabriele Website <website@pacificfriendlyrealty.com>")
// so every address above receives leads.
const FROM = process.env.RESEND_FROM || "Lara Gabriele Website <onboarding@resend.dev>";
const usingTestSender = !process.env.RESEND_FROM;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, phone, message, address, type, intent, area } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const isSubscribe = type === "subscribe";
  const isValuation = type === "valuation";

  if (isValuation && (typeof address !== "string" || !address.trim())) {
    return NextResponse.json({ error: "A property address is required." }, { status: 400 });
  }

  if (!isSubscribe && !isValuation && (typeof name !== "string" || !name.trim())) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      "RESEND_API_KEY is not set. Add it to .env.local to enable email delivery."
    );
    return NextResponse.json(
      { error: "Email delivery isn't configured yet. Please try again later." },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);

  const subject = isSubscribe
    ? `New listing alert signup: ${email}`
    : isValuation
      ? `Home valuation request: ${address}`
      : `New website inquiry from ${name}${typeof area === "string" && area ? ` (${area})` : ""}`;

  const html = isSubscribe
    ? `<p>A visitor subscribed for new listing alerts.</p>
       <p><strong>Email:</strong> ${escapeHtml(email)}</p>`
    : isValuation
      ? `<p>A visitor requested a free home valuation.</p>
         <p><strong>Address:</strong> ${escapeHtml(String(address))}</p>
         <p><strong>Email:</strong> ${escapeHtml(email)}</p>
         ${phone && typeof phone === "string" ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}`
      : `<p>You have a new inquiry from your website.</p>
       <p><strong>Name:</strong> ${escapeHtml(String(name))}</p>
       <p><strong>Email:</strong> ${escapeHtml(email)}</p>
       ${phone && typeof phone === "string" ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
       ${intent && typeof intent === "string" ? `<p><strong>Looking to:</strong> ${escapeHtml(intent)}</p>` : ""}
       ${area && typeof area === "string" ? `<p><strong>Sent from:</strong> ${escapeHtml(area)} neighborhood page</p>` : ""}
       ${message && typeof message === "string" ? `<p><strong>Message:</strong><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>` : ""}`;

  try {
    const message = { from: FROM, replyTo: email, subject, html };
    const { error } = await resend.emails.send({ ...message, to: LEAD_EMAILS });

    if (error) {
      console.error("Resend error:", error);
      if (!usingTestSender) {
        return NextResponse.json({ error: "Could not send message." }, { status: 502 });
      }
      // The test sender rejects the whole message if any recipient isn't the
      // account owner. Fall back to one inbox at a time so the lead still
      // reaches whoever the sender can deliver to. Sequential and spaced out
      // to stay under Resend's rate limit.
      console.error("RESEND_FROM is not set — verify the domain in Resend to reach every inbox.");
      let delivered = 0;
      for (const to of LEAD_EMAILS) {
        const res = await resend.emails.send({ ...message, to });
        if (res.error) console.error(`Resend error for ${to}:`, res.error);
        else delivered++;
        await sleep(600);
      }
      if (!delivered) {
        return NextResponse.json({ error: "Could not send message." }, { status: 502 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to send email:", err);
    return NextResponse.json({ error: "Could not send message." }, { status: 500 });
  }
}
