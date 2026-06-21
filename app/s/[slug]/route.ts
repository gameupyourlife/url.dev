import { after, NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shortUrl, click } from "@/lib/db/schema";
import { and, eq, lt, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { timingSafeEqual } from "node:crypto";
import {
    extractAnalyticsDataWithCountry,
    parseReferer,
} from "@/lib/analytics";
import { resolveRedirectForCountry } from "@/lib/redirects";
import { ShortUrl } from "@/lib/db/types";

type AccessErrorReason =
    | "not-found"
    | "inactive"
    | "expired"
    | "limit"
    | "password-required"
    | "password-invalid";

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
            return accessError(req, slug, "not-found", "URL not found", 404);
        }

        const blockedResponse = getAccessRestrictionResponse(req, slug, url);
        if (blockedResponse) {
            return blockedResponse;
        }

        // Reserve click slot atomically so click limits remain correct under load.
        const reserved = await reserveClickSlot(url);
        if (!reserved) {
            return accessError(req, slug, "limit", "This URL has reached its maximum click limit", 410);
        }

        const requestCountry = getRequestCountryCode(req);

        // Resolve country-specific redirect target (if configured in metadata)
        const { target: resolvedTarget, matchedRule } = resolveRedirectForCountry(url.originalUrl, url.metadata, requestCountry);

        const searchParams = new URLSearchParams(req.nextUrl.searchParams);
        searchParams.delete("password");

        // Add utm parameters to the resolved target if they exist
        url.utmCampaign && searchParams.set("utm_campaign", url.utmCampaign);
        url.utmSource && searchParams.set("utm_source", url.utmSource);
        url.utmMedium && searchParams.set("utm_medium", url.utmMedium);
        url.utmContent && searchParams.set("utm_content", url.utmContent);
        url.utmTerm && searchParams.set("utm_term", url.utmTerm);

        // If a relative path was configured, resolve it against the original URL
        const redirectTarget = resolvedTarget.startsWith("/") ? new URL(resolvedTarget, url.originalUrl).toString() : resolvedTarget;

        if (matchedRule) {
            console.log(`Country redirect applied for slug=${slug} country=${requestCountry} => target=${redirectTarget}`);
        }

        after(async () => {
            try {
                await collectUrlAnalytics(req, slug, url.id);
            } catch (error) {
                console.error(`Analytics collection failed for slug=${slug}:`, error);
            }
        });

        const urlObj = new URL(redirectTarget);
        urlObj.search = searchParams.toString();

        return NextResponse.redirect(urlObj, 302);
    } catch (error) {
        console.error("Error redirecting URL:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

function isHtmlRequest(req: NextRequest) {
    const accept = req.headers.get("accept") || "";
    return accept.includes("text/html");
}

function accessPageUrl(req: NextRequest, slug: string, reason: AccessErrorReason) {
    const url = req.nextUrl.clone();
    url.pathname = `/s/${encodeURIComponent(slug)}/access`;
    url.search = "";
    url.searchParams.set("reason", reason);
    return url;
}

function accessError(
    req: NextRequest,
    slug: string,
    reason: AccessErrorReason,
    message: string,
    status: number,
) {
    if (isHtmlRequest(req)) {
        return NextResponse.redirect(accessPageUrl(req, slug, reason), 302);
    }

    return NextResponse.json({ error: message }, { status });
}

function getRequestPassword(req: NextRequest) {
    return req.nextUrl.searchParams.get("password") || req.headers.get("x-url-password") || undefined;
}

function getRequestCountryCode(req: NextRequest) {
    const candidate = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || req.headers.get("x-country-code");

    if (!candidate) {
        return undefined;
    }

    const normalized = candidate.trim().toUpperCase();
    return /^[A-Z]{2}$/.test(normalized) ? normalized : undefined;
}

function passwordsMatch(expected: string, actual: string) {
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(actual);

    if (expectedBuffer.length !== actualBuffer.length) {
        return false;
    }

    return timingSafeEqual(expectedBuffer, actualBuffer);
}

function getAccessRestrictionResponse(req: NextRequest, slug: string, url: ShortUrl) {
    if (!url.isActive) {
        return accessError(req, slug, "inactive", "This URL has been deactivated", 410);
    }

    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
        return accessError(req, slug, "expired", "This URL has expired", 410);
    }

    if (typeof url.maxClicks === "number" && url.clickCount >= url.maxClicks) {
        return accessError(req, slug, "limit", "This URL has reached its maximum click limit", 410);
    }

    if (url.password) {
        const suppliedPassword = getRequestPassword(req);
        if (!suppliedPassword) {
            return accessError(req, slug, "password-required", "Password required", 401);
        }

        if (!passwordsMatch(url.password, suppliedPassword)) {
            return accessError(req, slug, "password-invalid", "Password invalid", 401);
        }
    }

    return null;
}

async function reserveClickSlot(url: ShortUrl) {
    const maxClickUpdateWhere = typeof url.maxClicks === "number"
        ? and(eq(shortUrl.id, url.id), lt(shortUrl.clickCount, url.maxClicks))
        : eq(shortUrl.id, url.id);

    const updatedRows = await db
        .update(shortUrl)
        .set({
            clickCount: sql`${shortUrl.clickCount} + 1`,
            lastClickedAt: new Date(),
        })
        .where(maxClickUpdateWhere)
        .returning({ id: shortUrl.id });

    return updatedRows.length > 0;
}

async function collectUrlAnalytics(req: NextRequest, slug: string, shortUrlId: string) {
    const analytics = await extractAnalyticsDataWithCountry(req, slug);
    const refererInfo = parseReferer(analytics.referer);
    const urlObj = new URL(req.url);

    // Extract UTM parameters from URL
    const utmSource = urlObj.searchParams.get("utm_source");
    const utmMedium = urlObj.searchParams.get("utm_medium");
    const utmCampaign = urlObj.searchParams.get("utm_campaign");

    // Insert analytics as a best-effort background operation.
    await db.insert(click).values({
        id: nanoid(),
        shortUrlId,

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
}

