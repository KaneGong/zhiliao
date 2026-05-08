"use client";

import { useState, useEffect } from "react";
import { TagPicker } from "../components/TagPicker";

type Tab = "products" | "suppliers" | "tags" | "import";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("products");

  useEffect(() => {
    // Check if already authenticated via admin auth endpoint
    fetch("/api/admin/auth").then((r) => {
      if (r.ok) setAuthenticated(true);
    });
  }, []);

  const handleLogin = async () => {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("密码错误");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🔐 管理后台
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="输入管理密码"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">⚙️ 知料管理后台</h1>
          <a href="/" className="text-sm text-blue-600 hover:text-blue-700">
            ← 返回首页
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {(["products", "suppliers", "tags", "import"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "products" && "📦 产品管理"}
              {t === "suppliers" && "🏢 供应商管理"}
              {t === "tags" && "🏷️ 标签管理"}
              {t === "import" && "📥 数据导入"}
            </button>
          ))}
        </div>

        {tab === "products" && <ProductsTab />}
        {tab === "suppliers" && <SuppliersTab />}
        {tab === "tags" && <TagsTab />}
        {tab === "import" && <ImportTab />}
      </div>
    </div>
  );
}

// ── Products Tab ──

function ProductsTab() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState<any>(null);

  useEffect(() => {
    fetch("/api/ingredients")
      .then((r) => r.json())
      .then((d) => {
        setIngredients(d.ingredients);
        setLoading(false);
      });
    fetch("/api/tags")
      .then((r) => r.json())
      .then((d) => setTags(d));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此产品？")) return;
    await fetch(`/api/ingredients/${id}`, { method: "DELETE" });
    setIngredients(ingredients.filter((i) => i.id !== id));
  };

  const handleSave = async () => {
    if (!editing) return;
    const method = editing._isNew ? "POST" : "PUT";
    const url = editing._isNew
      ? "/api/ingredients"
      : `/api/ingredients/${editing.id}`;
    const { _isNew, ...body } = editing;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      if (editing._isNew) {
        setIngredients([...ingredients, data.ingredient]);
      } else {
        setIngredients(
          ingredients.map((i) => (i.id === editing.id ? data.ingredient : i))
        );
      }
      setEditing(null);
    }
  };

  const filtered = ingredients.filter(
    (i) =>
      !search ||
      i.product_name.toLowerCase().includes(search.toLowerCase()) ||
      i.generic_name.toLowerCase().includes(search.toLowerCase()) ||
      i.supplier_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-8 text-gray-400">加载中...</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索产品名称、通用名、供应商..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() =>
            setEditing({
              _isNew: true,
              id: "",
              product_name: "",
              supplier_id: "",
              supplier_name: "",
              generic_name: "",
              generic_name_en: "",
              category: "",
              source: "",
              process: "",
              functional_tags: [],
              applications: [],
              key_specs: {},
              function: "",
              mechanism: "",
              dosage_range: "",
              clinical_evidence: "",
              regulatory_status: {},
              price_range: null,
              origin: "",
              data_source: "",
              confidence: "medium",
            })
          }
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium whitespace-nowrap"
        >
          + 新增产品
        </button>
      </div>

      {editing && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editing._isNew ? "新增产品" : `编辑: ${editing.product_name}`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "product_name", label: "产品名称" },
              { key: "generic_name", label: "通用名(中文)" },
              { key: "generic_name_en", label: "通用名(英文)" },
              { key: "supplier_name", label: "供应商" },
              { key: "supplier_id", label: "供应商ID" },
              { key: "category", label: "品类" },
              { key: "source", label: "来源" },
              { key: "origin", label: "产地" },
              { key: "function", label: "功能" },
              { key: "mechanism", label: "机理" },
              { key: "dosage_range", label: "用量范围" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  value={(editing as any)[key] || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, [key]: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            ))}
            {/* Process - dropdown from tags */}
            {tags && (
              <div>
                <TagPicker
                  label="工艺/形态"
                  selected={editing.process ? [editing.process] : []}
                  options={tags.dimensions?.process?.values || []}
                  onChange={(v) => setEditing({ ...editing, process: v[v.length - 1] || "" })}
                  placeholder="选择工艺/形态..."
                />
              </div>
            )}
            {/* Functional Tags - multi-select */}
            {tags && (
              <div>
                <TagPicker
                  label="功能标签"
                  selected={editing.functional_tags || []}
                  options={tags.dimensions?.functional_tags?.values || []}
                  onChange={(v) => setEditing({ ...editing, functional_tags: v })}
                  placeholder="选择功能标签..."
                />
              </div>
            )}
            {/* Applications - multi-select */}
            {tags && (
              <div>
                <TagPicker
                  label="应用场景"
                  selected={editing.applications || []}
                  options={tags.dimensions?.applications?.values || []}
                  onChange={(v) => setEditing({ ...editing, applications: v })}
                  placeholder="选择应用场景..."
                />
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              保存
            </button>
            <button
              onClick={() => setEditing(null)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">产品名称</th>
              <th className="text-left px-4 py-3 font-medium">通用名</th>
              <th className="text-left px-4 py-3 font-medium">品类</th>
              <th className="text-left px-4 py-3 font-medium">供应商</th>
              <th className="text-left px-4 py-3 font-medium">标签</th>
              <th className="text-right px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((i) => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {i.product_name}
                </td>
                <td className="px-4 py-3 text-gray-600">{i.generic_name}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
                    {i.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{i.supplier_name}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(i.functional_tags || []).slice(0, 3).map((t: string) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {t}
                      </span>
                    ))}
                    {(i.functional_tags || []).length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{i.functional_tags.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setEditing(i)}
                    className="text-blue-600 hover:text-blue-800 text-sm mr-3"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(i.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400">无匹配产品</div>
        )}
      </div>
    </div>
  );
}

