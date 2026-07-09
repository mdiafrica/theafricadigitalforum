import { createFileRoute } from "@tanstack/react-router"

import { useSessionQuery } from "@/domains/auth"
import { PageHeader } from "@/components/admin/page-header"
import { ChangePasswordCard } from "@/features/account/ui/change-password-card"
import { TwoFactorCard } from "@/features/account/ui/two-factor-card"

export const Route = createFileRoute("/admin/account")({
  head: () => ({ meta: [{ title: "Account | Africa Digital Forum" }] }),
  component: AccountPage,
})

function AccountPage() {
  const sessionQuery = useSessionQuery()
  const user = sessionQuery.data?.user

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Account"
        description={user ? `Signed in as ${user.email}` : "Security settings"}
      />
      <TwoFactorCard enabled={user?.twoFactorEnabled ?? false} />
      <ChangePasswordCard />
    </div>
  )
}
