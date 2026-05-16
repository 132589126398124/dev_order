import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateOrderStatusInSheet } from "@/lib/sheets";
import { OrderStatus } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!Object.values(OrderStatus).includes(status)) {
    return NextResponse.json({ error: "올바르지 않은 상태값" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
  });

  if (order.sheetsRowIndex) {
    try {
      await updateOrderStatusInSheet(order.sheetsRowIndex, status);
    } catch (e) {
      console.error("Sheets update failed:", e);
    }
  }

  return NextResponse.json({ ok: true, status });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "접수 건을 찾을 수 없습니다" }, { status: 404 });

  if (!session?.isAdmin && order.userId !== session?.userId) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  return NextResponse.json(order);
}
