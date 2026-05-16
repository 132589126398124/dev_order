import { notFound } from "next/navigation";
import OrderForm from "@/components/order/OrderForm";
import type { FilmItem } from "@/types/order";

export const metadata = { title: "접수 수정" };

interface Props { params: Promise<{ token: string }> }

export default async function EditOrderPage({ params }: Props) {
  const { token } = await params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/orders/edit/${token}`, { cache: "no-store" });

  if (!res.ok) {
    const { error } = await res.json();
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <h1 className="text-lg font-bold text-red-700 mb-2">접근 불가</h1>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  const order = await res.json();
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
          pickupMethod: order.pickupMethod,
          deliveryAddress: order.deliveryAddress ?? "",
          notes: order.notes ?? "",
        }}
      />
    </main>
  );
}
