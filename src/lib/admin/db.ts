import "server-only";
import path from "path";
import { MIGRATIONS } from "./schema";

// PostgreSQL access for the admin (posts, accounts, sessions, analytics).
//
// Production: any Postgres via DATABASE_URL (recommended: Neon from the
// Vercel Marketplace, which sets DATABASE_URL / POSTGRES_URL with TLS).
// Local development without it: PGlite, a real Postgres compiled to
// WebAssembly that stores its files in .data/pglite. Same SQL everywhere.
//
// Every query is parameterized ($1, $2…). Never build SQL from user input.

type Row = Record<string, unknown>;
export type Q = <T extends Row = Row>(text: string, params?: unknown[]) => Promise<T[]>;

type Driver = {
  query: Q;
  /** Runs fn inside BEGIN/COMMIT on one connection; rolls back on error. */
  tx: <T>(fn: (q: Q) => Promise<T>) => Promise<T>;
};

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
export const dbConfigured = Boolean(url);
/** On a deployed server without a database nothing can be saved. */
export const dbMissing = !url && process.env.VERCEL === "1";

const g = globalThis as unknown as { __pfrDb?: Promise<Driver> };

async function pgDriver(): Promise<Driver> {
  const { Pool } = await import("pg");
  const pool = new Pool({
    connectionString: url,
    // Serverless: few connections per instance; Neon's pooler fans them in.
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
    query_timeout: 15_000,
    // Neon and other hosted Postgres require TLS; verify the certificate.
    ssl: /localhost|127\.0\.0\.1/.test(url!) ? undefined : { rejectUnauthorized: true },
  });
  pool.on("error", (e) => console.error("[db] idle client error", e.message));
  const query: Q = async (text, params) => (await pool.query(text, params as unknown[])).rows;
  return {
    query,
    tx: async (fn) => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const out = await fn(async (t, p) => (await client.query(t, p as unknown[])).rows);
        await client.query("COMMIT");
        return out;
      } catch (e) {
        await client.query("ROLLBACK").catch(() => {});
        throw e;
      } finally {
        client.release();
      }
    },
  };
}

async function pgliteDriver(): Promise<Driver> {
  if (process.env.VERCEL === "1") throw new Error("DATABASE_URL is not set. Connect a Postgres database (Neon) in Vercel → Storage.");
  const { PGlite } = await import("@electric-sql/pglite");
  const db = await PGlite.create(path.join(process.cwd(), ".data", "pglite"));
  const query: Q = async (text, params) => (await db.query(text, params as unknown[])).rows as never;
  return {
    query,
    tx: (fn) => db.transaction((t) => fn(async (text, params) => (await t.query(text, params as unknown[])).rows as never)),
  };
}

async function connect(): Promise<Driver> {
  const d = url ? await pgDriver() : await pgliteDriver();
  await migrate(d);
  return d;
}

function driver() {
  // One connection pool per server instance (survives dev hot reloads).
  if (!g.__pfrDb) {
    g.__pfrDb = connect().catch((e) => {
      g.__pfrDb = undefined;
      throw e;
    });
  }
  return g.__pfrDb;
}

export const sql: Q = async (text, params) => (await driver()).query(text, params);
export const transaction = async <T>(fn: (q: Q) => Promise<T>) => (await driver()).tx(fn);

// ---------------------------------------------------------------------------
// Migrations: applied in order, once, inside a transaction holding an advisory
// lock so two cold-starting servers can't run them at the same time.

async function migrate(d: Driver) {
  await d.tx(async (q) => {
    await q("SELECT pg_advisory_xact_lock(7261531)");
    await q(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version int PRIMARY KEY,
      name text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    const done = new Set((await q<{ version: number }>("SELECT version FROM schema_migrations")).map((r) => r.version));
    for (const m of MIGRATIONS) {
      if (done.has(m.version)) continue;
      for (const stmt of m.up) await q(stmt);
      if (m.run) await m.run(q);
      await q("INSERT INTO schema_migrations (version, name) VALUES ($1, $2)", [m.version, m.name]);
      console.log(`[db] applied migration ${m.version} ${m.name}`);
    }
  });
}
