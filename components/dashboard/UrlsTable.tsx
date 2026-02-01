"use client";
import * as React from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import Link from "next/link";
import { ShortUrl } from "@/lib/db/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { getShortUrlsPaginated } from "@/app/actions/short-urls";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


export default function UrlsTable({ initialUrls }: { initialUrls: ShortUrl[] }) {
    const [data, setData] = React.useState<ShortUrl[]>(initialUrls);
    const [total, setTotal] = React.useState(0);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(25);
    const [search, setSearch] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    const [sortBy, setSortBy] = React.useState<"createdAt" | "clickCount" | "slug">("createdAt");
    const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
    const [isActiveFilter, setIsActiveFilter] = React.useState<string>("all");
    const [loading, setLoading] = React.useState(false);

    const columns = React.useMemo<ColumnDef<ShortUrl>[]>(
        () => [
            {
                accessorKey: "title",
                header: "Title",
                cell: (info: any) => info.getValue() || info.row.original.slug,
            },
            {
                accessorKey: "slug",
                header: "Slug",
                cell: (info: any) => <Link className="text-indigo-600" href={`/dashboard/urls/${info.row.original.id}`}>{info.getValue()}</Link>,
            },
            {
                accessorKey: "originalUrl",
                header: "Original URL",
                cell: (info: any) => <a href={info.getValue() as string} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground">{info.getValue() as string}</a>
            },
            {
                accessorKey: "clickCount",
                header: () => (
                    <button type="button" onClick={() => { setSortBy('clickCount'); setSortDir(sortDir === 'desc' ? 'asc' : 'desc'); }} className="font-medium">Clicks</button>
                ),
                cell: (info: any) => info.getValue(),
            },
            {
                accessorKey: "createdAt",
                header: () => (
                    <button type="button" onClick={() => { setSortBy('createdAt'); setSortDir(sortDir === 'desc' ? 'asc' : 'desc'); }} className="font-medium">Created</button>
                ),
                cell: (info: any) => new Date(info.getValue() as string).toLocaleDateString(),
            },
            {
                accessorKey: "isActive",
                header: "Active",
                cell: (info: any) => info.getValue() ? 'Yes' : 'No',
            },
        ],
        [sortDir]
    );

    const table = useReactTable({
        data,
        columns,
        pageCount: Math.ceil(total / pageSize) || 1,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
    });

    // keep table in sync when data changes
    React.useEffect(() => {
        // noop for now, react-table reads from `data` directly
    }, [data]);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('pageSize', String(pageSize));
            params.set('sortBy', sortBy);
            params.set('sortDir', sortDir);
            if (debouncedSearch) params.set('search', debouncedSearch);
            if (isActiveFilter !== 'all') params.set('isActive', isActiveFilter === 'true' ? 'true' : 'false');

            const json = await getShortUrlsPaginated({ page, pageSize, search, sortBy, sortDir, isActive: isActiveFilter !== 'all' ? isActiveFilter === 'true' : undefined });
            console.log("Fetched data:", json);
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

    // debounce search
    React.useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 450);
        return () => clearTimeout(t);
    }, [search]);

    // reset page on key filters change
    React.useEffect(() => {
        setPage(1);
    }, [debouncedSearch, pageSize, isActiveFilter]);

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Input placeholder="Search slug, URL, title..." value={search} onChange={(e) => setSearch(e.target.value)} className="input" />
                <Select value={isActiveFilter} onValueChange={(value) => setIsActiveFilter(value)}>
                    <SelectTrigger className="w-full max-w-48">
                        <SelectValue placeholder="Select a fruit" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Link Status</SelectLabel>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                    <SelectTrigger className="w-full max-w-48">
                        <SelectValue placeholder="Select a fruit" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Page Size</SelectLabel>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <div className="ml-auto text-sm text-muted-foreground">{loading ? 'Loading...' : `Showing ${Math.min((page - 1) * pageSize + 1, total)}-${Math.min(page * pageSize, total)} of ${total}`}</div>
            </div>

            <div className="overflow-x-auto rounded">
                <Table className="w-full text-left">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup: any) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header: any) => (
                                    <TableHead key={header.id} className="p-2">{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="p-4">No URLs found</TableCell></TableRow>
                        ) : (
                            table.getRowModel().rows.map((row: any) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell: any) => (
                                        <TableCell key={cell.id} className="p-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                    <Button size="sm" variant="ghost" disabled={page * pageSize >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </div>
                <div className="text-sm">Page {page} of {Math.max(1, Math.ceil(total / pageSize))}</div>
            </div>
        </div>
    );
}
