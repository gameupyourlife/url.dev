"use server";;
import { isAuthenticated } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { click, shortUrl } from "@/lib/db/schema";
import { NewShortUrl, ShortUrl, UrlWithClicks } from "@/lib/db/types";
import { and, eq } from "drizzle-orm";
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
