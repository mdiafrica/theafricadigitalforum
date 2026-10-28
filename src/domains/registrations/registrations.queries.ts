import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  deleteRegistration,
  exportRegistrationsCsv,
  listRegistrations,
  updateRegistration,
  updateRegistrationPayment,
} from "./registrations.admin.functions"
import type { ListRegistrationsInput } from "./registrations.schemas"
import { getRegistrationOverview } from "./registrations.overview.functions"
import {
  createRegistrationCode,
  deleteRegistrationCode,
  listRegistrationCodes,
  setRegistrationCodeActive,
  updateRegistrationCode,
} from "./registrations.codes.functions"
import {
  deleteReferralOption,
  listReferralOptions,
  listReferralOptionsAdmin,
  saveReferralOption,
} from "./registrations.referrals.functions"

export function useReferralOptionsQuery() {
  return useQuery(
    queryOptions({
      queryKey: [...registrationKeys.all, "referrals", "public"] as const,
      queryFn: () => listReferralOptions(),
      staleTime: 60_000,
    })
  )
}

export function useReferralOptionsAdminQuery() {
  return useQuery(
    queryOptions({
      queryKey: [...registrationKeys.all, "referrals", "admin"] as const,
      queryFn: () => listReferralOptionsAdmin(),
    })
  )
}

export function useSaveReferralOptionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveReferralOption,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: registrationKeys.all }),
  })
}

export function useDeleteReferralOptionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteReferralOption,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: registrationKeys.all }),
  })
}

export const registrationKeys = {
  all: ["registrations"] as const,
  list: (input?: Partial<ListRegistrationsInput>) =>
    [...registrationKeys.all, "list", input ?? {}] as const,
}

export function useRegistrationsQuery(input?: Partial<ListRegistrationsInput>) {
  return useQuery(
    queryOptions({
      queryKey: registrationKeys.list(input),
      queryFn: () => listRegistrations({ data: input ?? {} }),
      staleTime: 15_000,
      placeholderData: (previous) => previous,
    })
  )
}

export function useUpdateRegistrationPaymentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateRegistrationPayment,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: registrationKeys.all }),
  })
}

export function useUpdateRegistrationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateRegistration,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: registrationKeys.all }),
  })
}

export function useDeleteRegistrationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRegistration,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: registrationKeys.all }),
  })
}

export function useRegistrationOverviewQuery(enabled = true) {
  return useQuery(
    queryOptions({
      queryKey: [...registrationKeys.all, "overview"] as const,
      queryFn: () => getRegistrationOverview(),
      enabled,
      staleTime: 15_000,
    })
  )
}

export function useRegistrationCodesQuery() {
  return useQuery(
    queryOptions({
      queryKey: [...registrationKeys.all, "codes"] as const,
      queryFn: () => listRegistrationCodes(),
      staleTime: 15_000,
    })
  )
}

function useCodeMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: registrationKeys.all }),
  })
}

export const useCreateRegistrationCodeMutation = () =>
  useCodeMutation(createRegistrationCode)
export const useSetRegistrationCodeActiveMutation = () =>
  useCodeMutation(setRegistrationCodeActive)
export const useUpdateRegistrationCodeMutation = () =>
  useCodeMutation(updateRegistrationCode)
export const useDeleteRegistrationCodeMutation = () =>
  useCodeMutation(deleteRegistrationCode)

export function useExportRegistrationsMutation() {
  return useMutation({
    mutationFn: (input: Pick<ListRegistrationsInput, "search" | "passTier">) =>
      exportRegistrationsCsv({ data: input }),
  })
}
