import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPin, createSession } from "@/lib/auth";
import { checkLoginRateLimit } from "@/lib/rate-limit";


export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  const allowed = await checkLoginRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
  }

  const { username, pin } = await req.json();

  if (!username || !pin || typeof pin !== "string" || pin.length !== 6) {
    return NextResponse.json({ error: "아이디와 6자리 PIN을 입력해주세요" }, { status: 400 });
  }

  const isAdmin = username === process.env.ADMIN_USERNAME;

  if (isAdmin) {
    const dbSettings = await prisma.shopSettings.findUnique({
      where: { id: "singleton" },
      select: { adminPinHash: true },
    });

    let valid = false;
    if (dbSettings?.adminPinHash) {
      valid = await verifyPin(pin, dbSettings.adminPinHash);
    } else {
      const adminPin = process.env.ADMIN_PIN;
      valid = !!adminPin && pin === adminPin;
    }

    if (!valid) {
      return NextResponse.json({ error: "아이디 또는 PIN이 올바르지 않습니다" }, { status: 401 });
    }
    await createSession("admin", username, true);
    return NextResponse.json({ ok: true, isAdmin: true });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return NextResponse.json({ error: "아이디 또는 PIN이 올바르지 않습니다" }, { status: 401 });
  }

  const valid = await verifyPin(pin, user.pinHash);
  if (!valid) {
    return NextResponse.json({ error: "아이디 또는 PIN이 올바르지 않습니다" }, { status: 401 });
  }

  await createSession(user.id, user.username, false);
  return NextResponse.json({ ok: true, isAdmin: false });
}
