import * as React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

/**
 * Confirmation gate for destructive actions. Pass `trigger` for the
 * self-contained case; pass `open`/`onOpenChange` instead when the trigger
 * lives somewhere that unmounts (e.g. a dropdown menu item). The dialog
 * closes as soon as the action is confirmed — outcomes surface via toasts.
 */
export function ConfirmDialog({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
}: {
  trigger?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: React.ReactNode
  description: React.ReactNode
  confirmLabel?: string
  onConfirm: () => void
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isOpen = open ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <AlertDialogTrigger render={trigger} />}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              onConfirm()
              setOpen(false)
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
