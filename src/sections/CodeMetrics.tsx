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
  { name: 'main.tsx', size: '803KB', pct: 100, color: '#3b82f6' },
  { name: 'query.ts', size: '68KB', pct: 8.5, color: '#60a5fa' },
  { name: 'QueryEngine.ts', size: '46KB', pct: 5.7, color: '#60a5fa' },
  { name: 'Tool.ts', size: '29KB', pct: 3.6, color: '#93c5fd' },
  { name: 'REPL.tsx', size: '24KB', pct: 3.0, color: '#93c5fd' },
  { name: 'ConversationManager.ts', size: '21KB', pct: 2.6, color: '#93c5fd' },
  { name: 'PermissionSystem.ts', size: '18KB', pct: 2.2, color: '#bfdbfe' },
  { name: 'mcpClient.ts', size: '16KB', pct: 2.0, color: '#bfdbfe' },
  { name: 'cli.ts', size: '14KB', pct: 1.7, color: '#bfdbfe' },
  { name: 'ToolRegistry.ts', size: '12KB', pct: 1.5, color: '#bfdbfe' },
]

const moduleDistribution = [
  { label: '工具实现 (tools/)', pct: 35, color: '#3b82f6' },
  { label: '核心引擎 (core/)', pct: 25, color: '#7c3aed' },
  { label: 'UI 组件 (components/)', pct: 15, color: '#06b6d4' },
  { label: '服务层 (services/)', pct: 12, color: '#d97706' },
  { label: '命令系统 (commands/)', pct: 8, color: '#059669' },
  { label: '测试文件 (tests/)', pct: 5, color: '#dc2626' },
]

const complexityData = [
  { module: 'query.ts', level: '极高', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', reason: '核心循环 + 多分支 + 错误处理', score: 95 },
  { module: 'main.tsx', level: '极高', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', reason: '巨大的初始化逻辑', score: 92 },
  { module: 'PermissionSystem.ts', level: '高', color: '#d97706', bg: '#fffbeb', border: '#fde68a', reason: '多级权限判断', score: 72 },
  { module: 'Tool.ts', level: '中高', color: '#d97706', bg: '#fffbeb', border: '#fde68a', reason: '工具基类 + 验证逻辑', score: 58 },
  { module: 'ConversationManager.ts', level: '中', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', reason: '消息管理', score: 40 },
  { module: '其他服务', level: '低', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', reason: '单一职责', score: 20 },
]

const techDebtDimensions = [
  { label: '代码重复度', score: 3, max: 10, rating: '低', note: '良好的抽象', color: '#059669' },
  { label: '耦合度', score: 6, max: 10, rating: '中', note: 'query.ts 是耦合热点', color: '#d97706' },
  { label: '代码覆盖率', score: 7, max: 10, rating: '高', note: '有测试框架', color: '#059669' },
  { label: '文档完整性', score: 4, max: 10, rating: '中低', note: '内部注释较少', color: '#d97706' },
  { label: 'API 稳定性', score: 8, max: 10, rating: '高', note: '稳定的工具接口', color: '#059669' },
]

/* ====== Animation Variants ====== */

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const barVariants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.7, ease: 'easeOut' } },
}

/* ====== Component ====== */

export default function CodeMetrics() {
  return (
    <section id="code-metrics" style={{ padding: '80px 0', maxWidth: 1200, margin: '0 auto', paddingLeft: 24, paddingRight: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#3b82f6', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Code Metrics</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span>📈</span> 代码度量分析
          </h2>
          <p style={{ color: '#475569', maxWidth: 640, margin: '0 auto', fontSize: '0.95rem' }}>512,000+ 行代码的量化视角</p>
        </div>
      </motion.div>

      {/* 1. 代码规模统计面板 */}
      <motion.div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '32px 28px', marginBottom: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5 }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#3b82f6' }}>◆</span> 代码规模统计
        </div>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 28 }}>从行数、文件数到模块数和导出函数数，全方位量化 Claude Code 的工程规模</p>
        <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }} variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          {codeStats.map((s, i) => <StatCard key={i} stat={s} />)}
        </motion.div>
      </motion.div>

      <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg, #3b82f6, #7c3aed)', borderRadius: 2, margin: '0 auto 48px' }} />

      {/* 2. 文件大小 Top 10 柱状图 */}
      <motion.div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '32px 28px', marginBottom: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5 }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#3b82f6' }}>◆</span> 文件大小 Top 10
        </div>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 28 }}>main.tsx 以 803KB 的体量一骑绝尘，是第二名 query.ts 的近 12 倍</p>
        <motion.div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }} variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          {fileSizeTop10.map((f, i) => <FileBarRow key={i} file={f} rank={i + 1} />)}
        </motion.div>
      </motion.div>

      <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg, #3b82f6, #7c3aed)', borderRadius: 2, margin: '0 auto 48px' }} />

      {/* 3. 代码分布饼图 */}
      <motion.div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '32px 28px', marginBottom: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5 }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#3b82f6' }}>◆</span> 代码分布
        </div>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 28 }}>按模块类型统计的代码分布，工具实现占比最大，体现了 Claude Code 工具驱动的设计理念</p>
        <DistributionPie />
      </motion.div>

      <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg, #3b82f6, #7c3aed)', borderRadius: 2, margin: '0 auto 48px' }} />

      {/* 4. 复杂度热力图 */}
      <motion.div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '32px 28px', marginBottom: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5 }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#3b82f6' }}>◆</span> 复杂度热力图
        </div>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 28 }}>各模块的圈复杂度估算，红色代表极高复杂度需要重点关注</p>
        <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }} variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          {complexityData.map((c, i) => <ComplexityCell key={i} data={c} />)}
        </motion.div>
      </motion.div>

      <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg, #3b82f6, #7c3aed)', borderRadius: 2, margin: '0 auto 48px' }} />

      {/* 5. 技术债务评估 */}
      <motion.div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '32px 28px', marginBottom: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5 }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#3b82f6' }}>◆</span> 技术债务评估
        </div>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 28 }}>五个维度评估项目的技术健康度，分数越高表示该维度表现越好</p>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          {techDebtDimensions.map((d, i) => <TechDebtRow key={i} dim={d} index={i} />)}
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
    <motion.div ref={ref} variants={itemVariants}
      style={{
        background: hovered ? '#f8fafc' : '#ffffff', border: `1px solid ${hovered ? '#3b82f6' : '#e2e8f0'}`,
        borderRadius: 12, padding: '20px 18px', textAlign: 'center' as const,
        transition: 'border-color 0.3s, box-shadow 0.3s, background 0.3s',
        boxShadow: hovered ? '0 2px 8px rgba(59,130,246,0.12)' : '0 1px 2px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: '1.5rem', marginBottom: 8, display: 'block' }}>{stat.icon}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.6rem', fontWeight: 700, color: '#3b82f6', display: 'block', marginBottom: 4 }}>
        {stat.suffix === '~' ? '~' : ''}{val.toLocaleString()}{stat.suffix !== '~' ? stat.suffix : ''}
      </span>
      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{stat.label}</span>
    </motion.div>
  )
}

