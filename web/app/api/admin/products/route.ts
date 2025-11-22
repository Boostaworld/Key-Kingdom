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

function normalizeRequiredString(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value).trim();
  return "";
}

function normalizeOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

type VendorLinkInput = {
  id?: unknown;
  vendorName?: unknown;
  url?: unknown;
  redirectUrl?: unknown;
  ctaLabel?: unknown;
  price?: unknown;
  currency?: unknown;
  paymentMethods?: unknown;
  notes?: unknown;
  avatarUrl?: unknown;
};

function normalizeVendorLinks(value: unknown): {
  vendorLinks: {
    id: string;
    vendorName: string;
    url: string;
    redirectUrl?: string;
    ctaLabel?: string;
    price: number;
    currency: string;
    paymentMethods: string;
    notes?: string;
    avatarUrl?: string;
  }[];
  error: string | null;
} {
  if (!Array.isArray(value)) return { vendorLinks: [], error: null };

  const vendorLinks = [] as {
    id: string;
    vendorName: string;
    url: string;
    redirectUrl?: string;
    ctaLabel?: string;
    price: number;
    currency: string;
    paymentMethods: string;
    notes?: string;
    avatarUrl?: string;
  }[];

  for (const rawLink of value as VendorLinkInput[]) {
    const id = typeof rawLink.id === "string" ? rawLink.id.trim() : String(rawLink.id ?? "").trim();
    const vendorName = typeof rawLink.vendorName === "string" ? rawLink.vendorName.trim() : "";
    const url = typeof rawLink.url === "string" ? rawLink.url.trim() : "";
    const currency = typeof rawLink.currency === "string" ? rawLink.currency.trim() : "";
    const price = Number(rawLink.price);

    if (!id || !vendorName || !url || !currency || !Number.isFinite(price)) {
      return {
        vendorLinks: [],
        error: "Each vendor link must include id, vendorName, url, currency, and a numeric price.",
      };
    }

    vendorLinks.push({
      id,
      vendorName,
      url,
      redirectUrl: normalizeOptionalString(rawLink.redirectUrl) ?? undefined,
      ctaLabel: normalizeOptionalString(rawLink.ctaLabel) ?? undefined,
      price,
      currency,
      paymentMethods: stringifyStringArray(rawLink.paymentMethods),
      notes: normalizeOptionalString(rawLink.notes) ?? undefined,
      avatarUrl: normalizeOptionalString(rawLink.avatarUrl) ?? undefined,
    });
  }

  return { vendorLinks, error: null };
}

export async function GET() {
  const products = await prisma.product.findMany({
    include: { vendorLinks: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(products.map(hydrateProduct));
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Failed to parse product payload", error);
    return NextResponse.json(
      { error: "Invalid JSON body. Please retry the request." },
      { status: 400 },
    );
  }

  const id = normalizeRequiredString(body.id);
  const name = normalizeRequiredString(body.name);
  const slug = normalizeRequiredString(body.slug);
  const iconUrl = normalizeRequiredString(body.iconUrl);
  const description = normalizeRequiredString(body.description);

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
  const { vendorLinks, error: vendorLinksError } = normalizeVendorLinks(body.vendorLinks);
  if (vendorLinksError) {
    return NextResponse.json({ error: vendorLinksError }, { status: 400 });
  }

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
    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        { error: "Product payload is invalid. Please check required fields and vendor link pricing." },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Unable to create product" }, { status: 500 });
  }
}
