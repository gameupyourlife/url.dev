/**
 * Utilities for resolving country-based redirects from URL metadata
 */

export type CountryRedirectRule = {
    country?: string; // single country code, e.g. "US"
    countries?: string[]; // list of country codes
    target: string; // redirect target URL or path
};

export type CountryRedirectsConfig = {
    // Either an object map ("US": "https://us.example.com"),
    // or an array of rules, or a mixed shape with a "default" key.
    countryRedirects?: Record<string, string> | CountryRedirectRule[];
    default?: string;
};

export function resolveRedirectForCountry(
    originalUrl: string,
    metadata?: string | null,
    countryCode?: string | null
): { target: string; matchedRule?: CountryRedirectRule | { key: string; value: string } | null } {
    // Default behavior: return original URL
    if (!metadata) {
        return { target: originalUrl, matchedRule: null };
    }

    let config: CountryRedirectsConfig | Record<string, any> | null = null;

    try {
        config = JSON.parse(metadata);
    } catch (err) {
        // Invalid JSON — fall back to original URL
        console.warn("Invalid metadata JSON for country redirect", err);
        return { target: originalUrl, matchedRule: null };
    }

    // normalize provided country code
    const code = (countryCode || "").toUpperCase();

    // Helper to resolve a map style config
    function resolveFromMap(map: Record<string, string>) {
        // direct match
        if (code && map[code]) {
            return { target: map[code], matchedRule: { key: code, value: map[code] } };
        }
        // wildcard
        if (map["*"]) {
            return { target: map["*"], matchedRule: { key: "*", value: map["*"] } };
        }
        // default key
        if (map["default"]) {
            return { target: map["default"], matchedRule: { key: "default", value: map["default"] } };
        }
        return null;
    }

    // If config has countryRedirects as an object map
    if (config && typeof config === "object") {
        // support both `countryRedirects` and top-level mapping
        if ((config as CountryRedirectsConfig).countryRedirects && typeof (config as CountryRedirectsConfig).countryRedirects === "object" && !Array.isArray((config as CountryRedirectsConfig).countryRedirects)) {
            const map = (config as CountryRedirectsConfig).countryRedirects as Record<string, string>;
            const resolved = resolveFromMap(map);
            if (resolved) return resolved;
        }

        // support top-level object mapping where keys are country codes
        // detect if object looks like map: keys are strings and values are strings
        const isMap = Object.values(config).every((v) => typeof v === "string");
        if (isMap) {
            const resolved = resolveFromMap(config as Record<string, string>);
            if (resolved) return resolved;
        }

        // support array of rule objects
        if ((config as CountryRedirectsConfig).countryRedirects && Array.isArray((config as CountryRedirectsConfig).countryRedirects)) {
            const rules = (config as CountryRedirectsConfig).countryRedirects as CountryRedirectRule[];
            // find by single country
            const exact = rules.find((r) => (r.country || "").toUpperCase() === code);
            if (exact) return { target: exact.target, matchedRule: exact };
            // find by country list
            const byList = rules.find((r) => Array.isArray(r.countries) && r.countries.map((c) => c.toUpperCase()).includes(code));
            if (byList) return { target: byList.target, matchedRule: byList };
            // find wildcard rule (country: "*")
            const wildcard = rules.find((r) => (r.country || "").toString() === "*");
            if (wildcard) return { target: wildcard.target, matchedRule: wildcard };
            // fallback: config.default
            const defValue = (config as CountryRedirectsConfig).default;
            if (defValue) return { target: defValue, matchedRule: { key: "default", value: defValue } };
        }

        // If there is a top-level `default` key
        if ((config as any).default && typeof (config as any).default === "string") {
            return { target: (config as any).default, matchedRule: { key: "default", value: (config as any).default } };
        }
    }

    // No match found — fallback to original URL
    return { target: originalUrl, matchedRule: null };
}
