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
    icon: "\ud83d\udecf",
    title: "Entry Layer",
    subtitle: "\u5165\u53e3\u5c42",
    summary: "\u89e3\u6790 CLI \u53c2\u6570\u3001\u521d\u59cb\u5316\u7ec8\u7aef UI\u3001\u7ba1\u7406 50+ slash \u547d\u4ee4",
    description:
      "\u5165\u53e3\u5c42\u662f\u7528\u6237\u4e0e Claude Code \u4ea4\u4e92\u7684\u7b2c\u4e00\u7ad9\u3002\u5b83\u8d1f\u8d23\u89e3\u6790 CLI \u53c2\u6570\u3001\u521d\u59cb\u5316\u8fd0\u884c\u73af\u5883\u3001\u6e32\u67d3\u7ec8\u7aef UI\uff0c\u5e76\u7ba1\u7406 50+ \u4e2a slash \u547d\u4ee4\u3002\u8fd9\u4e00\u5c42\u5c06\u7528\u6237\u610f\u56fe\u7ffb\u8bd1\u4e3a\u7cfb\u7edf\u5185\u90e8\u53ef\u6267\u884c\u7684\u64cd\u4f5c\u3002",
    gradient: "linear-gradient(to right, #60a5fa, #38bdf8)",
    accentColor: "#3b82f6",
    lightBg: "#eff6ff",
    borderColor: "#bfdbfe",
    files: [
      {
        name: "cli.ts",
        description:
          "CLI \u5165\u53e3\u70b9\uff0c\u4f7f\u7528 Commander.js \u89e3\u6790 --model, --allowedTools, --permission-mode, --print, --verbose \u7b49\u53c2\u6570\u3002\u8bbe\u7f6e\u5168\u5c40\u914d\u7f6e\uff0c\u521d\u59cb\u5316\u65e5\u5fd7\u7cfb\u7edf\uff0c\u5904\u7406 --help/--version \u5feb\u901f\u9000\u51fa\u8def\u5f84\u3002",
      },
      {
        name: "main.tsx (803KB)",
        description:
          "\u4e3b\u5165\u53e3\u6587\u4ef6\uff0c\u5305\u542b\u5b8c\u6574\u7684\u5e94\u7528\u542f\u52a8\u903b\u8f91\u3002\u521d\u59cb\u5316 React+Ink \u6e32\u67d3\u5f15\u64ce\uff0c\u8bbe\u7f6e\u5168\u5c40\u9519\u8bef\u5904\u7406(uncaughtException/unhandledRejection)\uff0c\u6ce8\u518c SIGINT/SIGTERM \u4fe1\u53f7\u5904\u7406\u5668\u5b9e\u73b0\u4f18\u96c5\u9000\u51fa\u3002",
      },
      {
        name: "REPL.tsx",
        description:
          "\u4ea4\u4e92\u5f0f\u8bfb\u53d6-\u6c42\u503c-\u8f93\u51fa\u5faa\u73af\u3002\u7ba1\u7406\u7528\u6237\u8f93\u5165\u2192AI\u54cd\u5e94\u2192\u5de5\u5177\u6267\u884c\u7684\u6838\u5fc3\u5faa\u73af\uff0c\u7ef4\u62a4\u5bf9\u8bdd\u4e0a\u4e0b\u6587\uff0c\u5904\u7406\u591a\u8f6e\u4ea4\u4e92\uff0c\u652f\u6301\u547d\u4ee4\u8865\u5168\u548c\u5386\u53f2\u56de\u6eaf\u3002",
      },
      {
        name: "commands/*.ts",
        description:
          "50+ \u4e2a slash \u547d\u4ee4\u5b9e\u73b0\uff0c\u5305\u62ec /help, /clear, /model, /config, /compact, /permissions, /tools, /mcp \u7b49\u3002\u6bcf\u4e2a\u547d\u4ee4\u5b9a\u4e49 name, aliases, description, execute \u65b9\u6cd5\u3002",
      },
    ],
  },
  {
    id: "session",
    icon: "\ud83e\udde0",
    title: "Session Layer",
    subtitle: "\u4f1a\u8bdd\u5c42",
    summary: "\u7ba1\u7406 Claude API \u4ea4\u4e92\u5faa\u73af\u3001\u6d41\u5f0f\u54cd\u5e94\u4e0e Token \u7edf\u8ba1",
    description:
      "\u4f1a\u8bdd\u5c42\u662f\u6574\u4e2a\u7cfb\u7edf\u7684\u300c\u5927\u8111\u300d\uff0c\u8d1f\u8d23\u7ba1\u7406\u4e0e Claude API \u7684\u4ea4\u4e92\u5faa\u73af\u3002\u5b83\u5904\u7406\u6d88\u606f\u7684\u6784\u5efa\u3001\u6d41\u5f0f\u54cd\u5e94\u7684\u63a5\u6536\u4e0e\u89e3\u6790\u3001\u5de5\u5177\u8c03\u7528\u7684\u7f16\u6392\u3001Token \u6d88\u8017\u7684\u7edf\u8ba1\u3002\u8fd9\u4e00\u5c42\u5b9e\u73b0\u4e86 Claude Code \u6700\u6838\u5fc3\u7684 AI \u5bf9\u8bdd\u80fd\u529b\u3002",
    gradient: "linear-gradient(to right, #a78bfa, #c084fc)",
    accentColor: "#7c3aed",
    lightBg: "#f5f3ff",
    borderColor: "#ddd6fe",
    files: [
      {
        name: "query.ts (68KB)",
        description:
          "\u6838\u5fc3\u67e5\u8be2\u5f15\u64ce\uff0c\u4e0e Claude API \u7684\u4ea4\u4e92\u5faa\u73af\u6838\u5fc3\u3002\u5b9e\u73b0\u6d88\u606f\u6784\u5efa(\u7cfb\u7edf\u63d0\u793a\u8bcd+\u7528\u6237\u8f93\u5165+\u5de5\u5177\u7ed3\u679c)\u3001AsyncGenerator \u6d41\u5f0f\u54cd\u5e94\u5904\u7406\u3001tool_use \u5757\u68c0\u6d4b\u4e0e\u5de5\u5177\u8c03\u7528\u7f16\u6392\u3001Token \u8ba1\u6570\u548c\u6210\u672c\u5b9e\u65f6\u8ba1\u7b97\u3002",
      },
      {
        name: "QueryEngine.ts (46KB)",
        description:
          "\u67e5\u8be2\u5f15\u64ce\u62bd\u8c61\u5c42\uff0c\u5b9a\u4e49 API \u4ea4\u4e92\u7684\u6807\u51c6\u63a5\u53e3 IQueryEngine\u3002\u5b9e\u73b0\u8bf7\u6c42\u91cd\u8bd5\u3001\u8d85\u65f6\u63a7\u5236\u3001\u9519\u8bef\u5206\u7c7b\u5904\u7406\u3002\u867d\u7136\u5f53\u524d\u4ec5\u9002\u914d Claude\uff0c\u4f46\u67b6\u6784\u652f\u6301\u591a AI \u63d0\u4f9b\u5546\u6269\u5c55\u3002",
      },
      {
        name: "ConversationManager.ts",
        description:
          "\u5bf9\u8bdd\u5386\u53f2\u7ba1\u7406\u5668\uff0c\u8d1f\u8d23\u6d88\u606f\u7684 compact(\u538b\u7f29)\u64cd\u4f5c\u2014\u2014\u5f53\u4e0a\u4e0b\u6587\u7a97\u53e3\u5373\u5c06\u8d85\u9650\u65f6\uff0c\u81ea\u52a8\u5bf9\u65e9\u671f\u6d88\u606f\u8fdb\u884c\u6458\u8981\u538b\u7f29\u3002\u652f\u6301\u5bf9\u8bdd\u7684\u6301\u4e45\u5316\u5b58\u50a8\u548c\u6062\u590d\u3002",
      },
      {
        name: "MessageHistory.ts",
        description:
          "\u6d88\u606f\u5386\u53f2\u5b58\u50a8\u5f15\u64ce\uff0c\u652f\u6301\u591a\u4f1a\u8bdd\u7ba1\u7406\u548c\u5207\u6362\u3002\u5b9e\u73b0\u6d88\u606f\u7684\u5e8f\u5217\u5316/\u53cd\u5e8f\u5217\u5316\uff0c\u7ef4\u62a4\u5bf9\u8bdd\u7684\u5143\u6570\u636e(\u521b\u5efa\u65f6\u95f4\u3001Token \u603b\u91cf\u3001\u5de5\u5177\u8c03\u7528\u6b21\u6570)\u3002",
      },
    ],
  },
  {
    id: "tools",
    icon: "\ud83d\udd27",
    title: "Tools / Tasks Layer",
    subtitle: "\u5de5\u5177\u4efb\u52a1\u5c42",
    summary: "40+ \u5185\u7f6e\u5de5\u5177 + \u52a8\u6001 MCP \u5de5\u5177\uff0c\u6807\u51c6\u5316 Schema \u4e0e\u5e76\u53d1\u8c03\u5ea6",
    description:
      "\u5de5\u5177\u4efb\u52a1\u5c42\u662f Claude Code \u7684\u300c\u624b\u811a\u300d\uff0c\u63d0\u4f9b\u4e86 40+ \u4e2a\u5185\u7f6e\u5de5\u5177\u548c\u52a8\u6001 MCP \u5de5\u5177\u3002\u6bcf\u4e2a\u5de5\u5177\u90fd\u6709\u6807\u51c6\u5316\u7684\u8f93\u5165 Schema(Zod v4)\u3001\u6743\u9650\u68c0\u67e5\u3001\u6267\u884c\u903b\u8f91\u548c\u7ed3\u679c\u683c\u5f0f\u5316\u3002TaskRunner \u7ba1\u7406\u591a\u5de5\u5177\u7684\u5e76\u53d1\u6267\u884c\u548c\u4f18\u5148\u7ea7\u8c03\u5ea6\u3002",
    gradient: "linear-gradient(to right, #fbbf24, #f59e0b)",
    accentColor: "#d97706",
    lightBg: "#fffbeb",
    borderColor: "#fde68a",
    files: [
      {
        name: "Tool.ts (29KB)",
        description:
          "\u5de5\u5177\u57fa\u7c7b\u5b9a\u4e49\uff0c\u4f7f\u7528 Zod v4 \u5b9a\u4e49 inputSchema/outputSchema\u3002\u5b9e\u73b0\u5de5\u5177\u6ce8\u518c\u3001\u53c2\u6570\u9a8c\u8bc1\u3001\u6743\u9650\u68c0\u67e5\u3001\u6267\u884c\u8ffd\u8e2a\u3001\u7ed3\u679c\u5e8f\u5217\u5316\u7684\u5b8c\u6574\u751f\u547d\u5468\u671f\u3002\u6240\u6709\u5185\u7f6e\u5de5\u5177\u548c MCP \u5de5\u5177\u90fd\u7ee7\u627f\u6b64\u57fa\u7c7b\u3002",
      },
      {
        name: "\u6587\u4ef6\u64cd\u4f5c\u5de5\u5177",
        description:
          "Read, Write, Edit, MultiEdit, Create, Move, Delete, ListFiles \u5171 8 \u4e2a\u5de5\u5177\uff0c\u8986\u76d6\u5b8c\u6574\u7684\u6587\u4ef6\u7cfb\u7edf\u64cd\u4f5c\u3002Edit \u5de5\u5177\u4f7f\u7528\u7cbe\u786e\u7684\u884c\u53f7\u5b9a\u4f4d\u548c diff \u5e94\u7528\u3002",
      },
      {
        name: "\u641c\u7d22\u5de5\u5177",
        description:
          "GrepTool(\u57fa\u4e8e ripgrep \u7684\u6b63\u5219\u641c\u7d22)\u3001GlobTool(\u6587\u4ef6\u6a21\u5f0f\u5339\u914d)\u3001FindTool(\u9012\u5f52\u6587\u4ef6\u67e5\u627e)\uff0c\u652f\u6301 .gitignore \u611f\u77e5\u3002",
      },
      {
        name: "\u6267\u884c\u5de5\u5177",
        description:
          "BashTool(shell \u547d\u4ee4\u6267\u884c\uff0c\u5e26\u8d85\u65f6\u548c\u6c99\u7bb1)\u3001SubProcessTool(\u957f\u8fd0\u884c\u5b50\u8fdb\u7a0b\u7ba1\u7406)\u3002",
      },
      {
        name: "Git \u5de5\u5177",
        description:
          "GitLog, GitDiff, GitCommit, GitStatus 4 \u4e2a\u5de5\u5177\uff0c\u5c01\u88c5 git CLI \u547d\u4ee4\u3002",
      },
      {
        name: "TaskRunner.ts",
        description:
          "\u5e76\u884c\u4efb\u52a1\u6267\u884c\u5668\uff0c\u7ba1\u7406\u591a\u5de5\u5177\u5e76\u53d1\u3002\u5b9e\u73b0\u4f18\u5148\u7ea7\u961f\u5217\u3001\u8d85\u65f6\u63a7\u5236\u3001\u9519\u8bef\u9694\u79bb\uff0c\u786e\u4fdd\u5355\u4e2a\u5de5\u5177\u5931\u8d25\u4e0d\u5f71\u54cd\u5176\u4ed6\u5e76\u884c\u4efb\u52a1\u3002",
      },
    ],
  },
  {
    id: "infra",
    icon: "\u2699\ufe0f",
    title: "Infrastructure Layer",
    subtitle: "\u57fa\u7840\u8bbe\u65bd\u5c42",
    summary: "API \u901a\u4fe1\u3001\u8ba4\u8bc1\u6388\u6743\u3001MCP \u534f\u8bae\u3001\u529f\u80fd\u5f00\u5173\u3001\u53ef\u89c2\u6d4b\u6027",
    description:
      "\u57fa\u7840\u8bbe\u65bd\u5c42\u63d0\u4f9b\u6240\u6709\u4e0a\u5c42\u6a21\u5757\u4f9d\u8d56\u7684\u57fa\u7840\u670d\u52a1\u3002\u5305\u62ec API \u901a\u4fe1\u3001\u8ba4\u8bc1\u6388\u6743\u3001MCP \u534f\u8bae\u3001\u529f\u80fd\u5f00\u5173\u3001\u53ef\u89c2\u6d4b\u6027\u7b49\u6838\u5fc3\u80fd\u529b\u3002\u8fd9\u4e9b\u670d\u52a1\u4ee5\u5355\u4f8b\u6a21\u5f0f\u8fd0\u884c\uff0c\u901a\u8fc7\u5ef6\u8fdf\u521d\u59cb\u5316\u4f18\u5316\u542f\u52a8\u6027\u80fd\u3002",
    gradient: "linear-gradient(to right, #34d399, #2dd4bf)",
    accentColor: "#059669",
    lightBg: "#ecfdf5",
    borderColor: "#a7f3d0",
    files: [
      {
        name: "services/claude.ts",
        description:
          "Anthropic API \u5ba2\u6237\u7aef\u5c01\u88c5\uff0c\u7ba1\u7406 API Key \u8f6e\u6362\u3001\u8bf7\u6c42\u961f\u5217\u3001\u901f\u7387\u9650\u5236(429\u5904\u7406)\u3001\u81ea\u52a8\u91cd\u8bd5(\u6307\u6570\u9000\u907f)\u3001\u6d41\u5f0f SSE \u8fde\u63a5\u6c60\u3002",
      },
      {
        name: "services/mcpClient.ts",
        description:
          "MCP \u5ba2\u6237\u7aef\u5b9e\u73b0\uff0c\u652f\u6301 stdio \u548c SSE \u4e24\u79cd\u4f20\u8f93\u534f\u8bae\u3002\u7ba1\u7406\u591a\u4e2a MCP \u670d\u52a1\u5668\u7684\u751f\u547d\u5468\u671f\uff0c\u5b9e\u73b0\u5de5\u5177\u52a8\u6001\u53d1\u73b0\u3001\u8c03\u7528\u4ee3\u7406\u548c\u7ed3\u679c\u8f6c\u6362\u3002",
      },
      {
        name: "services/auth.ts",
        description:
          "OAuth 2.0 \u8ba4\u8bc1\u6a21\u5757\uff0c\u5904\u7406\u6388\u6743\u7801\u6d41\u7a0b(PKCE)\u3001JWT Token \u89e3\u6790\u548c\u81ea\u52a8\u5237\u65b0\u3001\u591a\u79df\u6237 API Key \u7ba1\u7406\u3002",
      },
      {
        name: "services/featureFlags.ts",
        description:
          "GrowthBook Feature Flag \u5ba2\u6237\u7aef\uff0c\u8fdc\u7a0b\u914d\u7f6e\u62c9\u53d6\u3001\u672c\u5730\u6587\u4ef6\u7f13\u5b58\u3001\u5b9a\u65f6\u5237\u65b0\u3002\u652f\u6301\u7528\u6237\u5206\u7fa4\u548c\u7070\u5ea6\u767e\u5206\u6bd4\u8ba1\u7b97\u3002",
      },
      {
        name: "services/telemetry.ts",
        description:
          "OpenTelemetry \u96c6\u6210\uff0c\u914d\u7f6e Tracer/Meter/Logger\uff0c\u521b\u5efa Span \u8ffd\u8e2a\u6bcf\u4e2a\u5de5\u5177\u8c03\u7528\u548c API \u8bf7\u6c42\uff0c\u4e0a\u62a5\u6027\u80fd\u6307\u6807\u3002",
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
            {layer.files.length} \u9879
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
          \u56db\u5c42\u67b6\u6784\u603b\u89c8
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
          Claude Code CLI \u6e90\u7801\u7531 4 \u4e2a\u5c42\u6b21\u7ec4\u6210\uff0c\u4ece\u7528\u6237\u8f93\u5165\u5230\u57fa\u7840\u8bbe\u65bd\u81ea\u4e0a\u800c\u4e0b\u89e3\u8026\u3002
          \u70b9\u51fb\u4efb\u610f\u5c42\u7ea7\u5c55\u5f00\u67e5\u770b\u8be6\u7ec6\u6587\u4ef6\u8bf4\u660e\u3002
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
        \u6570\u636e\u6765\u6e90\uff1aClaude Code CLI \u5f00\u6e90\u4ed3\u5e93\u7ed3\u6784\u5206\u6790 \u00b7 2025
      </motion.p>
    </section>
  );
}
