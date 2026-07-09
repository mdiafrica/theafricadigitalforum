import type * as React from "react"

import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"

/**
 * Dialog shell for the collection CRUD forms (speakers, sponsors, events):
 * form wiring, header, footer with submit and an optional confirm-gated
 * delete. Field layout is the caller's.
 */
export function EntityDialog({
  title,
  description,
  submitLabel,
  submitPending,
  onSubmit,
  onClose,
  remove,
  children,
}: {
  title: string
  description: string
  submitLabel: string
  submitPending: boolean
  onSubmit: (event: React.FormEvent) => void
  onClose: () => void
  remove?: {
    confirmTitle: string
    confirmDescription: string
    pending: boolean
    onDelete: () => void
  }
  children: React.ReactNode
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {children}

          <DialogFooter className="gap-2">
            {remove && (
              <ConfirmDialog
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-auto text-destructive"
                    disabled={remove.pending}
                  >
                    {remove.pending && <Spinner />}
                    Delete
                  </Button>
                }
                title={remove.confirmTitle}
                description={remove.confirmDescription}
                onConfirm={remove.onDelete}
              />
            )}
            <Button type="submit" disabled={submitPending}>
              {submitPending && <Spinner />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
