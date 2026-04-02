import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SecurityLayer {
  id: string;
  label: string;
  labelEn: string;
  color: string;
  description: string;
}

interface PermRow {
  dimension: string;
  default: { icon: string; text: string };
  approve: { icon: string; text: string };
  autoApprove: { icon: string; text: string };
  bypass: { icon: string; text: string };
}

interface PipelineStep {
  id: number;
  label: string;
  color: string;
  icon: string;
  detail: string;
}

interface AttackVector {
  name: string;
  nameEn: string;
  icon: string;
  severity: "high" | "medium" | "low";
  description: string;
  defense: string;
  color: string;
}

interface BestPractice {
  icon: string;
  title: string;
  description: string;
}

type SectionKey = "overview" | "permissions" | "pipeline" | "attacks" | "practices";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const SECURITY_LAYERS: SecurityLayer[] = [
  { id: "network", label: "\u5916\u90e8\u8fb9\u754c", labelEn: "Network", color: "#ef4444", description: "\u7f51\u7edc\u5c42\u5b89\u5168\uff1aTLS \u52a0\u5bc6\u4f20\u8f93\u3001API \u7aef\u70b9\u8bbf\u95ee\u63a7\u5236\u3001\u901f\u7387\u9650\u5236" },
  { id: "auth", label: "\u8ba4\u8bc1\u8fb9\u754c", labelEn: "Auth", color: "#f59e0b", description: "\u8eab\u4efd\u9a8c\u8bc1\uff1aOAuth 2.0 + PKCE\u3001JWT Token \u7ba1\u7406\u3001API Key \u8f6e\u6362" },
  { id: "permission", label: "\u6743\u9650\u8fb9\u754c", labelEn: "Permission", color: "#8b5cf6", description: "4 \u7ea7\u6743\u9650\u6a21\u5f0f\u3001\u89c4\u5219\u5f15\u64ce\u5339\u914d\u3001\u7528\u6237\u786e\u8ba4\u4ea4\u4e92" },
  { id: "sandbox", label: "\u6c99\u7bb1\u8fb9\u754c", labelEn: "Sandbox", color: "#3b82f6", description: "\u5de5\u4f5c\u76ee\u5f55\u9650\u5236\u3001\u8def\u5f84\u904d\u5386\u9632\u62a4\u3001\u6587\u4ef6\u7cfb\u7edf\u9694\u79bb" },
  { id: "execution", label: "\u5de5\u5177\u6267\u884c", labelEn: "Execution", color: "#10b981", description: "\u53c2\u6570 Zod Schema \u9a8c\u8bc1\u3001\u547d\u4ee4\u6ce8\u5165\u9632\u62a4\u3001\u8d85\u65f6\u63a7\u5236" },
];

const PERM_ROWS: PermRow[] = [
  {
    dimension: "\u6587\u4ef6\u8bfb\u53d6",
    default: { icon: "\u2705", text: "\u81ea\u52a8" },
    approve: { icon: "\u2705", text: "\u81ea\u52a8" },
    autoApprove: { icon: "\u2705", text: "\u81ea\u52a8" },
    bypass: { icon: "\u2705", text: "\u81ea\u52a8" },
  },
  {
    dimension: "\u6587\u4ef6\u5199\u5165",
    default: { icon: "\u2753", text: "\u9700\u786e\u8ba4" },
    approve: { icon: "\u2753", text: "\u9700\u786e\u8ba4" },
    autoApprove: { icon: "\u2705", text: "\u81ea\u52a8" },
    bypass: { icon: "\u2705", text: "\u81ea\u52a8" },
  },
  {
    dimension: "Shell \u547d\u4ee4",
    default: { icon: "\u2753", text: "\u9700\u786e\u8ba4" },
    approve: { icon: "\uD83D\uDD04", text: "\u5df2\u6279\u51c6\u653e\u884c" },
    autoApprove: { icon: "\u2705", text: "\u81ea\u52a8" },
    bypass: { icon: "\u2705", text: "\u81ea\u52a8" },
  },
  {
    dimension: "\u5371\u9669\u64cd\u4f5c",
    default: { icon: "\u2753", text: "\u9700\u786e\u8ba4" },
    approve: { icon: "\u2753", text: "\u9700\u786e\u8ba4" },
    autoApprove: { icon: "\u2753", text: "\u9700\u786e\u8ba4" },
    bypass: { icon: "\u2705", text: "\u81ea\u52a8" },
  },
  {
    dimension: "MCP \u5de5\u5177",
    default: { icon: "\u2753", text: "\u9700\u786e\u8ba4" },
    approve: { icon: "\u2753", text: "\u9700\u786e\u8ba4" },
    autoApprove: { icon: "\u2753", text: "\u9700\u786e\u8ba4" },
    bypass: { icon: "\u2705", text: "\u81ea\u52a8" },
  },
  {
    dimension: "\u9002\u7528\u573a\u666f",
    default: { icon: "\uD83D\uDEE1\uFE0F", text: "\u521d\u6b21\u4f7f\u7528/\u654f\u611f\u9879\u76ee" },
    approve: { icon: "\uD83D\uDCBB", text: "\u65e5\u5e38\u5f00\u53d1" },
    autoApprove: { icon: "\u26A1", text: "\u9ad8\u6548\u5f00\u53d1" },
    bypass: { icon: "\u2699\uFE0F", text: "CI/CD \u81ea\u52a8\u5316" },
  },
];

