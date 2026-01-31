import { DashboardTabsClient } from "@/components/dashboard/DashboardTabsClient";
import { UserNav } from "@/components/dashboard/UserNav";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { isAuthenticated } from "@/lib/auth/guards";
import { cn } from "@/lib/utils";
import { LinkIcon } from "lucide-react";
import Link from "next/link";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await isAuthenticated({ behavior: "redirect" });

    return (
        <div className="container mx-auto p-4 flex flex-col gap-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                <div className="flex gap-2">
                    {/* <h1 className="text-3xl font-bold tracking-tight mb-1">
                        Welcome back
                        {session?.user?.name ? `, ${session.user.name}` : ""}!
                    </h1>
                    <p className="text-muted-foreground text-base">
                        Your URL analytics dashboard
                    </p> */}
                    <LinkIcon className="w-10 h-10 text-primary" />
                    <p className="text-3xl font-bold tracking-tight">
                        URL.DEV
                    </p>
                </div>

                <Tabs orientation="horizontal">
                    <DashboardTabsClient />
                </Tabs>
            </header>
            {children}
        </div>
    );
}
