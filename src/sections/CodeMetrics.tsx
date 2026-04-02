import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

/* ====== useCountUp Hook ====== */
function useCountUp(end: number, duration = 1600) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true
          const t0 = performance.now()
          const step = (now: number) => {
            const p = Math.min((now - t0) / duration, 1)
            setVal(Math.floor(p * end))
            if (p < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [end, duration])

  return { ref, val }
}

/* ====== Data ====== */

const codeStats = [
  { num: 512000, label: '总代码行数', suffix: '+', icon: '📄' },
  { num: 500, label: '源文件数', suffix: '+', icon: '📁' },
  { num: 480, label: 'TypeScript 文件', suffix: '~', icon: '🔷' },
  { num: 20, label: 'TSX 文件 (UI)', suffix: '~', icon: '🎨' },
  { num: 1024, label: '平均文件行数', suffix: '', icon: '📏' },
  { num: 18000, label: '最大文件行数', suffix: '~', icon: '📐' },
  { num: 200, label: '总模块数', suffix: '+', icon: '📦' },
  { num: 3000, label: '总导出函数', suffix: '+', icon: '⚙️' },
]

const fileSizeTop10 = [
  { name: 'main.tsx', size: '803KB', pct: 100, color: '#ef4444' },
  { name: 'query.ts', size: '68KB', pct: 8.5, color: '#f97316' },
  { name: 'QueryEngine.ts', size: '46KB', pct: 5.7, color: '#f59e0b' },
  { name: 'Tool.ts', size: '29KB', pct: 3.6, color: '#eab308' },
  { name: 'REPL.tsx', size: '24KB', pct: 3.0, color: '#84cc16' },
  { name: 'ConversationManager.ts', size: '21KB', pct: 2.6, color: '#22c55e' },
  { name: 'PermissionSystem.ts', size: '18KB', pct: 2.2, color: '#14b8a6' },
  { name: 'mcpClient.ts', size: '16KB', pct: 2.0, color: '#06b6d4' },
  { name: 'cli.ts', size: '14KB', pct: 1.7, color: '#3b82f6' },
  { name: 'ToolRegistry.ts', size: '12KB', pct: 1.5, color: '#8b5cf6' },
]

const moduleDistribution = [
  { label: '工具实现 (tools/)', pct: 35, color: '#ef4444' },
  { label: '核心引擎 (core/)', pct: 25, color: '#f97316' },
  { label: 'UI 组件 (components/)', pct: 15, color: '#eab308' },
  { label: '服务层 (services/)', pct: 12, color: '#22c55e' },
  { label: '命令系统 (commands/)', pct: 8, color: '#3b82f6' },
  { label: '测试文件 (tests/)', pct: 5, color: '#8b5cf6' },
]

const complexityData = [
  {
    module: 'query.ts',
    level: '极高',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
    reason: '核心循环 + 多分支 + 错误处理',
    score: 95,
  },
  {
    module: 'main.tsx',
    level: '极高',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
    reason: '巨大的初始化逻辑',
    score: 92,
  },
  {
    module: 'PermissionSystem.ts',
    level: '高',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.15)',
    reason: '多级权限判断',
    score: 72,
  },
  {
    module: 'Tool.ts',
    level: '中高',
    color: '#eab308',
    bg: 'rgba(234,179,8,0.15)',
    reason: '工具基类 + 验证逻辑',
    score: 58,
  },
  {
    module: 'ConversationManager.ts',
    level: '中',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.15)',
    reason: '消息管理',
    score: 40,
  },
  {
    module: '其他服务',
    level: '低',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.15)',
    reason: '单一职责',
    score: 20,
  },
]

const techDebtDimensions = [
  {
    label: '代码重复度',
    score: 3,
    max: 10,
    rating: '低',
    note: '良好的抽象',
    color: '#22c55e',
  },
  {
    label: '耦合度',
    score: 6,
    max: 10,
    rating: '中',
    note: 'query.ts 是耦合热点',
    color: '#f97316',
  },
  {
    label: '代码覆盖率',
    score: 7,
    max: 10,
    rating: '高',
    note: '有测试框架',
    color: '#22c55e',
  },
  {
    label: '文档完整性',
    score: 4,
    max: 10,
    rating: '中低',
    note: '内部注释较少',
    color: '#eab308',
  },
  {
    label: 'API 稳定性',
    score: 8,
    max: 10,
    rating: '高',
    note: '稳定的工具接口',
    color: '#22c55e',
  },
]

