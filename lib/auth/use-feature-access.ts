"use client";

import { useEffect, useMemo, useState } from "react";
import {
    checkFeatureAccess,
    type CheckFeatureAccessInput,
    type CheckFeatureAccessResult,
} from "@/app/actions/access";

interface UseFeatureAccessOptions {
    enabled?: boolean;
}

interface UseFeatureAccessResult extends CheckFeatureAccessResult {
    isLoading: boolean;
    refresh: () => Promise<void>;
}

export function useFeatureAccess(
    input: CheckFeatureAccessInput,
    options: UseFeatureAccessOptions = {}
): UseFeatureAccessResult {
    const { enabled = true } = options;
    const [result, setResult] = useState<CheckFeatureAccessResult>({ allowed: false });
    const [isLoading, setIsLoading] = useState<boolean>(enabled);

    const stableInput = useMemo(
        () => ({
            featureFlags: input.featureFlags ?? [],
            planAccess: input.planAccess,
        }),
        [JSON.stringify(input)]
    );

    const runCheck = async () => {
        if (!enabled) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const nextResult = await checkFeatureAccess(stableInput);
            setResult(nextResult);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const run = async () => {
            if (!enabled) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const nextResult = await checkFeatureAccess(stableInput);
                if (isMounted) {
                    setResult(nextResult);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        run();

        return () => {
            isMounted = false;
        };
    }, [enabled, stableInput]);

    return {
        ...result,
        isLoading,
        refresh: runCheck,
    };
}
