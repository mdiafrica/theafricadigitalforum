import type * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getErrorMessage } from "@/lib/error"
import { cn } from "@/lib/utils"

export function QueryError({
  title = "Couldn't load this page",
  error,
  onRetry,
}: {
  title?: string
  error: unknown
  onRetry: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {getErrorMessage(error, "Something went wrong.")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </CardContent>
    </Card>
  )
}

export function EmptyState({
  icon: Icon,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-sm text-muted-foreground">
        {Icon && <Icon className="size-8 text-muted-foreground/60" />}
        <div>{children}</div>
      </CardContent>
    </Card>
  )
}

export function ListSkeleton({
  rows = 3,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-16 w-full" />
      ))}
    </div>
  )
}
