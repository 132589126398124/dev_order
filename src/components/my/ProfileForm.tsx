"use client";

import { useState } from "react";

interface Profile {
  profileName?: string | null;
  profilePhone?: string | null;
  profileEmail?: string | null;
  profileAddress?: string | null;
}

const inputCls =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-400";
const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

export default function ProfileForm({ initialProfile }: { initialProfile: Profile }) {
  const [name, setName] = useState(initialProfile.profileName ?? "");
  const [phone, setPhone] = useState(initialProfile.profilePhone ?? "");
  const [email, setEmail] = useState(initialProfile.profileEmail ?? "");
  const [address, setAddress] = useState(initialProfile.profileAddress ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileName: name || null,
          profilePhone: phone || null,
          profileEmail: email || null,
          profileAddress: address || null,
        }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="홍길동"
          />
        </div>
        <div>
          <label className={labelCls}>연락처</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
            inputMode="tel"
            className={inputCls}
            placeholder="01012345678"
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
          placeholder="example@email.com"
        />
      </div>
      <div>
        <label className={labelCls}>기본 주소</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={inputCls}
          placeholder="자주 사용하는 반송 주소"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-slate-900 text-white py-3 rounded-2xl font-semibold hover:bg-slate-800 active:scale-95 disabled:opacity-50 transition-all text-sm"
      >
        {saved ? "저장 완료 ✓" : saving ? "저장 중..." : "프로필 저장"}
      </button>

      <p className="text-xs text-slate-400 text-center">
        저장된 정보는 접수 신청 시 자동으로 불러옵니다
      </p>
    </div>
  );
}
