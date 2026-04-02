"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface Participant {
  id: string;
  label: string;
  icon: string;
  color: string;
}

interface Message {
  from: number;       // participant index
  to: number;         // participant index
  label: string;
  dashed?: boolean;   // return / async arrow
  detail: string;
  sourceFile: string;
  dataFormat?: string;
}

interface LoopBlock {
  startMsg: number;   // message index (inclusive)
  endMsg: number;     // message index (inclusive)
  label: string;
  color: string;
}

interface SequenceTab {
  key: string;
  tabLabel: string;
  tabIcon: string;
  title: string;
  accentFrom: string;
  accentTo: string;
  participants: Participant[];
  messages: Message[];
  loops?: LoopBlock[];
}

/* ================================================================== */
/*  Diagram Data                                                       */
/* ================================================================== */

const TABS: SequenceTab[] = [
  /* ------ Tab 1: Main Conversation Loop ------ */
  {
    key: "main-loop",
    tabLabel: "对话主循环",
    tabIcon: "💬",
    title: "Main Conversation Loop",
    accentFrom: "#6366f1",
    accentTo: "#06b6d4",
    participants: [
      { id: "user", label: "User", icon: "👤", color: "#6366f1" },
      { id: "repl", label: "REPL", icon: "⌘", color: "#8b5cf6" },
      { id: "qe", label: "QueryEngine", icon: "⚡", color: "#06b6d4" },
      { id: "api", label: "ClaudeAPI", icon: "🤖", color: "#f59e0b" },
      { id: "tools", label: "ToolSystem", icon: "🧰", color: "#10b981" },
      { id: "perm", label: "PermissionSys", icon: "🛡", color: "#ef4444" },
    ],
    messages: [
      {
        from: 0, to: 1, label: "输入文本",
        detail: "用户在终端键入文本后按下回车，REPL 通过 readline 接口捕获完整输入行。支持多行编辑、历史回溯和 Tab 补全。",
        sourceFile: "REPL.tsx",
        dataFormat: "string (raw user input)",
      },
      {
        from: 1, to: 2, label: "构建消息",
        detail: "REPL 将原始输入封装为 Message 对象，附加系统提示词、工具描述和完整对话历史。若上下文接近 token 限制，则触发 compact 压缩。",
        sourceFile: "ConversationManager.ts",
        dataFormat: "Message[] (conversation history + system prompt)",
      },
      {
        from: 2, to: 3, label: "stream()",
        detail: "QueryEngine 通过 Anthropic SDK 发起流式 API 请求，携带 model、max_tokens、temperature 等参数以及完整可用工具的 JSON Schema 列表。",
        sourceFile: "query.ts",
        dataFormat: "CreateMessageParams { model, messages, tools, stream: true }",
      },
      {
        from: 3, to: 2, label: "text_delta", dashed: true,
        detail: "API 以 SSE 流方式返回 text delta 事件，每个 chunk 包含一小段生成文本。QueryEngine 的 AsyncGenerator 逐 chunk 解析并立即 yield。",
        sourceFile: "Anthropic SSE stream",
        dataFormat: "content_block_delta { type: 'text_delta', text: string }",
      },
      {
        from: 2, to: 1, label: "yield 文本", dashed: true,
        detail: "QueryEngine 将收到的 text delta 通过 AsyncGenerator yield 传递给 REPL，由 React+Ink 框架实时渲染到终端。",
        sourceFile: "query.ts → AsyncGenerator",
        dataFormat: "AssistantMessage { type: 'text', content: string }",
      },
      {
        from: 1, to: 0, label: "渲染文本", dashed: true,
        detail: "REPL 将流式文本实时渲染到终端，支持 Markdown 语法高亮、代码块格式化和链接识别。实现打字机效果的流畅输出。",
        sourceFile: "React + Ink renderer",
        dataFormat: "Terminal TTY output (ANSI escape sequences)",
      },
      {
        from: 3, to: 2, label: "tool_use", dashed: true,
        detail: "当 AI 决定调用工具时，流中出现 tool_use 类型的 content block，包含工具名称和 JSON 参数。一条消息可含多个并行工具调用。",
        sourceFile: "Anthropic SSE stream",
        dataFormat: "content_block { type: 'tool_use', name: string, input: object }",
      },
      {
        from: 2, to: 5, label: "检查权限",
        detail: "QueryEngine 在执行工具前，将工具名称和参数传递给 PermissionSystem，根据当前 permission-mode 和规则列表判断是否需要用户确认。",
        sourceFile: "permissions.ts",
        dataFormat: "PermissionRequest { tool: string, args: object, mode: PermissionMode }",
      },
      {
        from: 5, to: 2, label: "允许/拒绝", dashed: true,
        detail: "PermissionSystem 返回决策结果：Allow（直接执行）、AlwaysAllow（记住并自动放行）或 Deny（拒绝并生成错误消息告知 AI）。",
        sourceFile: "permissions.ts",
        dataFormat: "PermissionResult { decision: 'allow' | 'deny', remember: boolean }",
      },
      {
        from: 2, to: 4, label: "执行工具",
        detail: "获得允许后，QueryEngine 调用 ToolSystem 执行对应工具。传入验证后的参数，设置超时计时器。通过 OpenTelemetry Span 追踪执行过程。",
        sourceFile: "tools/index.ts → Tool.execute()",
        dataFormat: "ToolInput { name: string, input: object, timeout: number }",
      },
      {
        from: 4, to: 2, label: "工具结果", dashed: true,
        detail: "工具执行完成后返回结果，包含输出内容、执行状态（成功/失败）和执行耗时。",
        sourceFile: "Tool.execute() return",
        dataFormat: "ToolResult { content: string, is_error: boolean, duration_ms: number }",
      },
      {
        from: 2, to: 3, label: "tool_result",
        detail: "将工具执行结果封装为 tool_result 消息追加到对话历史，重新发送给 Claude API，触发新一轮的流式响应（循环回到 stream）。",
        sourceFile: "query.ts",
        dataFormat: "Message { role: 'user', content: [{ type: 'tool_result', ... }] }",
      },
      {
        from: 3, to: 2, label: "最终文本", dashed: true,
        detail: "AI 根据工具结果生成最终文本回复（不再包含 tool_use），标志当前轮次对话结束。包含 message_stop 事件。",
        sourceFile: "Anthropic SSE stream",
        dataFormat: "content_block { type: 'text', text: string } + message_stop",
      },
      {
        from: 2, to: 1, label: "yield 最终输出", dashed: true,
        detail: "最终文本通过 AsyncGenerator yield 给 REPL，完成一次完整的用户交互循环。REPL 等待下一次用户输入。",
        sourceFile: "query.ts → REPL.tsx",
        dataFormat: "AssistantMessage { type: 'text', content: string, final: true }",
      },
      {
        from: 1, to: 0, label: "最终输出", dashed: true,
        detail: "REPL 渲染完整的最终响应到终端，并进入等待状态，准备接收下一次用户输入，形成完整的 REPL 循环。",
        sourceFile: "React + Ink renderer",
        dataFormat: "Terminal TTY output",
      },
    ],
    loops: [
      { startMsg: 6, endMsg: 14, label: "loop [tool_use detected]", color: "#f59e0b" },
    ],
  },

  /* ------ Tab 2: MCP Tool Lifecycle ------ */
  {
    key: "mcp-lifecycle",
    tabLabel: "MCP 工具生命周期",
    tabIcon: "🔌",
    title: "MCP Tool Lifecycle",
    accentFrom: "#8b5cf6",
    accentTo: "#ec4899",
    participants: [
      { id: "config", label: "ConfigLoader", icon: "⚙", color: "#6366f1" },
      { id: "client", label: "MCPClient", icon: "🔌", color: "#8b5cf6" },
      { id: "server", label: "MCPServer", icon: "🖥", color: "#ec4899" },
      { id: "registry", label: "ToolRegistry", icon: "📦", color: "#10b981" },
      { id: "qe", label: "QueryEngine", icon: "⚡", color: "#06b6d4" },
    ],
    messages: [
      {
        from: 0, to: 1, label: "读取配置",
        detail: "从 ~/.claude/config.json 和 .claude/config.json 加载 mcpServers 配置段，每个服务器定义 command、args、env、cwd 和传输方式（stdio/sse）。",
        sourceFile: "config.ts",
        dataFormat: "MCPServerConfig { command, args, env, transport }",
      },
      {
        from: 1, to: 2, label: "spawn / connect",
        detail: "stdio 模式：通过 child_process.spawn 启动 MCP 服务器子进程，建立 stdin/stdout JSON-RPC 通道。SSE 模式：建立 HTTP 长连接。",
        sourceFile: "mcpClient.ts",
        dataFormat: "ChildProcess (stdio) | EventSource (SSE)",
      },
      {
        from: 2, to: 1, label: "ready", dashed: true,
        detail: "MCP 服务器进程启动完成，通过 stdout 发送就绪信号或 SSE 连接成功建立，客户端确认连接可用。",
        sourceFile: "MCP Server process",
        dataFormat: "Connection established event",
      },
      {
        from: 1, to: 2, label: "initialize",
        detail: "发送 JSON-RPC initialize 请求，携带客户端协议版本和能力声明。用于协商双方支持的功能集。",
        sourceFile: "mcpClient.ts",
        dataFormat: "JSON-RPC { method: 'initialize', params: { capabilities } }",
      },
      {
        from: 2, to: 1, label: "capabilities", dashed: true,
        detail: "服务器返回支持的能力列表：工具提供(tools)、资源提供(resources)、提示模板(prompts)等。客户端据此决定可用功能。",
        sourceFile: "MCP Server",
        dataFormat: "InitializeResult { capabilities: { tools, resources, prompts } }",
      },
      {
        from: 1, to: 2, label: "tools/list",
        detail: "发送 tools/list 请求获取服务器提供的所有工具定义，包括名称、描述和 JSON Schema 格式的输入参数定义。",
        sourceFile: "mcpClient.ts",
        dataFormat: "JSON-RPC { method: 'tools/list' }",
      },
      {
        from: 2, to: 1, label: "tool_defs", dashed: true,
        detail: "服务器返回工具定义数组，每个工具包含 name、description 和 inputSchema 字段，用于后续注册和 AI 调用。",
        sourceFile: "MCP Server",
        dataFormat: "{ tools: [{ name, description, inputSchema }] }",
      },
      {
        from: 1, to: 3, label: "注册工具",
        detail: "将 MCP 工具以 'mcp__<serverName>__<toolName>' 命名规范包装为 Tool 子类，注册到全局 ToolRegistry。与内置工具共享统一接口。",
        sourceFile: "mcpClient.ts → ToolRegistry",
        dataFormat: "Tool { name: 'mcp__<server>__<tool>', execute, schema }",
      },
      {
        from: 4, to: 3, label: "请求调用工具",
        detail: "AI 响应中包含 MCP 工具的 tool_use 请求，QueryEngine 从 ToolRegistry 查找对应工具实例，触发调用流程。",
        sourceFile: "query.ts → ToolRegistry.get()",
        dataFormat: "ToolUse { name: 'mcp__server__tool', input: object }",
      },
      {
        from: 3, to: 1, label: "代理调用",
        detail: "ToolRegistry 中的 MCP 工具包装器将调用请求转发给 MCPClient，由其路由到对应的 MCP 服务器进行实际执行。",
        sourceFile: "MCPToolWrapper.execute()",
        dataFormat: "ToolCallRequest { tool_name, arguments }",
      },
      {
        from: 1, to: 2, label: "tools/call",
        detail: "MCPClient 将参数序列化为 JSON-RPC tools/call 请求，通过对应传输通道（stdio/SSE）发送给 MCP 服务器。设置超时和重试策略。",
        sourceFile: "mcpClient.ts",
        dataFormat: "JSON-RPC { method: 'tools/call', params: { name, arguments } }",
      },
      {
        from: 2, to: 1, label: "result", dashed: true,
        detail: "MCP 服务器执行工具后返回 JSON-RPC 响应，包含执行结果的 content 字段（文本或结构化数据）。",
        sourceFile: "MCP Server",
        dataFormat: "JSON-RPC { result: { content: [{ type, text }] } }",
      },
      {
        from: 1, to: 3, label: "返回结果",
        detail: "MCPClient 提取响应中的 content，转换为标准 ToolResult 格式交还给 ToolRegistry，最终传递回 QueryEngine。",
        sourceFile: "mcpClient.ts → ToolRegistry",
        dataFormat: "ToolResult { content: string, is_error: boolean }",
      },
      {
        from: 3, to: 4, label: "返回结果", dashed: true,
        detail: "ToolRegistry 将标准化的工具执行结果返回给 QueryEngine，追加到对话历史中继续对话循环。",
        sourceFile: "ToolRegistry → query.ts",
        dataFormat: "ToolResult { content, is_error, duration_ms }",
      },
    ],
    loops: [
      { startMsg: 1, endMsg: 7, label: "init [for each MCP server]", color: "#8b5cf6" },
      { startMsg: 8, endMsg: 13, label: "loop [tool invocation]", color: "#ec4899" },
    ],
  },

  /* ------ Tab 3: Permission Validation Flow ------ */
  {
    key: "perm-flow",
    tabLabel: "权限验证流程",
    tabIcon: "🛡",
    title: "Permission Validation Flow",
    accentFrom: "#ef4444",
    accentTo: "#f59e0b",
    participants: [
      { id: "ai", label: "AI (Claude)", icon: "🤖", color: "#6366f1" },
      { id: "qe", label: "QueryEngine", icon: "⚡", color: "#06b6d4" },
      { id: "perm", label: "PermEngine", icon: "🛡", color: "#ef4444" },
      { id: "rules", label: "RuleStore", icon: "📋", color: "#f59e0b" },
      { id: "user", label: "UserPrompt", icon: "👤", color: "#8b5cf6" },
    ],
    messages: [
      {
        from: 0, to: 1, label: "tool_use",
        detail: "AI 模型响应中包含 tool_use content block，指定要调用的工具名称（如 BashTool）和参数（如 command: 'npm install'）。",
        sourceFile: "Anthropic SSE stream → query.ts",
        dataFormat: "ContentBlock { type: 'tool_use', name: string, input: object }",
      },
      {
        from: 1, to: 2, label: "checkPermission",
        detail: "QueryEngine 提取工具名称和参数，构建权限检查请求，传递给 PermissionEngine 进行评估。同时传入当前 permission-mode。",
        sourceFile: "query.ts → permissions.ts",
        dataFormat: "PermCheckRequest { tool, args, mode, context }",
      },
      {
        from: 2, to: 3, label: "loadRules",
        detail: "PermissionEngine 从 RuleStore 加载项目级和全局级权限规则。规则来源包括 .claude/permissions.json、CLI 参数和会话缓存。",
        sourceFile: "permissions.ts → RuleStore",
        dataFormat: "RuleQuery { scope: 'project' | 'global' | 'session' }",
      },
      {
        from: 3, to: 2, label: "rules", dashed: true,
        detail: "RuleStore 返回按优先级排序的规则列表：blockedTools（黑名单）、allowedTools（白名单）、会话缓存的用户决策、默认规则。",
        sourceFile: "RuleStore",
        dataFormat: "Rule[] { pattern: glob, decision: 'allow' | 'deny', scope }",
      },
      {
        from: 2, to: 2, label: "evaluate",
        detail: "按优先级依次执行规则匹配：(1) 检查 blocklist — 匹配则立即拒绝；(2) 检查 allowlist — 匹配则允许；(3) 检查会话缓存 — 之前批准过的同模式操作自动放行；(4) 判断是否需要用户确认。",
        sourceFile: "permissions.ts → evaluate()",
        dataFormat: "EvalContext { rules, tool, args, cache }",
      },
      {
        from: 2, to: 4, label: "渲染确认对话框",
        detail: "当规则评估结果为 'ask' 时，PermissionEngine 请求 UserPrompt 在终端渲染权限确认对话框，显示工具名称、操作摘要和影响范围。",
        sourceFile: "permissions.ts → REPL.tsx",
        dataFormat: "PromptRequest { tool, summary, risk_level }",
      },
      {
        from: 4, to: 2, label: "用户选择", dashed: true,
        detail: "用户在终端选择：Allow（本次允许）、Always Allow（记住并总是允许该模式）或 Deny（拒绝本次操作）。选择结果返回给 PermissionEngine。",
        sourceFile: "REPL.tsx → permissions.ts",
        dataFormat: "UserDecision { choice: 'allow' | 'always_allow' | 'deny' }",
      },
      {
        from: 2, to: 1, label: "允许 / 拒绝", dashed: true,
        detail: "PermissionEngine 返回最终决策。若用户选择 Always Allow，该决策会被缓存到会话中（Fail-Closed 策略：未匹配规则默认拒绝）。",
        sourceFile: "permissions.ts",
        dataFormat: "PermResult { allowed: boolean, cached: boolean, reason: string }",
      },
      {
        from: 1, to: 0, label: "执行 / 拒绝结果", dashed: true,
        detail: "允许时 QueryEngine 执行工具并返回 tool_result；拒绝时生成错误消息告知 AI 操作被用户拒绝，AI 需寻找替代方案。",
        sourceFile: "query.ts",
        dataFormat: "ToolResult | ErrorMessage { type: 'permission_denied' }",
      },
    ],
    loops: [
      { startMsg: 2, endMsg: 4, label: "rule evaluation", color: "#ef4444" },
    ],
  },
];

