import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import type { Locale } from "@/lib/schemas"
import {
  deleteAdvisor,
  listAdvisorsAdmin,
  listPublicAdvisors,
  saveAdvisor,
} from "./advisors.functions"
import type { SaveAdvisorInput } from "./advisors.schemas"

export const advisorKeys = {
  all: ["advisors"] as const,
  adminList: () => [...advisorKeys.all, "admin-list"] as const,
  publicList: (locale: Locale) =>
    [...advisorKeys.all, "public-list", locale] as const,
}

export const advisorsAdminQueryOptions = () =>
  queryOptions({
    queryKey: advisorKeys.adminList(),
    queryFn: () => listAdvisorsAdmin(),
    staleTime: 15_000,
  })

export function useAdvisorsAdminQuery() {
  return useQuery(advisorsAdminQueryOptions())
}

export const publicAdvisorsQueryOptions = (locale: Locale) =>
  queryOptions({
    queryKey: advisorKeys.publicList(locale),
    queryFn: () => listPublicAdvisors({ data: { locale } }),
    staleTime: 60_000,
  })

export function usePublicAdvisorsQuery(locale: Locale) {
  return useQuery(publicAdvisorsQueryOptions(locale))
}

export function useSaveAdvisorMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SaveAdvisorInput) => saveAdvisor({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: advisorKeys.all })
    },
  })
}

export function useDeleteAdvisorMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAdvisor({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: advisorKeys.all })
    },
  })
}
