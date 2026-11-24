"use server";

import { auth } from "@/lib/auth";
import { isAuthenticated } from "@/lib/auth/guards";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export interface UpdateUserData {
    name?: string;
    image?: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    revokeOtherSessions?: boolean;
}

export interface ChangeEmailData {
    newEmail: string;
    callbackURL?: string;
}

export interface SetPasswordData {
    newPassword: string;
}

export interface DeleteAccountData {
    password?: string;
    callbackURL?: string;
}

export interface LinkedAccount {
    id: string;
    accountId: string;
    providerId: string;
    createdAt: Date;
    updatedAt: Date;
    scopes: string[];
}

export async function updateUser(data: UpdateUserData) {
    await isAuthenticated({ behavior: "error" });
    
    const requestHeaders = await headers();
    
    const result = await auth.api.updateUser({
        headers: requestHeaders,
        body: {
            name: data.name,
            image: data.image,
        },
    });

    revalidatePath("/dashboard/settings");
    return result;
}

export async function changePassword(data: ChangePasswordData) {
    await isAuthenticated({ behavior: "error" });
    
    const requestHeaders = await headers();
    
    const result = await auth.api.changePassword({
        headers: requestHeaders,
        body: {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
            revokeOtherSessions: data.revokeOtherSessions ?? false,
        },
    });

    revalidatePath("/dashboard/settings");
    return result;
}

export async function deleteAccount() {
    await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.deleteUser({
        headers: requestHeaders,
        body: {},
    });

    revalidatePath("/");
    return result;
}

export async function deleteAccountWithPassword(data: DeleteAccountData) {
    await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.deleteUser({
        headers: requestHeaders,
        body: {
            password: data.password,
            callbackURL: data.callbackURL,
        },
    });

    revalidatePath("/");
    return result;
}

export async function changeEmail(data: ChangeEmailData) {
    await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.changeEmail({
        headers: requestHeaders,
        body: {
            newEmail: data.newEmail,
            callbackURL: data.callbackURL,
        },
    });

    revalidatePath("/dashboard/settings");
    return result;
}

export async function setPassword(data: SetPasswordData) {
    await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.setPassword({
        headers: requestHeaders,
        body: {
            newPassword: data.newPassword,
        },
    });

    revalidatePath("/dashboard/settings");
    return result;
}

export async function listSessions() {
    await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();
    
    const result = await auth.api.listSessions({
        headers: requestHeaders,
    });

    return result;
}

export async function revokeSession(sessionToken: string) {
    await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();
    
    const result = await auth.api.revokeSession({
        headers: requestHeaders,
        body: {
            token: sessionToken,
        },
    });

    revalidatePath("/dashboard/settings");
    return result;
}

export async function revokeAllSessions() {
    await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();
    
    const result = await auth.api.revokeSessions({
        headers: requestHeaders,
    });

    revalidatePath("/dashboard/settings");
    return result;
}

export async function revokeOtherSessions() {
    await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.revokeOtherSessions({
        headers: requestHeaders,
    });

    revalidatePath("/dashboard/settings");
    return result;
}

export async function listLinkedAccounts() {
    await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.listUserAccounts({
        headers: requestHeaders,
    });

    return result as LinkedAccount[];
}

export async function unlinkAccount(providerId: string, accountId?: string) {
    await isAuthenticated({ behavior: "error" });

    const requestHeaders = await headers();

    const result = await auth.api.unlinkAccount({
        headers: requestHeaders,
        body: {
            providerId,
            accountId,
        },
    });

    revalidatePath("/dashboard/settings");
    return result;
}
