import { getBrowserBreakdown } from "@/app/actions/analytics";
import { Card } from "@/components/ui/card";

export default async function Browsers({ urlId }: { urlId?: string }) {
    const rows = await getBrowserBreakdown({ urlId, limit: 20 });

    return (
        <Card className="p-4">
            <h3 className="text-lg font-medium mb-2">Browsers</h3>
            <ul>
                {rows.map((r, i) => (
                    <li key={i} className="flex justify-between py-1 border-b"> 
                        <span>{r.browser}</span>
                        <span className="font-semibold">{r.clicks}</span>
                    </li>
                ))}
            </ul>
        </Card>
    );
}
