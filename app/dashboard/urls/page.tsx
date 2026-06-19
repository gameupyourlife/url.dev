import { getShortUrls } from "@/app/actions/short-urls";
import { isAuthenticated } from "@/lib/auth/guards";
import UrlsTable from "@/components/dashboard/UrlsTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { LinkIcon, Plus, Search } from "lucide-react";
import Link from "next/link";

export default async function DashboardUrlsPage() {
    const session = await isAuthenticated({ behavior: "redirect" });
    const urls = await getShortUrls();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <LinkIcon className="h-6 w-6 text-primary" />
                        Your Links
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and track all your short URLs in one place
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        variant="secondary"
                        className="px-3 py-1"
                    >
                        {urls.length} {urls.length === 1 ? "link" : "links"}
                    </Badge>
                    <Button asChild>
                        <Link href="/dashboard/create">
                            <Plus className="h-4 w-4 mr-2" />
                            New Link
                        </Link>
                    </Button>
                </div>
            </div>

            {/* URLs Table Card */}
            <UrlsTable initialUrls={urls} />
        </div>
    );
}
