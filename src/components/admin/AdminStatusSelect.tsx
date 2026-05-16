"use client";

import { useState } from "react";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
  currentStatus: string;
}

export default function AdminStatusSelect({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onChange = async (newStatus: string) => {
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      setStatus(newStatus);
      router.refresh();
    }
    setLoading(false);
  };

  const colorCls = (ORDER_STATUS_COLORS[status] ?? "").replace(/ring-\S+/g, "").trim();

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      className={`text-xs font-medium px-2 py-1 rounded-full border border-transparent cursor-pointer disabled:opacity-50 ${colorCls}`}
    >
      {Object.entries(ORDER_STATUS_LABELS).map(([val, label]) => (
        <option key={val} value={val}>{label}</option>
      ))}
    </select>
  );
}
