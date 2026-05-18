"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPinPage() {
  const [form, setForm] = useState({ username: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setDone(true);
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

  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-slate-400 focus:outline-none transition-all";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

  if (done) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">이메일을 확인하세요</h1>
          <p className="text-slate-500 text-sm mb-6 break-keep">
            입력하신 이메일로 PIN 재설정 링크를 발송했습니다. 1시간 이내에 사용해주세요.
          </p>
          <Link href="/login" className="text-sm text-slate-600 font-medium hover:underline">
            로그인으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">PIN 찾기</h1>
        <p className="text-slate-500 text-sm mb-8 break-keep">가입 시 입력한 아이디와 이메일을 입력하면 재설정 링크를 보내드립니다.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>아이디</label>
            <input
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              className={inputCls}
              placeholder="가입한 아이디"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className={labelCls}>이메일</label>
            <input
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              type="email"
              className={inputCls}
              placeholder="가입한 이메일"
              autoComplete="email"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 active:scale-95 disabled:opacity-50 transition-all"
          >
            {loading ? "전송 중..." : "재설정 링크 받기"}
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
