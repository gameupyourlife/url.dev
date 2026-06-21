import { NextResponse } from "next/server";
import { getOverviewMetrics, getDailyClicks, getTopUrls, getTopCountries, getClicksPaginated, getTopReferrers, getDeviceBreakdown, getBrowserBreakdown, exportClicksCsv } from "@/app/actions/analytics";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const type = url.searchParams.get("type") || "overview";

        switch (type) {
            case "overview": {
                const res = await getOverviewMetrics();
                return NextResponse.json(res);
            }
            case "daily": {
                const urlId = url.searchParams.get("urlId") || undefined;
                const daysParam = Number(url.searchParams.get("days") || "30");
                const res = await getDailyClicks({ urlId, days: daysParam });
                return NextResponse.json(res);
            }
            case "topUrls": {
                const limit = Number(url.searchParams.get("limit") || "10");
                const res = await getTopUrls({ limit });
                return NextResponse.json(res);
            }
            case "topCountries": {
                const limit = Number(url.searchParams.get("limit") || "10");
                const urlId = url.searchParams.get("urlId") || undefined;
                const res = await getTopCountries({ urlId, limit });
                return NextResponse.json(res);
            }
            case "referrers": {
                const limit = Number(url.searchParams.get("limit") || "10");
                const urlId = url.searchParams.get("urlId") || undefined;
                const res = await getTopReferrers({ urlId, limit });
                return NextResponse.json(res);
            }
            case "devices": {
                const limit = Number(url.searchParams.get("limit") || "20");
                const urlId = url.searchParams.get("urlId") || undefined;
                const res = await getDeviceBreakdown({ urlId, limit });
                return NextResponse.json(res);
            }
            case "browsers": {
                const limit = Number(url.searchParams.get("limit") || "20");
                const urlId = url.searchParams.get("urlId") || undefined;
                const res = await getBrowserBreakdown({ urlId, limit });
                return NextResponse.json(res);
            }
            case "clicks": {
                const page = Number(url.searchParams.get("page") || "1");
                const pageSize = Number(url.searchParams.get("pageSize") || "50");
                const urlId = url.searchParams.get("urlId") || undefined;
                const startDate = url.searchParams.get("startDate") ? new Date(url.searchParams.get("startDate") as string) : undefined;
                const endDate = url.searchParams.get("endDate") ? new Date(url.searchParams.get("endDate") as string) : undefined;
                const country = url.searchParams.get("country") || undefined;
                const device = url.searchParams.get("device") || undefined;

                const res = await getClicksPaginated({ urlId, page, pageSize, startDate, endDate, country, device });
                return NextResponse.json(res);
            }
            case "exportClicks": {
                const urlId = url.searchParams.get("urlId") || undefined;
                const startDate = url.searchParams.get("startDate") ? new Date(url.searchParams.get("startDate") as string) : undefined;
                const endDate = url.searchParams.get("endDate") ? new Date(url.searchParams.get("endDate") as string) : undefined;
                const country = url.searchParams.get("country") || undefined;
                const device = url.searchParams.get("device") || undefined;

                const csv = await exportClicksCsv({ urlId, startDate, endDate, country, device });
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
    } catch (err: any) {
        console.error("Analytics API error", err);
        return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
    }
}