/* ================================================================== */
/*  Style constants                                                    */
/* ================================================================== */

const COL_W = 140;
const ROW_H = 52;
const LIFELINE_X_OFFSET = COL_W / 2;
const HEAD_H = 70;
const MSG_LABEL_SIZE = 11.5;
const ARROW_SIZE = 6;

/* ================================================================== */
/*  Animation variants                                                 */
/* ================================================================== */

const tabContentVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
};

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

/* Participant header card */
function ParticipantHead({ p, idx }: { p: Participant; idx: number }) {
  const left = idx * COL_W;
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06, duration: 0.35 }}
      style={{
        position: "absolute",
        left,
        top: 0,
        width: COL_W,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 5,
      }}
    >
      <div
        style={{
          padding: "8px 10px",
          borderRadius: 10,
          border: `1.5px solid ${p.color}55`,
          background: `linear-gradient(145deg, ${p.color}18, ${p.color}08)`,
          textAlign: "center",
          minWidth: 90,
          maxWidth: COL_W - 12,
        }}
      >
        <div style={{ fontSize: 18, marginBottom: 2 }}>{p.icon}</div>
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: "#e2e8f0",
            letterSpacing: 0.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {p.label}
        </div>
      </div>
    </motion.div>
  );
}

/* Vertical lifeline */
function Lifeline({ idx, height, color }: { idx: number; height: number; color: string }) {
  const x = idx * COL_W + LIFELINE_X_OFFSET;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: HEAD_H,
        width: 0,
        height,
        borderLeft: `1.5px dashed ${color}30`,
        zIndex: 1,
      }}
    />
  );
}

