import { isAuthenticated } from "@/lib/auth/guards";
import { getShortUrlByIdWithAnalytics, deleteShortUrl, updateShortUrl } from "@/app/actions/short-urls";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { TrafficChart } from "@/components/dashboard/TrafficChart";
import { BrowserTypeChart } from "@/components/dashboard/BrowserTypeChart";
import { OSTypeChart } from "@/components/dashboard/OSTypeChart";
import { TrafficQualityChart } from "@/components/dashboard/TrafficQualityChart";
import { TrafficTypeChart } from "@/components/dashboard/TrafficTypeChart";
import CopyButton from "@/components/ui/CopyButton";

import {
    ArrowLeftIcon,
    LinkIcon,
    ExternalLink,
    MousePointerClick,
    Users,
    Clock,
    CalendarDays,
    QrCode,
    Pencil,
    Trash2,
    Copy,
    Share2,
    MoreHorizontal,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { UrlDetailsClient } from "./UrlDetailsClient";


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
                <div className="bg-card rounded-xl p-8 flex flex-col items-center justify-center gap-3">
                    <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center">
                        <LinkIcon className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <h1 className="text-xl font-semibold">Invalid URL</h1>
                    <p className="text-muted-foreground text-center">
                        The provided URL ID is invalid.
                    </p>
                    <Button asChild className="mt-2">
                        <Link href="/dashboard/urls">
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to URLs
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    try {
        var advancedData = await getShortUrlByIdWithAnalytics(urlId);
        if (!advancedData) redirect("/dashboard/urls");
    } catch (error) {
        redirect("/dashboard/urls");
    }

    const shortUrl = `url.dev/s/${advancedData.slug}`;

    return (
        <div className="container mx-auto flex flex-col gap-6 py-4">
            {/* Back button */}
            <div>
                <Button variant="ghost" size="sm" asChild className="-ml-2">
                    <Link href="/dashboard/urls">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to URLs
                    </Link>
                </Button>
            </div>

            {/* Header Section */}
            <div className="bg-card rounded-xl p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <LinkIcon className="h-7 w-7 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {advancedData.slug}
                                </h1>
                                {advancedData.isActive && (
                                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
                                        Active
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <code className="text-sm bg-muted px-2 py-1 rounded">
                                    {shortUrl}
                                </code>
                                <CopyButton value={`https://${shortUrl}`} />
                                <a
                                    href={`https://${shortUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted transition-colors"
                                >
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </a>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 truncate max-w-md">
                                → {advancedData.originalUrl}
                            </p>
                        </div>
                    </div>

                    {/* Client-side actions component */}
                    <UrlDetailsClient
                        urlId={urlId}
                        slug={advancedData.slug}
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <MousePointerClick className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{advancedData.clickCount}</p>
                            <p className="text-sm text-muted-foreground">Total Clicks</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{advancedData.analytics.uniqueClicks}</p>
                            <p className="text-sm text-muted-foreground">Unique Visitors</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {advancedData.lastClickedAt
                                    ? new Date(advancedData.lastClickedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                    : "N/A"}
                            </p>
                            <p className="text-sm text-muted-foreground">Last Click</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <CalendarDays className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {advancedData.createdAt
                                    ? new Date(advancedData.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                    : "N/A"}
                            </p>
                            <p className="text-sm text-muted-foreground">Created</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Traffic Chart */}
            <TrafficChart data={advancedData.analytics.clicksByDateByDevice} />

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BrowserTypeChart data={advancedData.analytics.browserType} />
                <OSTypeChart data={advancedData.analytics.operatingSystem} />
                <TrafficQualityChart data={advancedData.analytics.botTraffic} />
                <TrafficTypeChart data={advancedData.analytics.trafficType} />
            </div>

            {/* Link Info */}
            <div className="bg-card rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">Link Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Destination URL</p>
                        <p className="text-sm font-medium truncate">{advancedData.originalUrl}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Short URL</p>
                        <p className="text-sm font-medium">https://{shortUrl}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-sm font-medium">
                            {advancedData.createdAt
                                ? new Date(advancedData.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })
                                : "Unknown"}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Last Updated</p>
                        <p className="text-sm font-medium">
                            {advancedData.updatedAt
                                ? new Date(advancedData.updatedAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })
                                : "Never"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
