"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
    createOrganization,
    inviteMember,
    removeMember,
    updateMemberRole,
    cancelInvitation,
    updateOrganization,
} from "@/app/actions/organizations";
import {
    Building2,
    Crown,
    Mail,
    MoreHorizontal,
    Pencil,
    Plus,
    Shield,
    Trash2,
    UserCircle,
    UserPlus,
    Users,
    X,
    Code,
    Check,
    Loader2,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OrganizationMember {
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
}

interface OrganizationInvitation {
    id: string;
    email: string;
    role: string | null;
    status: string;
    expiresAt: Date;
    inviterId: string;
}

interface OrganizationData {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    createdAt: Date;
    members: OrganizationMember[];
    invitations: OrganizationInvitation[];
}

const roleConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    owner: {
        icon: <Crown className="h-3.5 w-3.5" />,
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        label: "Owner"
    },
    admin: {
        icon: <Shield className="h-3.5 w-3.5" />,
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        label: "Admin"
    },
    developer: {
        icon: <Code className="h-3.5 w-3.5" />,
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        label: "Developer"
    },
    member: {
        icon: <UserCircle className="h-3.5 w-3.5" />,
        color: "bg-muted text-muted-foreground",
        label: "Member"
    },
};

export function OrganizationSettings({
    organization,
    currentUserId,
    onRefresh,
}: {
    organization: OrganizationData;
    currentUserId: string;
    onRefresh: () => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(organization.name);
    const [slug, setSlug] = useState(organization.slug);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"member" | "admin" | "developer">("member");
    const [isInviting, setIsInviting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showInviteForm, setShowInviteForm] = useState(false);

    const currentMember = organization.members.find((m) => m.userId === currentUserId);
    const isOwner = currentMember?.role === "owner";
    const isAdmin = isOwner || currentMember?.role === "admin";
    const pendingInvitations = organization.invitations.filter((i) => i.status === "pending");

    async function handleUpdateOrg() {
        if (!name.trim()) {
            toast.error("Organization name is required");
            return;
        }
        setIsUpdating(true);
        try {
            await updateOrganization(organization.id, { name, slug });
            toast.success("Organization updated");
            setIsEditing(false);
            onRefresh();
        } catch (error: any) {
            toast.error(error?.message || "Failed to update organization");
        } finally {
            setIsUpdating(false);
        }
    }

    async function handleInvite() {
        if (!inviteEmail.trim()) {
            toast.error("Email is required");
            return;
        }
        setIsInviting(true);
        try {
            await inviteMember({
                email: inviteEmail,
                role: inviteRole,
                organizationId: organization.id,
            });
            toast.success(`Invitation sent to ${inviteEmail}`);
            setInviteEmail("");
            setShowInviteForm(false);
            onRefresh();
        } catch (error: any) {
            toast.error(error?.message || "Failed to send invitation");
        } finally {
            setIsInviting(false);
        }
    }

    async function handleChangeRole(memberId: string, newRole: string) {
        try {
            await updateMemberRole({
                memberId,
                role: newRole as "member" | "admin" | "owner" | "developer",
                organizationId: organization.id,
            });
            toast.success("Member role updated");
            onRefresh();
        } catch (error: any) {
            toast.error(error?.message || "Failed to update member role");
        }
    }

    async function handleRemoveMember(memberId: string) {
        try {
            await removeMember(memberId, organization.id);
            toast.success("Member removed");
            onRefresh();
        } catch (error: any) {
            toast.error(error?.message || "Failed to remove member");
        }
    }

    async function handleCancelInvitation(invitationId: string) {
        try {
            await cancelInvitation(invitationId);
            toast.success("Invitation cancelled");
            onRefresh();
        } catch (error: any) {
            toast.error(error?.message || "Failed to cancel invitation");
        }
    }

    return (
        <div className="space-y-8">
            {/* Organization Header - Inline Edit */}
            <div className="bg-card rounded-xl p-6">
                {isEditing ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Edit Organization</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setIsEditing(false);
                                    setName(organization.name);
                                    setSlug(organization.slug);
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Name</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Organization name"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Slug</label>
                                <Input
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                                    placeholder="organization-slug"
                                />
                            </div>
                        </div>
                        <Button onClick={handleUpdateOrg} disabled={isUpdating}>
                            {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-7 w-7 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">{organization.name}</h2>
                                <p className="text-sm text-muted-foreground">{`${process.env.NEXT_PUBLIC_BASE_URL}/${organization.slug}`}</p>
                            </div>
                        </div>
                        {isAdmin && (
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Team Members */}
            <div className="bg-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Team Members
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {organization.members.length} member{organization.members.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    {isAdmin && (
                        <Button onClick={() => setShowInviteForm(!showInviteForm)} size="sm">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite
                        </Button>
                    )}
                </div>

                {/* Invite Form */}
                {showInviteForm && isAdmin && (
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleInvite();
                            }}
                            className="flex flex-col sm:flex-row gap-3"
                        >
                            <Input
                                type="email"
                                placeholder="Email address"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="flex-1 bg-background"
                            />
                            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
                                <SelectTrigger className="w-full sm:w-36 bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="developer">Developer</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={isInviting} size="sm">
                                    {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setShowInviteForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Pending Invitations */}
                {pendingInvitations.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                            Pending Invitations
                        </p>
                        <div className="space-y-2">
                            {pendingInvitations.map((invitation) => (
                                <div
                                    key={invitation.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{invitation.email}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {invitation.role} • Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleCancelInvitation(invitation.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Members List */}
                <div className="space-y-1">
                    {pendingInvitations.length > 0 && (
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                            Active Members
                        </p>
                    )}
                    {organization.members.map((member) => {
                        const role = roleConfig[member.role] || roleConfig.member;
                        const isCurrentUser = member.userId === currentUserId;

                        return (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        {member.user.image && <AvatarImage src={member.user.image} />}
                                        <AvatarFallback className="text-sm">
                                            {member.user.name?.[0]?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            {member.user.name}
                                            {isCurrentUser && (
                                                <span className="text-xs text-muted-foreground">(you)</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className={`gap-1.5 ${role.color}`}>
                                        {role.icon}
                                        {role.label}
                                    </Badge>

                                    {isAdmin && !isCurrentUser && member.role !== "owner" && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleChangeRole(member.id, "admin")}>
                                                    <Shield className="h-4 w-4 mr-2" />
                                                    Make Admin
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleChangeRole(member.id, "developer")}>
                                                    <Code className="h-4 w-4 mr-2" />
                                                    Make Developer
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleChangeRole(member.id, "member")}>
                                                    <UserCircle className="h-4 w-4 mr-2" />
                                                    Make Member
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => handleRemoveMember(member.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Remove
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export function CreateOrganizationCard({ onCreated }: { onCreated: () => void }) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    async function handleCreate() {
        if (!name.trim() || !slug.trim()) {
            toast.error("Name and slug are required");
            return;
        }

        setIsCreating(true);
        try {
            await createOrganization({ name, slug });
            toast.success("Organization created!");
            setName("");
            setSlug("");
            setIsExpanded(false);
            onCreated();
        } catch (error: any) {
            toast.error(error?.message || "Failed to create organization");
        } finally {
            setIsCreating(false);
        }
    }

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="w-full bg-card rounded-xl p-6 text-left hover:bg-muted/50 transition-colors group"
            >
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Create Organization</h3>
                        <p className="text-sm text-muted-foreground">
                            Collaborate with your team on shared links
                        </p>
                    </div>
                </div>
            </button>
        );
    }

    return (
        <div className="bg-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Create Organization</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleCreate();
                }}
                className="space-y-4"
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Organization Name</label>
                        <Input
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setSlug(
                                    e.target.value
                                        .toLowerCase()
                                        .replace(/[^a-z0-9]+/g, "-")
                                        .replace(/^-|-$/g, "")
                                );
                            }}
                            placeholder="Acme Inc."
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">URL Slug</label>
                        <Input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                            placeholder="acme-inc"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button type="submit" disabled={isCreating}>
                        {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                        Create Organization
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setIsExpanded(false)}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