/* ====== Animation Variants ====== */

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const barVariants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.8, ease: 'easeOut' } },
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

const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '14px',
}

const statCardStyle: React.CSSProperties = {
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '20px 18px',
  textAlign: 'center' as const,
  transition: 'border-color 0.3s, box-shadow 0.3s',
}

const statIconStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  marginBottom: '8px',
  display: 'block',
}

const statNumStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '1.6rem',
  fontWeight: 700,
  background: 'linear-gradient(135deg, var(--accent-red), var(--accent-purple))',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'block',
  marginBottom: '4px',
}

const statLabelStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  color: 'var(--text-dim)',
}

const barContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '10px',
}

const barRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '200px 1fr 70px',
  alignItems: 'center',
  gap: '14px',
  padding: '8px 12px',
  borderRadius: '8px',
  background: 'var(--bg)',
  transition: 'background 0.2s',
}

const barNameStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.82rem',
  color: 'var(--text)',
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const barTrackStyle: React.CSSProperties = {
  height: '24px',
  background: 'rgba(255,255,255,0.04)',
  borderRadius: '6px',
  overflow: 'hidden',
  position: 'relative' as const,
}

const barSizeStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.78rem',
  color: 'var(--text-dim)',
  textAlign: 'right' as const,
}

const pieContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '48px',
  flexWrap: 'wrap' as const,
  justifyContent: 'center',
}

const pieChartStyle: React.CSSProperties = {
  width: '220px',
  height: '220px',
  borderRadius: '50%',
  flexShrink: 0,
  position: 'relative' as const,
  boxShadow: '0 0 40px rgba(239,68,68,0.12)',
}

const pieCenterStyle: React.CSSProperties = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90px',
  height: '90px',
  borderRadius: '50%',
  background: 'var(--bg-card)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column' as const,
}

const pieCenterNumStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '1.1rem',
  fontWeight: 700,
  color: 'var(--text)',
}

const pieCenterLabelStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  color: 'var(--text-muted)',
}

const legendStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '10px',
}

const legendItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '0.84rem',
  color: 'var(--text-dim)',
}

const legendDotStyle = (color: string): React.CSSProperties => ({
  width: '12px',
  height: '12px',
  borderRadius: '3px',
  background: color,
  flexShrink: 0,
})

const legendPctStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.78rem',
  color: 'var(--text-muted)',
  marginLeft: 'auto',
  minWidth: '36px',
  textAlign: 'right' as const,
}

const heatmapGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '12px',
}

const heatCellStyle = (bg: string, borderColor: string): React.CSSProperties => ({
  background: bg,
  border: `1px solid ${borderColor}33`,
  borderRadius: '10px',
  padding: '18px 16px',
  transition: 'transform 0.2s, box-shadow 0.2s',
  cursor: 'default',
})

const heatModuleStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.88rem',
  fontWeight: 600,
  color: 'var(--text)',
  marginBottom: '4px',
}

const heatLevelStyle = (color: string): React.CSSProperties => ({
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.72rem',
  fontWeight: 600,
  color: color,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  marginBottom: '8px',
})

const heatReasonStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  color: 'var(--text-dim)',
  marginBottom: '10px',
}

const heatBarTrackStyle: React.CSSProperties = {
  height: '6px',
  background: 'rgba(255,255,255,0.06)',
  borderRadius: '3px',
  overflow: 'hidden',
}

const debtGridStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '16px',
}

const debtRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '140px 1fr 80px',
  alignItems: 'center',
  gap: '16px',
  padding: '14px 16px',
  background: 'var(--bg)',
  borderRadius: '10px',
}

const debtLabelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--text)',
}

const debtBarTrackStyle: React.CSSProperties = {
  height: '10px',
  background: 'rgba(255,255,255,0.06)',
  borderRadius: '5px',
  overflow: 'hidden',
  position: 'relative' as const,
}

const debtInfoStyle: React.CSSProperties = {
  textAlign: 'right' as const,
}

