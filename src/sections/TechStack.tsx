import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TechItem {
  icon: string
  cat: string
  tech: string
  description: string
  features: string[]
  files: string[]
}

const stack: TechItem[] = [
  {
    icon: '\u26A1',
    cat: '运行时',
    tech: 'Bun',
    description:
      'Claude Code 选择 Bun 作为 JavaScript/TypeScript 运行时，而非传统的 Node.js。Bun 由 Zig 语言编写，提供显著更快的冷启动速度，这对 CLI 工具的用户体验至关重要——用户每次在终端输入命令时都不希望等待漫长的启动过程。Bun 还提供原生 TypeScript 执行能力，无需额外的编译步骤即可直接运行 .ts 文件。此外，项目还利用了 Bun 内置的包管理器（bun install）、测试运行器（bun test）和打包器（bun build），实现了工具链的统一。',
    features: [
      '原生 TypeScript 执行，零配置运行 .ts 文件',
      '冷启动速度比 Node.js 快约 4 倍',
      '内置测试框架，兼容 Jest API',
      'bun.lock 二进制锁文件，更快的依赖解析',
    ],
    files: ['package.json', 'bun.lock'],
  },
  {
    icon: '{}',
    cat: '类型系统',
    tech: 'TypeScript Strict Mode',
    description:
      '整个项目启用了 TypeScript strict 模式，确保最高级别的类型安全。strict 模式启用了 strictNullChecks、noImplicitAny、strictFunctionTypes 等一系列严格检查，在编译期捕获大量潜在 Bug。项目大量使用 Zod v4 进行运行时数据验证，实现了编译期类型检查与运行时校验的双重保障。泛型（Generics）和条件类型（Conditional Types）被广泛应用于工具系统的类型推导，使得工具参数和返回值能够获得完整的类型提示。',
    features: [
      'strict 编译选项全量开启',
      'Zod v4 Schema 与 TypeScript 类型自动同步',
      '高级泛型模式用于工具系统类型推导',
      '条件类型实现 API 响应的精确类型收窄',
    ],
    files: ['tsconfig.json', 'src/Tool.ts'],
  },
  {
    icon: '\u25FB',
    cat: '终端 UI',
    tech: 'React + Ink',
    description:
      'Claude Code 使用 React 配合 Ink 框架在终端中渲染富文本 UI。Ink 是 React 的终端渲染器，它将 React 组件树映射到终端的 ANSI 转义序列，支持 Flexbox 布局模型。这意味着开发者可以用熟悉的 React 组件化思维构建复杂的终端界面，包括进度条、Markdown 实时渲染、交互式文件选择器、权限确认对话框等。流式文本渲染是核心场景——AI 响应通过 AsyncGenerator 逐 token 产出，React 组件实时更新显示。',
    features: [
      '终端 Flexbox 布局，支持 flex-direction 和 gap',
      '组件化 UI 架构，复用 React 生态心智模型',
      '流式文本渲染，AI 响应逐 token 实时显示',
      'Markdown 富文本终端渲染，支持代码高亮',
    ],
    files: ['src/components/', 'src/screens/'],
  },
  {
    icon: '\u25B6',
    cat: 'CLI 框架',
    tech: 'Commander.js',
    description:
      'Commander.js 负责解析命令行参数和子命令路由。Claude Code 定义了丰富的子命令（如 claude chat、claude review 等）和全局选项（如 --model、--verbose）。Commander.js 自动生成 --help 帮助信息，处理参数校验和类型转换。值得注意的是，Commander.js 与 Claude Code 自定义的 slash command 系统（/help、/clear、/model 等）并行工作——前者处理 CLI 层面的参数，后者处理交互会话中的用户指令。',
    features: [
      '参数解析与类型校验',
      '子命令路由（chat、review、config 等）',
      '--help 自动生成，包含用法示例',
      '与 slash command 系统互补协作',
    ],
    files: ['src/cli.ts', 'src/commands/'],
  },
  {
    icon: '\u2713',
    cat: 'Schema 验证',
    tech: 'Zod v4',
    description:
      'Zod 是 Claude Code 中运行时数据验证的核心库。它用于验证 Anthropic API 的响应体结构、工具调用的参数格式、用户配置文件的合法性，以及 MCP 协议消息的完整性。项目从 Zod v3 升级到了 v4，采用了新的 schema 语法。Zod 的一大优势是能从 schema 定义中自动推导 TypeScript 类型（z.infer），实现了 "Single Source of Truth"——一套 schema 同时服务于运行时校验和编译期类型检查。',
    features: [
      '运行时类型校验，捕获 API 响应异常',
      'z.infer 自动推导 TypeScript 类型',
      '配置文件解析与默认值填充',
      '工具参数 schema 定义与文档生成',
    ],
    files: ['src/schemas/', 'src/Tool.ts'],
  },
  {
    icon: '\u2295',
    cat: '代码搜索',
    tech: 'ripgrep (rg)',
    description:
      'ripgrep 作为 GrepTool 的底层搜索引擎，提供极速的代码搜索能力。Claude Code 通过 Node.js 的 child_process 模块调用系统安装的 rg 命令，传递正则表达式和搜索路径参数。ripgrep 天然感知 .gitignore 规则，自动跳过 node_modules、.git 等目录，搜索结果以结构化格式返回后被解析为工具输出。这是 Claude 理解大型代码库的关键能力之一——通过高效搜索快速定位相关代码片段。',
    features: [
      '正则表达式搜索，支持 PCRE2 语法',
      '.gitignore 感知，自动排除无关文件',
      '多文件并行搜索，利用多核 CPU',
      '结构化输出解析，提取文件名和行号',
    ],
    files: ['src/tools/GrepTool.ts'],
  },
  {
    icon: '\u21CC',
    cat: '协议集成',
    tech: 'MCP SDK',
    description:
      'MCP（Model Context Protocol）是 Anthropic 定义的工具调用标准协议，Claude Code 同时实现了 MCP 客户端和服务端。作为客户端，它能连接外部 MCP 服务器并动态发现可用工具，将它们与内置工具统一注册到工具调度系统中。作为服务端，Claude Code 自身也可以暴露工具供其他 MCP 客户端调用。支持 stdio（标准输入输出）和 SSE（Server-Sent Events）两种传输方式，前者用于本地工具，后者用于远程服务。',
    features: [
      '动态工具发现与注册',
      '服务端/客户端双模式支持',
      'stdio 和 SSE 双传输层',
      '工具 schema 自动转换与校验',
    ],
    files: ['src/services/mcpClient.ts'],
  },
  {
    icon: '\u25C8',
    cat: 'AI API',
    tech: 'Anthropic SDK',
    description:
      '通过 Anthropic 官方 TypeScript SDK 调用 Claude API，这是整个产品的核心能力来源。SDK 封装了消息发送、流式响应接收、工具调用编排等复杂逻辑。Claude Code 使用 SSE（Server-Sent Events）接收流式响应，每个 token 到达时立即通过 AsyncGenerator yield 给上层渲染管线。SDK 还负责 Token 计数、上下文窗口管理、重试策略和错误处理。多轮对话的消息历史由 Claude Code 自行维护并在每次请求时完整传递。',
    features: [
      '流式 SSE 响应，逐 token 实时处理',
      '工具调用编排，自动处理 tool_use 消息',
      'Token 计数与上下文窗口管理',
      '指数退避重试与错误分类处理',
    ],
    files: ['src/services/claude.ts', 'src/query.ts'],
  },
  {
    icon: '\u2299',
    cat: '可观测性',
    tech: 'OpenTelemetry',
    description:
      'Claude Code 集成了 OpenTelemetry 实现分布式追踪和性能指标收集。每个工具调用、API 请求、文件操作都会创建对应的 Span，形成完整的调用链路追踪树。这对于分析复杂 agentic 工作流的性能瓶颈至关重要——当 Claude 执行一个涉及多次工具调用的任务时，OpenTelemetry 能精确记录每一步的耗时和状态。Span 之间的父子关系反映了工具调用的嵌套结构，自定义指标则用于监控 Token 消耗和错误率。',
    features: [
      '分布式追踪，完整调用链路可视化',
      'Span 嵌套，反映工具调用层级关系',
      '自定义指标：Token 消耗、工具耗时、错误率',
      'gRPC 导出，对接 Jaeger/Zipkin 等后端',
    ],
    files: ['src/services/telemetry.ts'],
  },
  {
    icon: '\u2691',
    cat: '功能开关',
    tech: 'GrowthBook',
    description:
      'GrowthBook 是一个开源的功能开关和 A/B 测试平台，Claude Code 通过它实现所有新功能的灰度发布控制。每当开发团队新增一项功能时，代码中会通过 feature flag 包裹，GrowthBook 后台可以远程控制该功能对哪些用户群体可见。这种模式使得新功能可以先在小范围内验证，出现问题时即时关闭而无需发版。同时支持 A/B 实验，用于优化提示词策略、UI 交互等用户体验细节。',
    features: [
      '远程配置，无需发版即可开关功能',
      '灰度发布，按百分比或用户分群控制',
      'A/B 实验框架，用于优化产品策略',
      '本地缓存 + 轮询更新，降低延迟',
    ],
    files: ['src/services/featureFlags.ts'],
  },
  {
    icon: '\u2A01',
    cat: '认证授权',
    tech: 'OAuth 2.0 + JWT',
    description:
      'Claude Code 实现了完整的 OAuth 2.0 授权码流程（Authorization Code Flow）来处理用户认证。当用户首次登录时，CLI 在本地启动一个临时 HTTP 服务器监听回调端口，打开浏览器跳转到 Anthropic 授权页面，用户授权后浏览器回调到本地服务器完成 Token 交换。JWT（JSON Web Token）用于解析和验证访问令牌中的用户信息和权限声明。系统还处理 Token 自动刷新、过期检测，以及 Max 组织账户下的多租户 API Key 管理。',
    features: [
      'OAuth 2.0 授权码流程，本地回调服务器',
      'JWT 解析与签名验证',
      'Token 自动刷新与过期检测',
      '多租户支持，组织级别访问控制',
    ],
    files: ['src/services/auth.ts'],
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

const expandVariants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } },
}

