import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type FileInfo = { name: string; size: string; desc: string }
type Layer = { id: string; label: string; color: string; files: FileInfo[] }

const layers: Layer[] = [
  {
    id: 'L1', label: '入口层 Entry Layer', color: 'var(--layer1)',
    files: [
      { name: 'main.tsx', size: '803KB', desc: 'CLI 解析 + 初始化编排, Commander.js 参数解析' },
      { name: 'setup.ts', size: '20KB', desc: '环境配置、Node 版本检查、权限验证' },
      { name: 'interactiveHelpers.tsx', size: '57KB', desc: '信任对话框、入门引导、API key' },
      { name: 'dialogLaunchers.tsx', size: '22KB', desc: '对话框懒加载启动器' },
      { name: 'replLauncher.tsx', size: '3KB', desc: 'REPL 启动器' },
    ],
  },
  {
    id: 'L2', label: '会话层 Session Layer', color: 'var(--layer2)',
    files: [
      { name: 'QueryEngine.ts', size: '46KB', desc: '会话级查询管理器' },
      { name: 'query.ts', size: '68KB', desc: '核心对话循环 AsyncGenerator' },
      { name: 'commands.ts', size: '25KB', desc: '斜杠命令注册表 (80+ 命令)' },
      { name: 'context.ts', size: '6KB', desc: '上下文构建 (git + CLAUDE.md)' },
    ],
  },
  {
    id: 'L3', label: '工具/任务层 Tool & Task Layer', color: 'var(--layer3)',
    files: [
      { name: 'Tool.ts', size: '29KB', desc: '工具接口, Zod 验证, fail-closed' },
      { name: 'tools.ts', size: '17KB', desc: '工具注册表, 40+ 工具' },
      { name: 'Task.ts', size: '3KB', desc: '任务类型定义' },
      { name: 'tasks.ts', size: '1KB', desc: '任务注册表' },
    ],
  },
  {
    id: 'L4', label: '基础设施层 Infrastructure Layer', color: 'var(--layer4)',
    files: [
      { name: 'ink.ts', size: '3KB', desc: 'UI 渲染抽象, ThemeProvider' },
      { name: 'cost-tracker.ts', size: '10KB', desc: '成本追踪' },
      { name: 'history.ts', size: '14KB', desc: '历史管理' },
      { name: 'costHook.ts', size: '0.6KB', desc: 'React Hook 桥接' },
    ],
  },
]

export default function Architecture() {
  const [open, setOpen] = useState<Record<string, boolean>>({ L1: true })
  const toggle = (id: string) => setOpen(p => ({ ...p, [id]: !p[id] }))

  return (
    <section id="arch" className="section">
      <span className="section-tag">02 / Architecture</span>
      <h2 className="section-title">四层架构</h2>
      <p className="section-desc">从用户输入到基础设施的分层抽象</p>
      <div className="arch-layers">
        {layers.map(l => (
          <div key={l.id} className="arch-layer" style={{ borderLeftColor: l.color }}>
            <div className="arch-header" onClick={() => toggle(l.id)}>
              <span className="layer-num" style={{ background: l.color + '22', color: l.color }}>{l.id}</span>
              <span className="layer-name">{l.label}</span>
              <span className="layer-arrow">{open[l.id] ? '\u25BE' : '\u25B8'}</span>
            </div>
            <AnimatePresence>
              {open[l.id] && (
                <motion.div className="arch-body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                  {l.files.map(f => (
                    <div key={f.name} className="file-card">
                      <span className="file-name">{f.name}</span>
                      <span className="file-size">{f.size}</span>
                      <span className="file-desc">{f.desc}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  )
}
