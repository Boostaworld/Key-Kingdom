// web/data/products.ts
import { prisma } from "@/lib/prisma";
import { parseStringArray } from "@/lib/stringArrays";
import type { Product, VendorLink } from "./types";

const FALLBACK_SORT = Number.MAX_SAFE_INTEGER;

// ❌ No more PRODUCT_CATEGORIES or normalizeCategory – you said no categories.

/**
 * Loads products and vendor links from the persistent store and computes
 * derived fields such as lowestPrice, vendorCount, and sortOrder.
 */
export async function loadProducts(): Promise<Product[]> {
  const records = await prisma.product.findMany({
    include: { vendorLinks: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return records
    .map((record) => {
      // Make sure vendorLinks conform to VendorLink
      const vendorLinks: VendorLink[] = record.vendorLinks.map((link) => ({
        id: link.id,
        vendorName: link.vendorName,
        url: link.url,
        redirectUrl: link.redirectUrl ?? link.url,
        price: link.price,
        currency: link.currency,
        // parseStringArray returns string[], which is now PaymentMethod[] because PaymentMethod = string
        paymentMethods: parseStringArray(link.paymentMethods),
        notes: link.notes ?? undefined,
        ctaLabel: link.ctaLabel ?? undefined,
        avatarUrl: link.avatarUrl ?? undefined,
      }));

      const lowestPrice = vendorLinks.reduce(
        (price, vendor) => Math.min(price, vendor.price),
        Number.POSITIVE_INFINITY,
      );

      const product: Product = {
        id: record.id,
        name: record.name,
        slug: record.slug,
        iconUrl: record.iconUrl,
        heroImageUrl: record.heroImageUrl ?? undefined,
        tagline: record.tagline ?? undefined,
        description: record.description,
        features: parseStringArray(record.features),
        sortOrder: record.sortOrder ?? FALLBACK_SORT,
        isUpdated: record.isUpdated, // assuming this exists in your prisma model
        vendorLinks,
        lowestPrice: Number.isFinite(lowestPrice) ? lowestPrice : 0,
        vendorCount: vendorLinks.length,
        tags: parseStringArray(record.tags),
        lastUpdated: record.lastUpdated ?? undefined,
      };

      return product;
    })
    .sort(
      (a, b) => (a.sortOrder ?? FALLBACK_SORT) - (b.sortOrder ?? FALLBACK_SORT),
    );
}
