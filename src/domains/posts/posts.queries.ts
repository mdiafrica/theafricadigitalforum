import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  createPost,
  deletePost,
  getPostAdmin,
  getPublishedPostBySlug,
  listPostsAdmin,
  listPublishedPostCategories,
  listPublishedPosts,
  publishPost,
  unpublishPost,
  updatePost,
} from "./posts.functions"
import type { Locale } from "@/lib/schemas"
import type {
  CreatePostInput,
  ListPostsAdminInput,
  UpdatePostInput,
} from "./posts.schemas"

export const postKeys = {
  all: ["posts"] as const,
  adminList: (input?: Partial<ListPostsAdminInput>) =>
    [...postKeys.all, "admin-list", input ?? {}] as const,
  adminDetail: (id: string) => [...postKeys.all, "admin-detail", id] as const,
  publicList: (locale: Locale, params?: PublicListParams) =>
    [...postKeys.all, "public-list", locale, params ?? {}] as const,
  publicCategories: (locale: Locale) =>
    [...postKeys.all, "public-categories", locale] as const,
  publicDetail: (slug: string, locale: Locale) =>
    [...postKeys.all, "public-detail", slug, locale] as const,
}

export type PublicListParams = { category?: string; query?: string }

// --- Admin ---

export const postsAdminListQueryOptions = (
  input?: Partial<ListPostsAdminInput>
) =>
  queryOptions({
    queryKey: postKeys.adminList(input),
    queryFn: () => listPostsAdmin({ data: input ?? {} }),
    staleTime: 15_000,
  })

export function usePostsAdminListQuery(input?: Partial<ListPostsAdminInput>) {
  return useQuery(postsAdminListQueryOptions(input))
}

export const postAdminDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: postKeys.adminDetail(id),
    queryFn: () => getPostAdmin({ data: { id } }),
    staleTime: 15_000,
  })

export function usePostAdminDetailQuery(id: string) {
  return useQuery(postAdminDetailQueryOptions(id))
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePostInput) => createPost({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

export function useUpdatePostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdatePostInput) => updatePost({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

export function usePublishPostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => publishPost({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

export function useUnpublishPostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => unpublishPost({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePost({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

// --- Public ---

export const publishedPostsQueryOptions = (
  locale: Locale,
  params?: PublicListParams
) =>
  queryOptions({
    queryKey: postKeys.publicList(locale, params),
    queryFn: () => listPublishedPosts({ data: { locale, ...params } }),
    staleTime: 60_000,
  })

export const publishedPostCategoriesQueryOptions = (locale: Locale) =>
  queryOptions({
    queryKey: postKeys.publicCategories(locale),
    queryFn: () => listPublishedPostCategories({ data: { locale } }),
    staleTime: 60_000,
  })

export const publishedPostQueryOptions = (slug: string, locale: Locale) =>
  queryOptions({
    queryKey: postKeys.publicDetail(slug, locale),
    queryFn: () => getPublishedPostBySlug({ data: { slug, locale } }),
    staleTime: 60_000,
  })
