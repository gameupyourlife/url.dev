"use server";
import { isAuthenticated } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { click, shortUrl, member } from "@/lib/db/schema";
import { UrlClick, ShortUrl } from "@/lib/db/types";
import { and, eq, sql, desc } from "drizzle-orm";

export async function getOverviewMetrics() {
    const session = await isAuthenticated({ behavior: "error", permissions: { shortUrl: ["read", "analytics"] } });

    const orgId = session.session.activeOrganizationId;

    const urlWhere = orgId ? eq(shortUrl.organizationId, orgId) : eq(shortUrl.userId, session.user.id);

    const totalUrlsRes = await db.select({ total: sql`coalesce(count(${shortUrl.id}), 0)` }).from(shortUrl).where(urlWhere);
    const totalUrls = Number(totalUrlsRes[0].total ?? 0);

    // Use the cached clickCount on short_url for efficiency
    const totalClicksRes = await db.select({ total: sql`coalesce(sum(${shortUrl.clickCount}), 0)` }).from(shortUrl).where(urlWhere);
    const totalClicks = Number(totalClicksRes[0].total ?? 0);

    // Total users: if organization context, count members; otherwise 1 (single user)
    let totalUsers = 1;
    if (orgId) {
        const membersRes = await db.select({ total: sql`coalesce(count(${member.id}), 0)` }).from(member).where(eq(member.organizationId, orgId));
        totalUsers = Number(membersRes[0].total ?? 0);
    }

    return { totalUrls, totalClicks, totalUsers };
}

export async function getDailyClicks({ urlId, days = 30 }: { urlId?: string; days?: number } = {}) {
    const session = await isAuthenticated({ behavior: "error", permissions: { shortUrl: ["read", "analytics"] } });
    const orgId = session.session.activeOrganizationId;

    const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

    const baseJoin = db.select({ day: sql`date_trunc('day', ${click.clickedAt})`, clicks: sql`count(*)` })
        .from(click)
        .leftJoin(shortUrl, eq(click.shortUrlId, shortUrl.id));

    const conditions: any[] = [sql`${click.clickedAt} >= ${startDate}`];

    if (urlId) {
        conditions.push(eq(click.shortUrlId, urlId));
    } else if (orgId) {
        conditions.push(eq(shortUrl.organizationId, orgId));
    } else {
        conditions.push(eq(shortUrl.userId, session.user.id));
    }

    const rowsRaw: any[] = await baseJoin.where(and(...conditions)).groupBy(sql`date_trunc('day', ${click.clickedAt})`).orderBy(sql`date_trunc('day', ${click.clickedAt})`);

    // Normalize output to { date: ISO, clicks: number } and fill missing days with 0
    const map = new Map<string, number>();
    rowsRaw.forEach((r) => {
        const d = r.day as Date | string | null;
        const dateStr = d ? (new Date(d)).toISOString().slice(0, 10) : "";
        map.set(dateStr, Number(r.clicks ?? 0));
    });

    const result: { date: string; clicks: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() - i);
        const key = d.toISOString().slice(0, 10);
        result.push({ date: key, clicks: map.get(key) ?? 0 });
    }

    return result;
}

export async function getTopUrls({ limit = 10 }: { limit?: number } = {}) {
    const session = await isAuthenticated({ behavior: "error", permissions: { shortUrl: ["read", "analytics"] } });
    const orgId = session.session.activeOrganizationId;

    const q = db.select().from(shortUrl).where(
        orgId ? eq(shortUrl.organizationId, orgId) : eq(shortUrl.userId, session.user.id)
    ).orderBy(desc(shortUrl.clickCount)).limit(limit);

    const rows: ShortUrl[] = await q;
    return rows;
}

export async function getTopCountries({ urlId, limit = 10 }: { urlId?: string; limit?: number } = {}) {
    const session = await isAuthenticated({ behavior: "error", permissions: { shortUrl: ["read", "analytics"] } });
    const orgId = session.session.activeOrganizationId;

    const base = db.select({ country: click.countryName, clicks: sql`count(*)` })
        .from(click)
        .leftJoin(shortUrl, eq(click.shortUrlId, shortUrl.id));

    if (urlId) base.where(eq(click.shortUrlId, urlId));
    else if (orgId) base.where(eq(shortUrl.organizationId, orgId));
    else base.where(eq(shortUrl.userId, session.user.id));

    const rows = await base.groupBy(click.countryName).orderBy(desc(sql`count(*)`)).limit(limit);

    return rows.map((r: any) => ({ country: r.country ?? "(unknown)", clicks: Number(r.clicks) }));
}

export async function getTopReferrers({ urlId, limit = 10 }: { urlId?: string; limit?: number } = {}) {
    const session = await isAuthenticated({ behavior: "error", permissions: { shortUrl: ["read", "analytics"] } });
    const orgId = session.session.activeOrganizationId;

    const base = db.select({ referer: click.refererDomain, type: click.refererType, clicks: sql`count(*)` })
        .from(click)
        .leftJoin(shortUrl, eq(click.shortUrlId, shortUrl.id));

    if (urlId) base.where(eq(click.shortUrlId, urlId));
    else if (orgId) base.where(eq(shortUrl.organizationId, orgId));
    else base.where(eq(shortUrl.userId, session.user.id));

    const rows = await base.groupBy(click.refererDomain, click.refererType).orderBy(desc(sql`count(*)`)).limit(limit);

    return rows.map((r: any) => ({ referer: r.referer ?? "(unknown)", type: r.type ?? "unknown", clicks: Number(r.clicks) }));
}

