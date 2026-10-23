INSERT INTO "partner_category" ("slug", "name", "sort_order")
SELECT 'knowledge-partner', 'Knowledge Partner', COALESCE(MAX("sort_order"), 0) + 1
FROM "partner_category"
ON CONFLICT ("slug") DO NOTHING;