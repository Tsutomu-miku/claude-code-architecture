import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ================================================================== */
/*  Color Tokens & Shared Styles                                       */
/* ================================================================== */

const C = {
  bg: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  borderHi: "#cbd5e1",
  text: "#0f172a",
  dim: "#475569",
  muted: "#94a3b8",
  blue: "#3b82f6",
  blueBg: "#eff6ff",
  blueBorder: "#bfdbfe",
  purple: "#7c3aed",
  purpleBg: "#f5f3ff",
  purpleBorder: "#ddd6fe",
  green: "#059669",
  greenBg: "#ecfdf5",
  greenBorder: "#a7f3d0",
  amber: "#d97706",
  amberBg: "#fffbeb",
  amberBorder: "#fde68a",
  red: "#dc2626",
  redBg: "#fef2f2",
  redBorder: "#fecaca",
  cyan: "#0891b2",
  cyanBg: "#ecfeff",
  cyanBorder: "#a5f3fc",
  teal: "#0d9488",
};

const FONT_MONO = "'JetBrains Mono', 'Fira Code', monospace";
const RADIUS = 12;
const RADIUS_SM = 8;
const TRANSITION_FAST = "all 0.2s ease";

/* ================================================================== */
/*  Tooltip Component                                                  */
/* ================================================================== */

function Tooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#ffffff",
              border: `1px solid ${C.borderHi}`,
              borderRadius: RADIUS_SM,
              padding: "8px 12px",
              fontSize: "0.78rem",
              color: C.dim,
              lineHeight: 1.6,
              whiteSpace: "pre-line",
              width: "max-content",
              maxWidth: 260,
              zIndex: 50,
              pointerEvents: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            }}
          >
            {text}
            <div
              style={{
                position: "absolute",
                bottom: -5,
                left: "50%",
                transform: "translateX(-50%) rotate(45deg)",
                width: 8,
                height: 8,
                background: "#ffffff",
                borderRight: `1px solid ${C.borderHi}`,
                borderBottom: `1px solid ${C.borderHi}`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
/*  Tab Bar                                                            */
/* ================================================================== */

const TAB_ITEMS = [
  { key: "panorama", label: "\u7cfb\u7edf\u5168\u666f\u67b6\u6784", icon: "\ud83c\udfd7\ufe0f" },
  { key: "dataflow", label: "\u6570\u636e\u6d41\u5168\u666f", icon: "\ud83d\udd04" },
  { key: "deps", label: "\u6a21\u5757\u4f9d\u8d56\u5173\u7cfb", icon: "\ud83d\udd78\ufe0f" },
];

function TabBar({
  active,
  onChange,
}: {
  active: string;
  onChange: (k: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        background: "#f1f5f9",
        borderRadius: RADIUS,
        padding: 4,
        border: `1px solid ${C.border}`,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {TAB_ITEMS.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              flex: "1 1 0",
              minWidth: 130,
              padding: "10px 16px",
              borderRadius: RADIUS_SM,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.85rem",
              transition: TRANSITION_FAST,
              background: isActive ? "#ffffff" : "transparent",
              color: isActive ? C.blue : C.muted,
              boxShadow: isActive
                ? "0 1px 3px rgba(0,0,0,0.08)"
                : "none",
              borderBottom: isActive ? `2px solid ${C.blue}` : "2px solid transparent",
            }}
          >
            <span style={{ marginRight: 6 }}>{t.icon}</span>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  DIAGRAM 1 - System Panorama Architecture                           */
/* ================================================================== */

interface CompItem {
  name: string;
  icon: string;
  desc: string;
}

interface LayerDef {
  id: string;
  label: string;
  labelEn: string;
  color: string;
  bg: string;
  borderColor: string;
  components: CompItem[];
  extras?: { label: string; desc: string; color: string }[];
}

const PANORAMA_LAYERS: LayerDef[] = [
  {
    id: "ui",
    label: "\u7528\u6237\u4ea4\u4e92\u5c42",
    labelEn: "User Interface",
    color: C.blue,
    bg: C.blueBg,
    borderColor: C.blueBorder,
    components: [
      {
        name: "Terminal (REPL)",
        icon: "\ud83d\udcbb",
        desc: "\u4ea4\u4e92\u5f0f\u7ec8\u7aef\uff0c\u57fa\u4e8e React+Ink \u6e32\u67d3\uff0c\u652f\u6301 Vim \u6a21\u5f0f\u3001Tab \u8865\u5168\u3001\u8bed\u6cd5\u9ad8\u4eae",
      },
      {
        name: "VS Code Extension",
        icon: "\ud83d\udd2e",
        desc: "VS Code \u96c6\u6210\u6269\u5c55\uff0c\u901a\u8fc7 IPC \u4e0e\u6838\u5fc3\u5f15\u64ce\u901a\u4fe1\uff0c\u63d0\u4f9b\u4fa7\u8fb9\u680f Chat \u9762\u677f",
      },
      {
        name: "JetBrains Plugin",
        icon: "\ud83e\udde9",
        desc: "JetBrains IDE \u63d2\u4ef6\uff0c\u5d4c\u5165 Claude Code \u529f\u80fd\u5230 IntelliJ \u7cfb\u5217 IDE",
      },
      {
        name: "CI/CD (Headless)",
        icon: "\u26a1",
        desc: "\u65e0\u5934\u6a21\u5f0f\u7528\u4e8e CI/CD \u7ba1\u9053\uff0c\u901a\u8fc7 --print \u53c2\u6570\u5355\u6b21\u6267\u884c\uff0c\u9000\u51fa\u7801\u4f20\u9012\u7ed3\u679c",
      },
    ],
  },
  {
    id: "core",
    label: "\u6838\u5fc3\u5f15\u64ce\u5c42",
    labelEn: "Core Engine",
    color: C.purple,
    bg: C.purpleBg,
    borderColor: C.purpleBorder,
    components: [
      {
        name: "CLI Parser",
        icon: "\ud83d\udccb",
        desc: "Commander.js \u89e3\u6790 30+ CLI \u53c2\u6570\uff1a--model, --permission-mode, --allowedTools \u7b49",
      },
      {
        name: "REPL Engine",
        icon: "\ud83d\udd01",
        desc: "React+Ink \u9a71\u52a8\u7684\u8bfb\u53d6-\u6c42\u503c-\u8f93\u51fa\u5faa\u73af\uff0c\u7ba1\u7406\u7528\u6237\u8f93\u5165\u2192AI\u54cd\u5e94\u2192\u5de5\u5177\u6267\u884c\u6d41\u7a0b",
      },
      {
        name: "Command Router",
        icon: "\ud83d\uddc2\ufe0f",
        desc: "80+ slash \u547d\u4ee4\u7684\u8def\u7531\u5206\u53d1\u5668\uff0c\u652f\u6301\u524d\u7f00\u5339\u914d\u3001\u53c2\u6570\u89e3\u6790\u548c Tab \u8865\u5168",
      },
    ],
    extras: [
      {
        label: "Query Engine (query.ts + QueryEngine.ts)",
        desc: "\u6838\u5fc3\u67e5\u8be2\u5f15\u64ce\uff1a\u6d88\u606f\u6784\u5efa \u2192 API\u8c03\u7528 \u2192 \u6d41\u5f0f\u54cd\u5e94 \u2192 \u5de5\u5177\u7f16\u6392 \u2192 \u5faa\u73af\u8fed\u4ee3\uff0c\u9a71\u52a8\u6574\u4e2a AI \u4ea4\u4e92\u5faa\u73af",
        color: C.purple,
      },
    ],
  },
  {
    id: "tools",
    label: "\u5de5\u5177\u6267\u884c\u5c42",
    labelEn: "Tool Execution",
    color: C.amber,
    bg: C.amberBg,
    borderColor: C.amberBorder,
    components: [
      {
        name: "File Tools",
        icon: "\ud83d\udcc4",
        desc: "Read/Write/Edit/Glob/Grep \u6587\u4ef6\u64cd\u4f5c\u5de5\u5177\u96c6\uff0c\u652f\u6301 .gitignore \u611f\u77e5",
      },
      {
        name: "Search Tools",
        icon: "\ud83d\udd0d",
        desc: "GrepTool(ripgrep) + GlobTool(fast-glob) + FindTool \u4e09\u4ef6\u5957",
      },
      {
        name: "Bash Tool",
        icon: "\ud83d\udda5\ufe0f",
        desc: "\u9694\u79bb Shell \u73af\u5883\u6267\u884c\u547d\u4ee4\uff0c120s \u8d85\u65f6\uff0cstdout/stderr \u5206\u79bb",
      },
      {
        name: "Git Tools",
        icon: "\ud83d\udcca",
        desc: "GitLog/GitDiff/GitCommit/GitStatus \u5c01\u88c5\uff0cConventional Commits \u652f\u6301",
      },
      {
        name: "Web Tools",
        icon: "\ud83c\udf10",
        desc: "WebFetch \u6293\u53d6\u7f51\u9875\u5185\u5bb9\uff0cHTML\u2192Markdown \u8f6c\u6362\u8282\u7701 token",
      },
    ],
    extras: [
      {
        label: "Permission System (4-level modes)",
        desc: "\u56db\u7ea7\u6743\u9650\u6a21\u5f0f: default \u2192 cautious \u2192 strict \u2192 bypass\uff0c\u63a7\u5236\u5de5\u5177\u6267\u884c\u7684\u5b89\u5168\u8fb9\u754c",
        color: C.amber,
      },
      {
        label: "MCP Dynamic Tools (\u5916\u90e8\u5de5\u5177\u6269\u5c55)",
        desc: "\u901a\u8fc7 MCP \u534f\u8bae\u52a8\u6001\u53d1\u73b0\u548c\u52a0\u8f7d\u5916\u90e8\u5de5\u5177\uff0c\u652f\u6301 stdio/SSE \u4e24\u79cd\u4f20\u8f93",
        color: C.cyan,
      },
    ],
  },
  {
    id: "infra",
    label: "\u57fa\u7840\u670d\u52a1\u5c42",
    labelEn: "Infrastructure",
    color: C.green,
    bg: C.greenBg,
    borderColor: C.greenBorder,
    components: [
      {
        name: "Anthropic SDK",
        icon: "\ud83e\udd16",
        desc: "\u5c01\u88c5 @anthropic-ai/sdk\uff0c\u7ba1\u7406 API Key \u8f6e\u6362\u3001\u8bf7\u6c42\u961f\u5217\u3001\u901f\u7387\u9650\u5236\u3001\u81ea\u52a8\u91cd\u8bd5",
      },
      {
        name: "MCP Client",
        icon: "\ud83d\udd0c",
        desc: "MCP \u5ba2\u6237\u7aef\uff0c\u7ba1\u7406\u591a\u670d\u52a1\u5668\u751f\u547d\u5468\u671f\uff1a\u542f\u52a8/\u53d1\u73b0/\u8c03\u7528/\u91cd\u8fde/\u5173\u95ed",
      },
      {
        name: "Auth Service",
        icon: "\ud83d\udd10",
        desc: "OAuth 2.0 + PKCE \u8ba4\u8bc1\uff0cJWT \u89e3\u6790/\u5237\u65b0\uff0c\u591a\u79df\u6237 API Key \u7ba1\u7406",
      },
      {
        name: "Telemetry (OTel)",
        icon: "\ud83d\udce1",
        desc: "OpenTelemetry \u96c6\u6210\uff0cTracer/Meter/Logger\uff0c\u8ffd\u8e2a\u6bcf\u4e2a\u5de5\u5177\u8c03\u7528\u548c API \u8bf7\u6c42",
      },
      {
        name: "Config Svc",
        icon: "\u2699\ufe0f",
        desc: "3\u5c42\u914d\u7f6e\u5408\u5e76: \u5168\u5c40\u2192\u9879\u76ee\u2192\u4f1a\u8bdd\uff0c\u652f\u6301 GrowthBook Feature Flags \u8fdc\u7a0b\u914d\u7f6e",
      },
    ],
  },
];

function LayerArrow({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "6px 0",
        gap: 2,
      }}
    >
      <div
        style={{
          width: 2,
          height: 12,
          background: C.borderHi,
        }}
      />
      <span
        style={{
          fontSize: "0.68rem",
          fontFamily: FONT_MONO,
          color: C.muted,
          letterSpacing: "0.03em",
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: `6px solid ${C.borderHi}`,
        }}
      />
    </div>
  );
}

function PanoramaCard({ comp }: { comp: CompItem }) {
  return (
    <Tooltip text={comp.desc}>
      <motion.div
        whileHover={{ scale: 1.04, y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{
          background: "#ffffff",
          border: `1px solid ${C.border}`,
          borderRadius: RADIUS_SM,
          padding: "10px 14px",
          cursor: "default",
          minWidth: 110,
          textAlign: "center",
          transition: TRANSITION_FAST,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ fontSize: "1.3rem", marginBottom: 4 }}>{comp.icon}</div>
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: C.text,
            lineHeight: 1.3,
          }}
        >
          {comp.name}
        </div>
      </motion.div>
    </Tooltip>
  );
}

function ExtraBar({
  extra,
}: {
  extra: { label: string; desc: string; color: string };
}) {
  return (
    <Tooltip text={extra.desc}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        style={{
          marginTop: 10,
          background: "#ffffff",
          border: `1px solid ${C.border}`,
          borderRadius: RADIUS_SM,
          padding: "10px 16px",
          cursor: "default",
          textAlign: "center",
          borderLeft: `3px solid ${extra.color}`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <span
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: extra.color,
            fontFamily: FONT_MONO,
          }}
        >
          {extra.label}
        </span>
      </motion.div>
    </Tooltip>
  );
}

function PanoramaLayer({
  layer,
  index,
}: {
  layer: LayerDef;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.45 }}
      style={{
        position: "relative",
        background: layer.bg,
        border: `1px solid ${layer.borderColor}`,
        borderRadius: RADIUS,
        padding: "20px 20px 16px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${layer.color}, transparent)`,
          opacity: 0.5,
        }}
      />
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
          background: "#ffffff",
          borderRadius: 6,
          padding: "4px 12px",
          border: `1px solid ${C.border}`,
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: layer.color,
          }}
        >
          {layer.label}
        </span>
        <span
          style={{
            fontSize: "0.68rem",
            color: C.muted,
            fontFamily: FONT_MONO,
          }}
        >
          {layer.labelEn}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "center",
        }}
      >
        {layer.components.map((comp) => (
          <PanoramaCard key={comp.name} comp={comp} />
        ))}
      </div>
      {layer.extras?.map((ex) => (
        <ExtraBar key={ex.label} extra={ex} />
      ))}
    </motion.div>
  );
}

