"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
        <h1 className="text-lg font-bold text-red-700 mb-2">오류가 발생했습니다</h1>
        <p className="text-sm text-red-600 mb-6">서버에서 문제가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
        <button
          onClick={reset}
          className="text-sm bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </main>
  );
}
