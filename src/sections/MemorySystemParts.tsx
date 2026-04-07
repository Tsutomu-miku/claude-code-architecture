import { useState } from 'react'

const highlightCode = (code: string) => {
  return code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(\/\/.*)/g, '<span style="color:#6b7280">$1</span>')
    .replace(/\b(import|export|from|const|let|var|function|return|if|else|async|await|type|interface|class|new|this|true|false|null|undefined|void|satisfies|string|number|boolean|Record|Promise|Set|Map)\b/g, '<span style="color:#8b5cf6">$1</span>')
    .replace(/(?<![;:"\w#])\b(\d+\.?\d*)\b/g, '<span style="color:#f59e0b">$1</span>')
    .replace(/(["'`])((?:(?!\1).)*)\1/g, '<span style="color:#10b981">$1$2$1</span>')
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 24,
  marginBottom: 20,
}

const codeBlockStyle: React.CSSProperties = {
  background: '#1e293b',
  color: '#e2e8f0',
  borderRadius: 8,
  padding: 16,
  fontSize: 13,
  fontFamily: '"JetBrains Mono", monospace',
  lineHeight: 1.6,
  overflowX: 'auto',
  marginTop: 12,
}

export function CompactTab() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div>
      {/* Compaction Decision Tree */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
          /compact 三策略决策树
        </h3>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
          compact 命令按优先级依次尝试三种压缩策略。Session Memory 优先,Reactive 为特性标志门控,Traditional 为最终回退方案。
        </p>
        <svg viewBox="0 0 860 540" style={{ width: '100%', height: 'auto' }}>
          <rect x="0" y="0" width="860" height="540" rx="12" fill="#f8fafc" />

          {/* Entry */}
          <rect x="330" y="20" width="200" height="48" rx="10" fill="#0f172a"/>
          <text x="430" y="50" textAnchor="middle" fontSize="14" fontWeight="700" fill="#ffffff">/compact [instructions]</text>

          <line x1="430" y1="68" x2="430" y2="100" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowCp)" />

          {/* Decision 1 */}
          <polygon points="430,100 530,145 430,190 330,145" fill="#3b82f6" opacity="0.15" stroke="#3b82f6" strokeWidth="1.5"/>
          <text x="430" y="141" textAnchor="middle" fontSize="12" fontWeight="600" fill="#3b82f6">custom instructions?</text>
          <text x="430" y="157" textAnchor="middle" fontSize="11" fill="#64748b">有自定义指令?</text>

          {/* Yes: skip session memory */}
          <line x1="530" y1="145" x2="620" y2="145" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arrowCp)" />
          <text x="570" y="138" fontSize="11" fill="#ef4444" fontWeight="600">Yes</text>

          {/* No: try session memory */}
          <line x1="430" y1="190" x2="430" y2="230" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrowCp)" />
          <text x="445" y="215" fontSize="11" fill="#10b981" fontWeight="600">No</text>

          {/* Strategy 1: Session Memory */}
          <rect x="310" y="230" width="240" height="60" rx="10" fill="#10b981" opacity="0.12" stroke="#10b981" strokeWidth="2"/>
          <text x="430" y="255" textAnchor="middle" fontSize="13" fontWeight="700" fill="#10b981">Strategy 1</text>
          <text x="430" y="275" textAnchor="middle" fontSize="12" fill="#334155">trySessionMemoryCompaction()</text>

          <line x1="430" y1="290" x2="430" y2="320" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowCp)" />

          {/* Decision 2 */}
          <polygon points="430,320 520,355 430,390 340,355" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" strokeWidth="1.5"/>
          <text x="430" y="352" textAnchor="middle" fontSize="12" fontWeight="600" fill="#f59e0b">REACTIVE_COMPACT</text>
          <text x="430" y="368" textAnchor="middle" fontSize="11" fill="#64748b">feature flag?</text>

          {/* Yes: reactive */}
          <line x1="520" y1="355" x2="620" y2="355" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arrowCp)" />
          <text x="565" y="348" fontSize="11" fill="#f59e0b" fontWeight="600">Enabled</text>

          {/* Strategy 2 */}
          <rect x="620" y="120" width="220" height="60" rx="10" fill="#8b5cf6" opacity="0.12" stroke="#8b5cf6" strokeWidth="2"/>
          <text x="730" y="145" textAnchor="middle" fontSize="13" fontWeight="700" fill="#8b5cf6">Strategy 2</text>
          <text x="730" y="165" textAnchor="middle" fontSize="12" fill="#334155">reactiveCompactOnPromptTooLong()</text>

          <rect x="620" y="330" width="220" height="60" rx="10" fill="#f59e0b" opacity="0.12" stroke="#f59e0b" strokeWidth="2"/>
          <text x="730" y="355" textAnchor="middle" fontSize="13" fontWeight="700" fill="#f59e0b">Strategy 2 (Reactive)</text>
          <text x="730" y="375" textAnchor="middle" fontSize="12" fill="#334155">reactiveCompactOnPromptTooLong()</text>

          {/* No: traditional */}
          <line x1="430" y1="390" x2="430" y2="430" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowCp)" />
          <text x="445" y="415" fontSize="11" fill="#94a3b8" fontWeight="600">Disabled</text>

          {/* Strategy 3 */}
          <rect x="290" y="430" width="280" height="80" rx="10" fill="#ef4444" opacity="0.12" stroke="#ef4444" strokeWidth="2"/>
          <text x="430" y="458" textAnchor="middle" fontSize="13" fontWeight="700" fill="#ef4444">Strategy 3: Traditional (Fallback)</text>
          <text x="430" y="478" textAnchor="middle" fontSize="12" fill="#334155">microcompactMessages() 先压缩</text>
          <text x="430" y="496" textAnchor="middle" fontSize="12" fill="#334155">compactConversation() 再总结</text>

          {/* Post-compact */}
          <rect x="40" y="330" width="250" height="180" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5"/>
          <text x="165" y="356" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0f172a">Post-Compact 清理</text>
          <text x="60" y="380" fontSize="11" fill="#334155">1. getUserContext.cache.clear()</text>
          <text x="60" y="400" fontSize="11" fill="#334155">2. runPostCompactCleanup()</text>
          <text x="60" y="420" fontSize="11" fill="#334155">3. suppressCompactWarning()</text>
          <text x="60" y="440" fontSize="11" fill="#334155">4. setLastSummarizedMessageId(undefined)</text>
          <text x="60" y="460" fontSize="11" fill="#334155">5. Pre-compact hooks 执行</text>
          <text x="60" y="480" fontSize="11" fill="#334155">6. compact_boundary 消息分割</text>
          <text x="60" y="500" fontSize="11" fill="#64748b">GC: 边界前的消息被 splice 释放</text>

          <line x1="290" y1="470" x2="260" y2="450" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" />

          <defs>
            <marker id="arrowCp" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Detail Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        <div style={cardStyle}>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: '#ef4444', marginBottom: 12 }}>Traditional Compaction 详解</h4>
          <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.7, marginBottom: 12 }}>
            最终回退策略。先通过 microcompactMessages() 对消息进行微压缩(移除冗余空白、截断长输出),再调用 compactConversation() 使用 Claude 模型生成对话摘要,替换原有历史。
          </p>
          <button onClick={() => toggle('traditional')} style={{ fontSize: 13, color: '#ef4444', background: 'none', border: '1px solid #ef444430', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
            {expanded['traditional'] ? '收起' : '查看代码'} {expanded['traditional'] ? '▲' : '▼'}
          </button>
          {expanded['traditional'] && (
            <pre style={codeBlockStyle} dangerouslySetInnerHTML={{ __html: highlightCode(
`// compact.ts - Traditional 压缩流程
async function compactConversation(
  messages: Message[],
  systemPrompt: string,
  customInstructions?: string
) {
  // 1. 获取边界后的消息
  const toCompact = getMessagesAfterCompactBoundary(messages)

  // 2. 微压缩: 减少 token 占用
  const microcompacted = microcompactMessages(toCompact)

  // 3. 构建压缩提示 (含缓存共享参数)
  const cacheSharingParams = buildCacheSharingParams(
    systemPrompt, getUserContext()
  )

  // 4. 调用 Claude 生成摘要
  const summary = await claudeCall({
    messages: microcompacted,
    system: 'Summarize this conversation...',
    ...cacheSharingParams,
  })

  // 5. 插入 compact_boundary 系统消息
  return {
    type: 'compact',
    compactionResult: summary,
    displayText: 'Conversation compacted.'
  }
}`) }} />
          )}
        </div>

        <div style={cardStyle}>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: '#10b981', marginBottom: 12 }}>compact_boundary 与 snipReplay</h4>
          <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.7, marginBottom: 12 }}>
            压缩后,QueryEngine 在消息数组中插入 compact_boundary 标记。该标记之前的所有消息被 splice 移除,释放内存。snipReplay 机制(HISTORY_SNIP feature flag)允许在可变消息存储上重放截断边界。
          </p>
          <button onClick={() => toggle('boundary')} style={{ fontSize: 13, color: '#10b981', background: 'none', border: '1px solid #10b98130', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
            {expanded['boundary'] ? '收起' : '查看代码'} {expanded['boundary'] ? '▲' : '▼'}
          </button>
          {expanded['boundary'] && (
            <pre style={codeBlockStyle} dangerouslySetInnerHTML={{ __html: highlightCode(
`// QueryEngine.ts - compact_boundary 处理
// 当收到 compact_boundary 系统消息时:
if (msg.type === 'compact_boundary') {
  // 找到边界位置
  const boundaryIdx = messages.findIndex(
    m => m.id === msg.id
  )
  // splice 移除边界前的所有消息 (GC 释放)
  if (boundaryIdx > 0) {
    this.mutableMessages.splice(0, boundaryIdx)
    messages.splice(0, boundaryIdx)
  }
}

// snipReplay - HISTORY_SNIP feature
// ask() 中注入的回调:
const snipReplay = (boundary: SnipBoundary) => {
  // 在可变存储上重放截断
  replaySnipOnMutableStore(
    mutableMessages, boundary
  )
}`) }} />
          )}
        </div>
      </div>

      {/* Token Budget Viz */}
      <div style={{ ...cardStyle, marginTop: 16 }}>
        <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Token 预算与压缩触发</h4>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Context Window', value: '200K tokens', color: '#3b82f6', pct: 100 },
            { label: 'System Prompt', value: '~8K tokens', color: '#8b5cf6', pct: 4 },
            { label: 'Memory Injection', value: '~2-5K tokens', color: '#10b981', pct: 2.5 },
            { label: 'Conversation History', value: '~150K tokens', color: '#f59e0b', pct: 75 },
            { label: 'Compact Trigger', value: '~80% usage', color: '#ef4444', pct: 80 },
          ].map(item => (
            <div key={item.label} style={{ flex: '1 1 180px', padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: item.color, marginBottom: 8 }}>{item.value}</div>
              <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3 }}>
                <div style={{ height: 6, background: item.color, borderRadius: 3, width: `${Math.min(item.pct, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Tab 5: State Management ─── */
export function StateTab() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  const stateFields = [
    { name: 'mcp', desc: 'MCP 服务器连接、工具、命令和资源注册表', color: '#3b82f6' },
    { name: 'fileHistory', desc: '文件状态快照, 支持 rewind 回退', color: '#10b981' },
    { name: 'todos', desc: '按 agentId 索引的 TodoList 集合', color: '#8b5cf6' },
    { name: 'tasks', desc: '统一任务状态, 用于多智能体协调', color: '#f59e0b' },
    { name: 'speculation', desc: '推测执行状态, 预测性工具调用', color: '#ef4444' },
    { name: 'toolPermissionContext', desc: '权限模式与规则, 控制工具访问', color: '#06b6d4' },
    { name: 'settings', desc: '完整 settings.json 状态镜像', color: '#ec4899' },
    { name: 'teamContext', desc: '多智能体 swarm 状态管理', color: '#6366f1' },
    { name: 'sessionHooks', desc: '会话钩子状态(pre/post compact等)', color: '#84cc16' },
    { name: 'replContext', desc: 'REPL VM 上下文, 跨调用状态共享', color: '#a855f7' },
  ]

  return (
    <div>
      {/* State Architecture Diagram */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
          AppState 响应式架构
        </h3>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
          基于 createStore&lt;T&gt; 的轻量级响应式状态管理,通过 useSyncExternalStore 与 React 集成,支持细粒度订阅与副作用同步。
        </p>
        <svg viewBox="0 0 800 380" style={{ width: '100%', height: 'auto' }}>
          <rect x="0" y="0" width="800" height="380" rx="12" fill="#f8fafc" />

          {/* Store Core */}
          <rect x="280" y="30" width="240" height="80" rx="12" fill="#8b5cf6" opacity="0.12" stroke="#8b5cf6" strokeWidth="2"/>
          <text x="400" y="58" textAnchor="middle" fontSize="15" fontWeight="700" fill="#8b5cf6">createStore&lt;AppState&gt;</text>
          <text x="400" y="78" textAnchor="middle" fontSize="11" fill="#64748b">state + setState + subscribe</text>
          <text x="400" y="94" textAnchor="middle" fontSize="11" fill="#64748b">Object.is 去重 + Set&lt;Listener&gt;</text>

          {/* Left: React */}
          <rect x="40" y="160" width="200" height="70" rx="10" fill="#3b82f6" opacity="0.12" stroke="#3b82f6" strokeWidth="1.5"/>
          <text x="140" y="188" textAnchor="middle" fontSize="13" fontWeight="700" fill="#3b82f6">React Components</text>
          <text x="140" y="208" textAnchor="middle" fontSize="11" fill="#64748b">useSyncExternalStore</text>
          <text x="140" y="222" textAnchor="middle" fontSize="11" fill="#64748b">useAppState(selector)</text>

          {/* Center: AppState */}
          <rect x="280" y="145" width="240" height="100" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5"/>
          <text x="400" y="170" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a">AppState</text>
          <text x="310" y="192" fontSize="10" fill="#64748b">mcp | fileHistory | todos</text>
          <text x="310" y="208" fontSize="10" fill="#64748b">tasks | speculation | settings</text>
          <text x="310" y="224" fontSize="10" fill="#64748b">teamContext | replContext | hooks</text>
          <text x="310" y="240" fontSize="10" fill="#64748b">toolPermission | model | view</text>

          {/* Right: Side Effects */}
          <rect x="560" y="160" width="210" height="70" rx="10" fill="#f59e0b" opacity="0.12" stroke="#f59e0b" strokeWidth="1.5"/>
          <text x="665" y="188" textAnchor="middle" fontSize="13" fontWeight="700" fill="#f59e0b">onChangeAppState</text>
          <text x="665" y="208" textAnchor="middle" fontSize="11" fill="#64748b">CCR 同步 | 设置持久化</text>
          <text x="665" y="222" textAnchor="middle" fontSize="11" fill="#64748b">Auth 缓存清理 | ENV 重载</text>

          {/* Arrows */}
          <line x1="400" y1="110" x2="400" y2="145" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowSt)" />
          <line x1="280" y1="195" x2="240" y2="195" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#arrowBlue)" />
          <line x1="520" y1="195" x2="560" y2="195" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arrowAmber)" />

          {/* Bottom: Provider */}
          <rect x="200" y="290" width="400" height="60" rx="10" fill="#10b981" opacity="0.12" stroke="#10b981" strokeWidth="1.5"/>
          <text x="400" y="316" textAnchor="middle" fontSize="13" fontWeight="700" fill="#10b981">AppStateProvider</text>
          <text x="400" y="336" textAnchor="middle" fontSize="11" fill="#64748b">MailboxProvider + VoiceProvider wrapping</text>

          <line x1="400" y1="245" x2="400" y2="290" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowSt)" />

          <defs>
            <marker id="arrowSt" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" /></marker>
            <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#3b82f6" /></marker>
            <marker id="arrowAmber" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#f59e0b" /></marker>
          </defs>
        </svg>
      </div>

      {/* State Fields Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {stateFields.map(f => (
          <div key={f.name} style={{ padding: 16, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, borderTop: `3px solid ${f.color}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: f.color, fontFamily: '"JetBrains Mono", monospace', marginBottom: 6 }}>{f.name}</div>
            <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Code Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, marginTop: 16 }}>
        <div style={cardStyle}>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: '#8b5cf6', marginBottom: 12 }}>createStore 实现</h4>
          <button onClick={() => toggle('store')} style={{ fontSize: 13, color: '#8b5cf6', background: 'none', border: '1px solid #8b5cf630', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
            {expanded['store'] ? '收起' : '查看代码'} {expanded['store'] ? '▲' : '▼'}
          </button>
          {expanded['store'] && (
            <pre style={codeBlockStyle} dangerouslySetInnerHTML={{ __html: highlightCode(
`// state/store.ts - 通用响应式存储
export function createStore<T>(
  initialState: T,
  onChange?: (prev: T, next: T) => void
): Store<T> {
  let state = initialState
  const listeners = new Set<Listener>()

  return {
    getState: () => state,
    setState: (updater) => {
      const next =typeof updater === 'function'
        ? updater(state) : updater
      // Object.is 去重, 避免无意义更新
      if (Object.is(state, next)) return
      const prev = state
      state = next
      // 先调用 onChange 副作用
      onChange?.(prev, next)
      // 再通知所有订阅者
      listeners.forEach(l => l())
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    }
  }
}`) }} />
          )}
        </div>

        <div style={cardStyle}>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', marginBottom: 12 }}>副作用同步 (onChangeAppState)</h4>
          <button onClick={() => toggle('onChange')} style={{ fontSize: 13, color: '#f59e0b', background: 'none', border: '1px solid #f59e0b30', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
            {expanded['onChange'] ? '收起' : '查看代码'} {expanded['onChange'] ? '▲' : '▼'}
          </button>
          {expanded['onChange'] && (
            <pre style={codeBlockStyle} dangerouslySetInnerHTML={{ __html: highlightCode(
`// state/onChangeAppState.ts - 状态变更副作用
export function onChangeAppState(
  prev: AppState, next: AppState
) {
  // 1. 权限模式变更 -> 同步到 CCR 远程会话
  if (prev.toolPermissionContext.mode
    !== next.toolPermissionContext.mode) {
    syncPermissionToCCR(next.toolPermissionContext)
    emitSDKStatus(next.toolPermissionContext)
  }
  // 2. 模型变更 -> 持久化到用户设置
  if (prev.mainLoopModel !== next.mainLoopModel) {
    persistModelSetting(next.mainLoopModel)
  }
  // 3. 设置变更 -> 清除认证缓存
  if (prev.settings !== next.settings) {
    clearAuthCaches() // API key, AWS, GCP
    reapplyEnvVars(next.settings.env)
  }
}`) }} />
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Tab 6: Coordinator & Multi-Agent ─── */
export function CoordinatorTab() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div>
      {/* Coordinator Diagram */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
          Coordinator-Worker 多智能体架构
        </h3>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
          协调器模式下,Leader Agent 通过 Agent/SendMessage/TaskStop 三种工具管理多个 Worker Agent,遵循四阶段工作流。
        </p>
        <svg viewBox="0 0 860 460" style={{ width: '100%', height: 'auto' }}>
          <rect x="0" y="0" width="860" height="460" rx="12" fill="#f8fafc" />

          {/* Coordinator */}
          <rect x="300" y="20" width="260" height="70" rx="12" fill="#8b5cf6" opacity="0.15" stroke="#8b5cf6" strokeWidth="2"/>
          <text x="430" y="48" textAnchor="middle" fontSize="16" fontWeight="700" fill="#8b5cf6">Coordinator (Leader)</text>
          <text x="430" y="70" textAnchor="middle" fontSize="12" fill="#64748b">~5000 词系统提示 | 任务分解与调度</text>

          {/* 4 Phases */}
          <rect x="30" y="20" width="240" height="70" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5"/>
          <text x="150" y="42" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">四阶段工作流</text>
          <text x="50" y="60" fontSize="11" fill="#3b82f6" fontWeight="600">1. Research</text>
          <text x="50" y="76" fontSize="11" fill="#10b981" fontWeight="600">2. Synthesis</text>
          <text x="160" y="60" fontSize="11" fill="#f59e0b" fontWeight="600">3. Implementation</text>
          <text x="160" y="76" fontSize="11" fill="#ef4444" fontWeight="600">4. Verification</text>

          {/* 3 Tools */}
          <rect x="590" y="20" width="240" height="70" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5"/>
          <text x="710" y="42" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">协调器工具</text>
          <rect x="605" y="54" width="65" height="26" rx="6" fill="#3b82f6" opacity="0.15"/>
          <text x="637" y="72" textAnchor="middle" fontSize="10" fontWeight="600" fill="#3b82f6">Agent</text>
          <rect x="680" y="54" width="85" height="26" rx="6" fill="#10b981" opacity="0.15"/>
          <text x="722" y="72" textAnchor="middle" fontSize="10" fontWeight="600" fill="#10b981">SendMessage</text>
          <rect x="775" y="54" width="45" height="26" rx="6" fill="#ef4444" opacity="0.15"/>
          <text x="797" y="72" textAnchor="middle" fontSize="10" fontWeight="600" fill="#ef4444">Stop</text>

          {/* Arrows to Workers */}
          <line x1="350" y1="90" x2="150" y2="160" stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#arrowCo)" />
          <line x1="400" y1="90" x2="350" y2="160" stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#arrowCo)" />
          <line x1="460" y1="90" x2="510" y2="160" stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#arrowCo)" />
          <line x1="510" y1="90" x2="710" y2="160" stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#arrowCo)" />

          {/* Worker 1 */}
          <rect x="50" y="160" width="200" height="60" rx="10" fill="#3b82f6" opacity="0.12" stroke="#3b82f6" strokeWidth="1.5"/>
          <text x="150" y="186" textAnchor="middle" fontSize="12" fontWeight="700" fill="#3b82f6">Worker Agent 1</text>
          <text x="150" y="206" textAnchor="middle" fontSize="10" fill="#64748b">Research / 调研</text>

          {/* Worker 2 */}
          <rect x="270" y="160" width="160" height="60" rx="10" fill="#10b981" opacity="0.12" stroke="#10b981" strokeWidth="1.5"/>
          <text x="350" y="186" textAnchor="middle" fontSize="12" fontWeight="700" fill="#10b981">Worker Agent 2</text>
          <text x="350" y="206" textAnchor="middle" fontSize="10" fill="#64748b">Implementation</text>

          {/* Worker 3 */}
          <rect x="450" y="160" width="160" height="60" rx="10" fill="#f59e0b" opacity="0.12" stroke="#f59e0b" strokeWidth="1.5"/>
          <text x="530" y="186" textAnchor="middle" fontSize="12" fontWeight="700" fill="#f59e0b">Worker Agent 3</text>
          <text x="530" y="206" textAnchor="middle" fontSize="10" fill="#64748b">Testing / 验证</text>

          {/* Worker 4 */}
          <rect x="630" y="160" width="180" height="60" rx="10" fill="#ef4444" opacity="0.12" stroke="#ef4444" strokeWidth="1.5"/>
          <text x="720" y="186" textAnchor="middle" fontSize="12" fontWeight="700" fill="#ef4444">Worker Agent N</text>
          <text x="720" y="206" textAnchor="middle" fontSize="10" fill="#64748b">Custom Task</text>

          {/* Shared Context */}
          <rect x="100" y="260" width="660" height="70" rx="10" fill="#f59e0b" opacity="0.08" stroke="#f59e0b" strokeWidth="1.5"/>
          <text x="430" y="286" textAnchor="middle" fontSize="13" fontWeight="700" fill="#f59e0b">Shared State: AppState.teamContext + AppState.tasks</text>
          <text x="430" y="308" textAnchor="middle" fontSize="11" fill="#64748b">Worker 通过 getCoordinatorUserContext() 获取可用工具列表 | MCP 服务器共享</text>

          <line x1="150" y1="220" x2="150" y2="260" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="350" y1="220" x2="350" y2="260" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="530" y1="220" x2="530" y2="260" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="720" y1="220" x2="720" y2="260" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />

          {/* Feature Flag */}
          <rect x="100" y="370" width="320" height="60" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5"/>
          <text x="260" y="396" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">Feature Flag 门控</text>
          <text x="120" y="416" fontSize="11" fill="#64748b" fontFamily="monospace">CLAUDE_CODE_COORDINATOR_MODE=true</text>

          <rect x="450" y="370" width="310" height="60" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5"/>
          <text x="605" y="396" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">Session Mode 匹配</text>
          <text x="470" y="416" fontSize="11" fill="#64748b">matchSessionMode() - 恢复会话时同步模式</text>

          <defs>
            <marker id="arrowCo" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#8b5cf6" /></marker>
          </defs>
        </svg>
      </div>

      {/* Detail Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        <div style={cardStyle}>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: '#8b5cf6', marginBottom: 12 }}>Coordinator System Prompt</h4>
          <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.7, marginBottom: 12 }}>
            约 5000 词的系统提示,定义协调器角色:任务分解、Worker 管理、工具使用规范。包含四阶段工作流指导(Research → Synthesis → Implementation → Verification)、Worker 提示编写指南和示例会话。
          </p>
          <button onClick={() => toggle('coordPrompt')} style={{ fontSize: 13, color: '#8b5cf6', background: 'none', border: '1px solid #8b5cf630', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
            {expanded['coordPrompt'] ? '收起' : '查看关键结构'} {expanded['coordPrompt'] ? '▲' : '▼'}
          </button>
          {expanded['coordPrompt'] && (
            <pre style={codeBlockStyle} dangerouslySetInnerHTML={{ __html: highlightCode(
`// coordinatorMode.ts - 系统提示结构
export function getCoordinatorSystemPrompt(): string {
  return \`
You are a coordinator agent. Your role is to:

## Available Tools
- Agent(prompt, ...) - Launch a new worker
- SendMessage(to, content) - Message a running worker
- TaskStop(taskId) - Stop a worker agent

## Workflow Phases
1. RESEARCH: Gather context, read files, understand
2. SYNTHESIS: Plan implementation strategy
3. IMPLEMENTATION: Execute changes via workers
4. VERIFICATION: Test, review, validate

## Worker Prompt Guidelines
- Be specific about the task scope
- Include file paths and function names
- Set clear success criteria
- One focused task per worker

## Rules
- Never do implementation work yourself
- Delegate all file edits to workers
- Synthesize worker results into final answer
\`
}`) }} />
          )}
        </div>

        <div style={cardStyle}>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: '#10b981', marginBottom: 12 }}>Worker 工具上下文注入</h4>
          <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.7, marginBottom: 12 }}>
            getCoordinatorUserContext() 构建 workerToolsContext 字符串,列出 Worker 可访问的所有工具和 MCP 服务器。注入到用户上下文中,使协调器了解 Worker 的能力边界。
          </p>
          <button onClick={() => toggle('workerCtx')} style={{ fontSize: 13, color: '#10b981', background: 'none', border: '1px solid #10b98130', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
            {expanded['workerCtx'] ? '收起' : '查看代码'} {expanded['workerCtx'] ? '▲' : '▼'}
          </button>
          {expanded['workerCtx'] && (
            <pre style={codeBlockStyle} dangerouslySetInnerHTML={{ __html: highlightCode(
`// coordinatorMode.ts - Worker 工具上下文
export function getCoordinatorUserContext(
  mcpClients: McpClientMap,
  scratchpadDir: string
): string {
  const toolList = getAllAvailableTools(mcpClients)
  const mcpServers = Array.from(mcpClients.keys())

  return [
    '## Worker Capabilities',
    '',
    '### Available Tools:',
    toolList.map(t => '- ' + t.name + ': ' + t.description)
      .join('\\n'),
    '',
    '### MCP Servers:',
    mcpServers.map(s => '- ' + s).join('\\n'),
    '',
    '### Scratchpad: ' + scratchpadDir,
    'Workers can read/write files here for coordination.'
  ].join('\\n')
}`) }} />
          )}
        </div>
      </div>
    </div>
  )
}
