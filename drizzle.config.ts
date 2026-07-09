import { defineConfig } from "drizzle-kit"

/**
 * drizzle-kit runs outside Vite, so it can't import `src/env.ts`
 * (that module reads `import.meta.env`). Load `.env` via Node's built-in
 * loader and read `DATABASE_URL` directly instead.
 */
try {
  process.loadEnvFile(".env")
} catch {
  // No .env file (e.g. CI supplies env directly) — fall through to process.env.
}

const url = process.env.DATABASE_URL
if (!url) {
  throw new Error("DATABASE_URL is required to run drizzle-kit (set it in .env)")
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema/index.ts",
  out: "./src/server/db/migrations",
  dbCredentials: { url },
  // Map camelCase TS columns → snake_case DB columns (matches the db client).
  casing: "snake_case",
  verbose: true,
  strict: true,
})
