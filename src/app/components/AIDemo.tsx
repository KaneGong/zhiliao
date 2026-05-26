"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

interface DemoLine {
  text: string;
  delay: number;
  color: string;
}

interface Scenario {
  input: string;
  lines: DemoLine[];
}

const scenarios: Scenario[] = [
  {
    input: "开发一款助眠功能软糖…",
    lines: [
      { text: "● 配方方案分析完成", delay: 400, color: "text-amber-400" },
      { text: "", delay: 200, color: "" },
      { text: "▸ 核心原料推荐", delay: 300, color: "text-slate-300" },
      { text: "  • 褪黑素 — 改善入睡时间，GB 2760 批准", delay: 200, color: "text-slate-400" },
      { text: "  • GABA — 缓解焦虑，新食品原料目录收录", delay: 200, color: "text-slate-400" },
      { text: "  • 酸枣仁提取物 — 传统药食同源原料", delay: 200, color: "text-slate-400" },
      { text: "", delay: 200, color: "" },
      { text: "▸ 合规要点", delay: 300, color: "text-slate-300" },
      { text: "  • 褪黑素在中国可作为保健食品原料使用", delay: 200, color: "text-slate-400" },
      { text: "  • 建议添加量 0.5-3mg / 日", delay: 200, color: "text-slate-400" },
      { text: "  • 标签不得声称疾病治疗功效", delay: 200, color: "text-slate-400" },
      { text: "", delay: 200, color: "" },
      { text: "▸ 推荐剂型", delay: 300, color: "text-slate-300" },
      { text: "  • 软糖 (2.5g/粒) — 适合助眠场景", delay: 200, color: "text-slate-400" },
      { text: "  • 需关注糖含量与功能声称的合规匹配", delay: 200, color: "text-slate-400" },
    ],
  },
  {
    input: "开发一款运动后恢复蛋白粉…",
    lines: [
      { text: "● 配方方案分析完成", delay: 400, color: "text-amber-400" },
      { text: "", delay: 200, color: "" },
      { text: "▸ 核心原料推荐", delay: 300, color: "text-slate-300" },
      { text: "  • 乳清蛋白 — 快速吸收，GB 24154 运动营养标准", delay: 200, color: "text-slate-400" },
      { text: "  • 支链氨基酸 BCAA — 减少肌肉分解", delay: 200, color: "text-slate-400" },
      { text: "  • 谷氨酰胺 — 促进恢复，GB 14880 营养强化剂", delay: 200, color: "text-slate-400" },
      { text: "", delay: 200, color: "" },
      { text: "▸ 合规要点", delay: 300, color: "text-slate-300" },
      { text: "  • 蛋白质含量需 ≥ 25g / 100g", delay: 200, color: "text-slate-400" },
      { text: "  • 运动营养食品分类：速度力量类", delay: 200, color: "text-slate-400" },
      { text: "  • 需标注「不适宜婴幼儿」", delay: 200, color: "text-slate-400" },
      { text: "", delay: 200, color: "" },
      { text: "▸ 推荐风味", delay: 300, color: "text-slate-300" },
      { text: "  • 可可味 / 香草味 — 消费者接受度最高", delay: 200, color: "text-slate-400" },
    ],
  },
  {
    input: "开发一款儿童益生菌固体饮料…",
    lines: [
      { text: "● 配方方案分析完成", delay: 400, color: "text-amber-400" },
      { text: "", delay: 200, color: "" },
      { text: "▸ 核心原料推荐", delay: 300, color: "text-slate-300" },
      { text: "  • 乳双歧杆菌 HN019 — 可食用菌种目录收录", delay: 200, color: "text-slate-400" },
      { text: "  • 鼠李糖乳杆菌 GG — 儿童临床验证充分", delay: 200, color: "text-slate-400" },
      { text: "  • 低聚果糖 FOS — 益生元协同增效", delay: 200, color: "text-slate-400" },
      { text: "", delay: 200, color: "" },
      { text: "▸ 合规要点", delay: 300, color: "text-slate-300" },
      { text: "  • 活菌数 ≥ 10⁸ CFU / 袋", delay: 200, color: "text-slate-400" },
      { text: "  • 适用于 3 岁以上儿童", delay: 200, color: "text-slate-400" },
      { text: "  • 标签不得暗示替代母乳", delay: 200, color: "text-slate-400" },
      { text: "", delay: 200, color: "" },
      { text: "▸ 推荐剂型", delay: 300, color: "text-slate-300" },
      { text: "  • 条包固体饮料 (2g/条) — 便携易冲调", delay: 200, color: "text-slate-400" },
      { text: "  • 建议搭配卡通 IP 包装提升吸引力", delay: 200, color: "text-slate-400" },
    ],
  },
];

