import "server-only";
import { Resend } from "resend";
import { requestInfo } from "./security";
import { site } from "@/lib/site";

// Security emails to the account owner (best-effort; never blocks sign-in).

function device(ua: string) {
  const os = /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : "a device";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "a browser";
  return `${browser} on ${os}`;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function send(to: string, subject: string, lines: string[]) {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith("your_")) return;
  const from = process.env.RESEND_FROM || "Lara Gabriele Website <onboarding@resend.dev>";
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#15212c">${lines.map((l) => `<p>${l}</p>`).join("")}</div>`;
  await new Resend(key).emails.send({ from, to, subject, html, text: lines.map((l) => l.replace(/<[^>]+>/g, "")).join("\n\n") });
}

export async function notifyNewSignIn(email: string, name: string) {
  const { ip, ua, city } = await requestInfo();
  const when = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" });
  await send(email, "New sign-in to your website admin", [
    `Hi ${esc(name.split(" ")[0])},`,
    `Someone just signed in to the Pacific Friendly Realty admin with your account.`,
    `<b>When:</b> ${esc(when)} (San Diego time)<br><b>Device:</b> ${esc(device(ua))}<br><b>Where:</b> ${esc(city || "unknown")} (${esc(ip)})`,
    `If this was you, there's nothing to do.`,
    `If it wasn't, open <a href="${site.url}/admin/account">${site.url}/admin/account</a> right away, change your password and click “Sign out everywhere else”.`,
  ]);
}

export async function notifyPasswordChanged(email: string, name: string) {
  const { ip, city } = await requestInfo();
  await send(email, "Your admin password was changed", [
    `Hi ${esc(name.split(" ")[0])},`,
    `The password for your Pacific Friendly Realty admin account was just changed (${esc(city || "unknown location")}, ${esc(ip)}). All other devices were signed out.`,
    `If you didn't do this, contact Emerson immediately.`,
  ]);
}
