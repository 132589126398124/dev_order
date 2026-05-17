import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ShopSettingsForm from "@/components/admin/ShopSettingsForm";
import { DEFAULT_SETTINGS, DEFAULT_PRICING, DEFAULT_RESOLUTION_CONFIG } from "@/types/settings";
import type { ShopSettings } from "@/types/settings";
import Link from "next/link";

export const metadata = { title: "관리자 — 접수 설정" };

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/login");

  const raw = await prisma.shopSettings.findUnique({ where: { id: "singleton" } });
  const settings: ShopSettings = raw
    ? {
        acceptPushPull: raw.acceptPushPull,
        acceptHalfFrame: raw.acceptHalfFrame,
        disabledProcesses: raw.disabledProcesses,
        disabledScanTypes: raw.disabledScanTypes,
        disabledResolutions: raw.disabledResolutions,
        blockedFilms: raw.blockedFilms,
        filmNotices: (raw.filmNotices as Record<string, string>) ?? {},
        orderNotice: raw.orderNotice,
        pricing: (raw.pricing as unknown as ShopSettings["pricing"]) ?? DEFAULT_PRICING,
        adminEmail: raw.adminEmail ?? null,
        resolutionConfig: (raw.resolutionConfig as unknown as ShopSettings["resolutionConfig"]) ?? DEFAULT_RESOLUTION_CONFIG,
        autoExpireDays: raw.autoExpireDays ?? 7,
      }
    : DEFAULT_SETTINGS;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">접수 설정</h1>
          <p className="text-slate-500 text-sm mt-0.5">접수 폼 커스텀 및 의뢰 제한을 관리합니다</p>
        </div>
        <Link
          href="/admin/orders"
          className="text-sm border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
        >
          접수 관리
        </Link>
      </div>
      <ShopSettingsForm initialSettings={settings} />
    </main>
  );
}
