"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AdminSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");
    params.delete("page");
    router.push(`/admin/orders?${params.toString()}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2 mb-4">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="고유코드, 고객명, 연락처 검색"
        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />
      <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg text-sm">검색</button>
      {value && (
        <button type="button" onClick={() => { setValue(""); router.push("/admin/orders"); }} className="text-sm text-gray-500 hover:text-gray-800">
          초기화
        </button>
      )}
    </form>
  );
}
