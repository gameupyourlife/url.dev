import { getShortUrls } from "@/app/actions/short-urls";
import { isAuthenticated } from "@/lib/auth/guards";
import UrlsTable from "@/components/dashboard/UrlsTable";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkIcon, ListIcon } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { UserNav } from "@/components/dashboard/UserNav";

export default async function DashboardUrlsPage() {
    const session = await isAuthenticated({ behavior: "redirect" });
    const urls = await getShortUrls();

    return (
        <div className="container mx-auto p-4 flex flex-col gap-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
                        <ListIcon className="w-7 h-7 text-primary" /> Your Short URLs
                    </h1>
                    <p className="text-muted-foreground text-base">Search, sort, filter, and manage your links</p>
                </div>
                <UserNav user={{
                    name: session?.user?.name,
                    email: session?.user?.email,
                    image: session?.user?.image ?? undefined,
                }} />
            </header>


            <div className="grid grid-cols-1 gap-6">
                <Card className="p-0">
                    <UrlsTable initialUrls={urls} />
                </Card>
            </div>
        </div>
    );
}
