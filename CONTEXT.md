# The Africa Digital Forum

Public site + in-app CMS for the Africa Digital Forum: articles, events, speakers, and page content, managed by a single organization of staff members.

## Language

### People & roles

**Member**:
A user belonging to the ADF organization, holding exactly one org role.
_Avoid_: Team member, staff (in code)

**Editor** (role):
The org role for people who draft and edit content but cannot publish, delete, or manage the team.
_Avoid_: Secretary (the old name — fully renamed, including stored role values)

**Admin** (role):
The org role that publishes content, manages the team, and manages categories.

**Author**:
The member an article is attributed to — the byline. Exactly one per article (nullable). Reassignable by an admin at any time.
_Avoid_: "Editor of the article", creator, writer

**Editorial Board**:
The collective identity ("ADF Editorial Board") shown as the byline — with its own bio — whenever an article's author is an admin/owner or missing. Resolved from the author's role at render time, not stored per article. Its display name and bio are editable in admin site settings.
_Avoid_: ADF Editorial (older fallback string)

**Bio**:
A member's short plain-text self-description, single-language, shown under their byline on articles they author. Editable by the member and by admins.

### Content

**Article**:
A published post on the blog: slug, cover image, author, categories, and per-locale title/excerpt/body.
_Avoid_: Post (in UI copy; `post` remains the code/schema name)

**Category**:
A first-class taxonomy record (slug, color, per-locale name) managed by admins via CRUD. Articles link to categories many-to-many; deletion is blocked while any article references it.
_Avoid_: Tag, topic, free-text category labels

**Related Articles**:
The up-to-4 newest other articles sharing at least one category with the current article, topped up with the newest non-matching articles when there are fewer than 4.

**Article Surface**:
The public reading container: white, rounded, light-typography card an article body renders in, per the legacy site's design.

### Language & visibility

**Translation**:
The per-locale text of an article (title, excerpt, body). English is the source translation and always exists; French is optional and may lag behind.
_Avoid_: Version, localization

**Published Translation**:
A translation that has been made live for its locale. Readers of a locale only ever encounter an article through a published translation.

**Preferred Language**:
The language a visitor reads the site in — a browser-level preference (explicit choice remembered across visits, otherwise detected from the browser's language), never an account property.
_Avoid_: User language setting, timezone-detected language

**Language Visibility**:
The rule that an article surfaces in lists, search, and feeds for a language only if it has a published translation in that language. Direct links always resolve, falling back to English. Applies to articles only — categories, events, speakers, and page content fall back to English instead of hiding.
