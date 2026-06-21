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

---

## Business API (v1)

All endpoints are under `/api/v1` and support both cookie session auth and API key auth.

- Auto-generated API reference:
  - HTML docs: `/docs/api`
  - OpenAPI JSON: `/api/v1/openapi`

- API key headers (either one):
  - `x-api-key: <key>`
  - `Authorization: Bearer <key>`

### URLs

- `GET /api/v1/urls`
  - Query: `page`, `pageSize`, `search`, `sortBy`, `sortDir`, `isActive`
  - Query `view=all` to return all URLs without pagination
- `POST /api/v1/urls`
  - Create/upsert URL payload (same shape accepted by server action)
- `GET /api/v1/urls/:id`
  - Query `includeAnalytics=true` for full URL analytics object
- `PATCH /api/v1/urls/:id`
  - Body: `{ url?, slug?, title?, isActive? }`
- `DELETE /api/v1/urls/:id`
- `POST /api/v1/urls/:id/toggle-active`

### URL Analytics

- `GET /api/v1/urls/:id/analytics`
  - Returns summary + chart datasets for that URL
  - Query: `days` (default 30), `topLimit` (default 10)
- `GET /api/v1/urls/:id/clicks`
  - JSON pagination by default
  - Query: `page`, `pageSize`, `startDate`, `endDate`, `country`, `device`
  - Query `format=csv` for CSV export (supports `limit`)

### Workspace Analytics

- `GET /api/v1/analytics?type=overview`
- `GET /api/v1/analytics?type=daily&days=30&urlId=<optional>`
- `GET /api/v1/analytics?type=topUrls&limit=10`
- `GET /api/v1/analytics?type=topCountries&limit=10&urlId=<optional>`
- `GET /api/v1/analytics?type=referrers&limit=10&urlId=<optional>`
- `GET /api/v1/analytics?type=devices&limit=20&urlId=<optional>`
- `GET /api/v1/analytics?type=browsers&limit=20&urlId=<optional>`
- `GET /api/v1/analytics?type=totalClicks&urlId=<required>`
- `GET /api/v1/analytics?type=uniqueVisitors&urlId=<required>`
- `GET /api/v1/analytics?type=topCountry&urlId=<required>`
- `GET /api/v1/analytics?type=deviceDiversity&urlId=<required>`
- `GET /api/v1/analytics?type=clicks&page=1&pageSize=50&urlId=<optional>`
- `GET /api/v1/analytics?type=exportClicks&urlId=<optional>`


