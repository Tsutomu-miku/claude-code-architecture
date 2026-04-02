import { useState } from 'react'
import { motion } from 'framer-motion'

/* ====== Data ====== */

interface GanttItem {
  label: string
  startMs: number
  durationMs: number
  color: string
  note: string
}

const ganttData: GanttItem[] = [
  { label: 'CLI 解析', startMs: 0, durationMs: 50, color: '#3b82f6', note: '~50ms' },
  { label: '环境检测', startMs: 50, durationMs: 80, color: '#06b6d4', note: '~80ms' },
  { label: '配置加载', startMs: 130, durationMs: 100, color: '#14b8a6', note: '~100ms' },
  { label: '认证初始化', startMs: 230, durationMs: 150, color: '#22c55e', note: '~150ms (含网络)' },
  { label: 'Feature Flag', startMs: 380, durationMs: 200, color: '#eab308', note: '~200ms (含网络)' },
  { label: 'MCP 连接', startMs: 380, durationMs: 300, color: '#f97316', note: '~300ms (并行)' },
  { label: '工具注册', startMs: 680, durationMs: 30, color: '#ef4444', note: '~30ms' },
  { label: '权限初始化', startMs: 710, durationMs: 20, color: '#ec4899', note: '~20ms' },
  { label: 'UI 渲染', startMs: 730, durationMs: 50, color: '#8b5cf6', note: '~50ms' },
]

const GANTT_TOTAL_MS = 800

interface Strategy {
  icon: string
  name: string
  description: string
  effect: string
  files: string[]
}

const strategies: Strategy[] = [
  {
    icon: '🌊',
    name: 'AsyncGenerator 流式处理',
    description:
      '避免大响应缓冲，逐 token 输出，内存恒定在 ~50MB 以内。流式处理让用户在第一个 token 就开始看到输出，而非等待完整响应。AsyncGenerator 的 yield 机制天然支持背压控制，确保渲染管线不会被上游数据淹没。',
    effect: '首 token 延迟 < 200ms',
    files: ['query.ts', 'QueryEngine.ts'],
  },
  {
    icon: '💾',
    name: 'Memoize 缓存',
    description:
      '高频函数结果缓存，包括配置读取、Git 信息、工具列表等，TTL 设置为 60 秒。避免重复 IO 操作，将重复调用延迟从 ~100ms 降到 < 1ms。使用 LRU 策略防止缓存无限增长，关键路径的缓存命中率超过 99%。',
    effect: '重复调用 99%+ 缓存命中',
    files: ['utils/memoize.ts', 'services/'],
  },
  {
    icon: '📦',
    name: 'Dynamic Import 延迟加载',
    description:
      '工具、命令、MCP 模块按需加载。启动时仅加载核心引擎，其余在首次使用时通过 dynamic import 异步加载。这显著减少了冷启动时的模块解析和初始化开销，让用户更快进入交互状态。',
    effect: '冷启动减少 ~40% 模块加载',
    files: ['ToolRegistry.ts', 'commands/'],
  },
  {
    icon: '🔀',
    name: 'Parallel Prefetch 并行预取',
    description:
      '启动时用 Promise.allSettled 并行获取 Feature Flag、MCP 服务器连接和 Git 仓库信息。将原本串行执行 ~800ms 的初始化流程压缩到并行执行 ~300ms。allSettled 确保单个预取失败不会阻塞整体启动。',
    effect: '启动时间减少 ~60%',
    files: ['main.tsx', 'services/'],
  },
  {
    icon: '🔗',
    name: 'Connection Pool 连接复用',
    description:
      'Anthropic SDK HTTP 连接复用，MCP stdio 持久进程。避免每次请求重新建立 TLS 连接和三次握手的开销。MCP 服务器以子进程形式常驻，通过 stdin/stdout 管道通信，省去进程启动延迟。',
    effect: 'API 请求延迟减少 ~30%',
    files: ['services/claude.ts', 'mcpClient.ts'],
  },
  {
    icon: '🗜️',
    name: 'Compact 上下文压缩',
    description:
      '对话过长时自动触发 compact 命令，用 AI 将完整对话历史压缩为结构化摘要。将 100K token 的对话上下文压缩到 ~10K token，同时保留关键信息和上下文连贯性。大幅降低后续 API 调用的 token 消耗和延迟。',
    effect: '长对话 API 成本降低 ~80%',
    files: ['commands/compact.ts', 'ConversationManager.ts'],
  },
]

