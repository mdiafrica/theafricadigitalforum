import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query"

import { getInvitationPreview, getSessionContext } from "./auth.functions"

export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
  invitationPreview: (id: string) =>
    [...authKeys.all, "invitation-preview", id] as const,
}

export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: authKeys.session(),
    queryFn: () => getSessionContext(),
    // Sessions change on explicit auth actions — those invalidate this key.
    staleTime: 60_000,
  })

export function useSessionQuery() {
  return useQuery(sessionQueryOptions())
}

/** Call after sign-in/sign-out/accept-invitation so guards + UI refresh. */
export function useInvalidateSession() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: authKeys.all })
}

export const invitationPreviewQueryOptions = (invitationId: string) =>
  queryOptions({
    queryKey: authKeys.invitationPreview(invitationId),
    queryFn: () => getInvitationPreview({ data: { invitationId } }),
    staleTime: 60_000,
    retry: false,
  })
