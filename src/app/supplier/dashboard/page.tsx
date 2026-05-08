"use client";

import { useState, useEffect } from "react";

export default function SupplierDashboardPage() {
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [supplier, setSupplier] = useState<any>(null);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [tags, setTags] = useState<any>(null);

  useEffect(() => {
    // Get supplier_id from cookie
    const cookies = document.cookie.split(";").reduce((acc, c) => {
      const [k, v] = c.trim().split("=");
      acc[k] = v;
      return acc;
    }, {} as Record<string, string>);

    const sid = cookies["supplier_id"];
    if (!sid) {
      setLoading(false);
      return;
    }
    setSupplierId(sid);

    // Load supplier and ingredients
    Promise.all([
      fetch(`/api/suppliers/${sid}`).then((r) => r.json()),
      fetch(`/api/ingredients?supplier=${sid}`).then((r) => r.json()),
      fetch("/api/tags").then((r) => r.json()),
    ]).then(([s, i, t]) => {
      setSupplier(s);
      setIngredients(i.ingredients || []);
      setTags(t);
      setLoading(false);
    });
  }, []);

  const handleAddProduct = () => {
    setEditing({
      _isNew: true,
      id: "",
      product_name: "",
      supplier_id: supplierId || "",
      supplier_name: supplier?.name || "",
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
    });
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

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此产品？")) return;
    await fetch(`/api/ingredients/${id}`, { method: "DELETE" });
    setIngredients(ingredients.filter((i) => i.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!supplierId || !supplier) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">请先注册</h2>
          <p className="text-gray-500 mb-6">
            您需要先注册成为供应商才能使用后台
          </p>
          <a
            href="/supplier/register"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            去注册
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              📦 {supplier.name} - 供应商后台
            </h1>
            <p className="text-sm text-gray-500">{supplier.name_en}</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              返回首页
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-blue-600">
              {ingredients.length}
            </div>
            <div className="text-sm text-gray-500 mt-1">已录入产品</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-green-600">
              {new Set(ingredients.map((i) => i.category)).size}
            </div>
            <div className="text-sm text-gray-500 mt-1">产品品类</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-purple-600">
              {supplier.brands?.length || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">代理品牌</div>
          </div>
        </div>

        {/* Add Product */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">产品列表</h2>
          <button
            onClick={handleAddProduct}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium"
          >
            + 录入新产品
          </button>
        </div>

        {/* Edit Form */}
        {editing && tags && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              {editing._isNew ? "录入新产品" : `编辑: ${editing.product_name}`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  产品名称 *
                </label>
                <input
                  type="text"
                  value={editing.product_name}
                  onChange={(e) =>
                    setEditing({ ...editing, product_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  通用名 *
                </label>
                <input
                  type="text"
                  value={editing.generic_name}
                  onChange={(e) =>
                    setEditing({ ...editing, generic_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  品类
                </label>
                <select
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">选择品类</option>
                  {tags.dimensions.category.values.map((v: string) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  来源
                </label>
                <select
                  value={editing.source}
                  onChange={(e) =>
                    setEditing({ ...editing, source: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">选择来源</option>
                  {tags.dimensions.source.values.map((v: string) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  功能标签
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-gray-300 rounded-lg">
                  {tags.dimensions.functional_tags.values.map((v: string) => (
                    <label
                      key={v}
                      className={`px-2 py-1 rounded-lg text-xs cursor-pointer transition-colors ${
                        editing.functional_tags?.includes(v)
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : "bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={editing.functional_tags?.includes(v) || false}
                        onChange={(e) => {
                          const tags_list = editing.functional_tags || [];
                          if (e.target.checked) {
                            setEditing({
                              ...editing,
                              functional_tags: [...tags_list, v],
                            });
                          } else {
                            setEditing({
                              ...editing,
                              functional_tags: tags_list.filter(
                                (t: string) => t !== v
                              ),
                            });
                          }
                        }}
                        className="sr-only"
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  应用场景
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-gray-300 rounded-lg">
                  {tags.dimensions.applications.values.map((v: string) => (
                    <label
                      key={v}
                      className={`px-2 py-1 rounded-lg text-xs cursor-pointer transition-colors ${
                        editing.applications?.includes(v)
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={editing.applications?.includes(v) || false}
                        onChange={(e) => {
                          const apps = editing.applications || [];
                          if (e.target.checked) {
                            setEditing({
                              ...editing,
                              applications: [...apps, v],
                            });
                          } else {
                            setEditing({
                              ...editing,
                              applications: apps.filter(
                                (a: string) => a !== v
                              ),
                            });
                          }
                        }}
                        className="sr-only"
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  功能描述
                </label>
                <textarea
                  value={editing.function}
                  onChange={(e) =>
                    setEditing({ ...editing, function: e.target.value })
                  }
                  rows={2}
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

        {/* Products List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">产品名称</th>
                <th className="text-left px-4 py-3 font-medium">通用名</th>
                <th className="text-left px-4 py-3 font-medium">品类</th>
                <th className="text-left px-4 py-3 font-medium">标签</th>
                <th className="text-right px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ingredients.map((i) => (
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
          {ingredients.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">📦</div>
              <p>还没有录入产品</p>
              <button
                onClick={handleAddProduct}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm"
              >
                录入第一个产品
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
