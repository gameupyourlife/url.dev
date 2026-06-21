import { DashboardTabsClient } from "@/components/dashboard/DashboardTabsClient";
import { Tabs } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { isAuthenticated } from "@/lib/auth/guards";
import { LinkIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await isAuthenticated({ behavior: "redirect" });

    const hdrs = await headers();
    const activeOrganization = session.session.activeOrganizationId
        ? await auth.api.getFullOrganization({
              headers: hdrs,
              query: {
                  organizationId: session.session.activeOrganizationId,
              },
          })
        : null;

    const usersOrganizations = await auth.api.listOrganizations({
        query: {
            userId: session.user.id
        },
        // This endpoint requires session cookies.
        headers: await headers(),
    });

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between flex-row ">
                        {/* Logo */}
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 shrink-0"
                        >
                            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                                <LinkIcon className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold tracking-tight hidden sm:block">
                                URL.DEV
                            </span>
                        </Link>

                        {/* Navigation */}
                        <Tabs
                            orientation="horizontal"
                            className=""
                        >
                            <DashboardTabsClient
                                session={session}
                                organizations={usersOrganizations}
                            />
                        </Tabs>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">{children}</main>
        </div>
    );
}
