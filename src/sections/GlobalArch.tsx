import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ================================================================== */
/*  Color Tokens & Shared Styles                                       */
/* ================================================================== */

const C = {
  bg: "#0a0a0f",
  card: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.08)",
  borderHi: "rgba(255,255,255,0.15)",
  text: "#e2e2e8",
  dim: "#9a9ab0",
  muted: "#5a5a72",
  blue: "#60a5fa",
  blueBg: "rgba(96,165,250,0.10)",
  purple: "#a78bfa",
  purpleBg: "rgba(167,139,250,0.10)",
  green: "#34d399",
  greenBg: "rgba(52,211,153,0.10)",
  amber: "#fbbf24",
  amberBg: "rgba(251,191,36,0.10)",
  red: "#f87171",
  redBg: "rgba(248,113,113,0.08)",
  cyan: "#22d3ee",
  cyanBg: "rgba(34,211,238,0.10)",
  teal: "#2dd4bf",
};

/* shared inline snippets */
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
              background: "#1a1a2e",
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
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            {text}
            {/* arrow */}
            <div
              style={{
                position: "absolute",
                bottom: -5,
                left: "50%",
                transform: "translateX(-50%) rotate(45deg)",
                width: 8,
                height: 8,
                background: "#1a1a2e",
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
  { key: "panorama", label: "系统全景架构", icon: "\ud83c\udfd7\ufe0f" },
  { key: "dataflow", label: "数据流全景", icon: "\ud83d\udd04" },
  { key: "deps", label: "模块依赖关系", icon: "\ud83d\udd78\ufe0f" },
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
        background: "rgba(255,255,255,0.03)",
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
              background: isActive
                ? "rgba(167,139,250,0.15)"
                : "transparent",
              color: isActive ? C.purple : C.dim,
              outline: isActive ? `1px solid rgba(167,139,250,0.3)` : "none",
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
/*  DIAGRAM 1 \u2014 System Panorama Architecture                           */
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
    label: "用户交互层",
    labelEn: "User Interface",
    color: C.blue,
    bg: C.blueBg,
    borderColor: "rgba(96,165,250,0.25)",
    components: [
      {
        name: "Terminal (REPL)",
        icon: "\ud83d\udcbb",
        desc: "交互式终端，基于 React+Ink 渲染，支持 Vim 模式、Tab 补全、语法高亮",
      },
      {
        name: "VS Code Extension",
        icon: "\ud83d\udd2e",
        desc: "VS Code 集成扩展，通过 IPC 与核心引擎通信，提供侧边栏 Chat 面板",
      },
      {
        name: "JetBrains Plugin",
        icon: "\ud83e\udde9",
        desc: "JetBrains IDE 插件，嵌入 Claude Code 功能到 IntelliJ 系列 IDE",
      },
      {
        name: "CI/CD (Headless)",
        icon: "\u26a1",
        desc: "无头模式用于 CI/CD 管道，通过 --print 参数单次执行，退出码传递结果",
      },
    ],
  },
  {
    id: "core",
    label: "核心引擎层",
    labelEn: "Core Engine",
    color: C.purple,
    bg: C.purpleBg,
    borderColor: "rgba(167,139,250,0.25)",
    components: [
      {
        name: "CLI Parser",
        icon: "\ud83d\udccb",
        desc: "Commander.js 解析 30+ CLI 参数：--model, --permission-mode, --allowedTools 等",
      },
      {
        name: "REPL Engine",
        icon: "\ud83d\udd01",
        desc: "React+Ink 驱动的读取-求值-输出循环，管理用户输入\u2192AI响应\u2192工具执行流程",
      },
      {
        name: "Command Router",
        icon: "\ud83d\uddc2\ufe0f",
        desc: "80+ slash 命令的路由分发器，支持前缀匹配、参数解析和 Tab 补全",
      },
    ],
    extras: [
      {
        label: "Query Engine (query.ts + QueryEngine.ts)",
        desc: "核心查询引擎：消息构建 \u2192 API调用 \u2192 流式响应 \u2192 工具编排 \u2192 循环迭代，驱动整个 AI 交互循环",
        color: C.purple,
      },
    ],
  },
  {
    id: "tools",
    label: "工具执行层",
    labelEn: "Tool Execution",
    color: C.amber,
    bg: C.amberBg,
    borderColor: "rgba(251,191,36,0.25)",
    components: [
      {
        name: "File Tools",
        icon: "\ud83d\udcc4",
        desc: "Read/Write/Edit/Glob/Grep 文件操作工具集，支持 .gitignore 感知",
      },
      {
        name: "Search Tools",
        icon: "\ud83d\udd0d",
        desc: "GrepTool(ripgrep) + GlobTool(fast-glob) + FindTool 三件套",
      },
      {
        name: "Bash Tool",
        icon: "\ud83d\udda5\ufe0f",
        desc: "隔离 Shell 环境执行命令，120s 超时，stdout/stderr 分离",
      },
      {
        name: "Git Tools",
        icon: "\ud83d\udcca",
        desc: "GitLog/GitDiff/GitCommit/GitStatus 封装，Conventional Commits 支持",
      },
      {
        name: "Web Tools",
        icon: "\ud83c\udf10",
        desc: "WebFetch 抓取网页内容，HTML\u2192Markdown 转换节省 token",
      },
    ],
    extras: [
      {
        label: "Permission System (4-level modes)",
        desc: "四级权限模式: default \u2192 cautious \u2192 strict \u2192 bypass，控制工具执行的安全边界",
        color: C.amber,
      },
      {
        label: "MCP Dynamic Tools (外部工具扩展)",
        desc: "通过 MCP 协议动态发现和加载外部工具，支持 stdio/SSE 两种传输",
        color: C.cyan,
      },
    ],
  },
  {
    id: "infra",
    label: "基础服务层",
    labelEn: "Infrastructure",
    color: C.green,
    bg: C.greenBg,
    borderColor: "rgba(52,211,153,0.25)",
    components: [
      {
        name: "Anthropic SDK",
        icon: "\ud83e\udd16",
        desc: "封装 @anthropic-ai/sdk，管理 API Key 轮换、请求队列、速率限制、自动重试",
      },
      {
        name: "MCP Client",
        icon: "\ud83d\udd0c",
        desc: "MCP 客户端，管理多服务器生命周期：启动/发现/调用/重连/关闭",
      },
      {
        name: "Auth Service",
        icon: "\ud83d\udd10",
        desc: "OAuth 2.0 + PKCE 认证，JWT 解析/刷新，多租户 API Key 管理",
      },
      {
        name: "Telemetry (OTel)",
        icon: "\ud83d\udce1",
        desc: "OpenTelemetry 集成，Tracer/Meter/Logger，追踪每个工具调用和 API 请求",
      },
      {
        name: "Config Svc",
        icon: "\u2699\ufe0f",
        desc: "3层配置合并: 全局\u2192项目\u2192会话，支持 GrowthBook Feature Flags 远程配置",
      },
    ],
  },
];

