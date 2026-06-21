import { NextResponse } from "next/server";
import { exportClicksCsv, getClicksPaginated } from "@/app/actions/analytics";
import { extractApiKey, handleApiError } from "@/app/api/v1/_utils";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const url = new URL(req.url);
        const apiKey = extractApiKey(req);
        const format = (url.searchParams.get("format") || "json").toLowerCase();

        const startDate = url.searchParams.get("startDate")
            ? new Date(url.searchParams.get("startDate") as string)
            : undefined;
        const endDate = url.searchParams.get("endDate")
            ? new Date(url.searchParams.get("endDate") as string)
            : undefined;
        const country = url.searchParams.get("country") || undefined;
        const device = url.searchParams.get("device") || undefined;

        if (format === "csv") {
            const limit = Number(url.searchParams.get("limit") || "10000");
            const csv = await exportClicksCsv({
                urlId: id,
                startDate,
                endDate,
                country,
                device,
                limit,
                apiKey,
            });

            return new NextResponse(csv, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="clicks-${id}.csv"`,
                },
            });
        }

        const page = Number(url.searchParams.get("page") || "1");
        const pageSize = Number(url.searchParams.get("pageSize") || "50");
        const result = await getClicksPaginated({
            urlId: id,
            page,
            pageSize,
            startDate,
            endDate,
            country,
            device,
            apiKey,
        });

        return NextResponse.json(result);
    } catch (error) {
        return handleApiError(error);
    }
}
