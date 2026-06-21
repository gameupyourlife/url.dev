import { NextResponse } from "next/server";
import { toggleShortUrlActiveState } from "@/app/actions/short-urls";
import { extractApiKey, handleApiError, jsonError } from "@/app/api/v1/_utils";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(_req: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const apiKey = extractApiKey(_req);
        const updated = await toggleShortUrlActiveState(id, { apiKey });
        if (!updated) {
            return jsonError("Short URL not found", 404);
        }

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}
