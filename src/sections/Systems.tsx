import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ================================================================== */
/*  Shared Sub-components                                              */
/* ================================================================== */

function Overview({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--bg-card), var(--bg-hover))',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '20px 24px',
      marginBottom: 28,
      fontSize: '0.88rem',
      color: 'var(--text-dim)',
      lineHeight: 1.75,
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
      borderBottom: '1px solid var(--border)',
      color: 'var(--text)',
    }}>
      {children}
    </h3>
  )
}

function Card({ idx, title, children }: { idx: number; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      className="sys-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04, duration: 0.3 }}
      style={{ position: 'relative', paddingTop: 22 }}
    >
      <span style={{
        position: 'absolute', top: 10, right: 14,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.65rem', color: 'var(--text-muted)',
      }}>
        #{String(idx + 1).padStart(2, '0')}
      </span>
      <h4>{title}</h4>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>
        {children}
      </div>
    </motion.div>
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
            background: 'var(--bg)', borderRadius: 8, padding: '10px 16px',
          }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.72rem', color: 'var(--accent-red)',
              background: 'var(--bg-hover)', borderRadius: 4,
              padding: '2px 8px', flexShrink: 0,
            }}>
              {i + 1}
            </span>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.label}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginLeft: 8 }}>{s.desc}</span>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              width: 2, height: 16, background: 'var(--border)',
              marginLeft: 28,
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ================================================================== */
/*  Tab Data & Tabs                                                    */
/* ================================================================== */

const tabs = ['工具系统', '命令系统', '服务层', '桥接系统', '权限系统', '功能开关']

/* -------------------- 1. Tool System -------------------- */

