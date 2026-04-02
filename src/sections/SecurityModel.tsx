import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SecurityLayer {
  id: string;
  label: string;
  labelEn: string;
  color: string;
  borderColor: string;
  bgColor: string;
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
  { id: "network", label: "外部边界", labelEn: "Network", color: "#dc2626", borderColor: "#fecaca", bgColor: "#fef2f2", description: "网络层安全：TLS 加密传输、API 端点访问控制、速率限制" },
  { id: "auth", label: "认证边界", labelEn: "Auth", color: "#d97706", borderColor: "#fde68a", bgColor: "#fffbeb", description: "身份验证：OAuth2 + PKCE、Token 管理、密钥轮换" },
  { id: "permission", label: "权限边界", labelEn: "Permission", color: "#3b82f6", borderColor: "#bfdbfe", bgColor: "#eff6ff", description: "4 级权限模式、规则引擎匹配、用户确认交互" },
  { id: "sandbox", label: "沙箱边界", labelEn: "Sandbox", color: "#059669", borderColor: "#a7f3d0", bgColor: "#ecfdf5", description: "工作目录限制、路径遍历防护、文件系统隔离" },
  { id: "execution", label: "工具执行", labelEn: "Execution", color: "#7c3aed", borderColor: "#ddd6fe", bgColor: "#f5f3ff", description: "参数 Zod Schema 验证、命令注入防护、超时控制" },
];

const PERM_ROWS: PermRow[] = [
  { dimension: "文件读取", default: { icon: "✅", text: "自动" }, approve: { icon: "✅", text: "自动" }, autoApprove: { icon: "✅", text: "自动" }, bypass: { icon: "✅", text: "自动" } },
  { dimension: "文件写入", default: { icon: "❓", text: "需确认" }, approve: { icon: "❓", text: "需确认" }, autoApprove: { icon: "✅", text: "自动" }, bypass: { icon: "✅", text: "自动" } },
  { dimension: "Shell 命令", default: { icon: "❓", text: "需确认" }, approve: { icon: "🔄", text: "已批准放行" }, autoApprove: { icon: "✅", text: "自动" }, bypass: { icon: "✅", text: "自动" } },
  { dimension: "危险操作", default: { icon: "❓", text: "需确认" }, approve: { icon: "❓", text: "需确认" }, autoApprove: { icon: "❓", text: "需确认" }, bypass: { icon: "✅", text: "自动" } },
  { dimension: "MCP 工具", default: { icon: "❓", text: "需确认" }, approve: { icon: "❓", text: "需确认" }, autoApprove: { icon: "❓", text: "需确认" }, bypass: { icon: "✅", text: "自动" } },
  { dimension: "适用场景", default: { icon: "🛡️", text: "初次使用/敏感项目" }, approve: { icon: "💻", text: "日常开发" }, autoApprove: { icon: "⚡", text: "高效开发" }, bypass: { icon: "⚙️", text: "CI/CD 自动化" } },
];

const PIPELINE_STEPS: PipelineStep[] = [
  { id: 1, label: "工具请求", color: "#64748b", icon: "📥", detail: "AI 响应中提取 tool_use 请求，解析工具名称和参数" },
  { id: 2, label: "黑名单检查", color: "#dc2626", icon: "🚫", detail: "检查 blockedTools 配置，匹配则直接拒绝执行" },
  { id: 3, label: "白名单匹配", color: "#059669", icon: "✅", detail: "检查 allowedTools 配置，支持通配符匹配如 \"Bash:npm *\"" },
  { id: 4, label: "路径范围验证", color: "#3b82f6", icon: "📁", detail: "验证文件操作路径在工作目录范围内，使用 realpath 解析符号链接" },
  { id: 5, label: "命令注入检测", color: "#d97706", icon: "🔍", detail: "检测 Shell 命令中的注入攻击模式，参数转义处理" },
  { id: 6, label: "敏感文件保护", color: "#ec4899", icon: "🔒", detail: "保护 .env, .ssh, credentials 等敏感文件，阻止读写操作" },
  { id: 7, label: "权限模式判断", color: "#7c3aed", icon: "🛡️", detail: "根据 --permission-mode 决定：自动放行、查缓存、或需用户确认" },
  { id: 8, label: "用户确认", color: "#4f46e5", icon: "👤", detail: "终端渲染权限对话框，用户选择 Allow / Always Allow / Deny" },
  { id: 9, label: "执行", color: "#059669", icon: "▶️", detail: "通过所有检查后，调用 Tool.execute() 执行操作" },
];

