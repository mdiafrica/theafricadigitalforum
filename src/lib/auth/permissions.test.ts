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

  it("secretary can draft but not publish or delete", () => {
    expect(
      hasOrgPermission(asRole(OrgRole.Secretary), {
        post: ["create", "update"],
      })
    ).toBe(true)
    expect(
      hasOrgPermission(asRole(OrgRole.Secretary), { post: ["publish"] })
    ).toBe(false)
    expect(
      hasOrgPermission(asRole(OrgRole.Secretary), { post: ["delete"] })
    ).toBe(false)
  })

  it("admin manages the team, secretary does not", () => {
    expect(
      hasOrgPermission(asRole(OrgRole.Admin), { invitation: ["create"] })
    ).toBe(true)
    expect(
      hasOrgPermission(asRole(OrgRole.Secretary), { invitation: ["create"] })
    ).toBe(false)
    expect(
      hasOrgPermission(asRole(OrgRole.Secretary), { member: ["update"] })
    ).toBe(false)
  })

  it("secretary uploads media but cannot delete it", () => {
    expect(
      hasOrgPermission(asRole(OrgRole.Secretary), { media: ["upload"] })
    ).toBe(true)
    expect(
      hasOrgPermission(asRole(OrgRole.Secretary), { media: ["delete"] })
    ).toBe(false)
  })

  it("secretary can only update speakers/sponsors, admin has full CRUD", () => {
    expect(
      hasOrgPermission(asRole(OrgRole.Secretary), { speaker: ["update"] })
    ).toBe(true)
    expect(
      hasOrgPermission(asRole(OrgRole.Secretary), { speaker: ["create"] })
    ).toBe(false)
    expect(
      hasOrgPermission(asRole(OrgRole.Admin), { speaker: ["create", "delete"] })
    ).toBe(true)
  })

  it("everyone reads submissions", () => {
    for (const role of [OrgRole.Owner, OrgRole.Admin, OrgRole.Secretary]) {
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
      hasOrgPermission(asRole(OrgRole.Secretary, GlobalRole.SuperAdmin), {
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
