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
  accent: string;
  steps: FlowStep[];
}

const COLORS = {
  blue: { main: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
  purple: { main: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  cyan: { main: "#06b6d4", bg: "#ecfeff", border: "#a5f3fc" },
  amber: { main: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  green: { main: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  red: { main: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  indigo: { main: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe" },
};

const TABS: DataFlowTab[] = [
  {
    key: "main",
    label: "用户输入 → AI 响应",
    icon: "💬",
    accent: COLORS.blue.main,
    steps: [
      { id: 1, title: "用户输入", source: "REPL.tsx", description: "REPL 通过 readline 接收用户输入文本，支持多行输入、命令历史回溯、Tab 自动补全。如果输入以 \"/\" 开头则路由到命令系统。" },
      { id: 2, title: "消息构建", source: "ConversationManager.ts", description: "将用户输入封装为 Message 对象。附加系统提示词（包含工具描述、项目上下文），拼接完整对话历史。如果上下文接近限制则触发 compact 压缩。" },
      { id: 3, title: "API 请求", source: "query.ts", description: "通过 Anthropic SDK 构建流式请求。设置 model、max_tokens、temperature 等参数，附带可用工具列表的 JSON Schema。请求通过 HTTPS 发送。", highlight: true, highlightColor: COLORS.blue.main },
      { id: 4, title: "流式响应", source: "AsyncGenerator", description: "Claude API 返回 SSE 流。AsyncGenerator 逐 chunk 解析：content_block_start → content_block_delta(text/tool_use) → content_block_stop → message_stop。每个 text delta 立即 yield。" },
      { id: 5, title: "终端渲染", source: "React+Ink", description: "yield 的文本 token 通过 React+Ink 实时渲染到终端。支持 Markdown 语法高亮、代码块格式化、链接识别。实现打字机效果的流畅输出。" },
      { id: 6, title: "工具调用检测", source: "query.ts", description: "当流中出现 tool_use 类型的 content block，解析工具名称(name)和参数(input)。一条消息可能包含多个并行的工具调用请求。", highlight: true, highlightColor: COLORS.amber.main },
      { id: 7, title: "权限检查", source: "PermissionSystem", description: "根据当前 permission-mode 和 allowedTools 配置判断是否需要用户确认。Default 模式下展示工具名称和参数摘要，等待用户输入 y/n。", highlight: true, highlightColor: COLORS.red.main },
      { id: 8, title: "工具执行", source: "Tool.execute", description: "调用对应 Tool 实例的 execute 方法。传入验证后的参数，设置超时计时器。执行过程通过 OpenTelemetry Span 追踪。支持多工具并行执行。", highlight: true, highlightColor: COLORS.green.main },
      { id: 9, title: "结果反馈", source: "MessageHistory", description: "工具执行结果封装为 tool_result 消息，追加到对话历史。包含执行状态（成功/失败）、输出内容、执行耗时。" },
      { id: 10, title: "循环继续", source: "query.ts", description: "将更新后的对话历史重新发送给 Claude API（回到步骤3）。AI 根据工具结果决定下一步：继续调用工具或生成最终文本回复。", highlight: true, highlightColor: COLORS.blue.main },
    ],
  },
  {
    key: "mcp",
    label: "MCP 工具调用",
    icon: "🔌",
    accent: COLORS.purple.main,
    steps: [
      { id: 1, title: "MCP 服务发现", source: "config.ts", description: "启动时扫描 ~/.claude/config.json 和 .claude/config.json 中的 mcpServers 配置。每个服务器定义 command（启动命令）、args（参数）、transport（stdio/sse）。" },
      { id: 2, title: "连接建立", source: "mcpClient.ts", description: "stdio 模式：通过 child_process.spawn 启动 MCP 服务器进程，通过 stdin/stdout 通信。SSE 模式：建立 HTTP 长连接，通过 Server-Sent Events 接收消息。", highlight: true, highlightColor: COLORS.purple.main },
      { id: 3, title: "工具列表获取", source: "mcpClient.ts", description: "发送 JSON-RPC initialize 请求协商协议版本和能力。然后发送 tools/list 请求获取服务器提供的所有工具定义（name, description, inputSchema）。" },
      { id: 4, title: "动态注册", source: "ToolRegistry", description: "将 MCP 工具包装为 Tool 子类实例，注册到全局 ToolRegistry。MCP 工具与内置工具共享相同的执行接口，AI 无法区分来源。", highlight: true, highlightColor: COLORS.blue.main },
      { id: 5, title: "调用代理", source: "mcpClient.ts", description: "AI 请求调用 MCP 工具时，mcpClient 将参数序列化为 JSON-RPC tools/call 请求，通过对应传输通道发送给 MCP 服务器。支持超时和重试。", highlight: true, highlightColor: COLORS.amber.main },
      { id: 6, title: "结果返回", source: "query.ts", description: "MCP 服务器返回 JSON-RPC 响应，提取 content 字段。转换为标准 tool_result 格式，与内置工具结果统一处理，追加到对话历史。" },
    ],
  },
  {
    key: "permission",
    label: "权限检查流程",
    icon: "🛡️",
    accent: COLORS.red.main,
    steps: [
      { id: 1, title: "工具调用请求", source: "query.ts", description: "AI 响应中包含 tool_use 请求。提取工具名称（如 BashTool）和参数（如 command: \"rm -rf /\"）。进入权限评估流水线。" },
      { id: 2, title: "权限模式判断", source: "permissions.ts", description: "检查当前 --permission-mode：Default（所有敏感操作需确认）、Approve（已批准模式自动放行）、AutoApprove（仅危险操作需确认）、BypassPermissions（跳过所有检查）。", highlight: true, highlightColor: COLORS.red.main },
      { id: 3, title: "规则匹配", source: "permissions.ts", description: "依次检查：blockedTools 黑名单 → allowedTools 白名单 → 已批准操作缓存 → 默认规则。支持通配符匹配（如 \"Bash:npm *\"）和路径范围限制。", highlight: true, highlightColor: COLORS.amber.main },
      { id: 4, title: "用户确认", source: "REPL.tsx", description: "如需确认，在终端渲染权限对话框：显示工具名称、操作摘要、影响范围。用户可选择 Allow（本次允许）、Always Allow（记住并总是允许）、Deny（拒绝）。", highlight: true, highlightColor: COLORS.purple.main },
      { id: 5, title: "执行或拒绝", source: "Tool.execute / query.ts", description: "Allow/Always Allow → 执行工具，将结果返回给 AI。Deny → 生成拒绝消息告知 AI 该操作被用户拒绝，AI 需要采取替代方案。" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const tabContentVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const stepVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" },
  }),
};

const connectorVariants = {
  hidden: { scaleY: 0 },
  visible: (i: number) => ({
    scaleY: 1,
    transition: { delay: i * 0.06 + 0.03, duration: 0.3, ease: "easeOut" },
  }),
};

/* ------------------------------------------------------------------ */
/*  Highlight color map for left border                                */
/* ------------------------------------------------------------------ */

function getHighlightLeftColor(color?: string): string {
  if (color === COLORS.red.main) return COLORS.red.main;
  if (color === COLORS.green.main) return COLORS.green.main;
  if (color === COLORS.blue.main) return COLORS.blue.main;
  if (color === COLORS.amber.main) return COLORS.amber.main;
  if (color === COLORS.purple.main) return COLORS.purple.main;
  return COLORS.blue.main;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StepNode({
  step,
  index,
  accent,
}: {
  step: FlowStep;
  index: number;
  accent: string;
  total: number;
}) {
  const leftBarColor = step.highlight ? getHighlightLeftColor(step.highlightColor) : "transparent";

  return (
    <>
      {/* Connector line */}
      {index > 0 && (
        <motion.div
          custom={index}
          variants={connectorVariants}
          initial="hidden"
          animate="visible"
          style={{
            width: 2,
            height: 32,
            marginLeft: 23,
            background: "#cbd5e1",
            borderRadius: 1,
            transformOrigin: "top",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: -5,
              left: -4,
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "6px solid #cbd5e1",
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
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
          maxWidth: 720,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Left accent bar for highlighted items */}
        {step.highlight && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: 4,
              background: leftBarColor,
              borderRadius: "12px 0 0 12px",
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
            background: COLORS.blue.main,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 15,
            color: "#ffffff",
            fontFamily: "'Inter', system-ui, sans-serif",
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
                color: "#0f172a",
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              {step.title}
            </span>
            <span
              className="file-path"
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 6,
                background: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
                fontFamily: "'JetBrains Mono', monospace",
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
              color: "#475569",
              fontFamily: "'Inter', system-ui, sans-serif",
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
              color: COLORS.blue.main,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.blue.main} strokeWidth="2.5">
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
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        style={{ textAlign: "center", marginBottom: 48 }}
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
          核心数据流
        </h2>
        <p
          className="section-subtitle"
          style={{
            color: "#475569",
            fontSize: 16,
            maxWidth: 560,
            margin: "0 auto",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          深入了解 Claude Code 内部的三条关键数据流路径，从用户输入到 AI 响应的完整链路。
        </p>
      </motion.div>

      {/* Tab bar */}
      <div
        className="tab-group"
        style={{
          display: "flex",
          gap: 4,
          justifyContent: "center",
          marginBottom: 40,
          flexWrap: "wrap",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: 0,
        }}
      >
        {TABS.map((tab, i) => {
          const isActive = i === activeTab;
          return (
            <button
              key={tab.key}
              className="tab-button"
              onClick={() => setActiveTab(i)}
              style={{
                position: "relative",
                padding: "10px 22px",
                borderRadius: "8px 8px 0 0",
                border: "none",
                borderBottom: isActive ? `2px solid ${tab.accent}` : "2px solid transparent",
                background: isActive ? "#ffffff" : "transparent",
                color: isActive ? "#0f172a" : "#94a3b8",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s",
                outline: "none",
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Step count badge */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#475569",
            padding: "4px 12px",
            borderRadius: 8,
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            fontFamily: "'Inter', system-ui, sans-serif",
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
          transition={{ duration: 0.25, ease: "easeInOut" }}
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
              accent={current.accent}
              total={current.steps.length}
            />
          ))}

          {/* End marker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: current.steps.length * 0.06 + 0.2 }}
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
                border: "2px solid #cbd5e1",
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
                  background: COLORS.blue.main,
                }}
              />
            </div>
            <span style={{ fontSize: 13, color: "#475569", fontWeight: 500, fontFamily: "'Inter', system-ui, sans-serif" }}>
              {current.key === "main" ? "流程结束 / 继续循环" : "流程结束"}
            </span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
