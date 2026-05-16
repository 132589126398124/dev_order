"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", pin: "", pinConfirm: "", email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.pin !== form.pinConfirm) {
      setError("PIN이 일치하지 않습니다");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.username, pin: form.pin, email: form.email }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error);
      return;
    }

    router.push("/login?registered=1");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2 text-center">회원가입</h1>
        <p className="text-gray-500 text-sm text-center mb-8">
          가입 후 접수 내역을 조회할 수 있습니다
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">아이디</label>
            <input
              value={form.username}
              onChange={set("username")}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="영문, 숫자, _ (2~20자)"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">PIN (6자리 숫자)</label>
            <input
              value={form.pin}
              onChange={(e) => setForm((p) => ({ ...p, pin: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
              type="password"
              inputMode="numeric"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="숫자 6자리"
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">PIN 확인</label>
            <input
              value={form.pinConfirm}
              onChange={(e) => setForm((p) => ({ ...p, pinConfirm: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
              type="password"
              inputMode="numeric"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="PIN 재입력"
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">이메일 <span className="text-gray-400 font-normal">(PIN 찾기용)</span></label>
            <input
              value={form.email}
              onChange={set("email")}
              type="email"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="example@email.com"
              autoComplete="email"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || form.pin.length !== 6 || form.pinConfirm.length !== 6}
            className="w-full bg-black text-white py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "가입 중..." : "가입하기"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="underline">로그인</Link>
        </p>
      </div>
    </main>
  );
}
