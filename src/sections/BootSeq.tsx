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
      '验证每个参数的合法性——例如 --model 必须匹配已知模型列表，--permission-mode 仅接受 default/plan/bypassPermissions 三种值。不合法时立即打印错误并以非零退出码终止进程。',
      '为未提供的可选参数设置合理默认值：model 默认为 claude-sonnet-4-20250514，permission-mode 默认为 default，verbose 默认为 false。',
      '如果检测到 --help 或 --version 标志，直接将帮助文本或语义化版本号输出到 stdout，随后调用 process.exit(0) 退出，不再执行后续初始化。',
      '最后扫描环境变量覆盖项（ANTHROPIC_API_KEY、CLAUDE_MODEL、CLAUDE_CODE_MAX_TURNS 等），环境变量优先级介于配置文件和 CLI 参数之间。',
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
      '检测 Bun 运行时版本号，确保 >= 1.0 才继续；同时识别宿主操作系统（macOS / Linux / WSL / Windows），以决定后续路径分隔符和信号处理策略。',
      '探测终端类型和能力：区分 iTerm2（支持图片协议）、Alacritty（GPU 加速）、Windows Terminal（支持 VT 序列）、普通 xterm 等，决定是否启用富文本渲染。',
      '检查外部依赖工具的可用性：通过 which/where 定位 ripgrep（rg）和 git 二进制文件。如果 rg 不可用，文件搜索将降级为 Node.js 原生递归遍历；如果 git 不可用，则禁用版本控制相关功能。',
      '识别 CI/CD 环境：检查 GITHUB_ACTIONS、GITLAB_CI、CIRCLECI、JENKINS_HOME 等特征环境变量，在 CI 环境下自动切换为 headless 模式并禁用交互式提示。',
      '判断是否运行在 IDE 桥接模式下——检测 VS Code Extension Host 的 IPC 通道标识符，如果存在则启用 JSON-RPC 通信协议而非标准 TTY I/O。',
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
      '实现三层配置合并策略：全局配置（~/.claude/config.json）→ 项目配置（.claude/config.json）→ CLI 参数。后层覆盖前层，CLI 参数拥有最高优先级。',
      '每层配置都经过 JSON Schema 校验，确保字段类型正确、值在合法范围内。无法解析或校验失败的配置文件会被跳过并输出警告日志。',
      '加载工具权限规则：解析 allowedTools 和 blockedTools 数组，支持 glob 模式匹配（如 "mcp__*" 允许所有 MCP 工具），构建高效的匹配正则表达式缓存。',
      '解析 MCP（Model Context Protocol）服务器配置：从 mcpServers 字段读取每个服务器的 command、args、env、cwd 以及传输方式（stdio 或 sse），构建服务器描述符列表。',
      '合并完成后冻结最终配置对象（Object.freeze），防止运行时意外修改，并将合并日志写入 debug 通道供排查使用。',
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
      '按优先级链检查 API Key 来源：环境变量 ANTHROPIC_API_KEY → 配置文件中的 apiKey 字段 → OAuth Token（存储在系统 Keychain 或 ~/.claude/credentials）。找到第一个有效凭证即停止。',
      '如果使用 OAuth 流程，先检查 access_token 的 exp 时间戳。若已过期或将在 5 分钟内过期，使用 refresh_token 向 Anthropic 授权服务器发起刷新请求，获取新的令牌对并更新本地存储。',
      '初始化 JWT 解码器，解析令牌载荷中的用户信息（user_id、org_id、email）以及权限声明（scopes），这些信息将用于后续的 Feature Flag 评估和遥测标注。',
      '设置多租户上下文：如果令牌包含 org_id，则所有 API 请求头将附带 X-Organization-ID，确保计费和用量统计归属到正确的组织账户。',
      '最终验证凭证有效性——向 /v1/messages 端点发送一个轻量级 ping 请求（dry_run 模式），确认认证链路端到端可用，失败时给出明确的错误提示和修复建议。',
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
      '连接 GrowthBook 远程配置服务器，通过 SDK 初始化方法拉取最新的 Feature Flag 配置 JSON。请求携带 client key 和 SDK 版本标识。',
      '基于当前用户 ID（来自认证令牌）和运行环境（dev/staging/prod）计算每个 flag 的实际状态。GrowthBook 使用确定性哈希算法确保同一用户在不同会话中得到一致的 flag 值。',
      '将计算后的 flag 快照缓存到本地文件系统（~/.claude/flags_cache.json），包含时间戳和 ETag，并启动一个后台定时器每 5 分钟增量刷新一次。',
      '如果网络请求超时（2 秒阈值）或失败，优雅降级为读取上次缓存的 flag 值。如果连缓存也不存在，使用编译期硬编码的默认值，确保启动流程不会因为 flag 服务不可用而阻塞。',
      '当前活跃的关键 flag 包括：enablePowerMode（高级模式）、mcpToolDiscovery（MCP 工具自动发现）、streamingMarkdown（流式 Markdown 渲染）等。',
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
      '扫描合并后的配置中定义的所有 MCP 服务器条目，每个条目描述了一个外部工具提供者——可以是本地进程（stdio 传输）或远程服务（SSE 传输）。',
      '对所有服务器执行并行连接：stdio 模式下使用 child_process.spawn 启动子进程并通过 stdin/stdout 进行 JSON-RPC 通信；SSE 模式下建立 HTTP 长连接并监听 Server-Sent Events 消息流。',
      '对每个成功连接的服务器发送 initialize 握手请求，协商协议版本和能力集（capabilities），然后调用 tools/list 方法获取该服务器提供的所有工具定义（名称、描述、inputSchema）。',
      '将所有 MCP 工具以 "mcp__<serverName>__<toolName>" 的命名规范注册到全局工具注册表中，避免与内置工具冲突。同时记录每个工具的来源服务器，用于后续路由调用。',
      '为每个连接设置心跳检测和自动重连逻辑：stdio 模式监听子进程 exit 事件，SSE 模式检测连接断开——触发时自动尝试重新连接，最多重试 3 次，间隔按指数退避递增。',
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
      '批量注册所有 40+ 内置工具到 ToolRegistry 单例：包括文件操作（Read/Write/Edit）、搜索（Grep/Glob）、终端（Bash）、浏览器（WebFetch）、多模态（ImageAnalysis）等类别。',
      '每个工具注册时提供完整的元数据：名称、描述、JSON Schema 格式的输入参数定义、所需权限级别、超时设置，以及一个异步执行函数 execute(input, context)。',
      '合并来自 MCP 服务的动态工具——MCP 工具被包装成与内置工具相同的 Tool 接口，调用时透明地通过 MCP 客户端路由到对应的外部服务器执行。',
      '应用 allowedTools/blockedTools 过滤规则：遍历完整工具列表，对每个工具名称执行 glob 匹配。被 blockedTools 匹配的工具从注册表中移除，allowedTools 非空时仅保留匹配项。',
      '初始化每个工具的运行时状态：重置调用计数器、清空错误历史、预热缓存（如 Bash 工具预先检测 shell 路径，Grep 工具预编译常用正则模式），确保首次调用时零冷启动延迟。',
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
      '根据 --permission-mode 参数设置全局权限级别：default 模式下每次危险操作前询问用户；plan 模式仅允许只读操作（禁止写入/执行）；bypassPermissions 跳过所有确认（仅限 CI 场景）。',
      '从项目级配置文件（.claude/permissions.json）加载自定义权限规则——每条规则由 tool 名称模式 + 路径/参数约束 + allow/deny 决策组成，支持灵活的白名单/黑名单策略。',
      '初始化权限缓存（PermissionCache），记录用户在当前会话中已批准的操作模式。例如用户批准 "允许 bash 在当前目录执行" 后，相同模式的后续请求自动放行，无需重复确认。',
      '设置 Fail-Closed 默认策略——任何未被显式规则匹配的操作请求默认被拒绝，需要用户手动批准。这确保了即使规则配置遗漏也不会导致意外的危险操作。',
      '注册权限检查中间件到工具执行管线中：每次工具调用前，中间件提取工具名称和参数，依次匹配规则链（内置规则 → 项目规则 → 缓存 → 用户确认），返回 allow/deny 决策。',
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
      '初始化 OpenTelemetry SDK 三大信号管线：Tracer（分布式追踪）用于记录操作耗时和调用链，Meter（指标）用于统计工具调用次数和 Token 消耗，Logger（日志）用于结构化事件记录。',
      '配置 Span 导出器：开发环境使用 ConsoleSpanExporter 将追踪数据输出到终端便于调试；生产环境通过 OTLPTraceExporter 将数据发送到 Anthropic 的可观测性后端进行聚合分析。',
      '创建根 Span（root span），标记为 "claude-code-session"，设置会话 ID、用户 ID、环境信息等属性。后续所有操作（工具调用、API 请求、文件 I/O）作为子 Span 挂载在根 Span 下形成完整的追踪树。',
      '注册全局错误处理器：监听 uncaughtException 和 unhandledRejection 事件，将异常信息记录到当前活跃的 Span 中（设置 error 状态和异常属性），确保崩溃前遥测数据被正确导出。',
      '对 Sentry 错误追踪进行并行初始化（如果启用）：设置 DSN、采样率、release 版本标识，并将 Sentry 的 breadcrumb 与 OpenTelemetry 的 Span 事件关联，实现两套系统的数据互通。',
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
      '根据运行模式分支选择渲染方式：REPL 交互模式下使用 React + Ink 框架在终端中渲染完整的组件化 UI；Headless 模式下跳过 UI 初始化，直接将 --print 参数的内容发送给模型并将结果输出到 stdout。',
      '在 REPL 模式中初始化终端 UI 组件树：<App /> 根组件包含 <InputBox />（用户输入区）、<OutputArea />（流式响应展示区）、<StatusBar />（底部状态栏显示 Token 用量和工具调用计数）。',
      '显示欢迎信息和系统状态摘要：打印 Claude Code 版本号、当前工作目录、已加载的工具数量（内置 + MCP）、权限模式、生效的模型名称，给用户一个清晰的运行时上下文视图。',
      '进入主事件循环（REPL Loop）：等待用户输入 → 构建消息上下文（包含系统提示词和历史对话）→ 流式调用 Anthropic API → 解析响应中的 tool_use 块 → 执行工具 → 将结果追加到上下文 → 继续循环直到模型生成最终文本响应。',
      '注册优雅退出处理器：监听 Ctrl+C（SIGINT）和 Ctrl+D（EOF）信号，在退出前确保关闭所有 MCP 连接、导出遥测数据、保存会话历史到 ~/.claude/history/，最后调用 process.exit(0) 干净退出。',
    ],
    codePath: 'main.tsx → render(<App />) → REPL.startLoop()',
    icon: '🖥',
    timing: '~25ms',
  },
]

