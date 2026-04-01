import { motion } from 'framer-motion'

const stack = [
  { icon: '\u26A1', cat: '运行时', tech: 'Bun' },
  { icon: '{}', cat: '编程语言', tech: 'TypeScript 严格模式' },
  { icon: '\u25FB', cat: '终端 UI', tech: 'React + Ink' },
  { icon: '\u25B6', cat: 'CLI 解析', tech: 'Commander.js' },
  { icon: '\u2713', cat: 'Schema', tech: 'Zod v4' },
  { icon: '\u2295', cat: '代码搜索', tech: 'ripgrep' },
  { icon: '\u21CC', cat: '协议', tech: 'MCP SDK + LSP' },
  { icon: '\u25C8', cat: 'API', tech: 'Anthropic SDK' },
  { icon: '\u2299', cat: '遥测', tech: 'OpenTelemetry + gRPC' },
  { icon: '\u2691', cat: '功能开关', tech: 'GrowthBook' },
  { icon: '\u2A01', cat: '认证', tech: 'OAuth 2.0 + JWT' },
]

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export default function TechStack() {
  return (
    <section id="tech" className="section">
      <span className="section-tag">01 / Tech Stack</span>
      <h2 className="section-title">技术栏</h2>
      <p className="section-desc">Claude Code 底层依赖的核心技术组件</p>
      <motion.div className="tech-grid" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} transition={{ staggerChildren: 0.05 }}>
        {stack.map((s, i) => (
          <motion.div key={i} className="tech-card" variants={item}>
            <div className="tech-icon">{s.icon}</div>
            <div>
              <div className="tech-cat">{s.cat}</div>
              <div className="tech-name">{s.tech}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
