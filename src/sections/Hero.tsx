import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

function useCountUp(end: number, duration = 1800) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
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
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [end, duration])

  return { ref, val }
}

const stats = [
  { num: 512000, label: '行代码', suffix: '+' },
  { num: 500, label: '源文件', suffix: '+' },
  { num: 40, label: '内置工具', suffix: '+' },
  { num: 50, label: '斜杠命令', suffix: '+' },
  { num: 6, label: '核心系统', suffix: '' },
]

export default function Hero() {
  return (
    <section id="hero" className="section hero">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <span className="hero-tag">Source Code Analysis &middot; 2026.03.31</span>
        <h1 className="hero-title">Claude Code</h1>
        <p className="hero-sub">源码架构解析</p>
        <p className="hero-desc">
          深入解读 Anthropic AI 终端助手的 512,000+ 行 TypeScript 源代码
        </p>
      </motion.div>

      <motion.div className="hero-event" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
        <strong>// 事件背景</strong><br />
        2026 年 3 月 30 日, Claude Code npm 发布包中意外包含了 .map 源码映射文件, 
        导致完整的 TypeScript 源代码被公开可读。本分析基于该泄露源码,
        旨在从工程架构角度进行技术学习, 不涉及任何逆向工程或恶意用途。
      </motion.div>

      <div className="stats-row">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} delay={i * 0.08} />
        ))}
      </div>
    </section>
  )
}

function StatCard({ num, label, suffix, delay }: { num: number; label: string; suffix: string; delay: number }) {
  const { ref, val } = useCountUp(num)
  return (
    <motion.div ref={ref} className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + delay, duration: 0.4 }}>
      <span className="stat-num">{val.toLocaleString()}{suffix}</span>
      <span className="stat-label">{label}</span>
    </motion.div>
  )
}
