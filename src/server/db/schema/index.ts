/**
 * Drizzle schema barrel — the single source drizzle-kit reads for migrations.
 * Re-export every table module from here so `import * as schema` stays
 * complete.
 */
export * from "./auth"
export * from "./media"
export * from "./posts"
export * from "./submissions"
export * from "./content"