function SystemPanorama() {
  const connectorLabels = ["IPC / stdio", "invoke", "call"];
  const connectorColors = [C.blue, C.purple, C.amber];
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {PANORAMA_LAYERS.map((layer, i) => (
        <div key={layer.id}>
          <PanoramaLayer layer={layer} index={i} />
          {i < PANORAMA_LAYERS.length - 1 && (
            <LayerArrow
              label={connectorLabels[i]}
              color={connectorColors[i]}
            />
          )}
        </div>
      ))}
      <div
        style={{
          marginTop: 20,
          padding: "12px 16px",
          background: "#ffffff",
          borderRadius: RADIUS_SM,
          border: `1px solid ${C.border}`,
          fontSize: "0.78rem",
          color: C.dim,
          lineHeight: 1.7,
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <strong style={{ color: C.text }}>\u67b6\u6784\u8bf4\u660e\uff1a</strong>
        Claude Code \u91c7\u7528\u7ecf\u5178\u7684\u5206\u5c42\u67b6\u6784\uff08Layered Architecture\uff09\uff0c\u6bcf\u4e00\u5c42\u53ea\u4f9d\u8d56\u5176\u4e0b\u65b9\u7684\u5c42\u3002
        \u7528\u6237\u4ea4\u4e92\u5c42\u901a\u8fc7 IPC/stdio \u4e0e\u6838\u5fc3\u5f15\u64ce\u901a\u4fe1\uff1b\u6838\u5fc3\u5f15\u64ce\u901a\u8fc7\u6807\u51c6\u5316\u63a5\u53e3\u8c03\u7528\u5de5\u5177\u5c42\uff1b
        \u5de5\u5177\u5c42\u548c\u6838\u5fc3\u5c42\u5171\u540c\u4f9d\u8d56\u5e95\u90e8\u7684\u57fa\u7840\u670d\u52a1\u5c42\u63d0\u4f9b API \u901a\u4fe1\u3001\u8ba4\u8bc1\u3001\u914d\u7f6e\u548c\u9065\u6d4b\u80fd\u529b\u3002
        \u8fd9\u79cd\u8bbe\u8ba1\u4f7f\u5f97\u66ff\u6362\u4efb\u4f55\u4e00\u5c42\uff08\u5982\u6dfb\u52a0\u65b0\u7684 IDE \u96c6\u6210\uff09\u4e0d\u4f1a\u5f71\u54cd\u5176\u4ed6\u5c42\u3002
        <br />
        <span style={{ color: C.purple, fontFamily: FONT_MONO, fontSize: "0.72rem" }}>
          &#10168; \u9f20\u6807\u60ac\u505c\u5404\u7ec4\u4ef6\u53ef\u67e5\u770b\u8be6\u7ec6\u63cf\u8ff0
        </span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  DIAGRAM 2 - Data Flow Panorama                                     */
/* ================================================================== */

interface FlowNode {
  id: string;
  label: string;
  icon: string;
  desc: string;
  color: string;
  highlight?: boolean;
}

const FLOW_TOP: FlowNode[] = [
  {
    id: "input",
    label: "\u7528\u6237\u8f93\u5165",
    icon: "\u2328\ufe0f",
    desc: "\u7ec8\u7aef/IDE \u4e2d\u8f93\u5165\u81ea\u7136\u8bed\u8a00\u6307\u4ee4\u6216 slash \u547d\u4ee4",
    color: C.blue,
  },
  {
    id: "cli",
    label: "CLI \u89e3\u6790",
    icon: "\ud83d\udccb",
    desc: "Commander.js \u89e3\u6790\u53c2\u6570\uff0c\u533a\u5206 slash \u547d\u4ee4\u4e0e\u81ea\u7136\u8bed\u8a00",
    color: C.blue,
  },
  {
    id: "router",
    label: "\u547d\u4ee4\u8def\u7531",
    icon: "\ud83d\uddc2\ufe0f",
    desc: "commandRouter \u5206\u53d1\u5230\u5bf9\u5e94\u5904\u7406\u5668\u6216\u8fdb\u5165 AI \u5bf9\u8bdd\u6d41\u7a0b",
    color: C.blue,
  },
  {
    id: "query",
    label: "\u67e5\u8be2\u5f15\u64ce",
    icon: "\u26a1",
    desc: "query.ts \u6838\u5fc3\u5faa\u73af: \u6784\u5efa\u6d88\u606f \u2192 \u8c03\u7528 API \u2192 \u89e3\u6790\u54cd\u5e94 \u2192 \u7f16\u6392\u5de5\u5177\u8c03\u7528",
    color: C.purple,
    highlight: true,
  },
  {
    id: "api",
    label: "API \u8bf7\u6c42",
    icon: "\ud83d\udce1",
    desc: "Anthropic SDK \u6784\u5efa\u8bf7\u6c42\u4f53\uff0c\u9644\u52a0\u7cfb\u7edf\u63d0\u793a\u8bcd\u3001\u5de5\u5177\u5b9a\u4e49\u3001\u5bf9\u8bdd\u5386\u53f2",
    color: C.purple,
  },
  {
    id: "claude",
    label: "Claude API",
    icon: "\ud83e\udd16",
    desc: "Anthropic \u4e91\u7aef\u63a8\u7406\uff0c\u8fd4\u56de\u6587\u672c\u548c tool_use \u5757\u7684\u6d41\u5f0f SSE \u54cd\u5e94",
    color: C.green,
  },
];

const FLOW_BOTTOM: FlowNode[] = [
  {
    id: "stream",
    label: "\u6d41\u5f0f\u54cd\u5e94",
    icon: "\ud83d\udce5",
    desc: "SSE \u9010 chunk \u63a5\u6536\uff0c\u5b9e\u65f6\u89e3\u6790 content_block_delta \u548c tool_use \u4e8b\u4ef6",
    color: C.green,
  },
  {
    id: "perm",
    label: "\u6743\u9650\u68c0\u67e5",
    icon: "\ud83d\udd12",
    desc: "\u68c0\u67e5\u5de5\u5177\u7684\u5b89\u5168\u5143\u6570\u636e(isDestructive/needsPermissions)\uff0c\u6309\u6a21\u5f0f\u51b3\u5b9a\u662f\u5426\u653e\u884c",
    color: C.red,
    highlight: true,
  },
  {
    id: "exec",
    label: "\u5de5\u5177\u6267\u884c",
    icon: "\ud83d\udd27",
    desc: "Zod \u6821\u9a8c\u53c2\u6570 \u2192 \u8c03\u7528 tool.execute() \u2192 \u6355\u83b7 stdout/stderr \u2192 \u5c01\u88c5 tool_result",
    color: C.amber,
  },
  {
    id: "merge",
    label: "\u7ed3\u679c\u6574\u5408",
    icon: "\ud83d\udd00",
    desc: "\u5c06 tool_result \u8ffd\u52a0\u5230\u6d88\u606f\u5386\u53f2\uff0c\u51b3\u5b9a\u662f\u5426\u7ee7\u7eed\u5faa\u73af\uff08\u6709 tool_use \u5219\u5faa\u73af\uff09",
    color: C.amber,
  },
  {
    id: "render",
    label: "\u6e32\u67d3\u8f93\u51fa",
    icon: "\ud83c\udfa8",
    desc: "React+Ink \u5b9e\u65f6\u6e32\u67d3 Markdown \u6587\u672c\u3001\u4ee3\u7801\u5757\u3001diff \u89c6\u56fe\u5230\u7ec8\u7aef",
    color: C.blue,
  },
  {
    id: "output",
    label: "\u6700\u7ec8\u8f93\u51fa",
    icon: "\u2705",
    desc: "\u7528\u6237\u770b\u5230\u683c\u5f0f\u5316\u7684 AI \u56de\u590d\uff0c\u5305\u542b\u6587\u672c\u3001\u4ee3\u7801\u53d8\u66f4\u3001\u5de5\u5177\u6267\u884c\u7ed3\u679c",
    color: C.blue,
  },
];

function FlowNodeBox({
  node,
  isLast,
}: {
  node: FlowNode;
  isLast: boolean;
  direction: "right" | "left";
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        flexShrink: 0,
      }}
    >
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ scale: 1.06, y: -3 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{
          position: "relative",
          background: node.highlight ? `${node.color}10` : "#ffffff",
          border: `1px solid ${node.highlight ? node.color + "40" : C.border}`,
          borderRadius: RADIUS_SM,
          padding: "12px 14px",
          minWidth: 90,
          textAlign: "center",
          cursor: "default",
          boxShadow: node.highlight
            ? `0 2px 8px ${node.color}15`
            : "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ fontSize: "1.2rem", marginBottom: 4 }}>{node.icon}</div>
        <div
          style={{
            fontSize: "0.73rem",
            fontWeight: 600,
            color: node.color,
            whiteSpace: "nowrap",
          }}
        >
          {node.label}
        </div>
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#ffffff",
                border: `1px solid ${C.borderHi}`,
                borderRadius: RADIUS_SM,
                padding: "8px 12px",
                fontSize: "0.74rem",
                color: C.dim,
                lineHeight: 1.6,
                width: "max-content",
                maxWidth: 220,
                zIndex: 40,
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                pointerEvents: "none",
              }}
            >
              {node.desc}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {!isLast && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 2px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 18,
              height: 2,
              background: C.borderHi,
            }}
          />
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "4px solid transparent",
              borderBottom: "4px solid transparent",
              borderLeft: `5px solid ${C.borderHi}`,
            }}
          />
        </div>
      )}
    </div>
  );
}

