"use client";

import { Map } from "@/components/ui/map";
import MapCountryHeatmap, { type CountryCount } from "@/components/ui/MapCountryHeatmap";

export default function CountryHeatmap({ rows }: { rows: { country: string; clicks: number }[] }) {
    const data: CountryCount[] = rows.map(r => ({ country: r.country, count: r.clicks }));

    return (
        <div className="h-64 rounded overflow-hidden border">
            <Map center={[0, 20]} zoom={1.4}>
                <MapCountryHeatmap data={data} />
            </Map>
        </div>
    );
}