/* ------------------------------------------------------------------ */
/*  Summary data for the final "boot complete" node                   */
/* ------------------------------------------------------------------ */

interface TimingEntry {
  label: string
  ms: number
  color: string
}

const timingBreakdown: TimingEntry[] = [
  { label: 'CLI 解析 + 环境检测', ms: 20, color: 'var(--layer1)' },
  { label: '配置加载 + 认证', ms: 60, color: 'var(--accent-purple)' },
  { label: 'Feature Flags', ms: 120, color: 'var(--layer3)' },
  { label: 'MCP 服务连接', ms: 200, color: 'var(--layer4)' },
  { label: '工具 + 权限 + 遥测', ms: 45, color: 'var(--accent-red)' },
  { label: 'UI 渲染启动', ms: 25, color: '#e67e22' },
]

const totalMs = timingBreakdown.reduce((s, t) => s + t.ms, 0)

/* ------------------------------------------------------------------ */
/*  Reusable sub-components                                           */
/* ------------------------------------------------------------------ */

function StepNode({ step, index }: { step: BootStep; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px 0px -15% 0px' })
  const isEven = index % 2 === 1

  return (
    <div
      className={`bootseq-step-wrapper ${isEven ? 'bootseq-even' : 'bootseq-odd'}`}
      ref={ref}
    >
      {/* Connector line from previous node */}
      {index > 0 && (
        <div className="bootseq-connector">
          <div className="bootseq-connector-line" />
          <div className="bootseq-connector-arrow" />
        </div>
      )}

      <motion.div
        className="bootseq-node"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.55, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Large step number circle */}
        <div className="bootseq-circle">
          <span className="bootseq-circle-icon">{step.icon}</span>
          <span className="bootseq-circle-num">{String(step.step).padStart(2, '0')}</span>
        </div>

        {/* Content area */}
        <div className="bootseq-content">
          <div className="bootseq-header">
            <h3 className="bootseq-title">{step.title}</h3>
            <span className="file-path">{step.sourceFile}</span>
            <span className="tag tag-secondary">{step.timing}</span>
          </div>

          <div className="detail-panel">
            {step.descriptions.map((desc, di) => (
              <p key={di} className="detail-description">
                <span className="bootseq-bullet">{di + 1}</span>
                {desc}
              </p>
            ))}
          </div>

          <div className="bootseq-codepath">
            <span className="code-comment">{'// '}</span>
            <span className="code-keyword">path</span>
            <span className="code-comment">{': '}</span>
            <span className="code-string">{step.codePath}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function TimingBar({ entry, maxMs }: { entry: TimingEntry; maxMs: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const pct = (entry.ms / maxMs) * 100

  return (
    <div className="bootseq-timing-row" ref={ref}>
      <span className="bootseq-timing-label">{entry.label}</span>
      <div className="bootseq-timing-track">
        <motion.div
          className="bootseq-timing-fill"
          style={{ background: entry.color }}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${pct}%` } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
        />
      </div>
      <span className="bootseq-timing-ms">{entry.ms}ms</span>
    </div>
  )
}

function BootSummary() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div className="bootseq-step-wrapper bootseq-center" ref={ref}>
      <div className="bootseq-connector">
        <div className="bootseq-connector-line" />
        <div className="bootseq-connector-arrow" />
      </div>

      <motion.div
        className="bootseq-summary highlight-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <div className="bootseq-summary-header">
          <span className="bootseq-summary-icon">✓</span>
          <h3 className="bootseq-summary-title">启动完成</h3>
          <span className="tag tag-primary">总耗时 ~{totalMs}ms</span>
        </div>

        <p className="bootseq-summary-desc">
          从进程创建到 REPL 就绪，Claude Code 在约 <strong>{(totalMs / 1000).toFixed(1)} 秒</strong>内完成
          10 个阶段的初始化。其中 MCP 服务连接和 Feature Flag 同步为主要耗时项，
          两者均采用并行和缓存策略来减少对启动速度的影响。
        </p>

        <div className="bootseq-timing-chart">
          <h4 className="bootseq-timing-heading">启动耗时分布</h4>
          {timingBreakdown.map((t, i) => (
            <TimingBar key={i} entry={t} maxMs={Math.max(...timingBreakdown.map(e => e.ms))} />
          ))}
        </div>

        <div className="bootseq-total-bar">
          <div className="bootseq-total-segments">
            {timingBreakdown.map((t, i) => (
              <motion.div
                key={i}
                className="bootseq-total-seg"
                style={{ background: t.color }}
                initial={{ width: 0 }}
                animate={isInView ? { width: `${(t.ms / totalMs) * 100}%` } : {}}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
                title={`${t.label}: ${t.ms}ms`}
              />
            ))}
          </div>
          <div className="bootseq-total-legend">
            {timingBreakdown.map((t, i) => (
              <span key={i} className="bootseq-legend-item">
                <span className="bootseq-legend-dot" style={{ background: t.color }} />
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
    <section id="boot" className="section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
      >
        <span className="section-tag">07 / Boot Sequence</span>
        <h2 className="section-title">启动流程</h2>
        <p className="section-desc">
          从进程启动到 REPL 就绪的 10 个关键步骤——每一步都经过精心编排，
          在约 470ms 内完成认证、工具发现、权限配置和 UI 渲染。
        </p>
      </motion.div>

      <div className="bootseq-timeline">
        {bootSteps.map((step, i) => (
          <StepNode key={step.step} step={step} index={i} />
        ))}
        <BootSummary />
      </div>
    </section>
  )
}
