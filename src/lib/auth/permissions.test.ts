import { describe, expect, it } from "vitest"

import { GlobalRole, OrgRole, hasOrgPermission } from "./permissions"

const asRole = (orgRole: OrgRole | null, globalRole = GlobalRole.User) => ({
  globalRole,
  orgRole,
})

describe("permission matrix", () => {
  it("admin can publish and delete posts", () => {
    expect(hasOrgPermission(asRole(OrgRole.Admin), { post: ["publish"] })).toBe(
      true
    )
    expect(hasOrgPermission(asRole(OrgRole.Admin), { post: ["delete"] })).toBe(
      true
    )
  })

  it("editor can draft but not publish or delete", () => {
    expect(
      hasOrgPermission(asRole(OrgRole.Editor), {
        post: ["create", "update"],
      })
    ).toBe(true)
    expect(
      hasOrgPermission(asRole(OrgRole.Editor), { post: ["publish"] })
    ).toBe(false)
    expect(hasOrgPermission(asRole(OrgRole.Editor), { post: ["delete"] })).toBe(
      false
    )
  })

  it("admin manages the team, editor does not", () => {
    expect(
      hasOrgPermission(asRole(OrgRole.Admin), { invitation: ["create"] })
    ).toBe(true)
    expect(
      hasOrgPermission(asRole(OrgRole.Editor), { invitation: ["create"] })
    ).toBe(false)
    expect(
      hasOrgPermission(asRole(OrgRole.Editor), { member: ["update"] })
    ).toBe(false)
  })

  it("editor uploads media but cannot delete it", () => {
    expect(
      hasOrgPermission(asRole(OrgRole.Editor), { media: ["upload"] })
    ).toBe(true)
    expect(
      hasOrgPermission(asRole(OrgRole.Editor), { media: ["delete"] })
    ).toBe(false)
  })

  it("editor can only update speakers/sponsors, admin has full CRUD", () => {
    expect(
      hasOrgPermission(asRole(OrgRole.Editor), { speaker: ["update"] })
    ).toBe(true)
    expect(
      hasOrgPermission(asRole(OrgRole.Editor), { speaker: ["create"] })
    ).toBe(false)
    expect(
      hasOrgPermission(asRole(OrgRole.Admin), { speaker: ["create", "delete"] })
    ).toBe(true)
  })

  it("everyone reads submissions", () => {
    for (const role of [OrgRole.Owner, OrgRole.Admin, OrgRole.Editor]) {
      expect(hasOrgPermission(asRole(role), { submission: ["read"] })).toBe(
        true
      )
    }
  })

  it("super_admin short-circuits every check regardless of org role", () => {
    expect(
      hasOrgPermission(asRole(null, GlobalRole.SuperAdmin), {
        post: ["publish"],
      })
    ).toBe(true)
    expect(
      hasOrgPermission(asRole(OrgRole.Editor, GlobalRole.SuperAdmin), {
        member: ["delete"],
      })
    ).toBe(true)
  })

  it("no role / unknown role → denied", () => {
    expect(hasOrgPermission(asRole(null), { post: ["read"] })).toBe(false)
    expect(
      hasOrgPermission(
        { globalRole: GlobalRole.User, orgRole: "ghost" },
        { post: ["read"] }
      )
    ).toBe(false)
  })
})
