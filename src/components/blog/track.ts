// Blog engagement events for the /admin "Blog stats" page.
export function trackBlog(slug: string, e: "read50" | "read100" | "click" | "share", label = "") {
  const body = JSON.stringify({ s: "pacific", u: location.href, e, p: slug, l: label });
  try {
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "text/plain" }))) {
      fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  } catch {}
}
