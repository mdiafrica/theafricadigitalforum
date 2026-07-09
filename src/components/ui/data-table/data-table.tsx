import * as React from "react"
import { flexRender, type Table as TanstackTable } from "@tanstack/react-table"

import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination"
import { DataTableSkeleton } from "@/components/ui/data-table/data-table-skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>
  /**
   * Show the skeleton in place of the live table. Use for the *initial* load
   * only (e.g. `query.isPending`), not on every refetch.
   */
  isLoading?: boolean
  /** Rendered inside the empty cell when there are no rows. */
  emptyState?: React.ReactNode
  pageSizeOptions?: number[]
  /** Called when a body row is clicked (whole row becomes the hit target). */
  onRowClick?: (row: TData) => void
}

export function DataTable<TData>({
  table,
  isLoading = false,
  emptyState,
  pageSizeOptions,
  onRowClick,
  className,
  children,
  ...props
}: DataTableProps<TData>) {
  if (isLoading) {
    return (
      <DataTableSkeleton
        columnCount={table.getAllColumns().length}
        className={className}
        {...props}
      />
    )
  }

  // Hide the bar when everything fits on one page. For server-side
  // (manual) pagination `getPageCount()` still reflects the total, since the
  // table is given `pageCount` from the total row count.
  const showPagination = table.getPageCount() > 1

  return (
    <div className={cn("flex flex-col gap-2.5", className)} {...props}>
      {children}
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                  className={onRowClick ? "cursor-pointer" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24"
                >
                  {emptyState ?? (
                    <p className="text-center text-sm text-muted-foreground">
                      No results.
                    </p>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <DataTablePagination
          table={table}
          {...(pageSizeOptions ? { pageSizeOptions } : {})}
        />
      )}
    </div>
  )
}