/* ====== Styles ====== */

const cardBaseStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '0',
  transition: 'border-color 0.3s, box-shadow 0.3s',
  cursor: 'pointer',
  overflow: 'hidden',
}

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '18px 20px',
  userSelect: 'none',
  transition: 'background 0.2s',
}

const techIconStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '1.4rem',
  width: '44px',
  height: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '10px',
  background: 'var(--bg-hover)',
  color: 'var(--accent-red)',
  flexShrink: 0,
}

const techCatStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const techNameStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: 600,
  color: 'var(--text)',
}

const expandIconStyle: React.CSSProperties = {
  marginLeft: 'auto',
  fontSize: '0.85rem',
  color: 'var(--text-dim)',
  transition: 'transform 0.3s, color 0.3s',
  flexShrink: 0,
  fontFamily: "'JetBrains Mono', monospace",
}

const expandBodyStyle: React.CSSProperties = {
  padding: '0 20px 20px',
  borderTop: '1px solid var(--border)',
}

const descTextStyle: React.CSSProperties = {
  fontSize: '0.84rem',
  color: 'var(--text-dim)',
  lineHeight: 1.8,
  marginTop: '16px',
  marginBottom: '18px',
}

const subHeadingStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  fontWeight: 600,
  color: 'var(--text)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '10px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
}

const featureListStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '0 0 18px 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
}

const featureItemStyle: React.CSSProperties = {
  fontSize: '0.82rem',
  color: 'var(--text-dim)',
  padding: '6px 10px',
  borderRadius: '6px',
  background: 'var(--bg)',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
}

const featureBulletStyle: React.CSSProperties = {
  color: 'var(--accent-red)',
  flexShrink: 0,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.75rem',
  marginTop: '2px',
}

const fileTagStyle: React.CSSProperties = {
  display: 'inline-block',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.76rem',
  color: 'var(--accent-purple)',
  background: 'var(--bg)',
  padding: '4px 10px',
  borderRadius: '6px',
  marginRight: '8px',
  marginBottom: '4px',
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
  gap: '14px',
}

const hintStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  color: 'var(--text-muted)',
  textAlign: 'center',
  marginBottom: '28px',
  fontStyle: 'italic',
}

export default function TechStack() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggle = (i: number) => {
    setExpandedIndex(prev => (prev === i ? null : i))
  }

  return (
    <section id="tech" className="section">
      <span className="section-tag">01 / Tech Stack</span>
      <h2 className="section-title">技术栈</h2>
      <p className="section-desc">
        Claude Code 底层依赖的核心技术组件——从运行时到认证授权，涵盖 11 项关键技术选型
      </p>
      <p style={hintStyle}>点击卡片展开查看详细信息 ↓</p>

      <motion.div
        style={gridStyle}
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
      >
        {stack.map((s, i) => (
          <TechCard
            key={i}
            item={s}
            index={i}
            isExpanded={expandedIndex === i}
            onToggle={() => toggle(i)}
          />
        ))}
      </motion.div>
    </section>
  )
}

function TechCard({
  item,
  index,
  isExpanded,
  onToggle,
}: {
  item: TechItem
  index: number
  isExpanded: boolean
  onToggle: () => void
}) {
  const borderColor = isExpanded ? 'var(--accent-purple)' : 'var(--border)'
  const shadow = isExpanded ? '0 4px 24px rgba(0,0,0,0.2)' : 'none'

  return (
    <motion.div
      variants={cardVariants}
      style={{ ...cardBaseStyle, borderColor, boxShadow: shadow }}
      layout
    >
      <div
        style={cardHeaderStyle}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle()
          }
        }}
      >
        <div style={techIconStyle}>{item.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={techCatStyle}>{item.cat}</div>
          <div style={techNameStyle}>{item.tech}</div>
        </div>
        <div
          style={{
            ...expandIconStyle,
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            color: isExpanded ? 'var(--accent-red)' : 'var(--text-dim)',
          }}
        >
          ▸
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key={`expand-${index}`}
            variants={expandVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ overflow: 'hidden' }}
          >
            <div style={expandBodyStyle}>
              <p style={descTextStyle}>{item.description}</p>

              <div style={subHeadingStyle}>
                <span style={{ color: 'var(--accent-red)' }}>◆</span> 关键特性
              </div>
              <ul style={featureListStyle}>
                {item.features.map((f, fi) => (
                  <li key={fi} style={featureItemStyle}>
                    <span style={featureBulletStyle}>▸</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div style={subHeadingStyle}>
                <span style={{ color: 'var(--accent-purple)' }}>◆</span> 相关文件
              </div>
              <div>
                {item.files.map((f, fi) => (
                  <span key={fi} style={fileTagStyle}>{f}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
