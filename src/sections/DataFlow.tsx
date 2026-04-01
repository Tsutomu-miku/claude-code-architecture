"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Data definitions                                                   */
/* ------------------------------------------------------------------ */

interface FlowStep {
  id: number;
  title: string;
  source: string;
  description: string;
  highlight?: boolean;
  highlightColor?: string;
}

interface DataFlowTab {
  key: string;
  label: string;
  icon: string;
  accentFrom: string;
  accentTo: string;
  steps: FlowStep[];
}

const TABS: DataFlowTab[] = [
  {
    key: "main",
    label: "用户输入 → AI 响应",
    icon: "💬",
    accentFrom: "#6366f1",
    accentTo: "#06b6d4",
    steps: [
      {
        id: 1,
        title: "用户输入",
        source: "REPL.tsx",
        description:
          "REPL 通过 readline 接收用户输入文本，支持多行输入、命令历史回溯、Tab 自动补全。如果输入以 \"/\" 开头则路由到命令系统。",
      },
      {
        id: 2,
        title: "消息构建",
        source: "ConversationManager.ts",
        description:
          "将用户输入封装为 Message 对象。附加系统提示词（包含工具描述、项目上下文），拼接完整对话历史。如果上下文接近限制则触发 compact 压缩。",
      },
      {
        id: 3,
        title: "API 请求",
        source: "query.ts",
        description:
          "通过 Anthropic SDK 构建流式请求。设置 model、max_tokens、temperature 等参数，附带可用工具列表的 JSON Schema。请求通过 HTTPS 发送。",
        highlight: true,
        highlightColor: "#6366f1",
      },
      {
        id: 4,
        title: "流式响应",
        source: "AsyncGenerator",
        description:
          "Claude API 返回 SSE 流。AsyncGenerator 逐 chunk 解析：content_block_start → content_block_delta(text/tool_use) → content_block_stop → message_stop。每个 text delta 立即 yield。",
      },
      {
        id: 5,
        title: "终端渲染",
        source: "React+Ink",
        description:
          "yield 的文本 token 通过 React+Ink 实时渲染到终端。支持 Markdown 语法高亮、代码块格式化、链接识别。实现打字机效果的流畅输出。",
      },
      {
        id: 6,
        title: "工具调用检测",
        source: "query.ts",
        description:
          "当流中出现 tool_use 类型的 content block，解析工具名称(name)和参数(input)。一条消息可能包含多个并行的工具调用请求。",
        highlight: true,
        highlightColor: "#f59e0b",
      },
      {
        id: 7,
        title: "权限检查",
        source: "PermissionSystem",
        description:
          "根据当前 permission-mode 和 allowedTools 配置判断是否需要用户确认。Default 模式下展示工具名称和参数摘要，等待用户输入 y/n。",
        highlight: true,
        highlightColor: "#ef4444",
      },
      {
        id: 8,
        title: "工具执行",
        source: "Tool.execute",
        description:
          "调用对应 Tool 实例的 execute 方法。传入验证后的参数，设置超时计时器。执行过程通过 OpenTelemetry Span 追踪。支持多工具并行执行。",
        highlight: true,
        highlightColor: "#10b981",
      },
      {
        id: 9,
        title: "结果反馈",
        source: "MessageHistory",
        description:
          "工具执行结果封装为 tool_result 消息，追加到对话历史。包含执行状态（成功/失败）、输出内容、执行耗时。",
      },
      {
        id: 10,
        title: "循环继续",
        source: "query.ts",
        description:
          "将更新后的对话历史重新发送给 Claude API（回到步骤3）。AI 根据工具结果决定下一步：继续调用工具或生成最终文本回复。",
        highlight: true,
        highlightColor: "#6366f1",
      },
    ],
  },
  {
    key: "mcp",
    label: "MCP 工具调用",
    icon: "🔌",
    accentFrom: "#8b5cf6",
    accentTo: "#ec4899",
    steps: [
      {
        id: 1,
        title: "MCP 服务发现",
        source: "config.ts",
        description:
          "启动时扫描 ~/.claude/config.json 和 .claude/config.json 中的 mcpServers 配置。每个服务器定义 command（启动命令）、args（参数）、transport（stdio/sse）。",
      },
      {
        id: 2,
        title: "连接建立",
        source: "mcpClient.ts",
        description:
          "stdio 模式：通过 child_process.spawn 启动 MCP 服务器进程，通过 stdin/stdout 通信。SSE 模式：建立 HTTP 长连接，通过 Server-Sent Events 接收消息。",
        highlight: true,
        highlightColor: "#8b5cf6",
      },
      {
        id: 3,
        title: "工具列表获取",
        source: "mcpClient.ts",
        description:
          "发送 JSON-RPC initialize 请求协商协议版本和能力。然后发送 tools/list 请求获取服务器提供的所有工具定义（name, description, inputSchema）。",
      },
      {
        id: 4,
        title: "动态注册",
        source: "ToolRegistry",
        description:
          "将 MCP 工具包装为 Tool 子类实例，注册到全局 ToolRegistry。MCP 工具与内置工具共享相同的执行接口，AI 无法区分来源。",
        highlight: true,
        highlightColor: "#ec4899",
      },
      {
        id: 5,
        title: "调用代理",
        source: "mcpClient.ts",
        description:
          "AI 请求调用 MCP 工具时，mcpClient 将参数序列化为 JSON-RPC tools/call 请求，通过对应传输通道发送给 MCP 服务器。支持超时和重试。",
        highlight: true,
        highlightColor: "#f59e0b",
      },
      {
        id: 6,
        title: "结果返回",
        source: "query.ts",
        description:
          "MCP 服务器返回 JSON-RPC 响应，提取 content 字段。转换为标准 tool_result 格式，与内置工具结果统一处理，追加到对话历史。",
      },
    ],
  },
  {
    key: "permission",
    label: "权限检查流程",
    icon: "🛡️",
    accentFrom: "#ef4444",
    accentTo: "#f59e0b",
    steps: [
      {
        id: 1,
        title: "工具调用请求",
        source: "query.ts",
        description:
          "AI 响应中包含 tool_use 请求。提取工具名称（如 BashTool）和参数（如 command: \"rm -rf /\"）。进入权限评估流水线。",
      },
      {
        id: 2,
        title: "权限模式判断",
        source: "permissions.ts",
        description:
          "检查当前 --permission-mode：Default（所有敏感操作需确认）、Approve（已批准模式自动放行）、AutoApprove（仅危险操作需确认）、BypassPermissions（跳过所有检查）。",
        highlight: true,
        highlightColor: "#ef4444",
      },
      {
        id: 3,
        title: "规则匹配",
        source: "permissions.ts",
        description:
          "依次检查：blockedTools 黑名单 → allowedTools 白名单 → 已批准操作缓存 → 默认规则。支持通配符匹配（如 \"Bash:npm *\"）和路径范围限制。",
        highlight: true,
        highlightColor: "#f59e0b",
      },
      {
        id: 4,
        title: "用户确认",
        source: "REPL.tsx",
        description:
          "如需确认，在终端渲染权限对话框：显示工具名称、操作摘要、影响范围。用户可选择 Allow（本次允许）、Always Allow（记住并总是允许）、Deny（拒绝）。",
        highlight: true,
        highlightColor: "#8b5cf6",
      },
      {
        id: 5,
        title: "执行或拒绝",
        source: "Tool.execute / query.ts",
        description:
          "Allow/Always Allow → 执行工具，将结果返回给 AI。Deny → 生成拒绝消息告知 AI 该操作被用户拒绝，AI 需要采取替代方案。",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const tabContentVariants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

const stepVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: "easeOut" },
  }),
};

