import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ================================================================== */
/*  Light theme color palette                                          */
/* ================================================================== */

const C = {
  pageBg: '#f8fafc',
  cardBg: '#ffffff',
  codeBg: '#1e293b',
  highlight: '#f1f5f9',
  textMain: '#0f172a',
  textSec: '#475569',
  textWeak: '#94a3b8',
  blue: '#3b82f6',
  purple: '#7c3aed',
  cyan: '#06b6d4',
  amber: '#d97706',
  green: '#059669',
  red: '#dc2626',
  indigo: '#4f46e5',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
  shadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
  font: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
}

/* Tab accent colors for the 6 systems */
const TAB_COLORS = [C.blue, C.purple, C.green, C.cyan, C.red, C.amber]

/* ================================================================== */
/*  Shared Sub-components                                              */
/* ================================================================== */

function Overview({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: C.highlight,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: '20px 24px',
      marginBottom: 28,
      fontSize: '0.88rem',
      color: C.textSec,
      lineHeight: 1.75,
      fontFamily: C.font,
    }}>
      {children}
    </div>
  )
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontSize: '1.05rem',
      fontWeight: 600,
      marginTop: 28,
      marginBottom: 14,
      paddingBottom: 8,
      borderBottom: `1px solid ${C.border}`,
      color: C.textMain,
      fontFamily: C.font,
    }}>
      {children}
    </h3>
  )
}

function SysCard({ idx, title, color, children }: { idx: number; title: string; color: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04, duration: 0.25 }}
      style={{
        position: 'relative',
        paddingTop: 22,
        background: C.cardBg,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: '22px 20px 18px',
        boxShadow: C.shadow,
      }}
    >
      <span style={{
        position: 'absolute', top: 10, right: 14,
        fontFamily: C.mono,
        fontSize: '0.65rem', color: C.textWeak,
      }}>
        #{String(idx + 1).padStart(2, '0')}
      </span>
      <h4 style={{
        fontSize: '0.95rem', fontWeight: 700, color: C.textMain,
        marginBottom: 10, marginTop: 0, fontFamily: C.font,
      }}>{title}</h4>
      <div style={{ fontSize: '0.82rem', color: C.textSec, lineHeight: 1.7, fontFamily: C.font }}>
        {children}
      </div>
    </motion.div>
  )
}

function ItemList({ items, color }: { items: { name: string; desc: string }[]; color: string }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {items.map(item => (
        <li key={item.name} style={{ padding: '6px 0', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{
            display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
            background: color, marginTop: 7, flexShrink: 0,
          }} />
          <div>
            <code style={{ color: color, fontSize: '0.8rem', fontFamily: C.mono }}>{item.name}</code>
            <p style={{ margin: '4px 0 0', lineHeight: 1.65, fontFamily: C.font }}>{item.desc}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function StepFlow({ steps }: { steps: { label: string; desc: string }[] }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 0,
      margin: '16px 0', padding: '0 8px',
    }}>
      {steps.map((s, i) => (
        <div key={i}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: C.cardBg, borderRadius: 8, padding: '10px 16px',
            border: `1px solid ${C.border}`,
          }}>
            <span style={{
              fontFamily: C.mono,
              fontSize: '0.75rem', color: C.cardBg,
              background: C.blue, borderRadius: '50%',
              width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontWeight: 700,
            }}>
              {i + 1}
            </span>
            <div style={{ fontFamily: C.font }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: C.textMain }}>{s.label}</span>
              <span style={{ color: C.textSec, fontSize: '0.8rem', marginLeft: 8 }}>{s.desc}</span>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              width: 2, height: 16, background: C.borderStrong,
              marginLeft: 28,
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

function DataTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table" style={{
        width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem',
        fontFamily: C.font, background: C.cardBg, borderRadius: 8, overflow: 'hidden',
        border: `1px solid ${C.border}`,
      }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{
                padding: '10px 14px', textAlign: 'left', fontWeight: 600,
                color: C.textMain, background: C.highlight, borderBottom: `1px solid ${C.border}`,
                fontSize: '0.8rem',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: '8px 14px', color: C.textSec,
                  borderBottom: `1px solid ${C.border}`, verticalAlign: 'top',
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* grid container for cards */
function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: 16,
    }}>
      {children}
    </div>
  )
}

