import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

/**
 * Type-safe environment (design §10). One `env.ts` for the whole app:
 * server secrets + client vars, validated at boot so misconfiguration fails
 * fast rather than surfacing as a runtime null deep in a handler.
 *
 * - Critical server secrets are REQUIRED (no defaults) — a deliberate step up
 *   from the reference apps' all-optional style.
 * - Server vars are never bundled to the browser: env-core only validates the
 *   client block when `isServer` is false, and throws if a server var is read
 *   client-side.
 */
export const env = createEnv({
  /** Available on both server and client. */
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },

  server: {
    // --- Database ---
    DATABASE_URL: z.url(),

    // --- Auth (better-auth) ---
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),

    // --- Email (Resend) ---
    RESEND_API_KEY: z.string().min(1),
    MAIL_DEFAULT_EMAIL: z.email(),
    MAIL_DEFAULT_NAME: z.string().min(1),
    MAIL_REPLY_TO: z.email().optional(),

    // --- Payments (Stripe Checkout). Unset = reservation-only registration. ---
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

    // --- Object storage (SeaweedFS S3) — 9 vars ---
    STORAGE_ENDPOINT: z.url(),
    STORAGE_REGION: z.string().min(1),
    STORAGE_ACCESS_KEY: z.string().min(1),
    STORAGE_SECRET_KEY: z.string().min(1),
    STORAGE_PRIVATE_BUCKET: z.string().min(1),
    STORAGE_PUBLIC_BUCKET: z.string().min(1),
    // Optional: falls back to `${STORAGE_ENDPOINT}/${STORAGE_PUBLIC_BUCKET}` in getPublicUrl().
    STORAGE_PUBLIC_BASE_URL: z.url().optional(),
    STORAGE_FORCE_PATH_STYLE: z.stringbool().default(true),
    STORAGE_AUTO_CREATE_BUCKET: z.stringbool().default(true),

    // --- Seed ---
    SEED_ADMIN_PASSWORD: z.string().min(1),
  },

  clientPrefix: "VITE_",
  client: {
    VITE_PUBLIC_SITE_URL: z.url(),
  },

  /**
   * Explicit map so both runtimes resolve: the TanStack Start server runs in
   * Node (full `process.env`); the browser build reads VITE_ vars that Vite
   * statically injects into `import.meta.env`.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,

    RESEND_API_KEY: process.env.RESEND_API_KEY,
    MAIL_DEFAULT_EMAIL: process.env.MAIL_DEFAULT_EMAIL,
    MAIL_DEFAULT_NAME: process.env.MAIL_DEFAULT_NAME,
    MAIL_REPLY_TO: process.env.MAIL_REPLY_TO,

    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

    STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT,
    STORAGE_REGION: process.env.STORAGE_REGION,
    STORAGE_ACCESS_KEY: process.env.STORAGE_ACCESS_KEY,
    STORAGE_SECRET_KEY: process.env.STORAGE_SECRET_KEY,
    STORAGE_PRIVATE_BUCKET: process.env.STORAGE_PRIVATE_BUCKET,
    STORAGE_PUBLIC_BUCKET: process.env.STORAGE_PUBLIC_BUCKET,
    STORAGE_PUBLIC_BASE_URL: process.env.STORAGE_PUBLIC_BASE_URL,
    STORAGE_FORCE_PATH_STYLE: process.env.STORAGE_FORCE_PATH_STYLE,
    STORAGE_AUTO_CREATE_BUCKET: process.env.STORAGE_AUTO_CREATE_BUCKET,

    SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD,

    // `import.meta.env` only exists under Vite — CLI tools (drizzle-kit,
    // better-auth CLI, node scripts) load this module too, so fall back.
    VITE_PUBLIC_SITE_URL:
      typeof import.meta.env !== "undefined"
        ? import.meta.env.VITE_PUBLIC_SITE_URL
        : process.env.VITE_PUBLIC_SITE_URL,
  },

  /** Treat "" as unset so blank optional vars fall through to defaults. */
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
