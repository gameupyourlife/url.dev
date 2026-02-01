import { click, shortUrl } from "./schema";

export type ShortUrl = typeof shortUrl.$inferSelect;
export type NewShortUrl = typeof shortUrl.$inferInsert;

export type UrlClick = typeof click.$inferSelect;
export type NewUrlClick = typeof click.$inferInsert;

export interface UrlWithClicks extends ShortUrl {
    clicks?: UrlClick[];
}

export interface Analytics {
    totalClicks: number;
    uniqueClicks: number;

    trafficType: {
        direct: number;
        social: number;
        search: number;
        website: number;
    }
    deviceType: {
        desktop: number;
        mobile: number;
        tablet: number;
    }
    browserType: {
        chrome: number;
        safari: number;
        firefox: number;
        edge: number;
        other: number;
    }
    operatingSystem: {
        windows: number;
        macOS: number;
        linux: number;
        android: number;
        iOS: number;
        other: number;
    }
    botTraffic: {
        bots: number;
        nonBots: number
    };
    clicksByCountry: {
        country: string;
        clicks: number
    }[];
    clicksByDate: {
        date: string;
        clicks: number
    }[];
    clicksByDateByDevice: {
        date: string;
        desktop: number;
        mobile: number;
        tablet: number;
        unknown: number;
    }[];
    languageType: {
        [language: string]: number;
    };

}

export interface UrlWithAnalytics extends UrlWithClicks {
    analytics: Analytics;
}
