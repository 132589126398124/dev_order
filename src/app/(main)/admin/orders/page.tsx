import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABELS } from "@/types/order";
import { OrderStatus, Prisma } from "@prisma/client";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import { ko } from "date-fns/locale";
import AdminSearch from "@/components/admin/AdminSearch";
import AdminDateRangePicker from "@/components/admin/AdminDateRangePicker";
import AdminOrdersTable from "@/components/admin/AdminOrdersTable";
import { Suspense } from "react";
import Link from "next/link";
import type { FilmItem } from "@/types/order";

export const metadata = { title: "관리자 — 접수 관리" };

interface Props {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
    date?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/login");

  const { status, search, page: pageStr, date, dateFrom, dateTo, sort } = await searchParams;
  const page = parseInt(pageStr ?? "1");
  const limit = 50;
  const sortDir = sort === "asc" ? "asc" : "desc";

  const hasRange = !!(dateFrom || dateTo);

  const dateFilter = (() => {
    if (hasRange) {
      const gte = dateFrom ? startOfDay(new Date(dateFrom)) : undefined;
      const lte = dateTo ? endOfDay(new Date(dateTo)) : undefined;
      return { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
    }
    if (!date) return undefined;
    if (date === "today") return { gte: startOfDay(new Date()) };
    if (date === "7d") return { gte: subDays(new Date(), 7) };
    if (date === "30d") return { gte: subDays(new Date(), 30) };
    return undefined;
  })();

  const where = {
    ...(status ? { status: status as any } : {}),
    ...(dateFilter ? { createdAt: dateFilter } : {}),
    ...(search ? {
      OR: [
        { uniqueCode: { contains: search, mode: "insensitive" as const } },
        { customerName: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search } },
      ],
    } : {}),
  };

  const buildHref = (params: {
    status?: string;
    search?: string;
    date?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    sort?: string;
  }) => {
    const p = new URLSearchParams();
    if (params.status) p.set("status", params.status);
    if (params.search) p.set("search", params.search);
    if (params.date) p.set("date", params.date);
    if (params.dateFrom) p.set("dateFrom", params.dateFrom);
    if (params.dateTo) p.set("dateTo", params.dateTo);
    if (params.page && params.page > 1) p.set("page", String(params.page));
    if (params.sort && params.sort !== "desc") p.set("sort", params.sort);
    const qs = p.toString();
    return `/admin/orders${qs ? `?${qs}` : ""}`;
  };

  const todayStart = startOfDay(new Date());

  const safeSkip = Number.isFinite((page - 1) * limit) ? (page - 1) * limit : 0;

