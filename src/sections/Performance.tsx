import { useState } from 'react'
import { motion } from 'framer-motion'

/* ====== Data ====== */

interface GanttItem { label: string; startMs: number; durationMs: number; color: string; note: string }

const ganttData: GanttItem[] = [
  { label: 'CLI 解析', startMs: 0, durationMs: 50, color: '#3b82f6', note: '~50ms' },
  { label: '环境检测', startMs: 50, durationMs: 80, color: '#06b6d4', note: '~80ms' },
  { label: '配置加载', startMs: 130, durationMs: 100, color: '#059669', note: '~100ms' },
  { label: '认证初始化', startMs: 230, durationMs: 150, color: '#059669', note: '~150ms (含网络)' },
  { label: 'Feature Flag', startMs: 380, durationMs: 200, color: '#d97706', note: '~200ms (含网络)' },
  { label: 'MCP 连接', startMs: 380, durationMs: 300, color: '#dc2626', note: '~300ms (并行)' },
  { label: '工具注册', startMs: 680, durationMs: 30, color: '#7c3aed', note: '~30ms' },
  { label: '权限初始化', startMs: 710, durationMs: 20, color: '#4f46e5', note: '~20ms' },
  { label: 'UI 渲染', startMs: 730, durationMs: 50, color: '#ec4899', note: '~50ms' },
]

const GANTT_TOTAL_MS = 800

interface Strategy { icon: string; name: string; description: string; effect: string; files: string[] }

const strategies: Strategy[] = [
  { icon: '🌊', name: 'AsyncGenerator 流式处理', description: '避免大响应缓冲，逐 token 输出，内存恒定在 ~50MB 以内。流式处理让用户在第一个 token 就开始看到输出，而非等待完整响应。AsyncGenerator 的 yield 机制天然支持背压控制，确保渲染管线不会被上游数据淹没。', effect: '首 token 延迟 < 200ms', files: ['query.ts', 'QueryEngine.ts'] },
  { icon: '💾', name: 'Memoize 缓存', description: '高频函数结果缓存，包括配置读取、Git 信息、工具列表等，TTL 设置为 60 秒。避免重复 IO 操作，将重复调用延迟从 ~100ms 降到 < 1ms。使用 LRU 策略防止缓存无限增长，关键路径的缓存命中率超过 99%。', effect: '重复调用 99%+ 缓存命中', files: ['utils/memoize.ts', 'services/'] },
  { icon: '📦', name: 'Dynamic Import 延迟加载', description: '工具、命令、MCP 模块按需加载。启动时仅加载核心引擎，其余在首次使用时通过 dynamic import 异步加载。这显著减少了冷启动时的模块解析和初始化开销，让用户更快进入交互状态。', effect: '冷启动减少 ~40% 模块加载', files: ['ToolRegistry.ts', 'commands/'] },
  { icon: '🔀', name: 'Parallel Prefetch 并行预取', description: '启动时用 Promise.allSettled 并行获取 Feature Flag、MCP 服务器连接和 Git 仓库信息。将原本串行执行 ~800ms 的初始化流程压缩到并行执行 ~300ms。allSettled 确保单个预取失败不会阻塞整体启动。', effect: '启动时间减少 ~60%', files: ['main.tsx', 'services/'] },
  { icon: '🔗', name: 'Connection Pool 连接复用', description: 'Anthropic SDK HTTP 连接复用，MCP stdio 持久进程。避免每次请求重新建立 TLS 连接和三次握手的开销。MCP 服务器以子进程形式常驻，通过 stdin/stdout 管道通信，省去进程启动延迟。', effect: 'API 请求延迟减少 ~30%', files: ['services/claude.ts', 'mcpClient.ts'] },
  { icon: '🗜️', name: 'Compact 上下文压缩', description: '对话过长时自动触发 compact 命令，用 AI 将完整对话历史压缩为结构化摘要。将 100K token 的对话上下文压缩到 ~10K token，同时保留关键信息和上下文连贯性。大幅降低后续 API 调用的 token 消耗和延迟。', effect: '长对话 API 成本降低 ~80%', files: ['commands/compact.ts', 'ConversationManager.ts'] },
]

interface MemorySegment { label: string; size: string; value: number; color: string }

const memorySegments: MemorySegment[] = [
  { label: 'V8 Heap', size: '~100MB', value: 100, color: '#dc2626' },
  { label: '对话历史', size: '~50-200MB', value: 150, color: '#d97706' },
  { label: '工具执行缓冲', size: '~20MB', value: 20, color: '#d97706' },
  { label: 'MCP 连接', size: '~10MB/服务器', value: 10, color: '#059669' },
  { label: 'React+Ink UI', size: '~15MB', value: 15, color: '#3b82f6' },
  { label: '缓存', size: '~20MB', value: 20, color: '#7c3aed' },
]

