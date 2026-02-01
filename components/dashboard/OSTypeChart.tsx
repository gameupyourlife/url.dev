"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

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
import { Analytics } from "@/lib/db/types"


const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
]


const chartConfig = {
    visitors: {
        label: "Clicks",
        color: "red",
    },
    windows: {
        label: "Windows",
        color: "var(--chart-1)",
    },
    macos: {
        label: "macOS",
        color: "var(--chart-2)",
    },
    linux: {
        label: "Linux",
        color: "var(--chart-3)",
    },
    android: {
        label: "Android",
        color: "var(--chart-4)",
    },
    ios: {
        label: "iOS",
        color: "var(--chart-5)",
    },
    other: {
        label: "Other",
        color: "var(--chart-6)",
    },
} satisfies ChartConfig

export function OSTypeChart({ data }: { data: Analytics["operatingSystem"] }) {
    const chartData: { os: string; visitors: number, fill: string }[] = Object.entries(data).map(([os, visitors]) => ({ os: os.toLowerCase(), visitors, fill: chartConfig[os.toLowerCase() as keyof typeof chartConfig]?.color ?? "red" }));

    console.log("OSTypeChart data:", data, chartData);
    return (
        <Card>
            <CardHeader>
                <CardTitle>Operating System</CardTitle>
                <CardDescription>Total clicks per operating system</CardDescription>
            </CardHeader>
            <CardContent>
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
                            dataKey="os"
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
            </CardContent>
            {/* <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    Showing total visitors for the last 6 months
                </div>
            </CardFooter> */}
        </Card>
    )
}