const debtScoreStyle = (color: string): React.CSSProperties => ({
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.9rem',
  fontWeight: 700,
  color: color,
})

const debtRatingStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  color: 'var(--text-muted)',
}

const debtNoteStyle: React.CSSProperties = {
  fontSize: '0.76rem',
  color: 'var(--text-dim)',
  fontStyle: 'italic',
  marginTop: '6px',
  paddingLeft: '156px',
}

const dividerStyle: React.CSSProperties = {
  width: '60px',
  height: '3px',
  background: 'linear-gradient(90deg, var(--accent-red), var(--accent-purple))',
  borderRadius: '2px',
  margin: '0 auto 48px',
}

/* ====== Component ====== */

export default function CodeMetrics() {
  return (
    <section id="code-metrics" className="section" style={sectionStyle}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
      >
        <span className="section-tag">Code Metrics</span>
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span>📈</span> 代码度量分析
        </h2>
        <p className="section-desc">
          512,000+ 行代码的量化视角
        </p>
      </motion.div>

      {/* ====== 1. 代码规模统计面板 ====== */}
      <motion.div
        style={panelStyle}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
      >
        <div style={panelTitleStyle}>
          <span style={{ color: 'var(--accent-red)' }}>◆</span>
          代码规模统计
        </div>
        <p style={panelSubStyle}>
          从行数、文件数到模块数和导出函数数，全方位量化 Claude Code 的工程规模
        </p>
        <motion.div
          style={statsGridStyle}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {codeStats.map((s, i) => (
            <StatCard key={i} stat={s} />
          ))}
        </motion.div>
      </motion.div>

      <div style={dividerStyle} />

      {/* ====== 2. 文件大小 Top 10 柱状图 ====== */}
      <motion.div
        style={panelStyle}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
      >
        <div style={panelTitleStyle}>
          <span style={{ color: 'var(--accent-red)' }}>◆</span>
          文件大小 Top 10
        </div>
        <p style={panelSubStyle}>
          main.tsx 以 803KB 的体量一骑绝尘，是第二名 query.ts 的近 12 倍
        </p>
        <motion.div
          style={barContainerStyle}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {fileSizeTop10.map((f, i) => (
            <FileBarRow key={i} file={f} rank={i + 1} />
          ))}
        </motion.div>
      </motion.div>

      <div style={dividerStyle} />

      {/* ====== 3. 代码分布饼图 ====== */}
      <motion.div
        style={panelStyle}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
      >
        <div style={panelTitleStyle}>
          <span style={{ color: 'var(--accent-red)' }}>◆</span>
          代码分布
        </div>
        <p style={panelSubStyle}>
          按模块类型统计的代码分布，工具实现占比最大，体现了 Claude Code 工具驱动的设计理念
        </p>
        <DistributionPie />
      </motion.div>

      <div style={dividerStyle} />

      {/* ====== 4. 复杂度热力图 ====== */}
      <motion.div
        style={panelStyle}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
      >
        <div style={panelTitleStyle}>
          <span style={{ color: 'var(--accent-red)' }}>◆</span>
          复杂度热力图
        </div>
        <p style={panelSubStyle}>
          各模块的圈复杂度估算，红色代表极高复杂度需要重点关注
        </p>
        <motion.div
          style={heatmapGridStyle}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {complexityData.map((c, i) => (
            <ComplexityCell key={i} data={c} />
          ))}
        </motion.div>
      </motion.div>

      <div style={dividerStyle} />

      {/* ====== 5. 技术债务雷达图 ====== */}
      <motion.div
        style={panelStyle}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
      >
        <div style={panelTitleStyle}>
          <span style={{ color: 'var(--accent-red)' }}>◆</span>
          技术债务评估
        </div>
        <p style={panelSubStyle}>
          五个维度评估项目的技术健康度，分数越高表示该维度表现越好
        </p>
        <div style={debtGridStyle}>
          {techDebtDimensions.map((d, i) => (
            <TechDebtRow key={i} dim={d} index={i} />
          ))}
        </div>
      </motion.div>
    </section>
  )
}

/* ====== Sub-Components ====== */

