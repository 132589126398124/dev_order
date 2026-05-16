"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={logout}
      className="text-sm font-medium text-slate-500 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
    >
      로그아웃
    </button>
  );
}
