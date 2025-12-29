"use client"

import { useState } from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Download, Inbox, Plus, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IRoute } from "./dynamic-page"
import { useRouter } from "next/navigation";
import { DynamicFilter, FilterField } from "./dynamic-filter"
import { hasPermission } from "@/lib/permission/check"

export type DetailTable = {
    title?: string;
    description?: string;
    action?: React.ReactNode;
    content?: React.ReactNode;
};

export interface DefaultColumnFormat {
    title: string;
    sortable: boolean;
    key: string;
    className?: string;
    textClassName?: string;
    width?: number;
    type: "text" | "date" | "number" | "link" | "currency" | "percentage" | "html";
    href?: string;
    formatter?: (value: any, row: Record<string, any>) => React.ReactNode;
    dateFormat?: string;
    timeFormat?: string;
    useTime?: boolean;
    fractions?: number;
}

function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? '-';
}

export function generateColumns<T extends Record<string, any>>(
    columnFormats: DefaultColumnFormat[]
): ColumnDef<T>[] {
    return columnFormats.map((col): ColumnDef<T> => ({
        accessorKey: col.key,
        header: ({ column }) =>
            col.sortable ? (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                    className="px-0"
                >
                    {col.title}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ) : (
                col.title
            ),
        cell: ({ row }) => {
            const original = row.original
            const value = getNestedValue(original, col.key)

            if (col.formatter) return col.formatter(value, original)

            switch (col.type) {
                case "currency":
                    return (
                        <div className="text-right font-medium">
                            {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                            }).format(Number(value))}
                        </div>
                    )
                case "percentage":
                    return `${(Number(value) * 100).toFixed(col.fractions ?? 2)}%`
                case "number":
                    return Number(value).toLocaleString()
                case "date":
                    return new Date(value as string | number).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    })
                case "link":
                    const id = original?.id
                    return (
                        <a
                            href={col.href ? col.href.replace(":id", String(id)) : "#"}
                            className="text-blue-600 underline"
                        >
                            {String(value)}
                        </a>
                    )
                case "html":
                    return (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: String(value),
                            }}
                        />
                    )
                default:
                    return (
                        <div className={col.textClassName}>{String(value)}</div>
                    )
            }
        },
        enableSorting: col.sortable,
        meta: {
            className: col.className,
        },
    }))
}

export interface DynamicTableProps {
    data: any[];
    totalData?: number;
    pageSize?: number;
    pageRoute?: IRoute;
    showDetailTable?: boolean;
    showAddAction?: boolean;
    showExportAction?: boolean;
    showImportAction?: boolean;
    columnFormats?: DefaultColumnFormat[];
    detailTable?: DetailTable[];
    sortingState?: SortingState;
    filters: Record<string, any>;
    filterFields?: FilterField[];
    updateFilter: (newFilters: Record<string, any>) => void;
    handleReset: () => void;
    onSortingChange?: (state: SortingState) => void;
    onPaginationChange?: (pageIndex: number, pageSize: number) => void;
}

export function DynamicTable(
    {
        data,
        totalData = 10,
        pageSize = 25,
        pageRoute,
        showDetailTable = false,
        showAddAction = true,
        showExportAction = true,
        showImportAction = true,
        columnFormats,
        detailTable,
        sortingState = [],
        filters,
        filterFields = [],
        updateFilter,
        handleReset,
        onSortingChange,
        onPaginationChange,
    }: DynamicTableProps
) {
    const router = useRouter();

    const [sorting, setSorting] = useState<SortingState>(sortingState)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    const columns = generateColumns<any>(columnFormats ?? [])

    const table = useReactTable({
        data,
        columns,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onSortingChange: (newSorting: any) => {
            setSorting(newSorting)
            onSortingChange?.(newSorting)
        },
        pageCount: totalData ? Math.ceil(totalData / pageSize) : undefined,
        manualPagination: true,
        state: {
            sorting: sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        initialState: {
            pagination: {
                pageSize: pageSize,
            },
        }
    })

    return (
        <div className="w-full">
            {/* Filter Section */}
            <div className="flex flex-wrap items-center justify-between py-1 mb-3 gap-2">
                <div className="flex flex-wrap gap-2">
                    {showAddAction && (
                        <Button onClick={() => router.push(pageRoute?.add ?? '')}>
                            <Plus strokeWidth={3} /> Add New
                        </Button>
                    )}

                    {showExportAction && (
                        <Button>
                            <Upload strokeWidth={3} /> Export
                        </Button>
                    )}

                    {showImportAction && (
                        <Button>
                            <Download strokeWidth={3} /> Import
                        </Button>
                    )}
                </div>
                {/* Filter Table */}
                <div className="flex flex-wrap items-center gap-2 ml-auto">
                    <DynamicFilter
                        filters={filters}
                        filterFields={filterFields}
                        updateFilter={updateFilter}
                        handleReset={handleReset}
                    />
                    {table.getAllColumns().length >= 1 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="ml-auto">
                                    Columns <ChevronDown />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    column.toggleVisibility(!!value)
                                                }
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        )
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Detail Table Section */}
            {showDetailTable && detailTable && (
                <div className="grid grid-cols-4 gap-4 mb-4">
                    {detailTable.map((v, i) => (
                        <Card key={i} className="shadow-none">
                            <CardHeader>
                                {v.title && <CardTitle>{v.title}</CardTitle>}
                                {v.description && <CardDescription>{v.description}</CardDescription>}
                                {v.action && <CardAction>{v.action}</CardAction>}
                            </CardHeader>
                            <CardContent>
                                {v.content ?? <div className="text-muted-foreground italic">No data</div>}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Table Section */}
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
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
                            <TableRow>

                                <TableCell colSpan={columns.length} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                                        <Inbox className="w-20 h-20" strokeWidth={1} />
                                        <p className="text-sm">No results found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Section */}
            {data.length >= 1 && (
                <div className="flex items-center justify-between py-4">
                    {/* Jumlah terpilih */}
                    <div className="text-muted-foreground text-sm flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rows per page:</span>
                        <Select
                            value={String(table.getState().pagination.pageSize)}
                            onValueChange={(value) => {
                                const newPageSize = Number(value);
                                table.setPageSize(newPageSize);
                                onPaginationChange?.(table.getState().pagination.pageIndex, newPageSize);
                            }}
                        >
                            <SelectTrigger className="h-8 w-[80px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[25, 50, 100].map((pageSize) => (
                                    <SelectItem key={pageSize} value={String(pageSize)}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <span className="mx-1">|</span>

                        <span>
                            {table.getFilteredSelectedRowModel().rows.length} of{" "}
                            {table.getFilteredRowModel().rows.length} row(s) selected.
                        </span>
                    </div>


                    {/* Pagination */}
                    <div className="flex items-center space-x-2">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            table.previousPage()
                                        }}
                                        className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                                {Array.from({ length: table.getPageCount() }).map((_, index) => (
                                    <PaginationItem key={index}>
                                        <PaginationLink
                                            href="#"
                                            isActive={table.getState().pagination.pageIndex === index}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                table.setPageIndex(index);
                                                onPaginationChange?.(index, table.getState().pagination.pageSize);
                                            }}
                                        >
                                            {index + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            table.nextPage()
                                        }}
                                        className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            )}

        </div >
    )
}
