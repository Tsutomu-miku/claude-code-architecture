import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ModuleNode {
  id: string;
  label: string;
  group: "core" | "tool" | "service" | "infra";
  size: string;
  responsibility: string;
  deps: string[];
}

interface DepEdge {
  from: string;
  to: string;
  strength: 1 | 2 | 3;
  label: string;
}

type ViewTab = "force" | "matrix" | "layered";

/* ------------------------------------------------------------------ */
/*  Module & Edge Data                                                 */
/* ------------------------------------------------------------------ */

const MODULES: ModuleNode[] = [
  { id: "query", label: "query.ts", group: "core", size: "68KB", responsibility: "\u6838\u5fc3\u67e5\u8be2\u5f15\u64ce\uff0c\u7ba1\u7406\u4e0e Claude API \u7684\u4ea4\u4e92\u5faa\u73af\u3001\u6d41\u5f0f\u54cd\u5e94\u3001\u5de5\u5177\u8c03\u7528\u7f16\u6392", deps: ["ClaudeService", "ToolRegistry", "ConversationMgr", "PermissionSys", "Telemetry"] },
  { id: "REPL", label: "REPL.tsx", group: "core", size: "~25KB", responsibility: "\u4ea4\u4e92\u5f0f\u8bfb\u53d6-\u6c42\u503c-\u8f93\u51fa\u5faa\u73af\uff0c\u7ba1\u7406\u7528\u6237\u8f93\u5165\u4e0e AI \u54cd\u5e94\u5faa\u73af", deps: ["query", "CommandRouter", "ReactInk"] },
  { id: "Tool", label: "Tool.ts", group: "tool", size: "29KB", responsibility: "\u5de5\u5177\u57fa\u7c7b\uff0c\u5b9a\u4e49 Zod Schema\u3001\u6743\u9650\u68c0\u67e5\u3001\u6267\u884c\u8ffd\u8e2a\u7684\u5b8c\u6574\u751f\u547d\u5468\u671f", deps: ["Zod", "PermissionSys", "Telemetry"] },
  { id: "ToolRegistry", label: "ToolRegistry", group: "tool", size: "~12KB", responsibility: "\u5de5\u5177\u6ce8\u518c\u4e2d\u5fc3\uff0c\u7ba1\u7406\u5185\u7f6e\u5de5\u5177\u4e0e MCP \u52a8\u6001\u5de5\u5177\u7684\u7edf\u4e00\u6ce8\u518c", deps: ["Tool", "MCPClient"] },
  { id: "ClaudeService", label: "ClaudeService", group: "service", size: "~18KB", responsibility: "Anthropic API \u5ba2\u6237\u7aef\u5c01\u88c5\uff0c\u7ba1\u7406\u8bf7\u6c42\u961f\u5217\u3001\u901f\u7387\u9650\u5236\u3001\u81ea\u52a8\u91cd\u8bd5", deps: ["AnthropicSDK", "AuthService", "ConfigService"] },
  { id: "MCPClient", label: "MCPClient", group: "service", size: "~15KB", responsibility: "MCP \u534f\u8bae\u5ba2\u6237\u7aef\uff0c\u652f\u6301 stdio/SSE \u4f20\u8f93\uff0c\u52a8\u6001\u53d1\u73b0\u4e0e\u8c03\u7528\u4ee3\u7406", deps: ["ConfigService", "ToolRegistry"] },
  { id: "PermissionSys", label: "PermissionSystem", group: "service", size: "~14KB", responsibility: "4 \u7ea7\u6743\u9650\u6a21\u5f0f\u7ba1\u7406\uff0c\u89c4\u5219\u5339\u914d\u5f15\u64ce\uff0c\u7528\u6237\u786e\u8ba4\u4ea4\u4e92", deps: ["ConfigService", "RuleStore"] },
  { id: "ConversationMgr", label: "ConversationMgr", group: "service", size: "~10KB", responsibility: "\u5bf9\u8bdd\u5386\u53f2\u7ba1\u7406\uff0c\u6d88\u606f compact \u538b\u7f29\uff0c\u6301\u4e45\u5316\u5b58\u50a8", deps: ["MessageHistory", "ConfigService"] },
  { id: "AuthService", label: "AuthService", group: "infra", size: "~8KB", responsibility: "OAuth 2.0 \u8ba4\u8bc1\uff0cJWT Token \u7ba1\u7406\u4e0e\u81ea\u52a8\u5237\u65b0", deps: ["OAuth", "JWT", "ConfigService"] },
  { id: "Telemetry", label: "TelemetryService", group: "infra", size: "~6KB", responsibility: "OpenTelemetry \u96c6\u6210\uff0cSpan \u8ffd\u8e2a\u3001\u6027\u80fd\u6307\u6807\u4e0a\u62a5", deps: ["OTelSDK"] },
  { id: "FeatureFlag", label: "FeatureFlagService", group: "infra", size: "~5KB", responsibility: "GrowthBook Feature Flag \u5ba2\u6237\u7aef\uff0c\u7070\u5ea6\u53d1\u5e03\u63a7\u5236", deps: ["GrowthBookSDK", "ConfigService"] },
  { id: "CommandRouter", label: "CommandRouter", group: "tool", size: "~7KB", responsibility: "50+ slash \u547d\u4ee4\u7684\u8def\u7531\u5206\u53d1\u4e0e\u6267\u884c\u7ba1\u7406", deps: ["Commands", "ConfigService"] },
];

