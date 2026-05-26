import fs from "fs";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "src", "data", "users.json");

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: "user" | "supplier" | "admin";
  company?: string;
  created_at: string;
}

function readUsers(): User[] {
  if (!fs.existsSync(USERS_FILE)) return [];
  const raw = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeUsers(users: User[]): void {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export function findUserByEmail(email: string): User | undefined {
  return readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  return readUsers().find((u) => u.id === id);
}

export function createUser(data: {
  email: string;
  name: string;
  password_hash: string;
  role?: "user" | "supplier" | "admin";
  company?: string;
}): User {
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error("该邮箱已注册");
  }
  const user: User = {
    id: `user-${Date.now()}`,
    email: data.email.toLowerCase(),
    name: data.name,
    password_hash: data.password_hash,
    role: data.role || "user",
    company: data.company,
    created_at: new Date().toISOString(),
  };
  users.push(user);
  writeUsers(users);
  return user;
}
