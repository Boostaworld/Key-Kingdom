import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Optional

import discord
from discord import app_commands
from discord.ext import commands
from dotenv import load_dotenv
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError

from .config import BotConfig
from .database import Database
from .models import Product, ProductCategory, VendorLink
from .permissions import require_permission
from .validators import (
    parse_features,
    parse_payment_methods,
    parse_tags,
    validate_category_value,
    validate_optional_url,
    validate_product,
    validate_vendor_link,
)


load_dotenv()
config = BotConfig.from_env()
database = Database(config)


def configure_logging(log_file: str) -> logging.Logger:
    Path(log_file).parent.mkdir(parents=True, exist_ok=True)
    logger = logging.getLogger("discord_bot")
    logger.setLevel(logging.INFO)

    handler = RotatingFileHandler(log_file, maxBytes=512_000, backupCount=3)
    handler.setFormatter(
        logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s")
    )
    logger.addHandler(handler)
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s: %(message)s"))
    logger.addHandler(console_handler)
    return logger


audit_logger = configure_logging(config.log_file)

intents = discord.Intents.default()
intents.members = True
bot = commands.Bot(command_prefix="!", intents=intents)


async def _sync_commands() -> None:
    if config.guild_id:
        guild = discord.Object(id=config.guild_id)
        bot.tree.copy_global_to(guild=guild)
        await bot.tree.sync(guild=guild)
    else:
        await bot.tree.sync()


async def product_id_autocomplete(
    _: discord.Interaction, current: str
) -> list[app_commands.Choice[str]]:
    async with database.session() as session:
        query = select(Product.id, Product.name).order_by(Product.name)
        if current:
            like_value = f"%{current}%"
            query = query.where(
                or_(Product.id.ilike(like_value), Product.name.ilike(like_value))
            )
        rows = (await session.execute(query.limit(25))).all()
        return [
            app_commands.Choice(name=f"{name} ({product_id})", value=product_id)
            for product_id, name in rows
        ]


async def recalc_product_stats(product_id: str) -> None:
    async with database.session() as session:
        price_rows = await session.execute(
            select(VendorLink.price).where(VendorLink.product_id == product_id)
        )
        prices = [row[0] for row in price_rows.all()]
        product = await session.get(Product, product_id)
        if not product:
            return
        product.vendor_count = len(prices)
        product.lowest_price = min(prices) if prices else 0.0
        await session.commit()


@bot.event
async def setup_hook() -> None:
    await database.init()
    await _sync_commands()
    audit_logger.info("Discord bot commands synced")


@bot.event
async def on_ready() -> None:
    audit_logger.info("Logged in as %s", bot.user)


@app_commands.command(name="product_create", description="Create a new product")
@app_commands.describe(
    product_id="Product ID used as the primary key",
    name="Display name",
    slug="Unique slug",
    category="Category (Executors, Bundles, Vendors, Tools)",
    icon_url="Icon URL or /relative path",
    description="Short description",
    features="Comma-separated feature list",
    is_updated="Flag if recently updated",
    lowest_price="Lowest price across vendors",
    vendor_count="Initial vendor count",
    tagline="Optional tagline",
    hero_image_url="Optional hero image",
    sort_order="Optional sort order",
    tags="Comma-separated tags",
    last_updated="Optional last updated value",
)
async def create_product(
    interaction: discord.Interaction,
    product_id: str,
    name: str,
    slug: str,
    category: str,
    icon_url: str,
    description: str,
    features: str,
    is_updated: bool = False,
    lowest_price: float = 0.0,
    vendor_count: int = 0,
    tagline: Optional[str] = None,
    hero_image_url: Optional[str] = None,
    sort_order: Optional[int] = None,
    tags: Optional[str] = None,
    last_updated: Optional[str] = None,
) -> None:
    if not await require_permission(interaction, config):
        return
    try:
        payload = validate_product(
            product_id=product_id,
            name=name,
            slug=slug,
            category=category,
            icon_url=icon_url,
            description=description,
            features=features,
            is_updated=is_updated,
            lowest_price=lowest_price,
            vendor_count=vendor_count,
            tagline=tagline,
            hero_image_url=hero_image_url,
            sort_order=sort_order,
            tags=tags,
            last_updated=last_updated,
        )
    except ValueError as exc:
        await interaction.response.send_message(f"Validation error: {exc}", ephemeral=True)
        return

    async with database.session() as session:
        if await session.get(Product, payload.id):
            await interaction.response.send_message("Product ID already exists", ephemeral=True)
            return

        product = Product(
            id=payload.id,
            name=payload.name,
            slug=payload.slug,
            category=ProductCategory(payload.category),
            icon_url=payload.icon_url,
            description=payload.description,
            features=payload.features,
            is_updated=payload.is_updated,
            lowest_price=payload.lowest_price,
            vendor_count=payload.vendor_count,
            tagline=payload.tagline,
            hero_image_url=payload.hero_image_url,
            sort_order=payload.sort_order,
            tags=payload.tags,
            last_updated=payload.last_updated,
        )
        session.add(product)
        try:
            await session.commit()
        except IntegrityError as exc:
            await session.rollback()
            await interaction.response.send_message(
                f"Database error creating product: {exc}", ephemeral=True
            )
            return

    await interaction.response.send_message(
        f"Product `{payload.name}` created successfully.", ephemeral=True
    )
    audit_logger.info(
        "User %s created product %s (slug=%s)", interaction.user.id, payload.id, payload.slug
    )


