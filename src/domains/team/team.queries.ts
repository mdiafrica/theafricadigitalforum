import { queryOptions, useQuery } from "@tanstack/react-query"

import { authClient, unwrap } from "@/lib/auth/auth-client"

/**
 * Team data comes from better-auth's own org endpoints via the auth client —
 * the documented exception to "server functions for internal data"
 *. Permission
 * enforcement happens inside the org plugin against the shared contracts.
 */

async function fetchTeamOverview() {
  return unwrap(await authClient.organization.getFullOrganization())
}

export type TeamOverview = NonNullable<
  Awaited<ReturnType<typeof fetchTeamOverview>>
>
export type TeamMember = TeamOverview["members"][number]
export type TeamInvitation = TeamOverview["invitations"][number]

export const teamKeys = {
  all: ["team"] as const,
  overview: () => [...teamKeys.all, "overview"] as const,
}

export const teamOverviewQueryOptions = () =>
  queryOptions({
    queryKey: teamKeys.overview(),
    queryFn: fetchTeamOverview,
    staleTime: 30_000,
  })

export function useTeamOverviewQuery() {
  return useQuery(teamOverviewQueryOptions())
}
