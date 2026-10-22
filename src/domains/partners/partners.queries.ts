import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  deletePartner,
  deletePartnerCategory,
  listPartnerCategories,
  listPartnersAdmin,
  listPublicPartners,
  savePartner,
  savePartnerCategory,
} from "./partners.functions"
import type {
  SavePartnerCategoryInput,
  SavePartnerInput,
} from "./partners.schemas"

export const partnerKeys = {
  all: ["partners"] as const,
  adminList: () => [...partnerKeys.all, "admin-list"] as const,
  publicList: () => [...partnerKeys.all, "public-list"] as const,
  categories: () => [...partnerKeys.all, "categories"] as const,
}

export const partnerCategoriesQueryOptions = () =>
  queryOptions({
    queryKey: partnerKeys.categories(),
    queryFn: () => listPartnerCategories(),
    staleTime: 15_000,
  })

export function usePartnerCategoriesQuery() {
  return useQuery(partnerCategoriesQueryOptions())
}

export function useSavePartnerCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SavePartnerCategoryInput) =>
      savePartnerCategory({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: partnerKeys.all })
    },
  })
}

export function useDeletePartnerCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePartnerCategory({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: partnerKeys.all })
    },
  })
}

export const partnersAdminQueryOptions = () =>
  queryOptions({
    queryKey: partnerKeys.adminList(),
    queryFn: () => listPartnersAdmin(),
    staleTime: 15_000,
  })

export function usePartnersAdminQuery() {
  return useQuery(partnersAdminQueryOptions())
}

export const publicPartnersQueryOptions = () =>
  queryOptions({
    queryKey: partnerKeys.publicList(),
    queryFn: () => listPublicPartners(),
    staleTime: 60_000,
  })

export function usePublicPartnersQuery() {
  return useQuery(publicPartnersQueryOptions())
}

export function useSavePartnerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SavePartnerInput) => savePartner({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: partnerKeys.all })
    },
  })
}

export function useDeletePartnerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePartner({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: partnerKeys.all })
    },
  })
}
