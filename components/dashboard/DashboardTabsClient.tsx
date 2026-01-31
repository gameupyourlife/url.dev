"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { LinkIcon, PlusIcon } from "lucide-react";
import { UserNav } from "./UserNav";
import { getSession } from "better-auth/api";
import { authClient } from "@/lib/auth/auth-client";

export function DashboardTabsClient() {
    const pathname = usePathname();
    const session = authClient.useSession();
    return (
        <TabsList className="gap-2">
            <Button
                size="lg"
                className={
                    pathname === "/dashboard"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                }
                asChild
            >
                <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button
                size="lg"
                className={
                    pathname === "/dashboard/urls"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                }
                asChild
            >
                <Link href="/dashboard/urls">URLs</Link>
            </Button>
            <Button
                size="lg"
                variant="secondary"
                className={
                    pathname === "/dashboard/create"
                        ? "bg-primary text-primary-foreground"
                        : ""
                }
                asChild
            >
                <Link href="/dashboard/create">
                    <LinkIcon />
                    Create Short URL
                </Link>
            </Button>
            <UserNav
                user={{
                    name: session?.data?.user?.name,
                    email: session?.data?.user?.email,
                    image: session?.data?.user?.image ?? undefined,
                }}
                isNavigatedTo={pathname.startsWith("/dashboard/settings")}
            />
        </TabsList>
    );
}
