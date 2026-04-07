import { useState } from 'react'
import { CompactTab, StateTab, CoordinatorTab } from './MemorySystemParts'

const tabs = [
  { id: 'overview', label: '记忆架构总览' },
  { id: 'memdir', label: '记忆目录系统' },
  { id: 'context', label: '上下文管理' },
  { id: 'compact', label: '对话压缩' },
  { id: 'state', label: '状态管理' },
  { id: 'coordinator', label: '协调器与多智能体' },
]

const highlightCode = (code: string) => {
  return code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(\/\/.*)/g, '<span style="color:#6b7280">$1</span>')
    .replace(/\b(import|export|from|const|let|var|function|return|if|else|async|await|type|interface|class|new|this|true|false|null|undefined|void|satisfies|string|number|boolean|Record|Promise|Set|Map)\b/g, '<span style="color:#8b5cf6">$1</span>')
    .replace(/(?<![;:"\w#])\b(\d+\.?\d*)\b/g, '<span style="color:#f59e0b">$1</span>')
    .replace(/(["'`])((?:(?!\1).)*)\1/g, '<span style="color:#10b981">$1$2$1</span>')
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 24,
  marginBottom: 20,
}

const codeBlockStyle: React.CSSProperties = {
  background: '#1e293b',
  color: '#e2e8f0',
  borderRadius: 8,
  padding: 16,
  fontSize: 13,
  fontFamily: '"JetBrains Mono", monospace',
  lineHeight: 1.6,
  overflowX: 'auto',
  marginTop: 12,
}

const badgeStyle = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: 9999,
  fontSize: 12,
  fontWeight: 600,
  background: color + '15',
  color: color,
  marginRight: 6,
  marginBottom: 6,
})

/* ─── Tab 1: Architecture Overview SVG ─── */
function OverviewTab() {
  return (
    <div>
      {/* Architecture Diagram */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
          记忆系统全景架构
        </h3>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
          Claude Code 的记忆系统通过多层架构实现持久化知识管理,涵盖四种记忆类型、目录扫描、相关性检索与上下文注入的完整流水线。
        </p>
        <svg viewBox="0 0 960 620" style={{ width: '100%', height: 'auto' }}>
          {/* Background */}
          <rect x="0" y="0" width="960" height="620" rx="12" fill="#f8fafc" />

          {/* Title */}
          <text x="480" y="36" textAnchor="middle" fontSize="18" fontWeight="700" fill="#0f172a">Memory System Architecture Pipeline</text>

          {/* Layer 1: Input */}
          <rect x="30" y="56" width="180" height="60" rx="10" fill="#3b82f6" opacity="0.12" stroke="#3b82f6" strokeWidth="1.5"/>
          <text x="120" y="82" textAnchor="middle" fontSize="13" fontWeight="700" fill="#3b82f6">User Input</text>
          <text x="120" y="100" textAnchor="middle" fontSize="11" fill="#64748b">用户查询 / 命令</text>

          {/* Arrow */}
          <line x1="210" y1="86" x2="260" y2="86" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowGray)" />

          {/* Layer 2: QueryEngine */}
          <rect x="260" y="56" width="200" height="60" rx="10" fill="#8b5cf6" opacity="0.12" stroke="#8b5cf6" strokeWidth="1.5"/>
          <text x="360" y="82" textAnchor="middle" fontSize="13" fontWeight="700" fill="#8b5cf6">QueryEngine</text>
          <text x="360" y="100" textAnchor="middle" fontSize="11" fill="#64748b">submitMessage() 入口</text>

          {/* Arrow down */}
          <line x1="360" y1="116" x2="360" y2="150" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowGray)" />

          {/* Layer 3: System Prompt Assembly */}
          <rect x="230" y="150" width="260" height="50" rx="10" fill="#10b981" opacity="0.12" stroke="#10b981" strokeWidth="1.5"/>
          <text x="360" y="172" textAnchor="middle" fontSize="13" fontWeight="700" fill="#10b981">fetchSystemPromptParts()</text>
          <text x="360" y="190" textAnchor="middle" fontSize="11" fill="#64748b">系统提示组装</text>

          {/* Arrow to memory */}
          <line x1="360" y1="200" x2="360" y2="240" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowGray)" />

          {/* Memory Loading Box */}
          <rect x="160" y="240" width="400" height="180" rx="12" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5"/>
          <text x="360" y="265" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a">loadMemoryPrompt() - 记忆加载引擎</text>

          {/* Inside: scan pipeline */}
          <rect x="180" y="280" width="140" height="44" rx="8" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" strokeWidth="1"/>
          <text x="250" y="298" textAnchor="middle" fontSize="11" fontWeight="600" fill="#f59e0b">scanMemoryDir()</text>
          <text x="250" y="314" textAnchor="middle" fontSize="10" fill="#64748b">目录扫描</text>

          <line x1="320" y1="302" x2="350" y2="302" stroke="#94a3b8" strokeWidth="1" markerEnd="url(#arrowGray)" />

          <rect x="350" y="280" width="140" height="44" rx="8" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" strokeWidth="1"/>
          <text x="420" y="298" textAnchor="middle" fontSize="11" fontWeight="600" fill="#f59e0b">parseFrontmatter()</text>
          <text x="420" y="314" textAnchor="middle" fontSize="10" fill="#64748b">元数据解析</text>

          <line x1="360" y1="324" x2="360" y2="342" stroke="#94a3b8" strokeWidth="1" markerEnd="url(#arrowGray)" />

          <rect x="240" y="342" width="240" height="44" rx="8" fill="#3b82f6" opacity="0.15" stroke="#3b82f6" strokeWidth="1"/>
          <text x="360" y="360" textAnchor="middle" fontSize="11" fontWeight="600" fill="#3b82f6">findRelevantMemories()</text>
          <text x="360" y="376" textAnchor="middle" fontSize="10" fill="#64748b">Sonnet 侧查询, 选取 Top-5</text>

          <rect x="500" y="342" width="50" height="44" rx="8" fill="#8b5cf6" opacity="0.15" stroke="#8b5cf6" strokeWidth="1"/>
          <text x="525" y="368" textAnchor="middle" fontSize="20">🧠</text>

          {/* Arrow from Memory box to API */}
          <line x1="360" y1="420" x2="360" y2="460" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowGray)" />

          {/* Layer 5: Claude API */}
          <rect x="260" y="460" width="200" height="60" rx="10" fill="#ef4444" opacity="0.12" stroke="#ef4444" strokeWidth="1.5"/>
          <text x="360" y="486" textAnchor="middle" fontSize="13" fontWeight="700" fill="#ef4444">Claude API Call</text>
          <text x="360" y="504" textAnchor="middle" fontSize="11" fill="#64748b">带记忆上下文的推理</text>

          {/* Arrow to response */}
          <line x1="460" y1="490" x2="520" y2="490" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowGray)" />
          <rect x="520" y="460" width="180" height="60" rx="10" fill="#10b981" opacity="0.12" stroke="#10b981" strokeWidth="1.5"/>
          <text x="610" y="486" textAnchor="middle" fontSize="13" fontWeight="700" fill="#10b981">Response + Actions</text>
          <text x="610" y="504" textAnchor="middle" fontSize="11" fill="#64748b">响应与工具调用</text>

          {/* Right side: 4 Memory Types */}
          <rect x="620" y="56" width="320" height="370" rx="12" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5"/>
          <text x="780" y="82" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a">四种记忆类型 (memoryTypes.ts)</text>

          <rect x="640" y="96" width="140" height="68" rx="8" fill="#3b82f6" opacity="0.12" stroke="#3b82f6" strokeWidth="1"/>
          <text x="710" y="118" textAnchor="middle" fontSize="12" fontWeight="700" fill="#3b82f6">User 用户记忆</text>
          <text x="710" y="134" textAnchor="middle" fontSize="10" fill="#64748b">偏好 / 工作习惯</text>
          <text x="710" y="150" textAnchor="middle" fontSize="10" fill="#64748b">~/.claude/memory/</text>

          <rect x="800" y="96" width="120" height="68" rx="8" fill="#8b5cf6" opacity="0.12" stroke="#8b5cf6" strokeWidth="1"/>
          <text x="860" y="118" textAnchor="middle" fontSize="12" fontWeight="700" fill="#8b5cf6">Feedback 反馈</text>
          <text x="860" y="134" textAnchor="middle" fontSize="10" fill="#64748b">工具使用纠正</text>
          <text x="860" y="150" textAnchor="middle" fontSize="10" fill="#64748b">自动生成</text>

          <rect x="640" y="178" width="140" height="68" rx="8" fill="#10b981" opacity="0.12" stroke="#10b981" strokeWidth="1"/>
          <text x="710" y="200" textAnchor="middle" fontSize="12" fontWeight="700" fill="#10b981">Project 项目记忆</text>
          <text x="710" y="216" textAnchor="middle" fontSize="10" fill="#64748b">架构 / 规范 / 约定</text>
          <text x="710" y="232" textAnchor="middle" fontSize="10" fill="#64748b">.claude/memory/</text>

          <rect x="800" y="178" width="120" height="68" rx="8" fill="#f59e0b" opacity="0.12" stroke="#f59e0b" strokeWidth="1"/>
          <text x="860" y="200" textAnchor="middle" fontSize="12" fontWeight="700" fill="#f59e0b">Reference 参考</text>
          <text x="860" y="216" textAnchor="middle" fontSize="10" fill="#64748b">文档 / API 参考</text>
          <text x="860" y="232" textAnchor="middle" fontSize="10" fill="#64748b">只读引用</text>

          {/* Storage Paths */}
          <rect x="640" y="264" width="280" height="80" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
          <text x="780" y="286" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">存储路径层级 (paths.ts)</text>
          <text x="660" y="306" fontSize="11" fill="#64748b" fontFamily="monospace">~/.claude/memory/</text>
          <text x="660" y="322" fontSize="11" fill="#64748b" fontFamily="monospace">./.claude/memory/</text>
          <text x="660" y="338" fontSize="11" fill="#64748b" fontFamily="monospace">team-memory/ (共享)</text>
          <text x="870" y="306" fontSize="10" fill="#3b82f6">全局</text>
          <text x="870" y="322" fontSize="10" fill="#10b981">项目</text>
          <text x="870" y="338" fontSize="10" fill="#f59e0b">团队</text>

          {/* CLAUDE.md */}
          <rect x="640" y="356" width="280" height="54" rx="8" fill="#ef4444" opacity="0.08" stroke="#ef4444" strokeWidth="1"/>
          <text x="780" y="378" textAnchor="middle" fontSize="12" fontWeight="700" fill="#ef4444">CLAUDE.md 项目指令</text>
          <text x="780" y="396" textAnchor="middle" fontSize="10" fill="#64748b">context.ts: getUserContext() 加载并注入</text>

          {/* Arrow connecting right panel to memory loading */}
          <line x1="620" y1="300" x2="560" y2="340" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" markerEnd="url(#arrowGray)" />

          {/* Bottom: Key Metrics */}
          <rect x="30" y="540" width="200" height="60" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"/>
          <text x="130" y="564" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">MEMORY.md 截断</text>
          <text x="130" y="584" textAnchor="middle" fontSize="20" fontWeight="800" fill="#f59e0b">2000 chars max</text>

          <rect x="260" y="540" width="200" height="60" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"/>
          <text x="360" y="564" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">相关记忆选取</text>
          <text x="360" y="584" textAnchor="middle" fontSize="20" fontWeight="800" fill="#3b82f6">Top 5 条</text>

          <rect x="490" y="540" width="200" height="60" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"/>
          <text x="590" y="564" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">检索模型</text>
          <text x="590" y="584" textAnchor="middle" fontSize="20" fontWeight="800" fill="#8b5cf6">Sonnet</text>

          <rect x="720" y="540" width="220" height="60" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"/>
          <text x="830" y="564" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">记忆文件格式</text>
          <text x="830" y="584" textAnchor="middle" fontSize="20" fontWeight="800" fill="#10b981">Markdown + YAML</text>

          <defs>
            <marker id="arrowGray" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {[
          { title: 'buildMemoryPrompt()', desc: '核心入口函数。从 memdir.ts 导出,负责扫描记忆目录、解析前置数据、调用 Sonnet 筛选相关记忆,最终拼装为系统提示注入 Claude API。支持 KAIROS 模式(无限记忆)和 MEMORY.md 截断(最大 2000 字符)。', color: '#3b82f6' },
          { title: 'findRelevantMemories()', desc: '记忆检索核心。接收完整记忆清单和当前用户查询,通过 Sonnet 模型侧查询(side-query)评估每条记忆的相关性,返回最多 5 条最相关的记忆条目。使用独立的 API 调用,不影响主对话流。', color: '#8b5cf6' },
          { title: 'getUserContext()', desc: '上下文构建器。来自 context.ts,通过 memoized 函数加载 Git 状态、工作目录信息、操作系统信息、CLAUDE.md 项目指令,组装为完整的用户上下文字符串,在 /compact 后自动清除缓存。', color: '#10b981' },
          { title: 'scanMemoryDirectory()', desc: '目录扫描器。递归扫描指定记忆目录下的所有 .md 文件,解析 YAML frontmatter(title、tags、confidence、lastVerified),生成结构化清单(manifest),用于后续的相关性检索。', color: '#f59e0b' },
        ].map(item => (
          <div key={item.title} style={{ ...cardStyle, borderTop: `3px solid ${item.color}` }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: item.color, marginBottom: 8, fontFamily: '"JetBrains Mono", monospace' }}>{item.title}</h4>
            <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.7 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Tab 2: Memory Directory System ─── */
function MemdirTab() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  const modules = [
    {
      file: 'memdir.ts',
      desc: '记忆模块主入口。构建完整的记忆提示(memory prompt),管理 MEMORY.md 文件截断,支持 KAIROS 无限记忆模式检测。',
      color: '#3b82f6',
      funcs: ['buildMemoryPrompt()', 'truncateMemoryMd()', 'isKairosMode()'],
      tags: ['核心入口', '提示构建'],
      code: `// memdir.ts - 核心记忆提示构建
export async function buildMemoryPrompt(
  cwd: string,
  userQuery: string,
  options: MemoryOptions
): Promise<string> {
  // 1. 扫描所有记忆目录
  const memories = await scanMemoryDirectory(
    getMemoryPaths(cwd)
  )
  // 2. 如果存在 MEMORY.md, 截断到 2000 字符
  const memoryMd = truncateMemoryMd(
    readMemoryMd(cwd), 2000
  )
  // 3. 通过 Sonnet 侧查询选择相关记忆
  const relevant = await findRelevantMemories(
    memories.manifest, userQuery
  )
  // 4. 按类型分组构建提示段落
  return assembleMemoryPrompt(
    relevant, memoryMd, memories.stats
  )
}`
    },
    {
      file: 'memoryScan.ts',
      desc: '目录扫描与前置数据解析。递归遍历记忆目录,解析每个 .md 文件的 YAML frontmatter,提取 title、tags、confidence、lastVerified 等元数据,生成结构化清单。',
      color: '#10b981',
      funcs: ['scanMemoryDirectory()', 'parseMemoryFrontmatter()', 'formatManifest()'],
      tags: ['文件扫描', 'YAML解析'],
      code: `// memoryScan.ts - 记忆目录扫描
interface MemoryEntry {
  path: string
  title: string
  tags: string[]
  confidence: number  // 0-1 置信度
  lastVerified: Date
  content: string
  type: MemoryType
}

export async function scanMemoryDirectory(
  paths: string[]
): Promise<{ entries: MemoryEntry[], manifest: string }> {
  const entries: MemoryEntry[] = []
  for (const dir of paths) {
    const files = await glob(dir + '/**/*.md')
    for (const file of files) {
      const raw = await readFile(file, 'utf-8')
      const { data, content } = parseFrontmatter(raw)
      entries.push({
        path: file,
        title: data.title || basename(file),
        tags: data.tags || [],
        confidence: data.confidence ?? 1.0,
        lastVerified: data.lastVerified,
        content,
        type: inferMemoryType(file, data),
      })
    }
  }
  return { entries, manifest: formatManifest(entries) }
}`
    },
    {
      file: 'memoryTypes.ts',
      desc: '四种记忆类型的分类系统。定义 user(用户)、feedback(反馈)、project(项目)、reference(参考) 四种类型,每种类型有独立的提示模板和优先级权重。',
      color: '#8b5cf6',
      funcs: ['getPromptSection()', 'inferMemoryType()', 'typeWeights'],
      tags: ['类型系统', '提示模板'],
      code: `// memoryTypes.ts - 记忆类型分类
export type MemoryType =
  | 'user'      // 用户偏好、工作习惯
  | 'feedback'  // 工具使用纠正、行为反馈
  | 'project'   // 架构决策、编码规范
  | 'reference' // API 文档、外部参考

// 每种类型的提示模板
const promptTemplates: Record<MemoryType, string> = {
  user: 'User preferences and habits:\\n{content}',
  feedback: 'Past corrections and feedback:\\n{content}',
  project: 'Project context and conventions:\\n{content}',
  reference: 'Reference documentation:\\n{content}',
}

// 类型权重 - 影响相关性排序
export const typeWeights: Record<MemoryType, number> = {
  user: 1.0,
  feedback: 0.9,
  project: 0.8,
  reference: 0.6,
}`
    },
    {
      file: 'findRelevantMemories.ts',
      desc: '记忆相关性检索。通过 Sonnet 模型侧查询(side-query)评估记忆清单中每条记忆与当前用户查询的相关性,返回最多 5 条最匹配的记忆,不干扰主对话流。',
      color: '#ef4444',
      funcs: ['findRelevantMemories()', 'buildRelevancePrompt()', 'parseRelevanceResponse()'],
      tags: ['AI检索', 'Sonnet侧查询'],
      code: `// findRelevantMemories.ts - AI 驱动的记忆检索
export async function findRelevantMemories(
  manifest: string,
  userQuery: string,
  maxResults: number = 5
): Promise<RelevantMemory[]> {
  // 构建侧查询提示
  const prompt = buildRelevancePrompt(manifest, userQuery)

  // 调用 Sonnet 模型评估相关性 (独立 API 调用)
  const response = await sideQuery({
    model: 'claude-sonnet',
    prompt,
    maxTokens: 1024,
  })

  // 解析模型返回的相关性评分
  const ranked = parseRelevanceResponse(response)

  // 返回 Top-N 最相关记忆
  return ranked
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, maxResults)
}`
    },
    {
      file: 'memoryAge.ts',
      desc: '记忆新鲜度管理。计算每条记忆的年龄(基于 lastVerified 字段),检测过期记忆并生成告警,帮助用户维护记忆库的准确性。',
      color: '#f59e0b',
      funcs: ['calculateAge()', 'isStale()', 'getStalenessWarning()'],
      tags: ['时效管理', '过期检测'],
      code: `// memoryAge.ts - 记忆新鲜度检测
const STALE_THRESHOLDS = {
  warning: 30 * 24 * 60 * 60 * 1000,  // 30 天
  critical: 90 * 24 * 60 * 60 * 1000, // 90 天
}

export function calculateAge(
  lastVerified: Date
): { days: number, status: 'fresh' | 'warning' | 'critical' } {
  const age = Date.now() - lastVerified.getTime()
  const days = Math.floor(age / (24 * 60 * 60 * 1000))
  return {
    days,
    status: age > STALE_THRESHOLDS.critical ? 'critical'
          : age > STALE_THRESHOLDS.warning ? 'warning'
          : 'fresh'
  }
}

export function getStalenessWarning(
  entry: MemoryEntry
): string | null {
  const { days, status } = calculateAge(entry.lastVerified)
  if (status === 'critical')
    return \`Memory "\${entry.title}" is \${days} days old\`
  return null
}`
    },
    {
      file: 'paths.ts',
      desc: '记忆存储路径解析。实现三级路径层级(全局 → 项目 → 本地),自动检测记忆功能是否启用,验证路径安全性。',
      color: '#06b6d4',
      funcs: ['getMemoryPaths()', 'isMemoryEnabled()', 'validatePath()'],
      tags: ['路径解析', '安全验证'],
      code: `// paths.ts - 记忆路径层级
export function getMemoryPaths(cwd: string): string[] {
  const paths: string[] = []

  // 1. 全局记忆: ~/.claude/memory/
  const globalDir = join(homedir(), '.claude', 'memory')
  if (existsSync(globalDir)) paths.push(globalDir)

  // 2. 项目记忆: <project>/.claude/memory/
  const projectDir = join(cwd, '.claude', 'memory')
  if (existsSync(projectDir)) paths.push(projectDir)

  // 3. 自动检测记忆是否启用
  // 基于 .claude/settings.json 中的配置
  return paths
}

export function isMemoryEnabled(cwd: string): boolean {
  const settings = loadSettings(cwd)
  return settings.memory?.enabled !== false
}`
    },
    {
      file: 'teamMemPaths.ts',
      desc: '团队记忆路径管理。处理共享团队记忆目录,包含路径遍历(path traversal)安全防护,防止恶意路径访问项目外文件。',
      color: '#ec4899',
      funcs: ['getTeamMemoryPaths()', 'validateTraversal()', 'resolveTeamDir()'],
      tags: ['团队共享', '安全防护'],
      code: `// teamMemPaths.ts - 团队记忆安全路径
export function getTeamMemoryPaths(
  cwd: string,
  teamConfig: TeamConfig
): string[] {
  const paths: string[] = []
  for (const teamDir of teamConfig.memoryDirs) {
    // 路径遍历安全检查
    const resolved = resolve(cwd, teamDir)
    if (!validateTraversal(resolved, cwd)) {
      console.warn('Path traversal detected:', teamDir)
      continue
    }
    if (existsSync(resolved)) paths.push(resolved)
  }
  return paths
}

// 防止 ../../../etc/passwd 等攻击
function validateTraversal(
  resolved: string, base: string
): boolean {
  return resolved.startsWith(base)
    || resolved.startsWith(homedir())
}`
    },
    {
      file: 'teamMemPrompts.ts',
      desc: '团队记忆提示合并器。将团队共享记忆与私有记忆合并为统一提示,处理优先级冲突和去重逻辑。',
      color: '#6366f1',
      funcs: ['buildCombinedPrompt()', 'mergeMemories()', 'deduplicateEntries()'],
      tags: ['提示合并', '去重逻辑'],
      code: `// teamMemPrompts.ts - 团队+私有记忆合并
export async function buildCombinedPrompt(
  cwd: string,
  userQuery: string,
  teamConfig: TeamConfig
): Promise<string> {
  // 加载私有记忆
  const privateMemories = await scanMemoryDirectory(
    getMemoryPaths(cwd)
  )
  // 加载团队记忆
  const teamMemories = await scanMemoryDirectory(
    getTeamMemoryPaths(cwd, teamConfig)
  )
  // 合并并去重
  const merged = mergeMemories(
    privateMemories.entries,
    teamMemories.entries
  )
  // 私有记忆优先级高于团队记忆
  return assembleMemoryPrompt(
    merged, null, { private: privateMemories.entries.length,
                    team: teamMemories.entries.length }
  )
}`
    },
  ]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        {modules.map(mod => (
          <div key={mod.file} style={{ ...cardStyle, borderLeft: `4px solid ${mod.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: mod.color, fontFamily: '"JetBrains Mono", monospace' }}>
                {mod.file}
              </h4>
              <div>
                {mod.tags.map(t => (
                  <span key={t} style={badgeStyle(mod.color)}>{t}</span>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.7, marginBottom: 12 }}>{mod.desc}</p>
            <div style={{ marginBottom: 12 }}>
              {mod.funcs.map(f => (
                <span key={f} style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontFamily: '"JetBrains Mono", monospace', background: '#f1f5f9', color: '#475569', marginRight: 6, marginBottom: 4 }}>
                  {f}
                </span>
              ))}
            </div>
            <button
              onClick={() => toggle(mod.file)}
              style={{ fontSize: 13, color: mod.color, background: 'none', border: `1px solid ${mod.color}30`, borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}
            >
              {expanded[mod.file] ? '收起代码' : '查看核心代码'} {expanded[mod.file] ? '▲' : '▼'}
            </button>
            {expanded[mod.file] && (
              <pre style={codeBlockStyle} dangerouslySetInnerHTML={{ __html: highlightCode(mod.code) }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Tab 3: Context Management ─── */
function ContextTab() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div>
      {/* Context Assembly Diagram */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
          上下文组装流水线
        </h3>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
          context.ts 通过 memoized 函数层层组装系统上下文,从操作系统信息到项目指令,最终形成完整的用户上下文字符串。
        </p>
        <svg viewBox="0 0 800 520" style={{ width: '100%', height: 'auto' }}>
          <rect x="0" y="0" width="800" height="520" rx="12" fill="#f8fafc" />
          <text x="400" y="32" textAnchor="middle" fontSize="16" fontWeight="700" fill="#0f172a">Context Assembly Pipeline</text>

          {/* Layer 1: OS/System Info */}
          <rect x="40" y="52" width="320" height="70" rx="10" fill="#3b82f6" opacity="0.1" stroke="#3b82f6" strokeWidth="1.5"/>
          <text x="200" y="78" textAnchor="middle" fontSize="13" fontWeight="700" fill="#3b82f6">getSystemContext()</text>
          <text x="70" y="100" fontSize="11" fill="#64748b">OS: process.platform | CWD: cwd</text>
          <text x="70" y="114" fontSize="11" fill="#64748b">Git: branch, status, remote URL</text>

          {/* Layer 2: CLAUDE.md */}
          <rect x="40" y="140" width="320" height="90" rx="10" fill="#10b981" opacity="0.1" stroke="#10b981" strokeWidth="1.5"/>
          <text x="200" y="166" textAnchor="middle" fontSize="13" fontWeight="700" fill="#10b981">CLAUDE.md 加载层级</text>
          <rect x="60" y="178" width="90" height="30" rx="6" fill="#10b981" opacity="0.2"/>
          <text x="105" y="198" textAnchor="middle" fontSize="10" fontWeight="600" fill="#10b981">全局</text>
          <text x="160" y="198" fontSize="14" fill="#94a3b8">&rarr;</text>
          <rect x="175" y="178" width="90" height="30" rx="6" fill="#10b981" opacity="0.35"/>
          <text x="220" y="198" textAnchor="middle" fontSize="10" fontWeight="600" fill="#10b981">项目根</text>
          <text x="275" y="198" fontSize="14" fill="#94a3b8">&rarr;</text>
          <rect x="290" y="178" width="55" height="30" rx="6" fill="#10b981" opacity="0.5"/>
          <text x="317" y="198" textAnchor="middle" fontSize="10" fontWeight="600" fill="#10b981">本地</text>

          {/* Layer 3: Memory */}
          <rect x="40" y="250" width="320" height="70" rx="10" fill="#8b5cf6" opacity="0.1" stroke="#8b5cf6" strokeWidth="1.5"/>
          <text x="200" y="276" textAnchor="middle" fontSize="13" fontWeight="700" fill="#8b5cf6">loadMemoryPrompt()</text>
          <text x="70" y="298" fontSize="11" fill="#64748b">记忆目录扫描 + Sonnet 相关性筛选</text>
          <text x="70" y="312" fontSize="11" fill="#64748b">最多注入 5 条相关记忆</text>

          {/* Layer 4: User Context */}
          <rect x="40" y="340" width="320" height="70" rx="10" fill="#f59e0b" opacity="0.1" stroke="#f59e0b" strokeWidth="1.5"/>
          <text x="200" y="366" textAnchor="middle" fontSize="13" fontWeight="700" fill="#f59e0b">getUserContext()</text>
          <text x="70" y="388" fontSize="11" fill="#64748b">Memoized: 合并 System + CLAUDE.md + Memory</text>
          <text x="70" y="402" fontSize="11" fill="#64748b">compact 后自动 cache.clear()</text>

          {/* Arrows */}
          <line x1="200" y1="122" x2="200" y2="140" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowCtx)" />
          <line x1="200" y1="230" x2="200" y2="250" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowCtx)" />
          <line x1="200" y1="320" x2="200" y2="340" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowCtx)" />

          {/* Final: System Prompt */}
          <line x1="200" y1="410" x2="200" y2="450" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowCtx)" />
          <rect x="80" y="450" width="240" height="50" rx="10" fill="#ef4444" opacity="0.12" stroke="#ef4444" strokeWidth="2"/>
          <text x="200" y="478" textAnchor="middle" fontSize="14" fontWeight="700" fill="#ef4444">Final System Prompt</text>
          <text x="200" y="494" textAnchor="middle" fontSize="11" fill="#64748b">fetchSystemPromptParts()</text>

          {/* Right side: Memoization Strategy */}
          <rect x="420" y="52" width="360" height="448" rx="12" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5"/>
          <text x="600" y="80" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a">Memoization 策略详解</text>

          <rect x="440" y="100" width="320" height="80" rx="8" fill="#3b82f6" opacity="0.06"/>
          <text x="460" y="122" fontSize="12" fontWeight="700" fill="#3b82f6">缓存机制</text>
          <text x="460" y="142" fontSize="11" fill="#334155">getUserContext 使用 memoize() 包装</text>
          <text x="460" y="158" fontSize="11" fill="#334155">同一会话内多次调用复用缓存结果</text>
          <text x="460" y="174" fontSize="11" fill="#334155">避免重复读取文件系统和 Git 状态</text>

          <rect x="440" y="196" width="320" height="80" rx="8" fill="#ef4444" opacity="0.06"/>
          <text x="460" y="218" fontSize="12" fontWeight="700" fill="#ef4444">缓存失效</text>
          <text x="460" y="238" fontSize="11" fill="#334155">/compact 命令后: cache.clear()</text>
          <text x="460" y="254" fontSize="11" fill="#334155">确保压缩后重新加载最新上下文</text>
          <text x="460" y="270" fontSize="11" fill="#334155">runPostCompactCleanup() 统一清理</text>

          <rect x="440" y="292" width="320" height="80" rx="8" fill="#10b981" opacity="0.06"/>
          <text x="460" y="314" fontSize="12" fontWeight="700" fill="#10b981">CLAUDE.md 优先级</text>
          <text x="460" y="334" fontSize="11" fill="#334155">~/.claude/CLAUDE.md (全局, 最低优先级)</text>
          <text x="460" y="350" fontSize="11" fill="#334155">./CLAUDE.md (项目根目录)</text>
          <text x="460" y="366" fontSize="11" fill="#334155">./CLAUDE.local.md (本地, 最高优先级)</text>

          <rect x="440" y="388" width="320" height="96" rx="8" fill="#8b5cf6" opacity="0.06"/>
          <text x="460" y="410" fontSize="12" fontWeight="700" fill="#8b5cf6">注入时机</text>
          <text x="460" y="430" fontSize="11" fill="#334155">QueryEngine.submitMessage() 首次调用时</text>
          <text x="460" y="446" fontSize="11" fill="#334155">系统提示 = base prompt + context + memory</text>
          <text x="460" y="462" fontSize="11" fill="#334155">coordinatorMode 下额外注入 worker 工具列表</text>
          <text x="460" y="478" fontSize="11" fill="#334155">COWORK 模式下注入 MEMORY_PATH_OVERRIDE</text>

          <defs>
            <marker id="arrowCtx" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Detail Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        <div style={cardStyle}>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: '#10b981', marginBottom: 12 }}>getUserContext() 实现</h4>
          <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.7, marginBottom: 12 }}>
            Memoized 上下文构建函数。内部合并操作系统信息、Git 仓库状态、CLAUDE.md 项目指令和自定义环境变量。缓存在 /compact 后自动失效。
          </p>
          <button onClick={() => toggle('getUserContext')} style={{ fontSize: 13, color: '#10b981', background: 'none', border: '1px solid #10b98130', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
            {expanded['getUserContext'] ? '收起' : '查看代码'} {expanded['getUserContext'] ? '▲' : '▼'}
          </button>
          {expanded['getUserContext'] && (
            <pre style={codeBlockStyle} dangerouslySetInnerHTML={{ __html: highlightCode(
`// context.ts - getUserContext()
export const getUserContext = memoize(
  async (cwd: string): Promise<string> => {
    const parts: string[] = []

    // 系统信息
    parts.push(getSystemContext())

    // Git 状态
    const gitInfo = await getGitContext(cwd)
    if (gitInfo) parts.push(gitInfo)

    // CLAUDE.md 层级加载
    const claudeMd = await loadClaudeMd(cwd)
    if (claudeMd) parts.push(claudeMd)

    return parts.join('\\n\\n')
  }
)
// compact 后清除缓存
// getUserContext.cache.clear?.()`) }} />
          )}
        </div>

        <div style={cardStyle}>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6', marginBottom: 12 }}>getSystemContext() 实现</h4>
          <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.7, marginBottom: 12 }}>
            收集运行环境信息:操作系统类型、当前工作目录、Shell 类型、Node.js 版本、Git 分支和远程仓库 URL。用于帮助 Claude 理解执行环境。
          </p>
          <button onClick={() => toggle('getSystemContext')} style={{ fontSize: 13, color: '#3b82f6', background: 'none', border: '1px solid #3b82f630', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
            {expanded['getSystemContext'] ? '收起' : '查看代码'} {expanded['getSystemContext'] ? '▲' : '▼'}
          </button>
          {expanded['getSystemContext'] && (
            <pre style={codeBlockStyle} dangerouslySetInnerHTML={{ __html: highlightCode(
`// context.ts - getSystemContext()
function getSystemContext(): string {
  return [
    'System Information:',
    '  OS: ' + process.platform + ' ' + process.arch,
    '  Shell: ' + (process.env.SHELL || 'unknown'),
    '  Node: ' + process.version,
    '  CWD: ' + process.cwd(),
    '  Date: ' + new Date().toISOString(),
  ].join('\\n')
}`) }} />
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ─── */
export default function MemorySystem() {
  const [activeTab, setActiveTab] = useState('overview')

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />
      case 'memdir': return <MemdirTab />
      case 'context': return <ContextTab />
      case 'compact': return <CompactTab />
      case 'state': return <StateTab />
      case 'coordinator': return <CoordinatorTab />
      default: return <OverviewTab />
    }
  }

  return (
    <section id="memory-system" style={{ padding: '80px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 16 }}>
          记忆与上下文系统
        </h2>
        <p style={{ fontSize: 18, color: '#64748b', textAlign: 'center', marginBottom: 48, maxWidth: 800, margin: '0 auto 48px' }}>
          深入分析 Claude Code 的持久化记忆、上下文管理、对话压缩与多智能体协调机制,
          覆盖 memdir/、context.ts、/compact 命令、状态管理和协调器模式的完整实现。
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32, justifyContent: 'center' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                borderRadius: 9999,
                border: activeTab === tab.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                background: activeTab === tab.id ? '#3b82f6' : '#ffffff',
                color: activeTab === tab.id ? '#ffffff' : '#334155',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {renderTab()}
      </div>
    </section>
  )
}
