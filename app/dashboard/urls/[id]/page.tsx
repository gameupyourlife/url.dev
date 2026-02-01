import { isAuthenticated } from "@/lib/auth/guards";
import {
    getTotalClicks,
    getUniqueVisitors,
    getTopCountry,
    getDeviceDiversity,
} from "@/app/actions/analytics";
import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3Icon, ArrowLeftIcon, LinkIcon, ListIcon } from "lucide-react";
import { Map } from "@/components/ui/map";
import { getShortUrlByIdWithAnalytics } from "@/app/actions/short-urls";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TrafficChart } from "@/components/dashboard/TrafficChart";
import { BrowserTypeChart } from "@/components/dashboard/BrowserTypeChart";
import { OSTypeChart } from "@/components/dashboard/OSTypeChart";
import { TrafficQualityChart } from "@/components/dashboard/TrafficQualityChart";
import { TrafficTypeChart } from "@/components/dashboard/TrafficTypeChart";


export default async function UrlAnalyticsPage({
    params,
}: {
    params: Promise<{ id: string | string[] }>;
}) {
    const session = await isAuthenticated({ behavior: "redirect" });
    const urlId = (await params).id;

    if (!urlId || Array.isArray(urlId)) {
        return (
            <div className="container mx-auto p-4">
                <Card className="p-6 flex flex-col items-center justify-center gap-2">
                    <h1 className="text-2xl font-bold mb-2">Invalid URL</h1>
                    <p className="text-muted-foreground">
                        The provided URL ID is invalid.
                    </p>
                    <Button
                        asChild
                        variant="outline"
                        className="mt-2"
                    >
                        <a href="/dashboard/urls">
                            <ArrowLeftIcon className="mr-2" />
                            Back to URLs
                        </a>
                    </Button>
                </Card>
            </div>
        );
    }

    try {
        var advancedData = await getShortUrlByIdWithAnalytics(urlId);
        if (!advancedData) redirect("/dashboard/urls");
    } catch (error) {
        redirect("/dashboard/urls");
    }

    return (
        <div className="container mx-auto flex flex-col gap-8 mt-4">

            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
                        <LinkIcon className="w-7 h-7 text-primary" /> {advancedData.slug} Analytics
                    </h1>
                    <p className="text-muted-foreground text-base">
                        Detailed analytics for your short URL
                    </p>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Action</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Billing</DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Team</DropdownMenuItem>
                            <DropdownMenuItem>Subscription</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="flex flex-col items-center gap-2 py-6">
                    <div className="text-2xl font-bold">{advancedData.clickCount}</div>
                    <div className="text-sm text-muted-foreground">Total Clicks</div>
                </Card>
                <Card className="flex flex-col items-center gap-2 py-6">
                    <div className="text-2xl font-bold">{advancedData.lastClickedAt?.toLocaleDateString("de-DE") ?? "N/A"}</div>
                    <div className="text-sm text-muted-foreground">Last Clicked At</div>
                </Card>
                <Card className="flex flex-col items-center gap-2 py-6">
                    <div className="text-2xl font-bold">{advancedData.analytics.uniqueClicks}</div>
                    <div className="text-sm text-muted-foreground">Unique Clicks</div>
                </Card>
            </div>

            <TrafficChart data={advancedData.analytics.clicksByDateByDevice} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BrowserTypeChart data={advancedData.analytics.browserType} />
                <OSTypeChart data={advancedData.analytics.operatingSystem} />
                <TrafficQualityChart data={advancedData.analytics.botTraffic} />
                <TrafficTypeChart data={advancedData.analytics.trafficType} />
            </div>

            {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="flex flex-col items-center gap-2 py-6">
                    <div className="text-2xl font-bold">{advancedData.analytics.botTraffic.bots}</div>
                    <div className="text-sm text-muted-foreground">Total Clicks</div>
                </Card>
                <Card className="flex flex-col items-center gap-2 py-6">
                    <div className="text-2xl font-bold">{advancedData.analytics.botTraffic.nonBots}</div>
                    <div className="text-sm text-muted-foreground">Last Clicked At</div>
                </Card>
                <Card className="flex flex-col items-center gap-2 py-6">
                    <div className="text-2xl font-bold">{advancedData.analytics.uniqueClicks}</div>
                    <div className="text-sm text-muted-foreground">Unique Clicks</div>
                </Card>
            </div> */}

            <Card className="h-[600px] w-full p-0" />

        </div>

    )



}
