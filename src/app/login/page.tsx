"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, pin }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error);
      return;
    }

    router.push(json.isAdmin ? "/admin/orders" : "/my/orders");
    router.refresh();
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold mb-2 text-center">로그인</h1>
      <p className="text-gray-500 text-sm text-center mb-6">
        회원 로그인 시 접수 내역 조회 가능
      </p>

      {justRegistered && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6 text-sm text-green-700 text-center">
          가입 완료! 아이디와 PIN으로 로그인해주세요
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">아이디</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="아이디"
            autoComplete="username"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">PIN (6자리)</label>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            type="password"
            inputMode="numeric"
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="숫자 6자리"
            autoComplete="current-password"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || pin.length !== 6}
          className="w-full bg-black text-white py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-center text-xs text-gray-400">
        <p>
          계정이 없으신가요?{" "}
          <Link href="/register" className="underline text-gray-600">회원가입</Link>
        </p>
        <p>
          비회원도 접수 가능 —{" "}
          <Link href="/order/new" className="underline">접수 바로가기</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Suspense fallback={<div className="w-full max-w-sm text-center text-gray-400 text-sm">로딩 중...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