const PIPELINE_STEPS: PipelineStep[] = [
  { id: 1, label: "\u5de5\u5177\u8bf7\u6c42", color: "#64748b", icon: "\uD83D\uDCE5", detail: "AI \u54cd\u5e94\u4e2d\u63d0\u53d6 tool_use \u8bf7\u6c42\uff0c\u89e3\u6790\u5de5\u5177\u540d\u79f0\u548c\u53c2\u6570" },
  { id: 2, label: "\u9ed1\u540d\u5355\u68c0\u67e5", color: "#ef4444", icon: "\uD83D\uDEAB", detail: "\u68c0\u67e5 blockedTools \u914d\u7f6e\uff0c\u5339\u914d\u5219\u76f4\u63a5\u62d2\u7edd\u6267\u884c" },
  { id: 3, label: "\u767d\u540d\u5355\u5339\u914d", color: "#10b981", icon: "\u2705", detail: "\u68c0\u67e5 allowedTools \u914d\u7f6e\uff0c\u652f\u6301\u901a\u914d\u7b26\u5339\u914d\u5982 \"Bash:npm *\"" },
  { id: 4, label: "\u8def\u5f84\u8303\u56f4\u9a8c\u8bc1", color: "#3b82f6", icon: "\uD83D\uDCC1", detail: "\u9a8c\u8bc1\u6587\u4ef6\u64cd\u4f5c\u8def\u5f84\u5728\u5de5\u4f5c\u76ee\u5f55\u8303\u56f4\u5185\uff0c\u4f7f\u7528 realpath \u89e3\u6790\u7b26\u53f7\u94fe\u63a5" },
  { id: 5, label: "\u547d\u4ee4\u6ce8\u5165\u68c0\u6d4b", color: "#f59e0b", icon: "\uD83D\uDD0D", detail: "\u68c0\u6d4b Shell \u547d\u4ee4\u4e2d\u7684\u6ce8\u5165\u653b\u51fb\u6a21\u5f0f\uff0c\u53c2\u6570\u8f6c\u4e49\u5904\u7406" },
  { id: 6, label: "\u654f\u611f\u6587\u4ef6\u4fdd\u62a4", color: "#ec4899", icon: "\uD83D\uDD12", detail: "\u4fdd\u62a4 .env, .ssh, credentials \u7b49\u654f\u611f\u6587\u4ef6\uff0c\u963b\u6b62\u8bfb\u5199\u64cd\u4f5c" },
  { id: 7, label: "\u6743\u9650\u6a21\u5f0f\u5224\u65ad", color: "#8b5cf6", icon: "\uD83D\uDEE1\uFE0F", detail: "\u6839\u636e --permission-mode \u51b3\u5b9a\uff1a\u81ea\u52a8\u653e\u884c\u3001\u67e5\u7f13\u5b58\u3001\u6216\u9700\u7528\u6237\u786e\u8ba4" },
  { id: 8, label: "\u7528\u6237\u786e\u8ba4", color: "#6366f1", icon: "\uD83D\uDC64", detail: "\u7ec8\u7aef\u6e32\u67d3\u6743\u9650\u5bf9\u8bdd\u6846\uff0c\u7528\u6237\u9009\u62e9 Allow / Always Allow / Deny" },
  { id: 9, label: "\u6267\u884c", color: "#10b981", icon: "\u25B6\uFE0F", detail: "\u901a\u8fc7\u6240\u6709\u68c0\u67e5\u540e\uff0c\u8c03\u7528 Tool.execute() \u6267\u884c\u64cd\u4f5c" },
];

