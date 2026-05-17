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

  if (profileName !== null && profileName !== undefined && (typeof profileName !== "string" || profileName.length > 50)) {
    return NextResponse.json({ error: "이름은 50자 이하로 입력해주세요" }, { status: 400 });
  }
  if (profilePhone !== null && profilePhone !== undefined && (typeof profilePhone !== "string" || !/^01[0-9]{8,9}$/.test(profilePhone))) {
    return NextResponse.json({ error: "올바른 휴대폰 번호를 입력해주세요" }, { status: 400 });
  }
  if (profileEmail !== null && profileEmail !== undefined && (typeof profileEmail !== "string" || profileEmail.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileEmail))) {
    return NextResponse.json({ error: "올바른 이메일을 입력해주세요" }, { status: 400 });
  }
  if (profileAddress !== null && profileAddress !== undefined && (typeof profileAddress !== "string" || profileAddress.length > 300)) {
    return NextResponse.json({ error: "주소는 300자 이하로 입력해주세요" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      profileName: profileName || null,
      profilePhone: profilePhone || null,
      profileEmail: profileEmail || null,
      profileAddress: profileAddress || null,
    },
  });

  return NextResponse.json({ ok: true });
}
