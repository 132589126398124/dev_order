"use client";

import { useRouter, useSearchParams } from "next/navigation";

const PRESETS = ["today", "7d", "30d"];

export default function AdminDatePicker({ currentDate }: { currentDate?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isSpecificDate = !!currentDate && !PRESETS.includes(currentDate);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // "YYYY-MM-DD" or ""
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set("date", val);
    else params.delete("date");
    params.delete("page");
    router.push(`/admin/orders?${params.toString()}`);
  };

  return (
    <input
      type="date"
      value={isSpecificDate ? currentDate : ""}
      onChange={onChange}
      max={new Date().toISOString().slice(0, 10)}
      className={`text-xs px-3 py-1 rounded-full border cursor-pointer focus:outline-none transition-colors ${
        isSpecificDate
          ? "bg-slate-900 text-white border-slate-900 [color-scheme:dark]"
          : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
      }`}
    />
  );
}
