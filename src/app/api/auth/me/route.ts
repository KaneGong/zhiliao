import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { findUserById, User } from "@/lib/users";
import fs from "fs";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "src", "data", "users.json");

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}

export async function PUT(request: NextRequest) {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const { name, company, password } = await request.json();
  const users: User[] = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  const idx = users.findIndex(u => u.id === current.id);
  if (idx === -1) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

  if (name) users[idx].name = name;
  if (company !== undefined) users[idx].company = company;
  if (password) users[idx].password_hash = await hashPassword(password);

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  return NextResponse.json({ success: true });
}
