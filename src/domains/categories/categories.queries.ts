import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { postKeys } from "@/domains/posts/posts.queries"
import type { Locale } from "@/lib/schemas"
import {
  deleteCategory,
  listCategoriesAdmin,
  listPublicCategories,
  saveCategory,
} from "./categories.functions"
import type { SaveCategoryInput } from "./categories.schemas"

export const categoryKeys = {
  all: ["categories"] as const,
  adminList: () => [...categoryKeys.all, "admin-list"] as const,
  publicList: (locale: Locale) =>
    [...categoryKeys.all, "public-list", locale] as const,
}

export const categoriesAdminQueryOptions = () =>
  queryOptions({
    queryKey: categoryKeys.adminList(),
    queryFn: () => listCategoriesAdmin(),
    staleTime: 15_000,
  })

export function useCategoriesAdminQuery() {
  return useQuery(categoriesAdminQueryOptions())
}

export const publicCategoriesQueryOptions = (locale: Locale) =>
  queryOptions({
    queryKey: categoryKeys.publicList(locale),
    queryFn: () => listPublicCategories({ data: { locale } }),
    staleTime: 60_000,
  })

/** Category names/colors ride along on post payloads — invalidate both. */
function useInvalidateCategories() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    void queryClient.invalidateQueries({ queryKey: postKeys.all })
  }
}

export function useSaveCategoryMutation() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: (input: SaveCategoryInput) => saveCategory({ data: input }),
    onSuccess: invalidate,
  })
}

export function useDeleteCategoryMutation() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: (id: string) => deleteCategory({ data: { id } }),
    onSuccess: invalidate,
  })
}
