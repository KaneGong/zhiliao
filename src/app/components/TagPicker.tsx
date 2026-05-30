"use client";

import { useState, useRef, useEffect } from "react";

interface TagPickerProps {
  label: string;
  selected: string[];
  options: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagPicker({
  label,
  selected,
  options,
  onChange,
  placeholder = "搜索或输入新标签，按回车添加...",
}: TagPickerProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter((o) => o.toLowerCase().includes(filter.toLowerCase()) && !selected.includes(o));
  const hasExactMatch = filtered.some((o) => o.toLowerCase() === filter.toLowerCase());
  const showAddCustom = filter.trim() && !hasExactMatch && !selected.includes(filter.trim());

  const remove = (tag: string) => onChange(selected.filter((t) => t !== tag));
  const add = (tag: string) => {
    if (!selected.includes(tag) && tag.trim()) {
      onChange([...selected, tag.trim()]);
      setFilter("");
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && filter.trim()) {
      e.preventDefault();
      const match = filtered.find((o) => o.toLowerCase() === filter.toLowerCase());
      add(match || filter.trim());
    } else if (e.key === "Backspace" && !filter && selected.length > 0) {
      remove(selected[selected.length - 1]);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-extrabold tracking-[0.08em] uppercase text-[#b8ad9a] mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 min-h-[42px] px-3 py-2 border border-white/[0.08] rounded-[12px] text-sm cursor-text bg-[#131a25] focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500/30 transition-colors">
        {selected.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-300 border border-amber-500/15 px-2 py-0.5 rounded-md text-xs font-medium">
            {tag}
            <button type="button" onClick={(e) => { e.stopPropagation(); remove(tag); }} className="text-amber-400/70 hover:text-amber-200 text-sm leading-none">
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length > 0 ? "继续输入添加..." : placeholder}
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent text-slate-200 placeholder:text-slate-500"
        />
      </div>

      <p className="text-[11px] text-slate-500 mt-1.5">
        输入内容后按 <kbd className="px-1 py-0.5 bg-white/[0.06] rounded text-[10px] font-mono text-amber-300">Enter</kbd> 即可添加
        {filter.trim() && !hasExactMatch && <span className="text-amber-400 ml-1">— 将作为新标签添加</span>}
      </p>

      {open && filter.trim() && (filtered.length > 0 || showAddCustom) && (
        <div className="absolute z-50 mt-1 w-full bg-[#141f2d]/95 border border-white/[0.08] rounded-[12px] shadow-2xl shadow-black/30 backdrop-blur-xl max-h-52 overflow-y-auto">
          {filtered.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase bg-white/[0.03]">
                匹配标签 ({filtered.length})
              </div>
              {filtered.map((tag) => (
                <button key={tag} type="button" onClick={() => add(tag)} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-amber-500/10 hover:text-amber-200 transition-colors flex items-center gap-2">
                  <span className="text-amber-400 text-xs">⌘</span>
                  <span>{tag}</span>
                </button>
              ))}
            </>
          )}

          {showAddCustom && (
            <div className={filtered.length > 0 ? "border-t border-white/[0.06]" : ""}>
              <div className="px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] text-amber-400 uppercase bg-amber-500/5">
                新增标签
              </div>
              <button type="button" onClick={() => add(filter.trim())} className="w-full text-left px-3 py-2.5 text-sm text-amber-300 bg-amber-500/5 hover:bg-amber-500/10 transition-colors flex items-center gap-2">
                <span className="text-amber-400 text-base">＋</span>
                <span>添加 「<strong>{filter.trim()}</strong>」作为新标签</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
