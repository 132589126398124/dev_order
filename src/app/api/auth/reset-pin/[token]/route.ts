import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPin } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { newPin } = await req.json();

  if (!newPin || !/^\d{6}$/.test(newPin)) {
    return NextResponse.json({ error: "PIN은 숫자 6자리여야 합니다" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { pinResetToken: token },
    select: { id: true, pinResetExpires: true },
  });

  if (!user || !user.pinResetExpires || user.pinResetExpires < new Date()) {
    return NextResponse.json({ error: "링크가 만료되었거나 유효하지 않습니다" }, { status: 400 });
  }

  const pinHash = await hashPin(newPin);
  await prisma.user.update({
    where: { id: user.id },
    data: { pinHash, pinResetToken: null, pinResetExpires: null },
  });

  return NextResponse.json({ ok: true });
}
