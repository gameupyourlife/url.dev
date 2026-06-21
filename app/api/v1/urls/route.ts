import { NextResponse } from "next/server";
import { getShortUrlsPaginated } from "@/app/actions/short-urls";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const page = Number(url.searchParams.get("page") || "1");
        const pageSize = Number(url.searchParams.get("pageSize") || "25");
        const search = url.searchParams.get("search") || undefined;
        const sortBy = url.searchParams.get("sortBy") || "createdAt";
        const sortDir = (url.searchParams.get("sortDir") as "asc" | "desc") || "desc";
        const isActiveParam = url.searchParams.get("isActive");
        const isActive = isActiveParam === null ? undefined : isActiveParam === "true";

        const res = await getShortUrlsPaginated({ page, pageSize, search, sortBy, sortDir, isActive });
        return NextResponse.json(res);
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
    }
}