function ToolsTab() {
  const categories = [
    {
      title: '文件操作',
      items: [
        { name: 'FileReadTool', desc: '读取文件内容，支持行号范围选择（startLine/endLine），自动检测编码（UTF-8/Latin1/Binary），大文件自动截断并提示。实现了智能缓存——对同一文件的连续读取会复用 Buffer，避免重复 I/O。' },
        { name: 'FileWriteTool', desc: '创建或完整覆写文件。写入前自动创建父目录（recursive mkdir），写入后验证文件完整性（字节数比对）。对于受保护路径（node_modules、.git）默认拒绝，需要显式权限。' },
        { name: 'FileEditTool', desc: '基于 diff 的精确编辑工具——接收 oldText 和 newText 参数执行查找替换。底层使用确定性匹配而非正则，确保多处匹配时精确定位。编辑前自动创建 .bak 备份（可配置关闭），编辑后输出变更行的 unified diff。' },
        { name: 'GlobTool', desc: '文件路径模式匹配搜索——支持标准 glob 语法（*、**、?、[abc]）。底层调用 fast-glob 库，自动排除 .gitignore 中的路径。返回匹配文件列表及元数据（大小、修改时间）。' },
        { name: 'GrepTool', desc: '内容搜索工具——优先使用 ripgrep（rg）实现高性能搜索，不可用时降级为 Node.js 原生递归遍历。支持正则表达式、大小写控制、上下文行数配置。自动跳过二进制文件。' },
      ],
    },
    {
      title: '命令执行',
      items: [
        { name: 'BashTool', desc: '在隔离的 shell 环境中执行命令。每次调用创建独立子进程，默认 120 秒超时（可配置），自动捕获 stdout/stderr 分离输出。支持工作目录切换（cwd）和环境变量注入。危险命令（rm -rf /、dd 等）需要显式权限确认。输出超过 100KB 时自动截断并提示。' },
      ],
    },
    {
      title: '代理系统',
      items: [
        { name: 'AgentTool', desc: '子代理委派工具——创建独立的 Claude 对话实例来处理复杂子任务。子代理继承父代理的工具集但拥有独立的上下文窗口和 token 预算。支持任务描述、允许工具列表、最大轮次数等参数。子代理完成后将结果摘要返回给父代理，实现层次化任务分解。' },
      ],
    },
    {
      title: '协议集成',
      items: [
        { name: 'MCPTool', desc: 'Model Context Protocol 工具代理——将外部 MCP 服务器暴露的工具映射为 Claude 可调用的标准工具。每个 MCP 工具维护独立的 JSON Schema 验证和超时设置。支持 stdio 和 SSE 两种传输协议。工具发现阶段自动获取 MCP 服务器的工具列表及其元数据描述。' },
        { name: 'LSPTool', desc: 'Language Server Protocol 集成——连接到项目的语言服务器获取诊断信息（错误、警告、提示）。通过 textDocument/diagnostic 请求获取指定文件的最新问题列表，帮助 Claude 理解代码中的类型错误和 lint 问题。' },
      ],
    },
    {
      title: '团队管理',
      items: [
        { name: 'TeamCreateTool', desc: '创建并行工作的子 agent 团队——在独立的 git worktree 中为每个 agent 分配独立的工作区。支持定义团队成员数量、每个成员的任务描述和约束。底层通过 git worktree add 实现工作区隔离，确保并行编辑不会产生冲突。' },
        { name: 'TeamDeleteTool', desc: '清理团队工作区——安全删除 git worktree 和关联的临时目录。执行前检查工作区中是否有未提交的更改，如有则提示用户确认。清理完成后回收系统资源。' },
      ],
    },
    {
      title: '工作区',
      items: [
        { name: 'EnterWorktreeTool', desc: '进入指定的 git worktree 工作区——切换 CWD 到 worktree 路径，更新文件操作工具的基准路径。记录原始工作目录以便后续恢复。' },
        { name: 'ExitWorktreeTool', desc: '退出当前 worktree 并恢复到原始工作目录。自动清理 worktree 中的临时文件和锁。' },
      ],
    },
    {
      title: '其他工具',
      items: [
        { name: 'WebFetchTool', desc: '获取网页内容——支持 HTTP/HTTPS 请求，自动将 HTML 转换为 Markdown 以节省 token。支持请求头自定义、Cookie 携带、重定向跟踪（最多 5 次）。超时 30 秒，响应体限制 512KB。' },
        { name: 'SleepTool', desc: '暂停执行指定毫秒数——用于等待外部进程完成或实现简单的轮询延迟。最大等待时间 300 秒。' },
        { name: 'CronCreateTool', desc: '创建定时任务——注册 cron 表达式触发的自动化工作流。任务定义包括触发频率、执行内容和超时配置。' },
        { name: 'SkillTool', desc: '技能调用工具——执行用户自定义的 Skill（技能包），从 .claude/skills 目录加载并运行预定义的操作脚本。' },
      ],
    },
  ]

  return (
    <>
      <Overview>
        <strong>工具系统（Tool System）</strong>是 Claude Code 与外部世界交互的核心接口层。每个工具都继承自
        统一的 <code>Tool</code> 基类（Tool.ts, 29KB），通过 Zod Schema 进行输入参数校验，并声明安全元数据
        （isReadOnly, isDestructive, isConcurrencySafe, needsPermissions）。当前版本注册了 <strong>40+ 工具</strong>，
        覆盖文件操作、命令执行、网络请求、协议集成、代理委派等场景。所有工具通过 <code>tools.ts</code> 注册表
        统一管理，运行时按需加载。
      </Overview>

      <SubTitle>工具分类与详解</SubTitle>
      <div className="sys-grid">
        {categories.map((c, ci) =>
          <Card key={c.title} idx={ci} title={c.title}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {c.items.map(item => (
                <li key={item.name} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <code style={{ color: 'var(--accent-red)', fontSize: '0.8rem' }}>{item.name}</code>
                  <p style={{ margin: '4px 0 0', lineHeight: 1.65 }}>{item.desc}</p>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <SubTitle>工具属性元数据</SubTitle>
      <table className="perm-table">
        <thead>
          <tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>isReadOnly</code></td><td>boolean</td><td>false</td><td>标记为只读操作（如 FileReadTool、GrepTool），只读工具不需要权限确认且可以并发执行</td></tr>
          <tr><td><code>isDestructive</code></td><td>boolean</td><td>false</td><td>标记为破坏性操作——会修改文件系统或执行外部命令。破坏性工具在非 bypass 模式下必须获得用户确认</td></tr>
          <tr><td><code>isConcurrencySafe</code></td><td>boolean</td><td>false</td><td>是否允许与其他工具并发执行。采用 fail-closed 策略：未显式声明安全的工具默认串行执行，防止竞态条件</td></tr>
          <tr><td><code>needsPermissions</code></td><td>string[]</td><td>[]</td><td>需要的权限标识列表。权限检查发生在工具执行前，缺少权限时阻塞等待用户确认或直接拒绝（取决于 permission mode）</td></tr>
          <tr><td><code>inputSchema</code></td><td>ZodSchema</td><td>—</td><td>Zod 定义的输入参数 Schema，运行时自动校验所有传入参数。校验失败时返回结构化的错误描述，不执行工具逻辑</td></tr>
          <tr><td><code>userFacingName</code></td><td>string</td><td>—</td><td>展示给用户的可读名称，用于权限确认对话框和日志输出中的工具标识</td></tr>
        </tbody>
      </table>

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

/* -------------------- 2. Command System -------------------- */

function CommandsTab() {
  const groups = [
    {
      title: '代码管理',
      items: [
        { name: '/commit', desc: '智能提交——分析 staged changes 生成符合 Conventional Commits 规范的提交消息。支持 --scope 指定范围、--type 指定类型（feat/fix/refactor 等）。如果没有 staged 文件，自动执行 git add -A 后再提交。' },
        { name: '/review', desc: '代码审查——对当前 diff 进行全面的代码审查。分析代码质量、潜在 bug、性能问题、安全隐患，输出结构化的审查报告。支持 --focus 参数聚焦特定方面（security/performance/style）。' },
        { name: '/diff', desc: '展示当前工作目录的变更差异。默认显示 unstaged changes，支持 --staged 查看暂存区差异、--branch 与指定分支比较。输出带语法高亮的 unified diff 格式。' },
        { name: '/pr-review', desc: '审查 GitHub Pull Request——获取 PR 的完整 diff，分析变更内容并提供审查意见。支持指定 PR 编号，或自动检测当前分支关联的 PR。' },
      ],
    },
    {
      title: '会话管理',
      items: [
        { name: '/compact', desc: '上下文压缩——当对话历史过长时手动触发压缩。使用 Claude 自身对当前对话进行摘要，保留关键的代码上下文、工具调用结果和决策节点，丢弃冗余的中间步骤。压缩后对话 token 数通常减少 60-80%。' },
        { name: '/clear', desc: '完全清除当前对话历史——重置为初始状态但保留 CLAUDE.md 上下文。用于开始全新任务时避免历史干扰。执行前会提示确认。' },
        { name: '/resume', desc: '恢复之前的会话——从 ~/.claude/sessions 目录加载历史对话。支持通过交互式列表选择要恢复的会话（按时间排序），或指定会话 ID 直接加载。' },
        { name: '/save', desc: '显式保存当前会话快照到磁盘。虽然会话默认自动持久化，但此命令允许用户在关键节点创建命名检查点。' },
      ],
    },
    {
      title: '配置管理',
      items: [
        { name: '/config', desc: '查看和修改运行时配置——支持 get/set/list 子命令。可修改模型选择、最大 token 数、自动 compact 阈值等参数。修改后立即生效，不需要重启。' },
        { name: '/mcp', desc: 'MCP 服务器管理——列出已配置的 MCP 服务器及其连接状态。支持 add/remove/restart 子命令在运行时动态管理 MCP 连接。restart 会重新执行服务器发现流程。' },
        { name: '/permissions', desc: '权限管理——查看当前权限模式和已授予的权限列表。支持 grant/revoke 子命令管理工具级别的永久授权。已授权的工具后续调用将跳过确认弹窗。' },
        { name: '/model', desc: '切换对话使用的模型——支持 claude-sonnet-4-20250514、claude-opus-4-20250514 等。切换后对话历史保留，下一轮对话开始使用新模型。' },
      ],
    },
    {
      title: '工具命令',
      items: [
        { name: '/doctor', desc: '系统诊断工具——检查 Claude Code 的运行环境健康状况。验证 API 连接、MCP 服务器状态、git 配置、文件权限等，输出彩色的诊断报告并给出修复建议。' },
        { name: '/memory', desc: '管理持久化记忆——查看和编辑 CLAUDE.md 文件中存储的项目上下文和偏好设置。支持 add/remove/list 子命令。添加的记忆在后续所有会话中自动加载。' },
        { name: '/skills', desc: '列出和管理已安装的技能包。技能是用户自定义的命令扩展，存储在 .claude/skills 目录中。每个技能包含名称、描述、触发模式和执行逻辑。' },
        { name: '/tasks', desc: '后台任务管理——查看当前运行的异步任务（cron 任务、文件监听等）的状态。支持 pause/resume/cancel 子命令。' },
      ],
    },
    {
      title: 'UI 控制',
      items: [
        { name: '/vim', desc: '切换 Vim 模式——启用后输入框支持 Vim 快捷键（h/j/k/l 导航、i/a/o 插入、dd 删除行、yy 复制等）。状态持久化到配置文件中。' },
        { name: '/theme', desc: '切换颜色主题——提供 dark（默认）、light、solarized、monokai 等内置主题。支持通过 JSON 文件自定义主题色板。' },
        { name: '/cost', desc: '查看当前会话的 API 调用成本统计——输入 token 数、输出 token 数、缓存命中率、累计费用。支持 --session 查看单次会话或 --total 查看历史累计。' },
        { name: '/verbose', desc: '切换详细输出模式——启用后显示工具调用的完整参数、API 请求/响应头、内部调试日志。用于排查工具执行问题。' },
      ],
    },
  ]

  return (
    <>
      <Overview>
        <strong>命令系统（Command System）</strong>通过斜杠命令（/command）提供直接操作界面。当前注册了
        <strong>80+ 命令</strong>，覆盖代码管理、会话控制、配置修改、系统诊断等场景。所有命令在
        <code>commands.ts</code>（25KB）中注册，支持 Tab 自动补全和参数提示。命令系统采用命令模式
        （Command Pattern）设计，每个命令是一个独立的函数对象，拥有 name、description、args、execute
        四个标准字段。
      </Overview>

      <SubTitle>命令分组详解</SubTitle>
      <div className="sys-grid">
        {groups.map((g, gi) =>
          <Card key={g.title} idx={gi} title={g.title}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {g.items.map(item => (
                <li key={item.name} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <code style={{ color: 'var(--accent-red)', fontSize: '0.8rem' }}>{item.name}</code>
                  <p style={{ margin: '4px 0 0', lineHeight: 1.65 }}>{item.desc}</p>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

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
      <div className="sys-grid">
        <Card idx={0} title="内置命令注册">
          <p>所有内置命令在 commands.ts 的 registerCommands() 中批量注册。每个命令通过 commandRegistry.register()
          添加到全局映射表中，包含名称、描述、参数定义（Zod Schema）和执行函数。</p>
        </Card>
        <Card idx={1} title="自定义命令扩展">
          <p>用户可通过 .claude/commands 目录添加自定义命令。目录中的每个 .md 文件代表一个命令，
          文件名即命令名，文件内容作为提示词模板。支持 {'{{input}}'} 占位符引用用户输入。</p>
        </Card>
        <Card idx={2} title="Tab 自动补全">
          <p>命令系统实现了 readline-compatible 的自动补全接口。用户输入 / 后按 Tab 键，
          系统根据已输入的前缀过滤匹配的命令名列表并展示。补全列表包含命令名和简短描述。</p>
        </Card>
      </div>
    </>
  )
}

/* -------------------- 3. Service Layer -------------------- */

function ServicesTab() {
  const services = [
    {
      title: 'API 客户端',
      desc: 'Anthropic SDK 封装层',
      details: '封装 @anthropic-ai/sdk 的 messages.create() 调用。核心职责包括：(1) 构建请求体——将对话历史、系统提示、工具定义组装为 API 兼容的 JSON 结构；(2) 流式响应处理——使用 SSE（Server-Sent Events）逐 chunk 接收并解析响应，实时转发给前端渲染；(3) 自动重试——对 429（限流）和 5xx（服务端错误）实现指数退避重试，最多 3 次，退避基数 1 秒；(4) Token 计数——统计每次请求的 input_tokens、output_tokens 和 cache_creation_input_tokens 并更新成本追踪器。',
    },
    {
      title: 'MCP 管理器',
      desc: 'Model Context Protocol 服务器生命周期',
      details: '管理所有外部 MCP 服务器的完整生命周期：启动（spawn 子进程或建立 SSE 连接）、健康检查（定期 ping）、重连（断线自动重连，最多 3 次）、关闭（graceful shutdown + SIGTERM）。启动时执行工具发现（tools/list），将远程工具映射为本地 MCPTool 实例。支持 stdio 和 SSE 两种传输协议，通过配置中的 transport 字段选择。每个服务器维护独立的消息队列和超时计时器。',
    },
    {
      title: 'OAuth 认证服务',
      desc: 'OAuth 2.0 + PKCE 安全认证',
      details: '实现完整的 OAuth 2.0 Authorization Code + PKCE 流程：(1) 生成 code_verifier（128 字节随机数）和 code_challenge（SHA-256 哈希）；(2) 构建授权 URL 并打开系统浏览器；(3) 在本地启动临时 HTTP 服务器（localhost:7160-7180）监听回调；(4) 用 authorization_code 交换 access_token 和 refresh_token；(5) 安全存储——macOS 使用 Keychain，Linux 使用 libsecret，Windows 使用 Credential Manager，降级为加密文件存储。令牌过期前 5 分钟自动刷新。',
    },
    {
      title: 'LSP 管理器',
      desc: '语言服务器协议集成',
      details: '管理与项目语言服务器的连接——支持 TypeScript（tsserver）、Python（pylsp/pyright）、Rust（rust-analyzer）等。通过 stdio 或 TCP 传输发送 LSP 请求。核心功能包括：textDocument/diagnostic 获取诊断信息、textDocument/definition 跳转定义、textDocument/hover 获取类型信息。诊断结果被 Claude 用于理解代码中的类型错误和 lint 警告。连接采用懒初始化——首次需要诊断时才启动语言服务器。',
    },
    {
      title: '功能开关服务',
      desc: 'GrowthBook Feature Flag 评估',
      details: '集成 GrowthBook SDK 实现服务端功能开关评估。启动时从 GrowthBook API 拉取最新的 Feature Flag 配置（缓存 5 分钟），在本地评估用户是否命中特性门控。评估上下文包含 user_id、org_id、版本号、操作系统等属性。支持灰度发布（百分比 rollout）、A/B 测试和黑白名单。评估结果缓存在内存中，避免重复计算。',
    },
    {
      title: '上下文压缩服务',
      desc: '自动对话摘要与 token 回收',
      details: '当对话历史超过上下文窗口的 80% 时自动触发压缩。压缩策略：(1) 将完整对话发送给 Claude 生成结构化摘要；(2) 摘要保留关键信息——文件路径、代码变更、工具调用结果、用户的核心需求；(3) 丢弃冗余的中间推理步骤和重复的文件内容；(4) 压缩后 token 数通常减少 60-80%。支持手动触发（/compact 命令）和自动触发（可配置阈值）。',
    },
    {
      title: '自动记忆服务',
      desc: '长期记忆提取与持久化',
      details: '在对话过程中自动检测值得记忆的信息——项目编码规范、用户偏好、常用命令、架构决策等。提取的记忆以结构化格式写入 CLAUDE.md 文件（项目级或全局级）。记忆分类包括：project_conventions（项目约定）、user_preferences（用户偏好）、codebase_knowledge（代码库知识）。每条记忆包含内容摘要和来源引用。后续会话启动时自动加载 CLAUDE.md 作为系统上下文。',
    },
  ]

  return (
    <>
      <Overview>
        <strong>服务层（Service Layer）</strong>封装了所有需要外部通信或复杂状态管理的功能模块。
        每个服务是单例实例，在启动序列中初始化，通过依赖注入提供给上层组件使用。服务层的设计原则是
        <em>关注点分离</em>——工具层不关心 API 如何调用、认证如何实现、MCP 服务器如何管理，
        只通过服务接口获取所需能力。
      </Overview>

      <SubTitle>核心服务</SubTitle>
      <div className="sys-grid">
        {services.map((s, i) => (
          <Card key={s.title} idx={i} title={`${s.title} — ${s.desc}`}>
            <p style={{ lineHeight: 1.7 }}>{s.details}</p>
          </Card>
        ))}
      </div>

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

/* -------------------- 4. Bridge System -------------------- */

function BridgeTab() {
  const bridges = [
    {
      title: 'VS Code 桥接',
      details: '通过 Unix Domain Socket（UDS）实现 VS Code 与 Claude Code 的双向通信。VS Code 扩展启动时创建 UDS 端点（/tmp/claude-bridge-{pid}.sock），Claude Code 检测到 VS Code Extension Host 环境变量后自动连接。通信协议基于 JSON-RPC 2.0，支持请求/响应和通知两种消息模式。核心消息类型包括：tool_confirmation（权限确认弹窗）、file_change（文件变更通知）、diagnostic_update（诊断信息推送）、progress（进度通知）。消息序列化使用 newline-delimited JSON（NDJSON）格式。',
    },
    {
      title: 'JetBrains 桥接',
      details: 'JetBrains IDE 通过插件系统集成 Claude Code。插件在 IDE 侧创建 Tool Window 面板并启动 Claude Code 子进程。通信通过子进程的 stdin/stdout 管道传递 JSON-RPC 消息。JetBrains 桥接额外支持：代码意图操作（Intention Actions）、重构建议（Refactoring Suggestions）和内联代码修复（Inline Fix）。插件负责将 IDE 的 PSI（Program Structure Interface）信息转换为 Claude 可理解的上下文格式。',
    },
    {
      title: '消息协议',
      details: '桥接系统使用标准 JSON-RPC 2.0 协议规范。每条消息包含 jsonrpc（版本号，固定 "2.0"）、method（方法名）、params（参数对象）和 id（请求标识符，通知消息无此字段）。响应包含 result（成功结果）或 error（错误对象，含 code 和 message 字段）。消息传输是全双工的——两端都可以发起请求。心跳检测每 30 秒一次，3 次无响应判定连接断开。',
    },
    {
      title: '权限回调机制',
      details: '当 Claude Code 需要执行破坏性工具时，通过桥接发送 tool_confirmation 请求到 IDE 侧。IDE 显示原生确认对话框（而非终端弹窗），对话框内容包括工具名称、操作描述、影响范围和风险等级。用户可选择"允许一次"、"允许所有同类操作"或"拒绝"。用户的选择通过 JSON-RPC 响应回传给 Claude Code，权限决策被缓存以避免重复询问。超时未响应（30 秒）默认拒绝（fail-closed）。',
    },
    {
      title: 'JWT 会话安全',
      details: '桥接连接建立时进行 JWT 令牌验证，防止未授权进程连接到 Claude Code 的桥接端口。JWT 由 Claude Code 启动时生成（RS256 签名），载荷包含 session_id、pid、timestamp 和 allowed_origins。VS Code 扩展持有对应的公钥进行验证。令牌有效期 24 小时，过期后需要重新建立连接。所有桥接消息在传输层不加密（本地 UDS 通信），但 JWT 确保只有授权进程能接入。',
    },
  ]

  return (
    <>
      <Overview>
        <strong>桥接系统（Bridge System）</strong>使 Claude Code 能够与 IDE（VS Code、JetBrains 等）深度集成，
        将终端 CLI 工具转变为 IDE 的智能助手。桥接层抽象了底层通信细节，上层代码通过统一的消息接口
        与 IDE 交互，无需关心具体是 UDS 还是 stdio 传输。桥接模式通过 <code>BRIDGE_MODE</code>
        Feature Flag 控制启用，启用后 Claude Code 的 I/O 从 TTY 切换为 JSON-RPC 协议。
      </Overview>

      <SubTitle>桥接模块详解</SubTitle>
      <div className="sys-grid">
        {bridges.map((b, i) => (
          <Card key={b.title} idx={i} title={b.title}>
            <p style={{ lineHeight: 1.7 }}>{b.details}</p>
          </Card>
        ))}
      </div>

      <SubTitle>桥接通信生命周期</SubTitle>
      <StepFlow steps={[
        { label: 'IDE 启动', desc: 'IDE 扩展/插件创建通信端点并启动 Claude Code 子进程' },
        { label: '握手', desc: 'Claude Code 发送 initialize 请求，携带 JWT 令牌和版本信息' },
        { label: '能力协商', desc: 'IDE 返回支持的能力列表（权限回调、文件监听、诊断等）' },
        { label: '双向通信', desc: '进入稳态——双方通过 JSON-RPC 交换请求和通知' },
        { label: '心跳保活', desc: '每 30 秒交换 ping/pong 消息，检测连接健康' },
        { label: '优雅关闭', desc: '任一端发送 shutdown 请求，对方确认后断开连接' },
      ]} />
    </>
  )
}

/* -------------------- 5. Permission System -------------------- */

function PermissionsTab() {
  const modes = [
    {
      name: 'default',
      tag: '默认模式',
      desc: '最常用的权限模式——安全操作（文件读取、搜索）自动执行，破坏性操作（文件写入、命令执行）弹出确认对话框。',
      details: '权限检查逻辑：检查工具的 isReadOnly 标志，true 则直接放行；否则检查 allowedTools 列表是否包含该工具，包含则放行；最终弹出确认对话框等待用户响应。用户可选择"允许一次"或"始终允许"。选择"始终允许"后该工具被添加到 allowedTools 持久化列表中。',
    },
    {
      name: 'plan',
      tag: '只读 / 规划模式',
      desc: '仅允许只读操作——所有标记为 isReadOnly=false 的工具都被禁用。适用于代码审查、架构分析等纯阅读场景。',
      details: 'Claude 仍可使用 FileReadTool、GrepTool、GlobTool 等只读工具来分析代码，但 FileWriteTool、FileEditTool、BashTool 等修改工具将返回"该工具在 plan 模式下不可用"错误。Claude 会根据错误调整策略，给出文字建议而非直接执行。',
    },
    {
      name: 'bypassPermissions',
      tag: 'Docker / Sandbox 模式',
      desc: '跳过所有权限检查——所有工具直接执行无需确认。仅应在完全隔离的环境（Docker 容器、Sandbox VM）中使用。',
      details: '此模式通过 --permission-mode=bypassPermissions 或 CLAUDE_PERMISSION_MODE=bypassPermissions 环境变量启用。启用时会在终端显示醒目的警告横幅。适用场景：CI/CD 流水线中的自动化任务、Docker 容器内的代码生成、沙箱环境中的批量处理。',
    },
    {
      name: 'auto',
      tag: '自动审批模式',
      desc: '智能自动批准——根据工具的风险等级和操作范围自动判断是否需要人工确认。低风险操作自动执行，高风险操作仍需确认。',
      details: '风险评估维度：(1) 操作类型——文件创建比文件删除风险低；(2) 影响范围——单文件操作比 glob 批量操作风险低；(3) 路径敏感度——修改 node_modules 或 .git 目录风险最高；(4) 命令危险性——BashTool 中的 rm、chmod、curl | sh 等命令为高风险。自动模式会将操作日志写入 ~/.claude/auto-approve.log 供事后审计。',
    },
  ]

  return (
    <>
      <Overview>
        <strong>权限系统（Permission System）</strong>是 Claude Code 的安全核心，遵循"默认拒绝"（fail-closed）
        原则——除非工具显式声明安全，否则一律需要用户确认。权限系统在每次工具调用前介入，根据当前权限模式、
        工具的安全元数据和用户的历史授权记录进行决策。权限决策支持三种粒度：单次允许、会话级允许和持久化允许
        （写入 .claude/settings.json）。
      </Overview>

      <SubTitle>四种权限模式</SubTitle>
      <div className="mode-cards">
        {modes.map(m => (
          <motion.div
            key={m.name}
            className="mode-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <h4>{m.name}</h4>
            <span className="mode-tag">{m.tag}</span>
            <p style={{ marginBottom: 10 }}>{m.desc}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{m.details}</p>
          </motion.div>
        ))}
      </div>

      <SubTitle>权限检查流程</SubTitle>
      <StepFlow steps={[
        { label: '工具调用触发', desc: 'Claude 返回 tool_use 消息，query.ts 解析出工具名和参数' },
        { label: '权限模式检查', desc: '如果是 bypassPermissions 模式，直接跳到执行步骤' },
        { label: '只读检查', desc: '如果工具 isReadOnly=true，直接放行（所有模式下只读工具都不需要确认）' },
        { label: '持久化授权检查', desc: '查询 allowedTools 列表，glob 模式匹配通过则放行' },
        { label: '会话级授权检查', desc: '查询当前会话中用户已批准的临时授权记录' },
        { label: '请求确认', desc: '在终端或 IDE 显示确认对话框，等待用户响应' },
        { label: '记录决策', desc: '将用户的授权决策缓存（会话级或持久化），更新权限状态' },
      ]} />

      <SubTitle>权限配置层次</SubTitle>
      <table className="perm-table">
        <thead>
          <tr><th>配置层级</th><th>文件路径</th><th>作用范围</th><th>优先级</th></tr>
        </thead>
        <tbody>
          <tr><td>全局</td><td><code>~/.claude/settings.json</code></td><td>所有项目</td><td>最低</td></tr>
          <tr><td>项目</td><td><code>.claude/settings.json</code></td><td>当前项目</td><td>中</td></tr>
          <tr><td>会话</td><td>内存中</td><td>当前会话</td><td>高</td></tr>
          <tr><td>CLI 参数</td><td><code>--allowedTools</code></td><td>当前调用</td><td>最高</td></tr>
        </tbody>
      </table>
    </>
  )
}

/* -------------------- 6. Feature Flags -------------------- */

function FlagsTab() {
  const flags = [
    {
      name: 'PROACTIVE',
      desc: '主动建议模式',
      details: '启用后 Claude 会在对话中主动提出改进建议——发现代码中的潜在问题、性能优化机会、安全隐患时不等用户询问，直接给出分析和修改方案。通过灰度发布控制，当前对 20% 用户启用。',
    },
    {
      name: 'KAIROS',
      desc: '高级推理引擎',
      details: '启用扩展思考（Extended Thinking）能力——Claude 在处理复杂问题时获得额外的推理时间和 token 预算。适用于大规模重构、架构设计、复杂 debug 等需要深度分析的场景。启用后每次请求的 max_tokens 上限从 4096 提升到 16384。',
    },
    {
      name: 'BRIDGE_MODE',
      desc: 'IDE 桥接模式',
      details: '控制桥接系统是否可用。启用后 Claude Code 在检测到 IDE 环境时自动切换为 JSON-RPC 通信模式。此标志允许逐步灰度 IDE 集成功能，在发现问题时可以快速全局关闭桥接能力。',
    },
    {
      name: 'DAEMON',
      desc: '守护进程模式',
      details: '允许 Claude Code 以守护进程方式运行——在后台持续监听文件变更、cron 任务触发和 MCP 服务器事件。守护进程通过 PID 文件和 Unix Signal 管理生命周期。适用于需要长期运行的自动化工作流。',
    },
    {
      name: 'VOICE_MODE',
      desc: '语音输入模式',
      details: '启用语音输入支持——通过系统麦克风捕获语音，使用 Whisper API 转录为文本后输入到 Claude Code。支持 push-to-talk 和 voice-activity-detection 两种触发模式。当前为实验性功能，仅在 macOS 上可用。',
    },
    {
      name: 'AGENT_TRIGGERS',
      desc: '代理触发器',
      details: '启用自动化的代理触发机制——当检测到特定事件（git push、CI 失败、文件变更）时自动启动对应的 Claude Code 任务。触发规则在 .claude/triggers.json 中配置。此功能依赖 DAEMON 标志也同时启用。',
    },
    {
      name: 'MONITOR_TOOL',
      desc: '监控工具',
      details: '启用系统监控工具——提供 CPU/内存使用率、进程列表、网络连接、磁盘空间等系统信息查询能力。Claude 可通过此工具诊断性能问题和环境异常。出于安全考虑，默认对组织用户关闭。',
    },
    {
      name: 'PARALLEL_TOOLS',
      desc: '工具并行执行',
      details: '允许多个工具在同一轮调用中并行执行——当 Claude 在一次响应中请求多个工具调用时，系统检查每个工具的 isConcurrencySafe 标志，对所有安全的工具使用 Promise.allSettled() 并行执行，显著减少多工具场景的等待时间。',
    },
  ]

  return (
    <>
      <Overview>
        <strong>功能开关（Feature Flags）</strong>使用 GrowthBook SDK 实现服务端评估，支持灰度发布、
        A/B 测试和快速回滚。Feature Flag 的核心价值在于将功能发布与代码部署解耦——新功能可以先合入主分支
        但默认关闭，通过 GrowthBook 后台逐步灰度放量。评估上下文包含 user_id、org_id、SDK 版本号、
        操作系统等属性，支持精细化的受众定向。所有标志在编译时通过 <code>bun:bundle</code> 特性标志
        支持死代码消除（Dead Code Elimination），未启用的功能在生产包中完全不存在。
      </Overview>

      <SubTitle>当前 Feature Flags</SubTitle>
      <div className="flag-list">
        {flags.map((f, i) => (
          <motion.div
            key={f.name}
            className="flag-item"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="flag-dot" />
              <span className="flag-name">{f.name}</span>
              <span className="flag-desc">{f.desc}</span>
            </div>
            <p style={{
              fontSize: '0.78rem', color: 'var(--text-muted)',
              lineHeight: 1.65, paddingLeft: 20, margin: 0,
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
        { label: '代码分支', desc: '业务代码通过 isEnabled(flagName) 检查 Flag 状态并执行对应分支' },
      ]} />

      <SubTitle>编译时优化</SubTitle>
      <div className="sys-grid">
        <Card idx={0} title="bun:bundle 特性标志">
          <p>在编译阶段通过 define 配置将 Feature Flag 的编译时值注入为常量。
          Bun 的 bundler 利用这些常量值执行死代码消除（DCE）——当 Flag 值为 false 时，
          整个 if 分支及其依赖的导入都被 tree-shake 移除，最终产物不包含任何未启用功能的代码。
          这确保了运行时零开销——未启用的功能不仅不执行，甚至不存在于内存中。</p>
        </Card>
        <Card idx={1} title="运行时动态评估">
          <p>对于需要灰度发布的 Flag，编译时注入 true（功能代码保留），运行时通过 GrowthBook SDK
          动态评估是否对当前用户启用。这实现了两层控制：编译时决定功能代码是否存在，
          运行时决定功能是否对特定用户激活。双层控制兼顾了包体积优化和灰度发布的灵活性。</p>
        </Card>
      </div>
    </>
  )
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

const panels = [ToolsTab, CommandsTab, ServicesTab, BridgeTab, PermissionsTab, FlagsTab]

export default function Systems() {
  const [active, setActive] = useState(0)
  const Panel = panels[active]

  return (
    <section id="systems" className="section">
      <span className="section-tag">04 / Core Systems</span>
      <h2 className="section-title">六大核心系统</h2>
      <p className="section-desc">深入各子系统的职责划分与实现细节</p>
      <div className="tab-bar">
        {tabs.map((t, i) => (
          <button
            key={t}
            className={`tab-btn${active === i ? ' active' : ''}`}
            onClick={() => setActive(i)}
          >
            {t}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <Panel />
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
