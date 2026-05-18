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
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.pin !== form.pinConfirm) { setError("PIN이 일치하지 않습니다"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, pin: form.pin, email: form.email }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "가입 실패"); return; }
      router.push("/login?registered=1");
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-slate-400 focus:outline-none transition-all";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">회원가입</h1>
        <p className="text-slate-500 text-sm mb-8">가입 후 접수 내역을 조회할 수 있습니다</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>아이디</label>
            <input value={form.username} onChange={set("username")} className={inputCls} placeholder="영문, 숫자, _ (2~20자)" autoComplete="username" required />
          </div>
          <div>
            <label className={labelCls}>PIN (6자리 숫자)</label>
            <input
              value={form.pin}
              onChange={(e) => setForm((p) => ({ ...p, pin: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
              type="password" inputMode="numeric" className={inputCls}
              placeholder="숫자 6자리" autoComplete="new-password" required
            />
          </div>
          <div>
            <label className={labelCls}>PIN 확인</label>
            <input
              value={form.pinConfirm}
              onChange={(e) => setForm((p) => ({ ...p, pinConfirm: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
              type="password" inputMode="numeric" className={inputCls}
              placeholder="PIN 재입력" autoComplete="new-password" required
            />
          </div>
          <div>
            <label className={labelCls}>이메일 <span className="text-slate-400 font-normal">(선택사항 · PIN 찾기용)</span></label>
            <input value={form.email} onChange={set("email")} type="email" className={inputCls} placeholder="example@email.com" autoComplete="email" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || form.pin.length !== 6 || form.pinConfirm.length !== 6}
            className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 active:scale-95 disabled:opacity-50 transition-all"
          >
            {loading ? "가입 중..." : "가입하기"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          이미 계정이 있으신가요? <Link href="/login" className="text-slate-700 font-medium hover:underline">로그인</Link>
        </p>
      </div>
    </main>
  );
}