interface MemorySegment {
  label: string
  size: string
  value: number
  color: string
}

const memorySegments: MemorySegment[] = [
  { label: 'V8 Heap', size: '~100MB', value: 100, color: '#ef4444' },
  { label: '对话历史', size: '~50-200MB', value: 150, color: '#f97316' },
  { label: '工具执行缓冲', size: '~20MB', value: 20, color: '#eab308' },
  { label: 'MCP 连接', size: '~10MB/服务器', value: 10, color: '#22c55e' },
  { label: 'React+Ink UI', size: '~15MB', value: 15, color: '#3b82f6' },
  { label: '缓存', size: '~20MB', value: 20, color: '#8b5cf6' },
]

const MEMORY_TOTAL = memorySegments.reduce((sum, s) => sum + s.value, 0)

interface TokenRow {
  scenario: string
  input: string
  output: string
  cost: string
  highlight?: boolean
}

const tokenData: TokenRow[] = [
  { scenario: '简单问答 (无工具)', input: '~2K', output: '~1K', cost: '~$0.01' },
  { scenario: '代码编辑 (含文件读写)', input: '~8K', output: '~3K', cost: '~$0.05' },
  { scenario: '复杂任务 (多工具链)', input: '~25K', output: '~8K', cost: '~$0.15' },
  { scenario: '长对话 (compact 前)', input: '~100K', output: '~5K', cost: '~$0.50', highlight: true },
  { scenario: '长对话 (compact 后)', input: '~10K', output: '~5K', cost: '~$0.07' },
]

const tokenInsights = [
  {
    icon: '💡',
    title: '工具调用开销',
    desc: '每次工具调用需额外传递工具定义 schema (~2K tokens) 和调用结果。40+ 内置工具的定义约占 8K tokens 固定开销。',
  },
  {
    icon: '📊',
    title: 'compact 效果对比',
    desc: '启用 compact 后，长对话场景的输入 token 从 ~100K 降至 ~10K，单轮成本降低约 86%，同时保持上下文连贯性。',
  },
  {
    icon: '🎯',
    title: '优化建议',
    desc: '使用 /compact 命令主动压缩历史；合理配置 MCP 工具数量避免 schema 膨胀；利用 .claude/settings.json 精简工具集。',
  },
]

/* ====== Animation Variants ====== */

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

/* ====== Styles ====== */

const sectionStyle: React.CSSProperties = {
  padding: '80px 0',
}

const panelStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '32px 28px',
  marginBottom: '40px',
}

const panelTitleStyle: React.CSSProperties = {
  fontSize: '1.15rem',
  fontWeight: 700,
  color: 'var(--text)',
  marginBottom: '6px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
}

const panelSubStyle: React.CSSProperties = {
  fontSize: '0.82rem',
  color: 'var(--text-muted)',
  marginBottom: '28px',
}

const dividerStyle: React.CSSProperties = {
  width: '60px',
  height: '3px',
  background: 'linear-gradient(90deg, var(--accent-red), var(--accent-purple))',
  borderRadius: '2px',
  margin: '0 auto 48px',
}

/* Gantt */
const ganttContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px',
}

const ganttRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '120px 1fr 140px',
  alignItems: 'center',
  gap: '12px',
  padding: '6px 0',
}

const ganttLabelStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.8rem',
  color: 'var(--text)',
  textAlign: 'right' as const,
  whiteSpace: 'nowrap' as const,
}

