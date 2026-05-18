"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props { params: Promise<{ token: string }> }

export default function ResetPinPage({ params }: Props) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pin !== pinConfirm) { setError("PIN이 일치하지 않습니다"); return; }
    setLoading(true);
    try {
      const { token } = await params;
      const res = await fetch(`/api/auth/reset-pin/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPin: pin }),
      });
      if (res.ok) {
        router.push("/login?reset=1");
      } else {
        const json = await res.json();
        setError(json.error ?? "오류가 발생했습니다");
      }
    } catch {
      setError("서버 연결에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-slate-400 focus:outline-none transition-all tracking-widest";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">새 PIN 설정</h1>
        <p className="text-slate-500 text-sm mb-8">새로 사용할 숫자 6자리 PIN을 입력해주세요.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>새 PIN</label>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              type="password"
              inputMode="numeric"
              className={inputCls}
              placeholder="숫자 6자리"
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label className={labelCls}>PIN 확인</label>
            <input
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 6))}
              type="password"
              inputMode="numeric"
              className={inputCls}
              placeholder="PIN 재입력"
              autoComplete="new-password"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || pin.length !== 6 || pinConfirm.length !== 6}
            className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 active:scale-95 disabled:opacity-50 transition-all"
          >
            {loading ? "변경 중..." : "PIN 변경"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          <Link href="/login" className="text-slate-600 font-medium hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </main>
  );
}
