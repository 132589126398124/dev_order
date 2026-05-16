import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABELS } from "@/types/order";
import { startOfDay } from "date-fns";
import AdminSearch from "@/components/admin/AdminSearch";
import AdminOrdersTable from "@/components/admin/AdminOrdersTable";
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

  const today = startOfDay(new Date());

  const [orders, total, statusGroups, todayCount] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status" as any], _count: { _all: true } }),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const statusCounts = Object.fromEntries(
    (statusGroups as any[]).map((g: any) => [g.status, g._count._all as number])
  );
  const grandTotal = (statusGroups as any[]).reduce((s: number, g: any) => s + g._count._all, 0);

  const serializedOrders = orders.map((o) => ({
    id: o.id,
    uniqueCode: o.uniqueCode,
    customerName: o.customerName,
    phone: o.phone,
    filmItems: (o.filmItems ?? []) as FilmItem[],
    pickupMethod: o.pickupMethod,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
  }));

  const stats = [
    { label: "오늘 접수", value: todayCount, href: `/admin/orders?status=PENDING`, color: "text-blue-600" },
    { label: "접수대기", value: statusCounts["PENDING"] ?? 0, href: "/admin/orders?status=PENDING", color: "text-amber-600" },
    { label: "발송확인", value: statusCounts["SHIPPED"] ?? 0, href: "/admin/orders?status=SHIPPED", color: "text-blue-600" },
    { label: "작업중", value: statusCounts["PROCESSING"] ?? 0, href: "/admin/orders?status=PROCESSING", color: "text-violet-600" },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 pb-28">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">접수 관리</h1>
          <p className="text-sm text-slate-500 mt-0.5">전체 {grandTotal}건</p>
        </div>
        <Link
          href="/order/new"
          className="text-sm border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
        >
          + 직접 접수
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map(({ label, value, href, color }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 hover:border-slate-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all group"
          >
            <p className="text-xs text-slate-400 mb-1.5">{label}</p>
            <p className={`text-2xl font-bold ${color} group-hover:scale-105 transition-transform origin-left`}>
              {value}
            </p>
          </Link>
        ))}
      </div>

      {/* 검색 */}
      <Suspense fallback={<div className="h-10 bg-slate-100 rounded-lg animate-pulse mb-4" />}>
        <AdminSearch />
      </Suspense>

      {/* 상태 필터 탭 (카운트 포함) */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {([undefined, "PENDING", "SHIPPED", "PROCESSING", "DONE", "EXPIRED", "CANCELLED"] as const).map((s) => {
          const count = s ? (statusCounts[s] ?? 0) : grandTotal;
          const active = status === s || (!status && !s);
          return (
            <Link
              key={s ?? "all"}
              href={s ? `/admin/orders?status=${s}` : "/admin/orders"}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors font-medium ${
                active
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              {s ? ORDER_STATUS_LABELS[s] : "전체"}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* 현재 필터/검색 표시 */}
      {(status || search) && (
        <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
          <span>검색 결과 {total}건</span>
          {status && <span className="bg-slate-100 px-2 py-0.5 rounded-full">{ORDER_STATUS_LABELS[status]}</span>}
          {search && <span className="bg-slate-100 px-2 py-0.5 rounded-full">"{search}"</span>}
          <Link href="/admin/orders" className="text-slate-400 hover:text-slate-700 underline underline-offset-2">
            초기화
          </Link>
        </div>
      )}

      {/* 테이블 (체크박스 + 일괄변경) */}
      <AdminOrdersTable orders={serializedOrders} />

      {/* 페이지네이션 */}
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
