// Internal notification email for website leads — the message Lara's team
// receives, not anything a visitor sees. Email clients ignore <style> tags and
// modern CSS, so everything is table-based with inline styles.

import { site } from "./site";

export type LeadKind = "contact" | "valuation" | "subscribe";

export type Lead = {
  kind: LeadKind;
  name?: string;
  email: string;
  phone?: string;
  intent?: string;
  message?: string;
  address?: string;
  /** Neighborhood page the form was on, e.g. "Poway". */
  area?: string;
};

export type LeadContext = {
  /** Full URL of the page the visitor submitted from. */
  pageUrl?: string;
  /** Approximate visitor location from the hosting edge, e.g. "San Marcos, CA, US". */
  location?: string;
  device?: "Mobile" | "Desktop";
  receivedAt: Date;
};

const c = {
  ink: "#0e2b40",
  inkSoft: "#4a6273",
  gold: "#c9671f",
  goldLight: "#f4a259",
  sea: "#1b9aaa",
  cream: "#f8f4ec",
  creamDeep: "#eee6d6",
  line: "#e2dccf",
  white: "#ffffff",
};

const serif = "Georgia, 'Times New Roman', serif";
const sans = "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const kinds: Record<LeadKind, { label: string; emoji: string; color: string; next: string }> = {
  contact: {
    label: "New inquiry",
    emoji: "🏡",
    color: c.sea,
    next: "Reply today — the site promises a same-day response.",
  },
  valuation: {
    label: "Home value request",
    emoji: "📊",
    color: c.gold,
    next: "Prepare a CMA and send it within one business day, as promised on the site.",
  },
  subscribe: {
    label: "Listing alert signup",
    emoji: "🔔",
    color: c.ink,
    next: "Add them to the new-listings list in Flodesk.",
  },
};

function kindFor(lead: Lead) {
  if (lead.kind === "contact" && lead.intent === "Off-market homes") {
    return {
      label: "Off-market access request",
      emoji: "🔒",
      color: c.ink,
      next: "Qualify their search and share matching Wispr Properties homes privately.",
    };
  }
  return kinds[lead.kind];
}

function formatTime(date: Date) {
  return (
    date.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }) + " (Pacific)"
  );
}

