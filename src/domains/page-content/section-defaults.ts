import { m } from "@/paraglide/messages"
import type { Locale } from "@/lib/schemas"

/**
 * Built-in defaults for the CMS-editable home sections — the single source
 * shared by the public components (ambient locale) and the admin pages
 * editor (both locales pinned), so the two can't drift.
 */

const opts = (locale?: Locale) => (locale ? { locale } : undefined)

export const homeHeroDefaults = (locale?: Locale) => ({
  date: m.home_hero_date({}, opts(locale)),
  title: m.home_hero_title({}, opts(locale)),
  tagline: m.home_hero_tagline({}, opts(locale)),
  button: m.home_hero_button({}, opts(locale)),
  slides: [
    {
      title: m.home_hero_slide_beautiful_lome_title({}, opts(locale)),
      location: m.home_hero_slide_beautiful_lome_location({}, opts(locale)),
    },
    {
      title: m.home_hero_slide_cultural_heritage_title({}, opts(locale)),
      location: m.home_hero_slide_cultural_heritage_location({}, opts(locale)),
    },
    {
      title: m.home_hero_slide_modern_lome_title({}, opts(locale)),
      location: m.home_hero_slide_modern_lome_location({}, opts(locale)),
    },
  ],
})

export const homeStatsDefaults = (locale?: Locale) => {
  const labels = [
    m.home_stats_participants_label({}, opts(locale)),
    m.home_stats_countries_label({}, opts(locale)),
    m.home_stats_speakers_label({}, opts(locale)),
    m.home_stats_startups_label({}, opts(locale)),
    m.home_stats_partners_label({}, opts(locale)),
    m.home_stats_investors_label({}, opts(locale)),
  ]
  const values = [3000, 50, 150, 200, 100, 50]
  return {
    items: values.map((value, i) => ({
      value,
      suffix: "+",
      label: labels[i] ?? "",
    })),
  }
}

export const homeDialoguesDefaults = (locale?: Locale) => ({
  label: m.home_dialogues_label({}, opts(locale)),
  title: m.home_dialogues_title({}, opts(locale)),
  subtitle: m.home_dialogues_subtitle({}, opts(locale)),
  items: [
    {
      title: m.home_dialogues_presidential_title({}, opts(locale)),
      text: m.home_dialogues_presidential_text({}, opts(locale)),
    },
    {
      title: m.home_dialogues_ministerial_title({}, opts(locale)),
      text: m.home_dialogues_ministerial_text({}, opts(locale)),
    },
    {
      title: m.home_dialogues_practitioners_title({}, opts(locale)),
      text: m.home_dialogues_practitioners_text({}, opts(locale)),
    },
    {
      title: m.home_dialogues_startup_investor_title({}, opts(locale)),
      text: m.home_dialogues_startup_investor_text({}, opts(locale)),
    },
    {
      title: m.home_dialogues_ai_summit_title({}, opts(locale)),
      text: m.home_dialogues_ai_summit_text({}, opts(locale)),
    },
    {
      title: m.home_dialogues_awards_gala_title({}, opts(locale)),
      text: m.home_dialogues_awards_gala_text({}, opts(locale)),
    },
  ],
})