/* ================================================================== */
/*  Tab 1: Tool System                                                 */
/* ================================================================== */

function ToolsTab() {
  const color = TAB_COLORS[0]
  const categories = [
    {
      title: '文件操作',
      items: [
        { name: 'FileReadTool', desc: '读取文件内容，支持行号范围选择（startLine/endLine），自动检测编码（UTF-8/Latin1/Binary），大文件自动截断并提示。实现了智能缓存——对同一文件的连续读取会复用 Buffer，避免重复 I/O。' },
        { name: 'FileWriteTool', desc: '创建或完整覆写文件。写入前自动创建父目录（recursive mkdir），写入后验证文件完整性（字节数比对）。对于受保护路径（node_modules、.git）默认拒绝，需要显式权限。' },
        { name: 'FileEditTool', desc: '基于 diff 的精确编辑工具——接收 oldText 和 newText 参数执行查找替换。底层使用确定性匹配而非正则，确保多处匹配时精确定位。' },
        { name: 'GlobTool', desc: '文件路径模式匹配搜索——支持标准 glob 语法（*、**、?、[abc]）。底层调用 fast-glob 库，自动排除 .gitignore 中的路径。' },
        { name: 'GrepTool', desc: '内容搜索工具——优先使用 ripgrep（rg）实现高性能搜索，不可用时降级为 Node.js 原生递归遍历。支持正则表达式、大小写控制。' },
      ],
    },
    {
      title: '命令执行',
      items: [
        { name: 'BashTool', desc: '在隔离的 shell 环境中执行命令。每次调用创建独立子进程，默认 120 秒超时，自动捕获 stdout/stderr 分离输出。支持工作目录切换和环境变量注入。' },
      ],
    },
    {
      title: '代理系统',
      items: [
        { name: 'AgentTool', desc: '子代理委派工具——创建独立的 Claude 对话实例来处理复杂子任务。子代理继承父代理的工具集但拥有独立的上下文窗口和 token 预算。' },
      ],
    },
    {
      title: '协议集成',
      items: [
        { name: 'MCPTool', desc: 'Model Context Protocol 工具代理——将外部 MCP 服务器暴露的工具映射为 Claude 可调用的标准工具。每个 MCP 工具维护独立的 JSON Schema 验证和超时设置。' },
        { name: 'LSPTool', desc: 'Language Server Protocol 集成——连接到项目的语言服务器获取诊断信息（错误、警告、提示）。帮助 Claude 理解代码中的类型错误和 lint 问题。' },
      ],
    },
    {
      title: '团队管理',
      items: [
        { name: 'TeamCreateTool', desc: '创建并行工作的子 agent 团队——在独立的 git worktree 中为每个 agent 分配独立的工作区。' },
        { name: 'TeamDeleteTool', desc: '清理团队工作区——安全删除 git worktree 和关联的临时目录。执行前检查未提交更改。' },
      ],
    },
    {
      title: '工作区',
      items: [
        { name: 'EnterWorktreeTool', desc: '进入指定的 git worktree 工作区——切换 CWD 到 worktree 路径，更新文件操作工具的基准路径。' },
        { name: 'ExitWorktreeTool', desc: '退出当前 worktree 并恢复到原始工作目录。自动清理临时文件和锁。' },
      ],
    },
    {
      title: '其他工具',
      items: [
        { name: 'WebFetchTool', desc: '获取网页内容——支持 HTTP/HTTPS 请求，自动将 HTML 转换为 Markdown 以节省 token。超时 30 秒，响应体限制 512KB。' },
        { name: 'SleepTool', desc: '暂停执行指定毫秒数——用于等待外部进程完成或实现简单的轮询延迟。最大 300 秒。' },
        { name: 'CronCreateTool', desc: '创建定时任务——注册 cron 表达式触发的自动化工作流。' },
        { name: 'SkillTool', desc: '技能调用工具——执行用户自定义的 Skill（技能包），从 .claude/skills 目录加载并运行预定义的操作脚本。' },
      ],
    },
  ]

  return (
    <>
      <Overview>
        <strong>工具系统（Tool System）</strong>是 Claude Code 与外部世界交互的核心接口层。每个工具都继承自
        统一的 <code style={{ fontFamily: C.mono, background: C.highlight, padding: '1px 4px', borderRadius: 4 }}>Tool</code> 基类（Tool.ts, 29KB），通过 Zod Schema 进行输入参数校验。当前版本注册了 <strong>40+ 工具</strong>，
        覆盖文件操作、命令执行、网络请求、协议集成、代理委派等场景。
      </Overview>

      <SubTitle>工具分类与详解</SubTitle>
      <CardGrid>
        {categories.map((c, ci) =>
          <SysCard key={c.title} idx={ci} title={c.title} color={color}>
            <ItemList items={c.items} color={color} />
          </SysCard>
        )}
      </CardGrid>

      <SubTitle>工具属性元数据</SubTitle>
      <DataTable
        headers={['属性', '类型', '默认值', '说明']}
        rows={[
          [<code style={{ fontFamily: C.mono }}>isReadOnly</code>, 'boolean', 'false', '标记为只读操作，只读工具不需要权限确认且可以并发执行'],
          [<code style={{ fontFamily: C.mono }}>isDestructive</code>, 'boolean', 'false', '标记为破坏性操作，在非 bypass 模式下必须获得用户确认'],
          [<code style={{ fontFamily: C.mono }}>isConcurrencySafe</code>, 'boolean', 'false', '是否允许并发执行。采用 fail-closed 策略：未声明安全的工具默认串行'],
          [<code style={{ fontFamily: C.mono }}>needsPermissions</code>, 'string[]', '[]', '需要的权限标识列表，缺少权限时阻塞等待用户确认'],
          [<code style={{ fontFamily: C.mono }}>inputSchema</code>, 'ZodSchema', '—', 'Zod 定义的输入参数 Schema，运行时自动校验所有传入参数'],
          [<code style={{ fontFamily: C.mono }}>userFacingName</code>, 'string', '—', '展示给用户的可读名称，用于权限确认对话框和日志'],
        ]}
      />

      <SubTitle>工具生命周期</SubTitle>
      <StepFlow steps={[
        { label: '注册', desc: 'tools.ts 中通过 registerTool() 将工具实例加入全局注册表' },
        { label: '发现', desc: '系统启动时遍历注册表，向 Claude API 传递所有可用工具的名称和 JSON Schema' },
        { label: '调用', desc: 'Claude 返回 tool_use block 时，query.ts 解析工具名和参数' },
        { label: '校验', desc: 'Zod Schema 验证输入参数合法性，不合法直接返回错误' },
        { label: '权限检查', desc: '检查工具的安全元数据，破坏性操作请求用户确认' },
        { label: '执行', desc: '调用工具的 execute() 方法，捕获结果或异常' },
        { label: '结果返回', desc: '将执行结果封装为 tool_result block 返回给 Claude 继续对话' },
      ]} />
    </>
  )
}

