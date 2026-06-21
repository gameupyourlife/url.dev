"use client";

import { useFeatureAccess } from "@/lib/auth/use-feature-access";
import { Skeleton } from "../../ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { RegionId, WorldMap } from "@/components/shadcnmaps/maps/world";
import { worldMapData } from "@/components/shadcnmaps/map-data/world";
import UpgradePrompt from "../UpgradePrompt";


export default function CountryChart({ countryData }: { countryData?: { country: RegionId; clicks: number }[] }) {
    const res = useFeatureAccess({ featureFlags: ["country_heatmap"], planAccess: { features: ["countryHeatmap"] } });

    if(res.reason === "feature_flags_disabled") return null;

    // Generate random data for each region of world map
    const data = (res.allowed ? countryData : worldMapData.regions.map(r => ({
        country: r.id,
        clicks: Math.floor(Math.random() * 10000),
    }))) ?? [];

    const MAX_DATA = Math.max(...data.map(d => d.clicks));

    const BUCKETS = [
        {
            min: 0.6,
            label: "> " + Math.floor(0.6 * MAX_DATA),
            className: 'fill-chart-1 hover:fill-chart-1 stroke-card border-card',
            swatch: 'bg-chart-1',
        },
        {
            min: 0.3,
            label: Math.floor(0.3 * MAX_DATA) + " – " + Math.floor(0.6 * MAX_DATA),
            className: 'fill-chart-2 hover:fill-chart-2 stroke-card border-card',
            swatch: 'bg-chart-2',
        },
        {
            min: 0.15,
            label: Math.floor(0.15 * MAX_DATA) + " – " + Math.floor(0.3 * MAX_DATA),
            className: 'fill-chart-3 hover:fill-chart-3 stroke-card border-card',
            swatch: 'bg-chart-3',
        },
        {
            min: 0.05,
            label: Math.floor(0.05 * MAX_DATA) + " – " + Math.floor(0.15 * MAX_DATA),
            className: 'fill-chart-4 hover:fill-chart-4 stroke-card border-card',
            swatch: 'bg-chart-4',
        },
        {
            min: 0,
            label: '< ' + Math.floor(0.05 * MAX_DATA),
            className: 'fill-chart-5 hover:fill-chart-5 stroke-card border-card',
            swatch: 'bg-chart-5',
        },
        {
            min: -1,
            label: 'No data',
            className: 'fill-muted hover:fill-muted stroke-card border-card',
            swatch: 'bg-muted',
        }
    ]

    const regions = data.map((data) => ({
        id: data.country as RegionId,
        // Get color classes based on count
        className: (() => {
            const r = data.clicks / MAX_DATA;
            const bucket = BUCKETS.find((b) => r > b.min) ?? BUCKETS[BUCKETS.length - 1];
            return bucket.className;
        })(),
        tooltipContent: (
            <div>
                <p className='font-medium'>{data.country}</p>
                <p className='text-muted-foreground'>
                    Clicks: {data.clicks.toLocaleString()}
                </p>
            </div>
        ),
    }))

    if (!res.isLoading && !res.allowed) {
        return (
            <Card className="h-200 ">
                <CardHeader>
                    <CardTitle>Country</CardTitle>
                    <CardDescription>Total clicks per country</CardDescription>
                </CardHeader>
                <CardContent className="relative">

                    <div className="absolute text-center w-full h-full z-20 flex items-center justify-center">
                        <div className="w-full max-w-lg">
                            <UpgradePrompt />
                        </div>
                    </div>

                    <div className="flex items-center justify-center h-full blur-xl interact-none">
                        <WorldMap className="h-160 w-full blur-xl" regions={regions} />
                        <div>
                            <p className='mb-1.5 font-medium'>Clicks</p>
                            <div className='flex flex-col gap-1 text-xs'>
                                {BUCKETS.map((b) => (
                                    <div key={b.label} className='flex items-center gap-1.5'>
                                        <span
                                            className={`inline-block h-3 w-3 rounded-xs ${b.swatch}`}
                                        />
                                        <span className='text-muted-foreground'>{b.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (res.isLoading) {
        return (
            <Skeleton className="h-64 w-full rounded-xl" />
        );
    }

    return (
        <Card className="h-200 ">
            <CardHeader>
                <CardTitle>Country</CardTitle>
                <CardDescription>Total clicks per country</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-full">

                <WorldMap className="h-160 w-full" regions={regions} />

                <div>
                    <p className='mb-1.5 font-medium'>Clicks</p>
                    <div className='flex flex-col gap-1 text-xs'>
                        {BUCKETS.map((b) => (
                            <div key={b.label} className='flex items-center gap-1.5'>
                                <span
                                    className={`inline-block h-3 w-3 rounded-xs ${b.swatch}`}
                                />
                                <span className='text-muted-foreground'>{b.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}