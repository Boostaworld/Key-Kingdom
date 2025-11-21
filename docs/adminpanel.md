# Key-Kingdom Admin Panel Guide

## What you get
- Secure, branded admin UI at `/admin` for editing products and vendor links.
- Login flow that uses your `.env` credentials and writes audit logs to a webhook when configured.
- API endpoints under `/api/admin` that accept the same auth (cookies, HTTP Basic, or bearer token) for automation and Discord bots.

## Prerequisites
1. **Node + npm**: Use the versions in `web/package.json` (Node 18+ recommended).
2. **Environment file**: Copy `web/.env.example` to `web/.env` and set at least:
   - `DATABASE_URL="file:./dev.db"` (default SQLite path for Prisma)
   - `ADMIN_USERNAME` and `ADMIN_PASSWORD` (your chosen login)
   - Optional logging and automation extras: `ADMIN_AUDIT_WEBHOOK_URL`, `ADMIN_API_TOKEN`, `ADMIN_API_ACTOR`

> If you see **“Admin credentials are not configured; access is disabled.”** it means `ADMIN_USERNAME` or `ADMIN_PASSWORD` are missing. Create/update `.env`, restart the dev server, and log in again. Changing credentials requires a restart so the middleware picks up the new values.

## Start the admin panel locally
1. `cd web`
2. `npm install` (pulls Next.js, Prisma, and UI deps)
3. `npm run dev`
4. Open `http://localhost:3000/admin`. The middleware will redirect you to `/admin/login` until authenticated.

## Sign in
1. On `/admin/login`, enter the `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `.env`.
2. Successful login sets an HTTP-only session cookie and returns you to your requested admin page.
3. If `ADMIN_AUDIT_WEBHOOK_URL` is set, the login event is posted to the webhook with the actor name.

## Manage products and vendors
- The `/admin/products` page lets you **create, update, and delete** products and vendor links.
- Each change calls the corresponding `/api/admin` endpoint; when a webhook is configured, the action is logged with actor + payload details.
- Key actions:
  - **Add product**: Fill the form at the top, including IDs, slug, icon/hero URLs, features, and tags.
  - **Edit product**: Inline-edit fields and click **Save product**.
  - **Delete product**: Use **Delete** (with confirmation).
  - **Manage vendors**: For each product, edit vendor fields inline, **Save vendor**, **Delete vendor**, or use **Add vendor** with price, payment methods, and URLs.

## Automate with API calls (Python/Discord bots)
- Auth options (match the UI):
  - Bearer token: `Authorization: Bearer $ADMIN_API_TOKEN`
  - HTTP Basic: `Authorization: Basic base64(username:password)`
- Example (Python `requests`) to add a product:
```python
import os, requests

base = "http://localhost:3000"
headers = {"Authorization": f"Bearer {os.environ['ADMIN_API_TOKEN']}"}
payload = {
    "id": "example-product",
    "name": "Example",
    "slug": "example",
    "iconUrl": "https://.../icon.png",
    "description": "Demo product",
    "features": ["feature-a", "feature-b"],
    "tags": ["demo"],
    "price": 0,
}
resp = requests.post(f"{base}/api/admin/products", json=payload, headers=headers)
resp.raise_for_status()
```
- All admin APIs live under `/api/admin` (e.g., `/api/admin/products`, `/api/admin/products/{id}`, `/api/admin/products/{id}/vendors`).

## Production deployment tips
- Run `npm run build` to verify the admin UI and middleware compile cleanly.
- Use strong secrets for `ADMIN_PASSWORD` and `ADMIN_API_TOKEN`; rotate them regularly.
- Keep `ADMIN_AUDIT_WEBHOOK_URL` configured so every login and mutation is captured in your logs.
