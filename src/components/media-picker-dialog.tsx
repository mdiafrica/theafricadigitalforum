import * as React from "react"
import { ImageIcon, XIcon } from "lucide-react"

import { useMediaListQuery, type MediaItem } from "@/domains/media"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * Media picker — selects an image from the media library (upload new images
 * at /admin/media). Returns the media id + url to the parent.
 */
export function MediaPickerDialog({
  imageUrl,
  onSelect,
  onClear,
  label = "Choose an image",
}: {
  imageUrl: string | null
  onSelect: (item: MediaItem) => void
  onClear: () => void
  label?: string
}) {
  const [open, setOpen] = React.useState(false)
  const mediaQuery = useMediaListQuery({ pageSize: 60 })

  return (
    <div className="flex items-start gap-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <button
              type="button"
              className={cn(
                "flex h-32 w-56 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30 transition-colors hover:border-ring",
                imageUrl && "border-solid"
              )}
            />
          }
        >
          {imageUrl ? (
            <img src={imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
              <ImageIcon className="size-5" />
              {label}
            </span>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              From the media library — upload new images in the Media section.
            </DialogDescription>
          </DialogHeader>

          {mediaQuery.isPending && (
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="aspect-square w-full" />
              ))}
            </div>
          )}
          {mediaQuery.isError && (
            <p className="py-6 text-sm text-destructive">
              Couldn&apos;t load the media library.
            </p>
          )}
          {mediaQuery.data && mediaQuery.data.items.length === 0 && (
            <p className="py-6 text-sm text-muted-foreground">
              No images yet — upload some in the Media section first.
            </p>
          )}
          {mediaQuery.data && mediaQuery.data.items.length > 0 && (
            <div className="grid max-h-[50vh] grid-cols-4 gap-3 overflow-y-auto">
              {mediaQuery.data.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="group aspect-square cursor-pointer overflow-hidden rounded-md border border-border transition-shadow hover:ring-2 hover:ring-ring"
                  onClick={() => {
                    onSelect(item)
                    setOpen(false)
                  }}
                >
                  <img
                    src={
                      item.variants.find((v) => v.width === 320)?.url ??
                      item.url
                    }
                    alt={item.alt ?? ""}
                    loading="lazy"
                    className="size-full object-cover transition-transform group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {imageUrl && (
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          <XIcon data-icon="inline-start" />
          Remove
        </Button>
      )}
    </div>
  )
}
