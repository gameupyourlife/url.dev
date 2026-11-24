"use client";

import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    acceptInvitation,
    listUserInvitations,
    rejectInvitation,
    setActiveOrganization,
} from "@/app/actions/organizations";
import {
    changeEmail,
    changePassword,
    deleteAccountWithPassword,
    listLinkedAccounts,
    LinkedAccount,
    setPassword as setPasswordAction,
    unlinkAccount,
    updateUser,
} from "@/app/actions/user";
import {
    Building2,
    Check,
    ChevronDown,
    Key,
    Link2,
    Loader2,
    Settings,
    Shield,
    Trash2,
    User,
    UserRound,
    X,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    CreateOrganizationCard,
    OrganizationSettings,
} from "@/components/dashboard/settings/OrganizationSettings";
import { ApiKeysSettings } from "@/components/dashboard/settings/ApiKeysSettings";
import { SessionsSettings } from "@/components/dashboard/settings/SessionsSettings";

type SettingsTab = "profile" | "organizations" | "api-keys" | "security";

interface UserInvitation {
    id: string;
    email: string;
    role: string | null;
    status: string;
    organizationId: string;
    expiresAt: Date;
    organization: {
        id: string;
        name: string;
        slug: string;
        logo?: string | null;
    };
}

type OrganizationData = ComponentProps<typeof OrganizationSettings>["organization"];

const providerLabels: Record<string, string> = {
    credential: "Email + Password",
    github: "GitHub",
};

function getErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        return error.message;
    }
    return fallback;
}