const EDGES: DepEdge[] = [
  { from: "query", to: "ClaudeService", strength: 3, label: "API \u8c03\u7528\u6838\u5fc3\u4f9d\u8d56" },
  { from: "query", to: "ToolRegistry", strength: 3, label: "\u5de5\u5177\u8c03\u7528\u7f16\u6392" },
  { from: "query", to: "ConversationMgr", strength: 2, label: "\u5bf9\u8bdd\u5386\u53f2\u7ba1\u7406" },
  { from: "query", to: "PermissionSys", strength: 2, label: "\u6743\u9650\u68c0\u67e5" },
  { from: "query", to: "Telemetry", strength: 1, label: "\u6267\u884c\u8ffd\u8e2a" },
  { from: "REPL", to: "query", strength: 3, label: "\u67e5\u8be2\u5f15\u64ce\u8c03\u7528" },
  { from: "REPL", to: "CommandRouter", strength: 2, label: "\u547d\u4ee4\u8def\u7531" },
  { from: "Tool", to: "PermissionSys", strength: 2, label: "\u6743\u9650\u9a8c\u8bc1" },
  { from: "Tool", to: "Telemetry", strength: 1, label: "\u6267\u884c\u8ffd\u8e2a" },
  { from: "ToolRegistry", to: "Tool", strength: 3, label: "\u5de5\u5177\u5b9e\u4f8b\u7ba1\u7406" },
  { from: "ToolRegistry", to: "MCPClient", strength: 2, label: "MCP \u5de5\u5177\u6ce8\u518c" },
  { from: "ClaudeService", to: "AuthService", strength: 2, label: "\u8ba4\u8bc1\u51ed\u636e" },
  { from: "MCPClient", to: "ToolRegistry", strength: 2, label: "\u52a8\u6001\u5de5\u5177\u6ce8\u518c" },
  { from: "PermissionSys", to: "ConfigService" as any, strength: 1, label: "\u89c4\u5219\u914d\u7f6e" },
  { from: "ConversationMgr", to: "ConfigService" as any, strength: 1, label: "\u5b58\u50a8\u914d\u7f6e" },
  { from: "AuthService", to: "ConfigService" as any, strength: 1, label: "\u8ba4\u8bc1\u914d\u7f6e" },
  { from: "FeatureFlag", to: "ConfigService" as any, strength: 1, label: "\u529f\u80fd\u5f00\u5173\u914d\u7f6e" },
  { from: "CommandRouter", to: "ConfigService" as any, strength: 1, label: "\u547d\u4ee4\u914d\u7f6e" },
];

/* ------------------------------------------------------------------ */
/*  Color & Layout Constants                                           */
/* ------------------------------------------------------------------ */

const GROUP_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  core: { bg: "rgba(139,92,246,0.15)", border: "#8b5cf6", text: "#c4b5fd", label: "\u6838\u5fc3" },
  tool: { bg: "rgba(59,130,246,0.15)", border: "#3b82f6", text: "#93c5fd", label: "\u5de5\u5177" },
  service: { bg: "rgba(16,185,129,0.15)", border: "#10b981", text: "#6ee7b7", label: "\u670d\u52a1" },
  infra: { bg: "rgba(148,163,184,0.12)", border: "#64748b", text: "#94a3b8", label: "\u57fa\u7840\u8bbe\u65bd" },
};