/* Horizontal arrow message */
function ArrowMessage({
  msg,
  msgIdx,
  participants,
  hoveredMsg,
  setHoveredMsg,
}: {
  msg: Message;
  msgIdx: number;
  participants: Participant[];
  hoveredMsg: number | null;
  setHoveredMsg: (v: number | null) => void;
}) {
  const isSelf = msg.from === msg.to;
  const leftIdx = Math.min(msg.from, msg.to);
  const rightIdx = Math.max(msg.from, msg.to);
  const goesRight = msg.to > msg.from;
  const isHovered = hoveredMsg === msgIdx;

  const fromX = msg.from * COL_W + LIFELINE_X_OFFSET;
  const topY = HEAD_H + msgIdx * ROW_H + 16;

  const fromColor = participants[msg.from]?.color ?? "#6366f1";
  const toColor = participants[msg.to]?.color ?? "#06b6d4";

  /* self-message (like "evaluate") */
  if (isSelf) {
    const selfW = 48;
    const selfH = 26;
    return (
      <div
        onMouseEnter={() => setHoveredMsg(msgIdx)}
        onMouseLeave={() => setHoveredMsg(null)}
        style={{
          position: "absolute",
          left: fromX + 2,
          top: topY - 4,
          width: selfW,
          height: selfH,
          zIndex: 3,
          cursor: "pointer",
        }}
      >
        {/* self-loop path */}
        <svg
          width={selfW}
          height={selfH}
          style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
        >
          <path
            d={`M 0 0 L ${selfW} 0 L ${selfW} ${selfH} L 0 ${selfH}`}
            fill="none"
            stroke={fromColor}
            strokeWidth={1.5}
            strokeDasharray={msg.dashed ? "5,3" : "none"}
            opacity={0.7}
          />
          <polygon
            points={`0,${selfH - ARROW_SIZE} ${ARROW_SIZE},${selfH} 0,${selfH + ARROW_SIZE}`}
            fill={fromColor}
            opacity={0.8}
          />
        </svg>
        {/* label */}
        <div
          style={{
            position: "absolute",
            left: selfW + 6,
            top: selfH / 2 - 8,
            fontSize: MSG_LABEL_SIZE,
            color: isHovered ? "#f1f5f9" : "#94a3b8",
            fontWeight: 600,
            whiteSpace: "nowrap",
            transition: "color 0.15s",
          }}
        >
          {msg.label}
        </div>
        {/* tooltip */}
        {isHovered && <Tooltip msg={msg} selfMsg />}
      </div>
    );
  }

  /* Normal left-to-right or right-to-left arrow */
  const lineLeft = leftIdx * COL_W + LIFELINE_X_OFFSET;
  const lineW = (rightIdx - leftIdx) * COL_W;

  return (
    <div
      onMouseEnter={() => setHoveredMsg(msgIdx)}
      onMouseLeave={() => setHoveredMsg(null)}
      style={{
        position: "absolute",
        left: lineLeft,
        top: topY,
        width: lineW,
        height: 2,
        zIndex: 3,
        cursor: "pointer",
      }}
    >
      {/* Line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 0,
          borderTop: `1.5px ${msg.dashed ? "dashed" : "solid"} ${isHovered ? "#e2e8f0" : fromColor}88`,
          transition: "border-color 0.15s",
        }}
      />
      {/* Arrowhead */}
      <div
        style={{
          position: "absolute",
          top: -ARROW_SIZE,
          ...(goesRight
            ? { right: -1 }
            : { left: -1 }),
          width: 0,
          height: 0,
          borderTop: `${ARROW_SIZE}px solid transparent`,
          borderBottom: `${ARROW_SIZE}px solid transparent`,
          ...(goesRight
            ? { borderLeft: `${ARROW_SIZE + 2}px solid ${isHovered ? "#e2e8f0" : toColor}` }
            : { borderRight: `${ARROW_SIZE + 2}px solid ${isHovered ? "#e2e8f0" : toColor}` }),
          transition: "border-color 0.15s",
        }}
      />
      {/* Label */}
      <div
        style={{
          position: "absolute",
          top: -18,
          left: 0,
          width: "100%",
          textAlign: "center",
          fontSize: MSG_LABEL_SIZE,
          fontWeight: 600,
          color: isHovered ? "#f1f5f9" : "#cbd5e1",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          transition: "color 0.15s",
        }}
      >
        {msg.label}
      </div>
      {/* Tooltip */}
      {isHovered && <Tooltip msg={msg} />}
    </div>
  );
}

