import React from "react";

// ── Spinner ──
export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return <svg className={`animate-spin text-amber-400 ${className}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>;
}

// ── Skeleton ──
export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// ── Badge ──
const badgeColors: Record<string, string> = {
  blue: "bg-orange-500/10 text-amber-300 border-orange-500/15",
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/15",
  red: "bg-red-500/10 text-red-400 border-red-500/15",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/15",
  gray: "bg-white/[0.04] text-slate-500 border-white/[0.06]",
};
export function Badge({ children, variant = "gray", className = "" }: {
  children: React.ReactNode; variant?: string; className?: string;
}) {
  return <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${badgeColors[variant] || badgeColors.gray} ${className}`}>
    {children}
  </span>;
}

// ── Empty State ──
export function EmptyState({ icon, title, description, action }: {
  icon?: string; title: string; description?: string; action?: React.ReactNode;
}) {
  return <div className="text-center py-16 fade-in">
    {icon && <div className="text-5xl mb-4">{icon}</div>}
    <h3 className="text-lg font-medium text-slate-200 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">{description}</p>}
    {action}
  </div>;
}

// ── Modal ──
export function Modal({ open, onClose, title, children, footer }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode;
}) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="fixed inset-0  bg-black/60 backdrop-blur-sm" />
    <div className="relative bg-[#141f2d] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/30 w-full max-w-3xl mx-4 slide-up">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
        <h2 className="text-lg font-bold text-slate-200">{title}</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.04] text-slate-500 hover:text-slate-500">✕</button>
      </div>
      <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">{children}</div>
      {footer && <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.05] bg-white/[0.02]/50 rounded-b-2xl">{footer}</div>}
    </div>
  </div>;
}

// ── Input / Select / Textarea helpers ──
const inputClass = "w-full px-3 py-2.5 border border-white/[0.08] rounded-[12px] text-sm bg-[#131a25] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-colors disabled:bg-white/[0.02] disabled:text-slate-500";
export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClass} ${className}`} {...props} />;
}
export function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${inputClass} cursor-pointer ${className}`} {...props}>{children}</select>;
}
export function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClass} resize-none ${className}`} {...props} />;
}

// ── Button ──
export function Button({ variant = "primary", size = "md", className = "", children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" | "lg" }) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes: Record<string, string> = { sm: "px-3 py-1.5 text-xs", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3 text-base" };
  const styles: Record<string, string> = {
    primary: "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 shadow-[0_0_12px_rgba(240,165,80,0.14)]",
    secondary: "bg-[#131a25] text-slate-300 border border-white/[0.08] hover:bg-white/[0.04]",
    ghost: "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]",
    danger: "bg-red-500/80 text-white hover:bg-red-500",
  };
  return <button className={`${base} ${sizes[size]} ${styles[variant]} ${className}`} {...props}>{children}</button>;
}
