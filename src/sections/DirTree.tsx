import { useState } from 'react'

type TreeNode = { name: string; size?: string; desc?: string; children?: TreeNode[] }

const tree: TreeNode = {
  name: 'src/',
  children: [
    { name: 'main.tsx', size: '803KB', desc: '应用入口' },
    { name: 'query.ts', size: '68KB', desc: '核心对话引擎' },
    { name: 'QueryEngine.ts', size: '46KB', desc: '查询管理器' },
    { name: 'Tool.ts', size: '29KB', desc: '工具类型定义' },
    { name: 'tools.ts', size: '17KB', desc: '工具注册表' },
    { name: 'commands.ts', size: '25KB', desc: '命令注册表' },
    { name: 'context.ts', size: '6KB', desc: '上下文构建' },
    { name: 'cost-tracker.ts', size: '10KB', desc: '成本追踪' },
    { name: 'history.ts', size: '14KB', desc: '历史管理' },
    { name: 'setup.ts', size: '20KB', desc: '环境配置' },
    { name: 'ink.ts', size: '3KB', desc: 'UI 渲染抽象' },
    { name: 'Task.ts', size: '3KB', desc: '任务类型' },
    { name: 'tasks.ts', size: '1KB', desc: '任务注册' },
    { name: 'interactiveHelpers.tsx', size: '57KB', desc: '交互式 UI 辅助' },
    { name: 'dialogLaunchers.tsx', size: '22KB', desc: '对话框启动器' },
    { name: 'replLauncher.tsx', size: '3KB', desc: 'REPL 启动器' },
    { name: 'tools/', desc: '25+ 工具实现', children: [
      { name: 'BashTool/', desc: 'Shell 命令执行' },
      { name: 'FileReadTool/', desc: '文件读取' },
      { name: 'FileWriteTool/', desc: '文件写入' },
      { name: 'FileEditTool/', desc: '文件编辑' },
      { name: 'GlobTool/', desc: '模式匹配' },
      { name: 'GrepTool/', desc: 'ripgrep 搜索' },
      { name: 'AgentTool/', desc: '子代理生成' },
      { name: 'MCPTool/', desc: 'MCP 协议工具' },
      { name: 'LSPTool/', desc: 'LSP 集成' },
    ]},
    { name: 'commands/', desc: '20+ 命令', children: [
      { name: 'commit.ts, review.ts, diff.ts', desc: '代码管理' },
      { name: 'compact.ts, clear.ts, resume.ts', desc: '会话管理' },
      { name: 'config.ts, mcp.ts, permissions.ts', desc: '配置管理' },
    ]},
    { name: 'components/', desc: '~140 个 UI 组件', children: [
      { name: 'REPL/', desc: '主交互界面' },
      { name: 'Dialog/', desc: '对话框' },
      { name: 'StatusBar/', desc: '状态栏' },
    ]},
    { name: 'services/', desc: '外部服务集成' },
    { name: 'hooks/', desc: 'React Hooks' },
    { name: 'bridge/', desc: 'IDE 桥接' },
    { name: 'coordinator/', desc: '多代理协调' },
    { name: 'plugins/', desc: '插件系统' },
    { name: 'skills/', desc: '技能系统' },
    { name: 'state/', desc: '状态管理' },
    { name: 'types/', desc: '类型定义' },
    { name: 'utils/', desc: '工具函数' },
    { name: 'schemas/', desc: 'Zod Schema' },
    { name: 'screens/', desc: '全屏 UI' },
    { name: 'remote/', desc: '远程会话' },
    { name: 'server/', desc: '服务器模式' },
    { name: 'vim/', desc: 'Vim 模式' },
    { name: 'voice/', desc: '语音输入' },
    { name: 'buddy/', desc: '伙伴精灵' },
    { name: 'memdir/', desc: '记忆目录' },
    { name: 'keybindings/', desc: '快捷键' },
    { name: 'constants/', desc: '常量' },
    { name: 'ink/', desc: 'Ink 渲染' },
    { name: 'migrations/', desc: '迁移' },
    { name: 'native-ts/', desc: '原生 TS' },
    { name: 'outputStyles/', desc: '输出样式' },
    { name: 'query/', desc: '查询管道' },
    { name: 'tasks/', desc: '任务管理' },
    { name: 'upstreamproxy/', desc: '上游代理' },
    { name: 'entrypoints/', desc: '入口逻辑' },
    { name: 'bootstrap/', desc: '启动引导' },
    { name: 'moreright/', desc: '权限扩展' },
  ]
}

function TreeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 1)
  const [hovered, setHovered] = useState(false)
  const hasKids = !!node.children?.length
  const isDir = hasKids || node.name.endsWith('/')

  return (
    <div style={{ paddingLeft: depth > 0 ? 20 : 0 }}>
      {depth > 0 && (
        <div style={{
          position: 'absolute',
          left: depth * 20 - 10,
          top: 0,
          bottom: 0,
          width: 1,
          background: '#e2e8f0',
          pointerEvents: 'none',
        }} />
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 8px',
          borderRadius: 6,
          cursor: hasKids ? 'pointer' : 'default',
          background: hovered ? '#f1f5f9' : 'transparent',
          transition: 'background 0.15s ease',
          position: 'relative',
        }}
        onClick={() => hasKids && setOpen(!open)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem',
          color: '#94a3b8',
          width: 14,
          textAlign: 'center',
          flexShrink: 0,
          userSelect: 'none',
        }}>
          {hasKids ? (open ? '\u25BE' : '\u25B8') : '\u00B7'}
        </span>
        <span style={{
          fontSize: '0.85rem',
          flexShrink: 0,
          width: 18,
          textAlign: 'center',
        }}>
          {isDir ? '\u{1F4C1}' : '\u{1F4C4}'}
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.82rem',
          fontWeight: isDir ? 600 : 400,
          color: isDir ? '#d97706' : '#3b82f6',
        }}>
          {node.name}
        </span>
        {node.size && (
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem',
            color: '#94a3b8',
            background: '#f1f5f9',
            padding: '1px 6px',
            borderRadius: 3,
            flexShrink: 0,
          }}>
            {node.size}
          </span>
        )}
        {node.desc && (
          <span style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '0.75rem',
            color: '#64748b',
            marginLeft: 'auto',
            flexShrink: 0,
          }}>
            {node.desc}
          </span>
        )}
      </div>
      {hasKids && open && (
        <div style={{ position: 'relative' }}>
          {node.children!.map((c, i) => (
            <TreeItem key={i} node={c} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function DirTree() {
  return (
    <section id="tree" style={{
      padding: '80px 24px',
      maxWidth: 900,
      margin: '0 auto',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.75rem',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          05 / Directory
        </span>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#0f172a',
          margin: '12px 0 16px',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          \u76EE\u5F55\u7ED3\u6784
        </h2>
        <p style={{
          fontSize: '1rem',
          color: '#475569',
          maxWidth: 500,
          margin: '0 auto',
          lineHeight: 1.6,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          src/ \u4E0B\u7684\u6838\u5FC3\u6587\u4EF6\u4E0E\u5B50\u76EE\u5F55\u4E00\u89C8
        </p>
      </div>
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: '20px 16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
      }}>
        <TreeItem node={tree} />
      </div>
    </section>
  )
}
