import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";
import { sendStatusNotification } from "@/lib/email";
import { timingSafeStringEqual } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  if (!timingSafeStringEqual(authHeader, `Bearer ${process.env.CRON_SECRET ?? ""}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.shopSettings.findUnique({
    where: { id: "singleton" },
    select: { autoExpireDays: true },
  });
  const expireDays = settings?.autoExpireDays ?? 7;
  const cutoff = subDays(new Date(), expireDays);

  const toExpire = await prisma.order.findMany({
    where: { status: "PENDING", createdAt: { lt: cutoff } },
    select: { id: true, email: true, customerName: true, uniqueCode: true },
  });

  if (toExpire.length === 0) {
    return NextResponse.json({ expired: 0 });
  }

  await prisma.order.updateMany({
    where: { id: { in: toExpire.map((o) => o.id) }, status: "PENDING" },
    data: { status: "EXPIRED" },
  });

  await Promise.allSettled(
    toExpire.map((o) =>
      sendStatusNotification(o.email, o.customerName, o.uniqueCode, o.id, "EXPIRED").catch((e) =>
        console.error("Expire notification failed:", e)
      )
    )
  );

  return NextResponse.json({ expired: toExpire.length });
}
