import { NextRequest, NextResponse } from "next/server";
import { hashPassword, signToken, setAuthCookie, UserPayload } from "@/lib/auth";
import { createUser } from "@/lib/users";

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, company, role } = await request.json();
    if (!email || !name || !password) {
      return NextResponse.json({ error: "请填写邮箱、姓名和密码" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少6位" }, { status: 400 });
    }
    const password_hash = await hashPassword(password);
    const user = createUser({ email, name, password_hash, company, role: role === "supplier" ? "supplier" : "user" });
    const payload: UserPayload = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = signToken(payload);
    await setAuthCookie(token);
    return NextResponse.json({ success: true, user: payload });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
