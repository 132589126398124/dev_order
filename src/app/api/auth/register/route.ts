import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPin, getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "관리자만 계정 생성 가능합니다" }, { status: 403 });
  }

  const { username, pin } = await req.json();

  if (!username || !pin || typeof pin !== "string" || pin.length !== 6 || !/^\d+$/.test(pin)) {
    return NextResponse.json({ error: "아이디와 숫자 6자리 PIN을 입력해주세요" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) {
    return NextResponse.json({ error: "이미 사용 중인 아이디입니다" }, { status: 409 });
  }

  const pinHash = await hashPin(pin);
  const user = await prisma.user.create({ data: { username, pinHash } });

  return NextResponse.json({ ok: true, userId: user.id });
}
