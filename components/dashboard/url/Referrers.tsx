import { getTopReferrers } from "@/app/actions/analytics";
import { Card } from "@/components/ui/card";

export default async function Referrers({ urlId }: { urlId?: string }) {
    const rows = await getTopReferrers({ urlId, limit: 10 });

    return (
        <Card className="p-4">
            <h3 className="text-lg font-medium mb-2">Top Referrers</h3>
            <ul>
                {rows.map((r, i) => (
                    <li key={i} className="flex justify-between py-1 border-b"> 
                        <div>
                            <div className="text-sm">{r.referer}</div>
                            <div className="text-xs text-muted-foreground">{r.type}</div>
                        </div>
                        <div className="font-semibold">{r.clicks}</div>
                    </li>
                ))}
            </ul>
        </Card>
    );
}
