import { useState, useEffect, useRef } from 'react'
import './App.css'
import './expanded.css'
import Hero from './sections/Hero'
import TechStack from './sections/TechStack'
import GlobalArch from './sections/GlobalArch'
import Architecture from './sections/Architecture'
import SequenceDiag from './sections/SequenceDiag'
import DataFlow from './sections/DataFlow'
import DependencyGraph from './sections/DependencyGraph'
import Systems from './sections/Systems'
import SecurityModel from './sections/SecurityModel'
import CodeMetrics from './sections/CodeMetrics'
import Performance from './sections/Performance'
import DirTree from './sections/DirTree'
import Patterns from './sections/Patterns'
import BootSeq from './sections/BootSeq'
import Footer from './sections/Footer'

const navItems = [
  { id: 'hero', label: '概览' },
  { id: 'tech', label: '技术栏' },
  { id: 'global-arch', label: '全局架构' },
  { id: 'arch', label: '架构' },
  { id: 'sequence-diag', label: '序列图' },
  { id: 'flow', label: '数据流' },
  { id: 'dependency-graph', label: '依赖图' },
  { id: 'systems', label: '系统' },
  { id: 'security-model', label: '安全模型' },
  { id: 'code-metrics', label: '代码度量' },
  { id: 'performance', label: '性能分析' },
  { id: 'tree', label: '目录' },
  { id: 'patterns', label: '模式' },
  { id: 'boot', label: '启动' },
]

export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeId, setActiveId] = useState('hero')
  const sectionsRef = useRef<Map<string, IntersectionObserverEntry>>(new Map())

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => sectionsRef.current.set(e.target.id, e))
        const visible = Array.from(sectionsRef.current.values())
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )
    navItems.forEach(n => {
      const el = document.getElementById(n.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <span className="nav-logo">Claude Code Arch</span>
          <ul className="nav-links">
            {navItems.map(n => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  className={activeId === n.id ? 'active' : ''}
                  onClick={e => { e.preventDefault(); scrollTo(n.id) }}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <button className="burger" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? '\u2715' : '\u2630'}
          </button>
        </div>
      </nav>
      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        {navItems.map(n => (
          <a key={n.id} href={`#${n.id}`} onClick={e => { e.preventDefault(); scrollTo(n.id) }}>{n.label}</a>
        ))}
      </div>
      <main>
        <Hero />
        <TechStack />
        <GlobalArch />
        <Architecture />
        <SequenceDiag />
        <DataFlow />
        <DependencyGraph />
        <Systems />
        <SecurityModel />
        <CodeMetrics />
        <Performance />
        <DirTree />
        <Patterns />
        <BootSeq />
        <Footer />
      </main>
    </>
  )
}