const STRENGTH_COLORS = ["", "rgba(148,163,184,0.25)", "rgba(99,102,241,0.45)", "rgba(139,92,246,0.7)"];
const STRENGTH_WIDTHS = [0, 1.5, 2.5, 3.5];

/* Force-directed positions (pre-computed for deterministic layout) */
const FORCE_POSITIONS: Record<string, { x: number; y: number; r: number }> = {
  query:           { x: 400, y: 280, r: 56 },
  REPL:            { x: 160, y: 140, r: 40 },
  ClaudeService:   { x: 620, y: 140, r: 40 },
  ToolRegistry:    { x: 220, y: 380, r: 40 },
  ConversationMgr: { x: 580, y: 400, r: 38 },
  PermissionSys:   { x: 180, y: 260, r: 38 },
  Telemetry:       { x: 630, y: 290, r: 34 },
  Tool:            { x: 100, y: 420, r: 38 },
  MCPClient:       { x: 360, y: 470, r: 36 },
  AuthService:     { x: 700, y: 420, r: 34 },
  FeatureFlag:     { x: 520, y: 510, r: 32 },
  CommandRouter:   { x: 80, y: 170, r: 34 },
};

/* Layered positions */
const LAYER_DEFS = [
  { label: "Layer 0: \u5165\u53e3", modules: ["REPL"], y: 40 },
  { label: "Layer 1: \u6838\u5fc3", modules: ["query", "CommandRouter"], y: 160 },
  { label: "Layer 2: \u80fd\u529b", modules: ["ToolRegistry", "ClaudeService", "ConversationMgr", "PermissionSys"], y: 300 },
  { label: "Layer 3: \u57fa\u7840", modules: ["Tool", "MCPClient", "AuthService", "Telemetry", "FeatureFlag"], y: 440 },
];

/* ------------------------------------------------------------------ */
/*  Dependency Matrix Data                                             */
/* ------------------------------------------------------------------ */

const MATRIX_MODULES = ["query", "REPL", "Tool", "ToolRegistry", "ClaudeService", "MCPClient", "PermissionSys", "ConversationMgr", "AuthService", "Telemetry", "FeatureFlag", "CommandRouter"];

function getMatrixValue(from: string, to: string): number {
  if (from === to) return -1;
  const edge = EDGES.find(e => e.from === from && e.to === to);
  return edge ? edge.strength : 0;
}

function getMatrixTooltip(from: string, to: string): string {
  const edge = EDGES.find(e => e.from === from && e.to === to);
  if (!edge) return `${from} \u4e0d\u4f9d\u8d56 ${to}`;
  return `${from} \u2192 ${to}: ${edge.label} (\u5f3a\u5ea6 ${edge.strength})`;
}

const MATRIX_HEAT = ["transparent", "rgba(59,130,246,0.25)", "rgba(99,102,241,0.5)", "rgba(139,92,246,0.8)"];

/* ------------------------------------------------------------------ */
/*  Statistics                                                         */
/* ------------------------------------------------------------------ */

function computeStats() {
  const totalModules = MODULES.length;
  const totalEdges = EDGES.length;
  const depCount: Record<string, number> = {};
  const depByCount: Record<string, number> = {};
  MODULES.forEach(m => { depCount[m.id] = 0; depByCount[m.id] = 0; });
  EDGES.forEach(e => {
    if (depCount[e.from] !== undefined) depCount[e.from]++;
    if (depByCount[e.to] !== undefined) depByCount[e.to]++;
  });
  const coupling = MODULES.map(m => ({
    id: m.id,
    label: m.label,
    score: (depCount[m.id] || 0) + (depByCount[m.id] || 0),
    out: depCount[m.id] || 0,
    in: depByCount[m.id] || 0,
  })).sort((a, b) => b.score - a.score).slice(0, 5);
  return { totalModules, totalEdges, coupling };
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function TabBar({ active, onChange }: { active: ViewTab; onChange: (v: ViewTab) => void }) {
  const tabs: { key: ViewTab; icon: string; label: string }[] = [
    { key: "force", icon: "\uD83C\uDF10", label: "\u529b\u5bfc\u5411\u56fe" },
    { key: "matrix", icon: "\uD83D\uDD25", label: "\u4f9d\u8d56\u77e9\u9635" },
    { key: "layered", icon: "\uD83D\uDCCA", label: "\u5206\u5c42\u89c6\u56fe" },
  ];
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32, flexWrap: "wrap" }}>
      {tabs.map(t => {
        const isActive = t.key === active;
        return (
          <motion.button
            key={t.key}
            onClick={() => onChange(t.key)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "10px 22px", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 14,
              display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit", outline: "none",
              border: isActive ? "1.5px solid rgba(139,92,246,0.55)" : "1.5px solid rgba(148,163,184,0.15)",
              background: isActive ? "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(59,130,246,0.12))" : "rgba(30,32,44,0.6)",
              color: isActive ? "#e2e8f0" : "#64748b",
              boxShadow: isActive ? "0 0 16px rgba(139,92,246,0.2)" : "none",
              transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>{t.label}
          </motion.button>
        );
      })}
    </div>
  );
}