function TurnArrow() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "4px 30px",
        position: "relative",
        height: 40,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderBottom: `6px solid ${C.borderHi}`,
          }}
        />
        <span
          style={{
            fontSize: "0.65rem",
            color: C.muted,
            fontFamily: FONT_MONO,
            marginLeft: 4,
          }}
        >
          return
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <span
          style={{
            fontSize: "0.65rem",
            color: C.muted,
            fontFamily: FONT_MONO,
            marginRight: 4,
          }}
        >
          forward
        </span>
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: `6px solid ${C.borderHi}`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "0.68rem",
          fontFamily: FONT_MONO,
          color: C.muted,
          background: "#ffffff",
          padding: "2px 10px",
          borderRadius: 4,
          border: `1px solid ${C.border}`,
        }}
      >
        &#8635; tool_use loop
      </div>
    </div>
  );
}

function DataFlowPanorama() {
  return (
    <div>
      <div className="globalarch-flow-desktop">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            overflowX: "auto",
            paddingBottom: 8,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {FLOW_TOP.map((n, i) => (
            <FlowNodeBox
              key={n.id}
              node={n}
              isLast={i === FLOW_TOP.length - 1}
              direction="right"
            />
          ))}
        </div>
        <TurnArrow />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            overflowX: "auto",
            paddingTop: 8,
            WebkitOverflowScrolling: "touch",
            direction: "rtl",
          }}
        >
          {FLOW_BOTTOM.map((n, i) => (
            <div key={n.id} style={{ direction: "ltr" }}>
              <FlowNodeBox
                node={n}
                isLast={i === FLOW_BOTTOM.length - 1}
                direction="right"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="globalarch-flow-mobile">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            alignItems: "stretch",
          }}
        >
          {[...FLOW_TOP, ...FLOW_BOTTOM].map((n, i, arr) => (
            <div key={n.id}>
              <MobileFlowNode node={n} />
              {i < arr.length - 1 && <MobileFlowArrow />}
              {i === FLOW_TOP.length - 1 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "6px 0",
                    fontSize: "0.68rem",
                    fontFamily: FONT_MONO,
                    color: C.muted,
                  }}
                >
                  &#8635; tool_use loop &#8635;
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: "12px 16px",
          background: "#ffffff",
          borderRadius: RADIUS_SM,
          border: `1px solid ${C.border}`,
          fontSize: "0.78rem",
          color: C.dim,
          lineHeight: 1.7,
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <strong style={{ color: C.text }}>\u6570\u636e\u6d41\u8bf4\u660e\uff1a</strong>
        \u6bcf\u6761\u7528\u6237\u8bf7\u6c42\u7ecf\u8fc7 CLI \u89e3\u6790\u548c\u547d\u4ee4\u8def\u7531\u540e\u8fdb\u5165\u67e5\u8be2\u5f15\u64ce\uff08
        <span style={{ color: C.purple }}>\u6838\u5fc3\u5faa\u73af</span>
        \uff09\u3002\u67e5\u8be2\u5f15\u64ce\u6784\u5efa API \u8bf7\u6c42\u53d1\u9001\u5230 Claude\uff0cClaude \u8fd4\u56de\u6d41\u5f0f\u54cd\u5e94\u3002
        \u5982\u679c\u54cd\u5e94\u4e2d\u5305\u542b tool_use \u5757\uff0c\u7cfb\u7edf\u5148\u6267\u884c
        <span style={{ color: C.red }}> \u6743\u9650\u68c0\u67e5</span>
        \uff0c\u518d\u8c03\u7528\u5bf9\u5e94\u5de5\u5177\uff0c\u5c06 tool_result \u8ffd\u52a0\u5230\u6d88\u606f\u5386\u53f2\u540e\u91cd\u65b0\u8fdb\u5165 API \u5faa\u73af\u3002
        \u8fd9\u4e2a tool_use &#8594; tool_result \u7684\u5faa\u73af\u4f1a\u6301\u7eed\u5230 Claude \u8fd4\u56de\u7eaf\u6587\u672c\u56de\u590d\u4e3a\u6b62\u3002
        <br />
        <span style={{ color: C.amber, fontFamily: FONT_MONO, fontSize: "0.72rem" }}>
          &#10168; \u9ad8\u4eae\u8282\u70b9\u4e3a\u5173\u952e\u74f6\u9888\u70b9\uff0c\u60ac\u505c\u67e5\u770b\u8be6\u60c5
        </span>
      </div>
    </div>
  );
}

function MobileFlowNode({ node }: { node: FlowNode }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: node.highlight ? `${node.color}08` : "#ffffff",
        border: `1px solid ${node.highlight ? node.color + "30" : C.border}`,
        borderRadius: RADIUS_SM,
        padding: "10px 14px",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: "1.1rem" }}>{node.icon}</span>
        <span
          style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: node.color,
          }}
        >
          {node.label}
        </span>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              fontSize: "0.74rem",
              color: C.dim,
              lineHeight: 1.6,
              marginTop: 6,
              overflow: "hidden",
            }}
          >
            {node.desc}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MobileFlowArrow() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "2px 0" }}>
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderTop: `5px solid ${C.muted}`,
        }}
      />
    </div>
  );
}

