import { click, shortUrl } from "./schema";

export type ShortUrl = typeof shortUrl.$inferSelect;
export type NewShortUrl = typeof shortUrl.$inferInsert;

export type UrlClick = typeof click.$inferSelect;
export type NewUrlClick = typeof click.$inferInsert;

export interface UrlWithClicks extends ShortUrl {
    clicks?: UrlClick[];
}