function Legend() {
  return (
    <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
      {Object.entries(GROUP_COLORS).map(([key, c]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: c.border, boxShadow: `0 0 6px ${c.border}55` }} />
          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{c.label}</span>
        </div>
      ))}
      <div style={{ width: 1, height: 16, background: "rgba(148,163,184,0.2)", margin: "0 4px" }} />
      {[1, 2, 3].map(s => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 20, height: STRENGTH_WIDTHS[s], background: STRENGTH_COLORS[s], borderRadius: 1 }} />
          <span style={{ fontSize: 11, color: "#64748b" }}>{s === 1 ? "\u5f31" : s === 2 ? "\u4e2d" : "\u5f3a"}\u4f9d\u8d56</span>
        </div>
      ))}
    </div>
  );
}

function StatsPanel() {
  const stats = useMemo(computeStats, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12,
        padding: 20, borderRadius: 14, border: "1px solid rgba(148,163,184,0.1)",
        background: "linear-gradient(135deg, rgba(30,32,44,0.9), rgba(22,24,34,0.95))", marginTop: 24,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#c4b5fd" }}>{stats.totalModules}</div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>\u6838\u5fc3\u6a21\u5757</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#93c5fd" }}>{stats.totalEdges}</div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>\u4f9d\u8d56\u8fb9\u6570</div>
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>\u8026\u5408\u5ea6 Top 5</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {stats.coupling.map((c, i) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 20, fontSize: 12, color: "#64748b", fontWeight: 700, textAlign: "right" }}>#{i + 1}</span>
              <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600, minWidth: 130, fontFamily: "'Fira Code', monospace" }}>{c.label}</span>
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(148,163,184,0.1)", overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.score / stats.coupling[0].score) * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
                  style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, #8b5cf6, #3b82f6)` }}
                />
              </div>
              <span style={{ fontSize: 11, color: "#64748b", minWidth: 60 }}>\u51fa{c.out} \u5165{c.in}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tooltip                                                            */
/* ------------------------------------------------------------------ */

function Tooltip({ mod, style }: { mod: ModuleNode | null; style: React.CSSProperties }) {
  if (!mod) return null;
  const gc = GROUP_COLORS[mod.group];
  const outDeps = EDGES.filter(e => e.from === mod.id).length;
  const inDeps = EDGES.filter(e => e.to === mod.id).length;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.15 }}
      style={{
        position: "absolute", zIndex: 50, pointerEvents: "none",
        padding: "12px 16px", borderRadius: 12,
        background: "rgba(15,17,25,0.95)", border: `1px solid ${gc.border}55`,
        boxShadow: `0 8px 30px rgba(0,0,0,0.5), 0 0 15px ${gc.border}22`,
        maxWidth: 280, backdropFilter: "blur(12px)", ...style,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14, color: gc.text, marginBottom: 4 }}>{mod.label}</div>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, display: "flex", gap: 8 }}>
        <span>{mod.size}</span>
        <span style={{ color: gc.border }}>|</span>
        <span>\u4f9d\u8d56 {outDeps}</span>
        <span style={{ color: gc.border }}>|</span>
        <span>\u88ab\u4f9d\u8d56 {inDeps}</span>
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{mod.responsibility}</div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  View A: Force-Directed Graph                                       */
/* ------------------------------------------------------------------ */