/* connector arrow drawn with CSS */
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
          background: `linear-gradient(to bottom, ${color}44, ${color}aa)`,
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
          borderTop: `6px solid ${color}aa`,
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
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${C.border}`,
          borderRadius: RADIUS_SM,
          padding: "10px 14px",
          cursor: "default",
          minWidth: 110,
          textAlign: "center",
          transition: TRANSITION_FAST,
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
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${C.border}`,
          borderRadius: RADIUS_SM,
          padding: "10px 16px",
          cursor: "default",
          textAlign: "center",
          borderLeft: `3px solid ${extra.color}`,
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
      initial={{ opacity: 0, y: 24 }}
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
      {/* top gradient line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${layer.color}, transparent)`,
        }}
      />
      {/* layer label */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
          background: "rgba(0,0,0,0.3)",
          borderRadius: 6,
          padding: "4px 12px",
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
      {/* component cards grid */}
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
      {/* extra bar (e.g. Query Engine) */}
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
      {/* Annotation */}
      <div
        style={{
          marginTop: 20,
          padding: "12px 16px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: RADIUS_SM,
          border: `1px solid ${C.border}`,
          fontSize: "0.78rem",
          color: C.muted,
          lineHeight: 1.7,
        }}
      >
        <strong style={{ color: C.dim }}>架构说明：</strong>
        Claude Code 采用经典的分层架构（Layered Architecture），每一层只依赖其下方的层。
        用户交互层通过 IPC/stdio 与核心引擎通信；核心引擎通过标准化接口调用工具层；
        工具层和核心层共同依赖底部的基础服务层提供 API 通信、认证、配置和遥测能力。
        这种设计使得替换任何一层（如添加新的 IDE 集成）不会影响其他层。
        <br />
        <span style={{ color: C.purple, fontFamily: FONT_MONO, fontSize: "0.72rem" }}>
          \u27a8 鼠标悬停各组件可查看详细描述
        </span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  DIAGRAM 2 \u2014 Data Flow Panorama                                     */
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
    label: "用户输入",
    icon: "\u2328\ufe0f",
    desc: "终端/IDE 中输入自然语言指令或 slash 命令",
    color: C.blue,
  },
  {
    id: "cli",
    label: "CLI 解析",
    icon: "\ud83d\udccb",
    desc: "Commander.js 解析参数，区分 slash 命令与自然语言",
    color: C.blue,
  },
  {
    id: "router",
    label: "命令路由",
    icon: "\ud83d\uddc2\ufe0f",
    desc: "commandRouter 分发到对应处理器或进入 AI 对话流程",
    color: C.blue,
  },
  {
    id: "query",
    label: "查询引擎",
    icon: "\u26a1",
    desc: "query.ts 核心循环: 构建消息 \u2192 调用 API \u2192 解析响应 \u2192 编排工具调用",
    color: C.purple,
    highlight: true,
  },
  {
    id: "api",
    label: "API 请求",
    icon: "\ud83d\udce1",
    desc: "Anthropic SDK 构建请求体，附加系统提示词、工具定义、对话历史",
    color: C.purple,
  },
  {
    id: "claude",
    label: "Claude API",
    icon: "\ud83e\udd16",
    desc: "Anthropic 云端推理，返回文本和 tool_use 块的流式 SSE 响应",
    color: C.green,
  },
];