/* ================================================================== */
/*  Tab 2: Command System                                              */
/* ================================================================== */

function CommandsTab() {
  const color = TAB_COLORS[1]
  const groups = [
    {
      title: '代码管理',
      items: [
        { name: '/commit', desc: '智能提交——分析 staged changes 生成符合 Conventional Commits 规范的提交消息。' },
        { name: '/review', desc: '代码审查——对当前 diff 进行全面的代码审查，分析代码质量、潜在 bug、安全隐患。' },
        { name: '/diff', desc: '展示当前工作目录的变更差异。支持 --staged 和 --branch 参数。' },
        { name: '/pr-review', desc: '审查 GitHub Pull Request——获取 PR 完整 diff 并提供审查意见。' },
      ],
    },
    {
      title: '会话管理',
      items: [
        { name: '/compact', desc: '上下文压缩——使用 Claude 自身对当前对话进行摘要，token 数通常减少 60-80%。' },
        { name: '/clear', desc: '完全清除当前对话历史——重置为初始状态但保留 CLAUDE.md 上下文。' },
        { name: '/resume', desc: '恢复之前的会话——从 ~/.claude/sessions 加载历史对话。' },
        { name: '/save', desc: '显式保存当前会话快照到磁盘。' },
      ],
    },
    {
      title: '配置管理',
      items: [
        { name: '/config', desc: '查看和修改运行时配置——支持 get/set/list 子命令。' },
        { name: '/mcp', desc: 'MCP 服务器管理——列出已配置的 MCP 服务器及连接状态。支持 add/remove/restart。' },
        { name: '/permissions', desc: '权限管理——查看当前权限模式和已授予的权限列表。' },
        { name: '/model', desc: '切换对话使用的模型——支持 claude-sonnet/claude-opus 等。' },
      ],
    },
    {
      title: '工具命令',
      items: [
        { name: '/doctor', desc: '系统诊断工具——检查运行环境健康状况，验证 API 连接、MCP 服务器状态。' },
        { name: '/memory', desc: '管理持久化记忆——查看和编辑 CLAUDE.md 文件中的项目上下文。' },
        { name: '/skills', desc: '列出和管理已安装的技能包，存储在 .claude/skills 目录中。' },
        { name: '/tasks', desc: '后台任务管理——查看当前运行的异步任务状态。' },
      ],
    },
    {
      title: 'UI 控制',
      items: [
        { name: '/vim', desc: '切换 Vim 模式——启用后输入框支持 Vim 快捷键。' },
        { name: '/theme', desc: '切换颜色主题——提供 dark、light、solarized、monokai 等内置主题。' },
        { name: '/cost', desc: '查看当前会话的 API 调用成本统计——token 数、缓存命中率、累计费用。' },
        { name: '/verbose', desc: '切换详细输出模式——启用后显示工具调用的完整参数和调试日志。' },
      ],
    },
  ]

  return (
    <>
      <Overview>
        <strong>命令系统（Command System）</strong>通过斜杠命令（/command）提供直接操作界面。当前注册了
        <strong>80+ 命令</strong>，覆盖代码管理、会话控制、配置修改、系统诊断等场景。
      </Overview>

      <SubTitle>命令分组详解</SubTitle>
      <CardGrid>
        {groups.map((g, gi) =>
          <SysCard key={g.title} idx={gi} title={g.title} color={color}>
            <ItemList items={g.items} color={color} />
          </SysCard>
        )}
      </CardGrid>

      <SubTitle>命令解析流程</SubTitle>
      <StepFlow steps={[
        { label: '输入检测', desc: '判断用户输入是否以 / 开头，是则进入命令分支' },
        { label: '命令查找', desc: '从注册表中匹配命令名，支持前缀模糊匹配' },
        { label: '参数解析', desc: '解析命令后的参数字符串，支持 --flag 和 positional args' },
        { label: '权限检查', desc: '部分命令需要特定权限（如 /permissions grant）' },
        { label: '执行', desc: '调用命令的 execute() 函数，传入解析后的参数对象' },
        { label: '输出', desc: '将命令结果渲染到终端，支持富文本格式化' },
      ]} />

      <SubTitle>命令扩展机制</SubTitle>
      <CardGrid>
        <SysCard idx={0} title="内置命令注册" color={color}>
          <p style={{ margin: 0 }}>所有内置命令在 commands.ts 的 registerCommands() 中批量注册。每个命令通过 commandRegistry.register() 添加到全局映射表中。</p>
        </SysCard>
        <SysCard idx={1} title="自定义命令扩展" color={color}>
          <p style={{ margin: 0 }}>用户可通过 .claude/commands 目录添加自定义命令。目录中的每个 .md 文件代表一个命令，文件名即命令名，文件内容作为提示词模板。</p>
        </SysCard>
        <SysCard idx={2} title="Tab 自动补全" color={color}>
          <p style={{ margin: 0 }}>命令系统实现了 readline-compatible 的自动补全接口。用户输入 / 后按 Tab 键，系统根据前缀过滤匹配的命令名列表。</p>
        </SysCard>
      </CardGrid>
    </>
  )
}

