import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import OrderForm from "@/components/order/OrderForm";
import type { FilmItem } from "@/types/order";

export const metadata = { title: "접수 수정" };

interface Props { params: Promise<{ token: string }> }

export default async function EditOrderPage({ params }: Props) {
  const { token } = await params;

  const [order, session] = await Promise.all([
    prisma.order.findUnique({ where: { editToken: token } }),
    getSession(),
  ]);

  // 로그인한 회원이 본인 주문이면 토큰 만료 무시
  const isOwner = session && !session.isAdmin && order?.userId === session.userId;

  if (!order || (!isOwner && (!order.editTokenExpires || order.editTokenExpires < new Date()))) {
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <h1 className="text-lg font-bold text-red-700 mb-2">접근 불가</h1>
          <p className="text-sm text-red-600 mb-6">유효하지 않거나 만료된 링크입니다</p>
          <a href="/" className="text-sm text-slate-600 hover:underline">홈으로 돌아가기</a>
        </div>
      </main>
    );
  }

  if (["PROCESSING", "DONE", "CANCELLED"].includes(order.status)) {
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <h1 className="text-lg font-bold text-amber-700 mb-2">수정 불가</h1>
          <p className="text-sm text-amber-600 mb-6">작업이 시작되어 수정이 불가능합니다</p>
          <a href="/" className="text-sm text-slate-600 hover:underline">홈으로 돌아가기</a>
        </div>
      </main>
    );
  }

  const filmItems = (order.filmItems ?? []) as FilmItem[];

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">접수 내역 수정</h1>
        <p className="text-sm text-slate-500 mt-1">
          고유 코드: <span className="font-mono font-bold text-slate-900">{order.uniqueCode}</span>
        </p>
        <p className="text-xs text-amber-600 mt-1">작업 시작 전까지만 수정 가능합니다</p>
      </div>
      <OrderForm
        editToken={token}
        defaultValues={{
          customerName: order.customerName,
          phone: order.phone,
          email: order.email,
          filmItems: filmItems.length ? filmItems : undefined,
          pickupMethod: order.pickupMethod as "택배" | "방문" | "폐기",
          deliveryAddress: order.deliveryAddress ?? "",
          notes: order.notes ?? "",
        }}
      />
    </main>
  );
}