const SCENARIO_PAUSE = 3000;

export default function AIDemo() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [inputDone, setInputDone] = useState(false);
  const [started, setStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausingRef = useRef(false);

  const scenario = scenarios[scenarioIndex];

  // Reset all state and advance to next scenario
  const advanceScenario = () => {
    isPausingRef.current = false;
    setVisibleLines(0);
    setUserInput("");
    setInputDone(false);
    setStarted(false);
    setScenarioIndex(prev => (prev + 1) % scenarios.length);
  };

  // Start animation on mount / scene change
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 400);
    return () => clearTimeout(t);
  }, [scenarioIndex]);

  // Type user input
  useEffect(() => {
    if (!started || inputDone) return;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setUserInput(scenario.input.slice(0, i));
      if (i >= scenario.input.length) {
        clearInterval(timer);
        setTimeout(() => setInputDone(true), 400);
      }
    }, 80);
    return () => clearInterval(timer);
  }, [started, inputDone, scenario.input]);

  // Type AI response lines
  useEffect(() => {
    if (!inputDone) return;
    if (isPausingRef.current) return;
    if (visibleLines >= scenario.lines.length) {
      isPausingRef.current = true;
      pauseTimerRef.current = setTimeout(() => {
        pauseTimerRef.current = null;
        advanceScenario();
      }, SCENARIO_PAUSE);
      return;
    }

    const line = scenario.lines[visibleLines];
    const timer = setTimeout(() => {
      setVisibleLines(prev => prev + 1);
    }, line.delay);
    return () => clearTimeout(timer);
  }, [inputDone, visibleLines, scenario.lines]);

  // Cleanup pause timer on unmount
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
  }, []);

  // Auto scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines, inputDone]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-2xl border border-white/[0.06] bg-[#111822] overflow-hidden shadow-[0_0_60px_rgba(240,165,80,0.04)]">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.05] bg-white/[0.01]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-[10px] text-slate-500 ml-2 font-mono">知料 AI · 配方引擎</span>
          <span className="ml-auto text-[10px] text-slate-600 font-mono">
            {scenarioIndex + 1} / {scenarios.length}
          </span>
        </div>
        {/* Terminal body */}
        <div ref={containerRef} className="p-5 font-mono text-xs leading-relaxed h-[280px] overflow-y-auto">
          <div className="mb-3">
            <span className="text-amber-400/70">&gt; </span>
            <span className="text-slate-300">{userInput}</span>
            {!inputDone && started && (
              <span className="inline-block w-1.5 h-3.5 bg-amber-400 animate-pulse align-middle ml-0.5" />
            )}
          </div>

          {inputDone && (
            <div>
              {scenario.lines.slice(0, visibleLines).map((line, i) => (
                <div key={i} className={line.color || "text-slate-500"}>
                  {line.text || "\u00A0"}
                </div>
              ))}
              {visibleLines < scenario.lines.length && (
                <span className="inline-block w-1.5 h-3.5 bg-amber-400 animate-pulse align-middle" />
              )}
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/[0.05] bg-white/[0.01] flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-amber-400" strokeWidth={1.5} />
          <span className="text-[10px] text-slate-500">AI 实时生成 · 数据可溯源</span>
        </div>
      </div>
    </div>
  );
}
