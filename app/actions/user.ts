"use server";

import { auth } from "@/lib/auth";
import { isAuthenticated } from "@/lib/auth/guards";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export interface UpdateUserData {
    name?: string;
    image?: string;
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