const ATTACK_VECTORS: AttackVector[] = [
  {
    name: "\u63d0\u793a\u6ce8\u5165", nameEn: "Prompt Injection", icon: "\uD83D\uDCAC",
    severity: "high", color: "#ef4444",
    description: "\u6076\u610f\u7528\u6237\u6216\u6587\u4ef6\u5185\u5bb9\u4e2d\u5d4c\u5165\u6307\u4ee4\uff0c\u8bd5\u56fe\u64cd\u63a7 AI \u6267\u884c\u672a\u6388\u6743\u64cd\u4f5c",
    defense: "\u5de5\u5177\u53c2\u6570 Zod Schema \u4e25\u683c\u9a8c\u8bc1 + \u7cfb\u7edf\u63d0\u793a\u8bcd\u9694\u79bb + \u8f93\u5165\u5185\u5bb9\u6d88\u6bd2",
  },
  {
    name: "\u547d\u4ee4\u6ce8\u5165", nameEn: "Command Injection", icon: "\uD83D\uDCBB",
    severity: "high", color: "#f59e0b",
    description: "\u901a\u8fc7 Shell \u547d\u4ee4\u53c2\u6570\u6ce8\u5165\u6076\u610f\u4ee3\u7801\uff0c\u5982 ; rm -rf / \u6216 $(curl ...)",
    defense: "Shell \u53c2\u6570\u8f6c\u4e49 + \u5371\u9669\u547d\u4ee4\u9ed1\u540d\u5355 + \u7528\u6237\u786e\u8ba4\u673a\u5236",
  },
  {
    name: "\u8def\u5f84\u904d\u5386", nameEn: "Path Traversal", icon: "\uD83D\uDCC2",
    severity: "medium", color: "#8b5cf6",
    description: "\u4f7f\u7528 ../ \u6216\u7b26\u53f7\u94fe\u63a5\u9003\u9038\u6c99\u7bb1\u76ee\u5f55\uff0c\u8bbf\u95ee\u7cfb\u7edf\u654f\u611f\u6587\u4ef6",
    defense: "\u6c99\u7bb1\u8def\u5f84\u9650\u5236 + realpath() \u89e3\u6790\u9a8c\u8bc1 + \u7b26\u53f7\u94fe\u63a5\u68c0\u6d4b",
  },
  {
    name: "Token \u6cc4\u9732", nameEn: "Credential Leak", icon: "\uD83D\uDD11",
    severity: "medium", color: "#3b82f6",
    description: "API Key\u3001OAuth Token \u6216\u73af\u5883\u53d8\u91cf\u4e2d\u7684\u51ed\u636e\u88ab\u610f\u5916\u66b4\u9732",
    defense: ".env \u6587\u4ef6\u4fdd\u62a4\u5217\u8868 + \u5185\u5b58\u4e2d Token \u5b89\u5168\u5b58\u50a8 + \u65e5\u5fd7\u8131\u654f",
  },
  {
    name: "\u4f9b\u5e94\u94fe\u653b\u51fb", nameEn: "MCP Supply Chain", icon: "\uD83D\uDD17",
    severity: "low", color: "#64748b",
    description: "\u6076\u610f MCP \u670d\u52a1\u5668\u63d0\u4f9b\u5305\u542b\u540e\u95e8\u7684\u5de5\u5177\uff0c\u6216\u8fd4\u56de\u7be1\u6539\u7684\u6267\u884c\u7ed3\u679c",
    defense: "MCP \u670d\u52a1\u5668\u6743\u9650\u9694\u79bb + \u5de5\u5177\u8c03\u7528\u5ba1\u8ba1\u65e5\u5fd7 + \u7528\u6237\u663e\u5f0f\u6388\u6743",
  },
];

