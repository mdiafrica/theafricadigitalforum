import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { useSessionQuery } from "@/domains/auth"
import {
  type TeamInvitation,
  type TeamMember,
  useTeamOverviewQuery,
} from "@/domains/team"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { PageHeader } from "@/components/admin/page-header"
import { QueryError } from "@/components/admin/query-states"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDataTable } from "@/hooks/use-data-table"
import { OrgRole, hasOrgPermission, isSuperAdmin } from "@/lib/auth/permissions"
import { useTeamMutations } from "../hooks/use-team-mutations"
import { InviteMemberDialog } from "./invite-member-dialog"

type Mutations = ReturnType<typeof useTeamMutations>

function useMemberColumns(opts: {
  currentUserId: string | undefined
  canManage: boolean
  callerIsSuperAdmin: boolean
  mutations: Mutations
}) {
  const { currentUserId, canManage, callerIsSuperAdmin, mutations } = opts
  return React.useMemo<ColumnDef<TeamMember, unknown>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => {
          const member = row.original
          const isSelf = member.userId === currentUserId
          return (
            <div className="max-w-64">
              <p className="truncate font-medium">
                {member.user.name}
                {isSelf && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    (you)
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {member.user.email}
              </p>
            </div>
          )
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.role === OrgRole.Owner ? "default" : "secondary"
            }
          >
            {row.original.role}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <MemberActionsCell
            member={row.original}
            currentUserId={currentUserId}
            canManage={canManage}
            callerIsSuperAdmin={callerIsSuperAdmin}
            mutations={mutations}
          />
        ),
      },
    ],
    [currentUserId, canManage, callerIsSuperAdmin, mutations]
  )
}

function useInvitationColumns(canCancel: boolean, mutations: Mutations) {
  return React.useMemo<ColumnDef<TeamInvitation, unknown>[]>(
    () => [
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="max-w-64">
            <p className="truncate font-medium">{row.original.email}</p>
            <p className="text-xs text-muted-foreground">
              Expires {new Date(row.original.expiresAt).toLocaleDateString()}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.role}</Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          canCancel ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                mutations.cancelInvitation.mutate({
                  invitationId: row.original.id,
                })
              }
              disabled={mutations.cancelInvitation.isPending}
            >
              Cancel
            </Button>
          ) : null,
      },
    ],
    [canCancel, mutations]
  )
}

export function TeamView() {
  const sessionQuery = useSessionQuery()
  const teamQuery = useTeamOverviewQuery()
  const mutations = useTeamMutations()

  const session = sessionQuery.data
  const caller = {
    globalRole: session?.user.role,
    orgRole: session?.orgRole,
  }
  const canManageMembers = hasOrgPermission(caller, { member: ["update"] })
  const canInvite = hasOrgPermission(caller, { invitation: ["create"] })
  const callerIsSuperAdmin = isSuperAdmin(session?.user.role)

  const team = teamQuery.data
  const members = team?.members ?? []
  const pendingInvitations = (team?.invitations ?? []).filter(
    (invitation) => invitation.status === "pending"
  )

  const memberColumns = useMemberColumns({
    currentUserId: session?.user.id,
    canManage: canManageMembers,
    callerIsSuperAdmin,
    mutations,
  })
  const memberTable = useDataTable({ data: members, columns: memberColumns })

  const invitationColumns = useInvitationColumns(canInvite, mutations)
  const invitationTable = useDataTable({
    data: pendingInvitations,
    columns: invitationColumns,
  })

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        title="Team"
        description="Manage who can edit and publish the site."
      >
        {canInvite && <InviteMemberDialog />}
      </PageHeader>

      {teamQuery.isError ? (
        <QueryError
          title="Couldn't load the team"
          error={teamQuery.error}
          onRetry={() => void teamQuery.refetch()}
        />
      ) : (
        <>
          <DataTable table={memberTable} isLoading={teamQuery.isPending}>
            <div>
              <h2 className="font-heading text-sm font-semibold">Members</h2>
              <p className="text-xs text-muted-foreground">
                {members.length} {members.length === 1 ? "person" : "people"}{" "}
                with access
              </p>
            </div>
          </DataTable>

          {team && (
            <DataTable
              table={invitationTable}
              emptyState={
                <p className="text-sm text-muted-foreground">
                  No pending invitations.
                  {canInvite ? " Invite someone to get started." : ""}
                </p>
              }
            >
              <div>
                <h2 className="font-heading text-sm font-semibold">
                  Pending invitations
                </h2>
                <p className="text-xs text-muted-foreground">
                  Sent but not yet accepted — they expire after 7 days.
                </p>
              </div>
            </DataTable>
          )}
        </>
      )}
    </div>
  )
}

function MemberActionsCell({
  member,
  currentUserId,
  canManage,
  callerIsSuperAdmin,
  mutations,
}: {
  member: TeamMember
  currentUserId: string | undefined
  canManage: boolean
  callerIsSuperAdmin: boolean
  mutations: Mutations
}) {
  const isSelf = member.userId === currentUserId
  const isOwner = member.role === OrgRole.Owner
  const [confirming, setConfirming] = React.useState<"remove" | "ban" | null>(
    null
  )

  if (!canManage || isSelf || isOwner) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Member actions"
            />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Change role</DropdownMenuLabel>
            {member.role !== OrgRole.Admin && (
              <DropdownMenuItem
                onClick={() =>
                  mutations.updateRole.mutate({
                    memberId: member.id,
                    role: OrgRole.Admin,
                  })
                }
              >
                Make admin
              </DropdownMenuItem>
            )}
            {member.role !== OrgRole.Secretary && (
              <DropdownMenuItem
                onClick={() =>
                  mutations.updateRole.mutate({
                    memberId: member.id,
                    role: OrgRole.Secretary,
                  })
                }
              >
                Make secretary
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirming("remove")}
          >
            Remove from team
          </DropdownMenuItem>
          {callerIsSuperAdmin && (
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setConfirming("ban")}
            >
              Ban user
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirming === "remove"}
        onOpenChange={(open) => !open && setConfirming(null)}
        title="Remove this member?"
        description={`${member.user.name} will lose access to the admin. They can be re-invited later.`}
        confirmLabel="Remove"
        onConfirm={() => mutations.removeMember.mutate({ memberId: member.id })}
      />
      <ConfirmDialog
        open={confirming === "ban"}
        onOpenChange={(open) => !open && setConfirming(null)}
        title="Ban this user?"
        description={`${member.user.name} will be signed out everywhere and blocked from signing in.`}
        confirmLabel="Ban"
        onConfirm={() => mutations.banUser.mutate({ userId: member.userId })}
      />
    </>
  )
}
