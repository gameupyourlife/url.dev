import { Card } from "@/components/ui/card";
import { UrlCreationCard } from "@/components/url-creation-card";
import { isAuthenticated } from "@/lib/auth/guards";
import OverviewCards from "@/components/dashboard/OverviewCards";
import TopUrlsTable from "@/components/dashboard/TopUrlsTable";
import { getDailyClicks, getOverviewMetrics } from "@/app/actions/analytics";
import { TrafficChart } from "@/components/dashboard/TrafficChart";
import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";
import { UserNav } from "@/components/dashboard/UserNav";

export default async function DashboardPage() {
    const session = await isAuthenticated({ behavior: "redirect" });
    const metrics = await getOverviewMetrics();
    const data = await getDailyClicks({ days: 90 });

    return (
        <div className="container mx-auto flex flex-col">
            {/* <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">
                        Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}!
                    </h1>
                    <p className="text-muted-foreground text-base">Your URL analytics dashboard</p>
                </div>
                <UserNav user={{
                    name: session?.user?.name,
                    email: session?.user?.email,
                    image: session?.user?.image ?? undefined,
                }} />
            </header> */}

            <OverviewCards metrics={metrics} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                <div className="col-span-3 flex flex-col gap-6">
                    <Card className="p-0">
                        <TrafficChart data={data} />
                    </Card>
                    <Card className="p-0">
                        <TopUrlsTable />
                    </Card>
                </div>
            </div>
        </div>
    );
}
