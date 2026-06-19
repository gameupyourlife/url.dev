import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAuthenticated } from "@/lib/auth/guards";
import OverviewCards from "@/components/dashboard/OverviewCards";
import TopUrlsTable from "@/components/dashboard/TopUrlsTable";
import { getDailyClicks, getOverviewMetrics } from "@/app/actions/analytics";
import { TrafficChart } from "@/components/dashboard/TrafficChart";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
    const session = await isAuthenticated({ behavior: "redirect" });
    const metrics = await getOverviewMetrics();
    const data = await getDailyClicks({ days: 90 });

    const hasUrls = metrics.totalUrls > 0;
    const firstName = session?.user?.name?.split(" ")[0] || "there";

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Welcome back, {firstName}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {hasUrls
                            ? "Here's what's happening with your links"
                            : "Let's get started with your first short link"}
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Link
                    </Link>
                </Button>
            </div>

            {/* Metrics Overview */}
            <OverviewCards metrics={metrics} />

            {hasUrls ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Traffic Chart - Takes 2 columns on xl */}
                    <Card className="xl:col-span-2 overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                        Click Analytics
                                    </CardTitle>
                                    <CardDescription>
                                        Traffic overview for the last 90 days
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <TrafficChart data={data} />
                        </CardContent>
                    </Card>

                    {/* Quick Stats Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Zap className="h-4 w-4 text-primary" />
                                Quick Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <span className="text-sm text-muted-foreground">
                                        Average clicks/URL
                                    </span>
                                    <span className="font-semibold">
                                        {metrics.totalUrls > 0
                                            ? Math.round(metrics.totalClicks / metrics.totalUrls)
                                            : 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <span className="text-sm text-muted-foreground">
                                        Active links
                                    </span>
                                    <span className="font-semibold">{metrics.totalUrls}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <span className="text-sm text-muted-foreground">
                                        Clicks this month
                                    </span>
                                    <span className="font-semibold">{metrics.monthlyClicks}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <span className="text-sm text-muted-foreground">
                                        Clicks today
                                    </span>
                                    <span className="font-semibold">{metrics.todayClicks}</span>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="w-full" asChild>
                                <Link href="/dashboard/urls">
                                    View All URLs
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Top URLs Table - Full width */}
                    <Card className="xl:col-span-3">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold">
                                        Top Performing Links
                                    </CardTitle>
                                    <CardDescription>
                                        Your most clicked short URLs
                                    </CardDescription>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/dashboard/urls">
                                        View All
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <TopUrlsTable />
                        </CardContent>
                    </Card>
                </div>
            ) : (
                /* Empty State */
                <Card className="p-12">
                    <div className="text-center max-w-md mx-auto">
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Plus className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Create your first link</h2>
                        <p className="text-muted-foreground mb-6">
                            Start shortening URLs and track their performance with detailed
                            analytics. It only takes a few seconds.
                        </p>
                        <Button size="lg" asChild>
                            <Link href="/dashboard/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Short URL
                            </Link>
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