/* ================================================================== */
/*  DIAGRAM 3 - Module Dependencies (Concentric Circles)               */
/* ================================================================== */

interface DepNode {
  name: string;
  desc: string;
  color: string;
  borderColor?: string;
  bg?: string;
}

const DEP_CENTER: DepNode = {
  name: "query.ts",
  desc: "\u6838\u5fc3\u67e5\u8be2\u5f15\u64ce\nAI \u4ea4\u4e92\u5faa\u73af\u7684\u5fc3\u810f\n\u6d88\u606f\u6784\u5efa\u2192API\u8c03\u7528\u2192\u6d41\u5f0f\u54cd\u5e94\u2192\u5de5\u5177\u7f16\u6392",
  color: C.purple,
  borderColor: C.purpleBorder,
  bg: C.purpleBg,
};

const DEP_RING1: DepNode[] = [
  {
    name: "Tool.ts",
    desc: "\u5de5\u5177\u57fa\u7c7b\uff0c40+ \u5de5\u5177\u7684\u7edf\u4e00\u63a5\u53e3\nZod Schema \u9a8c\u8bc1 + \u5b89\u5168\u5143\u6570\u636e\u58f0\u660e",
    color: C.amber,
    borderColor: C.amberBorder,
    bg: C.amberBg,
  },
  {
    name: "ConversationMgr",
    desc: "\u5bf9\u8bdd\u5386\u53f2\u7ba1\u7406\u5668\n\u4e0a\u4e0b\u6587\u538b\u7f29(compact)\u3001\u6301\u4e45\u5316\u5b58\u50a8\u3001\u591a\u4f1a\u8bdd\u5207\u6362",
    color: C.blue,
    borderColor: C.blueBorder,
    bg: C.blueBg,
  },
  {
    name: "ClaudeService",
    desc: "Anthropic API \u5ba2\u6237\u7aef\n\u6d41\u5f0fSSE\u3001\u81ea\u52a8\u91cd\u8bd5\u3001Token\u8ba1\u6570",
    color: C.green,
    borderColor: C.greenBorder,
    bg: C.greenBg,
  },
  {
    name: "PermissionSys",
    desc: "\u56db\u7ea7\u6743\u9650\u7cfb\u7edf\ndefault\u2192cautious\u2192strict\u2192bypass",
    color: C.red,
    borderColor: C.redBorder,
    bg: C.redBg,
  },
];