@app_commands.command(name="product_update", description="Update an existing product")
@app_commands.describe(
    product_id="Existing product ID",
    name="New display name",
    slug="New slug",
    category="Updated category",
    icon_url="New icon URL or /relative path",
    description="Updated description",
    features="Comma-separated features (leave blank to keep)",
    is_updated="Toggle updated status",
    lowest_price="Override lowest price",
    vendor_count="Override vendor count",
    tagline="Updated tagline",
    hero_image_url="Updated hero image",
    sort_order="Updated sort order",
    tags="Comma-separated tags (leave blank to keep)",
    last_updated="Updated last updated value",
)
@app_commands.autocomplete(product_id=product_id_autocomplete)
async def update_product(
    interaction: discord.Interaction,
    product_id: str,
    name: Optional[str] = None,
    slug: Optional[str] = None,
    category: Optional[str] = None,
    icon_url: Optional[str] = None,
    description: Optional[str] = None,
    features: Optional[str] = None,
    is_updated: Optional[bool] = None,
    lowest_price: Optional[float] = None,
    vendor_count: Optional[int] = None,
    tagline: Optional[str] = None,
    hero_image_url: Optional[str] = None,
    sort_order: Optional[int] = None,
    tags: Optional[str] = None,
    last_updated: Optional[str] = None,
) -> None:
    if not await require_permission(interaction, config):
        return

    async with database.session() as session:
        product = await session.get(Product, product_id)
        if not product:
            await interaction.response.send_message("Product not found", ephemeral=True)
            return

        try:
            if category:
                product.category = ProductCategory(validate_category_value(category))
            if icon_url is not None:
                product.icon_url = validate_optional_url(icon_url, "icon_url") or icon_url
            if name:
                product.name = name
            if slug:
                product.slug = slug
            if description:
                product.description = description
            if features is not None:
                product.features = parse_features(features, product.features)
            if is_updated is not None:
                product.is_updated = is_updated
            if lowest_price is not None:
                product.lowest_price = lowest_price
            if vendor_count is not None:
                product.vendor_count = vendor_count
            if tagline is not None:
                product.tagline = tagline
            if hero_image_url is not None:
                product.hero_image_url = validate_optional_url(hero_image_url, "hero_image_url")
            if sort_order is not None:
                product.sort_order = sort_order
            if tags is not None:
                product.tags = parse_tags(tags, product.tags)
            if last_updated is not None:
                product.last_updated = last_updated
        except ValueError as exc:
            await interaction.response.send_message(f"Validation error: {exc}", ephemeral=True)
            return

        await session.commit()

    await interaction.response.send_message(
        f"Product `{product_id}` updated successfully.", ephemeral=True
    )
    audit_logger.info("User %s updated product %s", interaction.user.id, product_id)


@app_commands.command(name="product_delete", description="Delete a product")
@app_commands.describe(product_id="ID of the product to delete")
@app_commands.autocomplete(product_id=product_id_autocomplete)
async def delete_product(interaction: discord.Interaction, product_id: str) -> None:
    if not await require_permission(interaction, config):
        return

    async with database.session() as session:
        product = await session.get(Product, product_id)
        if not product:
            await interaction.response.send_message("Product not found", ephemeral=True)
            return
        await session.delete(product)
        await session.commit()

    await interaction.response.send_message(
        f"Product `{product_id}` deleted along with vendor links.", ephemeral=True
    )
    audit_logger.info("User %s deleted product %s", interaction.user.id, product_id)


