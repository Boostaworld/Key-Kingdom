import { prisma } from "@/lib/prisma";
import {
  normalizeStringArray,
  parseStringArray,
  stringifyStringArray,
} from "@/lib/stringArrays";
import { NextRequest, NextResponse } from "next/server";
import { getAdminIdentityFromRequest } from "@/lib/adminAuth";
import { sendAdminAudit } from "@/lib/adminAudit";

async function resolveParams(
  params:
    | { productId: string; vendorId: string }
    | Promise<{ productId: string; vendorId: string }>
    | undefined,
  request: Request,
) {
  const resolved = await params;

  if (resolved?.productId && resolved?.vendorId) return resolved;

  const segments = new URL(request.url).pathname.split("/").filter(Boolean);
  const vendorId = segments.pop();
  const productId = segments.pop();

  return { productId: productId ?? "", vendorId: vendorId ?? "" };
}

export async function PUT(
  request: NextRequest,
  {
    params,
  }: { params: { productId: string; vendorId: string } | Promise<{ productId: string; vendorId: string }> },
) {
  const resolved = await resolveParams(params, request);
  if (!resolved.productId || !resolved.vendorId) {
    return NextResponse.json({ error: "Product id and vendor id are required" }, { status: 400 });
  }

  const body = await request.json();
  const updateData: Record<string, unknown> = {};

  if (body.vendorName) updateData.vendorName = body.vendorName;
  if (body.url) updateData.url = body.url;
  if (body.redirectUrl !== undefined) updateData.redirectUrl = body.redirectUrl;
  if (body.price !== undefined) updateData.price = Number(body.price);
  if (body.currency) updateData.currency = body.currency;
  if (body.paymentMethods)
    updateData.paymentMethods = stringifyStringArray(
      normalizeStringArray(body.paymentMethods),
    );
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.ctaLabel !== undefined) updateData.ctaLabel = body.ctaLabel;
  if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;

  try {
    const vendorLink = await prisma.vendorLink.update({
      where: { id: resolved.vendorId },
      data: updateData,
    });

    const identity = await getAdminIdentityFromRequest(request);
    await sendAdminAudit({
      action: "vendor_update",
      actor: identity?.username ?? identity?.source,
      details: { productId: resolved.productId, id: vendorLink.id, updates: updateData },
    });

    return NextResponse.json({
      ...vendorLink,
      paymentMethods: parseStringArray(vendorLink.paymentMethods),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update vendor link" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: { params: { productId: string; vendorId: string } | Promise<{ productId: string; vendorId: string }> },
) {
  const resolved = await resolveParams(params, request);
  if (!resolved.productId || !resolved.vendorId) {
    return NextResponse.json({ error: "Product id and vendor id are required" }, { status: 400 });
  }

  try {
    await prisma.vendorLink.delete({ where: { id: resolved.vendorId } });
    const identity = await getAdminIdentityFromRequest(request);
    await sendAdminAudit({
      action: "vendor_delete",
      actor: identity?.username ?? identity?.source,
      details: { productId: resolved.productId, id: resolved.vendorId },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to delete vendor link" }, { status: 500 });
  }
}
