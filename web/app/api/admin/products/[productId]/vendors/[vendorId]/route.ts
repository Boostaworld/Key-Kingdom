import { prisma } from "@/lib/prisma";
import {
  normalizeStringArray,
  parseStringArray,
  stringifyStringArray,
} from "@/lib/stringArrays";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { productId: string; vendorId: string } },
) {
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
      where: { id: params.vendorId },
      data: updateData,
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
  _request: Request,
  { params }: { params: { vendorId: string } },
) {
  try {
    await prisma.vendorLink.delete({ where: { id: params.vendorId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to delete vendor link" }, { status: 500 });
  }
}
