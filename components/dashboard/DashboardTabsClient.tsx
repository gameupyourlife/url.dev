"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TabsList } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
    BarChart3,
    Building2,
    Check,
    ChevronDown,
    List,
    Plus,
    User,
} from "lucide-react";
import { UserNav } from "./UserNav";
import { authClient } from "@/lib/auth/auth-client";
import {
    listOrganizations,
    setActiveOrganization,
} from "@/app/actions/organizations";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ActiveOrganization, Organization, Session } from "@/lib/auth";

const navItems = [
    {
        href: "/dashboard",
        label: "Overview",
        icon: BarChart3,
        matchExact: true,
    },
    {
        href: "/dashboard/urls",
        label: "URLs",
        icon: List,
        matchExact: false,
    },
    {
        href: "/dashboard/create",
        label: "Create",
        icon: Plus,
        matchExact: false,
    }
];

export function DashboardTabsClient({
    session,
    organizations,
}: {
    session: Session;
    organizations: Organization[];
}) {
    const pathname = usePathname();
    const { data: activeOrg, isPending: isLoadingActiveOrganization, refetch: refetchActiveOrg } = authClient.useActiveOrganization()

    async function handleSwitchOrg(orgId: string | null) {
        try {
            const org = await setActiveOrganization(orgId);
            refetchActiveOrg();

            if (org) {
                toast.success(`Switched to ${org.name}`);
            } else {
                toast.success("Switched to personal account");
            }
        } catch (error: any) {
            toast.error(error?.message || "Failed to switch organization");
        }
    }

    const isActive = (item: (typeof navItems)[0]) => {
        if (item.matchExact) {
            return pathname === item.href;
        }
        return pathname.startsWith(item.href);
    };

    return (
        <TabsList className="gap-1.5 sm:gap-2">
            {/* Organization Switcher */}

            {/* Navigation Items */}
            {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);

                return (
                    <Button
                        key={item.href}
                        size="lg"
                        variant="ghost"
                        className={cn(
                            "gap-1.5 px-2 sm:px-3",
                            active
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                        asChild
                    >
                        <Link href={item.href}>
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                {item.label}
                            </span>
                        </Link>
                    </Button>
                );
            })}
            {organizations.length > 0 && (
                <div className="relative flex items-center bg-card rounded-lg">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="lg"
                                className="gap-1.5 bg-card hover:bg-muted px-2 sm:px-3 pr-12"
                            >
                                <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                                    {activeOrg ? (
                                        <Building2 className="h-3.5 w-3.5 text-primary" />
                                    ) : (
                                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                </div>
                                <span className="hidden sm:inline max-w-30 truncate">
                                    {activeOrg?.name || "Personal"}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="w-50"
                        >
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Switch workspace
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSwitchOrg(null)}>
                                <User className="h-4 w-4 mr-2" />
                                Personal
                                {!activeOrg && (
                                    <Check className="h-4 w-4 ml-auto" />
                                )}
                            </DropdownMenuItem>
                            {organizations.map((org) => (
                                <DropdownMenuItem
                                    key={org.id}
                                    onClick={() => handleSwitchOrg(org.id)}
                                >
                                    <Building2 className="h-4 w-4 mr-2" />
                                    <span className="truncate">{org.name}</span>
                                    {activeOrg?.id === org.id && (
                                        <Check className="h-4 w-4 ml-auto shrink-0" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/settings?tab=organizations">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Organization
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <UserNav
                        user={{
                            name: session?.user?.name,
                            email: session?.user?.email,
                            image: session?.user?.image ?? undefined,
                        }}
                        isNavigatedTo={pathname.startsWith("/dashboard/settings")}
                        className="border border-border/60 bg-background/80 backdrop-blur-sm"
                    />
                    {/* <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10">
                    </div> */}
                </div>
            )}

            {organizations.length === 0 && (
                <UserNav
                    user={{
                        name: session?.user?.name,
                        email: session?.user?.email,
                        image: session?.user?.image ?? undefined,
                    }}
                    isNavigatedTo={pathname.startsWith("/dashboard/settings")}
                />
            )}
        </TabsList>
    );
}
