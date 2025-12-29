import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb";
import { DefaultColumnFormat, DetailTable, DynamicTable } from "./dynamic-table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@radix-ui/react-hover-card";
import { Button } from "./ui/button";
import { Info, Loader2Icon } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FilterField } from "./dynamic-filter";
import Cookies from 'js-cookie';

export type PageBreadcrumb = {
    name: string;
    href?: string;
};

export interface IRoute {
    list: string;
    withSlug?: (slug: string) => string;
    add: string;
    edit: (id: string) => string;
    details: (id: string) => string;
}

export interface DynamicPageProps {
    apiPath: string,
    title?: string;
    description?: string;
    pageRoute?: IRoute;
    columnFormats?: DefaultColumnFormat[];
    showHeader?: boolean;
    breadcrumb?: PageBreadcrumb[];
    detailTable?: DetailTable[];
    filterFields?: FilterField[];
    queryWithTenandID?: boolean;
    slugTenantID?: string;
    showAddAction?: boolean;
    showExportAction?: boolean;
    showImportAction?: boolean;
    showDetailTable?: boolean;
}

export function DynamicPage(
    {
        title = 'Dynamic Page',
        description = `This is ${title}`,
        pageRoute,
        apiPath,
        columnFormats,
        showHeader = true,
        breadcrumb,
        detailTable,
        filterFields = [],
        queryWithTenandID = true,
        slugTenantID = "tenant_id",
        showAddAction = true,
        showExportAction = true,
        showImportAction = true,
        showDetailTable = false,
    }: DynamicPageProps
) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const filterState: Record<string, any> = {};
    const [currentPage, setCurrentPage] = useState(1);
    const [totalData, setTotalData] = useState(10);
    const [pageSize, setPageSize] = useState(25);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState(filterState);
    const [sortConfig, setSortConfig] = useState({
        key: "",
        direction: "",
    });

    // dynamic fetch data
    const fetchData = useCallback(async (query?: Record<string, any>) => {
        setLoading(true)

        try {
            const baseUrl = apiPath;
            const url = new URL(baseUrl, window.location.origin);
            if (query) {
                Object.entries(query).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        url.searchParams.append(key, String(value));
                    }
                });
            }

            if (queryWithTenandID) {
                const tenantId = Cookies.get('tenant')
                url.searchParams.append(slugTenantID, String(tenantId))
            }

            const res = await fetch(url.toString(), {
                method: 'GET',
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            })

            if (res.status === 401) {
                toast.error("Session expired. Please log in again.");
                router.push("/login");
                return;
            }

            if (res.status === 403) {
                toast.error("You do not have permission to access this resource.");
                return;
            }

            if (!res.ok) throw new Error("Fetch failure")

            const { data, totalData, page, pageSize } = await res.json()
            if (data) {
                setData(data || []);
                setTotalData(totalData || 10);
                setPageSize(pageSize || 25);
                setCurrentPage(page || 1);

                // Generate query string dynamically
                const searchParams = new URLSearchParams();
                Object.entries(query || {}).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        searchParams.append(key, String(value));
                    }
                });

                router.push(`?${searchParams.toString()}`);
            }
        } catch (err: any) {
            toast.error("Get unsuccessful!", { description: err.message })
        } finally {
            setLoading(false)
        }
    }, [])

    // handle dynamic sort
    const handleSortingChange = useCallback((sortUpdater: any) => {
        let sort: any[] = [];

        if (typeof sortUpdater === "function") {
            sort = sortUpdater([]);
        } else if (Array.isArray(sortUpdater)) {
            sort = sortUpdater;
        }
        const latestSort = sort[0];
        setSortConfig(
            latestSort
                ? {
                    key: latestSort.id,
                    direction: latestSort.desc ? "desc" : "asc",
                }
                : { key: "", direction: "" }
        );
    }, []);

    // hande filter
    const updateFilter = (newFilters: Record<string, any>) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    // hande reset filter
    const handleReset = () => {
        setFilters({});
        setCurrentPage(1);
    };

    const sortingState = useMemo(() => {
        return sortConfig.key
            ? [{ id: sortConfig.key, desc: sortConfig.direction === "desc" }]
            : [];
    }, [sortConfig]);

    // useEffect section
    useEffect(() => {
        const hasParams = searchParams.toString().length > 0;
        const query: Record<string, any> = hasParams
            ? Object.fromEntries(searchParams.entries())
            : {};

        if (query.page && Number(query.page) !== currentPage) {
            setCurrentPage(Number(query.page));
        }

        if (query.limit && Number(query.limit) !== pageSize) {
            setPageSize(Number(query.limit));
        }
    }, [searchParams]);

    useEffect(() => {
        const query = {
            page: currentPage,
            limit: pageSize,
            ...filters,
            sortBy: sortConfig.key || "created_at",
            sortOrder: sortConfig.direction || "desc",
        };

        fetchData(query);
    }, [currentPage, pageSize, filters, sortConfig]);

    return (
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4 overflow-hidden">
                    <SidebarTrigger className="-ml-1" />
                    {breadcrumb && (
                        <>
                            <Separator
                                orientation="vertical"
                                className="mr-1 data-[orientation=vertical]:h-4"
                            />

                            <Breadcrumb className="whitespace-nowrap overflow-hidden text-ellipsis">
                                <BreadcrumbList>
                                    {breadcrumb.map((item, index) => (
                                        <div key={index} className="flex items-center">
                                            <BreadcrumbItem className="hidden md:block whitespace-nowrap">
                                                <BreadcrumbLink href={item.href}>
                                                    {item.name}
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                            {(index + 1) !== breadcrumb.length && (
                                                <BreadcrumbSeparator className="hidden md:block ml-1" />
                                            )}
                                        </div>
                                    ))}
                                </BreadcrumbList>
                            </Breadcrumb>
                        </>
                    )}
                </div>
            </header>

            {/* Header & Table */}
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                {/* Header */}
                {showHeader && (
                    <div className="flex items-center justify-between w-full">
                        {/* Title Page */}
                        <div className="flex items-center gap-2">
                            <h4 className="scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0">
                                {title}
                            </h4>
                            <HoverCard>
                                <HoverCardTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-6 h-6 p-0 text-muted-foreground"
                                    >
                                        <Info className="w-4 h-4" />
                                    </Button>
                                </HoverCardTrigger>
                                <HoverCardContent
                                    side="right"
                                    className="w-80 ml-2 bg-black/60 backdrop-blur-lg border border-white/10 text-white rounded-xl p-4 shadow-lg ring-1 ring-white/20 transition-all duration-200 ease-in-out"
                                >
                                    <p className="text-sm">{description}</p>
                                </HoverCardContent>
                            </HoverCard>
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="flex items-center pr-2">
                                <Loader2Icon className="w-7 h-7 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>
                )}

                {/* Dynamic Table */}
                <DynamicTable
                    data={data}
                    totalData={totalData}
                    showAddAction={showAddAction}
                    showExportAction={showExportAction}
                    showImportAction={showImportAction}
                    showDetailTable={showDetailTable}
                    detailTable={detailTable}
                    pageRoute={pageRoute}
                    columnFormats={columnFormats}
                    onSortingChange={handleSortingChange}
                    sortingState={sortingState}
                    filters={filters}
                    filterFields={filterFields}
                    updateFilter={updateFilter}
                    handleReset={handleReset}
                    onPaginationChange={(pageIndex, pageSize) => {
                        setCurrentPage(pageIndex + 1);
                        setPageSize(pageSize);
                    }}
                />
            </div >
        </SidebarInset >
    )
}