import { headers } from "next/headers";
import { auth, Session } from "../auth";
import { redirect } from "next/navigation";

/**
 * Custom error thrown when API key validation fails
 */
export class InvalidApiKeyError extends Error {
    constructor(message = "", ...args: any[]) {
        super(message, ...args);
        this.name = "InvalidApiKeyError";
        this.message = message || "Invalid API key";
    }
}

/**
 * Custom error thrown when user is not authenticated
 */
export class UnauthenticatedError extends Error {
    constructor(message = "User is not authenticated") {
        super(message);
        this.name = "UnauthenticatedError";
    }
}

/**
 * Custom error thrown when user lacks required permissions
 */
export class InsufficientPermissionsError extends Error {
    constructor(message = "User does not have the required permissions") {
        super(message);
        this.name = "InsufficientPermissionsError";
    }
}

export type AuthBehavior = "null" | "redirect" | "error";

/**
 * Options for authentication checking
 */
export interface AuthOptions {
    /**
     * If true, throws an error when authentication fails instead of returning null
     * @default false
     */
    behavior?: AuthBehavior;

    /**
     * Optional API key for authentication
     * If provided, will validate against this key instead of session cookies
     */
    apiKey?: string;

    /**
     * Required permissions for the authenticated user
     * Format: { resource: ["permission1", "permission2"] }
     */
    permissions?: Record<string, string[]>;
}

/**
 * Check if the current request is authenticated
 * 
 * @example
 * // Basic usage - returns session or null
 * const session = await isAuthenticated();
 * if (!session) {
 *   return Response.json({ error: "Unauthorized" }, { status: 401 });
 * }
 * 
 * @example
 * // Throw on failure - useful for API routes
 * const session = await isAuthenticated({ throwIfNotAuthenticated: true });
 * // session is guaranteed to be defined here
 * 
 * @example
 * // With API key authentication
 * const session = await isAuthenticated({ 
 *   apiKey: "sk_...",
 *   throwIfNotAuthenticated: true 
 * });
 * 
 * @example
 * // With permission checking
 * const session = await isAuthenticated({
 *   throwIfNotAuthenticated: true,
 *   permissions: { urls: ["read", "write"] }
 * });
 */
export async function isAuthenticated(): Promise<Session | null>;
export async function isAuthenticated(options: AuthOptions & { behavior: "error" | "redirect" }): Promise<Session>;
export async function isAuthenticated(options: AuthOptions & { behavior?: "null" }): Promise<Session | null>;
export async function isAuthenticated(options: AuthOptions = {}): Promise<Session | null> {
    const { behavior = "null", apiKey, permissions } = options;

    // API Key Authentication Flow
    if (apiKey) {
        const session = await authenticateWithApiKey(apiKey, permissions, behavior);
        if (!session && behavior === "redirect") {
            redirect("/signin");
        } 
        return session;
    }

    // Session Cookie Authentication Flow
    const session = await authenticateWithSession(permissions, behavior);
    if (!session && behavior === "redirect") {
        redirect("/signin");
    }
    return session;
}

/**
 * Authenticate using an API key
 */
async function authenticateWithApiKey(
    apiKey: string,
    permissions: Record<string, string[]> | undefined,
    behavior: AuthBehavior
): Promise<Session | null> {
    // Verify the API key
    const verificationResult = await auth.api.verifyApiKey({
        body: {
            key: apiKey,
            permissions,
        },
    });

    if (!verificationResult.valid) {
        if (behavior === "error") {
            throw new InvalidApiKeyError(verificationResult.error?.message);
        }
        return null;
    }

    // Get session using the verified API key
    const session = await auth.api.getSession({
        headers: {
            "x-api-key": apiKey,
        },
    });

    return session;
}

/**
 * Authenticate using session cookies
 */
async function authenticateWithSession(
    permissions: Record<string, string[]> | undefined,
    behavior: AuthBehavior
): Promise<Session | null> {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({
        headers: requestHeaders,
    });

    // Check if session exists
    if (!session) {
        if (behavior === "error") {
            throw new UnauthenticatedError();
        }
        return null;
    }

    // Check permissions if required
    if (permissions) {
        const hasRequiredPermissions = await verifyPermissions(requestHeaders, permissions);

        if (!hasRequiredPermissions) {
            if (behavior === "error") {
                throw new InsufficientPermissionsError();
            }
            return null;
        }
    }

    return session;
}

/**
 * Verify that the session has the required permissions
 */
async function verifyPermissions(
    requestHeaders: Awaited<ReturnType<typeof headers>>,
    permissions: Record<string, string[]>
): Promise<boolean> {
    const permissionsResult = await auth.api.hasPermission({
        headers: requestHeaders,
        body: {
            permissions
        },
    });

    return permissionsResult.success;
}