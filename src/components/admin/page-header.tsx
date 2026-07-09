import type * as React from "react"
import { Link, type LinkProps } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

export function PageHeader({
  title,
  description,
  back,
  badge,
  children,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  back?: { to: LinkProps["to"]; label: string }
  badge?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        {back && (
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2 text-muted-foreground"
            render={
              <Link to={back.to}>
                <ArrowLeft data-icon="inline-start" />
                {back.label}
              </Link>
            }
          />
        )}
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
