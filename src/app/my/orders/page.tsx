import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";

export default async function MyOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">내 접수 내역</h1>
        <Link href="/order/new" className="text-sm bg-black text-white px-4 py-2 rounded-lg">새 접수</Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>접수 내역이 없습니다</p>
          <Link href="/order/new" className="text-sm underline mt-2 block">첫 접수 하러가기</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-xl p-4 hover:border-gray-400 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono font-bold text-sm">{order.uniqueCode}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.filmType} · {order.format} · {order.quantity}롤 · {order.process}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(order.createdAt, "yyyy.MM.dd HH:mm", { locale: ko })}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