/* Tooltip panel */
function Tooltip({ msg, selfMsg }: { msg: Message; selfMsg?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        position: "absolute",
        top: selfMsg ? 34 : 10,
        left: selfMsg ? -20 : "50%",
        transform: selfMsg ? "none" : "translateX(-50%)",
        minWidth: 300,
        maxWidth: 400,
        padding: "14px 16px",
        borderRadius: 12,
        background: "rgba(15,18,32,0.97)",
        border: "1px solid rgba(148,163,184,0.18)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
        {msg.label}
      </div>
      <p style={{ fontSize: 12, lineHeight: 1.65, color: "#94a3b8", margin: "0 0 8px" }}>
        {msg.detail}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <span
          style={{
            fontSize: 10.5,
            padding: "2px 8px",
            borderRadius: 5,
            background: "rgba(139,92,246,0.18)",
            color: "#c4b5fd",
            border: "1px solid rgba(139,92,246,0.25)",
            fontFamily: "'Fira Code','JetBrains Mono',monospace",
          }}
        >
          {msg.sourceFile}
        </span>
        {msg.dataFormat && (
          <span
            style={{
              fontSize: 10.5,
              padding: "2px 8px",
              borderRadius: 5,
              background: "rgba(6,182,212,0.12)",
              color: "#67e8f9",
              border: "1px solid rgba(6,182,212,0.2)",
              fontFamily: "'Fira Code','JetBrains Mono',monospace",
            }}
          >
            {msg.dataFormat}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* Loop / alt fragment box */
function FragmentBox({ loop, totalCols }: { loop: LoopBlock; totalCols: number }) {
  const topY = HEAD_H + loop.startMsg * ROW_H - 2;
  const bottomY = HEAD_H + (loop.endMsg + 1) * ROW_H + 6;
  const h = bottomY - topY;
  return (
    <div
      style={{
        position: "absolute",
        left: -4,
        top: topY,
        width: totalCols * COL_W + 8,
        height: h,
        border: `1.5px dashed ${loop.color}44`,
        borderRadius: 8,
        zIndex: 2,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -1,
          left: -1,
          fontSize: 10,
          fontWeight: 700,
          color: loop.color,
          background: "#0a0f1e",
          padding: "2px 8px",
          borderRadius: "8px 0 6px 0",
          border: `1.5px dashed ${loop.color}44`,
          borderBottom: "none",
          borderRight: "none",
          letterSpacing: 0.3,
        }}
      >
        {loop.label}
      </div>
    </div>
  );
}

/* Single sequence diagram renderer */
function SequenceCanvas({ tab }: { tab: SequenceTab }) {
  const [hoveredMsg, setHoveredMsg] = useState<number | null>(null);
  const { participants, messages, loops } = tab;

  const totalH = HEAD_H + messages.length * ROW_H + 40;
  const totalW = participants.length * COL_W;

  return (
    <div
      style={{
        overflowX: "auto",
        overflowY: "visible",
        WebkitOverflowScrolling: "touch",
        paddingBottom: 16,
      }}
    >
      <div
        style={{
          position: "relative",
          width: totalW,
          height: totalH,
          minWidth: totalW,
          margin: "0 auto",
        }}
      >
        {/* Participant headers */}
        {participants.map((p, i) => (
          <ParticipantHead key={p.id} p={p} idx={i} />
        ))}

        {/* Lifelines */}
        {participants.map((p, i) => (
          <Lifeline key={p.id} idx={i} height={totalH - HEAD_H} color={p.color} />
        ))}

        {/* Fragment boxes (loops / alt) */}
        {loops?.map((lp, i) => (
          <FragmentBox key={i} loop={lp} totalCols={participants.length} />
        ))}

        {/* Messages */}
        {messages.map((msg, i) => (
          <ArrowMessage
            key={i}
            msg={msg}
            msgIdx={i}
            participants={participants}
            hoveredMsg={hoveredMsg}
            setHoveredMsg={setHoveredMsg}
          />
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main exported component                                            */
/* ================================================================== */

export default function SequenceDiag() {
  const [activeTab, setActiveTab] = useState(0);
  const current = TABS[activeTab];

  return (
    <section
      id="sequence-diag"
      style={{
        padding: "80px 20px",
        maxWidth: 1060,
        margin: "0 auto",
      }}
    >
      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: 48 }}
      >
        <h2
          style={{
            fontSize: 36,
            fontWeight: 800,
            background: "linear-gradient(135deg, #e2e8f0, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 12,
          }}
        >
          {"📊 核心序列图"}
        </h2>
        <p
          style={{
            color: "#64748b",
            fontSize: 16,
            maxWidth: 600,
            margin: "0 auto",
          }}
        >
          深入理解 Claude Code 关键交互流程的时序逻辑
        </p>
      </motion.div>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        {TABS.map((tab, i) => {
          const isActive = i === activeTab;
          return (
            <motion.button
              key={tab.key}
              onClick={() => setActiveTab(i)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                position: "relative",
                padding: "10px 22px",
                borderRadius: 12,
                border: isActive
                  ? `1.5px solid ${tab.accentFrom}88`
                  : "1.5px solid rgba(148,163,184,0.15)",
                background: isActive
                  ? `linear-gradient(135deg, ${tab.accentFrom}22, ${tab.accentTo}18)`
                  : "rgba(30,32,44,0.6)",
                color: isActive ? "#e2e8f0" : "#64748b",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s",
                outline: "none",
                fontFamily: "inherit",
                boxShadow: isActive ? `0 0 16px ${tab.accentFrom}25` : "none",
              }}
            >
              <span style={{ fontSize: 18 }}>{tab.tabIcon}</span>
              {tab.tabLabel}
              {isActive && (
                <motion.div
                  layoutId="seq-tab-indicator"
                  style={{
                    position: "absolute",
                    bottom: -1,
                    left: "15%",
                    right: "15%",
                    height: 2,
                    borderRadius: 1,
                    background: `linear-gradient(90deg, ${tab.accentFrom}, ${tab.accentTo})`,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Subtitle for current tab */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#64748b",
            padding: "4px 12px",
            borderRadius: 8,
            background: "rgba(148,163,184,0.08)",
            border: "1px solid rgba(148,163,184,0.12)",
          }}
        >
          {current.title} &mdash; {current.messages.length} messages &middot;{" "}
          {current.participants.length} participants
        </span>
      </div>

      {/* Hint */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 20,
          fontSize: 12,
          color: "#475569",
        }}
      >
        Hover 箭头查看详细说明 &middot; 移动端可左右滚动
      </div>

      {/* Sequence diagram content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.key}
          variants={tabContentVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <SequenceCanvas tab={current} />
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 20,
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 28,
          fontSize: 12,
          color: "#64748b",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              display: "inline-block",
              width: 28,
              height: 0,
              borderTop: "2px solid #94a3b8",
            }}
          />
          同步消息
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              display: "inline-block",
              width: 28,
              height: 0,
              borderTop: "2px dashed #94a3b8",
            }}
          />
          返回 / 异步
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              display: "inline-block",
              width: 20,
              height: 14,
              border: "1.5px dashed rgba(245,158,11,0.4)",
              borderRadius: 4,
            }}
          />
          循环 / 片段
        </span>
      </div>
    </section>
  );
}
