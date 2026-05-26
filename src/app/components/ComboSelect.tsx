"use client";

import { useState } from "react";

const inputClass = "w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-[var(--bg-surface)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors";

export function ComboSelect({ value, onChange, options, placeholder = "选择...", className = "" }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; className?: string;
}) {
  const [custom, setCustom] = useState(false);
  const [customVal, setCustomVal] = useState("");

  if (custom) {
    return (
      <div className="flex gap-1">
        <input
          className={`${inputClass} ${className}`}
          value={customVal}
          onChange={e => setCustomVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && customVal.trim()) { onChange(customVal.trim()); setCustom(false); setCustomVal(""); }
            if (e.key === "Escape") { setCustom(false); setCustomVal(""); }
          }}
          placeholder="输入新选项，回车确认"
          autoFocus
        />
        <button type="button" onClick={() => { setCustom(false); setCustomVal(""); }}
          className="px-2 py-2.5 text-slate-400 hover:text-slate-500 text-sm">✕</button>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={e => {
        if (e.target.value === "__custom__") { setCustom(true); }
        else { onChange(e.target.value); }
      }}
      className={`${inputClass} cursor-pointer ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
      <option value="__custom__" className="text-blue-600 font-medium">➕ 添加新的...</option>
    </select>
  );
}
