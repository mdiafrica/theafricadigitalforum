/**
 * Compiles paraglide output outside vite (typecheck, editors, CI) with the
 * exact options the vite plugin uses. Run via `pnpm i18n:compile`.
 */
import { compile } from "@inlang/paraglide-js"
import { paraglideOptions } from "../paraglide.config"

await compile(paraglideOptions)