const DEP_RING2: DepNode[] = [
  {
    name: "MCP Client",
    desc: "\u5916\u90e8\u5de5\u5177\u534f\u8bae\u5ba2\u6237\u7aef\nstdio/SSE \u4f20\u8f93",
    color: C.cyan,
    borderColor: C.cyanBorder,
    bg: C.cyanBg,
  },
  {
    name: "Auth Service",
    desc: "OAuth2.0+PKCE\nJWT\u5237\u65b0\u3001API Key\u7ba1\u7406",
    color: C.red,
    borderColor: C.redBorder,
    bg: C.redBg,
  },
  {
    name: "Telemetry",
    desc: "OpenTelemetry\nTracer/Meter/Logger",
    color: C.green,
    borderColor: C.greenBorder,
    bg: C.greenBg,
  },
  {
    name: "Feature Flags",
    desc: "GrowthBook SDK\n\u8fdc\u7a0b\u914d\u7f6e+\u7070\u5ea6\u53d1\u5e03",
    color: C.amber,
    borderColor: C.amberBorder,
    bg: C.amberBg,
  },
  {
    name: "Config",
    desc: "3\u5c42\u914d\u7f6e\u5408\u5e76\n\u5168\u5c40\u2192\u9879\u76ee\u2192\u4f1a\u8bdd",
    color: C.muted,
  },
];

