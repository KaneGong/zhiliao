"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Shield, Beaker, FileText, Database } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "登录失败");
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
          <h1 className="brand-title">知料 ZhiLiao</h1>
          <p className="brand-sub">AI 驱动的食品原料智能平台</p>

          <div className="feature-grid">
            {[
              { icon: Beaker, label: "AI 配方推荐", desc: "基于法规与数据的智能方案" },
              { icon: Shield, label: "法规速查", desc: "实时追踪食品安全法规" },
              { icon: Database, label: "原料数据库", desc: "全球优质原料资源库" },
              { icon: FileText, label: "合规验证", desc: "AI 自动检测配方合规性" },
            ].map((f) => (
              <div key={f.label} className="feature-card">
                <f.icon className="feature-icon" strokeWidth={1.5} />
                <div>
                  <div className="feature-label">{f.label}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="brand-footer">
            <span className="brand-footer-tag">v2.0</span>
            <span className="brand-footer-dot">·</span>
            <span>食品研发智能工作台</span>
          </div>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="login-form-wrap">
        <div className="login-form-card">
          <div className="form-header">
            <div className="form-logo-sm">
              <span>知</span>
            </div>
            <h2>欢迎回来</h2>
            <p>登录你的知料账号</p>
          </div>

          {error && (
            <div className="form-error">
              <span className="error-dot" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-body">
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

            <div className="field">
              <label className="field-label">密码</label>
              <div className="pw-wrap">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入密码"
                  required
                  className="field-input pw-input"
                  autoComplete="current-password"
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

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <span className="loading-dots">
                  <span /><span /><span />
                </span>
              ) : (
                <>
                  登录
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="form-footer">
            <p>
              没有账号？
              <Link href="/register" className="form-link">
                免费注册
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
          max-width: 420px;
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
          margin: 0 0 40px;
          font-family: "IBM Plex Mono", monospace;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 40px;
        }
        .feature-card {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px;
          border-radius: 10px;
          border: 1px solid rgba(242,237,228,.06);
          background: rgba(255,255,255,.025);
          transition: all .2s ease;
        }
        .feature-card:hover {
          border-color: rgba(240,165,80,.15);
          background: rgba(240,165,80,.04);
        }
        .feature-icon {
          width: 18px;
          height: 18px;
          color: #f0a550;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .feature-label {
          font-size: 13px;
          font-weight: 600;
          color: #f2ede4;
          line-height: 1.4;
        }
        .feature-desc {
          font-size: 11px;
          color: #7e7464;
          line-height: 1.4;
          margin-top: 2px;
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
          background: rgba(240,165,80,.1);
          color: #f0a550;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: .08em;
        }
        .brand-footer-dot {
          color: rgba(242,237,228,.12);
        }

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
          max-width: 380px;
        }
        .form-header {
          text-align: center;
          margin-bottom: 32px;
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
          gap: 18px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field-label {
          font-size: 12px;
          font-weight: 600;
          color: #b8ad9a;
          letter-spacing: .04em;
          font-family: "IBM Plex Mono", monospace;
          text-transform: uppercase;
        }
        .field-input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid rgba(242,237,228,.08);
          background: rgba(255,255,255,.03);
          color: #f2ede4;
          font-size: 14px;
          transition: all .2s ease;
          outline: none;
        }
        .field-input::placeholder {
          color: #7e7464;
        }
        .field-input:focus {
          border-color: rgba(240,165,80,.3);
          box-shadow: 0 0 0 3px rgba(240,165,80,.08);
          background: rgba(255,255,255,.04);
        }

        .pw-wrap {
          position: relative;
        }
        .pw-input {
          padding-right: 44px;
        }
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
        .pw-toggle:hover {
          color: #b8ad9a;
          background: rgba(255,255,255,.04);
        }

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
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .submit-btn:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .loading-dots {
          display: flex;
          gap: 4px;
        }
        .loading-dots span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: white;
          animation: dotBounce 1.2s ease-in-out infinite;
        }
        .loading-dots span:nth-child(2) { animation-delay: .15s; }
        .loading-dots span:nth-child(3) { animation-delay: .3s; }

        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }

        .form-footer {
          text-align: center;
          margin-top: 24px;
        }
        .form-footer p {
          font-size: 13px;
          color: #7e7464;
          margin: 0;
        }
        .form-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #f0a550;
          font-weight: 600;
          text-decoration: none;
          margin-left: 4px;
          transition: all .15s ease;
        }
        .form-link:hover {
          color: #d88d42;
        }

        .form-divider {
          height: 1px;
          background: rgba(242,237,228,.06);
          margin: 24px 0;
        }

        .supplier-entry {
          text-align: center;
        }
        .supplier-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #7e7464;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid rgba(242,237,228,.06);
          transition: all .2s ease;
        }
        .supplier-link:hover {
          color: #b8ad9a;
          border-color: rgba(242,237,228,.12);
          background: rgba(255,255,255,.025);
        }

        .login-copyright {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          color: rgba(126,116,100,.5);
          font-family: "IBM Plex Mono", monospace;
        }

        /* ── 响应式 ── */
        @media (max-width: 768px) {
          .login-page {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
          }
          .login-brand {
            padding: 32px 24px;
          }
          .login-brand::after {
            display: none;
          }
          .login-brand-inner {
            max-width: 100%;
          }
          .brand-title {
            font-size: 24px;
          }
          .feature-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .feature-card {
            padding: 10px;
          }
          .login-form-wrap {
            padding: 32px 24px;
          }
        }

        @media (max-width: 480px) {
          .feature-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
