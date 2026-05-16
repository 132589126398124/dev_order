import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintButton from "@/components/order/PrintButton";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ code?: string }>;
}

export default async function CompletePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { code } = await searchParams;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) notFound();

  return (
    <main className="max-w-lg mx-auto px-4 py-12 text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">접수 완료</h1>
        <p className="text-gray-500 mt-2">확인 이메일이 발송되었습니다</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-3">
        <div>
          <p className="text-xs text-gray-500">고유 코드</p>
          <p className="text-2xl font-mono font-bold tracking-wider">{order.uniqueCode}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-500">고객명</p>
            <p className="font-medium">{order.customerName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">필름</p>
            <p className="font-medium">{order.filmType} ({order.format})</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">현상</p>
            <p className="font-medium">{order.process}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">스캔</p>
            <p className="font-medium">{order.scanType}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">발송 방법을 선택해주세요</p>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/order/${id}/print`}
            className="border-2 border-gray-200 rounded-xl p-4 hover:border-black transition-colors text-sm"
          >
            <div className="text-2xl mb-2">🖨️</div>
            <p className="font-medium">의뢰서 출력</p>
            <p className="text-xs text-gray-500 mt-1">A4 출력 후 필름과 동봉</p>
          </Link>

          <div className="border-2 border-gray-200 rounded-xl p-4 text-sm">
            <div className="text-2xl mb-2">📦</div>
            <p className="font-medium">고유 ID 사용</p>
            <p className="text-xs text-gray-500 mt-1">박스에 코드와 연락처 기재</p>
            <p className="font-mono text-xs font-bold mt-2 bg-gray-100 rounded px-2 py-1">{order.uniqueCode}</p>
          </div>
        </div>

        <PrintButton orderId={id} />
      </div>

      <div className="mt-8 text-xs text-gray-400">
        <p>비회원 접수 시 이메일로 수정 링크가 발송되었습니다</p>
        <p>작업 시작 전까지 수정 가능합니다 (48시간 유효)</p>
      </div>
    </main>
  );
}