const ATTACK_VECTORS: AttackVector[] = [
  { name: "提示注入", nameEn: "Prompt Injection", icon: "💬", severity: "high", color: "#dc2626", description: "恶意用户或文件内容中嵌入指令，试图操控 AI 执行未授权操作", defense: "工具参数 Zod Schema 严格验证 + 系统提示词隔离 + 输入内容消毒" },
  { name: "命令注入", nameEn: "Command Injection", icon: "💻", severity: "high", color: "#d97706", description: "通过 Shell 命令参数注入恶意代码，如 ; rm -rf / 或 $(curl ...)", defense: "Shell 参数转义 + 危险命令黑名单 + 用户确认机制" },
  { name: "路径遍历", nameEn: "Path Traversal", icon: "📂", severity: "medium", color: "#7c3aed", description: "使用 ../ 或符号链接逃逸沙箱目录，访问系统敏感文件", defense: "沙箱路径限制 + realpath() 解析验证 + 符号链接检测" },
  { name: "Token 泄露", nameEn: "Credential Leak", icon: "🔑", severity: "medium", color: "#3b82f6", description: "密钥、OAuth Token 或环境变量中的凭据被意外暴露", defense: ".env 文件保护列表 + 内存中 Token 安全存储 + 日志脱敏" },
  { name: "供应链攻击", nameEn: "MCP Supply Chain", icon: "🔗", severity: "low", color: "#64748b", description: "恶意 MCP 服务器提供包含后门的工具，或返回篡改的执行结果", defense: "MCP 服务器权限隔离 + 工具调用审计日志 + 用户显式授权" },
];

const BEST_PRACTICES: BestPractice[] = [
  { icon: "🔒", title: "使用最小权限原则", description: "生产环境始终使用 Default 或 Approve 模式，仅在 CI/CD 中使用 Bypass。配置 allowedTools 白名单限制可用工具集。" },
  { icon: "📋", title: "定期审查权限规则", description: "检查 .claude/settings.json 中的 allowedTools 和 blockedTools 规则，移除不再需要的宽泛匹配模式。" },
  { icon: "🛡️", title: "保护敏感文件与目录", description: "确保 .env、.ssh、credentials 等文件在保护列表中。使用 --sandbox 标志限制文件操作范围。" },
  { icon: "🔍", title: "监控与审计", description: "启用 Telemetry 追踪所有工具调用。定期检查 ~/.claude/logs 中的操作日志，关注异常的命令执行模式。" },
  { icon: "⚡", title: "及时更新版本", description: "保持 Claude Code CLI 为最新版本以获取安全补丁。关注 GitHub Release 中的安全相关更新说明。" },
];

