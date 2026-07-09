import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import type { Locale } from "@/lib/schemas"
import {
  deleteEvent,
  listEventsAdmin,
  listPublicEvents,
  saveEvent,
} from "./events.functions"
import type { SaveEventInput } from "./events.schemas"

export const eventKeys = {
  all: ["events"] as const,
  adminList: () => [...eventKeys.all, "admin-list"] as const,
  publicList: (locale: Locale) =>
    [...eventKeys.all, "public-list", locale] as const,
}

export const eventsAdminQueryOptions = () =>
  queryOptions({
    queryKey: eventKeys.adminList(),
    queryFn: () => listEventsAdmin(),
    staleTime: 15_000,
  })

export function useEventsAdminQuery() {
  return useQuery(eventsAdminQueryOptions())
}

export const publicEventsQueryOptions = (locale: Locale) =>
  queryOptions({
    queryKey: eventKeys.publicList(locale),
    queryFn: () => listPublicEvents({ data: { locale } }),
    staleTime: 60_000,
  })

export function useSaveEventMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SaveEventInput) => saveEvent({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.all })
    },
  })
}

export function useDeleteEventMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEvent({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.all })
    },
  })
}