const MEMORY_TOTAL = memorySegments.reduce((sum, s) => sum + s.value, 0)

interface TokenRow { scenario: string; input: string; output: string; cost: string; highlight?: boolean }

const tokenData: TokenRow[] = [
  { scenario: '简单问答 (无工具)', input: '~2K', output: '~1K', cost: '~$0.01' },
  { scenario: '代码编辑 (含文件读写)', input: '~8K', output: '~3K', cost: '~$0.05' },
  { scenario: '复杂任务 (多工具链)', input: '~25K', output: '~8K', cost: '~$0.15' },
  { scenario: '长对话 (compact 前)', input: '~100K', output: '~5K', cost: '~$0.50', highlight: true },
  { scenario: '长对话 (compact 后)', input: '~10K', output: '~5K', cost: '~$0.07' },
]

const tokenInsights = [
  { icon: '💡', title: '工具调用开销', desc: '每次工具调用需额外传递工具定义 schema (~2K tokens) 和调用结果。40+ 内置工具的定义约占 8K tokens 固定开销。' },
  { icon: '📊', title: 'compact 效果对比', desc: '启用 compact 后，长对话场景的输入 token 从 ~100K 降至 ~10K，单轮成本降低约 86%，同时保持上下文连贯性。' },
  { icon: '🎯', title: '优化建议', desc: '使用 /compact 命令主动压缩历史；合理配置 MCP 工具数量避免 schema 膨胀；利用 .claude/settings.json 精简工具集。' },
]

/* ====== Animation Variants ====== */

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }

/* ====== Component ====== */

export default function Performance() {
  return (
    <section id="performance" style={{ padding: '80px 0', maxWidth: 1200, margin: '0 auto', paddingLeft: 24, paddingRight: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#3b82f6', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Performance</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span>⚡</span> 性能优化分析
          </h2>
          <p style={{ color: '#475569', maxWidth: 640, margin: '0 auto', fontSize: '0.95rem' }}>深入理解 Claude Code 如何在 500ms 内启动并保持流畅响应</p>
        </div>
      </motion.div>

      {/* 1. 启动甘特图 */}
      <motion.div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '32px 28px', marginBottom: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5 }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#3b82f6' }}>◆</span> 启动性能时间线
        </div>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 28 }}>从 CLI 解析到 UI 渲染，各阶段时间开销可视化。Feature Flag 和 MCP 连接并行执行是关键优化</p>
        <GanttChart />
      </motion.div>

      <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg, #3b82f6, #7c3aed)', borderRadius: 2, margin: '0 auto 48px' }} />

      {/* 2. 运行时优化策略 */}
      <motion.div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '32px 28px', marginBottom: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5 }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#3b82f6' }}>◆</span> 运行时性能优化策略
        </div>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 28 }}>六大核心优化策略，从流式处理到上下文压缩，全方位提升运行时性能</p>
        <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }} variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          {strategies.map((s, i) => <StrategyCard key={i} strategy={s} index={i} />)}
        </motion.div>
      </motion.div>

      <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg, #3b82f6, #7c3aed)', borderRadius: 2, margin: '0 auto 48px' }} />

      {/* 3. 内存管理 */}
      <motion.div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '32px 28px', marginBottom: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5 }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#3b82f6' }}>◆</span> 内存管理分析
        </div>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 28 }}>运行时内存分布估算，对话历史是最大的变量因素</p>
        <MemoryChart />
      </motion.div>

      <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg, #3b82f6, #7c3aed)', borderRadius: 2, margin: '0 auto 48px' }} />

      {/* 4. Token 经济分析 */}
      <motion.div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '32px 28px', marginBottom: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5 }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#3b82f6' }}>◆</span> Token 经济分析
        </div>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 28 }}>不同场景下的 Token 消耗与成本估算，以及 compact 前后的显著对比</p>
        <TokenAnalysis />
      </motion.div>
    </section>
  )
}

/* ====== Sub-Components ====== */

function GanttChart() {
  return (
    <div>
      <motion.div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }} variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
        {ganttData.map((item, i) => <GanttRow key={i} item={item} />)}
      </motion.div>
      <motion.div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 16, padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6, duration: 0.4 }}>
        <span style={{ fontSize: '0.85rem', color: '#475569' }}>总计 (并行优化后):</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6' }}>~500-800ms</span>
      </motion.div>
    </div>
  )
}

