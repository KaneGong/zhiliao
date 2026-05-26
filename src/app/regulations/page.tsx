"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  ScrollText, Shield, AlertTriangle, HelpCircle, CheckCircle, XCircle,
  Send, Square, ChevronDown, Copy, Check, Plus, Search
} from "lucide-react";

interface DbCheck {
  ingredient: string;
  ingredient_en?: string;
  category?: string;
  standard: string;
  status: string;
  detail: string;
  source: string;
  data_confidence?: string;
  special_notes?: string[];
}

type MessageRole = "user" | "db_results" | "assistant";
interface Message { 
  role: MessageRole; 
  content: string;
  dbChecks?: DbCheck[];
}

const hotQueries = ["乳铁蛋白", "DHA", "益生菌", "胶原蛋白", "褪黑素", "辅酶Q10"];

const statusConfig: Record<string, { color: string; label: string; Icon: any }> = {
  compliant: { color: "green", label: "合规", Icon: CheckCircle },
  restricted: { color: "red", label: "受限", Icon: XCircle },
  prohibited: { color: "red", label: "禁止", Icon: XCircle },
  caution: { color: "amber", label: "需关注", Icon: AlertTriangle },
  not_found: { color: "gray", label: "未收录", Icon: HelpCircle },
};

const markdownComponents = {
  table: ({children}: any) => (
    <div className="overflow-x-auto my-3 rounded-lg border border-white/[0.06]">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({children}: any) => <thead className="bg-white/[0.03]">{children}</thead>,
  th: ({children}: any) => <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-white/[0.06] text-xs">{children}</th>,
  td: ({children}: any) => <td className="px-3 py-2 border-b border-white/[0.04] text-slate-400">{children}</td>,
  h2: ({children}: any) => <h2 className="text-base font-bold text-slate-300 mt-5 mb-2">{children}</h2>,
  h3: ({children}: any) => <h3 className="text-sm font-semibold text-slate-400 mt-4 mb-1">{children}</h3>,
  strong: ({children}: any) => <strong className="font-semibold text-slate-300">{children}</strong>,
  p: ({children}: any) => <p className="mb-2">{children}</p>,
  ul: ({children}: any) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
  li: ({children}: any) => <li className="text-slate-400">{children}</li>,
  hr: () => <hr className="my-3 border-white/[0.06]" />,
};

function PageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [input, setInput] = useState(initialQuery);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoScrollRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  const checkScroll = useCallback(() => {
    const el = chatRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    autoScrollRef.current = atBottom;
    setShowScrollBtn(!atBottom);
  }, []);

  useEffect(() => {
    if (autoScrollRef.current && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => { if (initialQuery.trim()) doSearch(initialQuery); }, []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 160) + "px"; }
  }, [input]);

  const scrollToBottom = () => {
    autoScrollRef.current = true;
    setShowScrollBtn(false);
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setStreaming(false);
  };

  const copyMessage = async (content: string, idx: number) => {
    try { await navigator.clipboard.writeText(content); setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 2000); } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSearch(input); }
  };

  const doSearch = async (q: string) => {
    if (!q.trim() || loading) return;
    setInput("");
    const newMsgs: Message[] = [...messages, { role: "user", content: q }];
    setMessages(newMsgs);
    setLoading(true);
    setStreaming(false);
    autoScrollRef.current = true;

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/regulations?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "查询失败"); }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("浏览器不支持流式读取");

      const decoder = new TextDecoder();
      let dbChecks: DbCheck[] = [];
      let assistantContent = "";
      let hasDb = false;
      let aiStarted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        for (const line of text.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "db_results") {
              dbChecks = parsed.checks || [];
              hasDb = true;
              setMessages([...newMsgs, { role: "db_results", content: "", dbChecks }]);
            } else if (parsed.type === "ai_chunk" && parsed.content) {
              if (!aiStarted) { aiStarted = true; setStreaming(true); }
              assistantContent += parsed.content;
              const dbMsg: Message = { role: "db_results", content: "", dbChecks };
              const aiMsg: Message = { role: "assistant", content: assistantContent };
              setMessages(hasDb ? [...newMsgs, dbMsg, aiMsg] : [...newMsgs, aiMsg]);
            } else if (parsed.type === "ai_done") {
              setStreaming(false);
            }
          } catch {}
        }
      }
      // Finalize
      const finalMsgs: Message[] = [...newMsgs];
      if (hasDb && dbChecks.length > 0) {
        finalMsgs.push({ role: "db_results", content: "", dbChecks });
      }
      if (assistantContent) {
        finalMsgs.push({ role: "assistant", content: assistantContent });
      } else if (hasDb) {
        finalMsgs.push({ role: "assistant", content: "（AI 未返回分析内容）" });
      }
      setMessages(finalMsgs);
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setMessages([...newMsgs, { role: "assistant", content: `❌ ${e.message}` }]);
      }
    } finally { 
      setLoading(false); 
      setStreaming(false); 
      abortRef.current = null; 
    }
  };

  const newChat = () => { stopGeneration(); setMessages([]); setInput(""); };

  const msgCount = messages.length;

  const AiAvatar = () => (
    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(240,165,80,0.15)]">
      <Shield className="w-3.5 h-3.5 text-white" strokeWidth={2} />
    </div>
  );

  const badgeColors: Record<string, string> = {
    blue: "bg-orange-500/10 text-amber-300 border-orange-500/15",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/15",
    red: "bg-red-500/10 text-red-400 border-red-500/15",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/15",
    gray: "bg-white/[0.04] text-slate-500 border-white/[0.06]",
  };
  const Bdg = ({ children, variant = "gray" }: { children: React.ReactNode; variant?: string }) => (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${badgeColors[variant] || badgeColors.gray}`}>
      {children}
    </span>
  );

  const DbResultsCard = ({ checks }: { checks: DbCheck[] }) => (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 mb-2">
        <Search className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
        <span className="text-xs font-semibold text-amber-400">数据库匹配 · {checks.length} 条</span>
      </div>
      {checks.map((r, i) => {
        const cfg = statusConfig[r.status] || statusConfig.not_found;
        return (
          <div key={i} className="bg-white/[0.03] rounded-lg p-3.5 border border-white/[0.04]">
            <div className="flex items-start gap-2.5">
              <cfg.Icon className={`w-4 h-4 shrink-0 mt-0.5 ${r.status === "compliant" ? "text-emerald-400" : r.status === "caution" ? "text-amber-400" : "text-red-400"}`} strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="font-semibold text-slate-300 text-sm">{r.ingredient}</span>
                  <Bdg variant={cfg.color}>{cfg.label}</Bdg>
                  {r.category && <Bdg variant="blue">{r.category}</Bdg>}
                  {r.data_confidence === "verified" && <Bdg variant="green">已验证</Bdg>}
                </div>
                <div className="inline-block bg-white/[0.04] rounded px-2 py-1 mb-1.5 text-[11px] font-medium text-amber-400">{r.standard}</div>
                <p className="text-[13px] text-slate-400 leading-relaxed">{r.detail}</p>
                <p className="text-[11px] text-slate-500 mt-1.5">来源：{r.source}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 fade-in flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-[0_0_12px_rgba(240,165,80,0.15)]">
            <ScrollText className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-300">法规速查</h1>
            <p className="text-[11px] text-slate-500">多轮查询 · AI 法规解读</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {msgCount > 0 && (
            <button onClick={newChat} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.04]">
              <Plus className="w-3 h-3" strokeWidth={2} /> 新对话
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div ref={chatRef} onScroll={checkScroll}
        className="flex-1 min-h-0 mb-3 overflow-y-auto rounded-2xl glass-card p-4 sm:p-6 relative">

        {msgCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center mb-6 border border-amber-500/10">
              <ScrollText className="w-8 h-8 text-amber-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-base font-semibold text-slate-300 mb-1.5">查询原料法规合规状态</h2>
            <p className="text-sm text-slate-500 mb-8 max-w-sm">
              基于 70+ 法规标准数据库，AI 为你深度解读原料合规路径
            </p>
            
            {/* Hot queries */}
            <div className="flex flex-wrap justify-center gap-1.5 mb-8 max-w-lg">
              {hotQueries.map(pq => (
                <button key={pq} onClick={() => doSearch(pq)}
                  className="text-xs text-amber-400 bg-amber-500/8 hover:bg-amber-500/12 px-3 py-1.5 rounded-lg transition-colors border border-amber-500/5">
                  {pq}
                </button>
              ))}
            </div>

            {/* Reference Standards */}
            <div className="w-full max-w-lg">
              <h3 className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-2 justify-center">
                <ScrollText className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} /> 参考法规标准
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {code:"GB 2760-2024",name:"食品添加剂使用标准",desc:"规定添加剂使用范围和限量"},
                  {code:"GB 14880-2012",name:"食品营养强化剂使用标准",desc:"规定营养强化剂品种和使用量"},
                  {code:"保健食品原料目录",name:"2023年版",desc:"含10种功能性原料"},
                  {code:"新食品原料公告",name:"卫健委批准",desc:"历年新食品原料批准公告"}
                ].map(s => (
                  <div key={s.code} className="bg-white/[0.02] rounded-lg p-3 text-left border border-white/[0.03]">
                    <div className="font-medium text-slate-400 text-xs">{s.code}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{s.name}</div>
                    <p className="text-[11px] text-slate-500 mt-1">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((m, i) => {
              const isLast = i === messages.length - 1;
              const isStreaming = isLast && streaming && m.role === "assistant";
              
              // DB results message
              if (m.role === "db_results" && m.dbChecks) {
                return (
                  <div key={i} className="flex gap-3">
                    <AiAvatar />
                    <div className="max-w-[85%] min-w-0">
                      <div className="rounded-2xl rounded-tl-md px-4 py-3 border border-white/[0.06] bg-white/[0.02]">
                        <DbResultsCard checks={m.dbChecks} />
                      </div>
                    </div>
                  </div>
                );
              }
              
              // User or assistant message
              return (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "assistant" && <AiAvatar />}
                  <div className={`max-w-[85%] group relative ${m.role === "user" ? "" : "min-w-0"}`}>
                    <div className={
                      m.role === "user"
                        ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl rounded-tr-md px-4 py-2.5 shadow-[0_2px_8px_rgba(240,165,80,0.12)]"
                        : "rounded-2xl rounded-tl-md px-4 py-3 border border-white/[0.06] bg-white/[0.02]"
                    }>
                      {m.role === "user" ? (
                        <p className="text-sm leading-relaxed">{m.content}</p>
                      ) : (
                        <div className={`zhiliao-answer text-sm ${isStreaming ? "streaming-cursor" : ""}`}>
                          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {m.content}
                          </Markdown>
                        </div>
                      )}
                    </div>
                    {/* Copy button */}
                    {m.role === "assistant" && m.content && !isStreaming && (
                      <button onClick={() => copyMessage(m.content, i)}
                        className="absolute -bottom-1 right-0 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-slate-500 hover:text-amber-400 px-2 py-0.5 rounded">
                        {copiedIdx === i ? <><Check className="w-3 h-3" strokeWidth={2} /> 已复制</> : <><Copy className="w-3 h-3" strokeWidth={1.5} /> 复制</>}
                      </button>
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-[11px] font-bold text-slate-300">你</span>
                    </div>
                  )}
                </div>
              );
            })}
            {/* Typing indicator */}
            {loading && !streaming && (
              <div className="flex gap-3">
                <AiAvatar />
                <div className="rounded-2xl rounded-tl-md px-5 py-3 border border-white/[0.06] bg-white/[0.02]">
                  <div className="typing-dots"><span /><span /><span /></div>
                </div>
              </div>
            )}
          </div>
        )}

        {showScrollBtn && (
          <button onClick={scrollToBottom}
            className="absolute bottom-3 right-3 w-8 h-8 rounded-full glass-strong flex items-center justify-center text-slate-400 hover:text-amber-400 transition-all z-10 shadow-lg">
            <ChevronDown className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Disclaimer */}
      {msgCount > 0 && (
        <div className="flex items-center gap-2 mb-2 shrink-0">
          <span className="text-[10px] text-slate-500">⚠️ 法规信息仅供参考，不构成法律建议</span>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0">
        <div className="glass-strong rounded-2xl p-[1px] focus-within:shadow-[0_0_20px_rgba(240,165,80,0.06)] transition-shadow">
          <div className="bg-[#131a25] rounded-2xl p-2.5 flex gap-2 items-end">
            <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown} rows={1}
              placeholder={msgCount > 0 ? "继续查询其他原料… (Enter 发送, Shift+Enter 换行)" : "输入原料名称，如：乳铁蛋白、DHA、β-葡聚糖…"}
              className="flex-1 bg-transparent text-slate-300 placeholder:text-slate-500 text-sm py-2 px-1 focus:outline-none resize-none max-h-[160px]" />
            <div className="flex items-center gap-1.5 shrink-0">
              {loading && (
                <button onClick={stopGeneration}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/15">
                  <Square className="w-3 h-3" strokeWidth={2} /> 停止
                </button>
              )}
              <button type="button" onClick={() => doSearch(input)} disabled={loading || !input.trim()}
                className="p-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-400 hover:to-orange-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_12px_rgba(240,165,80,0.1)]">
                <Send className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 text-center mt-2">Enter 发送 · Shift+Enter 换行</p>
      </div>
    </div>
  );
}

export default function RegulationsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="typing-dots"><span /><span /><span /></div>
      </div>
    }>
      <PageContent />
    </Suspense>
  );
}
