import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { DEFAULT_SETTINGS } from "@/types/settings";
import type { ShopSettings } from "@/types/settings";

export async function GET() {
  const raw = await prisma.shopSettings.findUnique({ where: { id: "singleton" } });
  if (!raw) return NextResponse.json(DEFAULT_SETTINGS);
  const settings: ShopSettings = {
    acceptPushPull: raw.acceptPushPull,
    acceptHalfFrame: raw.acceptHalfFrame,
    disabledProcesses: raw.disabledProcesses,
    disabledScanTypes: raw.disabledScanTypes,
    disabledResolutions: raw.disabledResolutions,
    blockedFilms: raw.blockedFilms,
    filmNotices: (raw.filmNotices as Record<string, string>) ?? {},
    orderNotice: raw.orderNotice,
  };
  return NextResponse.json(settings);
}
