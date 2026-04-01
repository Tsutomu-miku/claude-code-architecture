import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const tabs = ['工具系统', '命令系统', '服务层', '桥接系统', '权限系统', '功能开关']

function ToolsTab() {
  const categories = [
    { title: '文件操作', items: ['FileReadTool', 'FileWriteTool', 'FileEditTool', 'GlobTool', 'GrepTool'] },
    { title: '命令执行', items: ['BashTool'] },
    { title: '代理系统', items: ['AgentTool'] },
    { title: '协议集成', items: ['MCPTool', 'LSPTool'] },
    { title: '团队管理', items: ['TeamCreateTool', 'TeamDeleteTool'] },
    { title: '工作区', items: ['EnterWorktreeTool', 'ExitWorktreeTool'] },
    { title: '其他', items: ['CronCreateTool', 'SleepTool', 'WebFetchTool', 'SkillTool'] },
  ]
  return (
    <>
      <div className="sys-grid">
        {categories.map(c => (
          <div key={c.title} className="sys-card">
            <h4>{c.title}</h4>
            <ul>{c.items.map(i => <li key={i}>{i}</li>)}</ul>
          </div>
        ))}
      </div>
      <table className="perm-table">
        <thead><tr><th>属性</th><th>默认值</th><th>说明</th></tr></thead>
        <tbody>
          <tr><td><code>isReadOnly</code></td><td>false</td><td>只读操作</td></tr>
          <tr><td><code>isDestructive</code></td><td>false</td><td>破坏性操作</td></tr>
          <tr><td><code>isConcurrencySafe</code></td><td>false</td><td>并发安全 (fail-closed)</td></tr>
          <tr><td><code>needsPermissions</code></td><td>--</td><td>需要用户确认</td></tr>
        </tbody>
      </table>
    </>
  )
}

function CommandsTab() {
  const groups = [
    { title: '代码管理', items: ['/commit', '/review', '/diff'] },
    { title: '会话管理', items: ['/compact', '/clear', '/resume'] },
    { title: '配置管理', items: ['/config', '/mcp', '/permissions'] },
    { title: '工具命令', items: ['/doctor', '/memory', '/skills', '/tasks'] },
    { title: 'UI 控制', items: ['/vim', '/theme', '/cost'] },
  ]
  return (
    <div className="sys-grid">
      {groups.map(g => (
        <div key={g.title} className="sys-card">
          <h4>{g.title}</h4>
          <ul>{g.items.map(i => <li key={i}>{i}</li>)}</ul>
        </div>
      ))}
    </div>
  )
}

function ServicesTab() {
  const services = [
    { title: 'API 客户端', desc: 'Anthropic SDK, 流式响应, 自动重试' },
    { title: 'MCP 管理', desc: 'MCP 服务器生命周期管理, 工具发现' },
    { title: 'OAuth 认证', desc: 'OAuth 2.0 + PKCE 流程, JWT 令牌' },
    { title: 'LSP 管理', desc: '语言服务器协议集成, 诊断信息' },
    { title: '功能开关', desc: 'GrowthBook 集成, 服务端评估' },
    { title: '上下文压缩', desc: '超长对话自动 compact, 保留关键信息' },
    { title: '自动记忆', desc: '记忆提取与持久化, CLAUDE.md' },
  ]
  return (
    <div className="sys-grid">
      {services.map(s => (
        <div key={s.title} className="sys-card">
          <h4>{s.title}</h4>
          <p>{s.desc}</p>
        </div>
      ))}
    </div>
  )
}

function BridgeTab() {
  const bridges = [
    { title: 'VS Code', desc: 'UDS (Unix Domain Socket) 通信' },
    { title: 'JetBrains', desc: '扩展插件集成' },
    { title: '消息协议', desc: 'JSON-RPC 双向消息传递' },
    { title: '权限回调', desc: 'IDE 侧权限确认对话框' },
    { title: 'JWT 认证', desc: '桥接会话安全认证' },
  ]
  return (
    <div className="sys-grid">
      {bridges.map(b => (
        <div key={b.title} className="sys-card">
          <h4>{b.title}</h4>
          <p>{b.desc}</p>
        </div>
      ))}
    </div>
  )
}

function PermissionsTab() {
  const modes = [
    { name: 'default', tag: '默认模式', desc: '危险操作需用户确认, 安全操作自动执行' },
    { name: 'plan', tag: '只读模式', desc: '仅分析和规划, 不执行任何修改操作' },
    { name: 'bypassPermissions', tag: 'Docker/Sandbox', desc: '跳过所有权限检查, 适用于隔离环境' },
    { name: 'auto', tag: '自动模式', desc: '自动批准安全操作, 危险操作仍需确认' },
  ]
  return (
    <div className="mode-cards">
      {modes.map(m => (
        <div key={m.name} className="mode-card">
          <h4>{m.name}</h4>
          <span className="mode-tag">{m.tag}</span>
          <p>{m.desc}</p>
        </div>
      ))}
    </div>
  )
}

function FlagsTab() {
  const flags = [
    { name: 'PROACTIVE', desc: '主动建议模式' },
    { name: 'KAIROS', desc: '高级推理引擎' },
    { name: 'BRIDGE_MODE', desc: 'IDE 桥接模式' },
    { name: 'DAEMON', desc: '守护进程模式' },
    { name: 'VOICE_MODE', desc: '语音输入模式' },
    { name: 'AGENT_TRIGGERS', desc: '代理触发器' },
    { name: 'MONITOR_TOOL', desc: '监控工具' },
  ]
  return (
    <div className="flag-list">
      {flags.map(f => (
        <div key={f.name} className="flag-item">
          <span className="flag-dot" />
          <span className="flag-name">{f.name}</span>
          <span className="flag-desc">{f.desc}</span>
        </div>
      ))}
    </div>
  )
}

const panels = [ToolsTab, CommandsTab, ServicesTab, BridgeTab, PermissionsTab, FlagsTab]

export default function Systems() {
  const [active, setActive] = useState(0)
  const Panel = panels[active]

  return (
    <section id="systems" className="section">
      <span className="section-tag">04 / Core Systems</span>
      <h2 className="section-title">六大核心系统</h2>
      <p className="section-desc">深入各子系统的职责划分与实现细节</p>
      <div className="tab-bar">
        {tabs.map((t, i) => (
          <button key={t} className={`tab-btn${active === i ? ' active' : ''}`} onClick={() => setActive(i)}>{t}</button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          <Panel />
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
