import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { ids, status, scanFileUrl } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "선택된 항목이 없습니다" }, { status: 400 });
  }
  if (!Object.values(OrderStatus).includes(status)) {
    return NextResponse.json({ error: "올바르지 않은 상태값" }, { status: 400 });
  }

  const data: Record<string, unknown> = { status };
  if (status === "DONE" && scanFileUrl !== undefined) {
    data.scanFileUrl = (scanFileUrl as string) || null;
  }

  const result = await prisma.order.updateMany({
    where: { id: { in: ids } },
    data,
  });

  return NextResponse.json({ ok: true, count: result.count });
}
