import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/types/order";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await prisma.order.findUnique({ where: { editToken: token } });

  if (!order || !order.editTokenExpires || order.editTokenExpires < new Date()) {
    return NextResponse.json({ error: "유효하지 않거나 만료된 링크입니다" }, { status: 404 });
  }
  if (["PROCESSING", "DONE", "CANCELLED"].includes(order.status)) {
    return NextResponse.json({ error: "작업이 시작되어 수정이 불가능합니다" }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await prisma.order.findUnique({ where: { editToken: token } });

  if (!order || !order.editTokenExpires || order.editTokenExpires < new Date()) {
    return NextResponse.json({ error: "유효하지 않거나 만료된 링크입니다" }, { status: 404 });
  }
  if (["PROCESSING", "DONE", "CANCELLED"].includes(order.status)) {
    return NextResponse.json({ error: "작업이 시작되어 수정이 불가능합니다" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = orderSchema.safeParse({ ...body, recaptchaToken: "skip" });
  if (!parsed.success) return NextResponse.json({ error: "입력값을 확인해주세요" }, { status: 400 });

  const { recaptchaToken, filmItems, ...rest } = parsed.data;

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { ...rest, filmItems: filmItems as any },
  });

  return NextResponse.json({ ok: true, uniqueCode: updated.uniqueCode });
}
