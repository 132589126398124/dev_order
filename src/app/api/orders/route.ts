import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/types/order";
import { generateUniqueCode } from "@/lib/unique-code";
import { appendOrderToSheet } from "@/lib/sheets";
import { sendOrderConfirmation, sendEditLink } from "@/lib/email";
import { checkOrderRateLimit } from "@/lib/rate-limit";
import { getSession } from "@/lib/auth";
import { customAlphabet } from "nanoid";
import { addHours } from "date-fns";

const tokenGen = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 32);

async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!process.env.RECAPTCHA_SECRET_KEY) return true;
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  });
  const data = await res.json();
  return data.success && data.score >= 0.5;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  const allowed = await checkOrderRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "잠시 후 다시 시도해주세요. (시간당 5건 제한)" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값을 확인해주세요", details: parsed.error.flatten() }, { status: 400 });
  }

  const valid = await verifyRecaptcha(parsed.data.recaptchaToken);
  if (!valid) {
    return NextResponse.json({ error: "보안 검증에 실패했습니다" }, { status: 400 });
  }

  const session = await getSession();
  const { recaptchaToken, ...orderData } = parsed.data;

  const uniqueCode = generateUniqueCode();
  const editToken = tokenGen();
  const editTokenExpires = addHours(new Date(), 48);

  const order = await prisma.order.create({
    data: {
      ...orderData,
      uniqueCode,
      userId: session?.userId ?? null,
      editToken,
      editTokenExpires,
    },
  });

  let sheetsRowIndex = -1;
  try {
    sheetsRowIndex = await appendOrderToSheet(order);
    if (sheetsRowIndex > 0) {
      await prisma.order.update({
        where: { id: order.id },
        data: { sheetsRowIndex },
      });
    }
  } catch (e) {
    console.error("Sheets append failed:", e);
  }

  try {
    await sendOrderConfirmation(order.email, order.customerName, order.uniqueCode);
    if (!session) {
      await sendEditLink(order.email, order.customerName, order.uniqueCode, editToken);
    }
  } catch (e) {
    console.error("Email send failed:", e);
  }

  return NextResponse.json({
    id: order.id,
    uniqueCode: order.uniqueCode,
    editToken: session ? null : editToken,
  });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const status = searchParams.get("status") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const where = {
    ...(status ? { status: status as any } : {}),
    ...(search ? {
      OR: [
        { uniqueCode: { contains: search, mode: "insensitive" as const } },
        { customerName: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search } },
      ],
    } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, limit });
}
