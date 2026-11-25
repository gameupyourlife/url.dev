Update/Generate better-auth schema: npx auth@latest generate --output ./lib/db/auth-schema.ts 
Update database: npx drizzle-kit push

## GameUp sign-in

GameUp is the only sign-in provider. The first successful sign-in creates a url.dev account for a new user.

1. In the GameUp Accounts **Applications** page, register a confidential client with the exact callback URL: `<BETTER_AUTH_URL>/api/auth/callback/gameup` (for example, `https://url.dev/api/auth/callback/gameup`). Use a separate registration and an HTTPS callback for each environment.
2. Set `BETTER_AUTH_URL` to your public url.dev origin and set `GAMEUP_CLIENT_ID` and `GAMEUP_CLIENT_SECRET` on the server. Keep the client secret out of browser bundles and source control.
3. Test the callback with a GameUp account before rolling out the change. GitHub client credentials are no longer used.

Existing users are not automatically linked by email. Before rollout, link their verified GameUp OIDC subjects to their existing url.dev user IDs using a controlled migration (`account.providerId = "gameup"`, `account.accountId =` the verified GameUp `sub`). This preserves ownership of existing links and workspaces. Do not match accounts by email alone.

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