function digits(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

export function leadSubject(lead: Lead) {
  const k = kindFor(lead);
  if (lead.kind === "valuation") return `${k.emoji} ${k.label}: ${lead.address}`;
  if (lead.kind === "subscribe") return `${k.emoji} ${k.label}: ${lead.email}`;
  const extras = [lead.intent, lead.area].filter(Boolean).join(" · ");
  return `${k.emoji} ${k.label} from ${lead.name}${extras ? ` — ${extras}` : ""}`;
}

function button(href: string, label: string, primary = false) {
  const bg = primary ? c.ink : c.white;
  const fg = primary ? c.cream : c.ink;
  return `<td style="padding:0 8px 8px 0;">
    <a href="${esc(href)}" style="display:inline-block;background:${bg};color:${fg};border:1px solid ${c.ink};border-radius:999px;padding:10px 18px;font-family:${sans};font-size:14px;font-weight:600;text-decoration:none;">${label}</a>
  </td>`;
}

function row(label: string, valueHtml: string) {
  return `<tr>
    <td style="padding:12px 0;border-bottom:1px solid ${c.line};width:130px;vertical-align:top;font-family:${sans};font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${c.inkSoft};">${label}</td>
    <td style="padding:12px 0;border-bottom:1px solid ${c.line};vertical-align:top;font-family:${sans};font-size:15px;line-height:1.5;color:${c.ink};">${valueHtml}</td>
  </tr>`;
}

function link(href: string, text: string) {
  return `<a href="${esc(href)}" style="color:${c.sea};text-decoration:none;">${esc(text)}</a>`;
}

export function leadHtml(lead: Lead, ctx: LeadContext) {
  const k = kindFor(lead);
  const who = lead.name?.trim() || lead.email;
  const headline = lead.kind === "valuation" && lead.address ? lead.address : who;
  const replySubject = encodeURIComponent(
    lead.kind === "valuation" ? `Your home value — ${lead.address}` : "Thanks for reaching out — Lara Gabriele"
  );

  const actions = [
    button(`mailto:${lead.email}?subject=${replySubject}`, "Reply by email", true),
    lead.phone ? button(`tel:${digits(lead.phone)}`, "Call") : "",
    lead.phone ? button(`sms:${digits(lead.phone)}`, "Text") : "",
  ].join("");

  const details = [
    lead.name ? row("Name", esc(lead.name)) : "",
    row("Email", link(`mailto:${lead.email}`, lead.email)),
    lead.phone ? row("Phone", link(`tel:${digits(lead.phone)}`, lead.phone)) : "",
    lead.intent ? row("Looking to", esc(lead.intent)) : "",
    lead.address
      ? row(
          "Property",
          `${esc(lead.address)}<br/><span style="font-size:13px;">${link(
            `https://www.google.com/maps/search/${encodeURIComponent(lead.address)}`,
            "Google Maps"
          )} &nbsp;·&nbsp; ${link(
            `https://www.zillow.com/homes/${encodeURIComponent(lead.address)}_rb/`,
            "Zillow"
          )}</span>`
        )
      : "",
    lead.area ? row("Neighborhood", esc(lead.area)) : "",
  ].join("");

  const message = lead.message?.trim()
    ? `<tr><td style="padding:8px 32px 0;">
        <p style="margin:0 0 8px;font-family:${sans};font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${c.inkSoft};">Message</p>
        <div style="background:${c.cream};border-left:3px solid ${k.color};border-radius:8px;padding:16px 18px;font-family:${sans};font-size:15px;line-height:1.6;color:${c.ink};">${esc(
          lead.message.trim()
        ).replace(/\n/g, "<br/>")}</div>
      </td></tr>`
    : "";

  const meta = [
    ctx.pageUrl ? `<strong style="color:${c.ink};">Page:</strong> ${link(ctx.pageUrl, ctx.pageUrl.replace(/^https?:\/\//, ""))}` : "",
    ctx.location ? `<strong style="color:${c.ink};">Visitor location (approx.):</strong> ${esc(ctx.location)}` : "",
    ctx.device ? `<strong style="color:${c.ink};">Device:</strong> ${ctx.device}` : "",
  ]
    .filter(Boolean)
    .join("<br/>");

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:${c.creamDeep};">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(k.label)} from ${esc(who)} via pacificfriendlyrealty.com</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.creamDeep};">
    <tr><td align="center" style="padding:28px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${c.white};border-radius:16px;overflow:hidden;">

        <tr><td style="background:${c.ink};padding:22px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-family:${serif};font-size:18px;color:${c.cream};">Pacific Friendly Realty</td>
            <td align="right" style="font-family:${sans};font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${c.goldLight};">Website lead</td>
          </tr></table>
        </td></tr>

        <tr><td style="height:4px;background:${k.color};line-height:4px;font-size:0;">&nbsp;</td></tr>

        <tr><td style="padding:28px 32px 8px;">
          <span style="display:inline-block;background:${k.color};color:${c.white};border-radius:999px;padding:5px 12px;font-family:${sans};font-size:12px;font-weight:600;letter-spacing:0.04em;">${k.emoji}&nbsp; ${esc(k.label)}</span>
          <h1 style="margin:16px 0 4px;font-family:${serif};font-size:28px;line-height:1.2;font-weight:normal;color:${c.ink};">${esc(headline)}</h1>
          <p style="margin:0;font-family:${sans};font-size:14px;color:${c.inkSoft};">${esc(formatTime(ctx.receivedAt))}</p>
        </td></tr>

        <tr><td style="padding:20px 32px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>${actions}</tr></table>
        </td></tr>

        <tr><td style="padding:0 32px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${details}</table>
        </td></tr>

        ${message}

        <tr><td style="padding:24px 32px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.cream};border-radius:10px;"><tr>
            <td style="padding:14px 18px;font-family:${sans};font-size:14px;line-height:1.5;color:${c.ink};">
              <strong style="color:${k.color};">Next step:</strong> ${esc(k.next)}
            </td>
          </tr></table>
        </td></tr>

        <tr><td style="padding:16px 32px 28px;font-family:${sans};font-size:12px;line-height:1.7;color:${c.inkSoft};">${meta}</td></tr>

        <tr><td style="background:${c.cream};border-top:1px solid ${c.line};padding:16px 32px;font-family:${sans};font-size:12px;line-height:1.6;color:${c.inkSoft};">
          Sent automatically by ${link(site.url, site.url.replace(/^https?:\/\//, ""))}. Replying to this email goes straight to ${esc(who)}.
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function leadText(lead: Lead, ctx: LeadContext) {
  const k = kindFor(lead);
  const block = (lines: (string | undefined)[]) => lines.filter(Boolean).join("\n");
  return [
    `${k.label.toUpperCase()} — ${site.url.replace(/^https?:\/\//, "")}`,
    block([
      lead.name && `Name: ${lead.name}`,
      `Email: ${lead.email}`,
      lead.phone && `Phone: ${lead.phone}`,
      lead.intent && `Looking to: ${lead.intent}`,
      lead.address && `Property: ${lead.address}`,
      lead.area && `Neighborhood: ${lead.area}`,
    ]),
    lead.message?.trim() && `Message:\n${lead.message.trim()}`,
    `Next step: ${k.next}`,
    block([
      `Received: ${formatTime(ctx.receivedAt)}`,
      ctx.pageUrl && `Page: ${ctx.pageUrl}`,
      ctx.location && `Visitor location (approx.): ${ctx.location}`,
      ctx.device && `Device: ${ctx.device}`,
    ]),
  ]
    .filter(Boolean)
    .join("\n\n");
}
