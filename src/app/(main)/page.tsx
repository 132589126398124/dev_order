import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          필름 현상 · 스캔 · 택배 접수
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
          KDL 현상소
        </h1>
        <p className="text-slate-500 text-lg max-w-sm mx-auto">
          온라인으로 간편하게 접수하고 택배로 필름을 보내주세요
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/order/new"
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-medium hover:bg-slate-800 active:scale-95 transition-all text-sm"
          >
            접수 신청하기
          </Link>
          {session ? (
            <Link
              href={session.isAdmin ? "/admin/orders" : "/my/orders"}
              className="bg-white text-slate-700 px-8 py-3 rounded-2xl font-medium border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all text-sm"
            >
              {session.isAdmin ? "관리자 페이지" : "내 접수 내역"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-white text-slate-700 px-8 py-3 rounded-2xl font-medium border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all text-sm"
            >
              로그인
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { step: "01", title: "온라인 접수", desc: "필름 정보를 입력하고 접수 신청서를 제출합니다" },
          { step: "02", title: "택배 발송", desc: "고유 코드를 적은 메모와 함께 필름을 발송합니다" },
          { step: "03", title: "현상 완료", desc: "현상 완료 후 스캔 파일과 필름을 받아보세요" },
        ].map(({ step, title, desc }) => (
          <div key={step} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="text-xs font-mono text-slate-400 mb-3">{step}</div>
            <h3 className="font-semibold text-slate-900 mb-1.5">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-amber-50 border border-amber-100 rounded-2xl p-5 text-sm text-amber-800">
        <strong>접수 안내</strong> — 비회원도 접수 가능합니다. 회원 가입 시 접수 내역을 조회할 수 있습니다.
      </div>
    </main>
  );
}
