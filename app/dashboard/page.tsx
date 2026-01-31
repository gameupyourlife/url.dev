import { FormTanstackComplex } from "@/components/test";
import { Card } from "@/components/ui/card";
import { Map } from "@/components/ui/map";
import { UrlCreationCard } from "@/components/url-creation-card";
import { isAuthenticated } from "@/lib/auth/guards";

import OverviewCards from "@/components/dashboard/OverviewCards";
import TopUrlsTable from "@/components/dashboard/TopUrlsTable";
import { getDailyClicks, getOverviewMetrics } from "@/app/actions/analytics";
import { TrafficChart } from "@/components/dashboard/TrafficChart";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserIcon, LinkIcon, BarChart3Icon } from "lucide-react";

export default async function DashboardPage() {
    const session = await isAuthenticated({ behavior: "redirect" });
    const metrics = await getOverviewMetrics();
    const data = await getDailyClicks({ days: 90 });

    return (
        <div className="container mx-auto p-4 flex flex-col gap-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}!</h1>
                    <p className="text-muted-foreground text-base">Your URL analytics dashboard</p>
                </div>
                <Button asChild size="lg" variant="default" className="mt-2 md:mt-0">
                    <a href="#create-url"><LinkIcon className="mr-2" />Create Short URL</a>
                </Button>
            </header>

            <OverviewCards metrics={metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-2 flex flex-col gap-6">
                    <Card className="p-0">
                        <TrafficChart data={data} />
                    </Card>
                    <Card className="p-0">
                        <TopUrlsTable />
                    </Card>
                </div>
                <div className="flex flex-col gap-6">
                    <Card id="create-url" className="flex flex-col items-center justify-center gap-4 p-6 text-center">
                        <LinkIcon className="w-8 h-8 text-primary" />
                        <h2 className="text-xl font-semibold">Create a new short URL</h2>
                        <p className="text-muted-foreground">Easily shorten and manage your links.</p>
                        <UrlCreationCard />
                    </Card>
                </div>
            </div>
        </div>
    );
}