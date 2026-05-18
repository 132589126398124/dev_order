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

  if (trackingNumber !== undefined && trackingNumber && typeof trackingNumber === "string" && trackingNumber.length > 100) {
    return NextResponse.json({ error: "운송장 번호는 100자 이하로 입력해주세요" }, { status: 400 });
  }
  if (courierName !== undefined && courierName && typeof courierName === "string" && courierName.length > 50) {
    return NextResponse.json({ error: "택배사명은 50자 이하로 입력해주세요" }, { status: 400 });
  }
  if (scanFileUrl !== undefined && scanFileUrl && typeof scanFileUrl === "string" && scanFileUrl.length > 500) {
    return NextResponse.json({ error: "스캔 파일 링크는 500자 이하로 입력해주세요" }, { status: 400 });
  }
  if (adminNotes !== undefined && adminNotes && typeof adminNotes === "string" && adminNotes.length > 2000) {
    return NextResponse.json({ error: "메모는 2000자 이하로 입력해주세요" }, { status: 400 });
  }

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
  try {
    const session = await getSession();
    const { id } = await params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: "접수 건을 찾을 수 없습니다" }, { status: 404 });

    if (!session?.isAdmin && order.userId !== session?.userId) {
      return NextResponse.json({ error: "권한 없음" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (e) {
    console.error("Order GET unhandled error:", e);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
