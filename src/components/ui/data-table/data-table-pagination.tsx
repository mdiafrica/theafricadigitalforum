import type { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface DataTablePaginationProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>
  pageSizeOptions?: number[]
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination

  return (
    <div
      className={cn(
        "flex w-full items-center justify-end gap-4 overflow-auto p-1 sm:gap-6 lg:gap-8",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium whitespace-nowrap">Rows per page</p>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger size="sm" className="w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-center text-sm font-medium whitespace-nowrap">
        Page {pageIndex + 1} of {table.getPageCount()}
      </div>
      <div className="flex items-center gap-2">
        <Button
          aria-label="Go to first page"
          variant="outline"
          size="icon-sm"
          className="hidden lg:flex"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft />
        </Button>
        <Button
          aria-label="Go to previous page"
          variant="outline"
          size="icon-sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft />
        </Button>
        <Button
          aria-label="Go to next page"
          variant="outline"
          size="icon-sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight />
        </Button>
        <Button
          aria-label="Go to last page"
          variant="outline"
          size="icon-sm"
          className="hidden lg:flex"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  )
}
