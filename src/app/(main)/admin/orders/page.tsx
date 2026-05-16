import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import AdminStatusSelect from "@/components/admin/AdminStatusSelect";
import AdminSearch from "@/components/admin/AdminSearch";
import { Suspense } from "react";
import Link from "next/link";
import type { FilmItem } from "@/types/order";

export const metadata = { title: "관리자 — 접수 관리" };

interface Props { searchParams: Promise<{ status?: string; search?: string; page?: string }> }

export default async function AdminOrdersPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/login");

  const { status, search, page: pageStr } = await searchParams;
  const page = parseInt(pageStr ?? "1");
  const limit = 50;

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
    prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.order.count({ where }),
  ]);
  const totalPages = Math.ceil(total / limit);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">접수 관리</h1>
          <p className="text-sm text-slate-500 mt-0.5">총 {total}건</p>
        </div>
        <Link href="/order/new" className="text-sm border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">+ 직접 접수</Link>
      </div>

      <Suspense fallback={<div className="h-10 bg-slate-100 rounded-lg animate-pulse mb-4" />}>
        <AdminSearch />
      </Suspense>

      <div className="flex gap-2 mb-4 flex-wrap">
        {[undefined, "PENDING", "SHIPPED", "PROCESSING", "DONE", "EXPIRED", "CANCELLED"].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `/admin/orders?status=${s}` : "/admin/orders"}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors font-medium ${
              status === s || (!status && !s)
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
            }`}
          >
            {s ? ORDER_STATUS_LABELS[s] : "전체"}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["고유코드", "고객명", "연락처", "필름", "수령", "접수일", "상태", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-slate-400 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map((order) => {
                const items = (order.filmItems ?? []) as FilmItem[];
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                      <Link href={`/order/${order.id}`} className="hover:text-blue-600 transition-colors">{order.uniqueCode}</Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{order.customerName}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{order.phone}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[180px]">
                      {items.map((item, i) => (
                        <div key={i} className="text-xs truncate">{item.filmType} ({item.format}) ×{item.quantity}</div>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{order.pickupMethod}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{format(order.createdAt, "MM.dd HH:mm", { locale: ko })}</td>
                    <td className="px-4 py-3">
                      <AdminStatusSelect orderId={order.id} currentStatus={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/order/${order.id}/print`} target="_blank" className="text-xs text-blue-600 hover:underline whitespace-nowrap">출력</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/orders?page=${p}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}
              className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                page === p ? "bg-slate-900 text-white" : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
