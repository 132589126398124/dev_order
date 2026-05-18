import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import type { FilmItem } from "@/types/order";

export const metadata = { title: "접수 완료" };

interface Props { params: Promise<{ id: string }> }

function maskPhone(phone: string): string {
  if (phone.length < 8) return phone;
  return phone.slice(0, 3) + "-****-" + phone.slice(-4);
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(1, local.length - 2))}@${domain}`;
}

export default async function CompletePage({ params }: Props) {
  const { id } = await params;
  const [order, session] = await Promise.all([
    prisma.order.findUnique({ where: { id } }),
    getSession(),
  ]);
  if (!order) notFound();

  const filmItems = (order.filmItems ?? []) as FilmItem[];
  const isOwner = session && (session.isAdmin || order.userId === session.userId);

  const editLinkValid =
    order.editToken &&
    order.editTokenExpires &&
    order.editTokenExpires > new Date() &&
    !["PROCESSING", "DONE", "CANCELLED"].includes(order.status);

  return (
    <main className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">접수 완료!</h1>
        <p className="text-slate-400 text-sm mt-1.5">확인 이메일이 발송되었습니다</p>
      </div>

      {/* 고유 코드 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 mb-4">
        <p className="text-xs text-slate-500 mb-1">고유 코드</p>
        <p className="text-3xl font-mono font-bold tracking-widest text-slate-900">{order.uniqueCode}</p>
      </div>

      {/* 주문 요약 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 mb-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-500">고객명</p>
            <p className="font-medium text-slate-900">{order.customerName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">연락처</p>
            <p className="font-medium text-slate-900">
              {isOwner ? order.phone : maskPhone(order.phone)}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-500">이메일</p>
            <p className="font-medium text-slate-900">
              {isOwner ? order.email : maskEmail(order.email)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">수령방법</p>
            <p className="font-medium text-slate-900">{order.pickupMethod}</p>
          </div>
        </div>
        {filmItems.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2">필름 목록</p>
            <div className="space-y-1.5">
              {filmItems.map((item, i) => (
                <div key={i} className="text-sm text-slate-700 bg-slate-50 rounded-xl px-3 py-2">
                  {item.filmType} · {item.format} · {item.quantity}롤 · {item.process}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 필름 발송 안내 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">필름 발송 안내</p>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/order/${id}/print`}
            target="_blank"
            className="group border border-slate-200 rounded-xl p-4 hover:border-slate-400 hover:bg-slate-50 transition-all text-center"
          >
            <div className="text-xl mb-2 opacity-70 group-hover:opacity-100 transition-opacity">🖨️</div>
            <p className="text-sm font-semibold text-slate-800">의뢰서 출력</p>
            <p className="text-xs text-slate-400 mt-1">출력 후 필름과 동봉</p>
          </Link>

          <div className="border border-slate-200 rounded-xl p-4 text-center bg-slate-50/50">
            <div className="text-xl mb-2 opacity-70">📦</div>
            <p className="text-sm font-semibold text-slate-800">코드만 적기</p>
            <p className="text-xs text-slate-400 mt-1">메모지에 코드 + 연락처</p>
            <p className="font-mono text-[11px] font-bold mt-2 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 tracking-widest">{order.uniqueCode}</p>
          </div>
        </div>
      </div>

      {/* 액션 링크 */}
      <div className="space-y-2">
        {editLinkValid && (
          <Link
            href={`/order/edit/${order.editToken}`}
            className="flex items-center justify-center w-full border border-slate-200 rounded-2xl py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            접수 내역 수정
          </Link>
        )}
        {!editLinkValid && order.editToken && !session && (
          <div className="w-full border border-amber-200 bg-amber-50 rounded-2xl py-3 px-4 text-sm text-amber-700 text-center">
            수정 링크가 만료되었습니다. 수정이 필요하면 이메일로 문의해주세요.
          </div>
        )}
        {!session && (
          <Link
            href="/register"
            className="flex items-center justify-center w-full border border-slate-200 rounded-2xl py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            회원 가입하고 접수 내역 관리하기 →
          </Link>
        )}
        {session && !session.isAdmin && (
          <Link
            href="/my/orders"
            className="flex items-center justify-center w-full border border-slate-200 rounded-2xl py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            내 접수 내역 보기 →
          </Link>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center mt-4 space-y-1">
        <span className="block">비회원 접수 시 수정 링크가 이메일로 발송됩니다 (48시간 유효)</span>
        <span className="block">작업 시작 전까지 수정 가능합니다</span>
      </p>
    </main>
  );
}
