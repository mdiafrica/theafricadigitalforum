import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  deleteSponsor,
  listPublicSponsors,
  listSponsorsAdmin,
  saveSponsor,
} from "./sponsors.functions"
import type { SaveSponsorInput } from "./sponsors.schemas"

export const sponsorKeys = {
  all: ["sponsors"] as const,
  adminList: () => [...sponsorKeys.all, "admin-list"] as const,
  publicList: () => [...sponsorKeys.all, "public-list"] as const,
}

export const sponsorsAdminQueryOptions = () =>
  queryOptions({
    queryKey: sponsorKeys.adminList(),
    queryFn: () => listSponsorsAdmin(),
    staleTime: 15_000,
  })

export function useSponsorsAdminQuery() {
  return useQuery(sponsorsAdminQueryOptions())
}

export const publicSponsorsQueryOptions = () =>
  queryOptions({
    queryKey: sponsorKeys.publicList(),
    queryFn: () => listPublicSponsors(),
    staleTime: 60_000,
  })

export function useSaveSponsorMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SaveSponsorInput) => saveSponsor({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sponsorKeys.all })
    },
  })
}

export function useDeleteSponsorMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSponsor({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sponsorKeys.all })
    },
  })
}
