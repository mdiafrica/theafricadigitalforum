import { Link, createFileRoute } from "@tanstack/react-router"
import {
  FileText,
  ImagePlus,
  Inbox,
  Layout,
  Mail,
  Mic,
  PlusIcon,
} from "lucide-react"

import { useSessionQuery } from "@/domains/auth"
import { usePostsAdminListQuery } from "@/domains/posts"
import { useSpeakersAdminQuery } from "@/domains/speakers"
import {
  useContactSubmissionsQuery,
  useNewsletterSubscribersQuery,
} from "@/domains/submissions"
import { PageHeader } from "@/components/admin/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { hasOrgPermission } from "@/lib/auth/permissions"

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
})

function AdminDashboard() {
  const sessionQuery = useSessionQuery()
  const session = sessionQuery.data
  const caller = { globalRole: session?.user.role, orgRole: session?.orgRole }
  const canCreatePosts = hasOrgPermission(caller, { post: ["create"] })

  const postsQuery = usePostsAdminListQuery({ pageSize: 5 })
  const speakersQuery = useSpeakersAdminQuery()
  const contactQuery = useContactSubmissionsQuery({ pageSize: 3 })
  const newsletterQuery = useNewsletterSubscribersQuery({ pageSize: 1 })

  const firstName = session?.user.name?.split(/\s+/)[0]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back${firstName ? `, ${firstName}` : ""}.`}
      >
        {canCreatePosts && (
          <Button render={<Link to="/admin/posts/new" />}>
            <PlusIcon data-icon="inline-start" />
            New post
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Posts"
          icon={FileText}
          value={postsQuery.data?.total}
          pending={postsQuery.isPending}
          to="/admin/posts"
        />
        <StatCard
          title="Speakers"
          icon={Mic}
          value={speakersQuery.data?.length}
          pending={speakersQuery.isPending}
          to="/admin/speakers"
        />
        <StatCard
          title="Enquiries"
          icon={Inbox}
          value={contactQuery.data?.total}
          pending={contactQuery.isPending}
          to="/admin/submissions"
        />
        <StatCard
          title="Subscribers"
          icon={Mail}
          value={newsletterQuery.data?.total}
          pending={newsletterQuery.isPending}
          to="/admin/submissions"
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent posts</CardTitle>
            <CardDescription>The latest articles, by update.</CardDescription>
          </CardHeader>
          <CardContent>
            {postsQuery.isPending && <Skeleton className="h-32 w-full" />}
            {postsQuery.data && postsQuery.data.items.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nothing written yet.
              </p>
            )}
            {postsQuery.data && postsQuery.data.items.length > 0 && (
              <ul className="divide-y divide-border">
                {postsQuery.data.items.map((post) => (
                  <li
                    key={post.id}
                    className="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
                  >
                    <Link
                      to="/admin/posts/$id"
                      params={{ id: post.id }}
                      className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
                    >
                      {post.title}
                    </Link>
                    <Badge
                      variant={
                        post.status === "published" ? "default" : "secondary"
                      }
                    >
                      {post.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Latest enquiries</CardTitle>
              <CardDescription>From the public contact form.</CardDescription>
            </CardHeader>
            <CardContent>
              {contactQuery.isPending && <Skeleton className="h-24 w-full" />}
              {contactQuery.data && contactQuery.data.items.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No enquiries yet.
                </p>
              )}
              {contactQuery.data && contactQuery.data.items.length > 0 && (
                <ul className="divide-y divide-border">
                  {contactQuery.data.items.map((item) => (
                    <li key={item.id} className="py-2 first:pt-0 last:pb-0">
                      <Link
                        to="/admin/submissions"
                        className="block min-w-0 hover:underline"
                      >
                        <p className="truncate text-sm font-medium">
                          {item.subject}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.name} ·{" "}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                render={<Link to="/admin/media" />}
              >
                <ImagePlus data-icon="inline-start" />
                Upload media
              </Button>
              <Button
                variant="outline"
                size="sm"
                render={<Link to="/admin/pages" />}
              >
                <Layout data-icon="inline-start" />
                Edit page copy
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  icon: Icon,
  value,
  pending,
  to,
}: {
  title: string
  icon: typeof FileText
  value: number | undefined
  pending: boolean
  to: string
}) {
  return (
    <Link to={to} className="group">
      <Card className="transition-colors group-hover:ring-primary/30">
        <CardContent className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{title}</p>
            {pending ? (
              <Skeleton className="mt-1 h-5 w-10" />
            ) : (
              <p className="text-lg leading-6 font-semibold">{value ?? "—"}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