const ganttTrackStyle: React.CSSProperties = {
  height: '28px',
  background: 'rgba(255,255,255,0.03)',
  borderRadius: '6px',
  position: 'relative' as const,
  overflow: 'hidden',
}

const ganttNoteStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.74rem',
  color: 'var(--text-dim)',
}

const ganttTotalStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '8px',
  marginTop: '16px',
  padding: '12px 16px',
  background: 'var(--bg)',
  borderRadius: '8px',
}

const ganttTotalLabelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--text-dim)',
}

const ganttTotalValueStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '1.1rem',
  fontWeight: 700,
  background: 'linear-gradient(135deg, var(--accent-red), var(--accent-purple))',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}

/* Strategy Cards */
const stratGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
  gap: '16px',
}

const stratCardStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '24px 22px',
  transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
  cursor: 'default',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px',
}

const stratIconStyle: React.CSSProperties = {
  fontSize: '1.8rem',
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '12px',
  background: 'var(--bg-hover)',
  flexShrink: 0,
}

const stratNameStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  color: 'var(--text)',
}

const stratDescStyle: React.CSSProperties = {
  fontSize: '0.82rem',
  color: 'var(--text-dim)',
  lineHeight: 1.75,
}

const stratEffectStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.78rem',
  color: '#22c55e',
  background: 'rgba(34,197,94,0.1)',
  padding: '5px 12px',
  borderRadius: '6px',
  border: '1px solid rgba(34,197,94,0.2)',
  alignSelf: 'flex-start',
}

const stratFilesStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: '6px',
  marginTop: 'auto',
}

const stratFileTagStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.72rem',
  color: 'var(--accent-purple)',
  background: 'var(--bg)',
  padding: '3px 8px',
  borderRadius: '4px',
}

/* Memory */
const memoryContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '20px',
}

const memoryBarWrapStyle: React.CSSProperties = {
  display: 'flex',
  height: '48px',
  borderRadius: '10px',
  overflow: 'hidden',
  border: '1px solid var(--border)',
}

const memoryLegendStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '10px',
}

const memoryLegendItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 14px',
  background: 'var(--bg)',
  borderRadius: '8px',
  fontSize: '0.82rem',
  color: 'var(--text-dim)',
}

const memoryDotStyle = (color: string): React.CSSProperties => ({
  width: '10px',
  height: '10px',
  borderRadius: '3px',
  background: color,
  flexShrink: 0,
})

const memorySizeStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.76rem',
  color: 'var(--text-muted)',
  marginLeft: 'auto',
}

const memoryTotalStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.82rem',
  color: 'var(--text-dim)',
  marginTop: '4px',
}

/* Token Table */
const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  fontSize: '0.84rem',
}

const thStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.76rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  padding: '12px 16px',
  textAlign: 'left' as const,
  borderBottom: '1px solid var(--border)',
}

const tdStyle = (highlight?: boolean): React.CSSProperties => ({
  padding: '12px 16px',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  color: highlight ? 'var(--accent-red)' : 'var(--text-dim)',
  fontWeight: highlight ? 600 : 400,
  background: highlight ? 'rgba(239,68,68,0.05)' : 'transparent',
})

const tdMonoStyle = (highlight?: boolean): React.CSSProperties => ({
  ...tdStyle(highlight),
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.8rem',
})

const insightGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '14px',
  marginTop: '24px',
}

const insightCardStyle: React.CSSProperties = {
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  padding: '18px 16px',
}

const insightIconStyle: React.CSSProperties = {
  fontSize: '1.3rem',
  marginBottom: '8px',
  display: 'block',
}

const insightTitleStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  fontWeight: 600,
  color: 'var(--text)',
  marginBottom: '6px',
}

const insightDescStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'var(--text-dim)',
  lineHeight: 1.7,
}

/* ====== Component ====== */

