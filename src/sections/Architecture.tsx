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
  bgTint: string;
}

/* ------------------------------------------------------------------ */
/*  Architecture Data – 4 Layers                                       */
/* ------------------------------------------------------------------ */

const layers: LayerData[] = [
  {
    id: "entry",
    icon: "🚪",
    title: "Entry Layer",
    subtitle: "入口层",
    summary: "解析 CLI 参数、初始化终端 UI、管理 50+ slash 命令",
    description:
      "入口层是用户与 Claude Code 交互的第一站。它负责解析 CLI 参数、初始化运行环境、渲染终端 UI，并管理 50+ 个 slash 命令。这一层将用户意图翻译为系统内部可执行的操作。",
    gradient: "from-blue-500 to-cyan-400",
    accentColor: "text-blue-400",
    bgTint: "bg-blue-500/5",
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
    gradient: "from-violet-500 to-purple-400",
    accentColor: "text-violet-400",
    bgTint: "bg-violet-500/5",
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
    gradient: "from-amber-500 to-orange-400",
    accentColor: "text-amber-400",
    bgTint: "bg-amber-500/5",
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
    gradient: "from-emerald-500 to-teal-400",
    accentColor: "text-emerald-400",
    bgTint: "bg-emerald-500/5",
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * index, duration: 0.35, ease: "easeOut" }}
      className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors duration-200"
    >
      <div className="flex items-start gap-3">
        {/* file icon dot */}
        <span
          className={`mt-1.5 block h-2 w-2 shrink-0 rounded-full ${accentColor.replace("text-", "bg-")}`}
        />
        <div className="min-w-0 flex-1">
          <p className={`font-mono text-sm font-semibold ${accentColor}`}>
            {file.name}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-400">
            {file.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/** Animated dashed arrow connecting two layers */
function LayerConnector() {
  return (
    <div className="flex flex-col items-center py-2 select-none">
      <motion.div
        className="flex flex-col items-center gap-0.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* dashed line segments */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-px bg-gray-500/60"
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
        {/* arrow head */}
        <motion.span
          className="text-gray-500 text-xs leading-none"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            delay: 0.9,
            ease: "easeInOut",
          }}
        >
          ▼
        </motion.span>
      </motion.div>
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
      className="h-5 w-5 text-gray-400"
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
      className={`relative overflow-hidden rounded-xl border border-white/[0.08] ${layer.bgTint} backdrop-blur-sm`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* gradient top border */}
      <div
        className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${layer.gradient}`}
      />

      {/* --- Header (always visible) --- */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-xl"
      >
        <div className="flex items-center gap-4 min-w-0">
          {/* icon */}
          <span className="text-3xl leading-none shrink-0" role="img">
            {layer.icon}
          </span>

          <div className="min-w-0">
            {/* title row */}
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="text-lg font-bold text-white">{layer.title}</h3>
              <span className="text-sm text-gray-400">({layer.subtitle})</span>
            </div>
            {/* one-line summary */}
            <p className="mt-0.5 text-sm text-gray-400 truncate max-w-xl">
              {layer.summary}
            </p>
          </div>
        </div>

        {/* right side: file count + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${layer.accentColor} bg-white/[0.06]`}
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
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-5">
              {/* full description */}
              <p className="text-sm leading-relaxed text-gray-300 border-l-2 border-white/10 pl-4">
                {layer.description}
              </p>

              {/* file cards grid */}
              <div className="grid gap-3 sm:grid-cols-2">
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
  // first layer expanded by default
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
      className="relative mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8"
    >
      {/* Section heading */}
      <motion.div
        className="mb-14 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          四层架构总览
        </h2>
        <p className="mt-3 text-base text-gray-400 max-w-2xl mx-auto">
          Claude Code CLI 源码由 4 个层次组成，从用户输入到基础设施自上而下解耦。
          点击任意层级展开查看详细文件说明。
        </p>
      </motion.div>

      {/* Layer stack */}
      <div className="flex flex-col">
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

      {/* bottom note */}
      <motion.p
        className="mt-10 text-center text-xs text-gray-500"
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
