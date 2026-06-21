import { NextResponse } from "next/server";
import { getShortUrls, getShortUrlsPaginated, upsertShortUrl } from "@/app/actions/short-urls";
import { extractApiKey, handleApiError, jsonError, safeJson } from "@/app/api/v1/_utils";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const apiKey = extractApiKey(req);
        const view = url.searchParams.get("view") || "paginated";

        if (view === "all") {
            const all = await getShortUrls({ apiKey });
            return NextResponse.json(all);
        }

        const page = Number(url.searchParams.get("page") || "1");
        const pageSize = Number(url.searchParams.get("pageSize") || "25");
        const search = url.searchParams.get("search") || undefined;
        const sortBy = url.searchParams.get("sortBy") || "createdAt";
        const sortDir = (url.searchParams.get("sortDir") as "asc" | "desc") || "desc";
        const isActiveParam = url.searchParams.get("isActive");
        const isActive = isActiveParam === null ? undefined : isActiveParam === "true";

        const res = await getShortUrlsPaginated({ page, pageSize, search, sortBy, sortDir, isActive, apiKey });
        return NextResponse.json(res);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(req: Request) {
    try {
        const apiKey = extractApiKey(req);
        const body = await safeJson<Record<string, unknown>>(req);
        if (!body) {
            return jsonError("Invalid JSON body", 400);
        }

        const created = await upsertShortUrl(body as any, { apiKey });
        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
