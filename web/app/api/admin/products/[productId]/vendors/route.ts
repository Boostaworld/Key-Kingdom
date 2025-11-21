import { prisma } from "@/lib/prisma";
import { parseStringArray, stringifyStringArray } from "@/lib/stringArrays";
import { NextRequest, NextResponse } from "next/server";
import { getAdminIdentityFromRequest } from "@/lib/adminAuth";
import { sendAdminAudit } from "@/lib/adminAudit";

async function resolveProductId(
  params: { productId: string } | Promise<{ productId: string }> | undefined,
  request: Request,
) {
  const resolved = await params;

  if (resolved?.productId) return resolved.productId;

  const segments = new URL(request.url).pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "";
}

export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } | Promise<{ productId: string }> },
) {
  const productId = await resolveProductId(params, request);
  if (!productId) {
    return NextResponse.json({ error: "Product id is required" }, { status: 400 });
  }

  const body = await request.json();

  if (!body?.id || !body.vendorName || !body.url || body.price === undefined || !body.currency) {
    return NextResponse.json({ error: "Missing required vendor fields" }, { status: 400 });
  }

  try {
    const vendorLink = await prisma.vendorLink.create({
      data: {
        id: String(body.id),
        vendorName: body.vendorName,
        url: body.url,
        redirectUrl: body.redirectUrl ?? null,
        price: Number(body.price),
        currency: body.currency,
        paymentMethods: stringifyStringArray(body.paymentMethods),
        notes: body.notes ?? null,
        ctaLabel: body.ctaLabel ?? null,
        avatarUrl: body.avatarUrl ?? null,
        productId,
      },
    });

    const identity = await getAdminIdentityFromRequest(request);
    await sendAdminAudit({
      action: "vendor_create",
      actor: identity?.username ?? identity?.source,
      details: { productId, id: vendorLink.id, vendorName: vendorLink.vendorName },
    });

    return NextResponse.json(
      {
        ...vendorLink,
        paymentMethods: parseStringArray(vendorLink.paymentMethods),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create vendor link" }, { status: 500 });
  }
}
