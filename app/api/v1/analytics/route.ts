import { NextResponse } from "next/server";
import {
    exportClicksCsv,
    getBrowserBreakdown,
    getClicksPaginated,
    getDailyClicks,
    getDeviceBreakdown,
    getDeviceDiversity,
    getOverviewMetrics,
    getTopCountries,
    getTopCountry,
    getTopReferrers,
    getTopUrls,
    getTotalClicks,
    getUniqueVisitors,
} from "@/app/actions/analytics";
import { extractApiKey, handleApiError, jsonError } from "@/app/api/v1/_utils";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const apiKey = extractApiKey(req);
        const type = url.searchParams.get("type") || "overview";

        switch (type) {
            case "overview": {
                const res = await getOverviewMetrics({ apiKey });
                return NextResponse.json(res);
            }
            case "daily": {
                const urlId = url.searchParams.get("urlId") || undefined;
                const daysParam = Number(url.searchParams.get("days") || "30");
                const res = await getDailyClicks({ urlId, days: daysParam, apiKey });
                return NextResponse.json(res);
            }
            case "topUrls": {
                const limit = Number(url.searchParams.get("limit") || "10");
                const res = await getTopUrls({ limit, apiKey });
                return NextResponse.json(res);
            }
            case "topCountries": {
                const limit = Number(url.searchParams.get("limit") || "10");
                const urlId = url.searchParams.get("urlId") || undefined;
                const res = await getTopCountries({ urlId, limit, apiKey });
                return NextResponse.json(res);
            }
            case "referrers": {
                const limit = Number(url.searchParams.get("limit") || "10");
                const urlId = url.searchParams.get("urlId") || undefined;
                const res = await getTopReferrers({ urlId, limit, apiKey });
                return NextResponse.json(res);
            }
            case "devices": {
                const limit = Number(url.searchParams.get("limit") || "20");
                const urlId = url.searchParams.get("urlId") || undefined;
                const res = await getDeviceBreakdown({ urlId, limit, apiKey });
                return NextResponse.json(res);
            }
            case "browsers": {
                const limit = Number(url.searchParams.get("limit") || "20");
                const urlId = url.searchParams.get("urlId") || undefined;
                const res = await getBrowserBreakdown({ urlId, limit, apiKey });
                return NextResponse.json(res);
            }
            case "totalClicks": {
                const urlId = url.searchParams.get("urlId");
                if (!urlId) return jsonError("urlId is required", 400);
                const res = await getTotalClicks({ urlId, apiKey });
                return NextResponse.json({ totalClicks: res });
            }
            case "uniqueVisitors": {
                const urlId = url.searchParams.get("urlId");
                if (!urlId) return jsonError("urlId is required", 400);
                const res = await getUniqueVisitors({ urlId, apiKey });
                return NextResponse.json({ uniqueVisitors: res });
            }
            case "topCountry": {
                const urlId = url.searchParams.get("urlId");
                if (!urlId) return jsonError("urlId is required", 400);
                const res = await getTopCountry({ urlId, apiKey });
                return NextResponse.json({ topCountry: res });
            }
            case "deviceDiversity": {
                const urlId = url.searchParams.get("urlId");
                if (!urlId) return jsonError("urlId is required", 400);
                const res = await getDeviceDiversity({ urlId, apiKey });
                return NextResponse.json({ deviceDiversity: res });
            }
            case "clicks": {
                const page = Number(url.searchParams.get("page") || "1");
                const pageSize = Number(url.searchParams.get("pageSize") || "50");
                const urlId = url.searchParams.get("urlId") || undefined;
                const startDate = url.searchParams.get("startDate") ? new Date(url.searchParams.get("startDate") as string) : undefined;
                const endDate = url.searchParams.get("endDate") ? new Date(url.searchParams.get("endDate") as string) : undefined;
                const country = url.searchParams.get("country") || undefined;
                const device = url.searchParams.get("device") || undefined;

                const res = await getClicksPaginated({ urlId, page, pageSize, startDate, endDate, country, device, apiKey });
                return NextResponse.json(res);
            }
            case "exportClicks": {
                const urlId = url.searchParams.get("urlId") || undefined;
                const startDate = url.searchParams.get("startDate") ? new Date(url.searchParams.get("startDate") as string) : undefined;
                const endDate = url.searchParams.get("endDate") ? new Date(url.searchParams.get("endDate") as string) : undefined;
                const country = url.searchParams.get("country") || undefined;
                const device = url.searchParams.get("device") || undefined;

                const csv = await exportClicksCsv({ urlId, startDate, endDate, country, device, apiKey });
                return new NextResponse(csv, {
                    headers: {
                        "Content-Type": "text/csv",
                        "Content-Disposition": `attachment; filename="clicks-${urlId || "all"}.csv"`,
                    },
                });
            }
            default: {
                return NextResponse.json({ error: "Unknown analytics type" }, { status: 400 });
            }
        }
    } catch (error) {
        return handleApiError(error);
    }
}