/* ================================================================== */
/*  Tab 3: Service Layer                                               */
/* ================================================================== */

function ServicesTab() {
  const color = TAB_COLORS[2]
  const services = [
    { title: 'API 客户端', desc: 'Anthropic SDK 封装层', details: '封装 @anthropic-ai/sdk 的 messages.create() 调用。核心职责：构建请求体、流式响应处理（SSE）、自动重试（429/5xx 指数退避）、Token 计数与成本追踪。' },
    { title: 'MCP 管理器', desc: 'MCP 服务器生命周期', details: '管理所有外部 MCP 服务器的完整生命周期：启动、健康检查、重连、关闭。启动时执行工具发现（tools/list），将远程工具映射为本地 MCPTool 实例。支持 stdio 和 SSE 两种传输协议。' },
    { title: 'OAuth 认证服务', desc: 'OAuth 2.0 + PKCE', details: '实现完整的 OAuth 2.0 Authorization Code + PKCE 流程。安全存储使用系统凭据管理器（macOS Keychain / Linux libsecret / Windows Credential Manager），令牌过期前 5 分钟自动刷新。' },
    { title: 'LSP 管理器', desc: '语言服务器协议', details: '管理与项目语言服务器的连接——支持 TypeScript、Python、Rust 等。核心功能：诊断信息、跳转定义、类型信息。连接采用懒初始化。' },
    { title: '功能开关服务', desc: 'GrowthBook Feature Flag', details: '集成 GrowthBook SDK 实现服务端功能开关评估。缓存 5 分钟，支持灰度发布、A/B 测试和黑白名单。' },
    { title: '上下文压缩服务', desc: '自动摘要与 token 回收', details: '当对话历史超过上下文窗口的 80% 时自动触发压缩。保留关键信息（文件路径、代码变更、工具结果），压缩后 token 减少 60-80%。' },
    { title: '自动记忆服务', desc: '长期记忆提取与持久化', details: '自动检测值得记忆的信息——编码规范、用户偏好、架构决策等。提取的记忆写入 CLAUDE.md 文件，后续会话自动加载。' },
  ]

  return (
    <>
      <Overview>
        <strong>服务层（Service Layer）</strong>封装了所有需要外部通信或复杂状态管理的功能模块。
        每个服务是单例实例，通过依赖注入提供给上层组件使用。设计原则是<em>关注点分离</em>。
      </Overview>

      <SubTitle>核心服务</SubTitle>
      <CardGrid>
        {services.map((s, i) => (
          <SysCard key={s.title} idx={i} title={`${s.title} — ${s.desc}`} color={color}>
            <p style={{ lineHeight: 1.7, margin: 0 }}>{s.details}</p>
          </SysCard>
        ))}
      </CardGrid>

      <SubTitle>服务初始化顺序</SubTitle>
      <StepFlow steps={[
        { label: 'ConfigService', desc: '最先加载，所有其他服务依赖配置数据' },
        { label: 'AuthService', desc: '认证初始化，获取 API Token' },
        { label: 'ApiClient', desc: '初始化 Anthropic SDK 客户端' },
        { label: 'FeatureFlagService', desc: '加载功能开关，影响后续服务行为' },
        { label: 'MCPManager', desc: '启动 MCP 服务器连接（并行）' },
        { label: 'LSPManager', desc: '懒初始化，按需启动语言服务器' },
        { label: 'MemoryService', desc: '加载 CLAUDE.md 记忆文件' },
      ]} />
    </>
  )
}

