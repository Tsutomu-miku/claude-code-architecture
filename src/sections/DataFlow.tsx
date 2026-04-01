const nodes = [
  { text: '用户输入', sub: 'CLI / IDE / SDK' },
  { text: 'REPL', sub: 'replLauncher.tsx' },
  { text: 'QueryEngine.submitMessage()', sub: 'QueryEngine.ts' },
  { text: 'query() AsyncGenerator', sub: 'query.ts', accent: true },
]

const branches = [
  { text: 'System Prompt', sub: 'context.ts' },
  { text: 'Anthropic API', sub: 'stream 模式' },
  { text: 'Tool Calls', sub: '并发执行' },
]

const bottom = [
  { text: 'yield Messages', sub: '流式传递' },
]

const outputs = [
  { text: 'UI 渲染', sub: 'Ink / React' },
  { text: '成本追踪', sub: 'OpenTelemetry' },
]

export default function DataFlow() {
  return (
    <section id="flow" className="section">
      <span className="section-tag">03 / Data Flow</span>
      <h2 className="section-title">数据流</h2>
      <p className="section-desc">从用户输入到最终响应的完整数据流转路径</p>
      <div className="flow-container">
        {nodes.map((n, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className={`flow-node${n.accent ? ' accent' : ''}`}>
              {n.text}<small>{n.sub}</small>
            </div>
            {i < nodes.length - 1 && <div className="flow-arrow"><span className="pulse" /></div>}
          </div>
        ))}
        <div className="flow-arrow"><span className="pulse" /></div>
        <div className="flow-branch">
          {branches.map((b, i) => (
            <div key={i} className="flow-branch-item">
              <div className="flow-merge-line" />
              <div className="flow-node">{b.text}<small>{b.sub}</small></div>
              <div className="flow-merge-line" />
            </div>
          ))}
        </div>
        <div className="flow-arrow"><span className="pulse" /></div>
        {bottom.map((n, i) => (
          <div key={i} className="flow-node accent">{n.text}<small>{n.sub}</small></div>
        ))}
        <div className="flow-arrow"><span className="pulse" /></div>
        <div className="flow-branch">
          {outputs.map((b, i) => (
            <div key={i} className="flow-branch-item">
              <div className="flow-merge-line" />
              <div className="flow-node">{b.text}<small>{b.sub}</small></div>
              <div className="flow-merge-line" />
            </div>
          ))}
        </div>
        <div className="flow-arrow"><span className="pulse" /></div>
        <div className="flow-node" style={{ borderColor: 'var(--layer4)' }}>
          最终响应 &rarr; 用户
        </div>
      </div>
    </section>
  )
}
