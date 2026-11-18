import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { getAdmin, type AdminUser } from "./auth";

/** CORS for the public endpoints the two static sites call. */
export const PUBLIC_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export function preflight() {
  return new NextResponse(null, { status: 204, headers: PUBLIC_CORS });
}

/** Admin responses must never be cached by browsers or proxies. */
export const NO_STORE = { "Cache-Control": "no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" };

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: NO_STORE });
}

export function json(data: unknown, init: { status?: number; headers?: Record<string, string> } = {}) {
  return NextResponse.json(data, { status: init.status, headers: { ...NO_STORE, ...init.headers } });
}

/**
 * Cross-site request forgery protection for anything that changes data:
 * the browser must say the request comes from this same site.
 * (Sec-Fetch-Site is sent by all modern browsers; Origin is the fallback.)
 */
export function sameOrigin(req: NextRequest) {
  const site = req.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

/** Reads a JSON body with a size cap (default 2 MB). */
export async function readJson<T = Record<string, unknown>>(req: NextRequest, maxBytes = 2_000_000): Promise<T | null> {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > maxBytes) return null;
  const text = await req.text().catch(() => "");
  if (!text || text.length > maxBytes) return null;
  try {
    const v = JSON.parse(text);
    return v && typeof v === "object" ? (v as T) : null;
  } catch {
    return null;
  }
}

/** Admin API guard: a valid session, and for writes a same-site request. */
export async function adminApi(req: NextRequest): Promise<AdminUser | NextResponse> {
  if (req.method !== "GET" && req.method !== "HEAD" && !sameOrigin(req)) return err("Request blocked.", 403);
  const user = await getAdmin();
  return user ?? err("Your session has ended. Please log in again.", 401);
}
