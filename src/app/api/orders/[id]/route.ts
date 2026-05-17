import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateOrderStatusInSheet } from "@/lib/sheets";
import { sendStatusNotification } from "@/lib/email";
import { OrderStatus } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, trackingNumber, courierName, scanFileUrl, adminNotes } = body;

  const data: Record<string, unknown> = {};
  let statusChanged = false;

  if (status !== undefined) {
    if (!Object.values(OrderStatus).includes(status)) {
      return NextResponse.json({ error: "올바르지 않은 상태값" }, { status: 400 });
    }
    data.status = status;
    statusChanged = true;
  }
  if (trackingNumber !== undefined) data.trackingNumber = trackingNumber || null;
  if (courierName !== undefined) data.courierName = courierName || null;
  if (scanFileUrl !== undefined) data.scanFileUrl = scanFileUrl || null;
  if (adminNotes !== undefined) data.adminNotes = adminNotes || null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "변경할 데이터가 없습니다" }, { status: 400 });
  }

  const order = await prisma.order.update({ where: { id }, data });

  if (statusChanged) {
    await Promise.allSettled([
      order.sheetsRowIndex
        ? updateOrderStatusInSheet(order.sheetsRowIndex, status).catch((e) => console.error("Sheets:", e))
        : Promise.resolve(),
      sendStatusNotification(order.email, order.customerName, order.uniqueCode, order.id, status).catch((e) =>
        console.error("Email:", e)
      ),
    ]);
  }

  return NextResponse.json({ ok: true });
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
