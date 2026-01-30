import { getTopCountries } from "@/app/actions/analytics";
import { Card } from "@/components/ui/card";

export default async function TopCountries({ urlId }: { urlId?: string }) {
    const rows = await getTopCountries({ urlId, limit: 10 });

    return (
        <Card className="p-4">
            <h3 className="text-lg font-medium mb-2">Top Countries</h3>
            <ul>
                {rows.map((r, i) => (
                    <li key={i} className="flex justify-between py-1 border-b"> 
                        <span>{r.country}</span>
                        <span className="font-semibold">{r.clicks}</span>
                    </li>
                ))}
            </ul>
        </Card>
    );
}
