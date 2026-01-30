Update/Generate better-auth schema: npx @better-auth/cli generate --output ./lib/db/auth-schema.ts 
Update database: npx drizzle-kit push

---

## Country-based redirects 🔀

You can configure country-specific redirects by storing a JSON object in the `metadata` column of a `short_url` record. Supported shapes:

- Map style (simple):

```json
{
  "countryRedirects": {
    "US": "https://us.example.com",
    "CA": "https://ca.example.com",
    "default": "https://example.com"
  }
}
```

- Array style (rules):

```json
{
  "countryRedirects": [
    { "country": "US", "target": "https://us.example.com" },
    { "countries": ["CA", "MX"], "target": "https://ca-mx.example.com" },
    { "country": "*", "target": "https://example.com" }
  ]
}
```

Notes:
- The resolver checks `analytics.country.code` first, then `cf-ipcountry` header as a fallback.
- If a rule's `target` starts with `/`, it will be resolved against the original URL's origin.
- If no match is found, the original URL is used as the redirect target.


