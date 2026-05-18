"use client";

import { useState } from "react";
import Link from "next/link";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";
import type { FilmItem } from "@/types/order";
import type { Order } from "@prisma/client";

interface Props {
  initialOrders: Order[];
  initialCursor: string | null;
}

export default function OrdersLoadMore({ initialOrders, initialCursor }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/my/orders?cursor=${cursor}`);
      const data = await res.json();
      setOrders((prev) => [...prev, ...data.orders]);
      setCursor(data.nextCursor);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const items = (order.filmItems ?? []) as FilmItem[];
        return (
          <Link
            key={order.id}
            href={`/order/${order.id}`}
            className="block bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 hover:border-slate-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono font-bold text-slate-900 text-sm">{order.uniqueCode}</p>
                <div className="mt-1 space-y-0.5">
                  {items.length > 0 ? items.map((item, i) => (
                    <p key={i} className="text-xs text-slate-500 truncate">
                      {item.filmType} · {item.format} · {item.quantity}롤 · {item.process}
                    </p>
                  )) : (
                    <p className="text-xs text-slate-400">필름 정보 없음</p>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  {new Date(order.createdAt).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>
          </Link>
        );
      })}

      {cursor && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full py-3 text-sm font-medium text-slate-500 rounded-2xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all"
        >
          {loading ? "불러오는 중..." : "더 보기"}
        </button>
      )}
    </div>
  );
}
