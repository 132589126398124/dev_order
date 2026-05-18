import { getSession } from "@/lib/auth";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import NavbarMobileMenu from "./NavbarMobileMenu";
import { SHOP_NAME } from "@/lib/shop";

export default async function Navbar() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-slate-900 tracking-tight">
          {SHOP_NAME}
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/order/new"
            className="text-sm font-medium bg-slate-900 text-white px-4 py-1.5 rounded-full hover:bg-slate-700 transition-colors"
          >
            접수 신청
          </Link>

          {session ? (
            <>
              {session.isAdmin ? (
                <>
                  <Link
                    href="/admin/orders"
                    className="text-sm font-medium text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    관리자
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="text-sm font-medium text-slate-400 px-3 py-1.5 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    설정
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/my/orders"
                    className="text-sm font-medium text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    내 접수
                  </Link>
                  <Link
                    href="/my/profile"
                    className="text-sm font-medium text-slate-400 px-3 py-1.5 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    프로필
                  </Link>
                </>
              )}
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              로그인
            </Link>
          )}
        </nav>

        {/* 모바일 햄버거 메뉴 */}
        <NavbarMobileMenu isAdmin={!!session?.isAdmin} isLoggedIn={!!session} />
      </div>
    </header>
  );
}
