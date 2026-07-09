import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface DataTableSkeletonProps extends React.ComponentProps<"div"> {
  columnCount: number
  rowCount?: number
  withPagination?: boolean
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 8,
  withPagination = true,
  className,
  ...props
}: DataTableSkeletonProps) {
  return (
    <div className={cn("flex w-full flex-col gap-2.5", className)} {...props}>
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columnCount }).map((_, j) => (
                <TableHead key={j}>
                  <Skeleton className="h-5 w-full max-w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {withPagination && (
        <div className="flex w-full items-center justify-end gap-6 p-1">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-7 w-20" />
          <div className="flex items-center gap-2">
            <Skeleton className="hidden size-7 lg:block" />
            <Skeleton className="size-7" />
            <Skeleton className="size-7" />
            <Skeleton className="hidden size-7 lg:block" />
          </div>
        </div>
      )}
    </div>
  )
}
