"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle, Building2, Globe, MapPin, Phone, Mail, Package } from "lucide-react";

export default function SupplierRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    id: "",
    name: "",
    name_en: "",
    description: "",
    contact_email: "",
    contact_phone: "",
    contact_person: "",
    website: "",
    location: "",
    brands: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id || !form.name) {
      setError("供应商 ID 和名称为必填");
      return;
    }
    setError("");
    setLoading(true);

    const supplier = {
      id: form.id,
      name: form.name,
      name_en: form.name_en,
      description: form.description,
      contact: {
        email: form.contact_email,
        phone: form.contact_phone,
        person: form.contact_person,
      },
      website: form.website,
      location: form.location,
      brands: form.brands.split(",").map((s) => s.trim()).filter(Boolean),
      is_master: false,
    };

    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(supplier),
    });

    if (res.ok) {
      setSuccess(true);
      document.cookie = `supplier_id=${form.id};path=/;max-age=86400`;
      setTimeout(() => router.push("/supplier/dashboard"), 2000);
    } else {
      const data = await res.json();
      setError(data.error || "注册失败");
    }
    setLoading(false);
  };

  const update = (key: string, val: string) => setForm({ ...form, [key]: val });

  if (success) {
    return (
      <div className="success-page">
        <div className="success-card">
          <div className="success-icon">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2>入驻申请已提交</h2>
          <p>正在跳转到供应商后台...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-inner">
        {/* 顶部导航 */}
        <div className="reg-topbar">
          <Link href="/" className="reg-back">
            ← 返回首页
          </Link>
        </div>

        {/* 标题区 */}
        <div className="reg-hero">
          <div className="reg-hero-icon">
            <Building2 className="w-6 h-6" />
          </div>
          <h1>供应商入驻</h1>
          <p>注册成为知料平台供应商，开始录入您的产品</p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="reg-form">
          {/* 基本信息 */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-num">01</div>
              <div>
                <h3>基本信息</h3>
                <p>公司核心信息</p>
              </div>
            </div>
            <div className="field-grid">
              <div className="field">
                <label className="field-label">供应商 ID <span className="required">*</span></label>
                <input value={form.id} onChange={(e) => update("id", e.target.value)} placeholder="如: my-company" required className="field-input" />
              </div>
              <div className="field">
                <label className="field-label">公司名称 <span className="required">*</span></label>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="中文名称" required className="field-input" />
              </div>
              <div className="field">
                <label className="field-label">英文名称</label>
                <input value={form.name_en} onChange={(e) => update("name_en", e.target.value)} placeholder="English Name" className="field-input" />
              </div>
              <div className="field">
                <label className="field-label">所在地</label>
                <div className="field-icon-wrap">
                  <MapPin className="field-icon" />
                  <input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="如: 上海" className="field-input field-with-icon" />
                </div>
              </div>
            </div>
          </div>

          {/* 联系信息 */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-num">02</div>
              <div>
                <h3>联系方式</h3>
                <p>对接信息</p>
              </div>
            </div>
            <div className="field-grid">
              <div className="field">
                <label className="field-label">联系人</label>
                <input value={form.contact_person} onChange={(e) => update("contact_person", e.target.value)} placeholder="联系人姓名" className="field-input" />
              </div>
              <div className="field">
                <label className="field-label">联系电话</label>
                <div className="field-icon-wrap">
                  <Phone className="field-icon" />
                  <input value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} placeholder="手机号码" className="field-input field-with-icon" />
                </div>
              </div>
              <div className="field">
                <label className="field-label">邮箱</label>
                <div className="field-icon-wrap">
                  <Mail className="field-icon" />
                  <input value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} placeholder="contact@company.com" className="field-input field-with-icon" />
                </div>
              </div>
              <div className="field">
                <label className="field-label">公司网站</label>
                <div className="field-icon-wrap">
                  <Globe className="field-icon" />
                  <input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://..." className="field-input field-with-icon" />
                </div>
              </div>
            </div>
          </div>

          {/* 业务信息 */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-num">03</div>
              <div>
                <h3>业务信息</h3>
                <p>品牌与产品线</p>
              </div>
            </div>
            <div className="field-grid">
              <div className="field full-width">
                <label className="field-label">代理品牌</label>
                <div className="field-icon-wrap">
                  <Package className="field-icon" />
                  <input value={form.brands} onChange={(e) => update("brands", e.target.value)} placeholder="逗号分隔，如: 品牌A, 品牌B, 品牌C" className="field-input field-with-icon" />
                </div>
                <span className="field-hint">多个品牌用逗号分隔</span>
              </div>
              <div className="field full-width">
                <label className="field-label">公司简介</label>
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="简要描述公司业务和主要产品线..." rows={3} className="field-textarea" />
              </div>
            </div>
          </div>

          {error && (
            <div className="form-error">
              <span className="error-dot" />
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <span className="loading-dots"><span /><span /><span /></span>
            ) : (
              <>
                提交入驻申请
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="form-note">
            已有供应商账号？
            <Link href="/login" className="form-link">登录</Link>
          </div>
        </form>
      </div>

      <style jsx>{`
        .register-page {
          min-height: 100vh;
          background: #0e1217;
          padding-bottom: 60px;
        }
        .register-inner {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .reg-topbar {
          padding: 20px 0;
        }
        .reg-back {
          font-size: 13px;
          color: #7e7464;
          text-decoration: none;
          font-family: "IBM Plex Mono", monospace;
          transition: color .15s;
        }
        .reg-back:hover { color: #b8ad9a; }

        .reg-hero {
          text-align: center;
          margin: 24px 0 40px;
        }
        .reg-hero-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: inline-grid;
          place-items: center;
          background: linear-gradient(135deg, #f0a550, #ef7e42);
          color: white;
          margin-bottom: 16px;
          box-shadow: 0 0 32px rgba(240,165,80,.15);
        }
        .reg-hero h1 {
          font-family: "Noto Serif SC", serif;
          font-size: 28px;
          font-weight: 900;
          color: #f2ede4;
          margin: 0 0 6px;
        }
        .reg-hero p {
          font-size: 14px;
          color: #7e7464;
          margin: 0;
        }

        /* 表单区块 */
        .form-section {
          margin-bottom: 28px;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid rgba(242,237,228,.06);
          background: rgba(255,255,255,.02);
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(242,237,228,.06);
        }
        .section-num {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: grid;
          place-items: center;
          background: rgba(240,165,80,.08);
          color: #f0a550;
          font-family: "IBM Plex Mono", monospace;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .section-header h3 {
          font-family: "Noto Serif SC", serif;
          font-size: 15px;
          font-weight: 700;
          color: #f2ede4;
          margin: 0;
        }
        .section-header p {
          font-size: 12px;
          color: #7e7464;
          margin: 2px 0 0;
        }

        .field-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .full-width {
          grid-column: 1 / -1;
        }

        .field-label {
          font-size: 11px;
          font-weight: 600;
          color: #b8ad9a;
          letter-spacing: .06em;
          font-family: "IBM Plex Mono", monospace;
          text-transform: uppercase;
        }
        .required { color: #e07373; }

        .field-input {
          width: 100%;
          height: 40px;
          padding: 0 12px;
          border-radius: 12px;
          border: 1px solid rgba(242,237,228,.08);
          background: rgba(255,255,255,.03);
          color: #f2ede4;
          font-size: 13px;
          transition: all .2s ease;
          outline: none;
        }
        .field-input::placeholder { color: #7e7464; }
        .field-input:focus {
          border-color: rgba(240,165,80,.3);
          box-shadow: 0 0 0 3px rgba(240,165,80,.08);
          background: rgba(255,255,255,.04);
        }

        .field-icon-wrap {
          position: relative;
        }
        .field-icon-wrap :global(.field-icon) {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 14px;
          height: 14px;
          color: #7e7464;
          z-index: 1;
        }
        .field-with-icon {
          padding-left: 30px;
        }

        .field-textarea {
          width: 100%;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(242,237,228,.08);
          background: rgba(255,255,255,.03);
          color: #f2ede4;
          font-size: 13px;
          resize: vertical;
          outline: none;
          min-height: 80px;
          transition: all .2s ease;
          font-family: inherit;
        }
        .field-textarea::placeholder { color: #7e7464; }
        .field-textarea:focus {
          border-color: rgba(240,165,80,.3);
          box-shadow: 0 0 0 3px rgba(240,165,80,.08);
        }

        .field-hint {
          font-size: 11px;
          color: #7e7464;
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
          margin-bottom: 16px;
        }
        .error-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #e07373; flex-shrink: 0;
        }

        .submit-btn {
          width: 100%;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #f0a550, #ef7e42);
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all .2s ease;
          box-shadow: 0 0 20px rgba(240,165,80,.12);
        }
        .submit-btn:hover:not(:disabled) {
          box-shadow: 0 0 30px rgba(240,165,80,.22);
          transform: translateY(-1px);
        }
        .submit-btn:disabled { opacity: .6; cursor: not-allowed; }

        .loading-dots { display: flex; gap: 4px; }
        .loading-dots span {
          width: 5px; height: 5px; border-radius: 50%;
          background: white; animation: dotBounce 1.2s ease-in-out infinite;
        }
        .loading-dots span:nth-child(2) { animation-delay: .15s; }
        .loading-dots span:nth-child(3) { animation-delay: .3s; }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }

        .form-note {
          text-align: center;
          font-size: 13px;
          color: #7e7464;
          margin-top: 20px;
        }
        .form-link {
          color: #f0a550;
          font-weight: 600;
          text-decoration: none;
          margin-left: 4px;
        }
        .form-link:hover { color: #d88d42; }

        /* 成功页 */
        .success-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: #0e1217;
        }
        .success-card {
          text-align: center;
          padding: 48px;
          border-radius: 16px;
          border: 1px solid rgba(100,185,135,.15);
          background: rgba(100,185,135,.04);
        }
        .success-icon { color: #64b987; margin-bottom: 16px; }
        .success-card h2 {
          font-family: "Noto Serif SC", serif;
          font-size: 20px; font-weight: 700; color: #f2ede4; margin: 0 0 6px;
        }
        .success-card p { font-size: 14px; color: #7e7464; margin: 0; }

        @media (max-width: 640px) {
          .field-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
