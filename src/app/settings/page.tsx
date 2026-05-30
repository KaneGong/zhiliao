"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle, KeyRound, Mail, ShieldCheck, User } from "lucide-react";
import { Spinner } from "../components/ui";

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
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (!d.user) { router.push("/login"); return; }
      setUser(d.user);
      setName(d.user.name || "");
      setCompany(d.user.company || "");
    }).finally(() => setLoading(false));
  }, [router]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      const res = await fetch("/api/auth/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, company, password: newPassword || undefined }) });
      const data = await res.json();
      if (res.ok) { setMsg("保存成功" + (newPassword ? "，密码已更新" : "")); setNewPassword(""); }
      else setMsg(data.error || "保存失败");
    } catch { setMsg("网络错误"); } finally { setSaving(false); }
  };

  if (loading) return <div className="settings-loader"><Spinner className="w-8 h-8 text-amber-400" /></div>;
  if (!user) return null;

  return (
    <div className="settings-page">
      <div className="settings-inner">
        <header className="settings-hero">
          <p className="eyebrow">ACCOUNT SETTINGS</p>
          <h1>账号设置</h1>
          <p>管理你的身份信息、公司归属和登录密码。</p>
        </header>

        <form onSubmit={saveProfile} className="settings-card">
          {msg && <div className={`notice ${msg.includes("成功") ? "ok" : "bad"}`}><CheckCircle className="w-4 h-4" />{msg}</div>}

          <div className="identity-card">
            <div className="avatar">{user.name?.charAt(0) || "知"}</div>
            <div>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
            </div>
            <span className="role-pill"><ShieldCheck className="w-3.5 h-3.5" />{user.role === "admin" ? "管理员" : user.role === "supplier" ? "供应商" : "普通用户"}</span>
          </div>

          <div className="form-grid">
            <Field icon={<Mail className="w-4 h-4" />} label="邮箱">
              <input value={user.email} disabled />
              <small>邮箱不可修改</small>
            </Field>
            <Field icon={<User className="w-4 h-4" />} label="姓名">
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field icon={<Building2 className="w-4 h-4" />} label="公司名称">
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="选填" />
            </Field>
            <Field icon={<KeyRound className="w-4 h-4" />} label="新密码">
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="留空则不修改" minLength={6} />
            </Field>
          </div>

          <button type="submit" disabled={saving} className="save-btn">{saving ? "保存中..." : "保存修改"}</button>
        </form>
      </div>

      <style jsx>{`
        .settings-page { min-height:calc(100vh - 56px); background:linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.015) 1px,transparent 1px),radial-gradient(circle at 18% 6%,rgba(240,165,80,.12),transparent 30%),#0e1217; background-size:64px 64px,64px 64px,auto,auto; }
        .settings-inner { max-width:760px; margin:0 auto; padding:44px 24px 72px; }
        .eyebrow { margin:0 0 8px; color:#7e7464; font:700 10px/1 var(--font-mono); letter-spacing:.16em; text-transform:uppercase; }
        .settings-hero { margin-bottom:24px; }
        .settings-hero h1 { margin:0 0 10px; color:#f2ede4; font:900 34px/1.15 "Noto Serif SC",serif; }
        .settings-hero p { margin:0; color:#b8ad9a; line-height:1.8; }
        .settings-card { border:1px solid rgba(242,237,228,.09); border-radius:16px; background:rgba(25,34,44,.72); overflow:hidden; box-shadow:0 24px 80px rgba(0,0,0,.2); }
        .notice { margin:18px 18px 0; display:flex; align-items:center; gap:8px; padding:11px 14px; border-radius:10px; font-size:13px; }
        .notice.ok { color:#64b987; border:1px solid rgba(100,185,135,.2); background:rgba(100,185,135,.08); }
        .notice.bad { color:#e07373; border:1px solid rgba(224,115,115,.2); background:rgba(224,115,115,.08); }
        .identity-card { display:flex; align-items:center; gap:14px; padding:22px; border-bottom:1px solid rgba(242,237,228,.09); }
        .avatar { width:48px;height:48px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(135deg,#f0a550,#ef7e42);color:white;font:900 22px/1 "Noto Serif SC",serif; }
        .identity-card h2 { margin:0 0 4px; color:#f2ede4; font-size:18px; }
        .identity-card p { margin:0; color:#7e7464; font-size:13px; }
        .role-pill { margin-left:auto; display:inline-flex; align-items:center; gap:6px; color:#64b987; border:1px solid rgba(100,185,135,.2); background:rgba(100,185,135,.08); border-radius:999px; padding:6px 10px; font-size:12px; font-weight:700; }
        .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; padding:22px; }
        .field { display:grid; gap:7px; }
        .field-label { display:flex; align-items:center; gap:7px; color:#b8ad9a; font-size:12px; font-weight:700; }
        input { width:100%; height:42px; border:1px solid rgba(242,237,228,.08); border-radius:12px; background:rgba(255,255,255,.03); color:#f2ede4; padding:0 12px; outline:none; }
        input:focus { border-color:rgba(240,165,80,.3); box-shadow:0 0 0 3px rgba(240,165,80,.08); }
        input:disabled { color:#7e7464; cursor:not-allowed; }
        small { color:#7e7464; font-size:11px; }
        .save-btn { margin:0 22px 22px; width:calc(100% - 44px); height:46px; border:0; border-radius:11px; background:linear-gradient(135deg,#f0a550,#ef7e42); color:white; font-weight:800; cursor:pointer; box-shadow:0 0 22px rgba(240,165,80,.16); }
        .save-btn:disabled { opacity:.6; cursor:not-allowed; }
        .settings-loader { min-height:50vh; display:grid; place-items:center; }
        @media (max-width: 640px) { .form-grid { grid-template-columns:1fr; } .identity-card { align-items:flex-start; } .role-pill { margin-left:0; } }
      `}</style>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return <label className="field"><span className="field-label">{icon}{label}</span>{children}</label>;
}
