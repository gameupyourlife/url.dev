import { getDeviceBreakdown } from "@/app/actions/analytics";
import { Card } from "@/components/ui/card";

export default async function Devices({ urlId }: { urlId?: string }) {
    const rows = await getDeviceBreakdown({ urlId, limit: 20 });

    return (
        <Card className="p-4">
            <h3 className="text-lg font-medium mb-2">Device Types</h3>
            <ul>
                {rows.map((r, i) => (
                    <li key={i} className="flex justify-between py-1 border-b"> 
                        <span>{r.device}</span>
                        <span className="font-semibold">{r.clicks}</span>
                    </li>
                ))}
            </ul>
        </Card>
    );
}
