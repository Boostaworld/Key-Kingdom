import enum
from typing import List, Optional

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import JSON


class Base(DeclarativeBase):
    pass


class ProductCategory(enum.Enum):
    EXECUTORS = "Executors"
    BUNDLES = "Bundles"
    VENDORS = "Vendors"
    TOOLS = "Tools"


class PaymentMethod(enum.Enum):
    CREDIT_CARD = "credit_card"
    PAYPAL = "paypal"
    CRYPTO = "crypto"
    CASHAPP = "cashapp"
    OTHER = "other"


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    category: Mapped[ProductCategory] = mapped_column(Enum(ProductCategory), nullable=False)
    icon_url: Mapped[str] = mapped_column(String, nullable=False)
    hero_image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    tagline: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    features: Mapped[List[str]] = mapped_column(JSON, nullable=False, default=list)
    sort_order: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_updated: Mapped[bool] = mapped_column(Boolean, default=False)

    vendor_links: Mapped[List["VendorLink"]] = relationship(
        back_populates="product", cascade="all, delete-orphan", passive_deletes=True
    )
    lowest_price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    vendor_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    tags: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    last_updated: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class VendorLink(Base):
    __tablename__ = "vendor_links"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    product_id: Mapped[str] = mapped_column(String, ForeignKey("products.id", ondelete="CASCADE"))
    vendor_name: Mapped[str] = mapped_column(String, nullable=False)
    url: Mapped[str] = mapped_column(String, nullable=False)
    redirect_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String, nullable=False)
    payment_methods: Mapped[List[str]] = mapped_column(JSON, nullable=False, default=list)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cta_label: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    product: Mapped[Product] = relationship(back_populates="vendor_links")
