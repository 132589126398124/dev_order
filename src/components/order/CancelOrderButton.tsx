"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "취소 중 오류가 발생했습니다");
        setLoading(false);
        return;
      }
      router.push("/my/orders");
    } catch {
      setError("취소 중 오류가 발생했습니다");
      setLoading(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex-1 flex flex-col gap-2">
        <p className="text-sm text-slate-600 text-center break-keep">접수를 취소하면 되돌릴 수 없습니다.</p>
        <div className="flex gap-2">
          <button
            onClick={() => { setConfirming(false); setError(null); }}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            돌아가기
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? "취소 중..." : "접수 취소"}
          </button>
        </div>
        {error && <p className="text-xs text-red-600 text-center">{error}</p>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex-1 text-center bg-white border border-red-200 text-red-500 py-3 rounded-2xl text-sm font-semibold hover:bg-red-50 active:scale-95 transition-all"
    >
      접수 취소
    </button>
  );
}
