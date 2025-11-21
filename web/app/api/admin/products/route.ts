import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  normalizeStringArray,
  parseStringArray,
  stringifyStringArray,
} from "@/lib/stringArrays";
import { NextResponse } from "next/server";

type ProductWithVendors = Prisma.ProductGetPayload<{ include: { vendorLinks: true } }>;

function hydrateProduct(record: ProductWithVendors) {
  return {
    ...record,
    features: parseStringArray(record.features),
    tags: parseStringArray(record.tags),
    vendorLinks: record.vendorLinks?.map((link) => ({
      ...link,
      paymentMethods: parseStringArray(link.paymentMethods),
    })),
  };
}

export async function GET() {
  const products = await prisma.product.findMany({
    include: { vendorLinks: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(products.map(hydrateProduct));
}

export async function POST(request: Request) {
  const body = await request.json();

  if (
    !body?.id ||
    !body.name ||
    !body.slug ||
    
    !body.iconUrl ||
    !body.description ||
    !Array.isArray(body.features) ||
    typeof body.isUpdated !== "boolean"
  ) {
    return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
  }

  const tags = normalizeStringArray(body.tags);
  const features = normalizeStringArray(body.features);
  const vendorLinks = Array.isArray(body.vendorLinks)
    ? body.vendorLinks.map((link: Record<string, unknown>) => ({
        id: String(link.id),
        vendorName: String(link.vendorName),
        url: String(link.url),
        redirectUrl: link.redirectUrl ? String(link.redirectUrl) : undefined,
        ctaLabel: link.ctaLabel ? String(link.ctaLabel) : undefined,
        price: Number(link.price),
        currency: String(link.currency),
        paymentMethods: stringifyStringArray(link.paymentMethods),
        notes: link.notes ? String(link.notes) : undefined,
        avatarUrl: link.avatarUrl ? String(link.avatarUrl) : undefined,
      }))
    : [];

  try {
    const product = await prisma.product.create({
      data: {
        id: String(body.id),
        name: body.name,
        slug: body.slug,
        
        iconUrl: body.iconUrl,
        heroImageUrl: body.heroImageUrl ?? null,
        tagline: body.tagline ?? null,
        description: body.description,
        features: stringifyStringArray(features),
        sortOrder: body.sortOrder ?? null,
        isUpdated: body.isUpdated,
        tags: stringifyStringArray(tags),
        lastUpdated: body.lastUpdated ?? null,
        vendorLinks: vendorLinks.length ? { create: vendorLinks } : undefined,
      },
      include: { vendorLinks: true },
    });

    return NextResponse.json(hydrateProduct(product), { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create product" }, { status: 500 });
  }
}
