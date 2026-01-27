import { headers } from "next/headers";
import { auth, Session } from "../auth";

export class InvalidApiKeyError extends Error {
    constructor(message = "", ...args: any[]) {
        super(message, ...args);
        this.message = message + " | Invalid API key";
    }
}

export async function isAuthenticated(): Promise<Session | null>;
export async function isAuthenticated({ throwIfNotAuthenticated }: { throwIfNotAuthenticated: true; apiKey?: string; permissions?: Record<string, string[]> }): Promise<Session>;
export async function isAuthenticated({ throwIfNotAuthenticated }: { throwIfNotAuthenticated?: false; apiKey?: string; permissions?: Record<string, string[]> }): Promise<Session | null>;
export async function isAuthenticated({ throwIfNotAuthenticated = false, apiKey, permissions }: { throwIfNotAuthenticated?: boolean; apiKey?: string; permissions?: Record<string, string[]> } = {}): Promise<Session | null> {

    if (apiKey) {
        const data = await auth.api.verifyApiKey({
            body: {
                key: apiKey,
                permissions,
            },
        });

        if (!data.valid) {
            if (throwIfNotAuthenticated) {
                throw new InvalidApiKeyError(data.error?.message || "Invalid API key");
            }
            return null;
        }

        const session = await auth.api.getSession({
            headers: {
                "home-dev-api-key": apiKey,
            },
        });
        return session;
    }

    const requestHeaders = await headers();
    const session = await auth.api.getSession({
        headers: requestHeaders,
    });

    if (throwIfNotAuthenticated && !session) {
        throw new Error("User is not authenticated");
    }

    return session;
}