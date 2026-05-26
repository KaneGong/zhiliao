import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const LOG_DIR = "/opt/zhiliao/logs";
const JWT_SECRET = process.env.JWT_SECRET || "zhiliao-dev-secret-change-in-production";

export interface LogEntry {
  timestamp: string;
  user_id: string | null;
  api: "recommend" | "regulation";
  query: string;
  response_length: number;
  response_snippet: string;
  status_code: number;
  duration_ms: number;
  error_type: string | null;
  request_id: string;
}

function getLogFilePath(): string {
  const today = new Date().toISOString().slice(0, 10);
  return path.join(LOG_DIR, `ai-${today}.jsonl`);
}

/**
 * 追加一行日志到 JSONL 文件。
 * 自动生成 timestamp 和 request_id（UUID v4）。
 * 如果日志目录不存在，自动创建。
 */
export function appendLog(entry: Omit<LogEntry, "timestamp" | "request_id">): void {
  const logEntry: LogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
    request_id: crypto.randomUUID(),
  };

  const filePath = getLogFilePath();
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.appendFileSync(filePath, JSON.stringify(logEntry) + "\n", "utf-8");
}

/**
 * 从请求 cookie 中提取认证信息。
 * 返回 user_id 和 JWT 验证失败的错误类型。
 */
export async function getRequestAuth(): Promise<{
  user_id: string | null;
  error_type: string | null;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("zhiliao_token")?.value;

    if (!token) {
      return { user_id: null, error_type: "missing" };
    }

    const payload = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    return {
      user_id: (payload?.id as string) || null,
      error_type: null,
    };
  } catch (e: unknown) {
    const err = e as { name?: string };
    if (err?.name === "TokenExpiredError") {
      return { user_id: null, error_type: "expired" };
    }
    if (err?.name === "JsonWebTokenError") {
      return { user_id: null, error_type: "malformed" };
    }
    return { user_id: null, error_type: "auth_error" };
  }
}
