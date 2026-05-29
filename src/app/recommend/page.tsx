"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Sparkles, Dumbbell, Moon, Baby, Stethoscope, Send, Square, ChevronDown, Copy, Check, Plus } from "lucide-react";
import TrustBar from "../components/TrustBar";
import { validateContent, fromServerVerification, type TrustResult, type ServerVerification } from "@/lib/trust";
import type { FormulaBrief } from "@/lib/formula-brief";
import FormulaBriefView from "./components/FormulaBriefView";

interface Message { role: "user" | "assistant"; content: string; trustResult?: TrustResult; serverVerify?: ServerVerification; formulaBrief?: FormulaBrief; briefError?: string; }

const examples = [
  { text: "做一款针对办公人群的减重代餐奶昔", Icon: Dumbbell },
  { text: "开发一款助眠功能软糖，需要安全的原料", Icon: Moon },
  { text: "寻找适合婴幼儿配方的免疫调节原料", Icon: Baby },
  { text: "需要一款能促进骨骼健康的乳制品原料", Icon: Stethoscope },
];

function PageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [input, setInput] = useState(initialQuery);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [saved, setSaved] = useState(false);
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
    setSaved(false);
    setLoading(true);
    setStreaming(false);
    autoScrollRef.current = true;

    const controller = new AbortController();
    abortRef.current = controller;

    let serverVerifyData: ServerVerification | undefined;
    try {
      const history = newMsgs.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai-recommend", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, history }), signal: controller.signal,
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "服务暂不可用"); }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("浏览器不支持流式读取");

      const decoder = new TextDecoder();
      let assistantContent = "";
      let formulaBriefData: FormulaBrief | undefined;
      let briefError: string | undefined;
      let sseBuffer = "";
      setMessages([...newMsgs, { role: "assistant" as const, content: "" }]);
      setStreaming(true);

      const handleSseData = (data: string) => {
        if (!data || data === "[DONE]") return;
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            assistantContent = `❌ ${parsed.error}`;
            setMessages([...newMsgs, { role: "assistant", content: assistantContent }]);
          } else if (parsed.replace_content !== undefined) {
            assistantContent = parsed.replace_content || "";
            setMessages([...newMsgs, { role: "assistant", content: assistantContent, formulaBrief: formulaBriefData, briefError }]);
          } else if (parsed.verification) {
            serverVerifyData = parsed.verification;
          } else if (parsed.formula_brief) {
            formulaBriefData = parsed.formula_brief;
            setMessages([...newMsgs, { role: "assistant", content: assistantContent, formulaBrief: formulaBriefData, briefError }]);
          } else if (parsed.formula_brief_error) {
            briefError = parsed.formula_brief_error;
          } else if (!parsed.done && parsed.content) {
            assistantContent += parsed.content;
            setMessages([...newMsgs, { role: "assistant", content: assistantContent, formulaBrief: formulaBriefData, briefError }]);
          }
        } catch {}
      };

      const drainSseBuffer = () => {
        const events = sseBuffer.split("\n\n");
        sseBuffer = events.pop() || "";
        for (const event of events) {
          const dataLines = event.split("\n").filter((line) => line.startsWith("data: "));
          if (dataLines.length === 0) continue;
          handleSseData(dataLines.map((line) => line.slice(6)).join("\n").trim());
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        sseBuffer += decoder.decode(value, { stream: true });
        drainSseBuffer();
      }
      if (sseBuffer.trim()) {
        for (const line of sseBuffer.split("\n")) {
          if (line.startsWith("data: ")) handleSseData(line.slice(6).trim());
        }
      }
      const finalContent = assistantContent || "（AI 未返回内容）";
      const trustResult = serverVerifyData ? fromServerVerification(serverVerifyData) : validateContent(finalContent);
      setMessages([...newMsgs, { role: "assistant" as const, content: finalContent, trustResult, serverVerify: serverVerifyData, formulaBrief: formulaBriefData, briefError }]);
    } catch (e: any) {
      if (e.name !== "AbortError") setMessages([...newMsgs, { role: "assistant", content: `❌ ${e.message}` }]);
    } finally { setLoading(false); setStreaming(false); abortRef.current = null; }
  };

  const saveRecipe = async () => {
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    const lastAI = [...messages].reverse().find(m => m.role === "assistant");
    if (!lastUser || !lastAI) return;
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: lastUser.content,
          recommendation: lastAI.content,
          formula_brief: lastAI.formulaBrief,
          trust_score: lastAI.formulaBrief?.trust_score,
        }),
      });
      if (res.ok) setSaved(true);
    } catch {}
  };

  const newChat = () => { stopGeneration(); setMessages([]); setSaved(false); setInput(""); };

  const msgCount = messages.length;

  // AI Avatar icon component
  const AiAvatar = () => (
    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(240,165,80,0.15)]">
      <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2} />
    </div>
  );

  return (
    <div className="zl-workbench-page">
      <div className="zl-workbench-shell">
        <aside className="zl-workbench-rail">
          <div className="zl-rail-card">
            <p className="zl-kicker">FORMULA BENCH</p>
            <p>把产品需求、法规路径、原料建议和追问修订放在同一个研发工作台里，适合边生成边判断。</p>
          </div>
          <div className="zl-rail-card">
            <p className="zl-kicker">QUICK CASES</p>
            <p>助眠软糖、运动蛋白粉、儿童益生菌、骨骼健康乳制品，都可以作为首轮需求输入。</p>
          </div>
          <div className="zl-rail-health">
            <div><span>对话模式</span><b>多轮</b></div>
            <div><span>证据提示</span><b>开启</b></div>
            <div><span>保存方案</span><b>可用</b></div>
          </div>
        </aside>

        <main className="zl-workbench-main">
          <div className="zl-workbench-title">
            <div>
              <p className="zl-kicker">AI FORMULA ADVISOR</p>
              <h1>AI 配方工作台</h1>
              <p>输入产品需求，AI 将围绕原料、法规、证据和供应商线索生成可追问的研发方案。</p>
            </div>
            <Link href="/recipes" className="zl-title-pill">配方库 →</Link>
          </div>

          <div className="zl-chat-frame">
            <div className="zl-chat-topbar">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-[0_0_12px_rgba(240,165,80,0.15)]">
                  <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-300">AI 配方顾问</div>
                  <div className="text-[11px] text-slate-500">多轮对话 · 追问调整</div>
                </div>
              </div>
              {msgCount > 0 && (
                <button onClick={newChat} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.04]">
                  <Plus className="w-3 h-3" strokeWidth={2} /> 新对话
                </button>
              )}
            </div>

            <div ref={chatRef} onScroll={checkScroll} className="zl-chat-body relative">
              {msgCount === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-full text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center mb-6 border border-amber-500/10">
                    <Sparkles className="w-8 h-8 text-amber-400" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-base font-semibold text-slate-300 mb-1.5">描述你的产品需求</h2>
                  <p className="text-sm text-slate-500 mb-8 max-w-sm">基于真实原料与法规数据，AI 为你设计完整配方方案</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                    {examples.map(ex => (
                      <button key={ex.text} onClick={() => doSearch(ex.text)}
                        className="flex items-start gap-3 text-left p-3.5 rounded-xl border border-white/[0.06] hover:border-amber-500/20 hover:bg-amber-500/[0.03] transition-all text-sm bg-white/[0.02]">
                        <ex.Icon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span className="text-slate-400">{ex.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {messages.map((m, i) => {
                    const isLast = i === messages.length - 1;
                    const isStreaming = isLast && streaming && m.role === "assistant";
                    return (
                      <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                        {m.role === "assistant" && <AiAvatar />}
                        <div className={`max-w-[85%] group relative ${m.role === "user" ? "" : "min-w-0"}`}>
                          <div className={m.role === "user" ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl rounded-tr-md px-4 py-2.5 shadow-[0_2px_8px_rgba(240,165,80,0.12)]" : "rounded-2xl rounded-tl-md px-4 py-3 border border-white/[0.06] bg-white/[0.02]"}>
                            {m.role === "user" ? <p className="text-sm leading-relaxed">{m.content}</p> : (
                              <div className={`zhiliao-answer text-sm ${isStreaming ? "streaming-cursor" : ""}`}>
                                <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={{
                                  table: ({children}) => <div className="overflow-x-auto my-3 rounded-lg border border-white/[0.06]"><table className="w-full text-sm border-collapse">{children}</table></div>,
                                  thead: ({children}) => <thead className="bg-white/[0.03]">{children}</thead>,
                                  th: ({children}) => <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-white/[0.06] text-xs">{children}</th>,
                                  td: ({children}) => <td className="px-3 py-2 border-b border-white/[0.04] text-slate-400">{children}</td>,
                                  h2: ({children}) => <h2 className="text-base font-bold text-slate-300 mt-5 mb-2">{children}</h2>,
                                  h3: ({children}) => <h3 className="text-sm font-semibold text-slate-400 mt-4 mb-1">{children}</h3>,
                                  strong: ({children}) => <strong className="font-semibold text-slate-300">{children}</strong>,
                                  p: ({children}) => <p className="mb-2">{children}</p>,
                                  ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                  li: ({children}) => <li className="text-slate-400">{children}</li>,
                                  hr: () => <hr className="my-3 border-white/[0.06]" />,
                                }}>{m.content}</Markdown>
                                {m.formulaBrief && <FormulaBriefView brief={m.formulaBrief} />}
                                {!m.formulaBrief && m.briefError && <div className="mt-3 rounded-xl border border-amber-400/10 bg-amber-400/[0.04] px-3 py-2 text-xs text-amber-200">{m.briefError}</div>}
                              </div>
                            )}
                          </div>
                          {m.role === "assistant" && m.content && !isStreaming && m.trustResult && <div className="mt-2"><TrustBar result={m.trustResult} serverVerify={m.serverVerify} /></div>}
                          {m.role === "assistant" && m.content && !isStreaming && (
                            <button onClick={() => copyMessage(m.content, i)} className="absolute -bottom-1 right-0 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-slate-500 hover:text-amber-400 px-2 py-0.5 rounded">
                              {copiedIdx === i ? <><Check className="w-3 h-3" strokeWidth={2} /> 已复制</> : <><Copy className="w-3 h-3" strokeWidth={1.5} /> 复制</>}
                            </button>
                          )}
                        </div>
                        {m.role === "user" && <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center shrink-0 mt-1"><span className="text-[11px] font-bold text-slate-300">你</span></div>}
                      </div>
                    );
                  })}
                  {loading && !streaming && <div className="flex gap-3"><AiAvatar /><div className="rounded-2xl rounded-tl-md px-5 py-3 border border-white/[0.06] bg-white/[0.02]"><div className="typing-dots"><span /><span /><span /></div></div></div>}
                </div>
              )}
              {showScrollBtn && <button onClick={scrollToBottom} className="absolute bottom-3 right-3 w-8 h-8 rounded-full glass-strong flex items-center justify-center text-slate-400 hover:text-amber-400 transition-all z-10 shadow-lg"><ChevronDown className="w-4 h-4" strokeWidth={2} /></button>}
            </div>

            {msgCount > 0 && <div className="zl-chat-actions flex items-center gap-3"><button onClick={saveRecipe} disabled={saved || loading} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${saved ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-white/[0.06] text-slate-500 hover:text-slate-300 hover:border-white/[0.1]"}`}>{saved ? "✓ 已保存" : "保存方案"}</button><span className="text-[10px] text-slate-500 ml-auto">AI 生成 · 仅供参考</span></div>}

            <div className="zl-chat-input-zone">
              <div className="glass-strong rounded-2xl p-[1px] focus-within:shadow-[0_0_20px_rgba(240,165,80,0.06)] transition-shadow">
                <div className="bg-[#131a25] rounded-2xl p-2.5 flex gap-2 items-end">
                  <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={1} placeholder={msgCount > 0 ? "追问或调整方案…" : "描述产品需求，例如：开发一款助眠功能软糖…"} className="flex-1 bg-transparent text-slate-300 placeholder:text-slate-500 text-sm py-2 px-1 focus:outline-none resize-none max-h-[160px]" />
                  <div className="flex items-center gap-1.5 shrink-0">
                    {loading && <button onClick={stopGeneration} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/15"><Square className="w-3 h-3" strokeWidth={2} /> 停止</button>}
                    <button type="button" onClick={() => doSearch(input)} disabled={loading || !input.trim()} className="p-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-400 hover:to-orange-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_12px_rgba(240,165,80,0.1)]"><Send className="w-4 h-4" strokeWidth={2} /></button>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 text-center mt-2">Enter 发送 · Shift+Enter 换行</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function RecommendPage() {
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
