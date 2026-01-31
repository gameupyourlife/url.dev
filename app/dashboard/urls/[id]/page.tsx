import { isAuthenticated } from "@/lib/auth/guards";
import UrlHeader from "@/components/dashboard/url/UrlHeader";
import UrlTraffic from "@/components/dashboard/url/UrlTraffic";
import TopCountries from "@/components/dashboard/url/TopCountries";
import Referrers from "@/components/dashboard/url/Referrers";
import Devices from "@/components/dashboard/url/Devices";
import Browsers from "@/components/dashboard/url/Browsers";
import ClicksTable from "@/components/dashboard/url/ClicksTable";
import MapCountryHeatmap from "@/components/ui/MapCountryHeatmap";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3Icon, ArrowLeftIcon } from "lucide-react";

export default async function UrlDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await isAuthenticated({ behavior: "redirect" });
    const urlId = (await params).id;

    if (!urlId || Array.isArray(urlId)) {
        return (
            <div className="container mx-auto p-4">
                <Card className="p-6 flex flex-col items-center justify-center gap-2">
                    <h1 className="text-2xl font-bold mb-2">Invalid URL</h1>
                    <p className="text-muted-foreground">The provided URL ID is invalid.</p>
                    <Button asChild variant="outline" className="mt-2"><a href="/dashboard/urls"><ArrowLeftIcon className="mr-2" />Back to URLs</a></Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 flex flex-col gap-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                    <BarChart3Icon className="w-7 h-7 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight mb-1">URL Analytics</h1>
                </div>
                <Button asChild size="lg" variant="default" className="mt-2 md:mt-0">
                    <a href="/dashboard/urls"><ArrowLeftIcon className="mr-2" />Back to URLs</a>
                </Button>
            </header>

            <Card className="p-0 mb-2">
                {/* Header */}
                <UrlHeader urlId={urlId} />
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card className="p-0">
                        {/* Traffic */}
                        <UrlTraffic urlId={urlId} days={90} />
                    </Card>
                    <Card className="p-0">
                        {/* Recent clicks (client) */}
                        <ClicksTable urlId={urlId} />
                    </Card>
                </div>
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <Card className="p-0">
                        {/* Top countries */}
                        <TopCountries urlId={urlId} />
                    </Card>
                    <Card className="p-0">
                        {/* Referrers */}
                        <Referrers urlId={urlId} />
                    </Card>
                    <Card className="p-0">
                        {/* Devices */}
                        <Devices urlId={urlId} />
                    </Card>
                    <Card className="p-0">
                        {/* Browsers */}
                        <Browsers urlId={urlId} />
                    </Card>
                </div>
            </div>
        </div>
    );
}