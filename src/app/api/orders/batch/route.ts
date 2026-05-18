import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";
import { sendStatusNotification } from "@/lib/email";
import { updateOrderStatusInSheet } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { ids, status, scanFileUrl, scanFileUrls } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "선택된 항목이 없습니다" }, { status: 400 });
  }
  if (ids.length > 200) {
    return NextResponse.json({ error: "한 번에 최대 200건까지 처리 가능합니다" }, { status: 400 });
  }
  if (!Object.values(OrderStatus).includes(status)) {
    return NextResponse.json({ error: "올바르지 않은 상태값" }, { status: 400 });
  }

  // For DONE status with individual scan URLs, update each order in a transaction
  if (status === "DONE" && scanFileUrls && typeof scanFileUrls === "object") {
    await prisma.$transaction(
      ids.map((id: string) =>
        prisma.order.update({
          where: { id },
          data: { status, scanFileUrl: (scanFileUrls[id] as string) || null },
        })
      )
    );
  } else {
    const data: Record<string, unknown> = { status };
    if (status === "DONE" && scanFileUrl !== undefined) {
      data.scanFileUrl = (scanFileUrl as string) || null;
    }
    await prisma.order.updateMany({ where: { id: { in: ids } }, data });
  }

  const updatedOrders = await prisma.order.findMany({
    where: { id: { in: ids } },
    select: { id: true, email: true, customerName: true, uniqueCode: true, sheetsRowIndex: true },
  });

  await Promise.allSettled([
    ...updatedOrders.map((o) =>
      sendStatusNotification(o.email, o.customerName, o.uniqueCode, o.id, status).catch((e) =>
        console.error("Batch email:", e)
      )
    ),
    ...updatedOrders
      .filter((o) => o.sheetsRowIndex != null)
      .map((o) =>
        updateOrderStatusInSheet(o.sheetsRowIndex ?? -1, status).catch((e) =>
          console.error("Batch sheets:", e)
        )
      ),
  ]);

  return NextResponse.json({ ok: true, count: ids.length });
}
