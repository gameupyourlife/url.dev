"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Traffic Quality</CardTitle>
                <CardDescription>Bot vs Non-Bot Traffic</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
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
                                                    {qualityScore.toLocaleString()}
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
            </CardContent>
            {/* <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    Showing total visitors for the last 6 months
                </div>
            </CardFooter> */}
        </Card>
    )
}
