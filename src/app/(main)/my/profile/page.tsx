import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/my/ProfileForm";
import Link from "next/link";

export const metadata = { title: "내 프로필" };

export default async function MyProfilePage() {
  const session = await getSession();
  if (!session || session.isAdmin) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { profileName: true, profilePhone: true, profileEmail: true, profileAddress: true },
  });

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">내 프로필</h1>
          <p className="text-slate-500 text-sm mt-0.5">접수 시 자동으로 불러올 기본 정보를 관리합니다</p>
        </div>
        <Link href="/my/orders" className="text-sm border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
          접수 내역
        </Link>
      </div>
      <ProfileForm initialProfile={user ?? {}} />
    </main>
  );
}
