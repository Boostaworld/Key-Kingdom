// web/data/products.ts
import { prisma } from "@/lib/prisma";
import { parseStringArray } from "@/lib/stringArrays";
import type { Product } from "./types";

const FALLBACK_SORT = Number.MAX_SAFE_INTEGER;

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
      const vendorLinks = record.vendorLinks.map((link) => ({
        ...link,
        paymentMethods: parseStringArray(link.paymentMethods),
        redirectUrl: link.redirectUrl ?? link.url,
      }));

      const lowestPrice = vendorLinks.reduce(
        (price, vendor) => Math.min(price, vendor.price),
        Number.POSITIVE_INFINITY,
      );

      return {
        ...record,
        vendorLinks,
        features: parseStringArray(record.features),
        tags: parseStringArray(record.tags),
        lowestPrice: Number.isFinite(lowestPrice) ? lowestPrice : 0,
        vendorCount: vendorLinks.length,
        sortOrder: record.sortOrder ?? FALLBACK_SORT,
      } satisfies Product;
    })
    .sort(
      (a, b) => (a.sortOrder ?? FALLBACK_SORT) - (b.sortOrder ?? FALLBACK_SORT),
    );
}
