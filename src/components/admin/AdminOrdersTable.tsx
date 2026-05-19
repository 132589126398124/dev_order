"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import AdminStatusSelect from "./AdminStatusSelect";
import { ORDER_STATUS_LABELS } from "@/types/order";
import type { FilmItem } from "@/types/order";

export interface OrderRow {
  id: string;
  uniqueCode: string;
  customerName: string;
  phone: string;
  filmItems: FilmItem[];
  pickupMethod: string;
  status: string;
  createdAt: string;
}

const DESTRUCTIVE_STATUSES = new Set(["CANCELLED", "EXPIRED"]);

export default function AdminOrdersTable({ orders, currentUrl }: { orders: OrderRow[]; currentUrl: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchStatus, setBatchStatus] = useState("SHIPPED");
  const [batchScanUrls, setBatchScanUrls] = useState<Record<string, string>>({});
  const [applying, setApplying] = useState(false);
  const [batchError, setBatchError] = useState("");
  const [confirmPending, setConfirmPending] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const allSelected = orders.length > 0 && selected.size === orders.length;
  const someSelected = selected.size > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected;
  }, [someSelected]);

  const toggleAll = () => {
    if (allSelected || someSelected) setSelected(new Set());
    else setSelected(new Set(orders.map((o) => o.id)));
  };

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const selectedOrders = orders.filter((o) => selected.has(o.id));

  const applyBatch = async () => {
    if (applying || selected.size === 0) return;

    if (DESTRUCTIVE_STATUSES.has(batchStatus) && !confirmPending) {
      setConfirmPending(true);
      return;
    }

    setConfirmPending(false);
    setBatchError("");
    setApplying(true);
    try {
      const body: Record<string, unknown> = {
        ids: [...selected],
        status: batchStatus,
      };
      if (batchStatus === "DONE") {
        body.scanFileUrls = batchScanUrls;
      }

      const res = await fetch("/api/orders/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok) {
        setSelected(new Set());
        setBatchScanUrls({});
        router.replace(currentUrl);
      } else {
        setBatchError(json.error ?? "오류가 발생했습니다");
      }
    } catch {
      setBatchError("서버 연결 실패");
    } finally {
      setApplying(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    ref={selectAllRef}
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="전체 선택"
                    className="rounded border-slate-300 accent-slate-900 cursor-pointer"
                  />
                </th>
                {["고유코드", "고객명", "연락처", "필름", "수령", "접수일", "상태", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-slate-500 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-slate-400 text-sm">
                    접수 내역이 없습니다
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`transition-colors ${
                      selected.has(order.id)
                        ? "bg-blue-50/40 hover:bg-blue-50/60"
                        : "hover:bg-slate-50/50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(order.id)}
                        onChange={() => toggleOne(order.id)}
                        aria-label={`${order.uniqueCode} 선택`}
                        className="rounded border-slate-300 accent-slate-900 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                      <Link href={`/order/${order.id}`} className="hover:text-blue-600 transition-colors">
                        {order.uniqueCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{order.customerName}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{order.phone}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[180px]">
                      {order.filmItems.map((item, i) => (
                        <div key={i} className="text-xs truncate">
                          {item.filmType} ({item.format}) ×{item.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{order.pickupMethod}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {format(new Date(order.createdAt), "MM.dd HH:mm", { locale: ko })}
                    </td>
                    <td className="px-4 py-3">
                      <AdminStatusSelect orderId={order.id} currentStatus={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/order/${order.id}`}
                        className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                      >
                        전체보기
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Batch Action Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 transition-transform duration-300 ease-out ${
          selected.size > 0 ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-900 text-white rounded-2xl px-5 py-3.5 flex flex-wrap items-start gap-3 shadow-[0_-4px_40px_rgba(0,0,0,0.25)]">
            <div className="flex flex-wrap items-center gap-3 w-full">
              <span className="text-sm font-semibold shrink-0">
                <span className="text-blue-400">{selected.size}건</span> 선택됨
              </span>
              <div className="w-px h-4 bg-slate-700 shrink-0" />
              <span className="text-xs text-slate-400 shrink-0">일괄 변경:</span>
              <select
                value={batchStatus}
                onChange={(e) => { setBatchStatus(e.target.value); setBatchScanUrls({}); setConfirmPending(false); }}
                className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-slate-500 cursor-pointer"
              >
                {Object.entries(ORDER_STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={applyBatch}
                disabled={applying}
                className="bg-white text-slate-900 text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50 shrink-0"
              >
                {applying ? "처리 중..." : "적용"}
              </button>
              {batchError && (
                <span className="text-xs text-red-400 shrink-0">{batchError}</span>
              )}
              <button
                type="button"
                onClick={() => { setSelected(new Set()); setConfirmPending(false); }}
                className="ml-auto text-slate-500 hover:text-slate-300 transition-colors text-xs shrink-0"
              >
                선택 해제
              </button>
            </div>
            {confirmPending && (
              <div className="w-full border-t border-slate-700 pt-3 flex flex-wrap items-center gap-3">
                <span className="text-xs text-amber-400 font-medium shrink-0">
                  {selected.size}건을 [{ORDER_STATUS_LABELS[batchStatus] ?? batchStatus}] 처리합니다. 계속하시겠습니까?
                </span>
                <button
                  type="button"
                  onClick={applyBatch}
                  disabled={applying}
                  className="bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 shrink-0"
                >
                  확인
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmPending(false)}
                  className="text-slate-400 hover:text-slate-200 text-xs shrink-0"
                >
                  취소
                </button>
              </div>
            )}

            {/* Per-order scan URL inputs for DONE status */}
            {batchStatus === "DONE" && selectedOrders.length > 0 && (
              <div className="w-full border-t border-slate-700 pt-3">
                <p className="text-xs text-slate-400 mb-2">완료 처리 — 스캔 파일 링크 (주문별, 선택사항)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {selectedOrders.map((order) => (
                    <div key={order.id} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-300 shrink-0 w-28 truncate">{order.uniqueCode}</span>
                      <input
                        value={batchScanUrls[order.id] ?? ""}
                        onChange={(e) => setBatchScanUrls((prev) => ({ ...prev, [order.id]: e.target.value }))}
                        placeholder="링크 (없으면 빈칸)"
                        className="flex-1 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
