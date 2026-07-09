import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  deleteMedia,
  listMedia,
  updateMediaAlt,
  uploadMedia,
} from "./media.functions"
import type { ListMediaInput } from "./media.schemas"

export const mediaKeys = {
  all: ["media"] as const,
  list: (input?: Partial<ListMediaInput>) =>
    [...mediaKeys.all, "list", input ?? {}] as const,
}

export const mediaListQueryOptions = (input?: Partial<ListMediaInput>) =>
  queryOptions({
    queryKey: mediaKeys.list(input),
    queryFn: () => listMedia({ data: input ?? {} }),
    staleTime: 30_000,
  })

export function useMediaListQuery(input?: Partial<ListMediaInput>) {
  return useQuery(mediaListQueryOptions(input))
}

export function useUploadMediaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      return uploadMedia({ data: formData })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all })
    },
  })
}

export function useDeleteMediaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMedia({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all })
    },
  })
}

export function useUpdateMediaAltMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { id: string; alt: string }) =>
      updateMediaAlt({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all })
    },
  })
}
