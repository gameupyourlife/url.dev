"use server";

import { auth } from "@/lib/auth";
import { isAuthenticated } from "@/lib/auth/guards";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export interface CreateApiKeyData {
    name: string;
    expiresIn?: number; // seconds
    permissions?: Record<string, string[]>;
}

export async function createApiKey(data: CreateApiKeyData) {
    const session = await isAuthenticated({
        behavior: "error",
        permissions: { apiKeys: ["create"] },
    });

    const requestHeaders = await headers();

    const result = await auth.api.createApiKey({
        headers: requestHeaders,
        body: {
            name: data.name,
            expiresIn: data.expiresIn,
            permissions: data.permissions,
        },
    });

    revalidatePath("/dashboard/settings");
    return result;
}

export async function listApiKeys() {
    const session = await isAuthenticated({
        behavior: "error",
        permissions: { apiKeys: ["read"] },
    });

    const requestHeaders = await headers();

    const result = await auth.api.listApiKeys({
        headers: requestHeaders,
    });

    return result;
}

export async function deleteApiKey(keyId: string) {
    const session = await isAuthenticated({
        behavior: "error",
        permissions: { apiKeys: ["delete"] },
    });

    const requestHeaders = await headers();

    const result = await auth.api.deleteApiKey({
        headers: requestHeaders,
        body: {
            keyId,
        },
    });

    revalidatePath("/dashboard/settings");
    return result;
}
