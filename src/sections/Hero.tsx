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
  { num: 4, label: '层架构', suffix: '' },
  { num: 6, label: '核心系统', suffix: '' },
]

const highlights = [
  {
    icon: '⚡',
    title: 'AsyncGenerator 流式架构',
    desc: '所有 AI 交互都基于 TypeScript AsyncGenerator 实现流式处理。从用户输入到 API 调用再到终端渲染，整条数据管线使用 yield 逐步产出消息片段，实现真正的「边生成边显示」体验。这种架构使得内存占用极低，即使处理超长响应也不会阻塞主线程。',
    color: '#3b82f6',
    lightBg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    icon: '🔌',
    title: '多 IDE 桥接',
    desc: '同时支持 VS Code 和 JetBrains 系列 IDE 的深度集成。通过 LSP（Language Server Protocol）与编辑器通信，实现跳转到定义、诊断信息同步、内联代码建议等功能。IDE 扩展与 CLI 共享同一套核心逻辑，保证行为一致性。',
    color: '#7c3aed',
    lightBg: '#f5f3ff',
    border: '#ddd6fe',
  },
  {
    icon: '🛡️',
    title: '4 级权限系统',
    desc: '从 Default → AllowedCommands → TrustedTools → BypassPermissions 四级安全控制。每个工具执行前都会经过权限校验管道，用户可以通过 .claude/settings.json 精细配置哪些操作需要确认、哪些可以自动执行，在安全与效率之间取得平衡。',
    color: '#dc2626',
    lightBg: '#fef2f2',
    border: '#fecaca',
  },
  {
    icon: '🚩',
    title: 'Feature Flag 驱动',
    desc: 'GrowthBook 集成实现远程功能开关管理，所有新功能通过 feature flag 控制灰度发布。支持用户分群、百分比灰度和 A/B 实验，确保新功能可以安全渐进地推送给用户，出现问题时可即时回滚而无需发布新版本。',
    color: '#d97706',
    lightBg: '#fffbeb',
    border: '#fde68a',
  },
  {
    icon: '🧩',
    title: 'MCP 协议集成',
    desc: '完整支持 Model Context Protocol 工具扩展标准。用户可以通过配置文件声明外部 MCP 服务器，Claude Code 会在启动时动态发现并加载这些工具，与内置工具统一编排调度。支持 stdio 和 SSE 两种传输方式，实现真正的插件化架构。',
    color: '#06b6d4',
    lightBg: '#ecfeff',
    border: '#a5f3fc',
  },
  {
    icon: '🔑',
    title: 'OAuth 2.0 认证',
    desc: 'JWT Token 管理与多租户支持。实现完整的 OAuth 2.0 授权码流程，在本地启动临时 HTTP 服务器接收回调，自动处理 Token 刷新和过期。支持 Anthropic 直连和第三方 API 网关，通过 Max 组织账户实现团队级别的访问控制。',
    color: '#059669',
    lightBg: '#ecfdf5',
    border: '#a7f3d0',
  },
]

