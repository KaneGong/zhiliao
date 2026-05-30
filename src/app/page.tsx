import Link from "next/link";
import {
  ArrowRight,
  Beaker,
  Database,
  FileText,
  FlaskConical,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <div className="home-redesign">
      <section className="hero-shell">
        <aside className="hero-rail">
          <div className="rail-card">
            <p className="eyebrow">DESIGN SAMPLE</p>
            <p>
              新版知料不再像“多个功能页的集合”，而是一个围绕产品需求展开的工作台：输入需求，AI 拆解原料，法规同步验证，最终沉淀为可保存、可追问、可转采购的方案。
            </p>
          </div>
          <div className="health">
            <div><span>法规库</span><b>86 条</b></div>
            <div><span>原料数据</span><b>94 种</b></div>
            <div><span>AI 状态</span><b>在线</b></div>
          </div>
        </aside>

        <main className="hero-main">
          <div className="hero-copy">
            <p className="eyebrow accent">ZHILIAO REDESIGN</p>
            <h1><span>把食品研发，</span><span>放回一张清晰</span><span>的智能实验台。</span></h1>
            <p className="lead">
              新版知料不是“多个功能页的集合”，而是一个围绕产品需求展开的工作台：输入需求，AI 拆解原料，法规同步验证，最终沉淀为可保存、可追问、可转采购的方案。
            </p>

            <form action="/recommend" method="get" className="hero-input-card">
              <div className="input-row">
                <Search className="w-5 h-5" />
                <input
                  name="q"
                  placeholder="描述你的产品需求，例如：开发一款面向办公人群的低糖助眠软糖，需要普通食品可用原料，风味温和，成本可控。"
                />
              </div>
              <div className="input-footer">
                <div className="quick-tags">
                  <button type="button">助眠软糖</button>
                  <button type="button">运动蛋白粉</button>
                  <button type="button">儿童益生菌</button>
                </div>
                <button type="submit" className="primary-btn">生成方案</button>
              </div>
            </form>
          </div>

          <div className="live-panel">
            <div className="window-head">
              <span className="dot amber" /><span className="dot green" /><span className="dot red" />
              <b>LIVE FORMULA ENGINE</b>
            </div>
            <div className="engine-card">
              <div className="engine-row top">
                <div>
                  <h3>核心原料建议</h3>
                  <p>GABA · 放松情绪</p>
                  <p>酸枣仁提取物 · 中式心智</p>
                  <p>镁元素 · 睡眠支持</p>
                </div>
                <span className="pill amber">AI 生成中</span>
              </div>
              <div className="engine-row">
                <div>
                  <h3>方案可信度</h3>
                  <Metric label="法规匹配" value="78%" />
                  <Metric label="供应商可得性" value="64%" />
                  <Metric label="证据完整度" value="71%" />
                </div>
                <span className="pill green">可继续</span>
              </div>
              <div className="engine-row compact">
                <h3>下一步追问</h3>
                <div className="prompt-row">
                  <span>目标单粒成本？</span>
                  <span>是否允许保健食品路径？</span>
                  <span>要不要低糖配方？</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </section>

      <section className="capability-section">
        <div className="section-title">
          <p className="eyebrow">WORKFLOW</p>
          <h2>从需求到方案，一次形成闭环</h2>
        </div>
        <div className="capability-grid">
          <Capability icon={<FlaskConical className="w-5 h-5" />} title="配方工作台" desc="把产品类型、目标人群、法规路径和约束条件放在同一张研发简报里，AI 输出可追问的建议方案。" />
          <Capability icon={<ShieldCheck className="w-5 h-5" />} title="法规证据" desc="不是只给结论，而是拆成法规匹配、风险提醒、供应商线索和下一步补证建议。" />
          <Capability icon={<Database className="w-5 h-5" />} title="原料库" desc="围绕功能方向、合规状态、应用剂型和证据等级筛选原料，把搜索变成方案构建。" />
        </div>
      </section>

      <section className="trust-section">
        <div className="trust-card">
          <div>
            <p className="eyebrow">TRUST AS INTERFACE</p>
            <h2>可信不是一句承诺，而是界面的一部分。</h2>
            <p>
              新版界面把“数据来源、法规编号、证据等级、风险标签”直接放进操作流程里，让研发人员可以边生成、边判断、边修正。
            </p>
          </div>
          <div className="trust-items">
            <TrustItem icon={<Package className="w-4 h-4" />} title="数据有来源" />
            <TrustItem icon={<FileText className="w-4 h-4" />} title="法规可溯源" />
            <TrustItem icon={<Sparkles className="w-4 h-4" />} title="AI 可追问" />
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>开始一次真实的配方分析</h2>
        <p>从一个产品想法开始，让知料把原料、法规、证据和供应商线索组织成可执行方案。</p>
        <div className="cta-actions">
          <Link href="/recommend" className="primary-link">开始分析 <ArrowRight className="w-4 h-4" /></Link>
          <Link href="/search" className="ghost-link">浏览原料库</Link>
        </div>
      </section>

      <style>{`
        .home-redesign {
          min-height: calc(100vh - 56px);
          overflow-x: hidden;
          color: #f2ede4;
          background:
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(180deg, rgba(255,255,255,.02) 1px, transparent 1px),
            radial-gradient(circle at 16% 4%, rgba(240,165,80,.14), transparent 30%),
            radial-gradient(circle at 90% 18%, rgba(100,185,135,.08), transparent 32%),
            #0e1217;
          background-size: 64px 64px, 64px 64px, auto, auto, auto;
        }
        .home-redesign, .home-redesign * { box-sizing: border-box; }
        .hero-shell {
          display: grid;
          grid-template-columns: 248px 1fr;
          min-height: calc(100vh - 56px);
        }
        .hero-rail {
          border-right: 1px solid rgba(242,237,228,.09);
          background: rgba(14,18,23,.76);
          backdrop-filter: blur(24px);
          padding: 32px 16px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .rail-card {
          border: 1px solid rgba(242,237,228,.09);
          border-radius: 12px;
          padding: 14px;
          background: rgba(255,255,255,.035);
        }
        .rail-card p:not(.eyebrow) {
          margin: 0;
          color: #b8ad9a;
          font-size: 14px;
          line-height: 1.7;
        }
        .health { margin-top: auto; display: grid; gap: 10px; color: #7e7464; font-size: 13px; }
        .health div { display: flex; justify-content: space-between; border-top: 1px solid rgba(242,237,228,.09); padding-top: 10px; }
        .health b { color: #64b987; }
        .hero-main {
          min-width: 0;
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(360px, .78fr);
          gap: 56px;
          align-items: center;
          padding: 76px 56px;
        }
        .eyebrow { margin: 0 0 10px; color: #7e7464; font: 700 10px/1 var(--font-mono); letter-spacing: .16em; text-transform: uppercase; }
        .eyebrow.accent { color: #f0a550; }
        .hero-copy h1 {
          margin: 0 0 22px;
          max-width: 760px;
          color: #f2ede4;
          font: 900 clamp(48px, 7vw, 94px)/.98 "Noto Serif SC", serif;
          letter-spacing: -.04em;
        }
        .hero-copy h1 span { display: block; }
        .lead {
          max-width: 720px;
          margin: 0 0 34px;
          color: #b8ad9a;
          font-size: 17px;
          line-height: 1.9;
          font-weight: 600;
        }
        .hero-input-card {
          max-width: 720px;
          border: 1px solid rgba(240,165,80,.16);
          border-radius: 14px;
          background: rgba(25,34,44,.72);
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,.22);
        }
        .input-row { display: flex; gap: 12px; align-items: flex-start; padding: 20px; color: #7e7464; min-height: 106px; }
        .input-row input { flex: 1; border: 0; outline: 0; background: transparent; color: #f2ede4; font-size: 15px; line-height: 1.7; padding-top: 1px; }
        .input-row input::placeholder { color: #8d8170; }
        .input-footer { border-top: 1px solid rgba(242,237,228,.09); padding: 12px; display: flex; justify-content: space-between; gap: 12px; align-items: center; }
        .quick-tags { display: flex; gap: 8px; flex-wrap: wrap; }
        .quick-tags button { border: 1px solid rgba(242,237,228,.09); border-radius: 999px; background: rgba(255,255,255,.03); color: #b8ad9a; padding: 7px 11px; font-size: 12px; }
        .primary-btn, .primary-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 0;
          border-radius: 10px;
          background: linear-gradient(135deg, #f0a550, #ef7e42);
          color: white;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 0 24px rgba(240,165,80,.16);
        }
        .primary-btn { min-height: 40px; padding: 0 18px; }
        .live-panel {
          width: 100%;
          min-width: 0;
          border: 1px solid rgba(242,237,228,.09);
          border-radius: 16px;
          background: rgba(25,34,44,.7);
          box-shadow: 0 30px 100px rgba(0,0,0,.3);
          overflow: hidden;
        }
        .window-head { height: 48px; border-bottom: 1px solid rgba(242,237,228,.09); display: flex; align-items: center; gap: 8px; padding: 0 16px; }
        .window-head b { margin-left: auto; color: #7e7464; font: 700 10px/1 var(--font-mono); letter-spacing: .16em; }
        .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .dot.amber { background: #f0a550; } .dot.green { background: #64b987; } .dot.red { background: #e07373; }
        .engine-card { padding: 18px; display: grid; gap: 14px; }
        .engine-row { border: 1px solid rgba(242,237,228,.09); border-radius: 12px; background: rgba(255,255,255,.03); padding: 16px; display: flex; justify-content: space-between; gap: 14px; }
        .engine-row h3 { margin: 0 0 11px; font-size: 15px; color: #f2ede4; }
        .engine-row p { margin: 8px 0 0; color: #b8ad9a; font-size: 13px; }
        .engine-row.compact { display: block; }
        .pill { height: 26px; padding: 0 9px; border-radius: 999px; display: inline-flex; align-items: center; font-size: 11px; font-weight: 800; white-space: nowrap; }
        .pill.amber { color: #f0a550; background: rgba(240,165,80,.1); border: 1px solid rgba(240,165,80,.18); }
        .pill.green { color: #64b987; background: rgba(100,185,135,.1); border: 1px solid rgba(100,185,135,.18); }
        .metric { margin-top: 9px; }
        .metric-head { display: flex; justify-content: space-between; color: #b8ad9a; font-size: 12px; margin-bottom: 5px; }
        .metric-bar { height: 6px; border-radius: 999px; background: rgba(255,255,255,.07); overflow: hidden; }
        .metric-bar i { display: block; height: 100%; background: linear-gradient(90deg, #f0a550, #64b987); }
        .prompt-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .prompt-row span { color: #b8ad9a; border: 1px solid rgba(242,237,228,.09); border-radius: 999px; padding: 7px 10px; font-size: 12px; }
        .capability-section, .trust-section, .cta-section { max-width: 1120px; margin: 0 auto; padding: 84px 24px; }
        .section-title { text-align: center; margin-bottom: 28px; }
        .section-title h2, .trust-card h2, .cta-section h2 { margin: 0; color: #f2ede4; font: 900 34px/1.2 "Noto Serif SC", serif; }
        .capability-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .capability-card, .trust-card {
          border: 1px solid rgba(242,237,228,.09);
          border-radius: 16px;
          background: rgba(25,34,44,.72);
          padding: 20px;
          box-shadow: 0 24px 80px rgba(0,0,0,.14);
        }
        .cap-icon, .trust-icon { width: 40px; height: 40px; border-radius: 11px; display: grid; place-items: center; color: #f0a550; background: rgba(240,165,80,.1); margin-bottom: 16px; }
        .capability-card h3 { margin: 0 0 9px; color: #f2ede4; font-size: 17px; }
        .capability-card p, .trust-card p, .cta-section p { margin: 0; color: #b8ad9a; line-height: 1.8; font-size: 14px; }
        .trust-card { display: grid; grid-template-columns: 1fr 360px; gap: 28px; align-items: center; }
        .trust-card h2 { margin-bottom: 14px; }
        .trust-items { display: grid; gap: 10px; }
        .trust-item { border: 1px solid rgba(242,237,228,.09); border-radius: 12px; padding: 13px; display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,.025); }
        .trust-item strong { color: #f2ede4; }
        .trust-icon { margin: 0; width: 34px; height: 34px; border-radius: 9px; }
        .cta-section { text-align: center; padding-top: 60px; }
        .cta-section p { max-width: 620px; margin: 14px auto 28px; }
        .cta-actions { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .primary-link { min-height: 44px; padding: 0 20px; }
        .ghost-link { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0 20px; color: #b8ad9a; text-decoration: none; border: 1px solid rgba(242,237,228,.09); border-radius: 10px; background: rgba(255,255,255,.03); font-weight: 700; }
        @media (max-width: 1100px) {
          .hero-shell { grid-template-columns: 1fr; }
          .hero-rail { display: none; }
          .hero-main { grid-template-columns: 1fr; padding: 56px 24px; }
          .live-panel { max-width: 620px; }
        }
        @media (max-width: 760px) {
          .hero-main { padding: 38px 16px; overflow: hidden; }
          .hero-copy { min-width: 0; max-width: calc(100vw - 32px); overflow: hidden; }
          .hero-copy h1 {
            font-size: clamp(34px, 10vw, 39px);
            line-height: 1.08;
            letter-spacing: -.03em;
            word-break: keep-all;
            overflow-wrap: normal;
          }
          .lead { font-size: 14px; line-height: 1.75; max-width: calc(100vw - 32px); overflow-wrap: anywhere; word-break: break-word; }
          .hero-input-card { width: 100%; max-width: calc(100vw - 32px); }
          .input-row { min-height: 86px; min-width: 0; padding: 16px; align-items: center; }
          .input-row input { min-width: 0; font-size: 13px; text-overflow: ellipsis; }
          .input-footer { align-items: stretch; flex-direction: column; }
          .quick-tags { width: 100%; display: grid; grid-template-columns: 1fr; }
          .quick-tags button { width: 100%; }
          .primary-btn { width: 100%; }
          .live-panel { max-width: calc(100vw - 32px); overflow: hidden; }
          .window-head b { display: none; }
          .engine-card { padding: 14px; }
          .engine-row { display: block; padding: 14px; }
          .engine-row .pill { margin-top: 12px; }
          .capability-grid, .trust-card { grid-template-columns: 1fr; }
          .section-title h2, .trust-card h2, .cta-section h2 { font-size: 28px; }
        }
      `}</style>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <div className="metric-head"><span>{label}</span><b>{value}</b></div>
      <div className="metric-bar"><i style={{ width: value }} /></div>
    </div>
  );
}

function Capability({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <article className="capability-card">
      <div className="cap-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </article>
  );
}

function TrustItem({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="trust-item">
      <div className="trust-icon">{icon}</div>
      <strong>{title}</strong>
    </div>
  );
}
