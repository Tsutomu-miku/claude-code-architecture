import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/* ------------------------------------------------------------------ */
/*  Data: 10-step boot sequence                                       */
/* ------------------------------------------------------------------ */

interface BootStep {
  step: number
  title: string
  sourceFile: string
  descriptions: string[]
  codePath: string
  icon: string
  timing: string
}

const bootSteps: BootStep[] = [
  {
    step: 1,
    title: 'CLI 参数解析',
    sourceFile: 'cli.ts',
    descriptions: [
      'Commander.js 解析命令行参数：--model, --allowedTools, --permission-mode, --print, --verbose 等，将原始字符串转换为结构化选项对象。',
      '验证每个参数的合法性——例如 --model 必须匹配已知模型列表，--permission-mode 仅接受 default/plan/bypassPermissions 三种值。',
      '为未提供的可选参数设置合理默认值：model 默认为 claude-sonnet-4-20250514，permission-mode 默认为 default。',
      '检测 --help 或 --version 标志，直接输出帮助文本或版本号并以 process.exit(0) 退出。',
      '扫描环境变量覆盖项（ANTHROPIC_API_KEY、CLAUDE_MODEL 等），环境变量优先级介于配置文件和 CLI 参数之间。',
    ],
    codePath: 'cli.ts → parseArguments() → validateOptions()',
    icon: '⌘',
    timing: '~12ms',
  },
  {
    step: 2,
    title: '环境检测',
    sourceFile: 'environment.ts',
    descriptions: [
      '检测 Bun 运行时版本号，确保 >= 1.0；同时识别宿主操作系统以决定路径分隔符和信号处理策略。',
      '探测终端类型和能力：区分 iTerm2、Alacritty、Windows Terminal 等，决定是否启用富文本渲染。',
      '检查外部依赖工具的可用性：ripgrep（rg）和 git。不可用时降级为 Node.js 原生方案。',
      '识别 CI/CD 环境：检查 GITHUB_ACTIONS、GITLAB_CI 等特征环境变量，自动切换为 headless 模式。',
      '判断 IDE 桥接模式——检测 VS Code Extension Host 的 IPC 通道标识符。',
    ],
    codePath: 'environment.ts → detectEnvironment() → checkDependencies()',
    icon: '🔍',
    timing: '~8ms',
  },
  {
    step: 3,
    title: '配置加载',
    sourceFile: 'config.ts',
    descriptions: [
      '实现三层配置合并策略：全局配置 → 项目配置 → CLI 参数，CLI 拥有最高优先级。',
      '每层配置经过 JSON Schema 校验，确保字段类型正确、值在合法范围内。',
      '加载工具权限规则：解析 allowedTools 和 blockedTools 数组，支持 glob 模式匹配。',
      '解析 MCP 服务器配置：读取 command、args、env、cwd 以及传输方式（stdio 或 sse）。',
      '合并完成后通过 Object.freeze() 冻结最终配置对象，防止运行时意外修改。',
    ],
    codePath: 'config.ts → loadConfig() → mergeConfigs()',
    icon: '⚙',
    timing: '~15ms',
  },
  {
    step: 4,
    title: '认证初始化',
    sourceFile: 'auth.ts',
    descriptions: [
      '按优先级链检查凭证来源：环境变量 → 配置文件 → OAuth Token。找到第一个有效凭证即停止。',
      'OAuth 流程中检查 access_token 的 exp 时间戳，过期则使用 refresh_token 刷新。',
      '初始化 JWT 解码器，解析用户信息和权限声明。',
      '设置多租户上下文：如果令牌包含 org_id，附带 X-Organization-ID 请求头。',
      '向 /v1/messages 端点发送 ping 请求验证凭证有效性。',
    ],
    codePath: 'auth.ts → initAuth() → validateCredentials()',
    icon: '🔐',
    timing: '~45ms',
  },
  {
    step: 5,
    title: 'Feature Flag 同步',
    sourceFile: 'featureFlags.ts',
    descriptions: [
      '连接 GrowthBook 远程配置服务器，拉取最新的 Feature Flag 配置 JSON。',
      '基于用户 ID 和运行环境计算每个 flag 的实际状态，确定性哈希算法保证一致性。',
      '缓存 flag 快照到本地文件系统，并启动后台定时刷新。',
      '网络超时时优雅降级为缓存值或编译期默认值。',
      '当前活跃 flag：enablePowerMode、mcpToolDiscovery、streamingMarkdown 等。',
    ],
    codePath: 'featureFlags.ts → syncFlags() → evaluateFlags()',
    icon: '🚩',
    timing: '~120ms',
  },
  {
    step: 6,
    title: 'MCP 服务连接',
    sourceFile: 'mcpClient.ts',
    descriptions: [
      '扫描配置中定义的所有 MCP 服务器条目。',
      '并行连接：stdio 模式用 child_process.spawn，SSE 模式建立 HTTP 长连接。',
      '发送 initialize 握手请求，协商能力集，调用 tools/list 获取工具定义。',
      '以 "mcp__<serverName>__<toolName>" 命名规范注册到全局工具注册表。',
      '设置心跳检测和自动重连逻辑，指数退避重试最多 3 次。',
    ],
    codePath: 'mcpClient.ts → connectServers() → discoverTools()',
    icon: '🔌',
    timing: '~200ms',
  },
  {
    step: 7,
    title: '工具系统初始化',
    sourceFile: 'tools/index.ts',
    descriptions: [
      '批量注册 40+ 内置工具：文件操作、搜索、终端、浏览器、多模态等类别。',
      '每个工具提供完整元数据：名称、描述、JSON Schema 参数、权限级别、超时设置。',
      '合并 MCP 动态工具，包装为统一的 Tool 接口。',
      '应用 allowedTools/blockedTools 过滤规则，glob 匹配筛选。',
      '初始化运行时状态：重置计数器、预热缓存、确保零冷启动延迟。',
    ],
    codePath: 'tools/index.ts → registerBuiltinTools() → applyFilters()',
    icon: '🧰',
    timing: '~18ms',
  },
  {
    step: 8,
    title: '权限系统初始化',
    sourceFile: 'permissions.ts',
    descriptions: [
      '根据 --permission-mode 设置全局权限级别：default / plan / bypassPermissions。',
      '从项目级配置加载自定义权限规则，支持白/黑名单策略。',
      '初始化权限缓存，记录当前会话中已批准的操作模式。',
      '设置 Fail-Closed 默认策略——未匹配规则的操作默认拒绝。',
      '注册权限检查中间件到工具执行管线。',
    ],
    codePath: 'permissions.ts → initPermissions() → loadRules()',
    icon: '🛡',
    timing: '~5ms',
  },
  {
    step: 9,
    title: 'Telemetry 初始化',
    sourceFile: 'telemetry.ts',
    descriptions: [
      '初始化 OpenTelemetry SDK 三大信号管线：Tracer、Meter、Logger。',
      '配置 Span 导出器：开发环境用 Console，生产环境用 OTLP。',
      '创建根 Span "claude-code-session"，设置会话 ID、用户 ID、环境信息。',
      '注册全局错误处理器，将异常记录到当前 Span。',
      '并行初始化 Sentry 错误追踪，与 OpenTelemetry 数据互通。',
    ],
    codePath: 'telemetry.ts → initTelemetry() → createRootSpan()',
    icon: '📡',
    timing: '~22ms',
  },
  {
    step: 10,
    title: 'UI 渲染启动',
    sourceFile: 'main.tsx',
    descriptions: [
      '根据运行模式分支：REPL 交互模式用 React + Ink，Headless 直接输出到 stdout。',
      '初始化 UI 组件树：<InputBox />、<OutputArea />、<StatusBar />。',
      '显示欢迎信息和系统状态摘要。',
      '进入主事件循环（REPL Loop）：等待输入 → 流式调用 API → 执行工具 → 循环。',
      '注册优雅退出处理器：关闭 MCP、导出遗测、保存历史。',
    ],
    codePath: 'main.tsx → render(<App />) → REPL.startLoop()',
    icon: '🖥',
    timing: '~25ms',
  },
]

