"use server";;
import { isAuthenticated } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { shortUrl } from "@/lib/db/schema";
import { NewShortUrl } from "@/lib/db/types";

export async function createShortUrl(url: NewShortUrl) {
    const session = await isAuthenticated({ throwIfNotAuthenticated: true });

    const result = await db.insert(shortUrl).values({
        ...url,
        userId: session.user.id,
        organizationId: session.session.activeOrganizationId || null,
    }).returning();

    return result[0];
}