  const [orders, total, todayCount, statusGroups] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: sortDir }, skip: safeSkip, take: limit }),
    prisma.order.count({ where }),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.groupBy({
      by: [Prisma.OrderScalarFieldEnum.status],
      _count: { _all: true },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const statusCounts = Object.fromEntries(
    (statusGroups as { status: string; _count: { _all: number } }[]).map((g) => [g.status, g._count._all])
  );
  const grandTotal = (statusGroups as { _count: { _all: number } }[]).reduce((s, g) => s + g._count._all, 0);

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
    { label: "오늘 접수", value: todayCount, href: "/admin/orders?date=today", color: "text-blue-600" },
    { label: "접수대기", value: statusCounts["PENDING"] ?? 0, href: "/admin/orders?status=PENDING", color: "text-amber-600" },
    { label: "발송확인", value: statusCounts["SHIPPED"] ?? 0, href: "/admin/orders?status=SHIPPED", color: "text-blue-600" },
    { label: "작업중", value: statusCounts["PROCESSING"] ?? 0, href: "/admin/orders?status=PROCESSING", color: "text-violet-600" },
  ];

  const PRESETS = ["today", "7d", "30d"] as const;
  const isPresetActive = (value?: string) => !hasRange && (date === value || (!date && !value));

  const formatDate = (d: string) => {
    try { return format(new Date(d), "yyyy.MM.dd", { locale: ko }); } catch { return d; }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 pb-28">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">접수 관리</h1>
          <p className="text-sm text-slate-500 mt-0.5">전체 {grandTotal}건</p>
        </div>
        <Link href="/order/new" className="text-sm border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
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

      {/* 검색 + 정렬 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1">
          <Suspense fallback={<div className="h-10 bg-slate-100 rounded-lg animate-pulse" />}>
            <AdminSearch />
          </Suspense>
        </div>
        <Link
          href={buildHref({ status, search, date, dateFrom, dateTo, sort: sortDir === "desc" ? "asc" : "desc" })}
          className="shrink-0 text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-slate-400 transition-colors whitespace-nowrap"
          title="접수일 정렬"
        >
          접수일 {sortDir === "desc" ? "↓" : "↑"}
        </Link>
      </div>

      {/* 날짜 필터 */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs text-slate-400 font-medium shrink-0">기간</span>
        {([
          { label: "전체", value: undefined },
          { label: "오늘", value: "today" },
          { label: "7일", value: "7d" },
          { label: "30일", value: "30d" },
        ] as const).map(({ label, value }) => (
          <Link
            key={label}
            href={buildHref({ status, search, date: value, sort })}
            className={`text-xs px-3 py-1 rounded-full transition-colors font-medium ${
              isPresetActive(value)
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
            }`}
          >
            {label}
          </Link>
        ))}
        <div className="w-px h-4 bg-slate-200 shrink-0" />
        <Suspense fallback={null}>
          <AdminDateRangePicker dateFrom={dateFrom} dateTo={dateTo} />
        </Suspense>
      </div>

      {/* 상태 필터 탭 (카운트 포함) */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {([undefined, "PENDING", "SHIPPED", "PROCESSING", "DONE", "EXPIRED", "CANCELLED"] as const).map((s) => {
          const count = s ? (statusCounts[s] ?? 0) : grandTotal;
          const active = status === s || (!status && !s);
          return (
            <Link
              key={s ?? "all"}
              href={buildHref({ status: s, search, date, dateFrom, dateTo, sort })}
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

      {/* 현재 필터 표시 */}
      {(status || search || date || dateFrom || dateTo) && (
        <div className="flex items-center gap-2 mb-3 text-xs text-slate-500 flex-wrap">
          <span>검색 결과 {total}건</span>
          {hasRange && (
            <span className="bg-slate-100 px-2 py-0.5 rounded-full">
              {dateFrom ? formatDate(dateFrom) : "~"} ~ {dateTo ? formatDate(dateTo) : "~"}
            </span>
          )}
          {!hasRange && date && (
            <span className="bg-slate-100 px-2 py-0.5 rounded-full">
              {({ today: "오늘", "7d": "7일", "30d": "30일" } as Record<string, string>)[date] ?? date}
            </span>
          )}
          {status && <span className="bg-slate-100 px-2 py-0.5 rounded-full">{ORDER_STATUS_LABELS[status]}</span>}
          {search && <span className="bg-slate-100 px-2 py-0.5 rounded-full">"{search}"</span>}
          <Link href="/admin/orders" className="text-slate-400 hover:text-slate-700 underline underline-offset-2">
            초기화
          </Link>
        </div>
      )}

      {/* 테이블 */}
      <AdminOrdersTable orders={serializedOrders} currentUrl={buildHref({ status, search, date, dateFrom, dateTo, sort, page })} />

      {/* 페이지네이션 (windowed) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 mt-6">
          {page > 1 && (
            <Link href={buildHref({ status, search, date, dateFrom, dateTo, sort, page: page - 1 })} className="w-8 h-8 flex items-center justify-center rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors">‹</Link>
          )}
          {(() => {
            const pages: (number | "...")[] = [];
            const delta = 2;
            const left = page - delta;
            const right = page + delta;
            let lastPage = 0;
            for (let i = 1; i <= totalPages; i++) {
              if (i === 1 || i === totalPages || (i >= left && i <= right)) {
                if (lastPage && i - lastPage > 1) pages.push("...");
                pages.push(i);
                lastPage = i;
              }
            }
            return pages.map((p, idx) =>
              p === "..." ? (
                <span key={`e${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>
              ) : (
                <Link
                  key={p}
                  href={buildHref({ status, search, date, dateFrom, dateTo, sort, page: p as number })}
                  className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                    page === p ? "bg-slate-900 text-white" : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  {p}
                </Link>
              )
            );
          })()}
          {page < totalPages && (
            <Link href={buildHref({ status, search, date, dateFrom, dateTo, sort, page: page + 1 })} className="w-8 h-8 flex items-center justify-center rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors">›</Link>
          )}
        </div>
      )}
    </main>
  );
}
