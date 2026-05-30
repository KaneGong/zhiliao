"use client";

import { useState } from "react";

const inputClass = "w-full px-3 py-2.5 border border-white/[0.08] rounded-[12px] text-sm bg-[#131a25] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-colors";

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
          className="px-2 py-2.5 text-slate-500 hover:text-amber-300 text-sm transition-colors">✕</button>
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
      <option value="__custom__">＋ 添加新的...</option>
    </select>
  );
}
