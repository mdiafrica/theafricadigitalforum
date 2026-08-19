# Vendored inlang plugins

These are the two inlang marketplace plugins `project.inlang/settings.json`
references, vendored so compiles never fetch from the marketplace CDN
(offline-safe, reproducible builds). Copied from the awf project's setup
(`~/Documents/awf/awf-lis-fe/plugins/`), which follows inlang's local-module
recommendation:

- `plugin-message-format.js` — `@inlang/plugin-message-format` (reads/writes
  `messages/{locale}.json`). The `.parts/*.txt` split plus the tmpdir
  assemble-and-import loader is inherited from awf's vendoring: the plugin's
  published bundle is a single ESM file too large for their repo tooling, so
  it is stored in chunks and stitched back together (hash-cached in tmpdir)
  at config-load time.
- `plugin-m-function-matcher.js` — `@inlang/plugin-m-function-matcher`
  (lets inlang tooling find `m.key()` usages in source).

To upgrade: replace these files with the current published bundles and
re-run `pnpm i18n:compile`.
