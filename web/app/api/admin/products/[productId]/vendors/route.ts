import { prisma } from "@/lib/prisma";
import { parseStringArray, stringifyStringArray } from "@/lib/stringArrays";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { productId: string } },
) {
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
        productId: params.productId,
      },
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
