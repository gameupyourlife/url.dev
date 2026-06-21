import { NextResponse } from "next/server";
import {
    FeatureFlagDisabledError,
    InsufficientPermissionsError,
    InvalidApiKeyError,
    UnauthenticatedError,
} from "@/lib/auth/guards";

export function jsonError(message: string, status = 400) {
    return NextResponse.json({ error: message }, { status });
}

export function mapErrorToStatus(error: unknown): number {
    if (
        error instanceof UnauthenticatedError ||
        error instanceof InvalidApiKeyError
    ) {
        return 401;
    }

    if (error instanceof InsufficientPermissionsError) {
        return 403;
    }

    if (error instanceof FeatureFlagDisabledError) {
        return 403;
    }

    return 500;
}

export function handleApiError(error: unknown, fallbackMessage = "Internal error") {
    const status = mapErrorToStatus(error);
    const message = error instanceof Error ? error.message : fallbackMessage;
    return NextResponse.json({ error: message }, { status });
}

export async function safeJson<T>(req: Request): Promise<T | null> {
    try {
        return (await req.json()) as T;
    } catch {
        return null;
    }
}

export function extractApiKey(req: Request): string | undefined {
    const xApiKey = req.headers.get("x-api-key")?.trim();
    if (xApiKey) return xApiKey;

    const authorization = req.headers.get("authorization")?.trim();
    if (!authorization) return undefined;

    const [scheme, token] = authorization.split(" ");
    if (scheme?.toLowerCase() === "bearer" && token) {
        return token.trim();
    }

    return undefined;
}
