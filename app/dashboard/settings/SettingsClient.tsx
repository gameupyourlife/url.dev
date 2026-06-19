"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";
import { updateUser, changePassword } from "@/app/actions/user";
import { listOrganizations, getOrganization, setActiveOrganization } from "@/app/actions/organizations";
import {
    OrganizationSettings,
    CreateOrganizationCard,
} from "@/components/dashboard/settings/OrganizationSettings";
import { ApiKeysSettings } from "@/components/dashboard/settings/ApiKeysSettings";
import { SessionsSettings } from "@/components/dashboard/settings/SessionsSettings";
import {
    User,
    Building2,
    Key,
    Shield,
    Settings,
    Check,
    Loader2,
    ChevronDown,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

interface Organization {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    createdAt: Date;
}

interface FullOrganization extends Organization {
    members: Array<{
        id: string;
        userId: string;
        role: string;
        createdAt: Date;
        user: {
            id: string;
            name: string;
            email: string;
            image?: string | null;
        };
    }>;
    invitations: Array<{
        id: string;
        email: string;
        role: string | null;
        status: string;
        expiresAt: Date;
        inviterId: string;
    }>;
}

export default function SettingsClient() {
    const { data: session, isPending: sessionLoading } = authClient.useSession();
    const { theme, setTheme } = useTheme();

    // Profile state
    const [name, setName] = useState("");
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Organizations state
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<FullOrganization | null>(null);
    const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
    const [activeTab, setActiveTab] = useState("profile");

    // Initialize name when session loads
    useEffect(() => {
        if (session?.user?.name) {
            setName(session.user.name);
        }
    }, [session?.user?.name]);

    // Fetch organizations
    const fetchOrganizations = useCallback(async () => {
        try {
            const orgs = await listOrganizations();
            setOrganizations((orgs as Organization[]) || []);

            // If user has an active org, fetch its details
            if (session?.session?.activeOrganizationId) {
                const fullOrg = await getOrganization(session.session.activeOrganizationId);
                setSelectedOrg(fullOrg as FullOrganization);
            }
        } catch (error) {
            console.error("Failed to fetch organizations:", error);
        } finally {
            setIsLoadingOrgs(false);
        }
    }, [session?.session?.activeOrganizationId]);

    useEffect(() => {
        if (!sessionLoading) {
            fetchOrganizations();
        }
    }, [sessionLoading, fetchOrganizations]);

    async function handleUpdateProfile() {
        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        setIsUpdatingProfile(true);
        try {
            await updateUser({ name });
            toast.success("Profile updated successfully");
        } catch (error: any) {
            toast.error(error?.message || "Failed to update profile");
        } finally {
            setIsUpdatingProfile(false);
        }
    }

    async function handleChangePassword() {
        if (!currentPassword || !newPassword) {
            toast.error("Please fill in all password fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setIsChangingPassword(true);
        try {
            await changePassword({ currentPassword, newPassword });
            toast.success("Password changed successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast.error(error?.message || "Failed to change password");
        } finally {
            setIsChangingPassword(false);
        }
    }

    async function handleSelectOrg(orgId: string | null) {
        try {
            await setActiveOrganization(orgId);
            if (orgId) {
                const fullOrg = await getOrganization(orgId);
                setSelectedOrg(fullOrg as FullOrganization);
            } else {
                setSelectedOrg(null);
            }
            toast.success(orgId ? "Organization switched" : "Switched to personal account");
        } catch (error: any) {
            toast.error(error?.message || "Failed to switch organization");
        }
    }

    if (sessionLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

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

                {/* Organization Switcher */}
                {organizations.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Building2 className="h-4 w-4" />
                                {selectedOrg ? selectedOrg.name : "Personal Account"}
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[220px]">
                            <DropdownMenuLabel>Switch context</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSelectOrg(null)}>
                                <User className="h-4 w-4 mr-2" />
                                Personal Account
                                {!selectedOrg && <Check className="h-4 w-4 ml-auto" />}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {organizations.map((org) => (
                                <DropdownMenuItem
                                    key={org.id}
                                    onClick={() => handleSelectOrg(org.id)}
                                >
                                    <Building2 className="h-4 w-4 mr-2" />
                                    {org.name}
                                    {selectedOrg?.id === org.id && (
                                        <Check className="h-4 w-4 ml-auto" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="organizations" className="gap-2">
                        <Building2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Organizations</span>
                    </TabsTrigger>
                    <TabsTrigger value="api-keys" className="gap-2">
                        <Key className="h-4 w-4" />
                        <span className="hidden sm:inline">API Keys</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="hidden sm:inline">Security</span>
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* User Profile Card */}
                        <Card className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <Avatar className="h-16 w-16">
                                    {session?.user?.image ? (
                                        <AvatarImage
                                            src={session.user.image}
                                            alt={session.user.name || "User"}
                                        />
                                    ) : null}
                                    <AvatarFallback className="text-xl">
                                        {session?.user?.name?.[0]?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold text-lg">
                                        {session?.user?.name || "User"}
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        {session?.user?.email}
                                    </div>
                                    <Badge variant="secondary" className="mt-1">
                                        {session?.user?.role || "User"}
                                    </Badge>
                                </div>
                            </div>
                            <Separator className="mb-6" />
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleUpdateProfile();
                                }}
                            >
                                <FieldSet>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="name">Display Name</FieldLabel>
                                            <Input
                                                id="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="John Doe"
                                            />
                                            <FieldDescription>
                                                This is how your name appears across the platform.
                                            </FieldDescription>
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="email">Email</FieldLabel>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={session?.user?.email || ""}
                                                disabled
                                                className="bg-muted"
                                            />
                                            <FieldDescription>
                                                Contact support to change your email address.
                                            </FieldDescription>
                                        </Field>
                                        <Field orientation="horizontal">
                                            <Button type="submit" disabled={isUpdatingProfile}>
                                                {isUpdatingProfile ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    "Save Changes"
                                                )}
                                            </Button>
                                        </Field>
                                    </FieldGroup>
                                </FieldSet>
                            </form>
                        </Card>

                        {/* Preferences Card */}
                        <Card className="p-6">
                            <h3 className="font-semibold text-lg mb-4">Preferences</h3>
                            <FieldSet>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="theme">Theme</FieldLabel>
                                        <Select
                                            value={theme}
                                            onValueChange={setTheme}
                                        >
                                            <SelectTrigger id="theme">
                                                <SelectValue placeholder="Select theme" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="system">System</SelectItem>
                                                <SelectItem value="light">Light</SelectItem>
                                                <SelectItem value="dark">Dark</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldDescription>
                                            Choose your preferred color scheme.
                                        </FieldDescription>
                                    </Field>
                                    <Separator className="my-2" />
                                    <Field orientation="horizontal" className="flex items-center justify-between">
                                        <div>
                                            <FieldLabel htmlFor="email-notifications">
                                                Email Notifications
                                            </FieldLabel>
                                            <FieldDescription>
                                                Receive email updates about your links.
                                            </FieldDescription>
                                        </div>
                                        <Switch id="email-notifications" defaultChecked />
                                    </Field>
                                    <Field orientation="horizontal" className="flex items-center justify-between">
                                        <div>
                                            <FieldLabel htmlFor="weekly-digest">
                                                Weekly Digest
                                            </FieldLabel>
                                            <FieldDescription>
                                                Get a weekly summary of your link analytics.
                                            </FieldDescription>
                                        </div>
                                        <Switch id="weekly-digest" />
                                    </Field>
                                </FieldGroup>
                            </FieldSet>
                        </Card>

                        {/* Password Change Card */}
                        <Card className="p-6 lg:col-span-2">
                            <h3 className="font-semibold text-lg mb-4">Change Password</h3>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleChangePassword();
                                }}
                                className="max-w-md"
                            >
                                <FieldSet>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="current-password">
                                                Current Password
                                            </FieldLabel>
                                            <Input
                                                id="current-password"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                autoComplete="current-password"
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="new-password">
                                                New Password
                                            </FieldLabel>
                                            <Input
                                                id="new-password"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                autoComplete="new-password"
                                            />
                                            <FieldDescription>
                                                Minimum 8 characters.
                                            </FieldDescription>
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="confirm-password">
                                                Confirm New Password
                                            </FieldLabel>
                                            <Input
                                                id="confirm-password"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                autoComplete="new-password"
                                            />
                                        </Field>
                                        <Field orientation="horizontal">
                                            <Button type="submit" disabled={isChangingPassword}>
                                                {isChangingPassword ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Changing...
                                                    </>
                                                ) : (
                                                    "Change Password"
                                                )}
                                            </Button>
                                        </Field>
                                    </FieldGroup>
                                </FieldSet>
                            </form>
                        </Card>
                    </div>
                </TabsContent>

                {/* Organizations Tab */}
                <TabsContent value="organizations" className="space-y-6">
                    {isLoadingOrgs ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : selectedOrg ? (
                        <OrganizationSettings
                            organization={selectedOrg}
                            currentUserId={session?.user?.id || ""}
                            onRefresh={fetchOrganizations}
                        />
                    ) : (
                        <div className="space-y-6">
                            {/* No Organization Selected */}
                            {organizations.length > 0 ? (
                                <Card className="p-6">
                                    <div className="text-center py-8">
                                        <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                                        <p className="text-muted-foreground mb-4">
                                            Select an organization from the dropdown above to manage it.
                                        </p>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {organizations.map((org) => (
                                                <Button
                                                    key={org.id}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleSelectOrg(org.id)}
                                                >
                                                    {org.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            ) : null}

                            {/* Create Organization */}
                            <CreateOrganizationCard onCreated={fetchOrganizations} />
                        </div>
                    )}
                </TabsContent>

                {/* API Keys Tab */}
                <TabsContent value="api-keys">
                    <ApiKeysSettings />
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                    <SessionsSettings currentSessionToken={session?.session?.token} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
