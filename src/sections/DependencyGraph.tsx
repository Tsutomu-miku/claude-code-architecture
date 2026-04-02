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
/*  Color constants                                                    */
/* ------------------------------------------------------------------ */

const COLORS = {
  blue: { main: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
  purple: { main: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  cyan: { main: "#06b6d4", bg: "#ecfeff", border: "#a5f3fc" },
  amber: { main: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  green: { main: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  red: { main: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  indigo: { main: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe" },
};

/* ------------------------------------------------------------------ */
/*  Module & Edge Data                                                 */
/* ------------------------------------------------------------------ */

const MODULES: ModuleNode[] = [
  { id: "query", label: "query.ts", group: "core", size: "68KB", responsibility: "核心查询引擎，管理与 Claude API 的交互循环、流式响应、工具调用编排", deps: ["ClaudeService", "ToolRegistry", "ConversationMgr", "PermissionSys", "Telemetry"] },
  { id: "REPL", label: "REPL.tsx", group: "core", size: "~25KB", responsibility: "交互式读取-求值-输出循环，管理用户输入与 AI 响应循环", deps: ["query", "CommandRouter", "ReactInk"] },
  { id: "Tool", label: "Tool.ts", group: "tool", size: "29KB", responsibility: "工具基类，定义 Zod Schema、权限检查、执行追踪的完整生命周期", deps: ["Zod", "PermissionSys", "Telemetry"] },
  { id: "ToolRegistry", label: "ToolRegistry", group: "tool", size: "~12KB", responsibility: "工具注册中心，管理内置工具与 MCP 动态工具的统一注册", deps: ["Tool", "MCPClient"] },
  { id: "ClaudeService", label: "ClaudeService", group: "service", size: "~18KB", responsibility: "Anthropic API 客户端封装，管理请求队列、速率限制、自动重试", deps: ["AnthropicSDK", "AuthService", "ConfigService"] },
  { id: "MCPClient", label: "MCPClient", group: "service", size: "~15KB", responsibility: "MCP 协议客户端，支持 stdio/SSE 传输，动态发现与调用代理", deps: ["ConfigService", "ToolRegistry"] },
  { id: "PermissionSys", label: "PermissionSystem", group: "service", size: "~14KB", responsibility: "4 级权限模式管理，规则匹配引擎，用户确认交互", deps: ["ConfigService", "RuleStore"] },
  { id: "ConversationMgr", label: "ConversationMgr", group: "service", size: "~10KB", responsibility: "对话历史管理，消息 compact 压缩，持久化存储", deps: ["MessageHistory", "ConfigService"] },
  { id: "AuthService", label: "AuthService", group: "infra", size: "~8KB", responsibility: "OAuth 2.0 认证，JWT Token 管理与自动刷新", deps: ["OAuth", "JWT", "ConfigService"] },
  { id: "Telemetry", label: "TelemetryService", group: "infra", size: "~6KB", responsibility: "OpenTelemetry 集成，Span 追踪、性能指标上报", deps: ["OTelSDK"] },
  { id: "FeatureFlag", label: "FeatureFlagService", group: "infra", size: "~5KB", responsibility: "GrowthBook Feature Flag 客户端，灰度发布控制", deps: ["GrowthBookSDK", "ConfigService"] },
  { id: "CommandRouter", label: "CommandRouter", group: "tool", size: "~7KB", responsibility: "50+ slash 命令的路由分发与执行管理", deps: ["Commands", "ConfigService"] },
];

const EDGES: DepEdge[] = [
  { from: "query", to: "ClaudeService", strength: 3, label: "API 调用核心依赖" },
  { from: "query", to: "ToolRegistry", strength: 3, label: "工具调用编排" },
  { from: "query", to: "ConversationMgr", strength: 2, label: "对话历史管理" },
  { from: "query", to: "PermissionSys", strength: 2, label: "权限检查" },
  { from: "query", to: "Telemetry", strength: 1, label: "执行追踪" },
  { from: "REPL", to: "query", strength: 3, label: "查询引擎调用" },
  { from: "REPL", to: "CommandRouter", strength: 2, label: "命令路由" },
  { from: "Tool", to: "PermissionSys", strength: 2, label: "权限验证" },
  { from: "Tool", to: "Telemetry", strength: 1, label: "执行追踪" },
  { from: "ToolRegistry", to: "Tool", strength: 3, label: "工具实例管理" },
  { from: "ToolRegistry", to: "MCPClient", strength: 2, label: "MCP 工具注册" },
  { from: "ClaudeService", to: "AuthService", strength: 2, label: "认证凭据" },
  { from: "MCPClient", to: "ToolRegistry", strength: 2, label: "动态工具注册" },
  { from: "PermissionSys", to: "ConfigService" as any, strength: 1, label: "规则配置" },
  { from: "ConversationMgr", to: "ConfigService" as any, strength: 1, label: "存储配置" },
  { from: "AuthService", to: "ConfigService" as any, strength: 1, label: "认证配置" },
  { from: "FeatureFlag", to: "ConfigService" as any, strength: 1, label: "功能开关配置" },
  { from: "CommandRouter", to: "ConfigService" as any, strength: 1, label: "命令配置" },
];

/* ------------------------------------------------------------------ */
/*  Color & Layout Constants                                           */
/* ------------------------------------------------------------------ */

const GROUP_COLORS: Record<string, { bg: string; border: string; text: string; label: string; topBar: string }> = {
  core: { bg: "#ffffff", border: COLORS.purple.border, text: COLORS.purple.main, label: "核心", topBar: COLORS.purple.main },
  tool: { bg: "#ffffff", border: COLORS.blue.border, text: COLORS.blue.main, label: "工具", topBar: COLORS.blue.main },
  service: { bg: "#ffffff", border: COLORS.green.border, text: COLORS.green.main, label: "服务", topBar: COLORS.green.main },
  infra: { bg: "#ffffff", border: "#e2e8f0", text: "#475569", label: "基础设施", topBar: "#94a3b8" },
};

const STRENGTH_WIDTHS = [0, 1, 2, 3];

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

const LAYER_DEFS = [
  { label: "Layer 0: 入口", modules: ["REPL"], y: 40 },
  { label: "Layer 1: 核心", modules: ["query", "CommandRouter"], y: 160 },
  { label: "Layer 2: 能力", modules: ["ToolRegistry", "ClaudeService", "ConversationMgr", "PermissionSys"], y: 300 },
  { label: "Layer 3: 基础", modules: ["Tool", "MCPClient", "AuthService", "Telemetry", "FeatureFlag"], y: 440 },
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
  if (!edge) return `${from} 不依赖 ${to}`;
  return `${from} → ${to}: ${edge.label} (强度 ${edge.strength})`;
}

/* Blue-scale heatmap colors */
const MATRIX_HEAT = ["transparent", "#dbeafe", "#93c5fd", "#3b82f6"];
const MATRIX_TEXT_COLORS = ["#475569", "#1e40af", "#1e3a8a", "#ffffff"];

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
    { key: "force", icon: "🌐", label: "力导向图" },
    { key: "matrix", icon: "🔥", label: "依赖矩阵" },
    { key: "layered", icon: "📊", label: "分层视图" },
  ];
  return (
    <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 32, flexWrap: "wrap", borderBottom: "1px solid #e2e8f0", paddingBottom: 0 }}>
      {tabs.map(t => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            className="tab-button"
            onClick={() => onChange(t.key)}
            style={{
              padding: "10px 22px",
              borderRadius: "8px 8px 0 0",
              border: "none",
              borderBottom: isActive ? `2px solid ${COLORS.blue.main}` : "2px solid transparent",
              background: isActive ? "#ffffff" : "transparent",
              color: isActive ? "#0f172a" : "#94a3b8",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "'Inter', system-ui, sans-serif",
              outline: "none",
              transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>{t.label}
          </button>
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
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: c.topBar }} />
          <span style={{ fontSize: 12, color: "#475569", fontWeight: 500, fontFamily: "'Inter', system-ui, sans-serif" }}>{c.label}</span>
        </div>
      ))}
      <div style={{ width: 1, height: 16, background: "#e2e8f0", margin: "0 4px" }} />
      {[1, 2, 3].map(s => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 20, height: STRENGTH_WIDTHS[s], background: s === 1 ? "#cbd5e1" : s === 2 ? "#94a3b8" : "#475569", borderRadius: 1 }} />
          <span style={{ fontSize: 11, color: "#475569", fontFamily: "'Inter', system-ui, sans-serif" }}>{s === 1 ? "弱" : s === 2 ? "中" : "强"}依赖</span>
        </div>
      ))}
    </div>
  );
}