export async function getDeviceBreakdown({ urlId, limit = 20 }: { urlId?: string; limit?: number } = {}) {
    const session = await isAuthenticated({ behavior: "error", permissions: { shortUrl: ["read", "analytics"] } });
    const orgId = session.session.activeOrganizationId;

    const base = db.select({ device: click.deviceType, clicks: sql`count(*)` })
        .from(click)
        .leftJoin(shortUrl, eq(click.shortUrlId, shortUrl.id));

    if (urlId) base.where(eq(click.shortUrlId, urlId));
    else if (orgId) base.where(eq(shortUrl.organizationId, orgId));
    else base.where(eq(shortUrl.userId, session.user.id));

    const rows = await base.groupBy(click.deviceType).orderBy(desc(sql`count(*)`)).limit(limit);

    return rows.map((r: any) => ({ device: r.device ?? "(unknown)", clicks: Number(r.clicks) }));
}

export async function getBrowserBreakdown({ urlId, limit = 20 }: { urlId?: string; limit?: number } = {}) {
    const session = await isAuthenticated({ behavior: "error", permissions: { shortUrl: ["read", "analytics"] } });
    const orgId = session.session.activeOrganizationId;

    const base = db.select({ browser: click.browserName, clicks: sql`count(*)` })
        .from(click)
        .leftJoin(shortUrl, eq(click.shortUrlId, shortUrl.id));

    if (urlId) base.where(eq(click.shortUrlId, urlId));
    else if (orgId) base.where(eq(shortUrl.organizationId, orgId));
    else base.where(eq(shortUrl.userId, session.user.id));

    const rows = await base.groupBy(click.browserName).orderBy(desc(sql`count(*)`)).limit(limit);

    return rows.map((r: any) => ({ browser: r.browser ?? "(unknown)", clicks: Number(r.clicks) }));
}

export async function exportClicksCsv({ urlId, startDate, endDate, country, device, limit = 10000 }: {
    urlId?: string;
    startDate?: Date;
    endDate?: Date;
    country?: string;
    device?: string;
    limit?: number;
}) {
    const session = await isAuthenticated({ behavior: "error", permissions: { shortUrl: ["read", "analytics"] } });
    const orgId = session.session.activeOrganizationId;

    const whereClauses: any[] = [];
    if (urlId) whereClauses.push(eq(click.shortUrlId, urlId));
    else if (orgId) whereClauses.push(eq(shortUrl.organizationId, orgId));
    else whereClauses.push(eq(shortUrl.userId, session.user.id));

    if (startDate) whereClauses.push(sql`${click.clickedAt} >= ${startDate}`);
    if (endDate) whereClauses.push(sql`${click.clickedAt} <= ${endDate}`);
    if (country) whereClauses.push(eq(click.countryName, country));
    if (device) whereClauses.push(eq(click.deviceType, device));

    const rowsRaw: any[] = await db.select().from(click).leftJoin(shortUrl, eq(click.shortUrlId, shortUrl.id)).where(and(...whereClauses)).orderBy(desc(click.clickedAt)).limit(limit);

    // Normalize to click rows
    const rows = rowsRaw.map((r) => (r.click ? r.click : r));

    // Convert to CSV
    const headers = ["id","shortUrlId","clickedAt","ipAddress","countryName","city","region","deviceType","browserName","refererDomain","refererType","utmSource","utmMedium","utmCampaign","searchParams"];

    const escape = (s: any) => {
        if (s === null || s === undefined) return "";
        const str = String(s);
        if (str.includes(",") || str.includes("\n") || str.includes('"')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    };

    const csvLines = [headers.join(",")];
    for (const r of rows) {
        const line = headers.map((h) => escape(r[h as keyof typeof r])).join(",");
        csvLines.push(line);
    }

    return csvLines.join("\n");
}

export async function getClicksPaginated({ urlId, page = 1, pageSize = 50, startDate, endDate, country, device }: {
    urlId?: string;
    page?: number;
    pageSize?: number;
    startDate?: Date;
    endDate?: Date;
    country?: string;
    device?: string;
}) {
    const session = await isAuthenticated({ behavior: "error", permissions: { shortUrl: ["read", "analytics"] } });
    const orgId = session.session.activeOrganizationId;

    const whereClauses: any[] = [];
    if (urlId) whereClauses.push(eq(click.shortUrlId, urlId));
    else if (orgId) whereClauses.push(eq(shortUrl.organizationId, orgId));
    else whereClauses.push(eq(shortUrl.userId, session.user.id));

    if (startDate) whereClauses.push(sql`${click.clickedAt} >= ${startDate}`);
    if (endDate) whereClauses.push(sql`${click.clickedAt} <= ${endDate}`);
    if (country) whereClauses.push(eq(click.countryName, country));
    if (device) whereClauses.push(eq(click.deviceType, device));

    const base = db.select().from(click).leftJoin(shortUrl, eq(click.shortUrlId, shortUrl.id)).where(and(...whereClauses));

    const totalRes = await db.select({ total: sql`coalesce(count(${click.id}), 0)` }).from(click).leftJoin(shortUrl, eq(click.shortUrlId, shortUrl.id)).where(and(...whereClauses));
    const total = Number(totalRes[0].total ?? 0);

    const rowsRaw: any[] = await base.orderBy(desc(click.clickedAt)).limit(pageSize).offset((page - 1) * pageSize);
    // rowsRaw items can be { click: {...}, short_url: {...} } when joined — normalize to click rows
    const rows: UrlClick[] = rowsRaw.map((r) => (r.click ? r.click : r));

    return { data: rows, total, page, pageSize };
}
