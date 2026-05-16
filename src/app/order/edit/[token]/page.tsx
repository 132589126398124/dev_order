import { notFound } from "next/navigation";
import OrderForm from "@/components/order/OrderForm";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function EditOrderPage({ params }: Props) {
  const { token } = await params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/orders/edit/${token}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const { error } = await res.json();
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-red-600 mb-2">접근 불가</h1>
        <p className="text-gray-500">{error}</p>
      </main>
    );
  }

  const order = await res.json();

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">접수 내역 수정</h1>
      <p className="text-gray-500 text-sm mb-2">고유 코드: <span className="font-mono font-bold">{order.uniqueCode}</span></p>
      <p className="text-yellow-600 text-xs mb-8">작업 시작 전까지만 수정 가능합니다</p>
      <OrderForm
        editToken={token}
        defaultValues={{
          customerName: order.customerName,
          phone: order.phone,
          email: order.email,
          filmType: order.filmType,
          format: order.format,
          quantity: order.quantity,
          ei: order.ei ?? "",
          scanType: order.scanType,
          process: order.process,
          pushPull: order.pushPull,
          pickupMethod: order.pickupMethod,
          notes: order.notes ?? "",
        }}
      />
    </main>
  );
}
