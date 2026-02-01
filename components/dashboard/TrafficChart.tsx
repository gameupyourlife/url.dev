"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getDailyClicks } from "@/app/actions/analytics";
import { Analytics } from "@/lib/db/types";
import { unknown } from "zod";

export const description = "An interactive area chart";

const chartConfig = {
    visitors: {
        label: "Visitors",
    },
    clicks: {
        label: "Clicks",
        color: "var(--chart-1)",
    },
    unknown: {
        label: "Unknown",
        color: "var(--chart-1)",
    },
    desktop: {
        label: "Desktop",
        color: "var(--chart-2)",
    },
    mobile: {
        label: "Mobile",
        color: "var(--chart-3)",
    },
    tablet: {
        label: "Tablet",
        color: "var(--chart-4)",
    },
} satisfies ChartConfig;

export function TrafficChart({
    data,
}: {
    data: {
        date: string;
        clicks: number;
    }[] | Analytics["clicksByDateByDevice"];
}) {
    const [timeRange, setTimeRange] = React.useState("90d");

    const filteredData = data.filter((item) => {
        const date = new Date(item.date);
        let daysToSubtract = 90;
        if (timeRange === "30d") {
            daysToSubtract = 30;
        } else if (timeRange === "7d") {
            daysToSubtract = 7;
        }
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysToSubtract);
        return date >= startDate;
    });

    return (
        <Card className="pt-0">
            <CardHeader className="flex items-center gap-2 space-y-0 py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>Traffic chart</CardTitle>
                    <CardDescription>
                        Showing total traffic for the last {timeRange === "90d"
                            ? "3 months"
                            : timeRange === "30d"
                                ? "30 days"
                                : "7 days"}
                    </CardDescription>
                </div>
                <Select
                    value={timeRange}
                    onValueChange={setTimeRange}
                >
                    <SelectTrigger
                        className="hidden w-[160px]  sm:ml-auto sm:flex"
                        aria-label="Select a value"
                    >
                        <SelectValue placeholder="Last 3 months" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            value="90d"
                        >
                            Last 3 months
                        </SelectItem>
                        <SelectItem
                            value="30d"
                        >
                            Last 30 days
                        </SelectItem>
                        <SelectItem
                            value="7d"
                        >
                            Last 7 days
                        </SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient
                                id="fillClicks"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-clicks)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-clicks)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>

                            <linearGradient
                                id="fillDesktop"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-desktop)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-desktop)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient
                                id="fillMobile"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-mobile)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-mobile)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient
                                id="fillTablet"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-tablet)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-tablet)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                });
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(
                                            value,
                                        ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        });
                                    }}
                                    indicator="dot"
                                />
                            }
                        />

                        <Area
                            dataKey={data[0].hasOwnProperty("clicks") ? "clicks" : "unknown"}
                            type="natural"
                            fill="url(#fillClicks)"
                            stroke="var(--color-clicks)"
                            stackId="a"
                        />
                        <Area
                            dataKey="desktop"
                            type="natural"
                            fill="url(#fillDesktop)"
                            stroke="var(--color-desktop)"
                            stackId="a"
                        />
                        <Area
                            dataKey="mobile"
                            type="natural"
                            fill="url(#fillMobile)"
                            stroke="var(--color-mobile)"
                            stackId="a"
                        />
                        <Area
                            dataKey="tablet"
                            type="natural"
                            fill="url(#fillTablet)"
                            stroke="var(--color-tablet)"
                            stackId="a"
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
