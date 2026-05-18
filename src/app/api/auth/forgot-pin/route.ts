import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPinResetLink } from "@/lib/email";
import { customAlphabet } from "nanoid";
import { addHours } from "date-fns";
import { checkLoginRateLimit } from "@/lib/rate-limit";

const tokenGen = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 32);

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const allowed = await checkLoginRateLimit(ip);
  if (!allowed) return NextResponse.json({ error: "잠시 후 다시 시도해주세요." }, { status: 429 });

  const { username, email } = await req.json();

  if (!username || typeof username !== "string" || !email || typeof email !== "string") {
    return NextResponse.json({ error: "아이디와 이메일을 입력해주세요" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { username, email },
    select: { id: true, username: true, email: true },
  });

  // 존재 여부를 노출하지 않음 — 항상 성공 응답
  if (user) {
    const resetToken = tokenGen();
    const resetExpires = addHours(new Date(), 1);
    await prisma.user.update({
      where: { id: user.id },
      data: { pinResetToken: resetToken, pinResetExpires: resetExpires },
    });
    await sendPinResetLink(user.email, user.username, resetToken).catch((e) =>
      console.error("PIN reset email failed:", e)
    );
  }

  return NextResponse.json({ ok: true });
}
