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
    document.documentElement.style.background = '#f8fafc'
    document.body.style.background = '#f8fafc'
    document.body.style.color = '#0f172a'
    document.body.style.fontFamily = "'Inter', system-ui, sans-serif"
    return () => {
      document.documentElement.style.background = ''
      document.body.style.background = ''
      document.body.style.color = ''
      document.body.style.fontFamily = ''
    }
  }, [])

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
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled
          ? 'rgba(255, 255, 255, 0.85)'
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid #e2e8f0' : '1px solid transparent',
        transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        boxShadow: scrolled ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
          }} onClick={() => scrollTo('hero')}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.02em',
            }}>
              CC
            </div>
            <span style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#0f172a',
            }}>
              Claude Code Arch
            </span>
          </div>
          <ul style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}>
            <style>{`
              .nav-desktop-links { display: flex !important; }
              @media (max-width: 1024px) {
                .nav-desktop-links { display: none !important; }
              }
            `}</style>
            <div className="nav-desktop-links" style={{ display: 'flex', gap: 2 }}>
              {navItems.map(n => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={e => { e.preventDefault(); scrollTo(n.id) }}
                    style={{
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: '0.78rem',
                      fontWeight: activeId === n.id ? 600 : 400,
                      color: activeId === n.id ? '#3b82f6' : '#475569',
                      textDecoration: 'none',
                      padding: '6px 10px',
                      borderRadius: 6,
                      background: activeId === n.id ? '#eff6ff' : 'transparent',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </div>
          </ul>
          <style>{`
            .nav-burger-btn { display: none !important; }
            @media (max-width: 1024px) {
              .nav-burger-btn { display: flex !important; }
            }
          `}</style>
          <button
            className="nav-burger-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '1.3rem',
              color: '#334155',
              borderRadius: 6,
            }}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>
      <style>{`
        .mobile-nav-menu {
          display: none;
        }
        @media (max-width: 1024px) {
          .mobile-nav-menu {
            display: flex;
          }
        }
      `}</style>
      {mobileOpen && (
        <div
          className="mobile-nav-menu"
          style={{
            position: 'fixed',
            top: 56,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            flexDirection: 'column',
            padding: '16px 24px',
            overflowY: 'auto',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          {navItems.map(n => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={e => { e.preventDefault(); scrollTo(n.id) }}
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: '0.95rem',
                fontWeight: activeId === n.id ? 600 : 400,
                color: activeId === n.id ? '#3b82f6' : '#334155',
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: 8,
                background: activeId === n.id ? '#eff6ff' : 'transparent',
                transition: 'all 0.15s ease',
                display: 'block',
              }}
            >
              {n.label}
            </a>
          ))}
        </div>
      )}
      <main style={{ paddingTop: 56 }}>
        <div style={{ background: '#ffffff' }}><Hero /></div>
        <div style={{ background: '#f8fafc' }}><TechStack /></div>
        <div style={{ background: '#ffffff' }}><GlobalArch /></div>
        <div style={{ background: '#f8fafc' }}><Architecture /></div>
        <div style={{ background: '#ffffff' }}><SequenceDiag /></div>
        <div style={{ background: '#f8fafc' }}><DataFlow /></div>
        <div style={{ background: '#ffffff' }}><DependencyGraph /></div>
        <div style={{ background: '#f8fafc' }}><Systems /></div>
        <div style={{ background: '#ffffff' }}><SecurityModel /></div>
        <div style={{ background: '#f8fafc' }}><CodeMetrics /></div>
        <div style={{ background: '#ffffff' }}><Performance /></div>
        <div style={{ background: '#f8fafc' }}><DirTree /></div>
        <div style={{ background: '#ffffff' }}><Patterns /></div>
        <div style={{ background: '#f8fafc' }}><BootSeq /></div>
        <Footer />
      </main>
    </>
  )
}
