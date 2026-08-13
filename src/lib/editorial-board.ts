/**
 * The collective byline shown when an article's author is an admin/owner or
 * missing. The live values are editable in admin → Pages (site /
 * editorial-board section); these are the built-in fallbacks.
 */
export const EDITORIAL_BOARD_DEFAULTS = {
  name: "ADF Editorial Board",
  bio: "The Africa Digital Forum Editorial Board brings together influential leaders shaping digital transformation across African institutions. Their expertise, perspectives, and leadership help guide conversations and ideas that advance Africa’s digital future.",
} as const
