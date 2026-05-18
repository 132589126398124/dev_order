"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  dateFrom?: string;
  dateTo?: string;
}

export default function AdminDateRangePicker({ dateFrom, dateTo }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = new Date().toISOString().slice(0, 10);

  const update = (key: "dateFrom" | "dateTo", val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("date");
    params.delete("page");
    if (val) params.set(key, val);
    else params.delete(key);
    router.push(`/admin/orders?${params.toString()}`);
  };

  const clear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("dateFrom");
    params.delete("dateTo");
    params.delete("page");
    router.push(`/admin/orders?${params.toString()}`);
  };

  const hasRange = !!(dateFrom || dateTo);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors ${
        hasRange
          ? "border-slate-900 bg-white"
          : "border-slate-200 bg-white hover:border-slate-400"
      }`}
    >
      <input
        type="date"
        value={dateFrom ?? ""}
        max={dateTo || today}
        onChange={(e) => update("dateFrom", e.target.value)}
        aria-label="시작 날짜"
        className="text-xs bg-transparent focus:outline-none text-slate-700 w-[6.5rem] cursor-pointer"
      />
      <span className="text-xs text-slate-300 select-none">~</span>
      <input
        type="date"
        value={dateTo ?? ""}
        min={dateFrom}
        max={today}
        onChange={(e) => update("dateTo", e.target.value)}
        aria-label="종료 날짜"
        className="text-xs bg-transparent focus:outline-none text-slate-700 w-[6.5rem] cursor-pointer"
      />
      {hasRange && (
        <button
          onClick={clear}
          className="text-slate-300 hover:text-slate-600 transition-colors text-sm leading-none ml-0.5"
        >
          ×
        </button>
      )}
    </div>
  );
}
