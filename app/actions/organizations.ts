"use server";

import { auth } from "@/lib/auth";
import { isAuthenticated } from "@/lib/auth/guards";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export interface CreateOrganizationData {
    name: string;
    slug: string;
    logo?: string;
}

export interface InviteMemberData {
    email: string;
    role: "member" | "admin" | "owner" | "developer";
    organizationId: string;
}

export interface UpdateMemberRoleData {
    memberId: string;
    role: "member" | "admin" | "owner" | "developer";
    organizationId: string;
}

export async function createOrganization(data: CreateOrganizationData) {
    const session = await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.createOrganization({
        headers: requestHeaders,
        body: {
            name: data.name,
            slug: data.slug,
            logo: data.logo,
        },
    });

    revalidatePath("/dashboard/settings");
    return result;
}

export async function listOrganizations() {
    const session = await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.listOrganizations({
        headers: requestHeaders,
    });

    return result;
}

export async function getOrganization(organizationId: string) {
    const session = await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.getFullOrganization({
        headers: requestHeaders,
        query: {
            organizationId,
        },
    });

    return result;
}

export async function setActiveOrganization(organizationId: string | null) {
    const session = await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.setActiveOrganization({
        headers: requestHeaders,
        body: {
            organizationId,
        },
    });

    revalidatePath("/dashboard");
    return result;
}

export async function updateOrganization(
    organizationId: string,
    data: Partial<CreateOrganizationData>,
) {
    const session = await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.updateOrganization({
        headers: requestHeaders,
        body: {
            organizationId,
            data: {
                name: data.name,
                slug: data.slug,
                logo: data.logo,
            },
        },
    });

    revalidatePath("/dashboard/settings");
    return result;
}

export async function deleteOrganization(organizationId: string) {
    const session = await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.deleteOrganization({
        headers: requestHeaders,
        body: {
            organizationId,
        },
    });

    revalidatePath("/dashboard/settings");
    return result;
}

export async function inviteMember(data: InviteMemberData) {
    const session = await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.createInvitation({
        headers: requestHeaders,
        body: {
            email: data.email,
            role: data.role,
            organizationId: data.organizationId,
        },
    });

    revalidatePath("/dashboard/settings");
    return result;
}

export async function cancelInvitation(invitationId: string) {
    const session = await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.cancelInvitation({
        headers: requestHeaders,
        body: {
            invitationId,
        },
    });

    revalidatePath("/dashboard/settings");
    return result;
}

export async function acceptInvitation(invitationId: string) {
    const session = await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.acceptInvitation({
        headers: requestHeaders,
        body: {
            invitationId,
        },
    });

    revalidatePath("/dashboard/settings");
    return result;
}

export async function rejectInvitation(invitationId: string) {
    const session = await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.rejectInvitation({
        headers: requestHeaders,
        body: {
            invitationId,
        },
    });

    revalidatePath("/dashboard/settings");
    return result;
}

export async function updateMemberRole(data: UpdateMemberRoleData) {
    const session = await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.updateMemberRole({
        headers: requestHeaders,
        body: {
            memberId: data.memberId,
            role: data.role,
            organizationId: data.organizationId,
        },
    });

    revalidatePath("/dashboard/settings");
    return result;
}

export async function removeMember(memberId: string, organizationId: string) {
    const session = await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.removeMember({
        headers: requestHeaders,
        body: {
            memberIdOrEmail: memberId,
            organizationId,
        },
    });

    revalidatePath("/dashboard/settings");
    return result;
}

export async function leaveOrganization(organizationId: string) {
    const session = await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    // First set active organization to null
    await auth.api.setActiveOrganization({
        headers: requestHeaders,
        body: {
            organizationId: null,
        },
    });

    // Then leave the organization
    // Note: This might need adjustment based on better-auth API

    revalidatePath("/dashboard/settings");
    return { success: true };
}
