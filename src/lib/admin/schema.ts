import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Q } from "./db";

// Database schema, as ordered migrations. Never edit a migration that has
// shipped; add a new one instead.

export type Migration = { version: number; name: string; up: string[]; run?: (q: Q) => Promise<void> };

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: "initial schema",
    up: [
      // ---------- Accounts & security ----------
      `CREATE TABLE admin_users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text NOT NULL UNIQUE CHECK (email = lower(email) AND length(email) <= 254),
        name text NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
        password_hash text NOT NULL,
        password_changed_at timestamptz NOT NULL DEFAULT now(),
        totp_secret_enc text,
        totp_enabled boolean NOT NULL DEFAULT false,
        totp_last_step bigint NOT NULL DEFAULT 0,
        recovery_codes text[] NOT NULL DEFAULT '{}',
        failed_logins int NOT NULL DEFAULT 0,
        locked_until timestamptz,
        disabled boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now(),
        last_login_at timestamptz
      )`,
      // Only a SHA-256 of the session token is stored, so a database leak
      // can't be used to log in.
      `CREATE TABLE admin_sessions (
        id text PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
        mfa_pending boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now(),
        last_seen_at timestamptz NOT NULL DEFAULT now(),
        expires_at timestamptz NOT NULL,
        ip text,
        user_agent text
      )`,
      `CREATE INDEX admin_sessions_user_idx ON admin_sessions (user_id)`,
      `CREATE INDEX admin_sessions_expires_idx ON admin_sessions (expires_at)`,
      `CREATE TABLE rate_limits (
        key text PRIMARY KEY,
        count int NOT NULL,
        reset_at timestamptz NOT NULL
      )`,
      `CREATE TABLE audit_log (
        id bigserial PRIMARY KEY,
        at timestamptz NOT NULL DEFAULT now(),
        user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
        actor text,
        action text NOT NULL,
        target text,
        ip text,
        user_agent text,
        meta jsonb
      )`,
      `CREATE INDEX audit_log_at_idx ON audit_log (at DESC)`,

      // ---------- Blog ----------
      `CREATE TABLE posts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug) <= 100),
        title text NOT NULL DEFAULT '' CHECK (length(title) <= 200),
        excerpt text NOT NULL DEFAULT '' CHECK (length(excerpt) <= 400),
        excerpt_auto boolean NOT NULL DEFAULT true,
        cover_image text NOT NULL DEFAULT '',
        cover_alt text NOT NULL DEFAULT '',
        content_html text NOT NULL DEFAULT '' CHECK (length(content_html) <= 1000000),
        sites text[] NOT NULL DEFAULT '{pacific}' CHECK (sites <@ ARRAY['pacific','santafe','lomasverdes']),
        status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','published')),
        publish_at timestamptz,
        tags text[] NOT NULL DEFAULT '{}' CHECK (cardinality(tags) <= 8),
        featured boolean NOT NULL DEFAULT false,
        seo_title text NOT NULL DEFAULT '',
        seo_description text NOT NULL DEFAULT '',
        author text NOT NULL,
        updated_by text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz,
        CHECK (status = 'draft' OR publish_at IS NOT NULL)
      )`,
      // Public pages only ever read live (non-draft, not deleted) posts.
      `CREATE INDEX posts_live_idx ON posts (publish_at DESC) WHERE deleted_at IS NULL AND status <> 'draft'`,
      `CREATE INDEX posts_sites_idx ON posts USING gin (sites)`,
      `CREATE TABLE post_revisions (
        id bigserial PRIMARY KEY,
        post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        at timestamptz NOT NULL,
        by text NOT NULL,
        status text NOT NULL,
        title text NOT NULL,
        excerpt text NOT NULL,
        cover_image text NOT NULL,
        content_html text NOT NULL
      )`,
      `CREATE INDEX post_revisions_post_idx ON post_revisions (post_id, id DESC)`,

      // ---------- Analytics (aggregated counts only; no IP addresses) ----------
      // metric: pv, uv, leads, page, ref, geo, dev, hour, ev, clk
      `CREATE TABLE stat_daily (
        site text NOT NULL,
        day date NOT NULL,
        metric text NOT NULL,
        key text NOT NULL DEFAULT '',
        count bigint NOT NULL DEFAULT 0,
        PRIMARY KEY (site, day, metric, key)
      )`,
      `CREATE INDEX stat_daily_day_idx ON stat_daily (day, metric)`,
      // Anonymous per-day visitor ids (hash with a random salt that is
      // deleted after 2 days), used only to count unique visitors.
      `CREATE TABLE stat_visitors (
        site text NOT NULL,
        day date NOT NULL,
        visitor text NOT NULL,
        PRIMARY KEY (site, day, visitor)
      )`,
      `CREATE TABLE stat_salts (day date PRIMARY KEY, salt text NOT NULL)`,
      `CREATE TABLE stat_live (
        site text NOT NULL,
        visitor text NOT NULL,
        seen_at timestamptz NOT NULL,
        PRIMARY KEY (site, visitor)
      )`,
    ],
  },
  {
    version: 2,
    name: "import local test data from the old key-value store (development only)",
    up: [],
    run: importLegacyKv,
  },
];

