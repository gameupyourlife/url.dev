import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkIcon, BarChart3Icon, UserIcon } from "lucide-react";

export default function OverviewCards({ metrics }: { metrics: { totalUrls: number; totalClicks: number; totalUsers: number } }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-2">
            <Card className="flex flex-col items-center gap-2 py-6">
                <Badge variant="secondary" className="mb-2 p-2 rounded-full"><LinkIcon className="w-5 h-5 text-primary" /></Badge>
                <div className="text-2xl font-bold">{metrics.totalUrls}</div>
                <div className="text-sm text-muted-foreground">Total URLs</div>
            </Card>
            <Card className="flex flex-col items-center gap-2 py-6">
                <Badge variant="secondary" className="mb-2 p-2 rounded-full"><BarChart3Icon className="w-5 h-5 text-primary" /></Badge>
                <div className="text-2xl font-bold">{metrics.totalClicks}</div>
                <div className="text-sm text-muted-foreground">Total Clicks</div>
            </Card>
            <Card className="flex flex-col items-center gap-2 py-6">
                <Badge variant="secondary" className="mb-2 p-2 rounded-full"><UserIcon className="w-5 h-5 text-primary" /></Badge>
                <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
            </Card>
        </div>
    );
}
