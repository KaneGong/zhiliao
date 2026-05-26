"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Spinner } from "../components/ui";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
      setUser(d.user);
      setName(d.user.name || "");
    }).finally(() => setLoading(false));
  }, [router]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      const res = await fetch("/api/auth/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, company, password: newPassword || undefined }) });
      const data = await res.json();
      if (res.ok) { setMsg("✅ 保存成功" + (newPassword ? "，密码已更新" : "")); setNewPassword(""); }
      else setMsg("❌ " + (data.error || "保存失败"));
    } catch { setMsg("❌ 网络错误"); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Spinner className="w-8 h-8 text-blue-600" /></div>;
  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      <h1 className="text-2xl font-bold text-slate-200 mb-1">账号设置</h1>
      <p className="text-sm text-slate-500 mb-8">管理你的个人信息和密码</p>

      <form onSubmit={saveProfile} className="bg-[var(--bg-surface)] rounded-2xl border border-white/[0.06] p-6 space-y-4 shadow-sm">
        {msg && <div className={`rounded-lg px-4 py-3 text-sm ${msg.startsWith("✅") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{msg}</div>}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">邮箱</label>
          <Input value={user.email} disabled className="bg-white/[0.03]" />
          <p className="text-xs text-slate-400 mt-1">邮箱不可修改</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">姓名</label>
          <Input value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">公司名称</label>
          <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="选填" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">账号类型</label>
          <div className="text-sm text-slate-500 bg-white/[0.03] rounded-lg px-3 py-2.5">
            {user.role === "admin" ? "🔧 管理员" : user.role === "supplier" ? "🏢 供应商" : "🧑 普通用户"}
          </div>
        </div>

        <hr className="border-white/[0.05]" />

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">新密码 <span className="text-slate-400 font-normal">（留空则不修改）</span></label>
          <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="至少6位" minLength={6} />
        </div>

        <Button type="submit" disabled={saving} className="w-full">{saving ? "保存中..." : "💾 保存修改"}</Button>
      </form>
    </div>
  );
}