export default function SettingsClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { theme, setTheme } = useTheme();

    const { data: session, isPending: sessionLoading } = authClient.useSession();
    const {
        data: selectedOrg,
        isPending: isLoadingActiveOrganization,
        refetch: refetchActiveOrganization,
    } = authClient.useActiveOrganization();
    const organizationQuery = authClient.useListOrganizations();
    const refetchOrganizations = organizationQuery.refetch;
    const organizationsList = organizationQuery.data ?? [];

    const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

    const [name, setName] = useState("");
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    const [newEmail, setNewEmail] = useState("");
    const [isChangingEmail, setIsChangingEmail] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [revokeOtherSessionsAfterPasswordChange, setRevokeOtherSessionsAfterPasswordChange] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [setPasswordValue, setSetPasswordValue] = useState("");
    const [setPasswordConfirmValue, setSetPasswordConfirmValue] = useState("");
    const [isSettingPassword, setIsSettingPassword] = useState(false);

    const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
    const [isLoadingLinkedAccounts, setIsLoadingLinkedAccounts] = useState(true);

    const [incomingInvitations, setIncomingInvitations] = useState<UserInvitation[]>([]);
    const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);

    const [deletePassword, setDeletePassword] = useState("");
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    const hasCredentialAccount = useMemo(
        () => linkedAccounts.some((account) => account.providerId === "credential"),
        [linkedAccounts],
    );

    const hasGithubAccount = useMemo(
        () => linkedAccounts.some((account) => account.providerId === "github"),
        [linkedAccounts],
    );

    const canDeleteAccount = deleteConfirmText.trim().toUpperCase() === "DELETE";

    useEffect(() => {
        if (session?.user?.name) {
            setName(session.user.name);
        }
    }, [session?.user?.name]);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab === "profile" || tab === "organizations" || tab === "api-keys" || tab === "security") {
            setActiveTab(tab);
        }
    }, [searchParams]);

    async function fetchLinkedAccounts() {
        try {
            const result = await listLinkedAccounts();
            setLinkedAccounts(result || []);
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to load linked accounts"));
        } finally {
            setIsLoadingLinkedAccounts(false);
        }
    }

    async function fetchIncomingInvitations() {
        try {
            const result = await listUserInvitations();
            setIncomingInvitations((result || []).filter((invite) => invite.status === "pending") as UserInvitation[]);
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to load invitations"));
        } finally {
            setIsLoadingInvitations(false);
        }
    }

    async function refreshOrganizationData() {
        await Promise.all([refetchActiveOrganization(), refetchOrganizations(), fetchIncomingInvitations()]);
    }

    useEffect(() => {
        fetchLinkedAccounts();
        fetchIncomingInvitations();
    }, []);

    async function handleUpdateProfile() {
        if (!name.trim()) {
            toast.error("Display name is required");
            return;
        }

        setIsUpdatingProfile(true);
        try {
            await updateUser({ name: name.trim() });
            toast.success("Profile updated");
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to update profile"));
        } finally {
            setIsUpdatingProfile(false);
        }
    }

    async function handleChangeEmail() {
        if (!newEmail.trim()) {
            toast.error("New email is required");
            return;
        }

        setIsChangingEmail(true);
        try {
            await changeEmail({
                newEmail: newEmail.trim(),
                callbackURL: "/dashboard/settings",
            });
            toast.success("Email change requested. Check your inbox to confirm.");
            setNewEmail("");
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to request email change"));
        } finally {
            setIsChangingEmail(false);
        }
    }

    async function handleChangePassword() {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Fill out all password fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setIsChangingPassword(true);
        try {
            await changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: revokeOtherSessionsAfterPasswordChange,
            });
            toast.success("Password changed");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setRevokeOtherSessionsAfterPasswordChange(false);
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to change password"));
        } finally {
            setIsChangingPassword(false);
        }
    }

    async function handleSetPassword() {
        if (!setPasswordValue || !setPasswordConfirmValue) {
            toast.error("Please enter and confirm the new password");
            return;
        }

        if (setPasswordValue !== setPasswordConfirmValue) {
            toast.error("Passwords do not match");
            return;
        }

        if (setPasswordValue.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setIsSettingPassword(true);
        try {
            await setPasswordAction({ newPassword: setPasswordValue });
            toast.success("Password set successfully");
            setSetPasswordValue("");
            setSetPasswordConfirmValue("");
            await fetchLinkedAccounts();
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to set password"));
        } finally {
            setIsSettingPassword(false);
        }
    }

    async function handleLinkGithub() {
        try {
            await authClient.linkSocial({
                provider: "github",
                callbackURL: "/dashboard/settings?tab=security",
            });
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to start GitHub account linking"));
        }
    }

    async function handleUnlinkAccount(account: LinkedAccount) {
        try {
            await unlinkAccount(account.providerId, account.accountId);
            toast.success(`Disconnected ${providerLabels[account.providerId] || account.providerId}`);
            await fetchLinkedAccounts();
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to unlink account"));
        }
    }

    async function handleAcceptInvitation(invitationId: string) {
        try {
            await acceptInvitation(invitationId);
            toast.success("Invitation accepted");
            await refreshOrganizationData();
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to accept invitation"));
        }
    }

    async function handleRejectInvitation(invitationId: string) {
        try {
            await rejectInvitation(invitationId);
            toast.success("Invitation rejected");
            await refreshOrganizationData();
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to reject invitation"));
        }
    }

    async function handleSwitchOrganization(organizationId: string | null) {
        try {
            await setActiveOrganization(organizationId);
            await refetchActiveOrganization();
            toast.success(organizationId ? "Organization switched" : "Switched to personal workspace");
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to switch organization"));
        }
    }

    async function handleDeleteAccount() {
        if (!canDeleteAccount) {
            toast.error("Type DELETE to confirm account deletion");
            return;
        }

        setIsDeletingAccount(true);
        try {
            await deleteAccountWithPassword({
                password: deletePassword || undefined,
                callbackURL: "/",
            });
            toast.success("Account deleted");
            router.replace("/");
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to delete account"));
        } finally {
            setIsDeletingAccount(false);
        }
    }

    if (sessionLoading) {
        return (
            <div className="flex items-center justify-center min-h-90">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Settings className="h-6 w-6" />
                        Settings
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your account, sessions, linked providers, and organizations.
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SettingsTab)} className="space-y-6">
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

                <TabsContent value="profile" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    {session?.user?.image ? <AvatarImage src={session.user.image} alt={session.user.name || "User"} /> : null}
                                    <AvatarFallback className="text-xl">
                                        {session?.user?.name?.[0]?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold text-lg">{session?.user?.name || "User"}</div>
                                    <div className="text-muted-foreground text-sm">{session?.user?.email}</div>
                                </div>
                            </div>

                            <Separator />

                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    handleUpdateProfile();
                                }}
                            >
                                <FieldSet>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="display-name">Display Name</FieldLabel>
                                            <Input
                                                id="display-name"
                                                value={name}
                                                onChange={(event) => setName(event.target.value)}
                                                placeholder="Your name"
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="email-readonly">Current Email</FieldLabel>
                                            <Input id="email-readonly" type="email" value={session?.user?.email || ""} disabled className="bg-muted" />
                                        </Field>
                                        <Field orientation="horizontal">
                                            <Button type="submit" disabled={isUpdatingProfile}>
                                                {isUpdatingProfile ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                                Save Profile
                                            </Button>
                                        </Field>
                                    </FieldGroup>
                                </FieldSet>
                            </form>
                        </Card>

                        <Card className="p-6 space-y-4">
                            <h3 className="font-semibold text-lg">Preferences</h3>
                            <FieldSet>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="theme">Theme</FieldLabel>
                                        <Select value={theme} onValueChange={setTheme}>
                                            <SelectTrigger id="theme">
                                                <SelectValue placeholder="Choose theme" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="system">System</SelectItem>
                                                <SelectItem value="light">Light</SelectItem>
                                                <SelectItem value="dark">Dark</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field orientation="horizontal" className="flex items-center justify-between">
                                        <div>
                                            <FieldLabel>Email Notifications</FieldLabel>
                                            <FieldDescription>UI-only preference placeholder.</FieldDescription>
                                        </div>
                                        <Switch defaultChecked />
                                    </Field>
                                </FieldGroup>
                            </FieldSet>
                        </Card>
                    </div>

                    <Card className="p-6 max-w-2xl">
                        <h3 className="font-semibold text-lg mb-4">Change Email</h3>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                handleChangeEmail();
                            }}
                            className="space-y-3"
                        >
                            <Field>
                                <FieldLabel htmlFor="new-email">New Email</FieldLabel>
                                <Input
                                    id="new-email"
                                    type="email"
                                    value={newEmail}
                                    onChange={(event) => setNewEmail(event.target.value)}
                                    placeholder="name@example.com"
                                />
                                <FieldDescription>
                                    Better Auth will require confirmation before updating your email.
                                </FieldDescription>
                            </Field>
                            <Button type="submit" disabled={isChangingEmail}>
                                {isChangingEmail ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                Request Email Change
                            </Button>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="organizations" className="space-y-6">
                    <Card className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-lg">Active Organization</h3>
                                <p className="text-sm text-muted-foreground">Switch the workspace you are currently managing.</p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="justify-between min-w-64">
                                        <span className="inline-flex items-center gap-2">
                                            {selectedOrg ? <Building2 className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
                                            {selectedOrg?.name || "Personal Workspace"}
                                        </span>
                                        <ChevronDown className="h-4 w-4 opacity-60" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64" align="end">
                                    <DropdownMenuItem onClick={() => handleSwitchOrganization(null)}>
                                        <UserRound className="h-4 w-4 mr-2" />
                                        Personal Workspace
                                        {!selectedOrg ? <Check className="h-4 w-4 ml-auto" /> : null}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {organizationsList.map((organization) => (
                                        <DropdownMenuItem
                                            key={organization.id}
                                            onClick={() => handleSwitchOrganization(organization.id)}
                                        >
                                            <Building2 className="h-4 w-4 mr-2" />
                                            {organization.name}
                                            {selectedOrg?.id === organization.id ? <Check className="h-4 w-4 ml-auto" /> : null}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-semibold text-lg mb-1">Incoming Invitations</h3>
                        <p className="text-sm text-muted-foreground mb-4">Accept or reject pending organization invitations.</p>
                        {isLoadingInvitations ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : incomingInvitations.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No pending invitations.</p>
                        ) : (
                            <div className="space-y-2">
                                {incomingInvitations.map((invitation) => (
                                    <div
                                        key={invitation.id}
                                        className="rounded-lg border border-border/70 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                                    >
                                        <div>
                                            <p className="font-medium text-sm">{invitation.organization.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Role: {invitation.role || "member"} • Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleAcceptInvitation(invitation.id)}>
                                                Accept
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleRejectInvitation(invitation.id)}>
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {isLoadingActiveOrganization ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : selectedOrg ? (
                        <OrganizationSettings
                            organization={selectedOrg as OrganizationData}
                            currentUserId={session?.user?.id || ""}
                            onRefresh={() => refetchActiveOrganization()}
                            onOrganizationLeftOrDeleted={refreshOrganizationData}
                        />
                    ) : (
                        <CreateOrganizationCard onCreated={refreshOrganizationData} />
                    )}
                </TabsContent>

                <TabsContent value="api-keys">
                    <ApiKeysSettings />
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <Card className="p-6">
                        <h3 className="font-semibold text-lg mb-4">Password Security</h3>
                        {hasCredentialAccount ? (
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    handleChangePassword();
                                }}
                                className="max-w-xl space-y-3"
                            >
                                <Field>
                                    <FieldLabel htmlFor="current-password">Current Password</FieldLabel>
                                    <Input
                                        id="current-password"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(event) => setCurrentPassword(event.target.value)}
                                        autoComplete="current-password"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(event) => setNewPassword(event.target.value)}
                                        autoComplete="new-password"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="confirm-new-password">Confirm New Password</FieldLabel>
                                    <Input
                                        id="confirm-new-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        autoComplete="new-password"
                                    />
                                </Field>
                                <Field orientation="horizontal" className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                                    <div>
                                        <FieldLabel>Sign out other sessions</FieldLabel>
                                        <FieldDescription>Revoke all other active sessions after password update.</FieldDescription>
                                    </div>
                                    <Switch
                                        checked={revokeOtherSessionsAfterPasswordChange}
                                        onCheckedChange={setRevokeOtherSessionsAfterPasswordChange}
                                    />
                                </Field>
                                <Button type="submit" disabled={isChangingPassword}>
                                    {isChangingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                    Change Password
                                </Button>
                            </form>
                        ) : (
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    handleSetPassword();
                                }}
                                className="max-w-xl space-y-3"
                            >
                                <p className="text-sm text-muted-foreground">
                                    You currently sign in with a social provider only. Set a password to enable email/password login.
                                </p>
                                <Field>
                                    <FieldLabel htmlFor="set-password">New Password</FieldLabel>
                                    <Input
                                        id="set-password"
                                        type="password"
                                        value={setPasswordValue}
                                        onChange={(event) => setSetPasswordValue(event.target.value)}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="set-password-confirm">Confirm Password</FieldLabel>
                                    <Input
                                        id="set-password-confirm"
                                        type="password"
                                        value={setPasswordConfirmValue}
                                        onChange={(event) => setSetPasswordConfirmValue(event.target.value)}
                                    />
                                </Field>
                                <Button type="submit" disabled={isSettingPassword}>
                                    {isSettingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                    Set Password
                                </Button>
                            </form>
                        )}
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-semibold text-lg">Linked Accounts</h3>
                                <p className="text-sm text-muted-foreground">Manage sign-in providers connected to your user.</p>
                            </div>
                            {!hasGithubAccount ? (
                                <Button onClick={handleLinkGithub} variant="outline" className="gap-2">
                                    <Link2 className="h-4 w-4" />
                                    Connect GitHub
                                </Button>
                            ) : null}
                        </div>

                        {isLoadingLinkedAccounts ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : linkedAccounts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No linked accounts found.</p>
                        ) : (
                            <div className="space-y-2">
                                {linkedAccounts.map((account) => (
                                    <div
                                        key={account.id}
                                        className="rounded-lg border border-border/70 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                                    >
                                        <div>
                                            <p className="font-medium text-sm">
                                                {providerLabels[account.providerId] || account.providerId}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Linked {new Date(account.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive"
                                            onClick={() => handleUnlinkAccount(account)}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Unlink
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <SessionsSettings currentSessionToken={session?.session?.token} />

                    <Card className="p-6 border border-destructive/20">
                        <h3 className="font-semibold text-lg text-destructive mb-1">Delete Account</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            This permanently removes your account and associated access.
                        </p>

                        <div className="space-y-3 max-w-xl">
                            <Field>
                                <FieldLabel htmlFor="delete-password">Current Password (if enabled)</FieldLabel>
                                <Input
                                    id="delete-password"
                                    type="password"
                                    value={deletePassword}
                                    onChange={(event) => setDeletePassword(event.target.value)}
                                    placeholder="Required if your account has a password"
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="delete-confirm">Type DELETE to confirm</FieldLabel>
                                <Input
                                    id="delete-confirm"
                                    value={deleteConfirmText}
                                    onChange={(event) => setDeleteConfirmText(event.target.value)}
                                    placeholder="DELETE"
                                />
                            </Field>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="mt-4" disabled={!canDeleteAccount}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action is irreversible and will remove your user access permanently.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteAccount}
                                        disabled={isDeletingAccount}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {isDeletingAccount ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                        Confirm Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
