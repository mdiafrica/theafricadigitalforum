import * as React from "react"
import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import { InboxIcon, MailIcon } from "lucide-react"

import {
  useContactSubmissionsQuery,
  useNewsletterSubscribersQuery,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