/** One-time copy of .data/store.json (the previous local store) into Postgres. */
async function importLegacyKv(q: Q) {
  if (process.env.VERCEL === "1") return;
  let store: Record<string, unknown>;
  try {
    store = JSON.parse(await fs.readFile(path.join(process.cwd(), ".data", "store.json"), "utf8"));
  } catch {
    return;
  }
  const posts = (store["blog:posts"] ?? {}) as Record<string, string>;
  for (const raw of Object.values(posts)) {
    const p = JSON.parse(raw);
    await q(
      `INSERT INTO posts (id, slug, title, excerpt, excerpt_auto, cover_image, cover_alt, content_html, sites, status, publish_at,
         tags, featured, seo_title, seo_description, author, updated_by, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) ON CONFLICT DO NOTHING`,
      [
        p.id, p.slug, p.title ?? "", (p.excerpt ?? "").slice(0, 400), p.excerptAuto ?? false, p.coverImage ?? "", p.coverAlt ?? "",
        p.contentHtml ?? "", p.sites ?? ["pacific"], p.status, p.publishAt, p.tags ?? [], p.featured ?? false,
        p.seoTitle ?? "", p.seoDescription ?? "", p.author ?? "Admin", p.updatedBy ?? "Admin", p.createdAt, p.updatedAt,
      ],
    );
    for (const r of ((store[`blog:rev:${p.id}`] ?? []) as string[]).slice().reverse()) {
      const rev = JSON.parse(r);
      await q(
        `INSERT INTO post_revisions (post_id, at, by, status, title, excerpt, cover_image, content_html) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [p.id, rev.at, rev.by, rev.status, rev.title, rev.excerpt, rev.coverImage, rev.contentHtml],
      );
    }
  }
  // Analytics: a:{site}:{day}:{metric}
  const rows: [string, string, string, string, number][] = [];
  for (const [k, v] of Object.entries(store)) {
    const m = k.match(/^a:(pacific|santafe|lomasverdes):(\d{4}-\d{2}-\d{2}):(\w+)$/);
    if (!m) continue;
    const [, site, day, dim] = m;
    const metric = { pv: "pv", uv: "uv", leads: "leads", pages: "page", refs: "ref", geo: "geo", dev: "dev", hours: "hour", ev: "ev", clk: "clk" }[dim];
    if (!metric) continue;
    if (dim === "uv") rows.push([site, day, "uv", "", (v as string[]).length]);
    else if (typeof v === "string") rows.push([site, day, metric, "", Number(v)]);
    else for (const [key, n] of Object.entries(v as Record<string, number>)) rows.push([site, day, metric, key, Number(n)]);
  }
  for (const r of rows) {
    await q(`INSERT INTO stat_daily (site, day, metric, key, count) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`, r);
  }
  console.log(`[db] imported ${Object.keys(posts).length} posts and ${rows.length} stat rows from .data/store.json`);
}
