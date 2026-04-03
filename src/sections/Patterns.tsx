import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ================================================================== */
/*  Syntax Highlighting (no external deps)                             */
/* ================================================================== */

function highlightCode(code: string): string {
  const lines = code.split('\n')
  return lines
    .map(line => {
      // Comments
      if (line.trimStart().startsWith('//')) {
        return `<span style="color:#94a3b8;font-style:italic">${escHtml(line)}</span>`
      }
      let result = escHtml(line)
      // Strings
      result = result.replace(
        /(&quot;[^&]*?&quot;|&#x27;[^&]*?&#x27;|`[^`]*?`)/g,
        '<span style="color:#059669">$1</span>'
      )
      // Keywords
      result = result.replace(
        /\b(const|let|var|function|async|await|return|if|else|for|while|switch|case|break|default|new|class|extends|import|export|from|throw|try|catch|finally|yield|of|in|typeof|instanceof|true|false|null|undefined|this|super)\b/g,
        '<span style="color:#dc2626;font-weight:500">$1</span>'
      )
      // Types
      result = result.replace(
        /\b(string|number|boolean|void|any|never|unknown|Promise|Record|Map|Set|Array|Object|Error)\b/g,
        '<span style="color:#7c3aed">$1</span>'
      )
      // Numbers (only match numbers not inside HTML tags)
      result = result.replace(
        /(?<![;:"\w#])(\b\d+\.?\d*\b)(?![0-9a-fA-F]*[";>])/g,
        '<span style="color:#3b82f6">$1</span>'
      )
      // Function calls
      result = result.replace(
        /(\w+)(\()/g,
        '<span style="color:#d97706">$1</span>$2'
      )
      return result
    })
    .join('\n')
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
}

/* ================================================================== */
/*  Pattern Data                                                       */
/* ================================================================== */

interface PatternData {
  emoji: string
  category: string
  categoryColor: string
  categoryBg: string
  accentColor: string
  title: string
  summary: string
  description: string
  code: string
}

const patterns: PatternData[] = [
  {
    emoji: '\u{1F30A}',
    category: '数据流',
    categoryColor: '#06b6d4',
    categoryBg: '#ecfeff',
    accentColor: '#06b6d4',
    title: 'AsyncGenerator 流模式',
    summary: 'query() 全链路使用 async generator 实现流式消息传递和背压控制，优雅处理长对话流。',
    description:
      '核心对话循环 query.ts（68KB）的 query() 函数是一个巨大的 async generator——使用 yield* 逐步产出消息事件（text_delta、tool_use、tool_result），调用方通过 for-await-of 消费。这种设计天然实现了背压控制（backpressure）：当下游处理速度跟不上 API 响应速度时，generator 自动暂停产出等待消费。同时支持提前中断——调用方调用 generator.return() 即可终止对话循环，资源自动清理。整个 REPL 的主循环也是 async generator，形成了从 API 响应到终端渲染的完整流式管道。',
    code: `// query.ts — 核心对话循环（简化版）
async function* query(
  messages: Message[],
  tools: Tool[],
  signal: AbortSignal
): AsyncGenerator<StreamEvent> {
  // 1. 构建请求并发送给 API
  const stream = await apiClient.messages.create({
    model: config.model,
    messages,
    tools: tools.map(t => t.toSchema()),
    stream: true,
  })

  // 2. 逐 chunk 产出流式事件
  for await (const chunk of stream) {
    if (signal.aborted) return

    if (chunk.type === 'content_block_delta') {
      yield { type: 'text_delta', text: chunk.delta.text }
    }

    if (chunk.type === 'content_block_stop'
        && chunk.content_block.type === 'tool_use') {
      // 3. 工具调用：执行并产出结果
      const tool = findTool(chunk.content_block.name)
      const result = await tool.execute(chunk.content_block.input)
      yield { type: 'tool_result', id: chunk.content_block.id, result }

      // 4. 递归：带工具结果继续对话
      yield* query([...messages, assistantMsg, toolResultMsg], tools, signal)
    }
  }
}

// REPL 消费端
for await (const event of query(messages, tools, controller.signal)) {
  switch (event.type) {
    case 'text_delta': renderText(event.text); break
    case 'tool_result': renderToolResult(event.result); break
  }
}`,
  },
  {
    emoji: '\u{1F4E6}',
    category: '架构',
    categoryColor: '#4f46e5',
    categoryBg: '#eef2ff',
    accentColor: '#4f46e5',
    title: '注册表模式',
    summary: 'tools.ts / commands.ts / tasks.ts 统一注册表，集中管理所有可扩展组件的元数据与实现。',
    description:
      '注册表模式（Registry Pattern）是 Claude Code 中使用最广泛的架构模式。工具注册表 tools.ts（17KB）维护一个 Map<string, Tool>，所有 40+ 工具在启动时通过 registerTool() 注册。命令注册表 commands.ts（25KB）管理 80+ 斜杠命令。任务注册表 tasks.ts 管理后台任务定义。注册表提供统一的 CRUD 接口：register()、get()、list()、has()。运行时通过名称查找即可获取完整的实例。这种模式的核心优势是 O(1) 查找性能和集中化的生命周期管理。',
    code: `// tools.ts — 工具注册表
const toolRegistry = new Map<string, Tool>()

function registerTool(tool: Tool): void {
  if (toolRegistry.has(tool.name)) {
    throw new Error('Duplicate tool: ' + tool.name)
  }
  toolRegistry.set(tool.name, tool)
}

function getTool(name: string): Tool | undefined {
  return toolRegistry.get(name)
}

function listTools(): Tool[] {
  return Array.from(toolRegistry.values())
}

// 注册示例
registerTool(new FileReadTool())
registerTool(new FileWriteTool())
registerTool(new BashTool())
registerTool(new GrepTool())
// ... 40+ 工具

// commands.ts — 命令注册表（同样模式）
const commandRegistry = new Map<string, Command>()

function registerCommand(cmd: Command): void {
  commandRegistry.set(cmd.name, cmd)
}

registerCommand({
  name: 'commit',
  description: '智能提交',
  args: z.object({ scope: z.string().optional() }),
  execute: async (args) => { /* ... */ },
})`,
  },
  {
    emoji: '\u{1F6A9}',
    category: '发布',
    categoryColor: '#d97706',
    categoryBg: '#fffbeb',
    accentColor: '#d97706',
    title: 'Feature Flag 门控',
    summary: 'bun:bundle 特性标志 + 死代码消除，运行时零开销切换功能模块。',
    description:
      'Claude Code 使用双层 Feature Flag 机制实现零开销的功能切换。第一层是编译时标志：在 bun build 配置中通过 define 将 Flag 值注入为常量，Bun bundler 在 tree-shaking 阶段对 if (__FEATURE_X__) 分支进行死代码消除。第二层是运行时标志：通过 GrowthBook SDK 动态评估，支持灰度发布和 A/B 测试。这种双层设计兼顾了包体积优化和灰度发布的灵活性。',
    code: `// build.ts — 编译时 Feature Flag 注入
await Bun.build({
  entrypoints: ['./src/main.tsx'],
  define: {
    '__FEATURE_KAIROS__': 'true',
    '__FEATURE_VOICE__': 'false',  // 编译后完全移除
    '__FEATURE_DAEMON__': 'true',
  },
})

// 业务代码中使用
declare const __FEATURE_KAIROS__: boolean
declare const __FEATURE_VOICE__: boolean

if (__FEATURE_KAIROS__) {
  // 此分支在编译后保留
  const kairos = await import('./kairos-engine')
  kairos.enableExtendedThinking()
}

if (__FEATURE_VOICE__) {
  // 此分支被 DCE 完全移除，包括 import
  const voice = await import('./voice-input')
  voice.startListening()
}

// 运行时灰度评估（GrowthBook SDK）
const gb = new GrowthBook({ apiHost, clientKey })
await gb.loadFeatures()

if (gb.isOn('proactive-suggestions')) {
  enableProactiveSuggestions()
}`,
  },
  {
    emoji: '\u{1F512}',
    category: '安全',
    categoryColor: '#dc2626',
    categoryBg: '#fef2f2',
    accentColor: '#dc2626',
    title: 'Fail-Closed 安全模式',
    summary: 'buildTool() 默认 isConcurrencySafe=false, isReadOnly=false，未声明即拒绝。',
    description:
      'Fail-Closed（默认拒绝）是 Claude Code 安全模型的基石原则。在工具系统中体现为：所有安全相关的属性都默认为"不安全"状态——isConcurrencySafe 默认 false、isReadOnly 默认 false、isDestructive 默认 true。工具开发者必须显式声明安全属性才能获得更宽松的权限。权限系统同样遵循此原则——未知的权限请求默认拒绝，超时未响应的确认对话框默认拒绝。',
    code: `// Tool.ts — Fail-Closed 默认值
interface ToolMetadata {
  isReadOnly: boolean      // 默认 false → 视为写操作
  isDestructive: boolean   // 默认 false → 但权限检查时等同于 true
  isConcurrencySafe: boolean // 默认 false → 不允许并发
  needsPermissions: string[] // 默认 [] → 但非只读工具仍需确认
}

function buildTool(config: Partial<ToolMetadata>): ToolMetadata {
  return {
    isReadOnly: false,           // fail-closed: 默认不是只读
    isDestructive: false,
    isConcurrencySafe: false,    // fail-closed: 默认不允许并发
    needsPermissions: [],
    ...config,                   // 开发者显式覆盖
  }
}

// 安全检查示例
function canRunConcurrently(tool: Tool): boolean {
  // 双重检查：必须同时声明并发安全 AND 只读
  return tool.metadata.isConcurrencySafe && tool.metadata.isReadOnly
}

// 权限确认超时 → 默认拒绝
async function requestPermission(tool: Tool): Promise<boolean> {
  const timer = setTimeout(() => resolve(false), 30_000)
  const allowed = await showConfirmDialog(tool)
  clearTimeout(timer)
  return allowed
}`,
  },
  {
    emoji: '\u{1F4BE}',
    category: '性能',
    categoryColor: '#059669',
    categoryBg: '#ecfdf5',
    accentColor: '#059669',
    title: 'Memoize 缓存模式',
    summary: 'lodash-es/memoize 缓存昂贵计算结果，避免重复执行高开销操作。',
    description:
      'Memoize（记忆化）模式在 Claude Code 中广泛用于缓存昂贵的计算和 I/O 结果。典型应用场景包括：(1) Git 状态查询缓存；(2) 文件内容缓存；(3) 工具 Schema 生成缓存；(4) 配置解析缓存。缓存策略主要使用 lodash-es 的 memoize 函数，以参数的 JSON 序列化值作为缓存键。对于需要失效的场景，通过 memoize.cache.clear() 手动清除。',
    code: `// 使用 lodash-es memoize 缓存昂贵计算
import { memoize } from 'lodash-es'

// 1. Git 状态缓存
const getGitStatus = memoize(async (cwd: string) => {
  const result = await exec('git status --porcelain', { cwd })
  return parseGitStatus(result.stdout)
})

// 2. 工具 Schema 缓存
const getToolSchema = memoize((tool: Tool) => {
  return zodToJsonSchema(tool.inputSchema)
}, (tool) => tool.name)

// 3. 配置解析缓存
const getResolvedConfig = memoize(() => {
  const global = loadJson('~/.claude/config.json')
  const project = loadJson('.claude/config.json')
  const merged = deepMerge(global, project)
  return Object.freeze(merged)
})

// 4. 文件内容缓存（带手动失效）
const readFileCache = memoize(async (path: string) => {
  return await fs.readFile(path, 'utf-8')
})

function onFileChange(path: string) {
  readFileCache.cache.delete(path)
}`,
  },
  {
    emoji: '\u{1F4E6}',
    category: '性能',
    categoryColor: '#059669',
    categoryBg: '#ecfdf5',
    accentColor: '#059669',
    title: '动态导入延迟加载',
    summary: 'dialogLaunchers.tsx 通过 import() 按需加载对话框，减小初始包体积。',
    description:
      '动态导入（Dynamic Import）模式通过 ES Module 的 import() 表达式实现按需加载。dialogLaunchers.tsx（22KB）是最典型的应用——所有对话框组件都不在启动时加载，而是在用户首次触发时才通过 import() 动态加载。这种策略将冷启动时间减少了约 200ms。其他应用场景包括斜杠命令的 handler 按需加载、MCP 工具适配器动态加载等。',
    code: `// dialogLaunchers.tsx — 对话框懒加载
export async function showTrustDialog(): Promise<boolean> {
  const { TrustDialog } = await import('./dialogs/TrustDialog')
  return renderDialog(TrustDialog)
}

export async function showApiKeyInput(): Promise<string | null> {
  const { ApiKeyDialog } = await import('./dialogs/ApiKeyDialog')
  return renderDialog(ApiKeyDialog)
}

export async function showPermissionConfirm(
  tool: Tool
): Promise<PermissionDecision> {
  const { PermissionDialog } = await import('./dialogs/PermissionDialog')
  return renderDialog(PermissionDialog, { tool })
}

// commands.ts — 命令 handler 按需加载
registerCommand({
  name: 'review',
  description: '代码审查',
  execute: async (args) => {
    const { executeReview } = await import('./handlers/review')
    return executeReview(args)
  },
})

// 条件加载示例
if (__FEATURE_VOICE__) {
  const startVoice = async () => {
    const { VoiceInput } = await import('./voice/VoiceInput')
    return new VoiceInput()
  }
}`,
  },
  {
    emoji: '\u26A1',
    category: '性能',
    categoryColor: '#059669',
    categoryBg: '#ecfdf5',
    accentColor: '#059669',
    title: '并行预取模式',
    summary: 'main.tsx 中 setup / commands / agentDefs 并行加载，最大化启动速度。',
    description:
      '并行预取（Parallel Prefetch）模式利用 Promise.all() 将启动序列中相互独立的初始化任务从串行改为并行执行。main.tsx 的启动编排中，并行启动三组独立任务：setup()、loadCommands()、loadAgentDefinitions()。这三组任务之间无数据依赖，并行执行将启动时间从约 850ms 压缩到约 350ms。类似的并行模式也应用于 MCP 服务器的批量启动。',
    code: `// main.tsx — 启动序列并行化
async function bootstrap() {
  // 阶段 1: 串行的前置步骤
  const cliArgs = parseArguments(process.argv)
  const env = await detectEnvironment()

  // 阶段 2: 并行加载无依赖的模块
  const [setupResult, commands, agentDefs] = await Promise.all([
    setup(cliArgs, env),
    loadCommands(),
    loadAgentDefinitions(),
  ])
  // 总耗时: ~200ms（而非 330ms 串行）

  // 阶段 3: MCP 服务器并行启动
  const mcpConfigs = setupResult.config.mcpServers
  const mcpResults = await Promise.allSettled(
    mcpConfigs.map(cfg => startMCPServer(cfg))
  )

  for (const r of mcpResults) {
    if (r.status === 'rejected') {
      log.warn('MCP server failed:', r.reason)
    }
  }

  // 阶段 4: 启动 REPL 或执行 headless 任务
  if (cliArgs.print) {
    await runHeadless(setupResult, commands)
  } else {
    await startREPL(setupResult, commands, agentDefs)
  }
}`,
  },
  {
    emoji: '\u{1F500}',
    category: '架构',
    categoryColor: '#4f46e5',
    categoryBg: '#eef2ff',
    accentColor: '#4f46e5',
    title: '双模式运行',
    summary: 'REPL 交互式 + headless/SDK (--print)，同一核心适配两种使用场景。',
    description:
      '双模式运行（Dual-Mode）是 Claude Code 的顶层架构模式——同一套核心代码同时支持两种运行方式。交互模式（REPL）通过 Ink 渲染富文本终端界面。Headless 模式（--print / SDK）不启动任何终端 UI，直接将查询结果输出到 stdout。两种模式共享核心的 QueryEngine 和工具注册表，差异仅在 I/O 层。权限系统在 headless 模式下默认切换为 bypassPermissions。',
    code: `// main.tsx — 双模式分支
async function main() {
  const args = parseArguments(process.argv)

  // 共享核心初始化
  const config = await loadConfig()
  const tools = registerAllTools()
  const queryEngine = new QueryEngine(config, tools)

  if (args.print) {
    // ─── Headless 模式 ───
    const permMode = args.permissionMode ?? 'bypassPermissions'
    queryEngine.setPermissionMode(permMode)

    const result = await queryEngine.runOnce(args.print)
    process.stdout.write(result.text)
    process.exit(result.exitCode)

  } else {
    // ─── 交互模式（REPL）───
    const { render } = await import('ink')
    const { App } = await import('./components/App')

    render(
      <App
        queryEngine={queryEngine}
        config={config}
        initialPrompt={args.prompt}
      />
    )
  }
}

// SDK 调用示例
import { claude } from '@anthropic-ai/claude-code'

const result = await claude({
  prompt: '分析 src/ 目录的架构',
  tools: ['FileReadTool', 'GrepTool'],
  permissionMode: 'bypassPermissions',
})
console.log(result.text)`,
  },
]

/* ================================================================== */
/*  Pattern Card Component                                             */
/* ================================================================== */

function PatternCard({ pattern, index }: { pattern: PatternData; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      style={{
        flex: 'none',
        width: '100%',
        cursor: 'pointer',
        background: '#ffffff',
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        borderTop: `3px solid ${pattern.accentColor}`,
        padding: '20px 22px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={() => setExpanded(e => !e)}
      whileHover={{
        boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
        y: -1,
      }}
      layout
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: '1.3rem' }}>{pattern.emoji}</span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem',
          fontWeight: 600,
          color: pattern.categoryColor,
          background: pattern.categoryBg,
          padding: '2px 10px',
          borderRadius: 4,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {pattern.category}
        </span>
        <span style={{
          marginLeft: 'auto',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem',
          color: '#94a3b8',
        }}>
          #{String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Title & Summary */}
      <h3 style={{
        fontSize: '1rem',
        fontWeight: 600,
        marginBottom: 8,
        color: '#0f172a',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        {pattern.title}
      </h3>
      <p style={{
        fontSize: '0.82rem',
        color: '#475569',
        lineHeight: 1.6,
        margin: 0,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        {pattern.summary}
      </p>

      {/* Expand hint */}
      <div style={{
        marginTop: 10,
        fontSize: '0.72rem',
        color: '#94a3b8',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {expanded ? '\u25BE 收起详情' : '\u25B8 点击展开详情与伪代码'}
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid #e2e8f0',
            }}>
              {/* Description */}
              <p style={{
                fontSize: '0.82rem',
                color: '#475569',
                lineHeight: 1.75,
                marginBottom: 16,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}>
                {pattern.description}
              </p>

              {/* Code block */}
              <div style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                padding: '16px 20px',
                overflow: 'auto',
                maxHeight: 480,
              }}>
                <pre
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.75rem',
                    lineHeight: 1.7,
                    margin: 0,
                    color: '#e2e8f0',
                    whiteSpace: 'pre',
                    tabSize: 2,
                  }}
                  dangerouslySetInnerHTML={{ __html: highlightCode(pattern.code) }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export default function Patterns() {
  return (
    <section id="patterns" style={{
      padding: '80px 24px',
      maxWidth: 1100,
      margin: '0 auto',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.75rem',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          06 / Patterns
        </span>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#0f172a',
          margin: '12px 0 16px',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          设计模式
        </h2>
        <p style={{
          fontSize: '1rem',
          color: '#475569',
          maxWidth: 650,
          margin: '0 auto',
          lineHeight: 1.6,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          源码中反复出现的 8 个核心工程模式——点击卡片展开详细解析与伪代码
        </p>
      </div>

      {/* Responsive 2-column grid */}
      <style>{`
        .patterns-grid-2col {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 768px) {
          .patterns-grid-2col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="patterns-grid-2col">
        {patterns.map((p, i) => (
          <PatternCard key={i} pattern={p} index={i} />
        ))}
      </div>
    </section>
  )
}
