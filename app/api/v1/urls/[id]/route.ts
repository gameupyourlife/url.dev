import { NextResponse } from "next/server";
import { deleteShortUrl, getShortUrlById, getShortUrlByIdWithAnalytics, updateShortUrl } from "@/app/actions/short-urls";
import { extractApiKey, handleApiError, jsonError, safeJson } from "@/app/api/v1/_utils";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const url = new URL(req.url);
        const apiKey = extractApiKey(req);
        const includeAnalytics = url.searchParams.get("includeAnalytics") === "true";

        const result = includeAnalytics
            ? await getShortUrlByIdWithAnalytics(id, { apiKey })
            : await getShortUrlById(id, { apiKey });

        if (!result) {
            return jsonError("Short URL not found", 404);
        }

        return NextResponse.json(result);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(req: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const apiKey = extractApiKey(req);
        const body = await safeJson<{ url?: string; slug?: string; title?: string; isActive?: boolean }>(req);
        if (!body) {
            return jsonError("Invalid JSON body", 400);
        }

        const updated = await updateShortUrl(id, body, { apiKey });
        if (!updated) {
            return jsonError("Short URL not found", 404);
        }

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const apiKey = extractApiKey(_req);
        await deleteShortUrl(id, { apiKey });
        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
