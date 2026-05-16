import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import AdminStatusSelect from "@/components/admin/AdminStatusSelect";
import AdminSearch from "@/components/admin/AdminSearch";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}

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
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">접수 관리</h1>
          <p className="text-sm text-gray-500">총 {total}건</p>
        </div>
        <Link href="/order/new" className="text-sm border px-3 py-1.5 rounded-lg hover:bg-gray-50">+ 직접 접수</Link>
      </div>

      <AdminSearch />

      <div className="flex gap-2 mb-4 flex-wrap">
        {[undefined, "PENDING", "SHIPPED", "PROCESSING", "DONE", "EXPIRED"].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `/admin/orders?status=${s}` : "/admin/orders"}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              status === s || (!status && !s) ? "bg-black text-white border-black" : "hover:bg-gray-50"
            }`}
          >
            {s ? ORDER_STATUS_LABELS[s] : "전체"}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500 text-xs">
              <th className="pb-2 pr-4">고유코드</th>
              <th className="pb-2 pr-4">고객명</th>
              <th className="pb-2 pr-4">연락처</th>
              <th className="pb-2 pr-4">필름</th>
              <th className="pb-2 pr-4">프로세스</th>
              <th className="pb-2 pr-4">수령</th>
              <th className="pb-2 pr-4">접수일</th>
              <th className="pb-2 pr-4">상태</th>
              <th className="pb-2">출력</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="py-3 pr-4 font-mono text-xs font-bold">{order.uniqueCode}</td>
                <td className="py-3 pr-4">{order.customerName}</td>
                <td className="py-3 pr-4 text-gray-600">{order.phone}</td>
                <td className="py-3 pr-4 text-gray-600">{order.filmType} ({order.format}) ×{order.quantity}</td>
                <td className="py-3 pr-4 text-gray-600">{order.process}</td>
                <td className="py-3 pr-4 text-gray-600">{order.pickupMethod}</td>
                <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">
                  {format(order.createdAt, "MM.dd HH:mm", { locale: ko })}
                </td>
                <td className="py-3 pr-4">
                  <AdminStatusSelect orderId={order.id} currentStatus={order.status} />
                </td>
                <td className="py-3">
                  <Link href={`/order/${order.id}/print`} target="_blank" className="text-xs text-blue-600 hover:underline">
                    출력
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/orders?page=${p}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                page === p ? "bg-black text-white" : "hover:bg-gray-100"
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
