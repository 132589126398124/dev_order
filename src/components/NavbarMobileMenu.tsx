"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  isAdmin: boolean;
  isLoggedIn: boolean;
}

export default function NavbarMobileMenu({ isAdmin, isLoggedIn }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="메뉴"
        className="md:hidden flex flex-col gap-[5px] justify-center items-center w-9 h-9 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <span className={`block w-5 h-[1.5px] bg-slate-700 transition-all duration-200 origin-center ${open ? "rotate-45 translate-y-[6.5px]" : ""}`} />
        <span className={`block w-5 h-[1.5px] bg-slate-700 transition-all duration-200 ${open ? "opacity-0 scale-x-0" : ""}`} />
        <span className={`block w-5 h-[1.5px] bg-slate-700 transition-all duration-200 origin-center ${open ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 top-14 z-40 bg-black/20"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-x-0 top-0 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-xl px-4 pt-4 pb-6 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Link href="/order/new" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white font-semibold text-sm">
              접수 신청
            </Link>

            {isLoggedIn ? (
              <>
                {isAdmin ? (
                  <>
                    <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors">
                      접수 관리
                    </Link>
                    <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 text-sm hover:bg-slate-50 transition-colors">
                      설정
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/my/orders" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors">
                      내 접수 내역
                    </Link>
                    <Link href="/my/profile" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 text-sm hover:bg-slate-50 transition-colors">
                      프로필
                    </Link>
                  </>
                )}
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 text-sm hover:bg-red-50 transition-colors font-medium">
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors">
                  로그인
                </Link>
                <Link href="/register" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 text-sm hover:bg-slate-50 transition-colors">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
