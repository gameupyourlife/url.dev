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
];

export function DashboardTabsClient({
    session,
    activeOrganization,
    organizations,
}: {
    session: Session;
    activeOrganization: ActiveOrganization | null;
    organizations: Organization[];
}) {
    const pathname = usePathname();
    const [activeOrg, setActiveOrg] = useState<ActiveOrganization | null>(
        activeOrganization,
    );

    async function handleSwitchOrg(orgId: string | null) {
        try {
            const org = await setActiveOrganization(orgId);
            setActiveOrg(org);

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
                                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
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

            {/* Create URL Button */}
            <Button
                size="lg"
                className={cn(
                    "gap-1.5 px-2 sm:px-3",
                    pathname === "/dashboard/create"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                    // ? "bg-primary text-primary-foreground"
                    // : "bg-primary/10 text-primary hover:bg-primary/20",
                )}
                asChild
            >
                <Link href="/dashboard/create">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New Link</span>
                </Link>
            </Button>

            {organizations.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center relative">
                            <Button
                                variant="ghost"
                                size="lg"
                                className="gap-1.5 bg-muted/60 hover:bg-muted px-2 sm:px-3 pr-10  relative"
                            >
                                <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                                    {activeOrg ? (
                                        <Building2 className="h-3.5 w-3.5 text-primary" />
                                    ) : (
                                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                </div>
                                <span className="hidden sm:inline max-w-[120px] truncate">
                                    {activeOrg?.name || "Personal"}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 opacity-50 mr-10" />
                            </Button>
                            <div
                                className="absolute right-0 z-10"
                                onMouseEnter={(e) => e.stopPropagation()}
                                onMouseLeave={(e) => e.stopPropagation()}
                            >
                                <UserNav
                                    user={{
                                        name: session?.user?.name,
                                        email: session?.user?.email,
                                        image:
                                            session?.user?.image ?? undefined,
                                    }}
                                    isNavigatedTo={pathname.startsWith(
                                        "/dashboard/settings",
                                    )}
                                />
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="w-[200px]"
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
                                    <Check className="h-4 w-4 ml-auto flex-shrink-0" />
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
            )}
        </TabsList>
    );
}
