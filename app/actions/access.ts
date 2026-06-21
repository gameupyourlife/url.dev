"use server";

import {
    FeatureFlagDisabledError,
    InsufficientPlanAccessError,
    UnauthenticatedError,
    type AuthOptions,
    isAuthenticated,
} from "@/lib/auth/guards";

export interface CheckFeatureAccessInput {
    featureFlags?: AuthOptions["featureFlags"];
    planAccess?: AuthOptions["planAccess"];
}

export interface CheckFeatureAccessResult {
    allowed: boolean;
    reason?: "unauthenticated" | "feature_flags_disabled" | "insufficient_plan_access";
}

export async function checkFeatureAccess(
    input: CheckFeatureAccessInput = {}
): Promise<CheckFeatureAccessResult> {
    try {
        await isAuthenticated({
            behavior: "error",
            featureFlags: input.featureFlags,
            planAccess: input.planAccess,
        });

        return { allowed: true };
    } catch (error) {
        if (error instanceof UnauthenticatedError) {
            return { allowed: false, reason: "unauthenticated" };
        }

        if (error instanceof FeatureFlagDisabledError) {
            return { allowed: false, reason: "feature_flags_disabled" };
        }

        if (error instanceof InsufficientPlanAccessError) {
            return { allowed: false, reason: "insufficient_plan_access" };
        }

        throw error;
    }
}