const DEP_RING3: DepNode[] = [
  {
    name: "React + Ink UI",
    desc: "\u7ec8\u7aef UI \u6e32\u67d3\u5f15\u64ce\n\u57fa\u4e8e React \u7684 CLI \u754c\u9762",
    color: C.blue,
  },
  {
    name: "Commander CLI",
    desc: "CLI \u53c2\u6570\u89e3\u6790\u6846\u67b6\n30+ \u53c2\u6570\u5b9a\u4e49",
    color: C.blue,
  },
  {
    name: "GrowthBook SDK",
    desc: "Feature Flag \u8fd0\u884c\u65f6\n\u5206\u7fa4+\u7070\u5ea6\u8ba1\u7b97",
    color: C.amber,
  },
  {
    name: "Anthropic SDK",
    desc: "\u5b98\u65b9 API \u5ba2\u6237\u7aef\nmessages.create() \u5c01\u88c5",
    color: C.green,
  },
  {
    name: "Zod v4",
    desc: "Schema \u9a8c\u8bc1\u5e93\n\u5de5\u5177\u53c2\u6570\u6821\u9a8c",
    color: C.teal,
  },
  {
    name: "fast-glob",
    desc: "\u6587\u4ef6\u6a21\u5f0f\u5339\u914d\nGlobTool \u5e95\u5c42\u9a71\u52a8",
    color: C.muted,
  },
];

