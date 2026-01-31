"use client";
import { useEffect, useState } from "react";

export default function ClicksTable({ urlId }: { urlId: string }) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setPage(1);
    }, [urlId]);

    useEffect(() => {
        let cancelled = false;
        async function fetchPage() {
            setLoading(true);
            try {
                const params = new URLSearchParams({ type: "clicks", urlId, page: String(page), pageSize: String(pageSize) });
                const res = await fetch(`/api/analytics?${params.toString()}`);
                const json = await res.json();
                if (!cancelled) {
                    setData(json.data || []);
                    setTotal(json.total || 0);
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchPage();
        return () => { cancelled = true; };
    }, [urlId, page, pageSize]);

    const handleExport = () => {
        const params = new URLSearchParams({ type: "exportClicks", urlId });
        window.location.href = `/api/analytics?${params.toString()}`;
    };

    return (
        <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Recent Clicks</h3>
                <div className="flex items-center gap-2">
                    <button className="btn" onClick={handleExport}>Export CSV</button>
                    <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto rounded">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="p-2">Time</th>
                            <th className="p-2">IP</th>
                            <th className="p-2">Country</th>
                            <th className="p-2">Device</th>
                            <th className="p-2">Browser</th>
                            <th className="p-2">Referer</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="p-4">Loading…</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={6} className="p-4">No clicks</td></tr>
                        ) : (
                            data.map((c: any) => (
                                <tr key={c.id}>
                                    <td className="p-2">{new Date(c.clickedAt).toLocaleString()}</td>
                                    <td className="p-2">{c.ipAddress || '—'}</td>
                                    <td className="p-2">{c.countryName || '—'}</td>
                                    <td className="p-2">{c.deviceType || '—'}</td>
                                    <td className="p-2">{c.browserName || '—'}</td>
                                    <td className="p-2">{c.refererDomain || '—'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between mt-3">
                <div>Showing {(page-1)*pageSize + 1}-{Math.min(page*pageSize, total)} of {total}</div>
                <div className="flex items-center gap-2">
                    <button className="btn" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p-1))}>Previous</button>
                    <button className="btn" disabled={page*pageSize >= total} onClick={() => setPage((p) => p+1)}>Next</button>
                </div>
            </div>
        </div>
    );
}