/* ================================================================== */
/*  Tab 4: Bridge System                                               */
/* ================================================================== */

function BridgeTab() {
  const color = TAB_COLORS[3]
  const bridges = [
    { title: 'VS Code 桥接', details: '通过 Unix Domain Socket（UDS）实现双向通信。通信协议基于 JSON-RPC 2.0，核心消息类型包括：tool_confirmation、file_change、diagnostic_update、progress。' },
    { title: 'JetBrains 桥接', details: 'JetBrains IDE 通过插件系统集成。插件创建 Tool Window 面板并启动 Claude Code 子进程。额外支持代码意图操作、重构建议和内联代码修复。' },
    { title: '消息协议', details: '使用 JSON-RPC 2.0 协议。消息传输全双工——两端都可发起请求。心跳检测每 30 秒一次，3 次无响应判定断开。' },
    { title: '权限回调机制', details: '破坏性工具触发时，通过桥接发送 tool_confirmation 到 IDE。IDE 显示原生确认对话框。超时 30 秒默认拒绝（fail-closed）。' },
    { title: 'JWT 会话安全', details: '桥接连接建立时进行 JWT 令牌验证（RS256 签名），载荷包含 session_id、pid、timestamp。有效期 24 小时。' },
  ]

  return (
    <>
      <Overview>
        <strong>桥接系统（Bridge System）</strong>使 Claude Code 能够与 IDE（VS Code、JetBrains 等）深度集成。
        桥接模式通过 <code style={{ fontFamily: C.mono, background: C.highlight, padding: '1px 4px', borderRadius: 4 }}>BRIDGE_MODE</code> Feature Flag 控制启用。
      </Overview>

      <SubTitle>桥接模块详解</SubTitle>
      <CardGrid>
        {bridges.map((b, i) => (
          <SysCard key={b.title} idx={i} title={b.title} color={color}>
            <p style={{ lineHeight: 1.7, margin: 0 }}>{b.details}</p>
          </SysCard>
        ))}
      </CardGrid>

      <SubTitle>桥接通信生命周期</SubTitle>
      <StepFlow steps={[
        { label: 'IDE 启动', desc: 'IDE 扩展创建通信端点并启动 Claude Code 子进程' },
        { label: '握手', desc: 'Claude Code 发送 initialize 请求，携带 JWT 令牌和版本信息' },
        { label: '能力协商', desc: 'IDE 返回支持的能力列表（权限回调、文件监听、诊断等）' },
        { label: '双向通信', desc: '进入稳态——双方通过 JSON-RPC 交换请求和通知' },
        { label: '心跳保活', desc: '每 30 秒交换 ping/pong 消息，检测连接健康' },
        { label: '优雅关闭', desc: '任一端发送 shutdown 请求，对方确认后断开连接' },
      ]} />
    </>
  )
}

