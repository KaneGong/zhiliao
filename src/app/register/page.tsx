"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState<"user" | "supplier">("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, password, company: company || undefined, role }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "注册失败"); return; }
      router.push("/");
      router.refresh();
    } catch { setError("网络错误，请稍后重试"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white/[0.03] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="inline-flex w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-orange-500 items-center justify-center text-white text-lg font-bold mb-3">知</div>
          <h1 className="text-xl font-bold text-slate-200">创建账号</h1>
          <p className="text-sm text-slate-500 mt-1">注册知料 ZhiLiao</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[var(--bg-surface)] rounded-2xl p-6 shadow-sm border border-white/[0.06] space-y-4">
          {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">邮箱</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">姓名</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="你的姓名" required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">账号类型</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setRole("user")} className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors ${role === "user" ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-300 text-slate-500 hover:bg-white/[0.03]"}`}>🧑 普通用户</button>
              <button type="button" onClick={() => setRole("supplier")} className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors ${role === "supplier" ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-300 text-slate-500 hover:bg-white/[0.03]"}`}>🏢 供应商</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">密码 <span className="text-slate-400 font-normal">（至少6位）</span></label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="至少6位" required minLength={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">公司名称 <span className="text-slate-400 font-normal">（选填）</span></label>
            <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="你的公司"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"/>
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
            {loading ? "注册中..." : "注册"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">已有账号？<Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium ml-1">登录</Link></p>
        <p className="mt-4 text-center"><Link href="/" className="text-xs text-slate-400 hover:text-slate-500">← 回到首页</Link></p>
      </div>
    </div>
  );
}
