import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { DEFAULT_SETTINGS, parseShopSettings } from "@/types/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const raw = await prisma.shopSettings.findUnique({ where: { id: "singleton" } });
  if (!raw) return NextResponse.json(DEFAULT_SETTINGS);
  const settings = parseShopSettings(raw);
  settings.adminEmail = null;
  return NextResponse.json(settings);
}