const BEST_PRACTICES: BestPractice[] = [
  { icon: "\uD83D\uDD12", title: "\u4f7f\u7528\u6700\u5c0f\u6743\u9650\u539f\u5219", description: "\u751f\u4ea7\u73af\u5883\u59cb\u7ec8\u4f7f\u7528 Default \u6216 Approve \u6a21\u5f0f\uff0c\u4ec5\u5728 CI/CD \u4e2d\u4f7f\u7528 Bypass\u3002\u914d\u7f6e allowedTools \u767d\u540d\u5355\u9650\u5236\u53ef\u7528\u5de5\u5177\u96c6\u3002" },
  { icon: "\uD83D\uDCCB", title: "\u5b9a\u671f\u5ba1\u67e5\u6743\u9650\u89c4\u5219", description: "\u68c0\u67e5 .claude/settings.json \u4e2d\u7684 allowedTools \u548c blockedTools \u89c4\u5219\uff0c\u79fb\u9664\u4e0d\u518d\u9700\u8981\u7684\u5bbd\u6cdb\u5339\u914d\u6a21\u5f0f\u3002" },
  { icon: "\uD83D\uDEE1\uFE0F", title: "\u4fdd\u62a4\u654f\u611f\u6587\u4ef6\u4e0e\u76ee\u5f55", description: "\u786e\u4fdd .env\u3001.ssh\u3001credentials \u7b49\u6587\u4ef6\u5728\u4fdd\u62a4\u5217\u8868\u4e2d\u3002\u4f7f\u7528 --sandbox \u6807\u5fd7\u9650\u5236\u6587\u4ef6\u64cd\u4f5c\u8303\u56f4\u3002" },
  { icon: "\uD83D\uDD0D", title: "\u76d1\u63a7\u4e0e\u5ba1\u8ba1", description: "\u542f\u7528 Telemetry \u8ffd\u8e2a\u6240\u6709\u5de5\u5177\u8c03\u7528\u3002\u5b9a\u671f\u68c0\u67e5 ~/.claude/logs \u4e2d\u7684\u64cd\u4f5c\u65e5\u5fd7\uff0c\u5173\u6ce8\u5f02\u5e38\u7684\u547d\u4ee4\u6267\u884c\u6a21\u5f0f\u3002" },
  { icon: "\u26A1", title: "\u53ca\u65f6\u66f4\u65b0\u7248\u672c", description: "\u4fdd\u6301 Claude Code CLI \u4e3a\u6700\u65b0\u7248\u672c\u4ee5\u83b7\u53d6\u5b89\u5168\u8865\u4e01\u3002\u5173\u6ce8 GitHub Release \u4e2d\u7684\u5b89\u5168\u76f8\u5173\u66f4\u65b0\u8bf4\u660e\u3002" },
];

