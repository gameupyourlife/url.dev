"use client";
import * as React from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import Link from "next/link";
import { ShortUrl } from "@/lib/db/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { getShortUrlsPaginated } from "@/app/actions/short-urls";



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

            const json = await getShortUrlsPaginated({ page, pageSize, search, sortBy, sortDir });
            setData(json.data || []);
            setTotal(json.total || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, debouncedSearch, sortBy, sortDir, isActiveFilter]);

    // React.useEffect(() => {
    //     fetchData();
    // }, [fetchData]);

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
                <input placeholder="Search slug, URL, title..." value={search} onChange={(e) => setSearch(e.target.value)} className="input" />
                <select value={isActiveFilter} onChange={(e) => setIsActiveFilter(e.target.value)} className="select">
                    <option value="all">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="select">
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </select>
                <div className="ml-auto text-sm text-muted-foreground">{loading ? 'Loading...' : `Showing ${Math.min((page - 1) * pageSize + 1, total)}-${Math.min(page * pageSize, total)} of ${total}`}</div>
            </div>

            <div className="overflow-x-auto border rounded">
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
                                <TableRow key={row.id} className="border-t">
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
                    <button className="btn" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
                    <button className="btn" disabled={page * pageSize >= total} onClick={() => setPage((p) => p + 1)}>Next</button>
                </div>
                <div className="text-sm">Page {page} of {Math.max(1, Math.ceil(total / pageSize))}</div>
            </div>
        </div>
    );
}
