import OrderForm from "@/components/order/OrderForm";
import Script from "next/script";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS, DEFAULT_PRICING } from "@/types/settings";
import type { ShopSettings } from "@/types/settings";
import Link from "next/link";

export const metadata = { title: "접수 신청" };

export default async function NewOrderPage() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const [session, rawSettings] = await Promise.all([
    getSession(),
    prisma.shopSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  const settings: ShopSettings = rawSettings
    ? {
        acceptPushPull: rawSettings.acceptPushPull,
        acceptHalfFrame: rawSettings.acceptHalfFrame,
        disabledProcesses: rawSettings.disabledProcesses,
        disabledScanTypes: rawSettings.disabledScanTypes,
        disabledResolutions: rawSettings.disabledResolutions,
        blockedFilms: rawSettings.blockedFilms,
        filmNotices: (rawSettings.filmNotices as Record<string, string>) ?? {},
        orderNotice: rawSettings.orderNotice,
        pricing: (rawSettings.pricing as unknown as ShopSettings["pricing"]) ?? DEFAULT_PRICING,
      }
    : DEFAULT_SETTINGS;

  return (
    <>
      {siteKey && !siteKey.includes("your-site") && (
        <Script src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`} strategy="beforeInteractive" />
      )}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">필름 현상 접수</h1>
          <p className="text-slate-500 text-sm mt-1">접수 후 필름을 택배로 발송해주세요</p>
        </div>
        {!session && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">로그인</span>하면 접수 내역을 언제든 다시 확인할 수 있어요.
            </p>
            <Link
              href="/login"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap underline underline-offset-2 transition-colors"
            >
              로그인
            </Link>
          </div>
        )}
        <OrderForm userId={session?.userId} settings={settings} />
      </main>
    </>
  );
}