function ForceView() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltipMod, setTooltipMod] = useState<ModuleNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const hoveredEdges = useMemo(() => {
    if (!hovered) return new Set<number>();
    const s = new Set<number>();
    EDGES.forEach((e, i) => { if (e.from === hovered || e.to === hovered) s.add(i); });
    return s;
  }, [hovered]);

  const handleEnter = useCallback((mod: ModuleNode) => {
    setHovered(mod.id);
    setTooltipMod(mod);
    const pos = FORCE_POSITIONS[mod.id];
    setTooltipPos({ x: pos.x + pos.r + 12, y: pos.y - 20 });
  }, []);

  const handleLeave = useCallback(() => {
    setHovered(null);
    setTooltipMod(null);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 800, margin: "0 auto" }}>
      <svg width="800" height="560" viewBox="0 0 800 560" style={{ width: "100%", height: "auto" }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Edges */}
        {EDGES.map((e, i) => {
          const from = FORCE_POSITIONS[e.from];
          const to = FORCE_POSITIONS[e.to];
          if (!from || !to) return null;
          const isHl = hovered ? hoveredEdges.has(i) : false;
          const opacity = hovered ? (isHl ? 1 : 0.12) : 0.5;
          return (
            <line key={i}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={isHl ? STRENGTH_COLORS[e.strength] : "rgba(148,163,184,0.18)"}
              strokeWidth={isHl ? STRENGTH_WIDTHS[e.strength] + 1 : STRENGTH_WIDTHS[e.strength]}
              opacity={opacity}
              filter={isHl ? "url(#glow)" : undefined}
              style={{ transition: "all 0.25s ease" }}
            />
          );
        })}
        {/* Nodes */}
        {MODULES.map(mod => {
          const pos = FORCE_POSITIONS[mod.id];
          if (!pos) return null;
          const gc = GROUP_COLORS[mod.group];
          const isHl = hovered === mod.id;
          const dimmed = hovered && !isHl && !hoveredEdges.size ? true :
            hovered && !isHl && !EDGES.some(e => (e.from === hovered && e.to === mod.id) || (e.to === hovered && e.from === mod.id));
          return (
            <g key={mod.id}
              onMouseEnter={() => handleEnter(mod)}
              onMouseLeave={handleLeave}
              style={{ cursor: "pointer", transition: "opacity 0.25s" }}
              opacity={dimmed ? 0.3 : 1}
            >
              <circle cx={pos.x} cy={pos.y} r={pos.r}
                fill={gc.bg} stroke={gc.border}
                strokeWidth={isHl ? 2.5 : 1.5}
                filter={isHl ? "url(#glow)" : undefined}
              />
              <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                fill={gc.text} fontSize={pos.r > 45 ? 13 : pos.r > 36 ? 11 : 10}
                fontWeight={600} fontFamily="'Fira Code', monospace"
              >
                {mod.label.length > 14 ? mod.label.slice(0, 12) + ".." : mod.label}
              </text>
            </g>
          );
        })}
      </svg>
      <AnimatePresence>
        {tooltipMod && <Tooltip mod={tooltipMod} style={{ left: tooltipPos.x, top: tooltipPos.y }} />}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  View B: Dependency Matrix Heatmap                                  */
/* ------------------------------------------------------------------ */

