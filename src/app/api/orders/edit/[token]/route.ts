import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { orderSchema } from "@/types/order";

async function resolveOrder(token: string) {
  const [order, session] = await Promise.all([
    prisma.order.findUnique({ where: { editToken: token } }),
    getSession(),
  ]);
  if (!order) return { order: null, session, allowed: false, reason: "not_found" };

  const isOwner = session && !session.isAdmin && order.userId === session.userId;
  const tokenValid = order.editTokenExpires && order.editTokenExpires >= new Date();

  if (!isOwner && !tokenValid) return { order, session, allowed: false, reason: "expired" };
  if (["PROCESSING", "DONE", "CANCELLED"].includes(order.status)) {
    return { order, session, allowed: false, reason: "locked" };
  }
  return { order, session, allowed: true, reason: null };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { order, allowed, reason } = await resolveOrder(token);

  if (!order) return NextResponse.json({ error: "유효하지 않거나 만료된 링크입니다" }, { status: 404 });
  if (!allowed) {
    const msg = reason === "locked" ? "작업이 시작되어 수정이 불가능합니다" : "유효하지 않거나 만료된 링크입니다";
    return NextResponse.json({ error: msg }, { status: reason === "locked" ? 403 : 404 });
  }
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { order, allowed, reason } = await resolveOrder(token);

  if (!order) return NextResponse.json({ error: "유효하지 않거나 만료된 링크입니다" }, { status: 404 });
  if (!allowed) {
    const msg = reason === "locked" ? "작업이 시작되어 수정이 불가능합니다" : "유효하지 않거나 만료된 링크입니다";
    return NextResponse.json({ error: msg }, { status: reason === "locked" ? 403 : 404 });
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
