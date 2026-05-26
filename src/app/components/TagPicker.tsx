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
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter(
    (o) =>
      o.toLowerCase().includes(filter.toLowerCase()) && !selected.includes(o)
  );

  // 是否有完全匹配的已有选项
  const hasExactMatch = filtered.some(
    (o) => o.toLowerCase() === filter.toLowerCase()
  );
  // 用户输入了内容但不是已有标签 → 可以添加为新标签
  const showAddCustom = filter.trim() && !hasExactMatch && !selected.includes(filter.trim());

  const remove = (tag: string) => {
    onChange(selected.filter((t) => t !== tag));
  };

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
      // 如果输入内容匹配已有选项，选第一个；否则作为新标签添加
      const match = filtered.find((o) => o.toLowerCase() === filter.toLowerCase());
      add(match || filter.trim());
    } else if (e.key === "Backspace" && !filter && selected.length > 0) {
      remove(selected[selected.length - 1]);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {/* Selected tags + input */}
      <div
        className="flex flex-wrap gap-1.5 min-h-[38px] px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-text bg-[var(--bg-surface)] focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400"
      >
        {selected.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(tag);
              }}
              className="text-blue-400 hover:text-blue-600 text-sm leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length > 0 ? "继续输入添加..." : placeholder}
          className="flex-1 min-w-[80px] outline-none text-sm bg-transparent"
        />
      </div>

      {/* 底部提示 */}
      <p className="text-[11px] text-slate-400 mt-1">
        💡 输入内容后按 <kbd className="px-1 py-0.5 bg-white/[0.06] rounded text-[10px] font-mono">Enter</kbd> 即可添加
        {filter.trim() && !hasExactMatch && (
          <span className="text-blue-500 ml-1">— 将作为新标签添加</span>
        )}
      </p>

      {/* Dropdown */}
      {open && filter.trim() && (filtered.length > 0 || showAddCustom) && (
        <div className="absolute z-50 mt-1 w-full bg-[var(--bg-surface)] border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {/* 已有匹配项 */}
          {filtered.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[11px] font-medium text-slate-400 uppercase bg-white/[0.03]/50">
                匹配标签 ({filtered.length})
              </div>
              {filtered.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => add(tag)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
                >
                  <span className="text-slate-300 text-xs">⌘</span>
                  <span>{tag}</span>
                </button>
              ))}
            </>
          )}

          {/* 添加为新标签 */}
          {showAddCustom && (
            <div className={filtered.length > 0 ? "border-t border-gray-100" : ""}>
              <div className="px-3 py-1.5 text-[11px] font-medium text-blue-500 uppercase bg-blue-50/30">
                新增标签
              </div>
              <button
                type="button"
                onClick={() => add(filter.trim())}
                className="w-full text-left px-3 py-2.5 text-sm text-blue-600 bg-blue-50/30 hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <span className="text-blue-400 text-base">＋</span>
                <span>添加 「<strong>{filter.trim()}</strong>」作为新标签</span>
              </button>
            </div>
          )}

          {/* 空输入的提示 */}
          {filtered.length === 0 && !showAddCustom && (
            <div className="px-3 py-4 text-center text-sm text-slate-400">
              没有匹配的标签，输入新名称后按回车添加
            </div>
          )}
        </div>
      )}
    </div>
  );
}