const SECTIONS: { key: SectionKey; label: string; icon: string }[] = [
  { key: "overview", label: "\u5b89\u5168\u67b6\u6784", icon: "\uD83C\uDFDB\uFE0F" },
  { key: "permissions", label: "\u6743\u9650\u6a21\u5f0f", icon: "\uD83D\uDD10" },
  { key: "pipeline", label: "\u68c0\u67e5\u6d41\u6c34\u7ebf", icon: "\u2699\uFE0F" },
  { key: "attacks", label: "\u653b\u51fb\u9762\u5206\u6790", icon: "\u26A0\uFE0F" },
  { key: "practices", label: "\u6700\u4f73\u5b9e\u8df5", icon: "\uD83D\uDCA1" },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionNav({ active, onChange }: { active: SectionKey; onChange: (k: SectionKey) => void }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 36, flexWrap: "wrap" }}>
      {SECTIONS.map(s => {
        const isActive = s.key === active;
        return (
          <motion.button
            key={s.key}
            onClick={() => onChange(s.key)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: "8px 18px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13,
              display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", outline: "none",
              border: isActive ? "1.5px solid rgba(239,68,68,0.5)" : "1.5px solid rgba(148,163,184,0.12)",
              background: isActive ? "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(139,92,246,0.1))" : "rgba(30,32,44,0.6)",
              color: isActive ? "#e2e8f0" : "#64748b",
              boxShadow: isActive ? "0 0 12px rgba(239,68,68,0.15)" : "none",
              transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: 16 }}>{s.icon}</span>{s.label}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ---- Section 1: Security Architecture Overview ---- */

function OverviewSection() {
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);
  const layerCount = SECURITY_LAYERS.length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: "#94a3b8", maxWidth: 550, margin: "0 auto" }}>
          Claude Code \u91c7\u7528 5 \u5c42\u7eb5\u6df1\u9632\u5fa1\u67b6\u6784\uff0c\u6bcf\u4e00\u5c42\u90fd\u6784\u6210\u72ec\u7acb\u7684\u5b89\u5168\u8fb9\u754c\u3002
        </p>
      </div>

      {/* Nested layers visualization */}
      <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 660 }}>
          {SECURITY_LAYERS.map((layer, i) => {
            const inset = i * 36;
            const isHl = hoveredLayer === layer.id;
            const baseOpacity = 0.08 + i * 0.03;
            return (
              <motion.div
                key={layer.id}
                onMouseEnter={() => setHoveredLayer(layer.id)}
                onMouseLeave={() => setHoveredLayer(null)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                style={{
                  position: i === 0 ? "relative" : "absolute",
                  top: inset, left: inset, right: inset,
                  bottom: i === 0 ? undefined : inset,
                  height: i === 0 ? 340 : undefined,
                  borderRadius: 16 - i * 1.5,
                  border: `1.5px solid ${isHl ? layer.color : layer.color + "44"}`,
                  background: isHl ? `${layer.color}18` : `${layer.color}${Math.round(baseOpacity * 255).toString(16).padStart(2, "0")}`,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  boxShadow: isHl ? `0 0 24px ${layer.color}25, inset 0 0 30px ${layer.color}08` : "none",
                  zIndex: i,
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                  padding: "8px 14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", background: layer.color,
                    boxShadow: `0 0 6px ${layer.color}66`,
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: layer.color, letterSpacing: 0.5 }}>
                    {layer.label}
                  </span>
                  <span style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>
                    ({layer.labelEn})
                  </span>
                </div>
              </motion.div>
            );
          })}
          {/* Center text */}
          <div style={{
            position: "absolute",
            top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            textAlign: "center", zIndex: layerCount + 1, pointerEvents: "none",
          }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{"\uD83D\uDD12"}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>\u7eb5\u6df1\u9632\u5fa1</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>5 \u5c42\u5b89\u5168\u8fb9\u754c</div>
          </div>
        </div>
      </div>

      {/* Layer descriptions */}
      <AnimatePresence>
        {hoveredLayer && (
          <motion.div
            key={hoveredLayer}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              padding: "14px 20px", borderRadius: 12, marginTop: 12,
              border: `1px solid ${SECURITY_LAYERS.find(l => l.id === hoveredLayer)?.color}44`,
              background: "rgba(30,32,44,0.9)",
            }}>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                {SECURITY_LAYERS.find(l => l.id === hoveredLayer)?.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---- Section 2: Permission Mode Comparison ---- */

function PermissionsSection() {
  const modes = ["Default", "Approve", "AutoApprove", "Bypass"] as const;
  const modeKeys = ["default", "approve", "autoApprove", "bypass"] as const;
  const modeColors = ["#ef4444", "#f59e0b", "#10b981", "#64748b"];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: "#94a3b8", maxWidth: 550, margin: "0 auto" }}>
          4 \u7ea7\u6743\u9650\u6a21\u5f0f\u4ece\u4e25\u683c\u5230\u5bbd\u677e\uff0c\u9002\u914d\u4e0d\u540c\u4f7f\u7528\u573a\u666f\u7684\u5b89\u5168\u9700\u6c42\u3002
        </p>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%", borderCollapse: "separate", borderSpacing: 0,
          borderRadius: 14, overflow: "hidden",
          border: "1px solid rgba(148,163,184,0.1)",
        }}>
          <thead>
            <tr>
              <th style={{
                padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700,
                color: "#94a3b8", background: "rgba(30,32,44,0.9)",
                borderBottom: "1px solid rgba(148,163,184,0.1)",
              }}>
                \u7ef4\u5ea6
              </th>
              {modes.map((mode, i) => (
                <th key={mode} style={{
                  padding: "14px 12px", textAlign: "center", fontSize: 13, fontWeight: 700,
                  color: modeColors[i], background: "rgba(30,32,44,0.9)",
                  borderBottom: "1px solid rgba(148,163,184,0.1)",
                  borderLeft: "1px solid rgba(148,163,184,0.06)",
                }}>
                  {mode}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERM_ROWS.map((row, ri) => (
              <motion.tr
                key={row.dimension}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: ri * 0.06, duration: 0.3 }}
                style={{ background: ri % 2 === 0 ? "rgba(15,17,25,0.5)" : "rgba(30,32,44,0.4)" }}
              >
                <td style={{
                  padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#e2e8f0",
                  borderBottom: "1px solid rgba(148,163,184,0.06)",
                  whiteSpace: "nowrap",
                }}>
                  {row.dimension}
                </td>
                {modeKeys.map((mk, mi) => {
                  const cell = row[mk];
                  return (
                    <td key={mk} style={{
                      padding: "10px 12px", textAlign: "center", fontSize: 13,
                      borderBottom: "1px solid rgba(148,163,184,0.06)",
                      borderLeft: "1px solid rgba(148,163,184,0.06)",
                      color: "#94a3b8",
                    }}>
                      <span style={{ fontSize: 16, marginRight: 4 }}>{cell.icon}</span>
                      <span style={{ fontSize: 12 }}>{cell.text}</span>
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

/* ---- Section 3: Security Check Pipeline ---- */

function PipelineSection() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: "#94a3b8", maxWidth: 580, margin: "0 auto" }}>
          \u6bcf\u4e2a\u5de5\u5177\u8c03\u7528\u90fd\u7ecf\u8fc7 9 \u6b65\u5b89\u5168\u68c0\u67e5\u6d41\u6c34\u7ebf\uff0c\u4efb\u4e00\u6b65\u9aa4\u5931\u8d25\u5373\u7ec8\u6b62\u6267\u884c\u3002
        </p>
      </div>

      {/* Horizontal pipeline (wrapping) */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 0, justifyContent: "center",
        alignItems: "flex-start", padding: "8px 0",
      }}>
        {PIPELINE_STEPS.map((step, i) => {
          const isExpanded = expandedStep === step.id;
          return (
            <div key={step.id} style={{ display: "flex", alignItems: "center" }}>
              {/* Step card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                style={{
                  padding: "10px 14px", borderRadius: 12, cursor: "pointer",
                  border: `1.5px solid ${isExpanded ? step.color : step.color + "44"}`,
                  background: isExpanded ? `${step.color}18` : "rgba(30,32,44,0.8)",
                  boxShadow: isExpanded ? `0 0 16px ${step.color}22` : "none",
                  transition: "all 0.25s", textAlign: "center", minWidth: 80,
                  position: "relative",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>{step.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: step.color, lineHeight: 1.3 }}>
                  {step.label}
                </div>
                <div style={{ fontSize: 9, color: "#475569", marginTop: 2 }}>#{step.id}</div>
                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{
                        marginTop: 8, padding: "8px 4px", borderTop: `1px solid ${step.color}33`,
                        fontSize: 11, color: "#94a3b8", lineHeight: 1.5, textAlign: "left",
                      }}>
                        {step.detail}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              {/* Arrow connector */}
              {i < PIPELINE_STEPS.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.06 + 0.03 }}
                  style={{ display: "flex", alignItems: "center", padding: "0 2px" }}
                >
                  <svg width="20" height="12" viewBox="0 0 20 12">
                    <path d="M0 6 L14 6 M10 2 L16 6 L10 10" fill="none"
                      stroke={step.color + "66"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* User confirmation highlight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          marginTop: 20, padding: "12px 16px", borderRadius: 10,
          border: "1px solid rgba(99,102,241,0.3)",
          background: "rgba(99,102,241,0.08)",
          display: "flex", alignItems: "center", gap: 10,
        }}
      >
        <span style={{ fontSize: 18 }}>{"\uD83D\uDCA1"}</span>
        <span style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
          \u6b65\u9aa4 8\u300c\u7528\u6237\u786e\u8ba4\u300d\u4ec5\u5728\u6743\u9650\u6a21\u5f0f\u5224\u65ad\u4e3a\u9700\u8981\u786e\u8ba4\u65f6\u89e6\u53d1\u3002Bypass \u6a21\u5f0f\u4f1a\u8df3\u8fc7\u6b64\u6b65\u9aa4\u76f4\u63a5\u6267\u884c\u3002
        </span>
      </motion.div>
    </motion.div>
  );
}

/* ---- Section 4: Attack Surface Analysis ---- */

function AttacksSection() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const severityLabels: Record<string, { text: string; bg: string; color: string }> = {
    high: { text: "\u9ad8\u5371", bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
    medium: { text: "\u4e2d\u5371", bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
    low: { text: "\u4f4e\u5371", bg: "rgba(148,163,184,0.12)", color: "#94a3b8" },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: "#94a3b8", maxWidth: 550, margin: "0 auto" }}>
          \u4e3b\u8981\u653b\u51fb\u5411\u91cf\u53ca Claude Code \u7684\u9632\u5fa1\u63aa\u65bd\u5206\u6790\u3002
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ATTACK_VECTORS.map((atk, i) => {
          const isExpanded = expandedIdx === i;
          const sev = severityLabels[atk.severity];
          return (
            <motion.div
              key={atk.nameEn}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              onClick={() => setExpandedIdx(isExpanded ? null : i)}
              style={{
                padding: "14px 18px", borderRadius: 14, cursor: "pointer",
                border: `1.5px solid ${isExpanded ? atk.color + "66" : "rgba(148,163,184,0.1)"}`,
                background: isExpanded
                  ? `linear-gradient(135deg, ${atk.color}10, rgba(30,32,44,0.9))`
                  : "linear-gradient(135deg, rgba(30,32,44,0.9), rgba(22,24,34,0.95))",
                transition: "all 0.25s",
                boxShadow: isExpanded ? `0 0 20px ${atk.color}15` : "none",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22 }}>{atk.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{atk.name}</span>
                    <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'Fira Code', monospace" }}>
                      {atk.nameEn}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                      background: sev.bg, color: sev.color,
                    }}>
                      {sev.text}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0", lineHeight: 1.5 }}>
                    {atk.description}
                  </p>
                </div>
                <motion.svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <path d="M4 6L8 10L12 6" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                </motion.svg>
              </div>

              {/* Defense measures */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{
                      marginTop: 12, paddingTop: 12,
                      borderTop: `1px solid ${atk.color}22`,
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ fontSize: 14 }}>{"\uD83D\uDEE1\uFE0F"}</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#10b981", marginBottom: 4 }}>
                            \u9632\u5fa1\u63aa\u65bd
                          </div>
                          <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                            {atk.defense}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ---- Section 5: Best Practices ---- */

function PracticesSection() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: "#94a3b8", maxWidth: 550, margin: "0 auto" }}>
          \u9075\u5faa\u4ee5\u4e0b\u5b89\u5168\u6700\u4f73\u5b9e\u8df5\uff0c\u6700\u5927\u5316 Claude Code \u7684\u5b89\u5168\u6027\u3002
        </p>
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {BEST_PRACTICES.map((bp, i) => (
          <motion.div
            key={bp.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            style={{
              padding: "18px 20px", borderRadius: 14,
              border: "1px solid rgba(148,163,184,0.1)",
              background: "linear-gradient(135deg, rgba(30,32,44,0.9), rgba(22,24,34,0.95))",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 24 }}>{bp.icon}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{bp.title}</span>
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
              {bp.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function SecurityModel() {
  const [activeSection, setActiveSection] = useState<SectionKey>("overview");

  return (
    <section id="security-model" style={{ padding: "80px 20px", maxWidth: 900, margin: "0 auto" }}>
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
          background: "linear-gradient(135deg, #fca5a5, #c4b5fd)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          \uD83D\uDEE1\uFE0F \u5b89\u5168\u6a21\u578b\u6df1\u5ea6\u89e3\u6790
        </h2>
        <p style={{ color: "#64748b", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
          \u6df1\u5165\u5206\u6790 Claude Code \u7684\u591a\u5c42\u5b89\u5168\u67b6\u6784\u3001\u6743\u9650\u63a7\u5236\u673a\u5236\u3001\u653b\u51fb\u9632\u5fa1\u7b56\u7565\u3002
        </p>
      </motion.div>

      {/* Section navigation */}
      <SectionNav active={activeSection} onChange={setActiveSection} />

      {/* Section content */}
      <AnimatePresence mode="wait">
        {activeSection === "overview" && <OverviewSection key="overview" />}
        {activeSection === "permissions" && <PermissionsSection key="permissions" />}
        {activeSection === "pipeline" && <PipelineSection key="pipeline" />}
        {activeSection === "attacks" && <AttacksSection key="attacks" />}
        {activeSection === "practices" && <PracticesSection key="practices" />}
      </AnimatePresence>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        style={{ textAlign: "center", fontSize: 12, color: "#475569", marginTop: 40 }}
      >
        \u5b89\u5168\u6a21\u578b\u5206\u6790\u57fa\u4e8e Claude Code CLI \u5f00\u6e90\u4ee3\u7801 \u00b7 \u5b89\u5168\u5efa\u8bae\u4ec5\u4f9b\u53c2\u8003
      </motion.p>
    </section>
  );
}
