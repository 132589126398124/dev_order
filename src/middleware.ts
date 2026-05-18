import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "film_session";

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "");
}

async function getSession(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { userId: string; username: string; isAdmin: boolean };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSession(request);

  // 이미 로그인된 상태에서 로그인/회원가입 접근 차단
  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/my/orders", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register"],
};
