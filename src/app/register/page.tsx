"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, User, Building2, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState<"user" | "supplier">("user");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password, company: company || undefined, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "注册失败");
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("网络错误，请稍后重试");
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* 左侧品牌区 */}
      <div className="login-brand">
        <div className="login-brand-inner">
          <div className="brand-mark">
            <span>知</span>
          </div>
          <h1 className="brand-title">加入知料</h1>
          <p className="brand-sub">开启 AI 食品研发之旅</p>

          <div className="benefits-list">
            {[
              { text: "AI 智能配方推荐，秒级生成方案" },
              { text: "覆盖 86+ 项食品安全法规" },
              { text: "全球优质原料数据库" },
              { text: "配方合规性自动验证" },
              { text: "免费使用基础功能" },
            ].map((b, i) => (
              <div key={i} className="benefit-item">
                <div className="benefit-check">
                  <Check className="w-3 h-3" />
                </div>
                <span>{b.text}</span>
              </div>
            ))}
          </div>

          <div className="brand-footer">
            <span className="brand-footer-tag">FREE</span>
            <span className="brand-footer-dot">·</span>
            <span>基础功能永久免费</span>
          </div>
        </div>
      </div>

      {/* 右侧注册表单 */}
      <div className="login-form-wrap">
        <div className="login-form-card">
          <div className="form-header">
            <div className="form-logo-sm">
              <span>知</span>
            </div>
            <h2>创建账号</h2>
            <p>注册知料 ZhiLiao</p>
          </div>

          {/* 角色选择 */}
          <div className="role-switcher">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={`role-btn ${role === "user" ? "role-active" : ""}`}
            >
              <User className="w-4 h-4" />
              <span>普通用户</span>
              {role === "user" && <span className="role-dot" />}
            </button>
            <button
              type="button"
              onClick={() => setRole("supplier")}
              className={`role-btn ${role === "supplier" ? "role-active" : ""}`}
            >
              <Building2 className="w-4 h-4" />
              <span>供应商</span>
              {role === "supplier" && <span className="role-dot" />}
            </button>
          </div>

          {error && (
            <div className="form-error">
              <span className="error-dot" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-body">
            <div className="field-row">
              <div className="field">
                <label className="field-label">姓名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="你的姓名"
                  required
                  className="field-input"
                />
              </div>
              <div className="field">
                <label className="field-label">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="field-input"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label">密码</label>
              <div className="pw-wrap">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少 6 位"
                  required
                  minLength={6}
                  className="field-input pw-input"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="pw-toggle"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {role === "supplier" && (
              <div className="field">
                <label className="field-label">公司名称</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="你的公司名称"
                  className="field-input"
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <span className="loading-dots">
                  <span /><span /><span />
                </span>
              ) : (
                <>
                  创建账号
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="form-footer">
            <p>
              已有账号？
              <Link href="/login" className="form-link">
                登录
              </Link>
            </p>
          </div>

          <div className="form-divider" />

          <div className="supplier-entry">
            <Link href="/supplier/register" className="supplier-link">
              供应商入驻
            </Link>
          </div>
        </div>

        <div className="login-copyright">
          © {new Date().getFullYear()} 知料 ZhiLiao
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
        }

        /* ── 左侧品牌 ── */
        .login-brand {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
          background:
            linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px),
            linear-gradient(180deg, rgba(255,255,255,.014) 1px, transparent 1px),
            radial-gradient(circle at 20% 8%, rgba(240,165,80,.12), transparent 36%),
            radial-gradient(circle at 80% 85%, rgba(100,185,135,.06), transparent 30%),
            #0e1217;
          background-size: 56px 56px, 56px 56px, auto, auto, auto;
        }
        .login-brand::after {
          content: "";
          position: absolute;
          right: 0;
          top: 10%;
          height: 80%;
          width: 1px;
          background: linear-gradient(180deg, transparent, rgba(240,165,80,.2), rgba(240,165,80,.08), transparent);
        }
        .login-brand-inner {
          max-width: 400px;
          width: 100%;
        }
        .brand-mark {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #f0a550, #ef7e42);
          color: white;
          font-family: "Noto Serif SC", serif;
          font-weight: 900;
          font-size: 26px;
          box-shadow: 0 0 40px rgba(240,165,80,.2);
          margin-bottom: 24px;
        }
        .brand-title {
          font-family: "Noto Serif SC", serif;
          font-size: 32px;
          font-weight: 900;
          color: #f2ede4;
          letter-spacing: .06em;
          margin: 0 0 6px;
        }
        .brand-sub {
          font-size: 14px;
          color: #7e7464;
          letter-spacing: .04em;
          margin: 0 0 36px;
          font-family: "IBM Plex Mono", monospace;
        }

        .benefits-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 40px;
        }
        .benefit-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #b8ad9a;
        }
        .benefit-check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: rgba(100,185,135,.12);
          color: #64b987;
          flex-shrink: 0;
        }

        .brand-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #7e7464;
          font-size: 12px;
          font-family: "IBM Plex Mono", monospace;
        }
        .brand-footer-tag {
          padding: 2px 8px;
          border-radius: 4px;
          background: rgba(100,185,135,.1);
          color: #64b987;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: .08em;
        }
        .brand-footer-dot { color: rgba(242,237,228,.12); }

        /* ── 右侧表单 ── */
        .login-form-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          background: #0e1217;
        }
        .login-form-card {
          width: 100%;
          max-width: 400px;
        }
        .form-header {
          text-align: center;
          margin-bottom: 28px;
        }
        .form-logo-sm {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: inline-grid;
          place-items: center;
          background: linear-gradient(135deg, #f0a550, #ef7e42);
          color: white;
          font-family: "Noto Serif SC", serif;
          font-weight: 900;
          font-size: 18px;
          margin-bottom: 16px;
          box-shadow: 0 0 24px rgba(240,165,80,.15);
        }
        .form-header h2 {
          font-family: "Noto Serif SC", serif;
          font-size: 22px;
          font-weight: 700;
          color: #f2ede4;
          margin: 0 0 4px;
        }
        .form-header p {
          font-size: 13px;
          color: #7e7464;
          margin: 0;
        }

        /* 角色切换 */
        .role-switcher {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 20px;
        }
        .role-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 40px;
          border-radius: 12px;
          border: 1px solid rgba(242,237,228,.08);
          background: rgba(255,255,255,.025);
          color: #7e7464;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all .2s ease;
          position: relative;
        }
        .role-btn:hover {
          border-color: rgba(242,237,228,.12);
          color: #b8ad9a;
        }
        .role-active {
          border-color: rgba(240,165,80,.25);
          background: rgba(240,165,80,.06);
          color: #f0a550;
        }
        .role-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #f0a550;
        }

        .form-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 8px;
          background: rgba(224,115,115,.08);
          border: 1px solid rgba(224,115,115,.15);
          color: #e07373;
          font-size: 13px;
          margin-bottom: 20px;
        }
        .error-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #e07373;
          flex-shrink: 0;
        }

        .form-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field-label {
          font-size: 11px;
          font-weight: 600;
          color: #b8ad9a;
          letter-spacing: .06em;
          font-family: "IBM Plex Mono", monospace;
          text-transform: uppercase;
        }
        .field-input {
          width: 100%;
          height: 42px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid rgba(242,237,228,.08);
          background: rgba(255,255,255,.03);
          color: #f2ede4;
          font-size: 14px;
          transition: all .2s ease;
          outline: none;
        }
        .field-input::placeholder { color: #7e7464; }
        .field-input:focus {
          border-color: rgba(240,165,80,.3);
          box-shadow: 0 0 0 3px rgba(240,165,80,.08);
          background: rgba(255,255,255,.04);
        }

        .pw-wrap { position: relative; }
        .pw-input { padding-right: 44px; }
        .pw-toggle {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border: none;
          background: transparent;
          color: #7e7464;
          border-radius: 6px;
          cursor: pointer;
          transition: all .15s ease;
        }
        .pw-toggle:hover { color: #b8ad9a; background: rgba(255,255,255,.04); }

        .submit-btn {
          width: 100%;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #f0a550, #ef7e42);
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all .2s ease;
          box-shadow: 0 0 20px rgba(240,165,80,.12);
          margin-top: 4px;
        }
        .submit-btn:hover:not(:disabled) {
          box-shadow: 0 0 30px rgba(240,165,80,.22);
          transform: translateY(-1px);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: .6; cursor: not-allowed; }

        .loading-dots { display: flex; gap: 4px; }
        .loading-dots span {
          width: 5px; height: 5px; border-radius: 50%;
          background: white;
          animation: dotBounce 1.2s ease-in-out infinite;
        }
        .loading-dots span:nth-child(2) { animation-delay: .15s; }
        .loading-dots span:nth-child(3) { animation-delay: .3s; }

        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }

        .form-footer { text-align: center; margin-top: 20px; }
        .form-footer p { font-size: 13px; color: #7e7464; margin: 0; }
        .form-link {
          display: inline-flex; align-items: center; gap: 4px;
          color: #f0a550; font-weight: 600; text-decoration: none;
          margin-left: 4px; transition: all .15s ease;
        }
        .form-link:hover { color: #d88d42; }

        .form-divider { height: 1px; background: rgba(242,237,228,.06); margin: 20px 0; }

        .supplier-entry { text-align: center; }
        .supplier-link {
          font-size: 13px; color: #7e7464; text-decoration: none;
          padding: 8px 16px; border-radius: 8px;
          border: 1px solid rgba(242,237,228,.06);
          transition: all .2s ease;
        }
        .supplier-link:hover {
          color: #b8ad9a; border-color: rgba(242,237,228,.12);
          background: rgba(255,255,255,.025);
        }

        .login-copyright {
          position: absolute; bottom: 20px; left: 50%;
          transform: translateX(-50%);
          font-size: 11px; color: rgba(126,116,100,.5);
          font-family: "IBM Plex Mono", monospace;
        }

        @media (max-width: 768px) {
          .login-page {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
          }
          .login-brand { padding: 32px 24px; }
          .login-brand::after { display: none; }
          .login-brand-inner { max-width: 100%; }
          .brand-title { font-size: 24px; }
          .login-form-wrap { padding: 32px 24px; }
          .field-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