function DepRingNode({
  node,
  angle,
  radius,
  size,
}: {
  node: DepNode;
  angle: number;
  radius: number;
  size: number;
}) {
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;
  return (
    <Tooltip text={node.desc}>
      <motion.div
        whileHover={{ scale: 1.12 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{
          position: "absolute",
          left: `calc(50% + ${x}px - ${size / 2}px)`,
          top: `calc(50% + ${y}px - ${size / 2}px)`,
          width: size,
          height: size,
          borderRadius: "50%",
          background: node.bg || "#ffffff",
          border: `1.5px solid ${node.borderColor || C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          cursor: "default",
          zIndex: 10,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <span
          style={{
            fontSize: size < 55 ? "0.58rem" : "0.66rem",
            fontWeight: 600,
            color: node.color,
            lineHeight: 1.2,
            padding: 4,
            fontFamily: FONT_MONO,
          }}
        >
          {node.name}
        </span>
      </motion.div>
    </Tooltip>
  );
}

function DashedCircle({
  radius,
  color,
}: {
  radius: number;
  color: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: `calc(50% - ${radius}px)`,
        top: `calc(50% - ${radius}px)`,
        width: radius * 2,
        height: radius * 2,
        borderRadius: "50%",
        border: `1px dashed ${color}`,
        pointerEvents: "none",
      }}
    />
  );
}

function useResponsiveRadii(): {
  r1: number;
  r2: number;
  r3: number;
  centerSize: number;
  n1Size: number;
  n2Size: number;
  n3Size: number;
  containerH: number;
} {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  if (isMobile) {
    return {
      r1: 80,
      r2: 145,
      r3: 210,
      centerSize: 68,
      n1Size: 56,
      n2Size: 48,
      n3Size: 44,
      containerH: 470,
    };
  }
  return {
    r1: 120,
    r2: 215,
    r3: 310,
    centerSize: 90,
    n1Size: 72,
    n2Size: 60,
    n3Size: 52,
    containerH: 680,
  };
}

function ModuleDependencies() {
  const { r1, r2, r3, centerSize, n1Size, n2Size, n3Size, containerH } =
    useResponsiveRadii();

  const distributeAngles = (count: number, offset = -90) =>
    Array.from({ length: count }, (_, i) => offset + (360 / count) * i);

  const ring1Angles = distributeAngles(DEP_RING1.length);
  const ring2Angles = distributeAngles(DEP_RING2.length, -72);
  const ring3Angles = distributeAngles(DEP_RING3.length, -60);

  const linesSvg = (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {ring1Angles.map((angle, i) => {
        const x2 =
          Math.cos((angle * Math.PI) / 180) * (r1 - n1Size / 2);
        const y2 =
          Math.sin((angle * Math.PI) / 180) * (r1 - n1Size / 2);
        return (
          <line
            key={i}
            x1="50%"
            y1="50%"
            x2={`calc(50% + ${x2}px)`}
            y2={`calc(50% + ${y2}px)`}
            stroke={C.borderHi}
            strokeOpacity={0.6}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        );
      })}
    </svg>
  );

  return (
    <div>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: containerH,
          overflow: "hidden",
        }}
      >
        <DashedCircle radius={r1} color={C.amberBorder} />
        <DashedCircle radius={r2} color={C.greenBorder} />
        <DashedCircle radius={r3} color={C.border} />

        {linesSvg}

        <Tooltip text={DEP_CENTER.desc}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            style={{
              position: "absolute",
              left: `calc(50% - ${centerSize / 2}px)`,
              top: `calc(50% - ${centerSize / 2}px)`,
              width: centerSize,
              height: centerSize,
              borderRadius: "50%",
              background: C.purpleBg,
              border: `2px solid ${C.purpleBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 20,
              cursor: "default",
              boxShadow: "0 2px 8px rgba(124,58,237,0.10)",
            }}
          >
            <span
              style={{
                fontFamily: FONT_MONO,
                fontWeight: 700,
                fontSize: centerSize < 80 ? "0.7rem" : "0.82rem",
                color: C.purple,
              }}
            >
              query.ts
            </span>
          </motion.div>
        </Tooltip>

        {DEP_RING1.map((node, i) => (
          <DepRingNode
            key={node.name}
            node={node}
            angle={ring1Angles[i]}
            radius={r1}
            size={n1Size}
          />
        ))}

        {DEP_RING2.map((node, i) => (
          <DepRingNode
            key={node.name}
            node={node}
            angle={ring2Angles[i]}
            radius={r2}
            size={n2Size}
          />
        ))}

        {DEP_RING3.map((node, i) => (
          <DepRingNode
            key={node.name}
            node={node}
            angle={ring3Angles[i]}
            radius={r3}
            size={n3Size}
          />
        ))}

        {[
          { r: r1, label: "\u7b2c1\u5708: \u76f4\u63a5\u4f9d\u8d56", c: C.amber },
          { r: r2, label: "\u7b2c2\u5708: \u670d\u52a1\u4f9d\u8d56", c: C.green },
          { r: r3, label: "\u7b2c3\u5708: \u5916\u90e8SDK", c: C.muted },
        ].map((ring) => (
          <div
            key={ring.label}
            style={{
              position: "absolute",
              left: `calc(50% + ${ring.r - 30}px)`,
              top: "calc(50% - 10px)",
              fontSize: "0.6rem",
              fontFamily: FONT_MONO,
              color: ring.c,
              opacity: 0.7,
              whiteSpace: "nowrap",
              transform: "rotate(-15deg)",
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            {ring.label}
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "12px 16px",
          background: "#ffffff",
          borderRadius: RADIUS_SM,
          border: `1px solid ${C.border}`,
          fontSize: "0.78rem",
          color: C.dim,
          lineHeight: 1.7,
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <strong style={{ color: C.text }}>\u4f9d\u8d56\u5173\u7cfb\u8bf4\u660e\uff1a</strong>
        <span style={{ color: C.purple, fontFamily: FONT_MONO }}>query.ts</span>{" "}
        \u662f\u6574\u4e2a\u7cfb\u7edf\u7684\u5fc3\u810f\uff0c\u5b83\u76f4\u63a5\u4f9d\u8d56\u7b2c1\u5708\u7684\u56db\u4e2a\u6838\u5fc3\u6a21\u5757\uff1aTool.ts\uff08\u5de5\u5177\u8c03\u7528\uff09\u3001
        ConversationMgr\uff08\u5bf9\u8bdd\u7ba1\u7406\uff09\u3001ClaudeService\uff08API\u901a\u4fe1\uff09\u3001PermissionSys\uff08\u6743\u9650\u63a7\u5236\uff09\u3002
        \u7b2c2\u5708\u662f\u652f\u6491\u6027\u670d\u52a1\uff0c\u7b2c3\u5708\u662f\u5916\u90e8 SDK \u4f9d\u8d56\u3002
        \u8d8a\u9760\u8fd1\u4e2d\u5fc3\u7684\u6a21\u5757\u53d8\u66f4\u5f71\u54cd\u8303\u56f4\u8d8a\u5927\uff0c\u4fee\u6539 query.ts \u9700\u8981\u6700\u4e3a\u8c28\u614e\u3002
        <br />
        <span style={{ color: C.teal, fontFamily: FONT_MONO, fontSize: "0.72rem" }}>
          &#10168; \u60ac\u505c\u8282\u70b9\u67e5\u770b\u6a21\u5757\u804c\u8d23\u63cf\u8ff0
        </span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Responsive CSS (injected via <style>)                              */
/* ================================================================== */

const RESPONSIVE_CSS = `
.globalarch-flow-desktop { display: block; }
.globalarch-flow-mobile { display: none; }
@media (max-width: 768px) {
  .globalarch-flow-desktop { display: none; }
  .globalarch-flow-mobile { display: block; }
}
`;

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export default function GlobalArch() {
  const [activeTab, setActiveTab] = useState("panorama");

  const renderTab = useCallback(() => {
    switch (activeTab) {
      case "panorama":
        return <SystemPanorama />;
      case "dataflow":
        return <DataFlowPanorama />;
      case "deps":
        return <ModuleDependencies />;
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <section
      id="global-arch"
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "96px 16px",
      }}
    >
      <style>{RESPONSIVE_CSS}</style>

      <motion.div
        style={{ textAlign: "center", marginBottom: 48 }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2
          style={{
            fontSize: "clamp(1.7rem, 4vw, 2.3rem)",
            fontWeight: 800,
            color: C.text,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          {"\ud83d\uddfa\ufe0f \u5168\u5c40\u67b6\u6784\u603b\u89c8"}
        </h2>
        <p
          style={{
            marginTop: 12,
            fontSize: "0.95rem",
            color: C.dim,
            maxWidth: 580,
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.7,
          }}
        >
          \u4ece\u591a\u4e2a\u7ef4\u5ea6\u4fd1\u77b0 Claude Code 512,000+ \u884c\u4ee3\u7801\u7684\u5b8f\u89c2\u8bbe\u8ba1
        </p>
      </motion.div>

      <div style={{ marginBottom: 28 }}>
        <TabBar active={activeTab} onChange={setActiveTab} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {renderTab()}
        </motion.div>
      </AnimatePresence>

      <motion.p
        style={{
          textAlign: "center",
          marginTop: 40,
          fontSize: "0.72rem",
          color: C.muted,
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        \u6570\u636e\u6765\u6e90\uff1aClaude Code CLI \u5f00\u6e90\u4ed3\u5e93\u7ed3\u6784\u5206\u6790 \u00b7 2025 &nbsp;|&nbsp;
        \u67b6\u6784\u56fe\u57fa\u4e8e C4 Model Container \u7ea7\u522b\u8bbe\u8ba1
      </motion.p>
    </section>
  );
}
