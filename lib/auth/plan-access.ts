export const CreemPlans = ["free", "starter", "pro", "enterprise"] as const;
export type CreemPlan = typeof CreemPlans[number];

export interface CreemFeature {
    basicLinks: boolean;
    advancedAnalytics: boolean;
    apiKeys: boolean;
    customDomain: boolean;
    teamManagement: boolean;
    countryHeatmap: boolean;
}

export interface FeatureEvaluationResult {
    allowed: boolean;
    limit: number | boolean;
    current?: number;
    message?: string;
}

export const CREEM_FEATURE_PLANS: Record<CreemPlan, CreemFeature> = {
    free: {
        basicLinks: true,
        advancedAnalytics: false,
        apiKeys: false,
        customDomain: false,
        teamManagement: false,
        countryHeatmap: true,
    },
    starter: {
        basicLinks: true,
        advancedAnalytics: true,
        apiKeys: true,
        customDomain: false,
        teamManagement: false,
        countryHeatmap: true,
    },
    pro: {
        basicLinks: true,
        advancedAnalytics: true,
        apiKeys: true,
        customDomain: true,
        teamManagement: true,
        countryHeatmap: true,
    },
    enterprise: {
        basicLinks: true,
        advancedAnalytics: true,
        apiKeys: true,
        customDomain: true,
        teamManagement: true,
        countryHeatmap: true,
    },
};
