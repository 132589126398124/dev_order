import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold mb-3">KDL 현상소</h1>
      <p className="text-gray-500 mb-10 max-w-sm">
        필름 현상 및 스캔 택배 접수 서비스
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/order/new"
          className="bg-black text-white py-3 rounded-xl text-center font-medium hover:bg-gray-800 transition-colors"
        >
          접수 신청
        </Link>
        <Link
          href="/login"
          className="border border-gray-300 py-3 rounded-xl text-center text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          로그인 (접수 내역 조회)
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-3 gap-8 text-sm text-gray-500 max-w-md">
        <div>
          <div className="text-2xl mb-2">📝</div>
          <p>온라인 접수</p>
        </div>
        <div>
          <div className="text-2xl mb-2">📦</div>
          <p>택배 발송</p>
        </div>
        <div>
          <div className="text-2xl mb-2">📷</div>
          <p>현상 완료</p>
        </div>
      </div>
    </main>
  );
}
