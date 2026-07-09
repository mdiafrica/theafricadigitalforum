import { useRef, useState } from "react"
import { Copy, ImagePlus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useSessionQuery } from "@/domains/auth"
import {
  ALLOWED_IMAGE_TYPES,
  useDeleteMediaMutation,
  useMediaListQuery,
  useUploadMediaMutation,
  type MediaItem,
} from "@/domains/media"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"
import { EmptyState, QueryError } from "@/components/admin/query-states"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { hasOrgPermission } from "@/lib/auth/permissions"
import { getErrorMessage } from "@/lib/error"

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaLibraryView() {
  const [page, setPage] = useState(1)
  const sessionQuery = useSessionQuery()
  const listQuery = useMediaListQuery({ page })
  const uploadMutation = useUploadMediaMutation()
  const deleteMutation = useDeleteMediaMutation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState<{
    done: number
    total: number
  } | null>(null)

  const session = sessionQuery.data
  const caller = { globalRole: session?.user.role, orgRole: session?.orgRole }
  const canUpload = hasOrgPermission(caller, { media: ["upload"] })
  const canDelete = hasOrgPermission(caller, { media: ["delete"] })

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const list = Array.from(files)
    setUploading({ done: 0, total: list.length })
    let failed = 0
    for (const file of list) {
      try {
        await uploadMutation.mutateAsync(file)
      } catch (error) {
        failed += 1
        toast.error(`${file.name}: ${getErrorMessage(error, "upload failed")}`)
      }
      setUploading((state) =>
        state ? { ...state, done: state.done + 1 } : state
      )
    }
    setUploading(null)
    if (failed < list.length) {
      toast.success(
        list.length === 1
          ? "Image uploaded."
          : `${list.length - failed} of ${list.length} images uploaded.`
      )
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const copyUrl = (item: MediaItem) => {
    void navigator.clipboard.writeText(item.url).then(() => {
      toast.success("URL copied.")
    })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Media"
        description="Images for blog posts, speakers and page content. WebP renditions and blur placeholders are generated automatically."
      >
        {canUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              className="hidden"
              onChange={(event) => void handleFiles(event.target.files)}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading !== null}
            >
              {uploading ? (
                <>
                  <Spinner />
                  Uploading {uploading.done + 1}/{uploading.total}…
                </>
              ) : (
                <>
                  <ImagePlus data-icon="inline-start" />
                  Upload images
                </>
              )}
            </Button>
          </>
        )}
      </PageHeader>

      {listQuery.isPending ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-xl" />
          ))}
        </div>
      ) : listQuery.isError ? (
        <QueryError
          title="Couldn't load media"
          error={listQuery.error}
          onRetry={() => void listQuery.refetch()}
        />
      ) : listQuery.data.items.length === 0 ? (
        <EmptyState icon={ImagePlus}>
          No images yet.
          {canUpload
            ? " Upload your first image to get started."
            : " Uploads will show up here."}
        </EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {listQuery.data.items.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                canDelete={canDelete}
                onCopy={() => copyUrl(item)}
                onDelete={() => {
                  deleteMutation.mutate(item.id, {
                    onSuccess: () => toast.success("Image deleted."),
                    onError: (error) =>
                      toast.error(
                        getErrorMessage(error, "Could not delete the image.")
                      ),
                  })
                }}
              />
            ))}
          </div>
          <Pagination
            page={page}
            pageSize={listQuery.data.pageSize}
            total={listQuery.data.total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}

function MediaCard({
  item,
  canDelete,
  onCopy,
  onDelete,
}: {
  item: MediaItem
  canDelete: boolean
  onCopy: () => void
  onDelete: () => void
}) {
  // Smallest rendition is plenty for a grid thumbnail.
  const thumb = item.variants[0]?.url ?? item.url
  const name = item.storageKey.split("/").pop() ?? item.storageKey

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-background/60">
      <div className="relative aspect-square bg-muted">
        <img
          src={thumb}
          alt={item.alt ?? ""}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-x-0 top-0 flex justify-end gap-1 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon-xs"
            aria-label="Copy URL"
            onClick={onCopy}
          >
            <Copy />
          </Button>
          {canDelete && (
            <ConfirmDialog
              trigger={
                <Button
                  variant="destructive"
                  size="icon-xs"
                  aria-label="Delete image"
                >
                  <Trash2 />
                </Button>
              }
              title="Delete this image?"
              description={`"${name}" will be removed from storage. Pages already using it will lose the image.`}
              onConfirm={onDelete}
            />
          )}
        </div>
      </div>
      <div className="px-2.5 py-2">
        <p className="truncate text-xs font-medium" title={name}>
          {name}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {item.width}×{item.height} · {formatBytes(item.size)} ·{" "}
          {item.variants.length} renditions
        </p>
      </div>
    </div>
  )
}