export default function Performance() {
  return (
    <section id="performance" className="section" style={sectionStyle}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
      >
        <span className="section-tag">Performance</span>
        <h2
          className="section-title"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <span>⚡</span> 性能优化分析
        </h2>
        <p className="section-desc">
          深入理解 Claude Code 如何在 500ms 内启动并保持流畅响应
        </p>
      </motion.div>

      {/* ====== 1. 启动性能时间线 ====== */}
      <motion.div
        style={panelStyle}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
      >
        <div style={panelTitleStyle}>
          <span style={{ color: 'var(--accent-red)' }}>◆</span>
          启动性能时间线
        </div>
        <p style={panelSubStyle}>
          从 CLI 解析到 UI 渲染，各阶段时间开销可视化。Feature Flag 和 MCP 连接并行执行是关键优化
        </p>
        <GanttChart />
      </motion.div>

      <div style={dividerStyle} />

      {/* ====== 2. 运行时性能优化策略 ====== */}
      <motion.div
        style={panelStyle}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
      >
        <div style={panelTitleStyle}>
          <span style={{ color: 'var(--accent-red)' }}>◆</span>
          运行时性能优化策略
        </div>
        <p style={panelSubStyle}>
          六大核心优化策略，从流式处理到上下文压缩，全方位提升运行时性能
        </p>
        <motion.div
          style={stratGridStyle}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {strategies.map((s, i) => (
            <StrategyCard key={i} strategy={s} index={i} />
          ))}
        </motion.div>
      </motion.div>

      <div style={dividerStyle} />

      {/* ====== 3. 内存管理分析 ====== */}
      <motion.div
        style={panelStyle}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
      >
        <div style={panelTitleStyle}>
          <span style={{ color: 'var(--accent-red)' }}>◆</span>
          内存管理分析
        </div>
        <p style={panelSubStyle}>
          运行时内存分布估算，对话历史是最大的变量因素
        </p>
        <MemoryChart />
      </motion.div>

      <div style={dividerStyle} />

      {/* ====== 4. Token 经济分析 ====== */}
      <motion.div
        style={panelStyle}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
      >
        <div style={panelTitleStyle}>
          <span style={{ color: 'var(--accent-red)' }}>◆</span>
          Token 经济分析
        </div>
        <p style={panelSubStyle}>
          不同场景下的 Token 消耗与成本估算，以及 compact 前后的显著对比
        </p>
        <TokenAnalysis />
      </motion.div>
    </section>
  )
}

/* ====== Sub-Components ====== */

function GanttChart() {
  return (
    <div>
      <motion.div
        style={ganttContainerStyle}
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
      >
        {ganttData.map((item, i) => (
          <GanttRow key={i} item={item} />
        ))}
      </motion.div>

      <motion.div
        style={ganttTotalStyle}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <span style={ganttTotalLabelStyle}>总计 (并行优化后):</span>
        <span style={ganttTotalValueStyle}>~500-800ms</span>
      </motion.div>
    </div>
  )
}

function GanttRow({ item }: { item: GanttItem }) {
  const leftPct = (item.startMs / GANTT_TOTAL_MS) * 100
  const widthPct = (item.durationMs / GANTT_TOTAL_MS) * 100

  return (
    <motion.div style={ganttRowStyle} variants={itemVariants}>
      <div style={ganttLabelStyle}>{item.label}</div>
      <div style={ganttTrackStyle}>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
          style={{
            position: 'absolute',
            left: `${leftPct}%`,
            width: `${widthPct}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${item.color}cc, ${item.color})`,
            borderRadius: '4px',
            transformOrigin: 'left',
            boxShadow: `0 0 12px ${item.color}33`,
          }}
        />
        {/* Time scale markers */}
        {[0, 25, 50, 75, 100].map((p) => (
          <div
            key={p}
            style={{
              position: 'absolute',
              left: `${p}%`,
              top: 0,
              bottom: 0,
              width: '1px',
              background: 'rgba(255,255,255,0.04)',
            }}
          />
        ))}
      </div>
      <div style={ganttNoteStyle}>{item.note}</div>
    </motion.div>
  )
}

