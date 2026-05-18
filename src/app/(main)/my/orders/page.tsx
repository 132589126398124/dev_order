import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import OrdersLoadMore from "@/components/my/OrdersLoadMore";

export const metadata = { title: "내 접수 내역" };

const PAGE_SIZE = 20;

export default async function MyOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/my/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
  });

  const hasMore = orders.length > PAGE_SIZE;
  const initialOrders = orders.slice(0, PAGE_SIZE);
  const initialCursor = hasMore ? initialOrders[initialOrders.length - 1].id : null;

  const total = await prisma.order.count({ where: { userId: session.userId } });

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">내 접수 내역</h1>
          <p className="text-sm text-slate-500 mt-0.5">총 {total}건</p>
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

      {initialOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <p className="text-2xl mb-3">📷</p>
          <p className="text-slate-500 font-medium mb-1">아직 접수 내역이 없어요</p>
          <p className="text-slate-400 text-sm mb-5">필름을 보내주시면 여기서 확인할 수 있습니다</p>
          <Link href="/order/new" className="inline-block bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
            첫 접수 시작하기 →
          </Link>
        </div>
      ) : (
        <OrdersLoadMore initialOrders={initialOrders} initialCursor={initialCursor} />
      )}
    </main>
  );
}
