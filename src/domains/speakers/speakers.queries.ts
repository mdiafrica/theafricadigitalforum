import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import type { Locale } from "@/lib/schemas"
import {
  deleteSpeaker,
  listPublicSpeakers,
  listSpeakersAdmin,
  saveSpeaker,
} from "./speakers.functions"
import type { SaveSpeakerInput } from "./speakers.schemas"

export const speakerKeys = {
  all: ["speakers"] as const,
  adminList: () => [...speakerKeys.all, "admin-list"] as const,
  publicList: (locale: Locale) =>
    [...speakerKeys.all, "public-list", locale] as const,
}

export const speakersAdminQueryOptions = () =>
  queryOptions({
    queryKey: speakerKeys.adminList(),
    queryFn: () => listSpeakersAdmin(),
    staleTime: 15_000,
  })

export function useSpeakersAdminQuery() {
  return useQuery(speakersAdminQueryOptions())
}

export const publicSpeakersQueryOptions = (locale: Locale) =>
  queryOptions({
    queryKey: speakerKeys.publicList(locale),
    queryFn: () => listPublicSpeakers({ data: { locale } }),
    staleTime: 60_000,
  })

export function usePublicSpeakersQuery(locale: Locale) {
  return useQuery(publicSpeakersQueryOptions(locale))
}

export function useSaveSpeakerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SaveSpeakerInput) => saveSpeaker({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: speakerKeys.all })
    },
  })
}

export function useDeleteSpeakerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSpeaker({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: speakerKeys.all })
    },
  })
}
