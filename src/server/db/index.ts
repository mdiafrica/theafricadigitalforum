import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { env } from "@/env"
import * as schema from "./schema"

/**
 * Server-only Drizzle client (postgres.js driver). Import only inside
 * server-fn handlers / server routes — never from client code.
 *
 * The connection is cached on `globalThis` in non-production so Vite HMR reuses
 * one pool instead of leaking a new one on every reload.
 */
const globalForDb = globalThis as unknown as {
  __adfPgClient?: ReturnType<typeof postgres>
}

const client = globalForDb.__adfPgClient ?? postgres(env.DATABASE_URL)
if (env.NODE_ENV !== "production") globalForDb.__adfPgClient = client

export const db = drizzle(client, { schema, casing: "snake_case" })

export type DB = typeof db
