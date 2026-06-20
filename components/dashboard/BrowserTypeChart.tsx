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
    chrome: {
        label: "Chrome",
        color: "var(--chart-1)",
    },
    safari: {
        label: "Safari",
        color: "var(--chart-2)",
    },
    firefox: {
        label: "Firefox",
        color: "var(--chart-3)",
    },
    edge: {
        label: "Edge",
        color: "var(--chart-4)",
    },
    other: {
        label: "Other",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig

export function BrowserTypeChart({ data }: { data: Analytics["browserType"] }) {
    const chartData: { browser: string; visitors: number; fill: string }[] = Object.entries(data)
        .map(([browser, visitors]) => ({
            browser: browser.toLowerCase(),
            visitors,
            fill: chartConfig[browser.toLowerCase() as keyof typeof chartConfig]?.color ?? "var(--muted-foreground)",
        }))
        .filter((entry) => entry.visitors > 0)

    const hasData = chartData.length > 0

    return (
        <Card>
            <CardHeader>
                <CardTitle>Browser Type</CardTitle>
                <CardDescription>Total clicks per browser</CardDescription>
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
                                dataKey="browser"
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
                        No browser data yet.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
