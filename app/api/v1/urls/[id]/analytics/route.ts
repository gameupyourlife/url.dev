import { NextResponse } from "next/server";
import {
    getBrowserBreakdown,
    getDailyClicks,
    getDeviceBreakdown,
    getDeviceDiversity,
    getTopCountries,
    getTopCountry,
    getTopReferrers,
    getTotalClicks,
    getUniqueVisitors,
} from "@/app/actions/analytics";
import { extractApiKey, handleApiError } from "@/app/api/v1/_utils";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const url = new URL(req.url);
        const apiKey = extractApiKey(req);
        const days = Number(url.searchParams.get("days") || "30");
        const topLimit = Number(url.searchParams.get("topLimit") || "10");

        const [
            totalClicks,
            uniqueVisitors,
            topCountry,
            deviceDiversity,
            daily,
            topCountries,
            referrers,
            devices,
            browsers,
        ] = await Promise.all([
            getTotalClicks({ urlId: id, apiKey }),
            getUniqueVisitors({ urlId: id, apiKey }),
            getTopCountry({ urlId: id, apiKey }),
            getDeviceDiversity({ urlId: id, apiKey }),
            getDailyClicks({ urlId: id, days, apiKey }),
            getTopCountries({ urlId: id, limit: topLimit, apiKey }),
            getTopReferrers({ urlId: id, limit: topLimit, apiKey }),
            getDeviceBreakdown({ urlId: id, limit: topLimit, apiKey }),
            getBrowserBreakdown({ urlId: id, limit: topLimit, apiKey }),
        ]);

        return NextResponse.json({
            urlId: id,
            summary: {
                totalClicks,
                uniqueVisitors,
                topCountry,
                deviceDiversity,
            },
            charts: {
                daily,
                topCountries,
                referrers,
                devices,
                browsers,
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}
