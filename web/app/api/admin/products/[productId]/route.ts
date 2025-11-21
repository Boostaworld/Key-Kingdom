import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  normalizeStringArray,
  parseStringArray,
  stringifyStringArray,
} from "@/lib/stringArrays";
import { NextResponse } from "next/server";
import { getAdminIdentityFromRequest } from "@/lib/adminAuth";
import { sendAdminAudit } from "@/lib/adminAudit";

async function resolveProductId(
  params: { productId?: string } | Promise<{ productId?: string }> | undefined,
  request: Request,
) {
  const resolved = await params;

  if (resolved?.productId) return resolved.productId;
  const segments = new URL(request.url).pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? null;
}

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

export async function GET(
  request: Request,
  { params }: { params: { productId: string } | Promise<{ productId: string }> },
) {
  const productId = await resolveProductId(params, request);
  if (!productId) {
    return NextResponse.json({ error: "Product id is required" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { vendorLinks: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(hydrateProduct(product));
}

export async function PUT(
  request: Request,
  { params }: { params: { productId: string } | Promise<{ productId: string }> },
) {
  const productId = await resolveProductId(params, request);
  if (!productId) {
    return NextResponse.json({ error: "Product id is required" }, { status: 400 });
  }

  const body = await request.json();
  const updateData: Record<string, unknown> = {};

  if (body.name) updateData.name = body.name;
  if (body.slug) updateData.slug = body.slug;
  if (body.category) updateData.category = body.category;
  if (body.iconUrl) updateData.iconUrl = body.iconUrl;
  if (body.heroImageUrl !== undefined) updateData.heroImageUrl = body.heroImageUrl;
  if (body.tagline !== undefined) updateData.tagline = body.tagline;
  if (body.description) updateData.description = body.description;
  if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
  if (body.isUpdated !== undefined) updateData.isUpdated = body.isUpdated;
  if (body.lastUpdated !== undefined) updateData.lastUpdated = body.lastUpdated;

  if (body.features)
    updateData.features = stringifyStringArray(
      normalizeStringArray(body.features),
    );
  if (body.tags)
    updateData.tags = stringifyStringArray(normalizeStringArray(body.tags));

  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: { vendorLinks: true },
    });

    const identity = await getAdminIdentityFromRequest(request);
    await sendAdminAudit({
      action: "product_update",
      actor: identity?.username ?? identity?.source,
      details: { id: product.id, updates: updateData },
    });

    return NextResponse.json(hydrateProduct(product));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } | Promise<{ productId: string }> },
) {
  const productId = await resolveProductId(params, request);
  if (!productId) {
    return NextResponse.json({ error: "Product id is required" }, { status: 400 });
  }

  try {
    await prisma.product.delete({ where: { id: productId } });
    const identity = await getAdminIdentityFromRequest(request);
    await sendAdminAudit({
      action: "product_delete",
      actor: identity?.username ?? identity?.source,
      details: { id: productId },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to delete product" }, { status: 500 });
  }
}
