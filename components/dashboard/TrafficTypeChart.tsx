"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { Analytics } from "@/lib/db/types"

const chartConfig = {
    visitors: {
        label: "Clicks",
        color: "red",
    },
    direct: {
        label: "Direct",
        color: "var(--chart-1)",
    },
    social: {
        label: "Social",
        color: "var(--chart-2)",
    },
    search: {
        label: "Search",
        color: "var(--chart-3)",
    },
    website: {
        label: "Website",
        color: "var(--chart-4)",
    },
} satisfies ChartConfig

export function TrafficTypeChart({ data }: { data: Analytics["trafficType"] }) {
    const chartData: { trafficType: string; visitors: number; fill: string }[] = Object.entries(data)
        .map(([trafficType, visitors]) => ({
            trafficType: trafficType.toLowerCase(),
            visitors,
            fill: chartConfig[trafficType.toLowerCase() as keyof typeof chartConfig]?.color ?? "var(--muted-foreground)",
        }))
        .filter((entry) => entry.visitors > 0)

    const hasData = chartData.length > 0

    return (
        <Card>
            <CardHeader>
                <CardTitle>Traffic Type</CardTitle>
                <CardDescription>Total clicks per traffic type</CardDescription>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <ChartContainer config={chartConfig}>
                        <BarChart
                            accessibilityLayer
                            data={chartData}
                            layout="vertical"
                            margin={{
                                left: 5,
                            }}
                        >
                            <YAxis
                                dataKey="trafficType"
                                type="category"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) =>
                                    chartConfig[value as keyof typeof chartConfig]?.label
                                }
                            />
                            <XAxis dataKey="visitors" type="number" hide />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar dataKey="visitors" layout="vertical" radius={5} />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="flex h-65 items-center justify-center rounded-lg border border-border/60 bg-muted/20 px-4 text-center text-sm text-muted-foreground">
                        No traffic source data yet.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
