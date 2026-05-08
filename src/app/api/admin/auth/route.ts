import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = "zhiliao2026";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get("zhiliao_admin");
  if (cookie?.value === "authenticated") {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("zhiliao_admin", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
}
