"use server";;
import { isAuthenticated } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { click, shortUrl } from "@/lib/db/schema";
import { NewShortUrl, ShortUrl, UrlWithClicks } from "@/lib/db/types";
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