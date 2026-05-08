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
  placeholder = "选择标签...",
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

  const remove = (tag: string) => {
    onChange(selected.filter((t) => t !== tag));
  };

  const add = (tag: string) => {
    if (!selected.includes(tag)) {
      onChange([...selected, tag]);
      setFilter("");
    }
  };

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {/* Selected tags */}
      <div
        className="flex flex-wrap gap-1.5 min-h-[38px] px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer bg-white"
        onClick={() => setOpen(!open)}
      >
        {selected.length === 0 && !filter && (
          <span className="text-gray-400">{placeholder}</span>
        )}
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
              className="text-blue-400 hover:text-blue-600"
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
          placeholder={selected.length > 0 ? "" : placeholder}
          className="flex-1 min-w-[80px] outline-none text-sm bg-transparent"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => add(tag)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