@app_commands.command(name="vendorlink_create", description="Create a vendor link")
@app_commands.describe(
    vendor_id="Vendor link ID",
    product_id="Parent product ID",
    vendor_name="Vendor display name",
    url="Public vendor URL",
    price="Price for this offer",
    currency="Currency code",
    payment_methods="Comma-separated payment methods",
    redirect_url="Optional redirect URL",
    notes="Optional notes",
    cta_label="Optional CTA label",
    avatar_url="Optional avatar URL",
)
@app_commands.autocomplete(product_id=product_id_autocomplete)
async def create_vendor_link(
    interaction: discord.Interaction,
    vendor_id: str,
    product_id: str,
    vendor_name: str,
    url: str,
    price: float,
    currency: str,
    payment_methods: str,
    redirect_url: Optional[str] = None,
    notes: Optional[str] = None,
    cta_label: Optional[str] = None,
    avatar_url: Optional[str] = None,
) -> None:
    if not await require_permission(interaction, config):
        return
    try:
        payload = validate_vendor_link(
            vendor_id=vendor_id,
            product_id=product_id,
            vendor_name=vendor_name,
            url=url,
            price=price,
            currency=currency,
            payment_methods=payment_methods,
            redirect_url=redirect_url,
            notes=notes,
            cta_label=cta_label,
            avatar_url=avatar_url,
        )
    except ValueError as exc:
        await interaction.response.send_message(f"Validation error: {exc}", ephemeral=True)
        return

    async with database.session() as session:
        product = await session.get(Product, payload.product_id)
        if not product:
            await interaction.response.send_message("Product not found", ephemeral=True)
            return
        if await session.get(VendorLink, payload.id):
            await interaction.response.send_message("Vendor link ID already exists", ephemeral=True)
            return

        vendor_link = VendorLink(
            id=payload.id,
            product_id=payload.product_id,
            vendor_name=payload.vendor_name,
            url=payload.url,
            redirect_url=payload.redirect_url,
            price=payload.price,
            currency=payload.currency,
            payment_methods=payload.payment_methods,
            notes=payload.notes,
            cta_label=payload.cta_label,
            avatar_url=payload.avatar_url,
        )
        session.add(vendor_link)
        await session.commit()

    await recalc_product_stats(payload.product_id)
    await interaction.response.send_message(
        f"Vendor link `{payload.id}` created for product `{payload.product_id}`.",
        ephemeral=True,
    )
    audit_logger.info(
        "User %s created vendor link %s for product %s",
        interaction.user.id,
        payload.id,
        payload.product_id,
    )


@app_commands.command(name="vendorlink_update", description="Update a vendor link")
@app_commands.describe(
    vendor_id="Vendor link ID",
    product_id="Product ID this link belongs to",
    vendor_name="Updated vendor name",
    url="Updated vendor URL",
    price="Updated price",
    currency="Updated currency",
    payment_methods="Updated comma-separated payment methods",
    redirect_url="Updated redirect URL",
    notes="Updated notes",
    cta_label="Updated CTA label",
    avatar_url="Updated avatar URL",
)
@app_commands.autocomplete(product_id=product_id_autocomplete)
async def update_vendor_link(
    interaction: discord.Interaction,
    vendor_id: str,
    product_id: Optional[str] = None,
    vendor_name: Optional[str] = None,
    url: Optional[str] = None,
    price: Optional[float] = None,
    currency: Optional[str] = None,
    payment_methods: Optional[str] = None,
    redirect_url: Optional[str] = None,
    notes: Optional[str] = None,
    cta_label: Optional[str] = None,
    avatar_url: Optional[str] = None,
) -> None:
    if not await require_permission(interaction, config):
        return

    async with database.session() as session:
        vendor_link = await session.get(VendorLink, vendor_id)
        if not vendor_link:
            await interaction.response.send_message("Vendor link not found", ephemeral=True)
            return

        if product_id:
            product = await session.get(Product, product_id)
            if not product:
                await interaction.response.send_message("Product not found", ephemeral=True)
                return
            vendor_link.product_id = product_id

        try:
            if vendor_name:
                vendor_link.vendor_name = vendor_name
            if url is not None:
                vendor_link.url = validate_optional_url(url, "url") or url
            if price is not None:
                vendor_link.price = price
            if currency is not None:
                vendor_link.currency = currency.upper()
            if payment_methods is not None:
                vendor_link.payment_methods = parse_payment_methods(
                    payment_methods, vendor_link.payment_methods
                )
            if redirect_url is not None:
                vendor_link.redirect_url = validate_optional_url(redirect_url, "redirect_url")
            if notes is not None:
                vendor_link.notes = notes
            if cta_label is not None:
                vendor_link.cta_label = cta_label
            if avatar_url is not None:
                vendor_link.avatar_url = validate_optional_url(avatar_url, "avatar_url")
        except ValueError as exc:
            await interaction.response.send_message(f"Validation error: {exc}", ephemeral=True)
            return

        await session.commit()

    await recalc_product_stats(vendor_link.product_id)
    await interaction.response.send_message(
        f"Vendor link `{vendor_id}` updated successfully.", ephemeral=True
    )
    audit_logger.info("User %s updated vendor link %s", interaction.user.id, vendor_id)


@app_commands.command(name="vendorlink_delete", description="Delete a vendor link")
@app_commands.describe(
    vendor_id="Vendor link ID",
)
async def delete_vendor_link(interaction: discord.Interaction, vendor_id: str) -> None:
    if not await require_permission(interaction, config):
        return

    async with database.session() as session:
        vendor_link = await session.get(VendorLink, vendor_id)
        if not vendor_link:
            await interaction.response.send_message("Vendor link not found", ephemeral=True)
            return
        product_id = vendor_link.product_id
        await session.delete(vendor_link)
        await session.commit()

    await recalc_product_stats(product_id)
    await interaction.response.send_message(
        f"Vendor link `{vendor_id}` deleted.", ephemeral=True
    )
    audit_logger.info(
        "User %s deleted vendor link %s from product %s",
        interaction.user.id,
        vendor_id,
        product_id,
    )


def main() -> None:
    bot.run(config.token)


if __name__ == "__main__":
    main()
