import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FileInfo {
  name: string;
  description: string;
}

interface LayerData {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  summary: string;
  description: string;
  files: FileInfo[];
  gradient: string;
  accentColor: string;
  lightBg: string;
  borderColor: string;
}

/* ------------------------------------------------------------------ */
/*  Architecture Data – 4 Layers                                       */
/* ------------------------------------------------------------------ */

const layers: LayerData[] = [
  {
    id: "entry",
    icon: "🛏",
    title: "Entry Layer",
    subtitle: "入口层",
    summary: "解析 CLI 参数、初始化终端 UI、管理 50+ slash 命令",
    description:
      "入口层是用户与 Claude Code 交互的第一站。它负责解析 CLI 参数、初始化运行环境、渲染终端 UI，并管理 50+ 个 slash 命令。这一层将用户意图翻译为系统内部可执行的操作。",
    gradient: "linear-gradient(to right, #60a5fa, #38bdf8)",
    accentColor: "#3b82f6",
    lightBg: "#eff6ff",
    borderColor: "#bfdbfe",
    files: [
      {
        name: "cli.ts",
        description:
          "CLI 入口点，使用 Commander.js 解析 --model, --allowedTools, --permission-mode, --print, --verbose 等参数。设置全局配置，初始化日志系统，处理 --help/--version 快速退出路径。",
      },
      {
        name: "main.tsx (803KB)",
        description:
          "主入口文件，包含完整的应用启动逻辑。初始化 React+Ink 渲染引擎，设置全局错误处理(uncaughtException/unhandledRejection)，注册 SIGINT/SIGTERM 信号处理器实现优雅退出。",
      },
      {
        name: "REPL.tsx",
        description:
          "交互式读取-求值-输出循环。管理用户输入→AI响应→工具执行的核心循环，维护对话上下文，处理多轮交互，支持命令补全和历史回溯。",
      },
      {
        name: "commands/*.ts",
        description:
          "50+ 个 slash 命令实现，包括 /help, /clear, /model, /config, /compact, /permissions, /tools, /mcp 等。每个命令定义 name, aliases, description, execute 方法。",
      },
    ],
  },
  {
    id: "session",
    icon: "🧠",
    title: "Session Layer",
    subtitle: "会话层",
    summary: "管理 Claude API 交互循环、流式响应与 Token 统计",
    description:
      "会话层是整个系统的「大脑」，负责管理与 Claude API 的交互循环。它处理消息的构建、流式响应的接收与解析、工具调用的编排、Token 消耗的统计。这一层实现了 Claude Code 最核心的 AI 对话能力。",
    gradient: "linear-gradient(to right, #a78bfa, #c084fc)",
    accentColor: "#7c3aed",
    lightBg: "#f5f3ff",
    borderColor: "#ddd6fe",
    files: [
      {
        name: "query.ts (68KB)",
        description:
          "核心查询引擎，与 Claude API 的交互循环核心。实现消息构建(系统提示词+用户输入+工具结果)、AsyncGenerator 流式响应处理、tool_use 块检测与工具调用编排、Token 计数和成本实时计算。",
      },
      {
        name: "QueryEngine.ts (46KB)",
        description:
          "查询引擎抽象层，定义 API 交互的标准接口 IQueryEngine。实现请求重试、超时控制、错误分类处理。虽然当前仅适配 Claude，但架构支持多 AI 提供商扩展。",
      },
      {
        name: "ConversationManager.ts",
        description:
          "对话历史管理器，负责消息的 compact(压缩)操作——当上下文窗口即将超限时，自动对早期消息进行摘要压缩。支持对话的持久化存储和恢复。",
      },
      {
        name: "MessageHistory.ts",
        description:
          "消息历史存储引擎，支持多会话管理和切换。实现消息的序列化/反序列化，维护对话的元数据(创建时间、Token 总量、工具调用次数)。",
      },
    ],
  },
  {
    id: "tools",
    icon: "🔧",
    title: "Tools / Tasks Layer",
    subtitle: "工具任务层",
    summary: "40+ 内置工具 + 动态 MCP 工具，标准化 Schema 与并发调度",
    description:
      "工具任务层是 Claude Code 的「手脚」，提供了 40+ 个内置工具和动态 MCP 工具。每个工具都有标准化的输入 Schema(Zod v4)、权限检查、执行逻辑和结果格式化。TaskRunner 管理多工具的并发执行和优先级调度。",
    gradient: "linear-gradient(to right, #fbbf24, #f59e0b)",
    accentColor: "#d97706",
    lightBg: "#fffbeb",
    borderColor: "#fde68a",
    files: [
      {
        name: "Tool.ts (29KB)",
        description:
          "工具基类定义，使用 Zod v4 定义 inputSchema/outputSchema。实现工具注册、参数验证、权限检查、执行追踪、结果序列化的完整生命周期。所有内置工具和 MCP 工具都继承此基类。",
      },
      {
        name: "文件操作工具",
        description:
          "Read, Write, Edit, MultiEdit, Create, Move, Delete, ListFiles 共 8 个工具，覆盖完整的文件系统操作。Edit 工具使用精确的行号定位和 diff 应用。",
      },
      {
        name: "搜索工具",
        description:
          "GrepTool(基于 ripgrep 的正则搜索)、GlobTool(文件模式匹配)、FindTool(递归文件查找)，支持 .gitignore 感知。",
      },
      {
        name: "执行工具",
        description:
          "BashTool(shell 命令执行，带超时和沙箱)、SubProcessTool(长运行子进程管理)。",
      },
      {
        name: "Git 工具",
        description:
          "GitLog, GitDiff, GitCommit, GitStatus 4 个工具，封装 git CLI 命令。",
      },
      {
        name: "TaskRunner.ts",
        description:
          "并行任务执行器，管理多工具并发。实现优先级队列、超时控制、错误隔离，确保单个工具失败不影响其他并行任务。",
      },
    ],
  },
  {
    id: "infra",
    icon: "⚙️",
    title: "Infrastructure Layer",
    subtitle: "基础设施层",
    summary: "API 通信、认证授权、MCP 协议、功能开关、可观测性",
    description:
      "基础设施层提供所有上层模块依赖的基础服务。包括 API 通信、认证授权、MCP 协议、功能开关、可观测性等核心能力。这些服务以单例模式运行，通过延迟初始化优化启动性能。",
    gradient: "linear-gradient(to right, #34d399, #2dd4bf)",
    accentColor: "#059669",
    lightBg: "#ecfdf5",
    borderColor: "#a7f3d0",
    files: [
      {
        name: "services/claude.ts",
        description:
          "Anthropic API 客户端封装，管理 API Key 轮换、请求队列、速率限制(429处理)、自动重试(指数退避)、流式 SSE 连接池。",
      },
      {
        name: "services/mcpClient.ts",
        description:
          "MCP 客户端实现，支持 stdio 和 SSE 两种传输协议。管理多个 MCP 服务器的生命周期，实现工具动态发现、调用代理和结果转换。",
      },
      {
        name: "services/auth.ts",
        description:
          "OAuth 2.0 认证模块，处理授权码流程(PKCE)、JWT Token 解析和自动刷新、多租户 API Key 管理。",
      },
      {
        name: "services/featureFlags.ts",
        description:
          "GrowthBook Feature Flag 客户端，远程配置拉取、本地文件缓存、定时刷新。支持用户分群和灰度百分比计算。",
      },
      {
        name: "services/telemetry.ts",
        description:
          "OpenTelemetry 集成，配置 Tracer/Meter/Logger，创建 Span 追踪每个工具调用和 API 请求，上报性能指标。",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

/** A single file-description card inside an expanded layer */
function FileCard({
  file,
  accentColor,
  index,
}: {
  file: FileInfo;
  accentColor: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * index, duration: 0.35, ease: "easeOut" }}
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: "10px",
        padding: "16px",
        transition: "box-shadow 0.2s ease",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 4px 12px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 1px 3px rgba(0,0,0,0.04)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <span
          style={{
            marginTop: "6px",
            display: "block",
            height: "8px",
            width: "8px",
            flexShrink: 0,
            borderRadius: "50%",
            background: accentColor,
          }}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: accentColor,
              margin: 0,
            }}
          >
            {file.name}
          </p>
          <p
            style={{
              marginTop: "4px",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              color: "#475569",
              margin: "4px 0 0 0",
            }}
          >
            {file.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/** Static dashed connector between two layers */
function LayerConnector() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "8px 0",
        userSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: "6px",
              width: "2px",
              background: "#cbd5e1",
              borderRadius: "1px",
            }}
          />
        ))}
        <span
          style={{
            color: "#94a3b8",
            fontSize: "0.75rem",
            lineHeight: 1,
          }}
        >
          &#9660;
        </span>
      </div>
    </div>
  );
}

