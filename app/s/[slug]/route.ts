import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shortUrl, click } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
    extractAnalyticsDataWithCountry,
    parseReferer,
    getDeviceCategory,
} from "@/lib/analytics";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Find the URL by slug
        const url = await db.query.shortUrl.findFirst({
            where: eq(shortUrl.slug, slug),
        });

        if (!url) {
            return NextResponse.json(
                { error: "URL not found" },
                { status: 404 }
            );
        }

        // Check if URL is active
        if (!url.isActive) {
            return NextResponse.json(
                { error: "This URL has been deactivated" },
                { status: 410 }
            );
        }

        // Check if URL has expired
        if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
            return NextResponse.json(
                { error: "This URL has expired" },
                { status: 410 }
            );
        }

        // Check if max clicks reached
        if (url.maxClicks && url.clickCount >= url.maxClicks) {
            return NextResponse.json(
                { error: "This URL has reached its maximum click limit" },
                { status: 410 }
            );
        }

        // Extract comprehensive analytics data with country lookup
        const analytics = await extractAnalyticsDataWithCountry(req, slug);
        const refererInfo = parseReferer(analytics.referer);
        const urlObj = new URL(req.url);

        // Extract UTM parameters from URL
        const utmSource = urlObj.searchParams.get("utm_source");
        const utmMedium = urlObj.searchParams.get("utm_medium");
        const utmCampaign = urlObj.searchParams.get("utm_campaign");

        // Record analytics and increment click count atomically using a transaction
        await db.transaction(async (tx) => {
            // Insert comprehensive analytics record
            await tx.insert(click).values({
                id: nanoid(),
                shortUrlId: url.id,
                shortCode: slug,

                // Request info
                ipAddress: analytics.ip !== "unknown" ? analytics.ip : null,
                userAgent: analytics.userAgent !== "unknown" ? analytics.userAgent : null,
                referer: analytics.referer !== "direct" ? analytics.referer : null,
                host: analytics.host !== "unknown" ? analytics.host : null,

                // Device info
                deviceType: analytics.device.type !== "unknown" ? analytics.device.type : null,
                deviceVendor: analytics.device.vendor !== "unknown" ? analytics.device.vendor : null,
                deviceModel: analytics.device.model !== "unknown" ? analytics.device.model : null,

                // Browser info
                browserName: analytics.browser.name !== "unknown" ? analytics.browser.name : null,
                browserVersion: analytics.browser.version !== "unknown" ? analytics.browser.version : null,

                // OS info
                osName: analytics.os.name !== "unknown" ? analytics.os.name : null,
                osVersion: analytics.os.version !== "unknown" ? analytics.os.version : null,

                // Engine info
                engineName: analytics.engine.name !== "unknown" ? analytics.engine.name : null,
                engineVersion: analytics.engine.version !== "unknown" ? analytics.engine.version : null,

                // CPU info
                cpuArchitecture: analytics.cpu.architecture !== "unknown" ? analytics.cpu.architecture : null,

                // Location info
                countryCode: analytics.country?.code || null,
                countryName: analytics.country?.name || null,
                cfCountry: analytics.cfCountry !== "unknown" ? analytics.cfCountry : null,
                cfRay: analytics.cfRay !== "unknown" ? analytics.cfRay : null,

                // Additional headers
                acceptLanguage: analytics.acceptLanguage !== "unknown" ? analytics.acceptLanguage : null,
                acceptEncoding: analytics.acceptEncoding !== "unknown" ? analytics.acceptEncoding : null,
                dnt: analytics.dnt !== "not-set" ? analytics.dnt : null,

                // Analytics flags
                isBot: analytics.isBot,

                // URL search parameters
                searchParams: Object.keys(analytics.searchParams).length > 0
                    ? JSON.stringify(analytics.searchParams)
                    : null,

                // Referer analysis
                refererDomain: refererInfo.domain !== "direct" && refererInfo.domain !== "unknown"
                    ? refererInfo.domain
                    : null,
                refererType: refererInfo.type !== "unknown" ? refererInfo.type : null,
                refererSource: refererInfo.source !== "direct" && refererInfo.source !== "unknown"
                    ? refererInfo.source
                    : null,

                // UTM parameters
                utmSource: utmSource || null,
                utmMedium: utmMedium || null,
                utmCampaign: utmCampaign || null,
            });

            // Increment click count and update last clicked timestamp
            await tx
                .update(shortUrl)
                .set({
                    clickCount: url.clickCount + 1,
                    lastClickedAt: new Date(),
                })
                .where(eq(shortUrl.id, url.id));
        });

        // Redirect to original URL
        return NextResponse.redirect(url.originalUrl, 307);
    } catch (error) {
        console.error("Error redirecting URL:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
