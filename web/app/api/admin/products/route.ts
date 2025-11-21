import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  normalizeStringArray,
  parseStringArray,
  stringifyStringArray,
} from "@/lib/stringArrays";
import { getAdminIdentityFromRequest } from "@/lib/adminAuth";
import { sendAdminAudit } from "@/lib/adminAudit";
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

export async function GET() {
  const products = await prisma.product.findMany({
    include: { vendorLinks: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(products.map(hydrateProduct));
}

export async function POST(request: Request) {
  const body = await request.json();

  const id = typeof body?.id === "string" ? body.id.trim() : String(body?.id ?? "").trim();
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  const iconUrl = typeof body?.iconUrl === "string" ? body.iconUrl.trim() : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : "";

  if (
    !id ||
    !name ||
    !slug ||
    !iconUrl ||
    !description ||
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

  const sortOrder = normalizeOptionalNumber(body.sortOrder);
  const heroImageUrl = normalizeOptionalString(body.heroImageUrl);
  const tagline = normalizeOptionalString(body.tagline);
  const lastUpdated = normalizeOptionalString(body.lastUpdated);

  try {
    const product = await prisma.product.create({
      data: {
        id,
        name,
        slug,

        iconUrl,
        heroImageUrl,
        tagline,
        description,
        features: stringifyStringArray(features),
        sortOrder,
        isUpdated: body.isUpdated,
        tags: stringifyStringArray(tags),
        lastUpdated,
        vendorLinks: vendorLinks.length ? { create: vendorLinks } : undefined,
      },
      include: { vendorLinks: true },
    });

    const identity = await getAdminIdentityFromRequest(request);
    await sendAdminAudit({
      action: "product_create",
      actor: identity?.username ?? identity?.source,
      details: { id: product.id, name: product.name },
    });

    return NextResponse.json(hydrateProduct(product), { status: 201 });
  } catch (error) {
    console.error(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Product id or slug already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Unable to create product" }, { status: 500 });
  }
}
