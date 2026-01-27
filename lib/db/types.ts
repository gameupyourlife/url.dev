import { click, shortUrl } from "./schema";

export type ShortUrl = typeof shortUrl.$inferSelect;
export type NewShortUrl = typeof shortUrl.$inferInsert;

export type UrlClick = typeof click.$inferSelect;
export type NewUrlClick = typeof click.$inferInsert;

export interface UrlWithClicks extends ShortUrl {
    clicks?: UrlClick[];
}

export interface AnalyticsStats {
    totalClicks: number;
    browsers: Record<string, number>;
    operatingSystems: Record<string, number>;
    devices: Record<string, number>;
    referrers: Record<string, number>;
    clicksByDate: Record<string, number>;
    recentClicks: Array<{
        timestamp: Date;
        browser: string | null;
        os: string | null;
        device: string | null;
        referrer: string | null;
        country: string | null;
        city: string | null;
    }>;
}
