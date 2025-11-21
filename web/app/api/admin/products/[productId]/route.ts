import { Prisma } from "@prisma/client";
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

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function normalizeOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
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

  if ("name" in body && typeof body.name === "string")
    updateData.name = body.name.trim();
  if ("slug" in body && typeof body.slug === "string")
    updateData.slug = body.slug.trim();
  if ("iconUrl" in body && typeof body.iconUrl === "string")
    updateData.iconUrl = body.iconUrl.trim();
  if ("heroImageUrl" in body)
    updateData.heroImageUrl = normalizeOptionalString(body.heroImageUrl);
  if ("tagline" in body) updateData.tagline = normalizeOptionalString(body.tagline);
  if ("description" in body && typeof body.description === "string")
    updateData.description = body.description.trim();
  if ("sortOrder" in body) updateData.sortOrder = normalizeOptionalNumber(body.sortOrder);
  if ("isUpdated" in body) updateData.isUpdated = Boolean(body.isUpdated);
  if ("lastUpdated" in body)
    updateData.lastUpdated = normalizeOptionalString(body.lastUpdated);

  if ("features" in body)
    updateData.features = stringifyStringArray(
      normalizeStringArray(body.features),
    );
  if ("tags" in body)
    updateData.tags = stringifyStringArray(normalizeStringArray(body.tags));

  if (!Object.keys(updateData).length) {
    return NextResponse.json(
      { error: "No product fields provided for update" },
      { status: 400 },
    );
  }

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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Product id or slug already exists" },
        { status: 409 },
      );
    }
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
