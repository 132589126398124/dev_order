import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPin } from "@/lib/auth";
import { checkLoginRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const allowed = await checkLoginRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "잠시 후 다시 시도해주세요." }, { status: 429 });
  }

  const { username, pin, email } = await req.json();

  if (!username || typeof username !== "string" || username.length < 2 || username.length > 20) {
    return NextResponse.json({ error: "아이디는 2~20자로 입력해주세요" }, { status: 400 });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return NextResponse.json({ error: "아이디는 영문, 숫자, _만 사용 가능합니다" }, { status: 400 });
  }
  if (!pin || typeof pin !== "string" || pin.length !== 6 || !/^\d+$/.test(pin)) {
    return NextResponse.json({ error: "PIN은 숫자 6자리로 입력해주세요" }, { status: 400 });
  }
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "올바른 이메일을 입력해주세요" }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
    select: { username: true, email: true },
  });
  if (existing?.username === username) {
    return NextResponse.json({ error: "이미 사용 중인 아이디입니다" }, { status: 409 });
  }
  if (existing?.email === email) {
    return NextResponse.json({ error: "이미 사용 중인 이메일입니다" }, { status: 409 });
  }

  const pinHash = await hashPin(pin);
  await prisma.user.create({ data: { username, pinHash, email } });

  return NextResponse.json({ ok: true });
}
