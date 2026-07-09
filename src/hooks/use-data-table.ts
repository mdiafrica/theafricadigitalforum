import * as React from "react"
import {
  type ColumnDef,
  type PaginationState,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

interface UseDataTableOptions<TData> {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  /**
   * Server-side pagination: pass the total page count. When omitted the table
   * paginates its rows in memory (client-side).
   */
  pageCount?: number
  /** Controlled pagination state — required for server-side pagination. */
  pagination?: PaginationState
  onPaginationChange?: React.Dispatch<React.SetStateAction<PaginationState>>
  /** Client-side only: initial rows per page (default 10). */
  initialPageSize?: number
}

export function useDataTable<TData>({
  data,
  columns,
  pageCount,
  pagination,
  onPaginationChange,
  initialPageSize = 10,
}: UseDataTableOptions<TData>) {
  const manual = pagination !== undefined

  return useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(manual
      ? {
          manualPagination: true,
          pageCount: pageCount ?? -1,
          state: { pagination },
          onPaginationChange,
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          initialState: {
            pagination: { pageIndex: 0, pageSize: initialPageSize },
          },
        }),
  })
}
