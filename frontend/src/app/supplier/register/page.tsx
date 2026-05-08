"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!form.id || !form.name) {
      setError("供应商ID和名称为必填");
      return;
    }

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
      brands: form.brands
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      is_master: false,
    };

    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(supplier),
    });

    if (res.ok) {
      setSuccess(true);
      // Store supplier_id in cookie for dashboard access
      document.cookie = `supplier_id=${form.id};path=/;max-age=86400`;
      setTimeout(() => router.push("/supplier/dashboard"), 1500);
    } else {
      const data = await res.json();
      setError(data.error || "注册失败");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">注册成功！</h2>
          <p className="text-gray-500">正在跳转到供应商后台...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">供应商入驻</h1>
          <p className="text-gray-500 mt-2">
            注册成为知料平台供应商，开始录入您的产品
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { key: "id", label: "供应商ID *", placeholder: "如: my-company" },
              { key: "name", label: "公司名称 *", placeholder: "中文名称" },
              { key: "name_en", label: "英文名称", placeholder: "English Name" },
              { key: "location", label: "所在地", placeholder: "如: 上海" },
              { key: "website", label: "公司网站", placeholder: "https://..." },
              {
                key: "brands",
                label: "代理品牌",
                placeholder: "逗号分隔，如: 品牌A, 品牌B",
              },
              { key: "contact_person", label: "联系人", placeholder: "" },
              { key: "contact_phone", label: "联系电话", placeholder: "" },
              { key: "contact_email", label: "邮箱", placeholder: "" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {label}
                </label>
                <input
                  type="text"
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                公司简介
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="简要描述公司业务和主要产品线..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-4">{error}</p>
          )}

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              注册
            </button>
            <a
              href="/"
              className="py-3 px-6 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-center"
            >
              返回首页
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
