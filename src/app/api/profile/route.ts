import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.isAdmin) return NextResponse.json({ error: "권한 없음" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { profileName: true, profilePhone: true, profileEmail: true, profileAddress: true },
  });

  return NextResponse.json(user ?? {});
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.isAdmin) return NextResponse.json({ error: "권한 없음" }, { status: 401 });

  const { profileName, profilePhone, profileEmail, profileAddress } = await req.json();

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      profileName: profileName ?? null,
      profilePhone: profilePhone ?? null,
      profileEmail: profileEmail ?? null,
      profileAddress: profileAddress ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
