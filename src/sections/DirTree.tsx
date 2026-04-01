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
  const hasKids = !!node.children?.length
  const isDir = hasKids || node.name.endsWith('/')

  return (
    <div className="tree-item" style={{ paddingLeft: depth * 20 }}>
      <div className={`tree-row${hasKids ? ' clickable' : ''}`} onClick={() => hasKids && setOpen(!open)}>
        <span className="tree-toggle">{hasKids ? (open ? '\u25BE' : '\u25B8') : '\u00B7'}</span>
        <span className={`tree-name${isDir ? ' dir' : ''}`}>{node.name}</span>
        {node.size && <span className="tree-size">{node.size}</span>}
        {node.desc && <span className="tree-desc">{node.desc}</span>}
      </div>
      {hasKids && open && node.children!.map((c, i) => <TreeItem key={i} node={c} depth={depth + 1} />)}
    </div>
  )
}

export default function DirTree() {
  return (
    <section id="tree" className="section">
      <span className="section-tag">05 / Directory</span>
      <h2 className="section-title">目录结构</h2>
      <p className="section-desc">src/ 下的核心文件与子目录一览</p>
      <div className="dir-tree" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '20px 16px', border: '1px solid var(--border)' }}>
        <TreeItem node={tree} />
      </div>
    </section>
  )
}
