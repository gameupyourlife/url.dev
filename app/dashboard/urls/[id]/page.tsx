import { isAuthenticated } from "@/lib/auth/guards";
import UrlHeader from "@/components/dashboard/url/UrlHeader";
import UrlTraffic from "@/components/dashboard/url/UrlTraffic";
import TopCountries from "@/components/dashboard/url/TopCountries";
import Referrers from "@/components/dashboard/url/Referrers";
import Devices from "@/components/dashboard/url/Devices";
import Browsers from "@/components/dashboard/url/Browsers";
import ClicksTable from "@/components/dashboard/url/ClicksTable";
import MapCountryHeatmap from "@/components/ui/MapCountryHeatmap";

export default async function UrlDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await isAuthenticated({ behavior: "redirect" });

    const urlId = (await params).id;

    if (!urlId || Array.isArray(urlId)) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Invalid URL</h1>
                <p>The provided URL ID is invalid.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">URL Analytics</h1>
                    <p className="text-sm text-muted-foreground">Detailed analytics for this short URL</p>
                </div>
                <div>
                    <a className="text-sm text-indigo-600" href="/dashboard/urls">Back to URLs</a>
                </div>
            </div>

            {/* Header */}
            <UrlHeader urlId={urlId} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    {/* Traffic */}
                    <UrlTraffic urlId={urlId} days={90} />

                    {/* Recent clicks (client) */}
                    <ClicksTable urlId={urlId} />
                </div>

                <div className="lg:col-span-1 space-y-4">
                    {/* Top countries */}
                    <TopCountries urlId={urlId} />

                    {/* Referrers */}
                    <Referrers urlId={urlId} />

                    {/* Devices */}
                    <Devices urlId={urlId} />

                    {/* Browsers */}
                    <Browsers urlId={urlId} />
                </div>
            </div>
        </div>
    );
}