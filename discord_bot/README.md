# Discord Bot for Key-Kingdom Admin Data

This service provides Discord slash commands for creating, updating, and deleting `Product` and `VendorLink` records using the same database as the admin dashboard.

## Setup

1. Install dependencies (preferably in a virtual environment):
   ```bash
   cd discord_bot
   pip install -r requirements.txt
   ```

2. Provide environment variables (via `.env` or your host). The bot accepts Prisma-style SQLite URLs (e.g., `file:./prisma/dev.db`) and will normalize them to `sqlite+aiosqlite:///...` automatically so it can share the same database file as the web admin experience:
   - `DISCORD_BOT_TOKEN` – Discord bot token.
   - `DATABASE_URL` – connection string for the admin dashboard database (e.g., `postgresql+asyncpg://user:pass@host:5432/db` or `file:./prisma/dev.db` if you mirror `web/.env.example`).
   - `DISCORD_GUILD_ID` – optional, limits command registration to a single guild for faster sync.
   - `DISCORD_ALLOWED_USERS` – comma-separated user IDs allowed to run commands (required for authorization).
   - `DISCORD_ALLOWED_ROLES` – comma-separated role IDs allowed to run commands.
   - `DISCORD_AUDIT_LOG` – optional log file path (defaults to `discord_bot/audit.log`).

   The website's sample configuration lives in `web/.env.example`:

   ```env
   DATABASE_URL="file:./prisma/dev.db"
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="change-me"
   ```

   Pointing the bot at the same `DATABASE_URL` ensures both services operate on the identical data store.

3. Start the bot:
   ```bash
   python -m discord_bot.bot
   ```

## Commands

- `/product_create` – Add a new product (validates category enum and URLs).
- `/product_update` – Update existing product fields.
- `/product_delete` – Remove a product and its vendor links.
- `/vendorlink_create` – Add a vendor link for a product (validates payment methods, redirect/avatar URLs).
- `/vendorlink_update` – Update a vendor link and optionally move it to another product.
- `/vendorlink_delete` – Delete a vendor link.

All commands enforce the `Product` category enum (`Executors`, `Bundles`, `Vendors`, `Tools`) and `VendorLink` payment methods (`credit_card`, `paypal`, `crypto`, `cashapp`, `other`). Audit entries are written to the configured log file for traceability.

> Commands require either an allowed user ID or role ID; leaving the allowlists empty will block all bot commands to prevent accidental exposure.
