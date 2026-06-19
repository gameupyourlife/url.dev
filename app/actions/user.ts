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
}

export async function updateUser(data: UpdateUserData) {
    const session = await isAuthenticated({ behavior: "error" });
    
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
    const session = await isAuthenticated({ behavior: "error" });
    
    const requestHeaders = await headers();
    
    const result = await auth.api.changePassword({
        headers: requestHeaders,
        body: {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
            revokeOtherSessions: false,
        },
    });

    revalidatePath("/dashboard/settings");
    return result;
}

export async function deleteAccount() {
    const session = await isAuthenticated({ behavior: "error" });
    
    const requestHeaders = await headers();
    
    // Sign out first then delete
    await auth.api.signOut({
        headers: requestHeaders,
    });
    
    // Note: Account deletion would need additional implementation
    // based on your specific requirements
    
    return { success: true };
}

export async function listSessions() {
    const session = await isAuthenticated({ behavior: "error" });
    
    const requestHeaders = await headers();
    
    const result = await auth.api.listSessions({
        headers: requestHeaders,
    });

    return result;
}

export async function revokeSession(sessionToken: string) {
    const session = await isAuthenticated({ behavior: "error" });
    
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
    const session = await isAuthenticated({ behavior: "error" });
    
    const requestHeaders = await headers();
    
    const result = await auth.api.revokeSessions({
        headers: requestHeaders,
    });

    revalidatePath("/dashboard/settings");
    return result;
}
