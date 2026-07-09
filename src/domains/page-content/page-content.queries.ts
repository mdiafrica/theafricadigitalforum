import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import type { Locale } from "@/lib/schemas"
import {
  deletePageContent,
  getPageContent,
  listPageContentAdmin,
  savePageContent,
} from "./page-content.functions"
import type { SavePageContentInput } from "./page-content.schemas"

export const pageContentKeys = {
  all: ["page-content"] as const,
  page: (page: string, locale: Locale) =>
    [...pageContentKeys.all, page, locale] as const,
  admin: (page: string) => [...pageContentKeys.all, "admin", page] as const,
}

export const pageContentQueryOptions = (page: string, locale: Locale) =>
  queryOptions({
    queryKey: pageContentKeys.page(page, locale),
    queryFn: () => getPageContent({ data: { page, locale } }),
    staleTime: 60_000,
  })

/**
 * Read one section with an i18n fallback — components keep their old shape
 * while sections migrate to the DB progressively.
 */
export function usePageSection<T extends Record<string, unknown>>(
  page: string,
  section: string,
  locale: Locale,
  fallback: T
): T {
  const query = useQuery(pageContentQueryOptions(page, locale))
  return (query.data?.[section] as T | undefined) ?? fallback
}

export const pageContentAdminQueryOptions = (page: string) =>
  queryOptions({
    queryKey: pageContentKeys.admin(page),
    queryFn: () => listPageContentAdmin({ data: { page } }),
    staleTime: 15_000,
  })

export function usePageContentAdminQuery(page: string) {
  return useQuery(pageContentAdminQueryOptions(page))
}

export function useSavePageContentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SavePageContentInput) =>
      savePageContent({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.all })
    },
  })
}

export function useDeletePageContentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { page: string; section: string; locale: Locale }) =>
      deletePageContent({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.all })
    },
  })
}