function FileBarRow({ file, rank }: { file: typeof fileSizeTop10[number]; rank: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div variants={itemVariants}
      style={{
        display: 'grid', gridTemplateColumns: '200px 1fr 70px', alignItems: 'center', gap: 14,
        padding: '8px 12px', borderRadius: 8, background: hovered ? '#f1f5f9' : '#f8fafc', transition: 'background 0.2s',
      }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: '#0f172a', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#94a3b8', marginRight: 8 }}>#{String(rank).padStart(2, '0')}</span>
        {file.name}
      </div>
      <div style={{ height: 24, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden', position: 'relative' as const }}>
        <motion.div variants={barVariants}
          style={{
            height: '100%', width: `${file.pct}%`,
            background: `linear-gradient(90deg, #93c5fd, ${file.color})`,
            borderRadius: 6, transformOrigin: 'left', minWidth: file.pct < 3 ? 12 : undefined,
          }}
        />
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#94a3b8', textAlign: 'right' as const }}>{file.size}</div>
    </motion.div>
  )
}

function DistributionPie() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  let cumulative = 0
  const segments = moduleDistribution.map((m) => {
    const start = cumulative
    cumulative += m.pct
    return { ...m, start, end: cumulative }
  })
  const conicStops = segments.map((s) => `${s.color} ${s.start}% ${s.end}%`).join(', ')

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap' as const, justifyContent: 'center' }}>
      <motion.div initial={{ scale: 0, rotate: -90 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{ width: 220, height: 220, borderRadius: '50%', flexShrink: 0, position: 'relative' as const, background: `conic-gradient(${conicStops})`, boxShadow: '0 4px 16px rgba(59,130,246,0.12)' }}
      >
        <div style={{ position: 'absolute' as const, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 90, height: 90, borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as const }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>500+</span>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>文件</span>
        </div>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
        {moduleDistribution.map((m, i) => (
          <div key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.84rem', color: '#475569',
              background: activeIdx === i ? '#f1f5f9' : 'transparent', padding: '6px 10px', borderRadius: 6, cursor: 'default', transition: 'background 0.2s',
            }}
            onMouseEnter={() => setActiveIdx(i)} onMouseLeave={() => setActiveIdx(null)}
          >
            <div style={{ width: 12, height: 12, borderRadius: 3, background: m.color, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{m.label}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#94a3b8', marginLeft: 'auto', minWidth: 36, textAlign: 'right' as const }}>{m.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComplexityCell({ data }: { data: typeof complexityData[number] }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div variants={itemVariants}
      style={{
        background: data.bg, border: `1px solid ${data.border}`, borderRadius: 10,
        padding: '18px 16px', transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? `0 4px 12px ${data.color}15` : '0 1px 2px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{data.module}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', fontWeight: 600, color: data.color, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>{data.level} 复杂度</div>
      <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: 10 }}>{data.reason}</div>
      <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} whileInView={{ width: `${data.score}%` }} viewport={{ once: true }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          style={{ height: '100%', background: `linear-gradient(90deg, ${data.color}88, ${data.color})`, borderRadius: 3 }}
        />
      </div>
    </motion.div>
  )
}

function TechDebtRow({ dim, index }: { dim: typeof techDebtDimensions[number]; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.08 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px', alignItems: 'center', gap: 16, padding: '14px 16px', background: '#f8fafc', borderRadius: 10 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{dim.label}</div>
        <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden', position: 'relative' as const }}>
          <motion.div initial={{ width: 0 }} whileInView={{ width: `${(dim.score / dim.max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 + index * 0.08 }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${dim.color}88, ${dim.color})`, borderRadius: 5 }}
          />
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 700, color: dim.color }}>{dim.score}/{dim.max}</div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{dim.rating}</div>
        </div>
      </div>
      <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontStyle: 'italic', marginTop: 6, paddingLeft: 156 }}>{dim.note}</div>
    </motion.div>
  )
}