"use client";

import { Card } from "@/components/ui/card";
import { Building2, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import {
    CreateOrganizationCard,
    OrganizationSettings,
} from "@/components/dashboard/settings/OrganizationSettings";
import { Button } from "@/components/ui/button";

export default function OrganizationsPage() {
    const { data: session } = authClient.useSession();
    const {
        data: selectedOrg,
        isPending: isLoadingActiveOrganization,
        refetch: refetchActiveOrg,
    } = authClient.useActiveOrganization();
    const { data: organizations } = authClient.useListOrganizations();

    if (isLoadingActiveOrganization) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (selectedOrg) {
        return (
            <OrganizationSettings
                organization={selectedOrg}
                currentUserId={session?.user?.id || ""}
                onRefresh={() => refetchActiveOrg()}
            />
        );
    }

    return (
        <div className="space-y-6">
            {organizations && organizations.length > 0 && (
                <Card className="p-6">
                    <div className="text-center py-8">
                        <Building2 className="h-12 w-12 mx-auto tex t-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                            Select an organization from the list below to manage it.
                        </p>
                        {organizations.map((org) => (
                            <Button key={org.id} className="mt-2" onClick={() => authClient.organization.setActive({ organizationId: org.id })}>
                                <p className="text-sm font-medium">{org.name}</p>
                            </Button>
                        ))}
                    </div>
                </Card>
            )}
            <CreateOrganizationCard onCreated={() => refetchActiveOrg()} />
        </div>
    );
}
