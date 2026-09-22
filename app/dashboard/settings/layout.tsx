"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building2, Key, Shield, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";


export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const activeTab = pathname.endsWith("/organizations")
        ? "organizations"
        : pathname.endsWith("/api-keys")
            ? "api-keys"
            : pathname.endsWith("/security")
                ? "security"
                : "profile";

    return (
        <div className="space-y-6">
            {/* Settings Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Settings className="h-6 w-6" />
                        Settings
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your account, organizations, and preferences
                    </p>
                </div>
            </div>

            {/* Settings Tabs */}
            <Tabs value={activeTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="profile" className="gap-2" asChild>
                        <Link href="/dashboard/settings" className="w-full" >
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Profile</span>
                        </Link>
                    </TabsTrigger>
                    <TabsTrigger value="organizations" className="gap-2" asChild>
                        <Link href="/dashboard/settings/organizations" className="w-full">
                            <Building2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Organizations</span>
                        </Link>
                    </TabsTrigger>
                    <TabsTrigger value="api-keys" className="gap-2" asChild>
                        <Link href="/dashboard/settings/api-keys" className="w-full">
                            <Key className="h-4 w-4" />
                            <span className="hidden sm:inline">API Keys</span>
                        </Link>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2" asChild>
                        <Link href="/dashboard/settings/security" className="w-full">
                            <Shield className="h-4 w-4" />
                            <span className="hidden sm:inline">Security</span>
                        </Link>
                    </TabsTrigger>
                </TabsList>
                {children}
            </Tabs>
        </div>

    );
}