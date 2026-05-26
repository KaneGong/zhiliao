import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, signToken, setAuthCookie, UserPayload } from "@/lib/auth";
import { findUserByEmail } from "@/lib/users";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "请输入邮箱和密码" }, { status: 400 });
    }
    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }
    const payload: UserPayload = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = signToken(payload);
    await setAuthCookie(token);
    return NextResponse.json({ success: true, user: payload });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