const SECTIONS: { key: SectionKey; label: string; icon: string }[] = [
  { key: "overview", label: "安全架构", icon: "🏛️" },
  { key: "permissions", label: "权限模式", icon: "🔐" },
  { key: "pipeline", label: "检查流水线", icon: "⚙️" },
  { key: "attacks", label: "攻击面分析", icon: "⚠️" },
  { key: "practices", label: "最佳实践", icon: "💡" },
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
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "8px 18px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13,
              display: "flex", alignItems: "center", gap: 6, fontFamily: "'Inter', system-ui, sans-serif", outline: "none",
              border: isActive ? "1.5px solid #3b82f6" : "1.5px solid #e2e8f0",
              background: isActive ? "#eff6ff" : "#ffffff",
              color: isActive ? "#3b82f6" : "#64748b",
              boxShadow: isActive ? "0 1px 3px rgba(59,130,246,0.15)" : "0 1px 2px rgba(0,0,0,0.04)",
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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: "#475569", maxWidth: 550, margin: "0 auto" }}>
          Claude Code 采用 5 层纵深防御架构，每一层都构成独立的安全边界。
        </p>
      </div>

      {/* Nested layers visualization */}
      <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 660 }}>
          {SECURITY_LAYERS.map((layer, i) => {
            const inset = i * 36;
            const isHl = hoveredLayer === layer.id;
            return (
              <motion.div
                key={layer.id}
                onMouseEnter={() => setHoveredLayer(layer.id)}
                onMouseLeave={() => setHoveredLayer(null)}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                style={{
                  position: i === 0 ? "relative" : "absolute",
                  top: inset, left: inset, right: inset,
                  bottom: i === 0 ? undefined : inset,
                  height: i === 0 ? 340 : undefined,
                  borderRadius: 16 - i * 1.5,
                  border: `2px solid ${isHl ? layer.color : layer.borderColor}`,
                  background: isHl ? layer.bgColor : "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  boxShadow: isHl ? `0 2px 12px ${layer.color}15` : "0 1px 3px rgba(0,0,0,0.04)",
                  zIndex: i,
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                  padding: "8px 14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", background: layer.color,
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: layer.color, letterSpacing: 0.5 }}>
                    {layer.label}
                  </span>
                  <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>
                    ({layer.labelEn})
                  </span>
                </div>
              </motion.div>
            );
          })}
          {/* Center text */}
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            textAlign: "center", zIndex: layerCount + 1, pointerEvents: "none",
          }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{"🔒"}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>纵深防御</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>5 层安全边界</div>
          </div>
        </div>
      </div>

      {/* Layer descriptions */}
      <AnimatePresence>
        {hoveredLayer && (
          <motion.div key={hoveredLayer} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div style={{
              padding: "14px 20px", borderRadius: 12, marginTop: 12,
              border: `1px solid ${SECURITY_LAYERS.find(l => l.id === hoveredLayer)?.borderColor}`,
              background: SECURITY_LAYERS.find(l => l.id === hoveredLayer)?.bgColor,
            }}>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: 0 }}>
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
  const modeColors = ["#dc2626", "#d97706", "#059669", "#64748b"];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: "#475569", maxWidth: 550, margin: "0 auto" }}>
          4 级权限模式从严格到宽松，适配不同使用场景的安全需求。
        </p>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="data-table" style={{
          width: "100%", borderCollapse: "separate", borderSpacing: 0,
          borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          <thead>
            <tr>
              <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#475569", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                维度
              </th>
              {modes.map((mode, i) => (
                <th key={mode} style={{ padding: "14px 12px", textAlign: "center", fontSize: 13, fontWeight: 700, color: modeColors[i], background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", borderLeft: "1px solid #e2e8f0" }}>
                  {mode}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERM_ROWS.map((row, ri) => (
              <motion.tr
                key={row.dimension}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: ri * 0.05, duration: 0.25 }}
                style={{ background: ri % 2 === 0 ? "#ffffff" : "#f8fafc" }}
              >
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#0f172a", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                  {row.dimension}
                </td>
                {modeKeys.map((mk) => {
                  const cell = row[mk];
                  return (
                    <td key={mk} style={{ padding: "10px 12px", textAlign: "center", fontSize: 13, borderBottom: "1px solid #f1f5f9", borderLeft: "1px solid #f1f5f9", color: "#475569" }}>
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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: "#475569", maxWidth: 580, margin: "0 auto" }}>
          每个工具调用都经过 9 步安全检查流水线，任一步骤失败即终止执行。
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 0, justifyContent: "center", alignItems: "flex-start", padding: "8px 0" }}>
        {PIPELINE_STEPS.map((step, i) => {
          const isExpanded = expandedStep === step.id;
          return (
            <div key={step.id} style={{ display: "flex", alignItems: "center" }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                style={{
                  padding: "10px 14px", borderRadius: 12, cursor: "pointer",
                  border: `1.5px solid ${isExpanded ? step.color : "#e2e8f0"}`,
                  background: isExpanded ? "#f8fafc" : "#ffffff",
                  boxShadow: isExpanded ? "0 2px 8px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.06)",
                  transition: "all 0.25s", textAlign: "center", minWidth: 80,
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>{step.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: step.color, lineHeight: 1.3 }}>{step.label}</div>
                <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>#{step.id}</div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                      <div style={{ marginTop: 8, padding: "8px 4px", borderTop: `1px solid #e2e8f0`, fontSize: 11, color: "#475569", lineHeight: 1.5, textAlign: "left" }}>
                        {step.detail}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              {i < PIPELINE_STEPS.length - 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 + 0.03 }} style={{ display: "flex", alignItems: "center", padding: "0 2px" }}>
                  <svg width="20" height="12" viewBox="0 0 20 12">
                    <path d="M0 6 L14 6 M10 2 L16 6 L10 10" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{
        marginTop: 20, padding: "12px 16px", borderRadius: 10,
        border: "1px solid #c7d2fe", background: "#eef2ff",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 18 }}>{"💡"}</span>
        <span style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
          步骤 8「用户确认」仅在权限模式判断为需要确认时触发。Bypass 模式会跳过此步骤直接执行。
        </span>
      </motion.div>
    </motion.div>
  );
}

/* ---- Section 4: Attack Surface Analysis ---- */

function AttacksSection() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const severityLabels: Record<string, { text: string; bg: string; color: string; border: string }> = {
    high: { text: "高危", bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    medium: { text: "中危", bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    low: { text: "低危", bg: "#f8fafc", color: "#94a3b8", border: "#e2e8f0" },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: "#475569", maxWidth: 550, margin: "0 auto" }}>
          主要攻击向量及 Claude Code 的防御措施分析。
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ATTACK_VECTORS.map((atk, i) => {
          const isExpanded = expandedIdx === i;
          const sev = severityLabels[atk.severity];
          return (
            <motion.div
              key={atk.nameEn}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              onClick={() => setExpandedIdx(isExpanded ? null : i)}
              style={{
                padding: "14px 18px", borderRadius: 14, cursor: "pointer",
                borderLeft: `4px solid ${atk.color}`,
                border: `1px solid ${isExpanded ? "#cbd5e1" : "#e2e8f0"}`,
                borderLeftWidth: 4, borderLeftColor: atk.color,
                background: "#ffffff",
                transition: "all 0.25s",
                boxShadow: isExpanded ? "0 2px 8px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22 }}>{atk.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{atk.name}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>{atk.nameEn}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>{sev.text}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#475569", margin: "4px 0 0", lineHeight: 1.5 }}>{atk.description}</p>
                </div>
                <motion.svg width="16" height="16" viewBox="0 0 16 16" fill="none" animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <path d="M4 6L8 10L12 6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                </motion.svg>
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ fontSize: 14 }}>{"🛡️"}</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#059669", marginBottom: 4 }}>防御措施</div>
                          <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: 0 }}>{atk.defense}</p>
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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: "#475569", maxWidth: 550, margin: "0 auto" }}>
          遵循以下安全最佳实践，最大化 Claude Code 的安全性。
        </p>
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {BEST_PRACTICES.map((bp, i) => (
          <motion.div
            key={bp.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            style={{
              padding: "18px 20px", borderRadius: 14,
              border: "1px solid #e2e8f0", background: "#ffffff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 24 }}>{bp.icon}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{bp.title}</span>
            </div>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: 0 }}>{bp.description}</p>
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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        style={{ textAlign: "center", marginBottom: 40 }}
      >
        <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12, color: "#0f172a" }}>
          {"🛡️"} 安全模型深度解析
        </h2>
        <p style={{ color: "#475569", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
          深入分析 Claude Code 的多层安全架构、权限控制机制、攻击防御策略。
        </p>
      </motion.div>

      <SectionNav active={activeSection} onChange={setActiveSection} />

      <AnimatePresence mode="wait">
        {activeSection === "overview" && <OverviewSection key="overview" />}
        {activeSection === "permissions" && <PermissionsSection key="permissions" />}
        {activeSection === "pipeline" && <PipelineSection key="pipeline" />}
        {activeSection === "attacks" && <AttacksSection key="attacks" />}
        {activeSection === "practices" && <PracticesSection key="practices" />}
      </AnimatePresence>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 40 }}
      >
        安全模型分析基于 Claude Code CLI 开源代码 · 安全建议仅供参考
      </motion.p>
    </section>
  );
}
