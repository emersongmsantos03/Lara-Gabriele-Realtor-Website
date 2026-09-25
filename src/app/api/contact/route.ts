import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const LEAD_EMAIL = "larag.realty@gmail.com";

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
    const { error } = await resend.emails.send({
      from: "Lara Gabriele Website <onboarding@resend.dev>",
      to: LEAD_EMAIL,
      replyTo: email,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Could not send message." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to send email:", err);
    return NextResponse.json({ error: "Could not send message." }, { status: 500 });
  }
}
