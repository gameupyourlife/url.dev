"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

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

export const description = "A donut chart with text"

const chartConfig = {
    visitors: {
        label: "Clicks",
    },
    bots: {
        label: "Bot",
        color: "var(--chart-2)",
    },
    nonbots: {
        label: "Non-Bots",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export function TrafficQualityChart({ data }: { data: { bots: number; nonBots: number } }) {
    const qualityScore = data.bots + data.nonBots === 0 ? 0 : (data.nonBots / (data.bots + data.nonBots)) * 100;
    const chartData = [
        { name: "bots", visitors: data.bots, fill: chartConfig.bots.color },
        { name: "nonbots", visitors: data.nonBots, fill: chartConfig.nonbots.color },
    ];
    const totalVisitors = data.bots + data.nonBots;
    const hasData = totalVisitors > 0;

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Traffic Quality</CardTitle>
                <CardDescription>Bot vs Non-Bot Traffic</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                {hasData ? (
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-75"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={chartData}
                                dataKey="visitors"
                                nameKey="name"
                                innerRadius={60}
                                strokeWidth={5}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-bold"
                                                    >
                                                        {qualityScore.toFixed(0)}%
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground"
                                                    >
                                                        Quality Score
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                ) : (
                    <div className="flex h-65 items-center justify-center rounded-lg border border-border/60 bg-muted/20 px-4 text-center text-sm text-muted-foreground">
                        No traffic quality data yet.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
