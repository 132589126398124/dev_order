import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";
import type { FilmItem } from "@/types/order";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import AdminStatusSelect from "@/components/admin/AdminStatusSelect";

interface Props { params: Promise<{ id: string }> }

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) notFound();

  if (!session?.isAdmin && order.userId !== session?.userId) redirect("/login");

  const filmItems = (order.filmItems ?? []) as FilmItem[];
  const canEdit = ["PENDING", "SHIPPED"].includes(order.status);

  const row = (label: string, value: string | null | undefined) =>
    value ? (
      <div key={label}>
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value}</p>
      </div>
    ) : null;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <Link href={session?.isAdmin ? "/admin/orders" : "/my/orders"} className="text-xs text-slate-400 hover:text-slate-600 mb-2 flex items-center gap-1">
            ← 목록으로
          </Link>
          <h1 className="text-xl font-bold text-slate-900 font-mono">{order.uniqueCode}</h1>
          <p className="text-xs text-slate-400 mt-1">{format(order.createdAt, "yyyy년 MM월 dd일 HH:mm", { locale: ko })} 접수</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {session?.isAdmin ? (
            <AdminStatusSelect orderId={order.id} currentStatus={order.status} />
          ) : (
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          )}
        </div>
      </div>

      {/* 고객 정보 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 mb-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">고객 정보</h2>
        <div className="grid grid-cols-2 gap-4">
          {row("고객명", order.customerName)}
          {row("연락처", order.phone)}
          {row("이메일", order.email)}
          {row("수령 방법", order.pickupMethod)}
          {order.deliveryAddress && row("반송 주소", order.deliveryAddress)}
        </div>
      </div>

      {/* 필름 목록 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 mb-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">필름 정보</h2>
        <div className="space-y-3">
          {filmItems.map((item, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">필름 {i + 1}</span>
                <span className="text-xs bg-white border border-slate-200 rounded-full px-2 py-0.5 text-slate-600">{item.process}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-slate-400">종류</p><p className="font-medium">{item.filmType}</p></div>
                <div><p className="text-xs text-slate-400">포맷</p><p className="font-medium">{item.format}</p></div>
                <div><p className="text-xs text-slate-400">수량</p><p className="font-medium">{item.quantity}롤</p></div>
                <div><p className="text-xs text-slate-400">스캔</p><p className="font-medium">{item.scanType}</p></div>
                <div><p className="text-xs text-slate-400">증감</p><p className="font-medium">{item.pushPull === "0" ? "표준" : `${item.pushPull} stop`}</p></div>
                {item.ei && <div><p className="text-xs text-slate-400">EI</p><p className="font-medium">{item.ei}</p></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 요청사항 */}
      {order.notes && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 mb-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">요청사항</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{order.notes}</p>
        </div>
      )}

      {/* 액션 */}
      <div className="flex gap-3">
        <Link
          href={`/order/${id}/print`}
          target="_blank"
          className="flex-1 text-center bg-slate-900 text-white py-3 rounded-2xl text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          의뢰서 출력
        </Link>
        {canEdit && !session?.isAdmin && (
          <Link
            href={`/order/edit/${order.editToken}`}
            className="flex-1 text-center bg-white border border-slate-200 text-slate-700 py-3 rounded-2xl text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            수정 요청
          </Link>
        )}
      </div>
    </main>
  );
}
