"use client";
import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { ShortUrl } from "@/lib/db/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { getShortUrlsPaginated } from "@/app/actions/short-urls";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import CopyButton from "../ui/CopyButton";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowUpDown,
    BarChart2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Filter,
    MousePointer2,
    Search,
    X,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";

export default function UrlsTable({
    initialUrls,
}: {
    initialUrls: ShortUrl[];
}) {
    const [data, setData] = React.useState<ShortUrl[]>(initialUrls);
    const [total, setTotal] = React.useState(0);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(25);
    const [search, setSearch] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    const [sortBy, setSortBy] = React.useState<
        "createdAt" | "clickCount" | "slug"
    >("createdAt");
    const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
    const [isActiveFilter, setIsActiveFilter] = React.useState<string>("all");
    const [loading, setLoading] = React.useState(false);

    const toggleSort = (column: "createdAt" | "clickCount" | "slug") => {
        if (sortBy === column) {
            setSortDir(sortDir === "desc" ? "asc" : "desc");
        } else {
            setSortBy(column);
            setSortDir("desc");
        }
    };

    const columns = React.useMemo<ColumnDef<ShortUrl>[]>(
        () => [
            {
                accessorKey: "title",
                header: "Link",
                cell: (info: any) => {
                    const url = info.row.original;
                    return (
                        <div className="flex flex-col gap-1 min-w-0">
                            <Link
                                href={`/dashboard/urls/${url.id}`}
                                className="font-medium text-foreground hover:text-primary transition-colors truncate"
                            >
                                {url.title || url.slug}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="truncate max-w-[200px]">
                                    {url.originalUrl}
                                </span>
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "slug",
                header: "Short URL",
                cell: (info: any) => {
                    const shortUrl = `/s/${info.getValue()}`;
                    return (
                        <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                                {info.getValue()}
                            </code>
                            <CopyButton
                                value={`${typeof window !== "undefined" ? window.location.origin : ""}${shortUrl}`}
                                className="h-7 w-7"
                            />
                        </div>
                    );
                },
            },
            {
                accessorKey: "clickCount",
                header: () => (
                    <button
                        type="button"
                        onClick={() => toggleSort("clickCount")}
                        className="flex items-center gap-1 font-medium hover:text-foreground transition-colors"
                    >
                        <MousePointer2 className="h-4 w-4" />
                        Clicks
                        {sortBy === "clickCount" && (
                            <ArrowUpDown className="h-3 w-3" />
                        )}
                    </button>
                ),
                cell: (info: any) => {
                    const clicks = info.getValue() as number;
                    return (
                        <Badge
                            variant="secondary"
                            className={
                                clicks > 100
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : clicks > 10
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                      : ""
                            }
                        >
                            {clicks.toLocaleString()}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "createdAt",
                header: () => (
                    <button
                        type="button"
                        onClick={() => toggleSort("createdAt")}
                        className="flex items-center gap-1 font-medium hover:text-foreground transition-colors"
                    >
                        <Calendar className="h-4 w-4" />
                        Created
                        {sortBy === "createdAt" && (
                            <ArrowUpDown className="h-3 w-3" />
                        )}
                    </button>
                ),
                cell: (info: any) => {
                    const date = new Date(info.getValue() as string);
                    return (
                        <span className="text-sm text-muted-foreground">
                            {date.toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year:
                                    date.getFullYear() !==
                                    new Date().getFullYear()
                                        ? "numeric"
                                        : undefined,
                            })}
                        </span>
                    );
                },
            },
            {
                accessorKey: "isActive",
                header: "Status",
                cell: (info: any) => (
                    <Badge
                        variant="secondary"
                        className={
                            info.getValue()
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }
                    >
                        {info.getValue() ? "Active" : "Inactive"}
                    </Badge>
                ),
            },
            {
                id: "actions",
                header: "",
                cell: (info: any) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                    >
                        <Link href={`/dashboard/urls/${info.row.original.id}`}>
                            <BarChart2 className="h-4 w-4 mr-1" />
                            Analytics
                        </Link>
                    </Button>
                ),
            },
        ],
        [sortBy, sortDir],
    );

    const table = useReactTable({
        data,
        columns,
        pageCount: Math.ceil(total / pageSize) || 1,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
    });

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            const json = await getShortUrlsPaginated({
                page,
                pageSize,
                search: debouncedSearch,
                sortBy,
                sortDir,
                isActive:
                    isActiveFilter !== "all"
                        ? isActiveFilter === "true"
                        : undefined,
            });
            setData(json.data || []);
            setTotal(json.total || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, debouncedSearch, sortBy, sortDir, isActiveFilter]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Debounce search
    React.useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    // Reset page on filter changes
    React.useEffect(() => {
        setPage(1);
    }, [debouncedSearch, pageSize, isActiveFilter]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const hasFilters = search || isActiveFilter !== "all";

    return (
        <Card>
            {/* Filters Bar */}
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search links..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 w-full"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select
                        value={isActiveFilter}
                        onValueChange={setIsActiveFilter}
                    >
                        <SelectTrigger className="w-full sm:w-[130px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Link Status</SelectLabel>
                                <SelectItem value="all">All Links</SelectItem>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Select
                        value={String(pageSize)}
                        onValueChange={(v) => setPageSize(Number(v))}
                    >
                        <SelectTrigger className="w-full sm:w-[100px]">
                            <SelectValue placeholder="Per page" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Per Page</SelectLabel>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            {/* Table */}
            <CardContent className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup: any) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header: any) => (
                                    <TableHead
                                        key={header.id}
                                        className="px-4 py-3"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-32"
                                >
                                    <div className="flex items-center justify-center text-muted-foreground">
                                        <div className="animate-pulse">
                                            Loading...
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-32"
                                >
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <Search className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                        <p className="text-muted-foreground">
                                            {hasFilters
                                                ? "No links match your filters"
                                                : "No links yet"}
                                        </p>
                                        {hasFilters && (
                                            <Button
                                                variant="link"
                                                size="sm"
                                                onClick={() => {
                                                    setSearch("");
                                                    setIsActiveFilter("all");
                                                }}
                                            >
                                                Clear filters
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row: any) => (
                                <TableRow
                                    key={row.id}
                                    className="hover:bg-muted/50"
                                >
                                    {row.getVisibleCells().map((cell: any) => (
                                        <TableCell
                                            key={cell.id}
                                            className="px-4 py-3"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            {/* Pagination */}
            <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    {total > 0 ? (
                        <>
                            Showing{" "}
                            <span className="font-medium">
                                {(page - 1) * pageSize + 1}
                            </span>
                            -
                            <span className="font-medium">
                                {Math.min(page * pageSize, total)}
                            </span>{" "}
                            of <span className="font-medium">{total}</span>{" "}
                            links
                        </>
                    ) : (
                        "No results"
                    )}
                </p>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>Page</span>
                        <span className="font-medium text-foreground">
                            {page}
                        </span>
                        <span>of</span>
                        <span className="font-medium text-foreground">
                            {totalPages}
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
