"use client";

export default function PrintButton({ orderId }: { orderId: string }) {
  return (
    <button
      onClick={() => window.open(`/order/${orderId}/print`, "_blank")}
      className="w-full border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
    >
      출력 페이지 새 탭으로 열기
    </button>
  );
}
