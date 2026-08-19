import * as React from "react"
import { toast } from "sonner"

import { usePublishPostMutation } from "@/domains/posts"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { getErrorMessage } from "@/lib/error"

/**
 * Publish dialog (ADR-0003): one action publishes the article and every
 * checked language. Existing translations are pre-checked; English is the
 * source language and can't be unchecked. An unchecked French stays hidden
 * from French readers until published from the editor.
 */
export function PublishPostDialog({
  postId,
  hasFr,
  open,
  onOpenChange,
}: {
  postId: string
  hasFr: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const publishMutation = usePublishPostMutation()
  const [includeFr, setIncludeFr] = React.useState(hasFr)

  // Re-prime the FR checkbox each time the dialog opens for a (possibly
  // different) post row.
  React.useEffect(() => {
    if (open) setIncludeFr(hasFr)
  }, [open, hasFr])

  const publish = () => {
    publishMutation.mutate(
      { id: postId, locales: includeFr ? ["fr"] : [] },
      {
        onSuccess: () => {
          toast.success("Post published.")
          onOpenChange(false)
        },
        onError: (error) =>
          toast.error(getErrorMessage(error, "Couldn't publish the post.")),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Publish this post?</DialogTitle>
          <DialogDescription>
            Each language goes live for its readers. Unchecked languages stay
            hidden until you publish them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox
              checked
              disabled
              aria-label="English (always published)"
            />
            English
            <span className="text-xs text-muted-foreground">
              source language
            </span>
          </Label>
          {hasFr ? (
            <Label className="flex items-center gap-2 font-normal">
              <Checkbox
                checked={includeFr}
                onCheckedChange={(checked) => setIncludeFr(checked === true)}
              />
              Français
            </Label>
          ) : (
            <p className="text-xs text-muted-foreground">
              No French translation yet — you can publish it later from the
              editor.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={publish} disabled={publishMutation.isPending}>
            {publishMutation.isPending && <Spinner />}
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