const FLOW_BOTTOM: FlowNode[] = [
  {
    id: "stream",
    label: "流式响应",
    icon: "\ud83d\udce5",
    desc: "SSE 逐 chunk 接收，实时解析 content_block_delta 和 tool_use 事件",
    color: C.green,
  },
  {
    id: "perm",
    label: "权限检查",
    icon: "\ud83d\udd12",
    desc: "检查工具的安全元数据(isDestructive/needsPermissions)，按模式决定是否放行",
    color: C.red,
    highlight: true,
  },
  {
    id: "exec",
    label: "工具执行",
    icon: "\ud83d\udd27",
    desc: "Zod 校验参数 \u2192 调用 tool.execute() \u2192 捕获 stdout/stderr \u2192 封装 tool_result",
    color: C.amber,
  },
  {
    id: "merge",
    label: "结果整合",
    icon: "\ud83d\udd00",
    desc: "将 tool_result 追加到消息历史，决定是否继续循环（有 tool_use 则循环）",
    color: C.amber,
  },
  {
    id: "render",
    label: "渲染输出",
    icon: "\ud83c\udfa8",
    desc: "React+Ink 实时渲染 Markdown 文本、代码块、diff 视图到终端",
    color: C.blue,
  },
  {
    id: "output",
    label: "最终输出",
    icon: "\u2705",
    desc: "用户看到格式化的 AI 回复，包含文本、代码变更、工具执行结果",
    color: C.blue,
  },
];

function FlowNodeBox({
  node,
  isLast,
  direction,
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
        flexDirection: direction === "right" ? "row" : "row",
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
          background: node.highlight
            ? `${node.color}18`
            : "rgba(255,255,255,0.04)",
          border: `1px solid ${node.highlight ? node.color + "50" : C.border}`,
          borderRadius: RADIUS_SM,
          padding: "12px 14px",
          minWidth: 90,
          textAlign: "center",
          cursor: "default",
          boxShadow: node.highlight
            ? `0 0 20px ${node.color}15`
            : "none",
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
        {/* hover detail panel */}
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
                background: "#13132a",
                border: `1px solid ${C.borderHi}`,
                borderRadius: RADIUS_SM,
                padding: "8px 12px",
                fontSize: "0.74rem",
                color: C.dim,
                lineHeight: 1.6,
                width: "max-content",
                maxWidth: 220,
                zIndex: 40,
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                pointerEvents: "none",
              }}
            >
              {node.desc}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* arrow between nodes */}
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
              background: `linear-gradient(90deg, ${node.color}66, ${node.color}33)`,
            }}
          />
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "4px solid transparent",
              borderBottom: "4px solid transparent",
              borderLeft: `5px solid ${node.color}66`,
            }}
          />
        </div>
      )}
    </div>
  );
}