/** Chevron icon that rotates when expanded */
function Chevron({ open }: { open: boolean }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      style={{ height: "20px", width: "20px", color: "#94a3b8" }}
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.25 }}
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </motion.svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Layer Card                                                         */
/* ------------------------------------------------------------------ */

function LayerCard({
  layer,
  isOpen,
  onToggle,
}: {
  layer: LayerData;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      layout
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        marginBottom: "0px",
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* gradient top border */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "3px",
          background: layer.gradient,
        }}
      />

      {/* --- Header (always visible) --- */}
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "20px 24px",
          textAlign: "left",
          cursor: "pointer",
          background: "none",
          border: "none",
          outline: "none",
          borderRadius: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: "2rem",
              lineHeight: 1,
              flexShrink: 0,
            }}
            role="img"
          >
            {layer.icon}
          </span>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "baseline",
                gap: "8px",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                {layer.title}
              </h3>
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "#94a3b8",
                }}
              >
                ({layer.subtitle})
              </span>
            </div>
            <p
              style={{
                marginTop: "2px",
                fontSize: "0.875rem",
                color: "#64748b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "36rem",
                margin: "2px 0 0 0",
              }}
            >
              {layer.summary}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "9999px",
              padding: "2px 10px",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: layer.accentColor,
              background: layer.lightBg,
              border: `1px solid ${layer.borderColor}`,
            }}
          >
            {layer.files.length} 项
          </span>
          <Chevron open={isOpen} />
        </div>
      </button>

      {/* --- Expandable body --- */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.section
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "0 24px 24px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <p
                style={{
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                  color: "#475569",
                  borderLeft: `3px solid ${layer.borderColor}`,
                  paddingLeft: "16px",
                  margin: 0,
                  background: layer.lightBg,
                  borderRadius: "0 8px 8px 0",
                  padding: "12px 16px",
                }}
              >
                {layer.description}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "12px",
                }}
              >
                {layer.files.map((f, i) => (
                  <FileCard
                    key={f.name}
                    file={f}
                    accentColor={layer.accentColor}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Architecture() {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set([layers[0].id]),
  );

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  return (
    <section
      id="architecture"
      style={{
        position: "relative",
        maxWidth: "56rem",
        margin: "0 auto",
        padding: "96px 16px",
      }}
    >
      <motion.div
        style={{ marginBottom: "56px", textAlign: "center" }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2
          className="section-title"
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: "#0f172a",
            margin: 0,
          }}
        >
          四层架构总览
        </h2>
        <p
          className="section-subtitle"
          style={{
            marginTop: "12px",
            fontSize: "1rem",
            color: "#64748b",
            maxWidth: "42rem",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Claude Code CLI 源码由 4 个层次组成，从用户输入到基础设施自上而下解耦。
          点击任意层级展开查看详细文件说明。
        </p>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {layers.map((layer, idx) => (
          <div key={layer.id}>
            <LayerCard
              layer={layer}
              isOpen={openIds.has(layer.id)}
              onToggle={() => toggle(layer.id)}
            />
            {idx < layers.length - 1 && <LayerConnector />}
          </div>
        ))}
      </div>

      <motion.p
        style={{
          marginTop: "40px",
          textAlign: "center",
          fontSize: "0.75rem",
          color: "#94a3b8",
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        数据来源：Claude Code CLI 开源仓库结构分析 · 2025
      </motion.p>
    </section>
  );
}
