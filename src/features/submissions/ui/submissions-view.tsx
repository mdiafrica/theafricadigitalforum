import * as React from "react"
import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import {
  ForwardIcon,
  InboxIcon,
  MailIcon,
  ReplyIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import {
  useDeleteContactSubmissionMutation,
  useContactSubmissionsQuery,
  useForwardContactSubmissionMutation,
  useNewsletterSubscribersQuery,
  useReplyToContactSubmissionMutation,
  useSubmissionRecipientsQuery,
  type ContactSubmissionItem,
  type NewsletterSubscriberItem,
} from "@/domains/submissions"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"
import {
  EmptyState,
  ListSkeleton,
  QueryError,
} from "@/components/admin/query-states"
import { DataTable } from "@/components/ui/data-table/data-table"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { useDataTable } from "@/hooks/use-data-table"

export function SubmissionsView() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Submissions"
        description="Contact enquiries and newsletter signups from the public site."
      />

      <Tabs defaultValue="contact">
        <TabsList>
          <TabsTrigger value="contact">Contact enquiries</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
        </TabsList>
        <TabsContent value="contact" className="pt-4">
          <ContactInbox />
        </TabsContent>
        <TabsContent value="newsletter" className="pt-4">
          <NewsletterList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ContactInbox() {
  const [page, setPage] = React.useState(1)
  const query = useContactSubmissionsQuery({ page })

  if (query.isPending) return <ListSkeleton rows={2} className="[&>*]:h-24" />
  if (query.isError) {
    return (
      <QueryError
        title="Couldn't load enquiries"
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    )
  }

  const { items, total, pageSize } = query.data
  if (items.length === 0) {
    return <EmptyState icon={InboxIcon}>No contact enquiries yet.</EmptyState>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold">Inbox</h2>
          <p className="text-sm text-muted-foreground">Contact enquiries</p>
        </div>
        <Badge variant="secondary">
          {total} {total === 1 ? "enquiry" : "enquiries"}
        </Badge>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {items.map((item) => (
          <Dialog key={item.id}>
            <DialogTrigger
              render={
                <button
                  type="button"
                  className="grid w-full grid-cols-[minmax(140px,220px)_minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-muted/40"
                />
              }
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{item.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.email}
                </p>
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{item.subject}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {item.message}
                </p>
              </div>
              <time className="text-xs whitespace-nowrap text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString()}
              </time>
            </DialogTrigger>
            <InquiryDetailDialog submission={item} />
          </Dialog>
        ))}
      </div>
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />
    </div>
  )
}

function InquiryDetailDialog({
  submission,
}: {
  submission: ContactSubmissionItem
}) {
  const [message, setMessage] = React.useState("")
  const [note, setNote] = React.useState("")
  const [selectedRecipients, setSelectedRecipients] = React.useState<string[]>([])
  const replyMutation = useReplyToContactSubmissionMutation()
  const forwardMutation = useForwardContactSubmissionMutation()
  const recipientsQuery = useSubmissionRecipientsQuery()
  const deleteMutation = useDeleteContactSubmissionMutation()

  const sendReply = () => {
    replyMutation.mutate(
      { id: submission.id, message },
      {
        onSuccess: () => {
          toast.success("Reply sent.")
          setMessage("")
        },
        onError: () => toast.error("Couldn't send the reply."),
      }
    )
  }

  const forward = () => {
    forwardMutation.mutate(
      { id: submission.id, recipients: selectedRecipients, note },
      {
        onSuccess: () => {
          toast.success("Enquiry forwarded.")
          setNote("")
          setSelectedRecipients([])
        },
        onError: () => toast.error("Couldn't forward the enquiry."),
      }
    )
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{submission.subject}</DialogTitle>
        <DialogDescription>
          From {submission.name} · {submission.email} · {new Date(submission.createdAt).toLocaleString()}
        </DialogDescription>
      </DialogHeader>
      <div className="rounded-lg bg-muted/40 p-4 text-sm leading-7 whitespace-pre-wrap">
        {submission.message}
      </div>
      <section className="space-y-3">
        <h3 className="font-semibold">Reply</h3>
        <Textarea
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Write your reply..."
        />
        <Button disabled={!message.trim() || replyMutation.isPending} onClick={sendReply}>
          {replyMutation.isPending && <Spinner />}
          <ReplyIcon data-icon="inline-start" />
          Send reply
        </Button>
      </section>
      <section className="space-y-3 border-t border-border pt-4">
        <h3 className="font-semibold">Forward to team</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {recipientsQuery.data?.map((recipient) => (
            <label key={recipient.email} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedRecipients.includes(recipient.email)}
                onChange={(event) =>
                  setSelectedRecipients((current) =>
                    event.target.checked
                      ? [...current, recipient.email]
                      : current.filter((email) => email !== recipient.email)
                  )
                }
              />
              <span className="min-w-0 truncate">{recipient.name} · {recipient.email}</span>
            </label>
          ))}
        </div>
        <Textarea
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Optional note to the team..."
        />
        <Button
          variant="outline"
          disabled={selectedRecipients.length === 0 || forwardMutation.isPending}
          onClick={forward}
        >
          {forwardMutation.isPending && <Spinner />}
          <ForwardIcon data-icon="inline-start" />
          Forward enquiry
        </Button>
      </section>
      <DialogFooter className="justify-between">
        <ConfirmDialog
          trigger={
            <Button variant="outline" className="text-destructive">
              <Trash2Icon data-icon="inline-start" />
              Delete
            </Button>
          }
          title="Delete this enquiry?"
          description={`The enquiry from ${submission.name} will be permanently removed.`}
          onConfirm={() =>
            deleteMutation.mutate(submission.id, {
              onSuccess: () => toast.success("Enquiry deleted."),
              onError: () => toast.error("Couldn't delete the enquiry."),
            })
          }
        />
      </DialogFooter>
    </DialogContent>
  )
}

const newsletterColumns: ColumnDef<NewsletterSubscriberItem, unknown>[] = [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="block max-w-72 truncate">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => <span className="block text-right">Subscribed</span>,
    cell: ({ row }) => (
      <span className="block text-right text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </span>
    ),
  },
]

function NewsletterList() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  })
  const query = useNewsletterSubscribersQuery({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  })

  const pageCount = query.data
    ? Math.ceil(query.data.total / query.data.pageSize)
    : 0
  const table = useDataTable({
    data: query.data?.items ?? [],
    columns: newsletterColumns,
    pageCount,
    pagination,
    onPaginationChange: setPagination,
  })

  if (query.isError) {
    return (
      <QueryError
        title="Couldn't load subscribers"
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    )
  }

  if (!query.isPending && query.data.items.length === 0) {
    return (
      <EmptyState icon={MailIcon}>No newsletter subscribers yet.</EmptyState>
    )
  }

  return (
    <DataTable
      table={table}
      isLoading={query.isPending}
      pageSizeOptions={[25, 50, 100]}
    >
      <p className="text-sm text-muted-foreground">
        {query.data?.total ?? 0}{" "}
        {query.data?.total === 1 ? "address" : "addresses"} on the list
      </p>
    </DataTable>
  )
}
