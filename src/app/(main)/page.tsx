import Link from "next/link";
import { getSession } from "@/lib/auth";
import { SHOP_NAME } from "@/lib/shop";

export default async function HomePage() {
  const session = await getSession();

  return (
    <main className="max-w-5xl mx-auto px-4">
      {/* Hero */}
      <section className="py-20 md:py-28 text-center">
        <p className="inline-block text-xs font-semibold text-slate-400 tracking-[0.15em] uppercase mb-6">
          Film · Develop · Scan
        </p>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-5 leading-[1.08]">
          필름을 보내주세요.<br />
          <span className="text-slate-400">나머지는 저희가.</span>
        </h1>
        <p className="text-slate-500 text-base md:text-lg max-w-xs mx-auto leading-relaxed mb-10">
          온라인 접수 → 택배 발송 → 현상·스캔 → 반송
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/order/new"
            className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-semibold hover:bg-slate-700 active:scale-[0.97] transition-all text-sm shadow-[0_4px_24px_rgba(15,23,42,0.18)]"
          >
            접수 신청하기
          </Link>
          {session ? (
            <Link
              href={session.isAdmin ? "/admin/orders" : "/my/orders"}
              className="bg-white text-slate-700 px-8 py-3.5 rounded-2xl font-semibold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97] transition-all text-sm"
            >
              {session.isAdmin ? "관리자 페이지" : "내 접수 내역 →"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-white text-slate-700 px-8 py-3.5 rounded-2xl font-semibold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97] transition-all text-sm"
            >
              로그인
            </Link>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              num: "01",
              emoji: "📋",
              title: "온라인 접수",
              desc: "필름 종류·수량·스캔 옵션을 선택하고 접수 신청서를 제출합니다.",
            },
            {
              num: "02",
              emoji: "📦",
              title: "필름 발송",
              desc: "고유 코드를 적은 메모와 함께 필름을 택배로 보내주세요.",
            },
            {
              num: "03",
              emoji: "✨",
              title: "현상 완료",
              desc: "현상·스캔 완료 후 스캔 파일을 전달하고 원본 필름을 반송합니다.",
            },
          ].map(({ num, emoji, title, desc }) => (
            <div
              key={num}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] group hover:border-slate-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{emoji}</span>
                <span className="text-[10px] font-mono font-bold text-slate-300 tracking-widest">{num}</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1.5 text-[15px]">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 flex items-center gap-3 text-sm text-slate-500">
          <span className="text-base shrink-0">👤</span>
          <span>비회원도 접수 가능합니다 — 회원 가입 시 접수 내역을 언제든지 조회할 수 있어요.</span>
          {!session && (
            <Link href="/register" className="shrink-0 text-slate-900 font-semibold hover:underline underline-offset-2 ml-auto">
              가입하기 →
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