const connectorVariants = {
  hidden: { scaleY: 0 },
  visible: (i: number) => ({
    scaleY: 1,
    transition: { delay: i * 0.07 + 0.03, duration: 0.35, ease: "easeOut" },
  }),
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StepNode({
  step,
  index,
  accentFrom,
  accentTo,
  total,
}: {
  step: FlowStep;
  index: number;
  accentFrom: string;
  accentTo: string;
  total: number;
}) {
  const borderColor = step.highlight
    ? step.highlightColor ?? accentFrom
    : "rgba(148,163,184,0.18)";
  const bgGlow = step.highlight
    ? `${step.highlightColor ?? accentFrom}12`
    : "transparent";

  return (
    <>
      {/* Connector line (skip before first) */}
      {index > 0 && (
        <motion.div
          custom={index}
          variants={connectorVariants}
          initial="hidden"
          animate="visible"
          style={{
            width: 2,
            height: 36,
            marginLeft: 23,
            background: `linear-gradient(to bottom, ${accentFrom}66, ${accentTo}66)`,
            borderRadius: 1,
            transformOrigin: "top",
            position: "relative",
          }}
        >
          {/* Arrow head */}
          <div
            style={{
              position: "absolute",
              bottom: -5,
              left: -4,
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: `6px solid ${accentTo}99`,
            }}
          />
        </motion.div>
      )}

      {/* Step card */}
      <motion.div
        custom={index}
        variants={stepVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
          padding: "16px 20px",
          borderRadius: 14,
          border: `1.5px solid ${borderColor}`,
          background: `linear-gradient(135deg, rgba(30,32,44,0.92), rgba(22,24,34,0.96))`,
          boxShadow: step.highlight
            ? `0 0 20px ${bgGlow}, 0 2px 8px rgba(0,0,0,0.25)`
            : "0 2px 8px rgba(0,0,0,0.18)",
          maxWidth: 720,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle left accent bar for highlighted items */}
        {step.highlight && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: 3,
              background: step.highlightColor ?? accentFrom,
              borderRadius: "14px 0 0 14px",
            }}
          />
        )}

        {/* Number circle */}
        <div
          style={{
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: step.highlight
              ? `linear-gradient(135deg, ${step.highlightColor ?? accentFrom}, ${step.highlightColor ?? accentFrom}cc)`
              : `linear-gradient(135deg, ${accentFrom}44, ${accentTo}44)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 15,
            color: step.highlight ? "#fff" : "#94a3b8",
            boxShadow: step.highlight
              ? `0 0 12px ${step.highlightColor ?? accentFrom}55`
              : "none",
          }}
        >
          {step.id}
        </div>

        {/* Text content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: step.highlight
                  ? step.highlightColor ?? "#e2e8f0"
                  : "#e2e8f0",
              }}
            >
              {step.title}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 6,
                background: "rgba(139,92,246,0.18)",
                color: "#c4b5fd",
                border: "1px solid rgba(139,92,246,0.25)",
                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                letterSpacing: 0.3,
              }}
            >
              {step.source}
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 13.5,
              lineHeight: 1.65,
              color: "#94a3b8",
            }}
          >
            {step.description}
          </p>
        </div>

        {/* Loop indicator for last step in main flow */}
        {step.id === 10 && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 12,
              fontSize: 11,
              color: "#6366f1",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
              <path d="M17 1l4 4-4 4" />
              <path d="M3 11V9a4 4 0 014-4h14" />
              <path d="M7 23l-4-4 4-4" />
              <path d="M21 13v2a4 4 0 01-4 4H3" />
            </svg>
            回到步骤 3
          </div>
        )}
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function DataFlow() {
  const [activeTab, setActiveTab] = useState(0);
  const current = TABS[activeTab];

  return (
    <section
      id="data-flow"
      style={{
        padding: "80px 20px",
        maxWidth: 900,
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
          核心数据流
        </h2>
        <p style={{ color: "#64748b", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>
          深入了解 Claude Code 内部的三条关键数据流路径，从用户输入到 AI 响应的完整链路。
        </p>
      </motion.div>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          marginBottom: 40,
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
                boxShadow: isActive
                  ? `0 0 16px ${tab.accentFrom}25`
                  : "none",
              }}
            >
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
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

      {/* Step count badge */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
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
          {current.steps.length} 个步骤
        </span>
      </div>

      {/* Flow content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.key}
          variants={tabContentVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: "easeInOut" }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
          }}
        >
          {current.steps.map((step, i) => (
            <StepNode
              key={step.id}
              step={step}
              index={i}
              accentFrom={current.accentFrom}
              accentTo={current.accentTo}
              total={current.steps.length}
            />
          ))}

          {/* End marker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: current.steps.length * 0.07 + 0.2 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 20,
              marginLeft: 10,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: `2px solid ${current.accentTo}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${current.accentFrom}, ${current.accentTo})`,
                }}
              />
            </div>
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
              {current.key === "main" ? "流程结束 / 继续循环" : "流程结束"}
            </span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
