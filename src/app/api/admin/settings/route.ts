import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { DEFAULT_SETTINGS, parseShopSettings } from "@/types/settings";

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const raw = await prisma.shopSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json(raw ? parseShopSettings(raw) : DEFAULT_SETTINGS);
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (body.adminEmail !== undefined && body.adminEmail) {
    if (typeof body.adminEmail !== "string" || body.adminEmail.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.adminEmail)) {
      return NextResponse.json({ error: "올바른 이메일을 입력해주세요" }, { status: 400 });
    }
  }
  if (body.orderNotice !== undefined && body.orderNotice) {
    if (typeof body.orderNotice !== "string" || body.orderNotice.length > 500) {
      return NextResponse.json({ error: "공지사항은 500자 이하로 입력해주세요" }, { status: 400 });
    }
  }

  const data: Record<string, unknown> = {};

  if (typeof body.acceptPushPull === "boolean") data.acceptPushPull = body.acceptPushPull;
  if (typeof body.acceptHalfFrame === "boolean") data.acceptHalfFrame = body.acceptHalfFrame;
  if (Array.isArray(body.disabledProcesses)) data.disabledProcesses = body.disabledProcesses;
  if (Array.isArray(body.disabledScanTypes)) data.disabledScanTypes = body.disabledScanTypes;
  if (Array.isArray(body.disabledResolutions)) data.disabledResolutions = body.disabledResolutions;
  if (Array.isArray(body.blockedFilms)) data.blockedFilms = body.blockedFilms;
  if (body.filmNotices !== undefined) data.filmNotices = body.filmNotices;
  if (body.orderNotice !== undefined) data.orderNotice = body.orderNotice || null;
  if (body.pricing !== undefined) data.pricing = body.pricing;
  if (body.adminEmail !== undefined) data.adminEmail = body.adminEmail || null;
  if (body.resolutionConfig !== undefined) data.resolutionConfig = body.resolutionConfig;
  if (typeof body.autoExpireDays === "number" && body.autoExpireDays >= 1) data.autoExpireDays = Math.floor(body.autoExpireDays);

  const raw = await prisma.shopSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });
  return NextResponse.json(parseShopSettings(raw));
}