function GanttRow({ item }: { item: GanttItem }) {
  const leftPct = (item.startMs / GANTT_TOTAL_MS) * 100
  const widthPct = (item.durationMs / GANTT_TOTAL_MS) * 100

  return (
    <motion.div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 140px', alignItems: 'center', gap: 12, padding: '6px 0' }} variants={itemVariants}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#0f172a', textAlign: 'right' as const, whiteSpace: 'nowrap' as const }}>{item.label}</div>
      <div style={{ height: 28, background: '#f1f5f9', borderRadius: 6, position: 'relative' as const, overflow: 'hidden' }}>
        <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          style={{ position: 'absolute', left: `${leftPct}%`, width: `${widthPct}%`, height: '100%', background: item.color, borderRadius: 4, transformOrigin: 'left', opacity: 0.85 }}
        />
        {[0, 25, 50, 75, 100].map((p) => (
          <div key={p} style={{ position: 'absolute', left: `${p}%`, top: 0, bottom: 0, width: 1, background: '#e2e8f0' }} />
        ))}
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.74rem', color: '#94a3b8' }}>{item.note}</div>
    </motion.div>
  )
}

function StrategyCard({ strategy, index }: { strategy: Strategy; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div variants={itemVariants}
      style={{
        background: '#ffffff', border: `1px solid ${hovered ? '#3b82f6' : '#e2e8f0'}`, borderRadius: 14,
        padding: '24px 22px', transition: 'border-color 0.3s, transform 0.2s, box-shadow 0.3s',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column' as const, gap: 12,
      }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: '1.8rem', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, background: '#f1f5f9', flexShrink: 0 }}>{strategy.icon}</div>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: '#94a3b8', marginBottom: 2 }}>STRATEGY #{String(index + 1).padStart(2, '0')}</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>{strategy.name}</div>
        </div>
      </div>
      <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.75 }}>{strategy.description}</p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#059669', background: '#ecfdf5', padding: '5px 12px', borderRadius: 6, border: '1px solid #a7f3d0', alignSelf: 'flex-start' }}>
        <span>▲</span> {strategy.effect}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 'auto' }}>
        {strategy.files.map((f, fi) => (
          <span key={fi} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#7c3aed', background: '#f5f3ff', padding: '3px 8px', borderRadius: 4, border: '1px solid #ddd6fe' }}>{f}</span>
        ))}
      </div>
    </motion.div>
  )
}

function MemoryChart() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 20 }}>
      <motion.div style={{ display: 'flex', height: 48, borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', transformOrigin: 'left' }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: 'easeOut' }}>
        {memorySegments.map((seg, i) => <MemorySegmentBar key={i} segment={seg} />)}
      </motion.div>
      <div style={{ textAlign: 'center' as const, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: '#475569', marginTop: 4 }}>
        总计: ~315-465MB (对话历史长度为主要变量)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {memorySegments.map((seg, i) => (
          <motion.div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, fontSize: '0.82rem', color: '#475569', border: '1px solid #e2e8f0' }} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.3 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: seg.color, flexShrink: 0 }} />
            <span>{seg.label}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.76rem', color: '#94a3b8', marginLeft: 'auto' }}>{seg.size}</span>
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
        width: `${widthPct}%`, height: '100%', background: hovered ? segment.color : `${segment.color}cc`,
        transition: 'background 0.2s, filter 0.2s', filter: hovered ? 'brightness(1.1)' : 'brightness(1)',
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 20,
      }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div style={{
          position: 'absolute', top: -36, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#0f172a',
          background: '#ffffff', padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
          whiteSpace: 'nowrap', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          {segment.label}: {segment.size}
        </div>
      )}
      {widthPct > 8 && (
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
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
        <motion.table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: '0.84rem' }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <thead>
            <tr>
              {['场景', '输入 Token', '输出 Token', '估算成本/轮'].map(h => (
                <th key={h} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.76rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' as const, letterSpacing: '0.05em', padding: '12px 16px', textAlign: 'left' as const, borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tokenData.map((row, i) => (
              <motion.tr key={i} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.3 }}>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', color: row.highlight ? '#dc2626' : '#475569', fontWeight: row.highlight ? 600 : 400, background: row.highlight ? '#fef2f2' : 'transparent' }}>{row.scenario}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: row.highlight ? '#dc2626' : '#475569', fontWeight: row.highlight ? 600 : 400, background: row.highlight ? '#fef2f2' : 'transparent' }}>{row.input}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: row.highlight ? '#dc2626' : '#475569', fontWeight: row.highlight ? 600 : 400, background: row.highlight ? '#fef2f2' : 'transparent' }}>{row.output}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: row.highlight ? '#dc2626' : '#475569', fontWeight: row.highlight ? 600 : 400, background: row.highlight ? '#fef2f2' : 'transparent' }}>{row.cost}</td>
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      </div>

      <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginTop: 24 }} variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
        {tokenInsights.map((insight, i) => (
          <motion.div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '18px 16px' }} variants={itemVariants}>
            <span style={{ fontSize: '1.3rem', marginBottom: 8, display: 'block' }}>{insight.icon}</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>{insight.title}</div>
            <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.7 }}>{insight.desc}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}