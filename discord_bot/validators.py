from dataclasses import dataclass
from typing import List, Optional, Sequence
from urllib.parse import urlparse

from .models import PaymentMethod, ProductCategory

ALLOWED_PAYMENT_METHODS = {method.value for method in PaymentMethod}
ALLOWED_CATEGORIES = {category.value for category in ProductCategory}


def validate_category_value(category: str) -> str:
    category_value = _require_value(category, "category")
    if category_value not in ALLOWED_CATEGORIES:
        raise ValueError(f"category must be one of: {', '.join(sorted(ALLOWED_CATEGORIES))}.")
    return category_value


def validate_optional_url(value: Optional[str], field: str) -> Optional[str]:
    return _validate_url(value, field)


@dataclass
class ProductPayload:
    id: str
    name: str
    slug: str
    category: str
    icon_url: str
    description: str
    features: List[str]
    is_updated: bool
    lowest_price: float
    vendor_count: int
    tagline: Optional[str]
    hero_image_url: Optional[str]
    sort_order: Optional[int]
    tags: List[str]
    last_updated: Optional[str]


@dataclass
class VendorLinkPayload:
    id: str
    product_id: str
    vendor_name: str
    url: str
    price: float
    currency: str
    payment_methods: List[str]
    redirect_url: Optional[str]
    notes: Optional[str]
    cta_label: Optional[str]
    avatar_url: Optional[str]


def _require_value(value: str, field: str) -> str:
    if not value:
        raise ValueError(f"{field} is required.")
    return value


def _validate_url(value: Optional[str], field: str) -> Optional[str]:
    if value is None or value == "":
        return None
    if value.startswith("/"):
        return value
    parsed = urlparse(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError(f"{field} must be a valid http(s) URL.")
    return value


def _coerce_list(raw: Optional[str]) -> List[str]:
    if not raw:
        return []
    return [item.strip() for item in raw.split(",") if item.strip()]


def _validate_payment_methods(methods: Sequence[str]) -> List[str]:
    normalized = [method.strip().lower() for method in methods if method.strip()]
    invalid = [method for method in normalized if method not in ALLOWED_PAYMENT_METHODS]
    if invalid:
        raise ValueError(
            f"Unsupported payment methods: {', '.join(invalid)}. Allowed: {', '.join(sorted(ALLOWED_PAYMENT_METHODS))}."
        )
    return normalized


def parse_features(raw: Optional[str], fallback: Optional[List[str]] = None) -> List[str]:
    if raw is None:
        return fallback or []
    return _coerce_list(raw)


def parse_tags(raw: Optional[str], fallback: Optional[List[str]] = None) -> List[str]:
    if raw is None:
        return fallback or []
    return _coerce_list(raw)


def parse_payment_methods(raw: Optional[str], fallback: Optional[List[str]] = None) -> List[str]:
    if raw is None:
        return fallback or []
    payment_list = _validate_payment_methods(_coerce_list(raw))
    if not payment_list:
        raise ValueError("payment_methods must include at least one supported value.")
    return payment_list


def validate_product(
    *,
    product_id: str,
    name: str,
    slug: str,
    category: str,
    icon_url: str,
    description: str,
    features: str,
    is_updated: bool,
    lowest_price: float,
    vendor_count: int,
    tagline: Optional[str] = None,
    hero_image_url: Optional[str] = None,
    sort_order: Optional[int] = None,
    tags: Optional[str] = None,
    last_updated: Optional[str] = None,
) -> ProductPayload:
    return ProductPayload(
        id=_require_value(product_id, "id"),
        name=_require_value(name, "name"),
        slug=_require_value(slug, "slug"),
        category=validate_category_value(category),
        icon_url=_validate_url(_require_value(icon_url, "icon_url"), "icon_url") or icon_url,
        description=_require_value(description, "description"),
        features=parse_features(features),
        is_updated=is_updated,
        lowest_price=lowest_price,
        vendor_count=vendor_count,
        tagline=tagline or None,
        hero_image_url=_validate_url(hero_image_url, "hero_image_url"),
        sort_order=sort_order,
        tags=parse_tags(tags),
        last_updated=last_updated,
    )


def validate_vendor_link(
    *,
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
) -> VendorLinkPayload:
    payment_list = _validate_payment_methods(_coerce_list(payment_methods))
    if not payment_list:
        raise ValueError("payment_methods must include at least one supported value.")

    return VendorLinkPayload(
        id=_require_value(vendor_id, "vendor_id"),
        product_id=_require_value(product_id, "product_id"),
        vendor_name=_require_value(vendor_name, "vendor_name"),
        url=_validate_url(url, "url") or url,
        price=price,
        currency=_require_value(currency, "currency").upper(),
        payment_methods=payment_list,
        redirect_url=_validate_url(redirect_url, "redirect_url"),
        notes=notes or None,
        cta_label=cta_label or None,
        avatar_url=_validate_url(avatar_url, "avatar_url"),
    )