function StrategyCard({
  strategy,
  index,
}: {
  strategy: Strategy
  index: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      variants={itemVariants}
      style={{
        ...stratCardStyle,
        borderColor: hovered ? 'var(--accent-purple)' : 'var(--border)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.25)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={stratIconStyle}>{strategy.icon}</div>
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              marginBottom: '2px',
            }}
          >
            STRATEGY #{String(index + 1).padStart(2, '0')}
          </div>
          <div style={stratNameStyle}>{strategy.name}</div>
        </div>
      </div>
      <p style={stratDescStyle}>{strategy.description}</p>
      <div style={stratEffectStyle}>
        <span>▲</span> {strategy.effect}
      </div>
      <div style={stratFilesStyle}>
        {strategy.files.map((f, fi) => (
          <span key={fi} style={stratFileTagStyle}>
            {f}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

function MemoryChart() {
  return (
    <div style={memoryContainerStyle}>
      {/* Stacked bar */}
      <motion.div
        style={memoryBarWrapStyle}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        {...{ style: { ...memoryBarWrapStyle, transformOrigin: 'left' } }}
      >
        {memorySegments.map((seg, i) => (
          <MemorySegmentBar key={i} segment={seg} />
        ))}
      </motion.div>

      <div style={memoryTotalStyle}>
        总计: ~315-465MB (对话历史长度为主要变量)
      </div>

      {/* Legend */}
      <div style={memoryLegendStyle}>
        {memorySegments.map((seg, i) => (
          <motion.div
            key={i}
            style={memoryLegendItemStyle}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <div style={memoryDotStyle(seg.color)} />
            <span>{seg.label}</span>
            <span style={memorySizeStyle}>{seg.size}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function MemorySegmentBar({ segment }: { segment: MemorySegment }) {
  const [hovered, setHovered] = useState(false)
  const widthPct = (segment.value / MEMORY_TOTAL) * 100

  return (
    <div
      style={{
        width: `${widthPct}%`,
        height: '100%',
        background: hovered
          ? segment.color
          : `${segment.color}cc`,
        transition: 'background 0.2s, filter 0.2s',
        filter: hovered ? 'brightness(1.2)' : 'brightness(1)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '20px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div
          style={{
            position: 'absolute',
            top: '-36px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.72rem',
            color: 'var(--text)',
            background: 'var(--bg-card)',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            whiteSpace: 'nowrap',
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {segment.label}: {segment.size}
        </div>
      )}
      {widthPct > 8 && (
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.68rem',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
          }}
        >
          {Math.round(widthPct)}%
        </span>
      )}
    </div>
  )
}

function TokenAnalysis() {
  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <motion.table
          style={tableStyle}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <thead>
            <tr>
              <th style={thStyle}>场景</th>
              <th style={thStyle}>输入 Token</th>
              <th style={thStyle}>输出 Token</th>
              <th style={thStyle}>估算成本/轮</th>
            </tr>
          </thead>
          <tbody>
            {tokenData.map((row, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <td style={tdStyle(row.highlight)}>{row.scenario}</td>
                <td style={tdMonoStyle(row.highlight)}>{row.input}</td>
                <td style={tdMonoStyle(row.highlight)}>{row.output}</td>
                <td style={tdMonoStyle(row.highlight)}>{row.cost}</td>
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      </div>

      {/* Insights */}
      <motion.div
        style={insightGridStyle}
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
      >
        {tokenInsights.map((insight, i) => (
          <motion.div key={i} style={insightCardStyle} variants={itemVariants}>
            <span style={insightIconStyle}>{insight.icon}</span>
            <div style={insightTitleStyle}>{insight.title}</div>
            <div style={insightDescStyle}>{insight.desc}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
