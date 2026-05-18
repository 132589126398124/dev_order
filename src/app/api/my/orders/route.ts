import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.isAdmin) return NextResponse.json({ error: "권한 없음" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const take = 20;

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = orders.length > take;
  return NextResponse.json({
    orders: orders.slice(0, take),
    nextCursor: hasMore ? orders[take - 1].id : null,
  });
}
