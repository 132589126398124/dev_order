import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPin, verifyPin, timingSafeStringEqual } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { currentPin, newPin } = await req.json();

  if (typeof currentPin !== "string" || typeof newPin !== "string") {
    return NextResponse.json({ error: "입력값 오류" }, { status: 400 });
  }
  if (!/^\d{6}$/.test(newPin)) {
    return NextResponse.json({ error: "새 PIN은 숫자 6자리여야 합니다" }, { status: 400 });
  }

  // Verify current PIN: DB hash first, env fallback
  const settings = await prisma.shopSettings.findUnique({
    where: { id: "singleton" },
    select: { adminPinHash: true },
  });

  let valid = false;
  if (settings?.adminPinHash) {
    valid = await verifyPin(currentPin, settings.adminPinHash);
  } else {
    const adminPin = process.env.ADMIN_PIN ?? "";
    valid = adminPin.length > 0 && timingSafeStringEqual(currentPin, adminPin);
  }

  if (!valid) return NextResponse.json({ error: "현재 PIN이 올바르지 않습니다" }, { status: 401 });

  const adminPinHash = await hashPin(newPin);
  await prisma.shopSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", adminPinHash },
    update: { adminPinHash },
  });

  return NextResponse.json({ ok: true });
}
