import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import type { FilmItem } from "@/types/order";

export const metadata = { title: "내 접수 내역" };

export default async function MyOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/my/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">내 접수 내역</h1>
          <p className="text-sm text-slate-500 mt-0.5">총 {orders.length}건</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/my/profile" className="text-sm text-slate-500 px-3 py-2 rounded-xl font-medium hover:bg-slate-100 transition-colors">
            프로필
          </Link>
          <Link href="/order/new" className="bg-slate-900 text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-slate-800 transition-colors">
            + 새 접수
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <p className="text-2xl mb-3">📷</p>
          <p className="text-slate-500 font-medium mb-1">아직 접수 내역이 없어요</p>
          <p className="text-slate-400 text-sm mb-5">필름을 보내주시면 여기서 확인할 수 있습니다</p>
          <Link href="/order/new" className="inline-block bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
            첫 접수 시작하기 →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const items = (order.filmItems ?? []) as FilmItem[];
            return (
              <Link key={order.id} href={`/order/${order.id}`} className="block bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 hover:border-slate-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono font-bold text-slate-900 text-sm">{order.uniqueCode}</p>
                    <div className="mt-1 space-y-0.5">
                      {items.length > 0 ? items.map((item, i) => (
                        <p key={i} className="text-xs text-slate-500 truncate">
                          {item.filmType} · {item.format} · {item.quantity}롤 · {item.process}
                        </p>
                      )) : (
                        <p className="text-xs text-slate-400">필름 정보 없음</p>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">{format(order.createdAt, "yyyy.MM.dd HH:mm", { locale: ko })}</p>
                  </div>
                  <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