function StatCard({ stat }: { stat: typeof codeStats[number] }) {
  const { ref, val } = useCountUp(stat.num)
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      style={{
        ...statCardStyle,
        borderColor: hovered ? 'var(--accent-purple)' : 'var(--border)',
        boxShadow: hovered ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={statIconStyle}>{stat.icon}</span>
      <span style={statNumStyle}>
        {stat.suffix === '~' ? '~' : ''}
        {val.toLocaleString()}
        {stat.suffix !== '~' ? stat.suffix : ''}
      </span>
      <span style={statLabelStyle}>{stat.label}</span>
    </motion.div>
  )
}

function FileBarRow({
  file,
  rank,
}: {
  file: typeof fileSizeTop10[number]
  rank: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      variants={itemVariants}
      style={{
        ...barRowStyle,
        background: hovered ? 'var(--bg-hover)' : 'var(--bg)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={barNameStyle}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            marginRight: '8px',
          }}
        >
          #{String(rank).padStart(2, '0')}
        </span>
        {file.name}
      </div>
      <div style={barTrackStyle}>
        <motion.div
          variants={barVariants}
          style={{
            height: '100%',
            width: `${file.pct}%`,
            background: `linear-gradient(90deg, ${file.color}, ${file.color}99)`,
            borderRadius: '6px',
            transformOrigin: 'left',
            minWidth: file.pct < 3 ? '12px' : undefined,
          }}
        />
        {hovered && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${Math.min(file.pct, 90)}%`,
              transform: 'translate(8px, -50%)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.72rem',
              color: 'var(--text)',
              background: 'var(--bg-card)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}
          >
            {file.name} - {file.size} ({file.pct}%)
          </div>
        )}
      </div>
      <div style={barSizeStyle}>{file.size}</div>
    </motion.div>
  )
}

function DistributionPie() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  // Build conic-gradient segments
  let cumulative = 0
  const segments = moduleDistribution.map((m) => {
    const start = cumulative
    cumulative += m.pct
    return { ...m, start, end: cumulative }
  })

  const conicStops = segments
    .map((s) => `${s.color} ${s.start}% ${s.end}%`)
    .join(', ')

  return (
    <div style={pieContainerStyle}>
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          ...pieChartStyle,
          background: `conic-gradient(${conicStops})`,
        }}
      >
        <div style={pieCenterStyle}>
          <span style={pieCenterNumStyle}>500+</span>
          <span style={pieCenterLabelStyle}>文件</span>
        </div>
      </motion.div>

      <div style={legendStyle}>
        {moduleDistribution.map((m, i) => (
          <div
            key={i}
            style={{
              ...legendItemStyle,
              background: activeIdx === i ? 'var(--bg-hover)' : 'transparent',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'default',
              transition: 'background 0.2s',
            }}
            onMouseEnter={() => setActiveIdx(i)}
            onMouseLeave={() => setActiveIdx(null)}
          >
            <div style={legendDotStyle(m.color)} />
            <span style={{ flex: 1 }}>{m.label}</span>
            <span style={legendPctStyle}>{m.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComplexityCell({ data }: { data: typeof complexityData[number] }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      variants={itemVariants}
      style={{
        ...heatCellStyle(data.bg, data.color),
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? `0 4px 16px ${data.color}22` : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={heatModuleStyle}>{data.module}</div>
      <div style={heatLevelStyle(data.color)}>
        {data.level} 复杂度
      </div>
      <div style={heatReasonStyle}>{data.reason}</div>
      <div style={heatBarTrackStyle}>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${data.score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${data.color}88, ${data.color})`,
            borderRadius: '3px',
          }}
        />
      </div>
    </motion.div>
  )
}

function TechDebtRow({
  dim,
  index,
}: {
  dim: typeof techDebtDimensions[number]
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div style={debtRowStyle}>
        <div style={debtLabelStyle}>{dim.label}</div>
        <div style={debtBarTrackStyle}>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${(dim.score / dim.max) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 + index * 0.1 }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${dim.color}88, ${dim.color})`,
              borderRadius: '5px',
            }}
          />
        </div>
        <div style={debtInfoStyle}>
          <div style={debtScoreStyle(dim.color)}>
            {dim.score}/{dim.max}
          </div>
          <div style={debtRatingStyle}>{dim.rating}</div>
        </div>
      </div>
      <div style={debtNoteStyle}>{dim.note}</div>
    </motion.div>
  )
}
