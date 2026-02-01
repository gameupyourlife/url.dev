"use server";
import { isAuthenticated } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { click, shortUrl } from "@/lib/db/schema";
import { NewShortUrl, ShortUrl, UrlWithAnalytics, UrlWithClicks } from "@/lib/db/types";
import { and, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function getShortUrls(): Promise<ShortUrl[]> {
    const session = await isAuthenticated({ behavior: "error", permissions: { shortUrl: ["read"] } });

    const results = await db.select().from(shortUrl).where(
        session.session.activeOrganizationId ?
            eq(shortUrl.organizationId, session.session.activeOrganizationId)
            :
            eq(shortUrl.userId, session.user.id
            )
    );

    return results;
}

export async function getShortUrlById(id: string): Promise<UrlWithClicks | null> {
    const session = await isAuthenticated({ behavior: "error", permissions: { shortUrl: ["read", "analytics"] } });

    const urlResult = await db.select().from(shortUrl).where(
        and(
            eq(shortUrl.id, id),
            session.session.activeOrganizationId ?
                eq(shortUrl.organizationId, session.session.activeOrganizationId)
                :
                eq(shortUrl.userId, session.user.id)
        ))
        .limit(1);

    const url = urlResult[0];

    if (!url) return null;

    const clicksResult = await db.select().from(click).where(eq(click.shortUrlId, url.id));

    const urlWithClicks: UrlWithClicks = {
        ...url,
        clicks: clicksResult,
    };


    return urlWithClicks || null;
}

export async function getShortUrlByIdWithAnalytics(id: string): Promise<UrlWithAnalytics | null> {
    const session = await isAuthenticated({ behavior: "error", permissions: { shortUrl: ["read", "analytics"] } });

    const urlResult = await db.select().from(shortUrl).where(
        and(
            eq(shortUrl.id, id),
            session.session.activeOrganizationId ?
                eq(shortUrl.organizationId, session.session.activeOrganizationId)
                :
                eq(shortUrl.userId, session.user.id)
        ))
        .limit(1);

    const url = urlResult[0];

    if (!url) return null;

    const clicksResult = await db.select().from(click).where(eq(click.shortUrlId, url.id));

    const urlWithClicks: UrlWithClicks = {
        ...url,
        clicks: clicksResult,
    };



    const analytics: UrlWithAnalytics["analytics"] = {
        totalClicks: clicksResult.length,
        uniqueClicks: new Set(clicksResult.map(c => c.ipAddress)).size,
        trafficType: {
            direct: clicksResult.filter(c => c.refererType === 'direct').length,
            social: clicksResult.filter(c => c.refererType === 'social').length,
            search: clicksResult.filter(c => c.refererType === 'search').length,
            website: clicksResult.filter(c => c.refererType === 'website').length,
        },
        deviceType: {
            desktop: clicksResult.filter(c => c.deviceType === 'desktop').length,
            mobile: clicksResult.filter(c => c.deviceType === 'mobile').length,
            tablet: clicksResult.filter(c => c.deviceType === 'tablet').length,
        },
        browserType: (() => {
            const counts = clicksResult.reduce((acc, c) => {
                const name = (c.browserName ?? 'other').toLowerCase();
                if (name.includes('chrome')) acc.chrome += 1;
                else if (name.includes('safari')) acc.safari += 1;
                else if (name.includes('firefox')) acc.firefox += 1;
                else if (name.includes('edge')) acc.edge += 1;
                else acc.other += 1;
                return acc;
            }, { chrome: 0, safari: 0, firefox: 0, edge: 0, other: 0 });
            return counts;
        })(),

        operatingSystem: (() => {
            const counts = clicksResult.reduce((acc, c) => {
                const name = (c.osName ?? 'other').toLowerCase();
                if (name.includes('windows')) acc.windows += 1;
                else if (name.includes('macos')) acc.macOS += 1;
                else if (name.includes('linux')) acc.linux += 1;
                else if (name.includes('android')) acc.android += 1;
                else if (name.includes('ios')) acc.iOS += 1;
                else acc.other += 1;
                return acc;
            }, { windows: 0, macOS: 0, linux: 0, android: 0, iOS: 0, other: 0 });
            return counts;
        })(),

        botTraffic: {
            bots: clicksResult.filter(c => c.isBot).length,
            nonBots: clicksResult.filter(c => !c.isBot).length,
        },
        clicksByCountry: Object.entries(clicksResult.reduce((acc, c) => {
            const country = c.countryName ?? 'Unknown';
            acc[country] = (acc[country] || 0) + 1;
            return acc;
        }, {} as { [country: string]: number })).map(([country, clicks]) => ({ country, clicks })),
        clicksByDate: Object.entries(clicksResult.reduce((acc, c) => {
            const date = c.clickedAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as { [date: string]: number })).map(([date, clicks]) => ({ date, clicks })),
        clicksByDateByDevice: Object.entries(clicksResult.reduce((acc, c) => {
            const date = c.clickedAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { desktop: 0, mobile: 0, tablet: 0, unknown: 0 };
            }
            //@ts-ignore
            acc[date][c.deviceType ?? 'unknown'] = (acc[date][c.deviceType ?? 'unknown'] || 0) + 1;
            return acc;
        }, {} as { [date: string]: { desktop: number; mobile: number; tablet: number; unknown: number } })).map(([date, counts]) => ({
            date,
            desktop: counts.desktop,
            mobile: counts.mobile,
            tablet: counts.tablet,
            unknown: counts.unknown,
        })),
        languageType: clicksResult.reduce((acc, c) => {
            acc[c.acceptLanguage ?? 'Unknown'] = (acc[c.acceptLanguage ?? 'Unknown'] || 0) + 1;
            return acc;
        }, {} as { [language: string]: number }),
    };

    const urlWithAnalytics: UrlWithAnalytics = {
        ...urlWithClicks,
        analytics,
    };

    return urlWithAnalytics || null;
}

export async function upsertShortUrl(url: (Omit<NewShortUrl, "id"> | ShortUrl)) {
    const session = await isAuthenticated({ behavior: "error", permissions: { shortUrl: ["write"] } });

    const result = await db.insert(shortUrl).values({
        ...url,
        id: 'id' in url ? url.id : nanoid(),
        userId: session.user.id,
        organizationId: session.session.activeOrganizationId || null,
    }).onConflictDoUpdate({
        target: shortUrl.id,
        set: {
            ...url,
            userId: session.user.id,
            organizationId: session.session.activeOrganizationId || null,
        },
    }).returning();

    return result[0];
}

export async function deleteShortUrl(id: string) {
    const session = await isAuthenticated({ behavior: "error", permissions: { shortUrl: ["delete"] } });

    await db.delete(shortUrl).where(and(
        eq(shortUrl.id, id),
        session.session.activeOrganizationId ?
            eq(shortUrl.organizationId, session.session.activeOrganizationId)
            :
            eq(shortUrl.userId, session.user.id)
    ));
}
export async function getShortUrlsPaginated({ page = 1, pageSize = 25, search, sortBy = 'createdAt', sortDir = 'desc', isActive }: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    isActive?: boolean | undefined;
}) {
    const session = await isAuthenticated({ behavior: "error", permissions: { shortUrl: ["read"] } });
    const orgId = session.session.activeOrganizationId;

    const whereClauses: any[] = [];
    if (orgId) whereClauses.push(eq(shortUrl.organizationId, orgId));
    else whereClauses.push(eq(shortUrl.userId, session.user.id));

    if (typeof isActive === 'boolean') {
        whereClauses.push(eq(shortUrl.isActive, isActive));
    }

    if (search) {
        const term = `%${search}%`;
        whereClauses.push(sql`(${shortUrl.slug} ILIKE ${term} OR ${shortUrl.originalUrl} ILIKE ${term} OR ${shortUrl.title} ILIKE ${term})`);
    }

    // Total count
    const totalRes = await db.select({ total: sql`coalesce(count(${shortUrl.id}), 0)` }).from(shortUrl).where(and(...whereClauses));
    const total = Number(totalRes[0].total ?? 0);

    // Sorting
    let orderExpr: any = shortUrl.createdAt;
    if (sortBy === 'slug') orderExpr = shortUrl.slug;
    else if (sortBy === 'clickCount') orderExpr = shortUrl.clickCount;
    else if (sortBy === 'updatedAt') orderExpr = shortUrl.updatedAt;

    const rows = await db.select().from(shortUrl).where(and(...whereClauses)).orderBy(sortDir === 'asc' ? orderExpr.asc() : orderExpr.desc()).limit(pageSize).offset((page - 1) * pageSize);

    return { data: rows, total, page, pageSize };
}