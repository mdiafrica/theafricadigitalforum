import { en } from "./en"
import { fr } from "./fr"

export type Lang = "en" | "fr"

/** The English tree is the source of truth for the translation shape. */
export type Translation = typeof en

export const i18n: Record<Lang, Translation> = {
  en,
  fr: fr satisfies Translation,
}

export const LANGUAGES: Lang[] = ["en", "fr"]
