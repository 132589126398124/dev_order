import { prisma } from "@/lib/prisma";
import { SHOP_NAME } from "@/lib/shop";

export default async function Footer() {
  const info = await prisma.shopSettings.findUnique({
    where: { id: "singleton" },
    select: { shopAddress: true, shopPhone: true },
  });

  return (
    <footer className="border-t border-slate-100 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-sm font-semibold text-slate-900 mb-2">{SHOP_NAME}</p>
        <div className="space-y-0.5">
          {info?.shopPhone && (
            <p className="text-xs text-slate-400">{info.shopPhone}</p>
          )}
          {info?.shopAddress && (
            <p className="text-xs text-slate-400 break-keep">{info.shopAddress}</p>
          )}
          {!info?.shopPhone && !info?.shopAddress && (
            <p className="text-xs text-slate-300">주소·연락처는 설정에서 입력할 수 있습니다</p>
          )}
        </div>
      </div>
    </footer>
  );
}
