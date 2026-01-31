import { getTopCountries } from "@/app/actions/analytics";
import CountryHeatmap from "@/components/dashboard/url/CountryHeatmap";
import { Card } from "@/components/ui/card";

export default async function TopCountries({ urlId }: { urlId?: string }) {
    const rows = await getTopCountries({ urlId, limit: 50 });

    const testData = [
        { country: "US", clicks: 150 },
        { country: "CA", clicks: 80 },
        { country: "GB", clicks: 60 },
        { country: "DE", clicks: 50 },
        { country: "FR", clicks: 40 },
        { country: "AU", clicks: 30 },
        { country: "IN", clicks: 25 },
        { country: "BR", clicks: 20 },
    ];

    return (
        <Card className="p-4">
            <h3 className="text-lg font-medium mb-2">Top Countries</h3>
            <div className="grid grid-cols-1 gap-3">
                <ul>
                    {rows.slice(0, 8).map((r, i) => (
                        <li key={i} className="flex justify-between py-1 border-b">
                            <span>{r.country}</span>
                            <span className="font-semibold">{r.clicks}</span>
                        </li>
                    ))}
                </ul>

                {/* Client map showing heatmap */}
                <CountryHeatmap rows={testData} />
            </div>
        </Card>
    );
}