const capabilities = [
  { label: '代码生成', detail: '根据自然语言描述生成完整的代码文件、函数、类和模块' },
  { label: '代码重构', detail: '分析现有代码结构，进行重命名、提取函数、优化逻辑等重构操作' },
  { label: '智能调试', detail: '阅读错误日志和堆栈信息，定位 Bug 根因并提供修复方案' },
  { label: '测试编写', detail: '为既有代码生成单元测试、集成测试，支持主流测试框架' },
  { label: 'Git 操作', detail: '执行 git commit、创建分支、解决合并冲突、生成 PR 描述' },
  { label: '文件管理', detail: '读取、创建、编辑、搜索项目文件，理解项目目录结构' },
  { label: '命令执行', detail: '在沙盒环境中执行 Shell 命令，安装依赖、运行构建和脚本' },
  { label: '上下文理解', detail: '通过 Grep、语义搜索等工具深度理解整个代码库的上下文' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function Hero() {
  return (
    <section id="hero" className="section hero" style={{ background: '#f8fafc' }}>
      {/* ====== 顶部标题区 ====== */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: '40px' }}
      >
        <span style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: '0.72rem',
          color: '#7c3aed',
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          display: 'block',
          marginBottom: '12px',
        }}>
          Source Code Analysis &middot; 2026.03.31
        </span>
        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
          fontWeight: 800,
          color: '#0f172a',
          letterSpacing: '-0.03em',
          margin: '0 0 8px 0',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          Claude Code
        </h1>
        <p style={{
          fontSize: '1.15rem',
          color: '#475569',
          fontWeight: 500,
          margin: '0 0 12px 0',
        }}>
          源码架构解析
        </p>
        <p style={{
          fontSize: '0.92rem',
          color: '#64748b',
          maxWidth: '520px',
          margin: '0 auto',
          lineHeight: 1.7,
        }}>
          深入解读 Anthropic AI 终端助手的 512,000+ 行 TypeScript 源代码
        </p>
      </motion.div>

      {/* ====== 事件背景 ====== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{
          maxWidth: '800px',
          margin: '0 auto 48px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px 24px',
          fontSize: '0.85rem',
          color: '#475569',
          lineHeight: 1.8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        }}
      >
        <strong style={{ color: '#0f172a' }}>// 事件背景</strong><br />
        2026 年 3 月 30 日, Claude Code npm 发布包中意外包含了 .map 源码映射文件,
        导致完整的 TypeScript 源代码被公开可读。本分析基于该泄露源码,
        旨在从工程架构角度进行技术学习, 不涉及任何逆向工程或恶意用途。
      </motion.div>

      {/* ====== 统计卡片 ====== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '12px',
        maxWidth: '880px',
        margin: '0 auto 56px',
      }}>
        {stats.map((s, i) => (
          <StatCard key={i} {...s} delay={i * 0.06} />
        ))}
      </div>

      {/* ====== 分割线 ====== */}
      <motion.div
        style={{
          width: '60px',
          height: '3px',
          background: 'linear-gradient(90deg, #3b82f6, #7c3aed)',
          borderRadius: '2px',
          margin: '0 auto 48px',
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
      />

      {/* ====== 项目概述 ====== */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: '0.72rem',
          color: '#7c3aed',
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          textAlign: 'center' as const,
          marginBottom: '8px',
        }}>
          Project Overview
        </div>
        <div style={{
          maxWidth: '880px',
          margin: '0 auto',
          textAlign: 'left' as const,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '32px 36px',
          lineHeight: 1.8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: '16px',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '1.4rem' }}>&#x1F4CB;</span>
            什么是 Claude Code？
          </div>
          <p style={{
            fontSize: '0.9rem',
            color: '#475569',
            lineHeight: 1.85,
            marginBottom: '20px',
          }}>
            Claude Code 是由 Anthropic 开发的 <strong style={{ color: '#3b82f6' }}>AI 编程助手命令行工具</strong>。
            它不是一个简单的聊天机器人包装器，而是一个深度集成到开发工作流中的 agentic coding 系统。
            用户在终端中通过自然语言与 Claude 对话，Claude Code 能够自主地阅读代码库、编辑文件、
            执行命令、运行测试，并通过多轮工具调用完成复杂的编程任务。
          </p>
          <p style={{
            fontSize: '0.9rem',
            color: '#475569',
            lineHeight: 1.85,
            marginBottom: '20px',
          }}>
            从技术实现来看，Claude Code 使用 <strong style={{ color: '#0f172a' }}>TypeScript</strong> 编写，
            运行在 <strong style={{ color: '#0f172a' }}>Bun</strong> 运行时之上，
            终端 UI 基于 <strong style={{ color: '#0f172a' }}>React + Ink</strong> 渲染，
            CLI 参数解析使用 <strong style={{ color: '#0f172a' }}>Commander.js</strong>。
            整个项目的源码量超过 51.2 万行，包含 500 多个源文件，是一个工程复杂度极高的大型 TypeScript 项目。
            其架构分为 4 层：CLI 入口层、核心交互层、工具系统层和服务接口层，涵盖了权限控制、
            遥测监控、Feature Flag、OAuth 认证等 6 大核心子系统。
          </p>
          <p style={{
            fontSize: '0.9rem',
            color: '#475569',
            lineHeight: 1.85,
            marginBottom: '20px',
          }}>
            2026 年 3 月 30 日，Anthropic 在发布 Claude Code 的 npm 包时意外将
            <code style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: '0.82rem',
              color: '#7c3aed',
              background: '#f5f3ff',
              padding: '2px 6px',
              borderRadius: '4px',
            }}>.map</code> 源码映射文件包含在内，
            使得社区能够通过 source map 还原完整的 TypeScript 源代码。
            这一事件让开发者社区得以深入了解这个商业级 AI 编程工具的内部架构，
            也为本站的技术分析提供了基础。
          </p>

          <div style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginTop: '28px',
            marginBottom: '16px',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '1.4rem' }}>&#x1F3AF;</span>
            核心能力一览
          </div>
          <p style={{
            fontSize: '0.9rem',
            color: '#475569',
            lineHeight: 1.85,
            marginBottom: '12px',
          }}>
            Claude Code 内置了 40 多个工具和 50 多个斜杠命令，覆盖了从代码编写到项目管理的完整开发流程：
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '10px',
            marginTop: '16px',
          }}>
            {capabilities.map((cap, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '0.83rem',
              }}>
                <div>
                  <div style={{
                    fontWeight: 600,
                    color: '#3b82f6',
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: '0.78rem',
                    whiteSpace: 'nowrap' as const,
                  }}>
                    &#9656; {cap.label}
                  </div>
                  <div style={{
                    color: '#64748b',
                    fontSize: '0.8rem',
                    lineHeight: 1.6,
                  }}>
                    {cap.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ====== 分割线 ====== */}
      <motion.div
        style={{
          width: '60px',
          height: '3px',
          background: 'linear-gradient(90deg, #3b82f6, #7c3aed)',
          borderRadius: '2px',
          margin: '56px auto 48px',
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
      />

      {/* ====== 核心亮点 ====== */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: '0.72rem',
          color: '#7c3aed',
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          textAlign: 'center' as const,
          marginBottom: '8px',
        }}>
          Core Highlights
        </div>
        <h3 style={{
          fontSize: '1.35rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          textAlign: 'center' as const,
          marginBottom: '8px',
          color: '#0f172a',
        }}>
          核心架构亮点
        </h3>
        <p style={{
          fontSize: '0.9rem',
          color: '#475569',
          textAlign: 'center' as const,
          marginBottom: '36px',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          从源码中提炼的六大工程设计亮点，展示 Anthropic 团队在大型 TypeScript 项目中的架构决策
        </p>
        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '16px',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {highlights.map((h, i) => (
            <HighlightCard key={i} highlight={h} index={i} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ====== 统计卡片子组件 ====== */
function StatCard({
  num,
  label,
  suffix,
  delay,
}: {
  num: number
  label: string
  suffix: string
  delay: number
}) {
  const { ref, val } = useCountUp(num)
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + delay, duration: 0.35 }}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px 16px',
        textAlign: 'center' as const,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
      }}
    >
      <span style={{
        display: 'block',
        fontSize: '1.5rem',
        fontWeight: 800,
        color: '#3b82f6',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        letterSpacing: '-0.02em',
      }}>
        {val.toLocaleString()}{suffix}
      </span>
      <span style={{
        display: 'block',
        fontSize: '0.78rem',
        color: '#94a3b8',
        marginTop: '4px',
      }}>
        {label}
      </span>
    </motion.div>
  )
}

/* ====== 亮点卡片子组件 ====== */
function HighlightCard({
  highlight,
  index,
}: {
  highlight: typeof highlights[0]
  index: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      variants={itemVariants}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderLeft: `4px solid ${highlight.color}`,
        borderRadius: '14px',
        padding: '24px 24px',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '12px',
        transition: 'box-shadow 0.25s, transform 0.25s',
        boxShadow: hovered
          ? '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)'
          : '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          fontSize: '1.6rem',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          background: highlight.lightBg,
          border: `1px solid ${highlight.border}`,
          flexShrink: 0,
        }}>
          {highlight.icon}
        </div>
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: '0.68rem',
            color: '#94a3b8',
            marginBottom: '2px',
          }}>
            HIGHLIGHT #{String(index + 1).padStart(2, '0')}
          </div>
          <div style={{
            fontSize: '1.02rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: '#0f172a',
          }}>
            {highlight.title}
          </div>
        </div>
      </div>
      <p style={{
        fontSize: '0.84rem',
        color: '#475569',
        lineHeight: 1.75,
        margin: 0,
      }}>
        {highlight.desc}
      </p>
    </motion.div>
  )
}
