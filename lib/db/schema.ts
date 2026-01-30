import {
    pgTable,
    text,
    timestamp,
    integer,
    boolean,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user, organization } from "./auth-schema";
export * from "./auth-schema";

// Short URLs table
export const shortUrl = pgTable(
    "short_url",
    {
        id: text("id").primaryKey(),
        slug: text("slug").notNull().unique(),
        originalUrl: text("original_url").notNull(),
        title: text("title"),
        description: text("description"),

        // Ownership - can be user or org owned
        userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
        organizationId: text("organization_id").references(() => organization.id, { onDelete: "cascade" }),

        // Settings
        isActive: boolean("is_active").default(true).notNull(),
        expiresAt: timestamp("expires_at"),
        password: text("password"), // Optional password protection
        maxClicks: integer("max_clicks"), // Optional click limit

        // Metadata
        clickCount: integer("click_count").default(0).notNull(),
        lastClickedAt: timestamp("last_clicked_at"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),

        // UTM & tracking
        utmSource: text("utm_source"),
        utmMedium: text("utm_medium"),
        utmCampaign: text("utm_campaign"),
        utmTerm: text("utm_term"),
        utmContent: text("utm_content"),

        // Custom metadata as JSON string
        metadata: text("metadata"),
    },
    (table) => [
        uniqueIndex("short_url_slug_idx").on(table.slug),
        index("short_url_user_id_idx").on(table.userId),
        index("short_url_org_id_idx").on(table.organizationId),
        index("short_url_created_at_idx").on(table.createdAt),
    ]
);

// Click tracking table
export const click = pgTable(
    "click",
    {
        id: text("id").primaryKey(),
        shortUrlId: text("short_url_id")
            .notNull()
            .references(() => shortUrl.id, { onDelete: "cascade" }),

        // Request info
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        referer: text("referer"),
        host: text("host"),

        // Device info (detailed)
        deviceType: text("device_type"),
        deviceVendor: text("device_vendor"),
        deviceModel: text("device_model"),

        // Browser info
        browserName: text("browser_name"),
        browserVersion: text("browser_version"),

        // OS info
        osName: text("os_name"),
        osVersion: text("os_version"),

        // Engine info
        engineName: text("engine_name"),
        engineVersion: text("engine_version"),

        // CPU info
        cpuArchitecture: text("cpu_architecture"),

        // Geo data
        countryCode: text("country_code"),
        countryName: text("country_name"),
        city: text("city"),
        region: text("region"),

        // Cloudflare headers
        cfCountry: text("cf_country"),
        cfRay: text("cf_ray"),

        // Additional headers
        acceptLanguage: text("accept_language"),
        acceptEncoding: text("accept_encoding"),
        dnt: text("dnt"), // Do Not Track

        // Analytics flags
        isBot: boolean("is_bot").default(false).notNull(),

        // URL search parameters
        searchParams: text("search_params"), // JSON string

        // Referer analysis
        refererDomain: text("referer_domain"),
        refererType: text("referer_type"), // direct, social, search, website
        refererSource: text("referer_source"),

        // UTM params from click
        utmSource: text("utm_source"),
        utmMedium: text("utm_medium"),
        utmCampaign: text("utm_campaign"),
        utmTerm: text("utm_term"),
        utmContent: text("utm_content"),

        // Timestamp
        clickedAt: timestamp("clicked_at").defaultNow().notNull(),
    },
    (table) => [
        index("click_short_url_id_idx").on(table.shortUrlId),
        index("click_clicked_at_idx").on(table.clickedAt),
        index("click_country_code_idx").on(table.countryCode),
        index("click_referer_type_idx").on(table.refererType),
        index("click_browser_name_idx").on(table.browserName),
        index("click_device_type_idx").on(table.deviceType),
    ]
);

// Relations
export const shortUrlRelations = relations(shortUrl, ({ one, many }) => ({
    user: one(user, {
        fields: [shortUrl.userId],
        references: [user.id],
    }),
    organization: one(organization, {
        fields: [shortUrl.organizationId],
        references: [organization.id],
    }),
    clicks: many(click),
}));

export const clickRelations = relations(click, ({ one }) => ({
    shortUrl: one(shortUrl, {
        fields: [click.shortUrlId],
        references: [shortUrl.id],
    }),
}));
