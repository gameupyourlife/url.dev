import { headers } from "next/headers";
import { auth, Session } from "../auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CREEM_FEATURE_PLANS, CreemFeature, CreemPlan, CreemPlans } from "./plan-access";
import { checkSubscriptionAccess } from "@creem_io/better-auth";

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

/**
 * Custom error thrown when one or more required feature flags are disabled
 */
export class FeatureFlagDisabledError extends Error {
    constructor(message = "One or more required feature flags are disabled") {
        super(message);
        this.name = "FeatureFlagDisabledError";
    }
}

/**
 * Custom error thrown when user lacks required subscription plan access
 */
export class InsufficientPlanAccessError extends Error {
    constructor(message = "User does not have the required subscription plan access") {
        super(message);
        this.name = "InsufficientPlanAccessError";
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

    /**
     * Feature flags that must be enabled in environment variables.
     *
     * A feature named `advancedAnalytics` checks in this order:
     * 1) `FEATURE_ADVANCED_ANALYTICS`
     * 2) `NEXT_PUBLIC_FEATURE_ADVANCED_ANALYTICS`
     * 3) `ADVANCED_ANALYTICS`
     */
    featureFlags?: string[];

    /**
     * Optional Creem subscription requirements.
     *
     * - `productIds`: allow-list of Creem product IDs.
     * - `features`: logical features mapped to plans via env vars.
     * - `allowNoSubscription`: set true to skip failure when no active subscription exists.
     */
    planAccess?: {
        productIds?: string[];
        features?: (keyof CreemFeature)[];
        allowNoSubscription?: boolean;
    };
}

const ACTIVE_CREEM_STATUSES = ["active", "trialing", "paid"] as const;

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
    const { behavior = "null", apiKey, permissions, featureFlags, planAccess } = options;

    // API Key Authentication Flow
    if (apiKey) {
        const session = await authenticateWithApiKey(apiKey, permissions, featureFlags, planAccess, behavior);
        if (!session && behavior === "redirect") {
            redirect("/signin");
        }
        return session;
    }

    // Session Cookie Authentication Flow
    const session = await authenticateWithSession(permissions, featureFlags, planAccess, behavior);
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
    featureFlags: string[] | undefined,
    planAccess: AuthOptions["planAccess"],
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

    if (!session) {
        if (behavior === "error") {
            throw new UnauthenticatedError();
        }
        return null;
    }

    const hasFeatureFlags = verifyFeatureFlags(featureFlags);
    if (!hasFeatureFlags) {
        if (behavior === "error") {
            throw new FeatureFlagDisabledError();
        }
        return null;
    }

    if (planAccess) {
        const hasPlanAccess = await verifyPlanAccess(session, planAccess);
        if (!hasPlanAccess) {
            if (behavior === "error") {
                throw new InsufficientPlanAccessError();
            }
            return null;
        }
    }

    return session;
}

/**
 * Authenticate using session cookies
 */
async function authenticateWithSession(
    permissions: Record<string, string[]> | undefined,
    featureFlags: string[] | undefined,
    planAccess: AuthOptions["planAccess"],
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
    if (permissions && session.session.activeOrganizationId) {
        const hasRequiredPermissions = await verifyPermissions(requestHeaders, permissions);

        if (!hasRequiredPermissions) {
            if (behavior === "error") {
                throw new InsufficientPermissionsError();
            }
            return null;
        }
    }

    const hasFeatureFlags = verifyFeatureFlags(featureFlags);
    if (!hasFeatureFlags) {
        if (behavior === "error") {
            throw new FeatureFlagDisabledError();
        }
        return null;
    }

    if (planAccess) {
        const hasPlanAccess = await verifyPlanAccess(session, planAccess);
        if (!hasPlanAccess) {
            if (behavior === "error") {
                throw new InsufficientPlanAccessError();
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

/**
 * Resolve an environment feature flag and parse its boolean value.
 */
function getFeatureFlagValue(feature: string): boolean {
    const normalizedFeatureName = feature
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .replace(/[^A-Za-z0-9]+/g, "_")
        .toUpperCase();

    const candidates = [
        `FEATURE_${normalizedFeatureName}`,
        `NEXT_PUBLIC_FEATURE_${normalizedFeatureName}`,
        normalizedFeatureName,
    ];

    for (const key of candidates) {
        const rawValue = process.env[key];
        if (rawValue == null) {
            continue;
        }

        if (/^(1|true|yes|on)$/i.test(rawValue)) {
            return true;
        }

        if (/^(0|false|no|off)$/i.test(rawValue)) {
            return false;
        }
    }

    return false;
}

/**
 * Verify required feature flags.
 */
function verifyFeatureFlags(featureFlags: string[] | undefined): boolean {
    if (!featureFlags || featureFlags.length === 0) {
        return true;
    }

    return featureFlags.every((feature) => getFeatureFlagValue(feature));
}

function resolvePlanByProductId(productId: string): CreemPlan {

    // Loop over every CreemPlan slug and check for a matching environment variable with the provided productId
    CreemPlans.forEach((plan: CreemPlan) => {
        const envVarName = `CREEM_PRODUCT_${plan.toUpperCase()}`;
        if (process.env[envVarName] === productId) {
            return plan as CreemPlan;
        } else if (process.env[envVarName] === undefined) {
            console.warn(`Environment variable ${envVarName} is not set. Please set it to the corresponding Creem product ID for the ${plan} plan.`);
        }
    });

    return "free";
}

/**
 * Verify Creem-based plan access using persisted `creem_subscription` data.
 */
async function verifyPlanAccess(
    session: Session,
    planAccess: NonNullable<AuthOptions["planAccess"]>
): Promise<boolean> {
    const referenceIds = [
        session.session.activeOrganizationId,
        session.user.id,
    ].filter((value): value is string => Boolean(value));

    if (referenceIds.length === 0) {
        return false;
    }

    const now = new Date();

    const subscription = await db.query.creem_subscription.findFirst({
        where: (creemSubscription, { and, gte, inArray, isNull, or }) =>
            and(
                inArray(creemSubscription.referenceId, referenceIds),
                inArray(creemSubscription.status, [...ACTIVE_CREEM_STATUSES]),
                or(isNull(creemSubscription.periodEnd), gte(creemSubscription.periodEnd, now))
            ),
        orderBy: (creemSubscription, { desc }) => [desc(creemSubscription.periodEnd)],
    });

    if (!subscription) {
        return planAccess.allowNoSubscription === true;
    }

    const requiredProductIds = planAccess.productIds ?? [];
    if (requiredProductIds.length > 0 && !requiredProductIds.includes(subscription.productId)) {
        return false;
    }

    const requiredFeatures = planAccess.features ?? [];
    if (requiredFeatures.length === 0) {
        return true;
    }

    const matchedPlan = resolvePlanByProductId(subscription.productId);
    if (!matchedPlan) {
        return false;
    }

    return requiredFeatures.every((feature) => {
        const featurePlanAccess = CREEM_FEATURE_PLANS[matchedPlan][feature];
        return featurePlanAccess === true;
    });
}