/* ================================================================== */
/*  Tab 5: Permission System                                           */
/* ================================================================== */

function PermissionsTab() {
  const color = TAB_COLORS[4]
  const modes = [
    { name: 'default', tag: '默认模式', desc: '安全操作自动执行，破坏性操作弹出确认对话框。', details: '检查 isReadOnly → allowedTools → 弹出确认。用户可选"允许一次"或"始终允许"。' },
    { name: 'plan', tag: '只读 / 规划模式', desc: '仅允许只读操作。适用于代码审查、架构分析等场景。', details: 'Claude 仍可用 FileReadTool、GrepTool 等只读工具，修改工具返回错误。' },
    { name: 'bypassPermissions', tag: 'Docker / Sandbox 模式', desc: '跳过所有权限检查。仅应在完全隔离环境中使用。', details: '通过 --permission-mode=bypassPermissions 启用。启用时显示醒目警告。' },
    { name: 'auto', tag: '自动审批模式', desc: '根据风险等级自动判断是否需要人工确认。', details: '风险评估：操作类型 × 影响范围 × 路径敏感度 × 命令危险性。日志写入 auto-approve.log。' },
  ]

  return (
    <>
      <Overview>
        <strong>权限系统（Permission System）</strong>是 Claude Code 的安全核心，遵循"默认拒绝"（fail-closed）原则。
        权限决策支持三种粒度：单次允许、会话级允许和持久化允许。
      </Overview>

      <SubTitle>四种权限模式</SubTitle>
      <CardGrid>
        {modes.map((m, i) => (
          <SysCard key={m.name} idx={i} title={m.name} color={color}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px',
                borderRadius: 6, background: C.red + '12', color: C.red,
                border: `1px solid ${C.red}33`,
              }}>{m.tag}</span>
            </div>
            <p style={{ marginBottom: 8, margin: 0 }}>{m.desc}</p>
            <p style={{ fontSize: '0.78rem', color: C.textWeak, lineHeight: 1.6, margin: '8px 0 0' }}>{m.details}</p>
          </SysCard>
        ))}
      </CardGrid>

      <SubTitle>权限检查流程</SubTitle>
      <StepFlow steps={[
        { label: '工具调用触发', desc: 'Claude 返回 tool_use 消息，解析工具名和参数' },
        { label: '权限模式检查', desc: 'bypassPermissions 模式直接跳到执行' },
        { label: '只读检查', desc: 'isReadOnly=true 的工具在所有模式下都直接放行' },
        { label: '持久化授权检查', desc: '查询 allowedTools 列表，glob 模式匹配' },
        { label: '会话级授权检查', desc: '查询当前会话中已批准的临时授权记录' },
        { label: '请求确认', desc: '在终端或 IDE 显示确认对话框，等待用户响应' },
        { label: '记录决策', desc: '缓存用户的授权决策，更新权限状态' },
      ]} />

      <SubTitle>权限配置层次</SubTitle>
      <DataTable
        headers={['配置层级', '文件路径', '作用范围', '优先级']}
        rows={[
          ['全局', <code style={{ fontFamily: C.mono }}>~/.claude/settings.json</code>, '所有项目', '最低'],
          ['项目', <code style={{ fontFamily: C.mono }}>.claude/settings.json</code>, '当前项目', '中'],
          ['会话', '内存中', '当前会话', '高'],
          ['CLI 参数', <code style={{ fontFamily: C.mono }}>--allowedTools</code>, '当前调用', '最高'],
        ]}
      />
    </>
  )
}