// ── Suppliers Tab ──

function SuppliersTab() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => {
    fetch("/api/suppliers")
      .then((r) => r.json())
      .then((d) => {
        setSuppliers(d.suppliers);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此供应商？")) return;
    await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    setSuppliers(suppliers.filter((s) => s.id !== id));
  };

  const handleSave = async () => {
    if (!editing) return;
    const method = editing._isNew ? "POST" : "PUT";
    const url = editing._isNew
      ? "/api/suppliers"
      : `/api/suppliers/${editing.id}`;
    const { _isNew, ...body } = editing;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      if (editing._isNew) {
        setSuppliers([...suppliers, data.supplier]);
      } else {
        setSuppliers(
          suppliers.map((s) => (s.id === editing.id ? data.supplier : s))
        );
      }
      setEditing(null);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-400">加载中...</div>;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() =>
            setEditing({
              _isNew: true,
              id: "",
              name: "",
              name_en: "",
              description: "",
              contact: {},
              website: "",
              location: "",
              brands: [],
              is_master: false,
            })
          }
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium"
        >
          + 新增供应商
        </button>
      </div>

      {editing && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editing._isNew ? "新增供应商" : `编辑: ${editing.name}`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "id", label: "供应商ID" },
              { key: "name", label: "中文名称" },
              { key: "name_en", label: "英文名称" },
              { key: "location", label: "所在地" },
              { key: "website", label: "网站" },
              { key: "description", label: "描述" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  value={(editing as any)[key] || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, [key]: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                代理品牌 (逗号分隔)
              </label>
              <input
                type="text"
                value={(editing.brands || []).join(", ")}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    brands: e.target.value
                      .split(",")
                      .map((s: string) => s.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              保存
            </button>
            <button
              onClick={() => setEditing(null)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {suppliers.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {s.name}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    ({s.name_en})
                  </span>
                </h3>
                <p className="text-sm text-gray-500 mt-1">{s.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(s.brands || []).map((b: string) => (
                    <span
                      key={b}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(s)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tags Tab ──

function TagsTab() {
  const [tags, setTags] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState({ dimension: "category", value: "" });

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((d) => {
        setTags(d);
        setLoading(false);
      });
  }, []);

  const handleAddTag = async () => {
    if (!newTag.value.trim()) return;
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTag),
    });
    if (res.ok) {
      const data = await res.json();
      setTags(data.tags);
      setNewTag({ ...newTag, value: "" });
    }
  };

  if (loading || !tags)
    return <div className="text-center py-8 text-gray-400">加载中...</div>;

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">新增标签</h3>
        <div className="flex gap-3">
          <select
            value={newTag.dimension}
            onChange={(e) =>
              setNewTag({ ...newTag, dimension: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {Object.entries(tags.dimensions).map(
              ([key, dim]: [string, any]) => (
                <option key={key} value={key}>
                  {dim.label}
                </option>
              )
            )}
          </select>
          <input
            type="text"
            value={newTag.value}
            onChange={(e) => setNewTag({ ...newTag, value: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            placeholder="标签名称"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={handleAddTag}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            添加
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(tags.dimensions).map(([key, dim]: [string, any]) => (
          <div
            key={key}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <h4 className="font-semibold text-gray-900 mb-3">{dim.label}</h4>
            <div className="flex flex-wrap gap-1.5">
              {dim.values.map((v: string) => (
                <span
                  key={v}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Import Tab ──

function ImportTab() {
  const [jsonInput, setJsonInput] = useState("");
  const [result, setResult] = useState<string>("");

  const handleImport = async () => {
    try {
      const data = JSON.parse(jsonInput);
      const items = Array.isArray(data) ? data : [data];
      let success = 0;
      let errors = 0;

      for (const item of items) {
        const res = await fetch("/api/ingredients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (res.ok) success++;
        else errors++;
      }

      setResult(`导入完成: ${success} 成功, ${errors} 失败`);
    } catch (e: any) {
      setResult(`JSON 解析错误: ${e.message}`);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          批量导入产品（JSON 格式）
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          请粘贴 JSON 数组，每个对象需包含 id、product_name、supplier_id、generic_name
          等字段。
        </p>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`[
  {
    "id": "NEW-001",
    "product_name": "示例产品",
    "supplier_id": "ang",
    "supplier_name": "爱联康",
    "generic_name": "示例原料",
    "generic_name_en": "Example",
    "category": "蛋白质类",
    "source": "乳清蛋白",
    "process": "WPC80",
    "functional_tags": ["速溶"],
    "applications": ["运动营养"],
    "key_specs": {},
    "function": "...",
    "mechanism": "",
    "dosage_range": "",
    "clinical_evidence": "",
    "regulatory_status": {},
    "price_range": null,
    "origin": "",
    "data_source": "",
    "confidence": "medium"
  }
]`}
          rows={15}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-sm"
        />
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={handleImport}
            className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-medium"
          >
            导入
          </button>
          {result && (
            <span
              className={`text-sm ${
                result.includes("错误") || result.includes("失败")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {result}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
