"use client";

import { useState } from "react";

const COURIERS = ["CJ대한통운", "한진택배", "롯데택배", "우체국", "로젠택배", "기타"];

interface Props {
  orderId: string;
  initialCourierName: string | null;
  initialTrackingNumber: string | null;
  initialScanFileUrl: string | null;
  initialAdminNotes: string | null;
}

export default function AdminOrderMeta({
  orderId,
  initialCourierName,
  initialTrackingNumber,
  initialScanFileUrl,
  initialAdminNotes,
}: Props) {
  const [courierName, setCourierName] = useState(initialCourierName ?? "");
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber ?? "");
  const [scanFileUrl, setScanFileUrl] = useState(initialScanFileUrl ?? "");
  const [adminNotes, setAdminNotes] = useState(initialAdminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courierName, trackingNumber, scanFileUrl, adminNotes }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:border-slate-400 focus:outline-none transition-all";
  const labelCls = "block text-xs font-medium text-slate-500 mb-1";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">관리자 메모 · 배송 정보</h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>택배사</label>
          <select
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            className={inputCls}
          >
            <option value="">선택</option>
            {COURIERS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>운송장 번호</label>
          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className={inputCls}
            placeholder="1234567890123"
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>스캔 파일 링크</label>
        <input
          value={scanFileUrl}
          onChange={(e) => setScanFileUrl(e.target.value)}
          className={inputCls}
          placeholder="https://drive.google.com/..."
        />
      </div>

      <div>
        <label className={labelCls}>내부 메모 <span className="text-slate-300">(고객에게 표시 안 됨)</span></label>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={2}
          className={`${inputCls} resize-none`}
          placeholder="내부 참고사항..."
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 active:scale-95 disabled:opacity-50 transition-all"
      >
        {saved ? "저장 완료 ✓" : saving ? "저장 중..." : "저장"}
      </button>
    </div>
  );
}
