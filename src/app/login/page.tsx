"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "登录失败"); return; }
      router.push("/");
      router.refresh();
    } catch { setError("网络错误，请稍后重试"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white/[0.03] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="inline-flex w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-orange-500 items-center justify-center text-white text-lg font-bold mb-3">知</div>
          <h1 className="text-xl font-bold text-slate-200">登录知料</h1>
          <p className="text-sm text-slate-500 mt-1">欢迎回来</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[var(--bg-surface)] rounded-2xl p-6 shadow-sm border border-white/[0.06] space-y-4">
          {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">邮箱</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="输入密码" required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"/>
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">没有账号？<Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium ml-1">注册</Link></p>
        <p className="mt-4 text-center"><Link href="/" className="text-xs text-slate-400 hover:text-slate-500">← 回到首页</Link></p>
      </div>
    </div>
  );
}
