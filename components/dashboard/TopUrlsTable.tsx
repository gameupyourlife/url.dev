import { getTopUrls } from "@/app/actions/analytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";

export default async function TopUrlsTable() {
    const rows = await getTopUrls({ limit: 10 });

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Top URLs</h2>
                <Button asChild size="sm" variant="ghost">
                    <Link href="/dashboard/urls">View All</Link>
                </Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="py-2 font-medium text-muted-foreground">URL</th>
                            <th className="py-2 font-medium text-muted-foreground">Slug</th>
                            <th className="py-2 font-medium text-muted-foreground">Clicks</th>
                            <th className="py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                                <td className="py-2 max-w-[200px] truncate">
                                    <span className="font-medium">{r.title || r.originalUrl}</span>
                                </td>
                                <td className="py-2">
                                    <Badge variant="outline">{r.slug}</Badge>
                                </td>
                                <td className="py-2 font-semibold">{r.clickCount}</td>
                                <td className="py-2">
                                    <Button asChild size="icon-xs" variant="ghost">
                                        <Link href={`/s/${r.slug}`} target="_blank" title="Open short URL">
                                            <ExternalLinkIcon className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