/* vertical turn arrow */
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
      {/* left: up arrow (return) */}
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderBottom: `6px solid ${C.blue}66`,
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
      {/* right: down arrow (forward) */}
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
            borderTop: `6px solid ${C.green}66`,
          }}
        />
      </div>
      {/* center label */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "0.68rem",
          fontFamily: FONT_MONO,
          color: C.muted,
          background: C.bg,
          padding: "2px 10px",
          borderRadius: 4,
          border: `1px solid ${C.border}`,
        }}
      >
        \u21bb tool_use loop
      </div>
    </div>
  );
}

function DataFlowPanorama() {
  return (
    <div>
      {/* Desktop: horizontal layout */}
      <div className="globalarch-flow-desktop">
        {/* Top row: left \u2192 right */}
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
        {/* Bottom row: right \u2192 left (reversed array for visual) */}
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

      {/* Mobile: vertical layout */}
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
              {/* separator between top/bottom groups */}
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
                  \u21bb tool_use loop \u21bb
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* annotation */}
      <div
        style={{
          marginTop: 20,
          padding: "12px 16px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: RADIUS_SM,
          border: `1px solid ${C.border}`,
          fontSize: "0.78rem",
          color: C.muted,
          lineHeight: 1.7,
        }}
      >
        <strong style={{ color: C.dim }}>数据流说明：</strong>
        每条用户请求经过 CLI 解析和命令路由后进入查询引擎（
        <span style={{ color: C.purple }}>核心循环</span>
        ）。查询引擎构建 API 请求发送到 Claude，Claude 返回流式响应。
        如果响应中包含 tool_use 块，系统先执行
        <span style={{ color: C.red }}> 权限检查</span>
        ，再调用对应工具，将 tool_result 追加到消息历史后重新进入 API 循环。
        这个 tool_use \u2192 tool_result 的循环会持续到 Claude 返回纯文本回复为止。
        <br />
        <span style={{ color: C.amber, fontFamily: FONT_MONO, fontSize: "0.72rem" }}>
          \u27a8 高亮节点为关键瓶颈点，悬停查看详情
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
        background: node.highlight
          ? `${node.color}15`
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${node.highlight ? node.color + "40" : C.border}`,
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
/*  DIAGRAM 3 \u2014 Module Dependencies (Concentric Circles)               */
/* ================================================================== */

interface DepNode {
  name: string;
  desc: string;
  color: string;
}

const DEP_CENTER: DepNode = {
  name: "query.ts",
  desc: "核心查询引擎\nAI 交互循环的心脏\n消息构建\u2192API调用\u2192流式响应\u2192工具编排",
  color: C.purple,
};

const DEP_RING1: DepNode[] = [
  {
    name: "Tool.ts",
    desc: "工具基类，40+ 工具的统一接口\nZod Schema 验证 + 安全元数据声明",
    color: C.amber,
  },
  {
    name: "ConversationMgr",
    desc: "对话历史管理器\n上下文压缩(compact)、持久化存储、多会话切换",
    color: C.blue,
  },
  {
    name: "ClaudeService",
    desc: "Anthropic API 客户端\n流式SSE、自动重试、Token计数",
    color: C.green,
  },
  {
    name: "PermissionSys",
    desc: "四级权限系统\ndefault\u2192cautious\u2192strict\u2192bypass",
    color: C.red,
  },
];

const DEP_RING2: DepNode[] = [
  {
    name: "MCP Client",
    desc: "外部工具协议客户端\nstdio/SSE 传输",
    color: C.cyan,
  },
  {
    name: "Auth Service",
    desc: "OAuth2.0+PKCE\nJWT刷新、API Key管理",
    color: C.red,
  },
  {
    name: "Telemetry",
    desc: "OpenTelemetry\nTracer/Meter/Logger",
    color: C.green,
  },
  {
    name: "Feature Flags",
    desc: "GrowthBook SDK\n远程配置+灰度发布",
    color: C.amber,
  },
  {
    name: "Config",
    desc: "3层配置合并\n全局\u2192项目\u2192会话",
    color: C.dim,
  },
];

const DEP_RING3: DepNode[] = [
  {
    name: "React + Ink UI",
    desc: "终端 UI 渲染引擎\n基于 React 的 CLI 界面",
    color: C.blue,
  },
  {
    name: "Commander CLI",
    desc: "CLI 参数解析框架\n30+ 参数定义",
    color: C.blue,
  },
  {
    name: "GrowthBook SDK",
    desc: "Feature Flag 运行时\n分群+灰度计算",
    color: C.amber,
  },
  {
    name: "Anthropic SDK",
    desc: "官方 API 客户端\nmessages.create() 封装",
    color: C.green,
  },
  {
    name: "Zod v4",
    desc: "Schema 验证库\n工具参数校验",
    color: C.teal,
  },
  {
    name: "fast-glob",
    desc: "文件模式匹配\nGlobTool 底层驱动",
    color: C.dim,
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
          background: `${node.color}18`,
          border: `1.5px solid ${node.color}50`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          cursor: "default",
          zIndex: 10,
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
        border: `1px dashed ${color}30`,
        pointerEvents: "none",
      }}
    />
  );
}

/* responsive radii hook */
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
  /* We use a simple check via the global and fall back to \"desktop\" */
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

  /* SVG lines from center to ring1 */
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
            stroke={DEP_RING1[i].color}
            strokeOpacity={0.2}
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
        {/* dashed orbit circles */}
        <DashedCircle radius={r1} color={C.amber} />
        <DashedCircle radius={r2} color={C.green} />
        <DashedCircle radius={r3} color={C.dim} />

        {linesSvg}

        {/* center node */}
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
              background: `radial-gradient(circle at 40% 40%, ${C.purple}30, ${C.purple}10)`,
              border: `2px solid ${C.purple}60`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 20,
              cursor: "default",
              boxShadow: `0 0 30px ${C.purple}20`,
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

        {/* Ring 1 */}
        {DEP_RING1.map((node, i) => (
          <DepRingNode
            key={node.name}
            node={node}
            angle={ring1Angles[i]}
            radius={r1}
            size={n1Size}
          />
        ))}

        {/* Ring 2 */}
        {DEP_RING2.map((node, i) => (
          <DepRingNode
            key={node.name}
            node={node}
            angle={ring2Angles[i]}
            radius={r2}
            size={n2Size}
          />
        ))}

        {/* Ring 3 */}
        {DEP_RING3.map((node, i) => (
          <DepRingNode
            key={node.name}
            node={node}
            angle={ring3Angles[i]}
            radius={r3}
            size={n3Size}
          />
        ))}

        {/* ring labels */}
        {[
          { r: r1, label: "第1圈: 直接依赖", c: C.amber },
          { r: r2, label: "第2圈: 服务依赖", c: C.green },
          { r: r3, label: "第3圈: 外部SDK", c: C.dim },
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
              opacity: 0.6,
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

      {/* annotation */}
      <div
        style={{
          marginTop: 16,
          padding: "12px 16px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: RADIUS_SM,
          border: `1px solid ${C.border}`,
          fontSize: "0.78rem",
          color: C.muted,
          lineHeight: 1.7,
        }}
      >
        <strong style={{ color: C.dim }}>依赖关系说明：</strong>
        <span style={{ color: C.purple, fontFamily: FONT_MONO }}>query.ts</span>{" "}
        是整个系统的心脏，它直接依赖第1圈的四个核心模块：Tool.ts（工具调用）、
        ConversationMgr（对话管理）、ClaudeService（API通信）、PermissionSys（权限控制）。
        第2圈是支撑性服务，第3圈是外部 SDK 依赖。
        越靠近中心的模块变更影响范围越大，修改 query.ts 需要最为谨慎。
        <br />
        <span style={{ color: C.teal, fontFamily: FONT_MONO, fontSize: "0.72rem" }}>
          \u27a8 悬停节点查看模块职责描述
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
      {/* Inject responsive CSS */}
      <style>{RESPONSIVE_CSS}</style>

      {/* Header */}
      <motion.div
        style={{ textAlign: "center", marginBottom: 48 }}
        initial={{ opacity: 0, y: 20 }}
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
          {"\ud83d\uddfa\ufe0f 全局架构总览"}
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
          从多个维度俯瞰 Claude Code 512,000+ 行代码的宏观设计
        </p>
      </motion.div>

      {/* Tab Bar */}
      <div style={{ marginBottom: 28 }}>
        <TabBar active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          {renderTab()}
        </motion.div>
      </AnimatePresence>

      {/* bottom note */}
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
        数据来源：Claude Code CLI 开源仓库结构分析 \u00b7 2025 \u00a0|\u00a0
        架构图基于 C4 Model Container 级别设计
      </motion.p>
    </section>
  );
}
