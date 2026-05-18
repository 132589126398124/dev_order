import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-6xl font-bold text-slate-900 mb-4">404</p>
        <p className="text-slate-500 mb-8">페이지를 찾을 수 없습니다</p>
        <Link
          href="/"
          className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          홈으로
        </Link>
      </main>
    </>
  );
}
