"use client";

import { useState } from "react";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";

interface Props {
  orderId: string;
  currentStatus: string;
}

export default function AdminStatusSelect({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [pendingDone, setPendingDone] = useState(false);
  const [scanUrl, setScanUrl] = useState("");
  const [submitError, setSubmitError] = useState("");

  const submitStatus = async (newStatus: string, scanFileUrl?: string) => {
    setLoading(true);
    setSubmitError("");
    try {
      const body: Record<string, string> = { status: newStatus };
      if (scanFileUrl !== undefined) body.scanFileUrl = scanFileUrl;
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setStatus(newStatus);
      } else {
        const json = await res.json().catch(() => ({}));
        setSubmitError(json.error ?? "변경 실패");
      }
    } catch {
      setSubmitError("서버 연결 실패");
    } finally {
      setLoading(false);
    }
  };

  const DESTRUCTIVE = new Set(["CANCELLED", "EXPIRED"]);

  const handleChange = (newStatus: string) => {
    if (newStatus === "DONE") {
      setPendingDone(true);
      setScanUrl("");
    } else {
      if (DESTRUCTIVE.has(newStatus)) {
        const label = (ORDER_STATUS_LABELS as Record<string, string>)[newStatus] ?? newStatus;
        if (!window.confirm(`[${label}] 처리합니다. 계속하시겠습니까?`)) return;
      }
      setPendingDone(false);
      submitStatus(newStatus);
    }
  };

  const confirmDone = () => {
    setPendingDone(false);
    submitStatus("DONE", scanUrl);
  };

  const cancelDone = () => {
    setPendingDone(false);
    setScanUrl("");
  };

  const colorCls = (ORDER_STATUS_COLORS[status] ?? "").replace(/ring-\S+/g, "").trim();

  return (
    <div className="flex flex-col gap-1.5">
      <select
        value={pendingDone ? "DONE" : status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
        className={`text-xs font-medium px-2 py-1 rounded-full border border-transparent cursor-pointer disabled:opacity-50 ${
          pendingDone ? "bg-emerald-50 text-emerald-700" : colorCls
        }`}
      >
        {Object.entries(ORDER_STATUS_LABELS).map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>

      {submitError && <p className="text-[10px] text-red-500 mt-0.5">{submitError}</p>}
      {pendingDone && (
        <div className="flex flex-col gap-1 min-w-[180px]">
          <input
            autoFocus
            value={scanUrl}
            onChange={(e) => setScanUrl(e.target.value)}
            placeholder="스캔 파일 링크 (선택)"
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-400 bg-white"
          />
          <div className="flex gap-1">
            <button
              onClick={confirmDone}
              disabled={loading}
              className="flex-1 text-xs bg-emerald-600 text-white rounded-lg py-1 hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium"
            >
              완료 처리
            </button>
            <button
              onClick={cancelDone}
              className="text-xs text-slate-400 hover:text-slate-600 px-2"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