/* ------------------------------------------------------------------ */
/*  Timing summary data                                               */
/* ------------------------------------------------------------------ */

interface TimingEntry {
  label: string
  ms: number
  color: string
}

const timingBreakdown: TimingEntry[] = [
  { label: 'CLI 解析 + 环境检测', ms: 20, color: '#3b82f6' },
  { label: '配置加载 + 认证', ms: 60, color: '#7c3aed' },
  { label: 'Feature Flags', ms: 120, color: '#06b6d4' },
  { label: 'MCP 服务连接', ms: 200, color: '#d97706' },
  { label: '工具 + 权限 + 遗测', ms: 45, color: '#059669' },
  { label: 'UI 渲染启动', ms: 25, color: '#dc2626' },
]

const totalMs = timingBreakdown.reduce((s, t) => s + t.ms, 0)

/* ------------------------------------------------------------------ */
/*  StepNode                                                          */
/* ------------------------------------------------------------------ */

function StepNode({ step, index }: { step: BootStep; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px 0px -15% 0px' })

  return (
    <div ref={ref} style={{ position: 'relative', paddingLeft: 56, marginBottom: 32 }}>
      {/* Vertical timeline line */}
      {index > 0 && (
        <div style={{
          position: 'absolute',
          left: 19,
          top: -32,
          width: 2,
          height: 32,
          background: '#e2e8f0',
        }} />
      )}
      {index < bootSteps.length - 1 && (
        <div style={{
          position: 'absolute',
          left: 19,
          top: 40,
          width: 2,
          bottom: -32,
          background: '#e2e8f0',
        }} />
      )}

      {/* Circle node */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: '#3b82f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.8rem',
        fontWeight: 700,
        boxShadow: '0 2px 6px rgba(59,130,246,0.25)',
        zIndex: 2,
      }}>
        {String(step.step).padStart(2, '0')}
      </div>

      {/* Content card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.45, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
        style={{
          background: '#ffffff',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.1rem' }}>{step.icon}</span>
          <h3 style={{
            fontSize: '1.05rem',
            fontWeight: 600,
            color: '#0f172a',
            margin: 0,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            {step.title}
          </h3>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem',
            color: '#64748b',
            background: '#f1f5f9',
            padding: '2px 10px',
            borderRadius: 4,
          }}>
            {step.sourceFile}
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem',
            fontWeight: 600,
            color: '#3b82f6',
            background: '#eff6ff',
            padding: '2px 10px',
            borderRadius: 4,
            marginLeft: 'auto',
          }}>
            {step.timing}
          </span>
        </div>

        {/* Description bullets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {step.descriptions.map((desc, di) => (
            <p key={di} style={{
              fontSize: '0.82rem',
              color: '#475569',
              lineHeight: 1.65,
              margin: 0,
              paddingLeft: 24,
              position: 'relative',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.6rem',
                fontWeight: 600,
                color: '#64748b',
              }}>
                {di + 1}
              </span>
              {desc}
            </p>
          ))}
        </div>

        {/* Code path */}
        <div style={{
          marginTop: 12,
          padding: '8px 12px',
          background: '#f8fafc',
          borderRadius: 6,
          border: '1px solid #e2e8f0',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem',
          color: '#64748b',
        }}>
          <span style={{ color: '#94a3b8' }}>{'// '}</span>
          <span style={{ color: '#7c3aed', fontWeight: 500 }}>path</span>
          <span style={{ color: '#94a3b8' }}>{': '}</span>
          <span style={{ color: '#059669' }}>{step.codePath}</span>
        </div>
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  TimingBar                                                         */
/* ------------------------------------------------------------------ */

function TimingBar({ entry, maxMs }: { entry: TimingEntry; maxMs: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const pct = (entry.ms / maxMs) * 100

  return (
    <div ref={ref} style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8,
    }}>
      <span style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: '0.75rem',
        color: '#475569',
        width: 160,
        flexShrink: 0,
        textAlign: 'right',
      }}>
        {entry.label}
      </span>
      <div style={{
        flex: 1,
        height: 20,
        background: '#f1f5f9',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        <motion.div
          style={{
            height: '100%',
            background: entry.color,
            borderRadius: 4,
            opacity: 0.85,
          }}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${pct}%` } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
        />
      </div>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.7rem',
        color: '#64748b',
        width: 50,
        textAlign: 'right',
        flexShrink: 0,
      }}>
        {entry.ms}ms
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  BootSummary                                                       */
/* ------------------------------------------------------------------ */

function BootSummary() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div ref={ref} style={{ position: 'relative', paddingLeft: 56, marginBottom: 0 }}>
      {/* Connector line */}
      <div style={{
        position: 'absolute',
        left: 19,
        top: -32,
        width: 2,
        height: 32,
        background: '#e2e8f0',
      }} />

      {/* Check circle */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: '#059669',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontSize: '1.1rem',
        fontWeight: 700,
        boxShadow: '0 2px 6px rgba(5,150,105,0.25)',
        zIndex: 2,
      }}>
        ✓
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.12 }}
        style={{
          background: '#ffffff',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          padding: '24px 28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <h3 style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#059669',
            margin: 0,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            启动完成
          </h3>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem',
            fontWeight: 600,
            color: '#059669',
            background: '#ecfdf5',
            padding: '3px 12px',
            borderRadius: 4,
          }}>
            总耗时 ~{totalMs}ms
          </span>
        </div>

        <p style={{
          fontSize: '0.88rem',
          color: '#475569',
          lineHeight: 1.65,
          margin: '0 0 20px',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          从进程创建到 REPL 就绪，Claude Code 在约 <strong style={{ color: '#0f172a' }}>{(totalMs / 1000).toFixed(1)} 秒</strong>内完成
          10 个阶段的初始化。其中 MCP 服务连接和 Feature Flag 同步为主要耗时项，
          两者均采用并行和缓存策略来减少对启动速度的影响。
        </p>

        {/* Timing chart */}
        <h4 style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#0f172a',
          marginBottom: 12,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          启动耗时分布
        </h4>
        {timingBreakdown.map((t, i) => (
          <TimingBar key={i} entry={t} maxMs={Math.max(...timingBreakdown.map(e => e.ms))} />
        ))}

        {/* Stacked total bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{
            display: 'flex',
            height: 10,
            borderRadius: 5,
            overflow: 'hidden',
            background: '#f1f5f9',
          }}>
            {timingBreakdown.map((t, i) => (
              <motion.div
                key={i}
                style={{ background: t.color, opacity: 0.85 }}
                initial={{ width: 0 }}
                animate={isInView ? { width: `${(t.ms / totalMs) * 100}%` } : {}}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
                title={`${t.label}: ${t.ms}ms`}
              />
            ))}
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 16px',
            marginTop: 10,
          }}>
            {timingBreakdown.map((t, i) => (
              <span key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.7rem',
                color: '#64748b',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}>
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: t.color,
                  opacity: 0.85,
                  flexShrink: 0,
                }} />
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function BootSeq() {
  return (
    <section id="boot" style={{
      padding: '80px 24px',
      maxWidth: 900,
      margin: '0 auto',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.4 }}
        style={{ textAlign: 'center', marginBottom: 48 }}
      >
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.75rem',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          07 / Boot Sequence
        </span>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#0f172a',
          margin: '12px 0 16px',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          启动流程
        </h2>
        <p style={{
          fontSize: '1rem',
          color: '#475569',
          maxWidth: 650,
          margin: '0 auto',
          lineHeight: 1.6,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          从进程启动到 REPL 就绪的 10 个关键步骤——每一步都经过精心编排，
          在约 470ms 内完成认证、工具发现、权限配置和 UI 渲染。
        </p>
      </motion.div>

      <div>
        {bootSteps.map((step, i) => (
          <StepNode key={step.step} step={step} index={i} />
        ))}
        <BootSummary />
      </div>
    </section>
  )
}