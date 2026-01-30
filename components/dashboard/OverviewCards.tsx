import { Card } from "@/components/ui/card";

export default function OverviewCards({ metrics }: { metrics: { totalUrls: number; totalClicks: number; totalUsers: number } }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
                <div className="text-sm text-muted-foreground">Total URLs</div>
                <div className="text-2xl font-bold">{metrics.totalUrls}</div>
            </Card>
            <Card className="p-4">
                <div className="text-sm text-muted-foreground">Total Clicks</div>
                <div className="text-2xl font-bold">{metrics.totalClicks}</div>
            </Card>
            <Card className="p-4">
                <div className="text-sm text-muted-foreground">Active Users</div>
                <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            </Card>
        </div>
    );
}