function StatsPanel() {
  const stats = useMemo(computeStats, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.35 }}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
        padding: 20,
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
        marginTop: 24,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.purple.main, fontFamily: "'Inter', system-ui, sans-serif" }}>{stats.totalModules}</div>
        <div style={{ fontSize: 12, color: "#475569", marginTop: 2, fontFamily: "'Inter', system-ui, sans-serif" }}>核心模块</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.blue.main, fontFamily: "'Inter', system-ui, sans-serif" }}>{stats.totalEdges}</div>
        <div style={{ fontSize: 12, color: "#475569", marginTop: 2, fontFamily: "'Inter', system-ui, sans-serif" }}>依赖边数</div>
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 8, fontFamily: "'Inter', system-ui, sans-serif" }}>耦合度 Top 5</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {stats.coupling.map((c, i) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 20, fontSize: 12, color: "#475569", fontWeight: 700, textAlign: "right", fontFamily: "'Inter', system-ui, sans-serif" }}>#{i + 1}</span>
              <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 600, minWidth: 130, fontFamily: "'JetBrains Mono', monospace" }}>{c.label}</span>
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#f1f5f9", overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.score / stats.coupling[0].score) * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
                  style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${COLORS.blue.main}, ${COLORS.purple.main})` }}
                />
              </div>
              <span style={{ fontSize: 11, color: "#475569", minWidth: 60, fontFamily: "'Inter', system-ui, sans-serif" }}>出{c.out} 入{c.in}</span>
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

function NodeTooltip({ mod, style }: { mod: ModuleNode | null; style: React.CSSProperties }) {
  if (!mod) return null;
  const gc = GROUP_COLORS[mod.group];
  const outDeps = EDGES.filter(e => e.from === mod.id).length;
  const inDeps = EDGES.filter(e => e.to === mod.id).length;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.12 }}
      style={{
        position: "absolute",
        zIndex: 50,
        pointerEvents: "none",
        padding: "12px 16px",
        borderRadius: 12,
        background: "#ffffff",
        border: `1px solid ${gc.border}`,
        boxShadow: "0 4px 16px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)",
        maxWidth: 280,
        ...style,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14, color: gc.text, marginBottom: 4, fontFamily: "'Inter', system-ui, sans-serif" }}>{mod.label}</div>
      <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, display: "flex", gap: 8, fontFamily: "'Inter', system-ui, sans-serif" }}>
        <span>{mod.size}</span>
        <span style={{ color: "#cbd5e1" }}>|</span>
        <span>依赖 {outDeps}</span>
        <span style={{ color: "#cbd5e1" }}>|</span>
        <span>被依赖 {inDeps}</span>
      </div>
      <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5, fontFamily: "'Inter', system-ui, sans-serif" }}>{mod.responsibility}</div>
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
        {/* Edges */}
        {EDGES.map((e, i) => {
          const from = FORCE_POSITIONS[e.from];
          const to = FORCE_POSITIONS[e.to];
          if (!from || !to) return null;
          const isHl = hovered ? hoveredEdges.has(i) : false;
          const opacity = hovered ? (isHl ? 1 : 0.15) : 0.4;
          const strokeColor = isHl ? (e.strength === 3 ? "#475569" : e.strength === 2 ? "#94a3b8" : "#cbd5e1") : "#cbd5e1";
          return (
            <line key={i}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={strokeColor}
              strokeWidth={isHl ? STRENGTH_WIDTHS[e.strength] + 1 : STRENGTH_WIDTHS[e.strength]}
              opacity={opacity}
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
          const dimmed = hovered && !isHl && !EDGES.some(e => (e.from === hovered && e.to === mod.id) || (e.to === hovered && e.from === mod.id));
          return (
            <g key={mod.id}
              onMouseEnter={() => handleEnter(mod)}
              onMouseLeave={handleLeave}
              style={{ cursor: "pointer", transition: "opacity 0.25s" }}
              opacity={dimmed ? 0.3 : 1}
            >
              {/* White fill with shadow simulation */}
              <rect x={pos.x - pos.r} y={pos.y - 20} width={pos.r * 2} height={40} rx={10}
                fill="#ffffff" stroke={gc.border} strokeWidth={isHl ? 2 : 1}
              />
              {/* Colored top bar */}
              <rect x={pos.x - pos.r} y={pos.y - 20} width={pos.r * 2} height={4} rx={2}
                fill={gc.topBar}
              />
              <text x={pos.x} y={pos.y + 2} textAnchor="middle" dominantBaseline="middle"
                fill={gc.text} fontSize={pos.r > 45 ? 12 : pos.r > 36 ? 10.5 : 9.5}
                fontWeight={600} fontFamily="'JetBrains Mono', monospace"
              >
                {mod.label.length > 14 ? mod.label.slice(0, 12) + ".." : mod.label}
              </text>
            </g>
          );
        })}
      </svg>
      <AnimatePresence>
        {tooltipMod && <NodeTooltip mod={tooltipMod} style={{ left: tooltipPos.x, top: tooltipPos.y }} />}
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
              width: cellSize, textAlign: "center", fontSize: 10, color: hoveredCell?.c === i ? "#0f172a" : "#475569",
              fontFamily: "'JetBrains Mono', monospace", transform: "rotate(-45deg)", transformOrigin: "bottom left",
              height: 70, display: "flex", alignItems: "flex-end", justifyContent: "center",
              fontWeight: hoveredCell?.c === i ? 700 : 400, transition: "color 0.15s",
            }}>
              {MODULES.find(mod => mod.id === m)?.label || m}
            </div>
          ))}
        </div>
        {/* Rows */}
        {MATRIX_MODULES.map((rowMod, ri) => (
          <div key={rowMod} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: labelW, fontSize: 11, color: hoveredCell?.r === ri ? "#0f172a" : "#475569",
              fontFamily: "'JetBrains Mono', monospace", fontWeight: hoveredCell?.r === ri ? 700 : 500,
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
                  title={isDiag ? `${rowMod} (自身)` : getMatrixTooltip(rowMod, colMod)}
                  style={{
                    width: cellSize, height: cellSize,
                    background: isDiag ? "#f1f5f9" : val > 0 ? MATRIX_HEAT[val] : "#ffffff",
                    border: `1px solid ${isHl ? COLORS.blue.main : isRowHl ? "#cbd5e1" : "#e2e8f0"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "default", transition: "all 0.15s", position: "relative",
                    borderRadius: isHl ? 4 : 0,
                    boxShadow: isHl ? "0 0 8px rgba(59,130,246,0.2)" : "none",
                  }}
                >
                  {isDiag && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#cbd5e1" }} />}
                  {!isDiag && val > 0 && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: MATRIX_TEXT_COLORS[val], fontFamily: "'Inter', system-ui, sans-serif" }}>
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
          <span style={{ fontSize: 11, color: "#475569", fontFamily: "'Inter', system-ui, sans-serif" }}>依赖强度:</span>
          {[0, 1, 2, 3].map(v => (
            <div key={v} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 16, height: 16, borderRadius: 3, background: v === 0 ? "#ffffff" : MATRIX_HEAT[v], border: "1px solid #e2e8f0" }} />
              <span style={{ fontSize: 10, color: "#475569", fontFamily: "'Inter', system-ui, sans-serif" }}>{v === 0 ? "无" : v === 1 ? "弱" : v === 2 ? "中" : "强"}</span>
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

  const layerModIds = new Set(LAYER_DEFS.flatMap(l => l.modules));
  const layerEdges = EDGES.filter(e => layerModIds.has(e.from) && layerModIds.has(e.to));
  const getLayerIdx = (id: string) => LAYER_DEFS.findIndex(l => l.modules.includes(id));

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: svgW, margin: "0 auto" }}>
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: "auto" }}>
        <defs>
          <marker id="arrow-light" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 3 L 0 6 z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-dash-light" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 3 L 0 6 z" fill={COLORS.amber.main} />
          </marker>
        </defs>
        {/* Layer backgrounds - alternate white / #f8fafc */}
        {LAYER_DEFS.map((layer, i) => (
          <g key={layer.label}>
            <rect x={20} y={layer.y - 30} width={svgW - 40} height={65} rx={10}
              fill={i % 2 === 0 ? "#ffffff" : "#f8fafc"}
              stroke="#e2e8f0" strokeWidth={1}
            />
            <text x={36} y={layer.y - 12} fill="#475569" fontSize={11} fontWeight={600} fontFamily="'Inter', system-ui, sans-serif">
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
              stroke={isCrossLayer ? COLORS.amber.main : "#94a3b8"}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
              strokeDasharray={isCrossLayer ? "6,4" : "none"}
              opacity={dimmed ? 0.15 : isHighlighted ? 1 : 0.5}
              markerEnd={isCrossLayer ? "url(#arrow-dash-light)" : "url(#arrow-light)"}
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
                  fill="#ffffff" stroke={isHl ? gc.topBar : gc.border}
                  strokeWidth={isHl ? 2 : 1}
                />
                {/* Top color bar */}
                <rect x={pos.x - 58} y={pos.y - 16} width={116} height={3} rx={2}
                  fill={gc.topBar}
                />
                <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                  fill={gc.text} fontSize={11} fontWeight={600} fontFamily="'JetBrains Mono', monospace"
                >
                  {mod.label.length > 15 ? mod.label.slice(0, 13) + ".." : mod.label}
                </text>
              </g>
            );
          })
        )}
      </svg>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="#94a3b8" strokeWidth="2" /></svg>
          <span style={{ fontSize: 11, color: "#475569", fontFamily: "'Inter', system-ui, sans-serif" }}>同层/相邻依赖</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke={COLORS.amber.main} strokeWidth="2" strokeDasharray="4,3" /></svg>
          <span style={{ fontSize: 11, color: "#475569", fontFamily: "'Inter', system-ui, sans-serif" }}>跨层依赖</span>
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        style={{ textAlign: "center", marginBottom: 40 }}
      >
        <h2
          className="section-title"
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 12,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          🕸️ 模块依赖关系图
        </h2>
        <p
          className="section-subtitle"
          style={{ color: "#475569", fontSize: 16, maxWidth: 600, margin: "0 auto", fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          可视化展示 Claude Code 核心模块之间的依赖关系，揭示系统耦合度与架构分层。
        </p>
      </motion.div>

      <TabBar active={activeView} onChange={setActiveView} />
      <Legend />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {activeView === "force" && <ForceView />}
          {activeView === "matrix" && <MatrixView />}
          {activeView === "layered" && <LayeredView />}
        </motion.div>
      </AnimatePresence>

      <StatsPanel />

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 24, fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        依赖关系基于 Claude Code CLI 源码静态分析 · 节点位置为预计算布局
      </motion.p>
    </section>
  );
}
