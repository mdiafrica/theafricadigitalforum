import * as React from "react"
import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import { InboxIcon, MailIcon, ReplyIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import {
  useDeleteContactSubmissionMutation,
  useContactSubmissionsQuery,
  useNewsletterSubscribersQuery,
  useReplyToContactSubmissionMutation,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table/data-table"
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
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">{item.subject}</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <CardDescription>
                {item.name} ·{" "}
                <a
                  href={`mailto:${item.email}`}
                  className="underline-offset-4 hover:underline"
                >
                  {item.email}
                </a>
              </CardDescription>
              <div className="flex flex-wrap gap-2 pt-2">
                <ReplyDialog submission={item} />
                <DeleteInquiryButton submission={item} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap text-foreground/90">
                {item.message}
              </p>
            </CardContent>
          </Card>
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

function ReplyDialog({ submission }: { submission: ContactSubmissionItem }) {
  const [open, setOpen] = React.useState(false)
  const [message, setMessage] = React.useState("")
  const mutation = useReplyToContactSubmissionMutation()

  const send = () => {
    mutation.mutate(
      { id: submission.id, message },
      {
        onSuccess: () => {
          toast.success("Reply sent.")
          setMessage("")
          setOpen(false)
        },
        onError: () => toast.error("Couldn't send the reply."),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <ReplyIcon data-icon="inline-start" />
        Reply
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reply to {submission.name}</DialogTitle>
          <DialogDescription>
            Your reply will be sent to {submission.email}.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          rows={7}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Write your reply..."
        />
        <DialogFooter>
          <Button
            type="button"
            disabled={!message.trim() || mutation.isPending}
            onClick={send}
          >
            {mutation.isPending && <Spinner />}
            Send reply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteInquiryButton({
  submission,
}: {
  submission: ContactSubmissionItem
}) {
  const mutation = useDeleteContactSubmissionMutation()

  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" size="sm" className="text-destructive">
          <Trash2Icon data-icon="inline-start" />
          Delete
        </Button>
      }
      title="Delete this enquiry?"
      description={`The enquiry from ${submission.name} will be permanently removed.`}
      onConfirm={() =>
        mutation.mutate(submission.id, {
          onSuccess: () => toast.success("Enquiry deleted."),
          onError: () => toast.error("Couldn't delete the enquiry."),
        })
      }
    />
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