function MatrixView() {
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);
  const cellSize = 52;
  const labelW = 120;

  return (
    <div style={{ overflowX: "auto", padding: "0 4px" }}>
      <div style={{ display: "inline-block", minWidth: "fit-content" }}>
        {/* Header row */}
        <div style={{ display: "flex", marginLeft: labelW }}>
          {MATRIX_MODULES.map((m, i) => (
            <div key={m} style={{
              width: cellSize, textAlign: "center", fontSize: 10, color: "#64748b",
              fontFamily: "'Fira Code', monospace", transform: "rotate(-45deg)", transformOrigin: "bottom left",
              height: 70, display: "flex", alignItems: "flex-end", justifyContent: "center",
              fontWeight: hoveredCell?.c === i ? 700 : 400,
              transition: "color 0.15s",
            }}>
              {MODULES.find(mod => mod.id === m)?.label || m}
            </div>
          ))}
        </div>
        {/* Rows */}
        {MATRIX_MODULES.map((rowMod, ri) => (
          <div key={rowMod} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: labelW, fontSize: 11, color: hoveredCell?.r === ri ? "#e2e8f0" : "#94a3b8",
              fontFamily: "'Fira Code', monospace", fontWeight: hoveredCell?.r === ri ? 700 : 500,
              textAlign: "right", paddingRight: 10, transition: "color 0.15s",
            }}>
              {MODULES.find(m => m.id === rowMod)?.label || rowMod}
            </div>
            {MATRIX_MODULES.map((colMod, ci) => {
              const val = getMatrixValue(rowMod, colMod);
              const isDiag = val === -1;
              const isHl = hoveredCell?.r === ri && hoveredCell?.c === ci;
              const isRowHl = hoveredCell?.r === ri || hoveredCell?.c === ci;
              return (
                <div
                  key={colMod}
                  onMouseEnter={() => setHoveredCell({ r: ri, c: ci })}
                  onMouseLeave={() => setHoveredCell(null)}
                  title={isDiag ? `${rowMod} (\u81ea\u8eab)` : getMatrixTooltip(rowMod, colMod)}
                  style={{
                    width: cellSize, height: cellSize,
                    background: isDiag ? "rgba(148,163,184,0.06)" : val > 0 ? MATRIX_HEAT[val] : "transparent",
                    border: `1px solid ${isHl ? "rgba(139,92,246,0.6)" : isRowHl ? "rgba(148,163,184,0.12)" : "rgba(148,163,184,0.06)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "default", transition: "all 0.15s", position: "relative",
                    borderRadius: isHl ? 4 : 0,
                    boxShadow: isHl ? "0 0 12px rgba(139,92,246,0.3)" : "none",
                  }}
                >
                  {isDiag && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(148,163,184,0.3)" }} />}
                  {!isDiag && val > 0 && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: val === 3 ? "#e2e8f0" : val === 2 ? "#c4b5fd" : "#64748b" }}>
                      {val}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {/* Legend */}
        <div style={{ display: "flex", gap: 12, marginTop: 16, marginLeft: labelW, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#64748b" }}>\u4f9d\u8d56\u5f3a\u5ea6:</span>
          {[0, 1, 2, 3].map(v => (
            <div key={v} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 16, height: 16, borderRadius: 3, background: v === 0 ? "rgba(148,163,184,0.06)" : MATRIX_HEAT[v], border: "1px solid rgba(148,163,184,0.1)" }} />
              <span style={{ fontSize: 10, color: "#64748b" }}>{v === 0 ? "\u65e0" : v === 1 ? "\u5f31" : v === 2 ? "\u4e2d" : "\u5f3a"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  View C: Layered Dependency Graph                                   */
/* ------------------------------------------------------------------ */

function LayeredView() {
  const [hovered, setHovered] = useState<string | null>(null);
  const svgW = 800;
  const svgH = 540;

  const nodePositions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    LAYER_DEFS.forEach(layer => {
      const count = layer.modules.length;
      const spacing = svgW / (count + 1);
      layer.modules.forEach((id, i) => {
        pos[id] = { x: spacing * (i + 1), y: layer.y };
      });
    });
    return pos;
  }, []);

  /* Only show edges between modules in LAYER_DEFS */
  const layerModIds = new Set(LAYER_DEFS.flatMap(l => l.modules));
  const layerEdges = EDGES.filter(e => layerModIds.has(e.from) && layerModIds.has(e.to));

  const getLayerIdx = (id: string) => LAYER_DEFS.findIndex(l => l.modules.includes(id));

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: svgW, margin: "0 auto" }}>
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: "auto" }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 3 L 0 6 z" fill="rgba(139,92,246,0.6)" />
          </marker>
          <marker id="arrow-dash" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 3 L 0 6 z" fill="rgba(245,158,11,0.6)" />
          </marker>
        </defs>
        {/* Layer backgrounds */}
        {LAYER_DEFS.map((layer, i) => (
          <g key={layer.label}>
            <rect x={20} y={layer.y - 30} width={svgW - 40} height={65} rx={10}
              fill={`rgba(148,163,184,${0.03 + i * 0.01})`}
              stroke="rgba(148,163,184,0.08)" strokeWidth={1}
            />
            <text x={36} y={layer.y - 12} fill="#4a5568" fontSize={11} fontWeight={600}>
              {layer.label}
            </text>
          </g>
        ))}
        {/* Edges */}
        {layerEdges.map((e, i) => {
          const from = nodePositions[e.from];
          const to = nodePositions[e.to];
          if (!from || !to) return null;
          const fromLayer = getLayerIdx(e.from);
          const toLayer = getLayerIdx(e.to);
          const isCrossLayer = Math.abs(fromLayer - toLayer) > 1;
          const isHighlighted = hovered === e.from || hovered === e.to;
          const dimmed = hovered && !isHighlighted;
          return (
            <line key={i}
              x1={from.x} y1={from.y + 16} x2={to.x} y2={to.y - 16}
              stroke={isCrossLayer ? "rgba(245,158,11,0.5)" : "rgba(139,92,246,0.4)"}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
              strokeDasharray={isCrossLayer ? "6,4" : "none"}
              opacity={dimmed ? 0.15 : isHighlighted ? 1 : 0.6}
              markerEnd={isCrossLayer ? "url(#arrow-dash)" : "url(#arrow)"}
              style={{ transition: "all 0.25s" }}
            />
          );
        })}
        {/* Nodes */}
        {LAYER_DEFS.flatMap(layer =>
          layer.modules.map(id => {
            const mod = MODULES.find(m => m.id === id);
            if (!mod) return null;
            const pos = nodePositions[id];
            const gc = GROUP_COLORS[mod.group];
            const isHl = hovered === id;
            const dimmed = hovered && hovered !== id && !EDGES.some(e =>
              (e.from === hovered && e.to === id) || (e.to === hovered && e.from === id));
            return (
              <g key={id}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
                opacity={dimmed ? 0.3 : 1}
              >
                <rect x={pos.x - 58} y={pos.y - 16} width={116} height={32} rx={8}
                  fill={gc.bg} stroke={gc.border}
                  strokeWidth={isHl ? 2.5 : 1.5}
                />
                <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                  fill={gc.text} fontSize={11} fontWeight={600} fontFamily="'Fira Code', monospace"
                >
                  {mod.label.length > 15 ? mod.label.slice(0, 13) + ".." : mod.label}
                </text>
              </g>
            );
          })
        )}
      </svg>
      {/* Cross-layer note */}
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="rgba(139,92,246,0.6)" strokeWidth="2" /></svg>
          <span style={{ fontSize: 11, color: "#64748b" }}>\u540c\u5c42/\u76f8\u90bb\u4f9d\u8d56</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="rgba(245,158,11,0.5)" strokeWidth="2" strokeDasharray="4,3" /></svg>
          <span style={{ fontSize: 11, color: "#64748b" }}>\u8de8\u5c42\u4f9d\u8d56</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function DependencyGraph() {
  const [activeView, setActiveView] = useState<ViewTab>("force");

  return (
    <section id="dependency-graph" style={{ padding: "80px 20px", maxWidth: 960, margin: "0 auto" }}>
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: 40 }}
      >
        <h2 style={{
          fontSize: 36, fontWeight: 800, marginBottom: 12,
          background: "linear-gradient(135deg, #c4b5fd, #93c5fd)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          \uD83D\uDD78\uFE0F \u6a21\u5757\u4f9d\u8d56\u5173\u7cfb\u56fe
        </h2>
        <p style={{ color: "#64748b", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
          \u53ef\u89c6\u5316\u5c55\u793a Claude Code \u6838\u5fc3\u6a21\u5757\u4e4b\u95f4\u7684\u4f9d\u8d56\u5173\u7cfb\uff0c\u63ed\u793a\u7cfb\u7edf\u8026\u5408\u5ea6\u4e0e\u67b6\u6784\u5206\u5c42\u3002
        </p>
      </motion.div>

      {/* Tab bar */}
      <TabBar active={activeView} onChange={setActiveView} />

      {/* Legend */}
      <Legend />

      {/* View content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === "force" && <ForceView />}
          {activeView === "matrix" && <MatrixView />}
          {activeView === "layered" && <LayeredView />}
        </motion.div>
      </AnimatePresence>

      {/* Stats */}
      <StatsPanel />

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        style={{ textAlign: "center", fontSize: 12, color: "#475569", marginTop: 24 }}
      >
        \u4f9d\u8d56\u5173\u7cfb\u57fa\u4e8e Claude Code CLI \u6e90\u7801\u9759\u6001\u5206\u6790 \u00b7 \u8282\u70b9\u4f4d\u7f6e\u4e3a\u9884\u8ba1\u7b97\u5e03\u5c40
      </motion.p>
    </section>
  );
}