/* ================================================================== */
/*  Tab 6: Feature Flags                                               */
/* ================================================================== */

function FlagsTab() {
  const color = TAB_COLORS[5]
  const flags = [
    { name: 'PROACTIVE', desc: '主动建议模式', details: '启用后 Claude 会主动提出改进建议——发现代码中的潜在问题时不等用户询问。当前对 20% 用户启用。' },
    { name: 'KAIROS', desc: '高级推理引擎', details: '启用扩展思考能力——处理复杂问题时获得额外推理时间和 token 预算。max_tokens 上限提升到 16384。' },
    { name: 'BRIDGE_MODE', desc: 'IDE 桥接模式', details: '控制桥接系统是否可用。启用后自动切换为 JSON-RPC 通信模式。可快速全局关闭。' },
    { name: 'DAEMON', desc: '守护进程模式', details: '允许以守护进程方式运行——后台持续监听文件变更、cron 任务和 MCP 事件。' },
    { name: 'VOICE_MODE', desc: '语音输入模式', details: '启用语音输入——通过系统麦克风捕获语音，Whisper API 转录为文本。实验性功能。' },
    { name: 'AGENT_TRIGGERS', desc: '代理触发器', details: '自动化代理触发——检测到特定事件（git push、CI 失败）时自动启动任务。依赖 DAEMON。' },
    { name: 'MONITOR_TOOL', desc: '监控工具', details: '提供 CPU/内存使用率、进程列表等系统信息查询能力。默认对组织用户关闭。' },
    { name: 'PARALLEL_TOOLS', desc: '工具并行执行', details: '多工具并行执行——检查 isConcurrencySafe 后使用 Promise.allSettled() 并行执行。' },
  ]

  return (
    <>
      <Overview>
        <strong>功能开关（Feature Flags）</strong>使用 GrowthBook SDK 实现服务端评估，支持灰度发布、
        A/B 测试和快速回滚。将功能发布与代码部署解耦。所有标志支持编译时死代码消除（DCE）。
      </Overview>

      <SubTitle>当前 Feature Flags</SubTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {flags.map((f, i) => (
          <motion.div
            key={f.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{
              display: 'flex', flexDirection: 'column', gap: 6,
              padding: '12px 16px', borderRadius: 10,
              background: C.cardBg, border: `1px solid ${C.border}`,
              boxShadow: C.shadow,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                background: color, flexShrink: 0,
              }} />
              <span style={{ fontFamily: C.mono, fontSize: '0.85rem', fontWeight: 700, color: C.textMain }}>{f.name}</span>
              <span style={{ fontSize: '0.78rem', color: C.textSec, fontFamily: C.font }}>{f.desc}</span>
            </div>
            <p style={{
              fontSize: '0.78rem', color: C.textWeak,
              lineHeight: 1.65, paddingLeft: 20, margin: 0, fontFamily: C.font,
            }}>
              {f.details}
            </p>
          </motion.div>
        ))}
      </div>

      <SubTitle>Feature Flag 评估流程</SubTitle>
      <StepFlow steps={[
        { label: '配置拉取', desc: '启动时从 GrowthBook API 获取 Flag 定义（缓存 5 分钟）' },
        { label: '上下文构建', desc: '组装评估上下文：user_id, org_id, version, os, env' },
        { label: '规则评估', desc: '按优先级遍历 Flag 规则：强制覆盖 → 白名单 → 灰度百分比' },
        { label: '结果缓存', desc: '评估结果缓存在内存中，相同上下文不重复计算' },
        { label: '代码分支', desc: '业务代码通过 isEnabled(flagName) 检查状态并执行对应分支' },
      ]} />

      <SubTitle>编译时优化</SubTitle>
      <CardGrid>
        <SysCard idx={0} title="bun:bundle 特性标志" color={color}>
          <p style={{ margin: 0 }}>编译阶段通过 define 配置将 Flag 值注入为常量。Bun bundler 执行死代码消除——
          Flag 为 false 时整个 if 分支及其依赖被 tree-shake 移除。</p>
        </SysCard>
        <SysCard idx={1} title="运行时动态评估" color={color}>
          <p style={{ margin: 0 }}>需要灰度发布的 Flag 编译时注入 true，运行时通过 GrowthBook SDK 动态评估。
          双层控制兼顾包体积优化和灰度灵活性。</p>
        </SysCard>
      </CardGrid>
    </>
  )
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

const tabs = ['工具系统', '命令系统', '服务层', '桥接系统', '权限系统', '功能开关']
const panels = [ToolsTab, CommandsTab, ServicesTab, BridgeTab, PermissionsTab, FlagsTab]

export default function Systems() {
  const [active, setActive] = useState(0)
  const Panel = panels[active]

  return (
    <section
      id="systems"
      style={{
        padding: '80px 20px',
        maxWidth: 1060,
        margin: '0 auto',
      }}
    >
      {/* Section tag */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{
          fontSize: 12, fontWeight: 600, color: C.textWeak,
          padding: '4px 12px', borderRadius: 8,
          background: C.highlight, border: `1px solid ${C.border}`,
          fontFamily: C.font,
        }}>
          04 / Core Systems
        </span>
      </div>

      {/* Title */}
      <h2
        className="section-title"
        style={{
          fontSize: 36, fontWeight: 800, color: C.textMain,
          textAlign: 'center', marginBottom: 12, fontFamily: C.font,
        }}
      >
        六大核心系统
      </h2>
      <p
        className="section-subtitle"
        style={{
          color: C.textSec, fontSize: 16, textAlign: 'center',
          maxWidth: 600, margin: '0 auto 40px', fontFamily: C.font,
        }}
      >
        深入各子系统的职责划分与实现细节
      </p>

      {/* Tab navigation - bottom line style */}
      <div
        className="tab-group"
        style={{
          display: 'flex', gap: 0, justifyContent: 'center',
          borderBottom: `1px solid ${C.border}`,
          marginBottom: 32, flexWrap: 'wrap',
        }}
      >
        {tabs.map((t, i) => {
          const isActive = active === i
          return (
            <button
              key={t}
              className="tab-button"
              onClick={() => setActive(i)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderBottom: isActive ? `2px solid ${TAB_COLORS[i]}` : '2px solid transparent',
                background: 'transparent',
                color: isActive ? C.textMain : C.textWeak,
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                cursor: 'pointer',
                outline: 'none',
                fontFamily: C.font,
                transition: 'all 0.2s',
              }}
            >
              {t}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          <Panel />
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
