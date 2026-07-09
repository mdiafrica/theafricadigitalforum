import { queryOptions, useQuery } from "@tanstack/react-query"

import {
  listContactSubmissions,
  listNewsletterSubscribers,
} from "./submissions.functions"
import type { ListSubmissionsInput } from "./submissions.schemas"

export const submissionKeys = {
  all: ["submissions"] as const,
  contact: (input?: Partial<ListSubmissionsInput>) =>
    [...submissionKeys.all, "contact", input ?? {}] as const,
  newsletter: (input?: Partial<ListSubmissionsInput>) =>
    [...submissionKeys.all, "newsletter", input ?? {}] as const,
}

export const contactSubmissionsQueryOptions = (
  input?: Partial<ListSubmissionsInput>
) =>
  queryOptions({
    queryKey: submissionKeys.contact(input),
    queryFn: () => listContactSubmissions({ data: input ?? {} }),
    staleTime: 15_000,
  })

export function useContactSubmissionsQuery(
  input?: Partial<ListSubmissionsInput>
) {
  return useQuery(contactSubmissionsQueryOptions(input))
}

export const newsletterSubscribersQueryOptions = (
  input?: Partial<ListSubmissionsInput>
) =>
  queryOptions({
    queryKey: submissionKeys.newsletter(input),
    queryFn: () => listNewsletterSubscribers({ data: input ?? {} }),
    staleTime: 15_000,
  })

export function useNewsletterSubscribersQuery(
  input?: Partial<ListSubmissionsInput>
) {
  return useQuery(newsletterSubscribersQueryOptions(input))
}
