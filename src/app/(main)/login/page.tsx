"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const justReset = searchParams.get("reset") === "1";
  const nextUrl = searchParams.get("next");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pin }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "로그인 실패"); return; }
      const dest = json.isAdmin ? "/admin/orders" : (nextUrl && nextUrl.startsWith("/") ? nextUrl : "/my/orders");
      router.push(dest);
      router.refresh();
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-slate-400 focus:outline-none transition-all";

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">로그인</h1>
      <p className="text-slate-500 text-sm mb-8">접수 내역 조회를 위해 로그인하세요</p>

      {justRegistered && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6 text-sm text-emerald-700">
          가입 완료! 아이디와 PIN으로 로그인해주세요
        </div>
      )}
      {justReset && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6 text-sm text-emerald-700">
          PIN이 변경되었습니다. 새 PIN으로 로그인해주세요
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">아이디</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} placeholder="아이디" autoComplete="username" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">PIN (6자리)</label>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            type="password" inputMode="numeric" className={inputCls}
            placeholder="숫자 6자리" autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading || pin.length !== 6}
          className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 active:scale-95 disabled:opacity-50 transition-all"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm text-slate-400">
        <p>계정이 없으신가요? <Link href="/register" className="text-slate-700 font-medium hover:underline">회원가입</Link></p>
        <p><Link href="/forgot-pin" className="hover:underline">PIN을 잊으셨나요?</Link></p>
        <p>비회원도 접수 가능 — <Link href="/order/new" className="hover:underline">접수 바로가기</Link></p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
