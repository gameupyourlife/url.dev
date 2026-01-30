import { FormTanstackComplex } from "@/components/test";
import { Card } from "@/components/ui/card";
import { Map } from "@/components/ui/map";
import { UrlCreationCard } from "@/components/url-creation-card";
import { isAuthenticated } from "@/lib/auth/guards";

import OverviewCards from "@/components/dashboard/OverviewCards";
import TopUrlsTable from "@/components/dashboard/TopUrlsTable";
import { getDailyClicks, getOverviewMetrics } from "@/app/actions/analytics";
import { TrafficChart } from "@/components/dashboard/TrafficChart";

export default async function DashboardPage() {
    const session = await isAuthenticated({ behavior: "redirect" });

    const metrics = await getOverviewMetrics();
    const data = await getDailyClicks({ days: 90 })

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

            <OverviewCards metrics={metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="col-span-2">
                    <TrafficChart data={data} />
                </div>

                <TopUrlsTable />
            </div>

            <UrlCreationCard />
        </div>
    );
}