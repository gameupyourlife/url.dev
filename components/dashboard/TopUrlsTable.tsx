import { getTopUrls } from "@/app/actions/analytics";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function TopUrlsTable() {
    const rows = await getTopUrls({ limit: 10 });

    return (
        <Card className="p-4">
            <h2 className="text-lg font-medium mb-2">Top URLs</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="py-2">URL</th>
                            <th className="py-2">Slug</th>
                            <th className="py-2">Clicks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.id} className="border-t">
                                <td className="py-2">{r.title || r.originalUrl}</td>
                                <td className="py-2"><Link className="text-indigo-600" href={`/s/${r.slug}`}>{r.slug}</Link></td>
                                <td className="py-2">{r.clickCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
