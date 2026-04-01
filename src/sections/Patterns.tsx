const patterns = [
  { title: 'AsyncGenerator 流模式', desc: 'query() 全链路使用 async generator 实现流式消息传递和背压控制, 优雅处理长对话流' },
  { title: 'Feature Flag 门控', desc: 'bun:bundle 特性标志 + 死代码消除, 运行时零开销切换功能模块' },
  { title: '注册表模式', desc: 'tools.ts / tasks.ts 统一注册表, 集中管理所有工具和任务的元数据与实现' },
  { title: '动态导入延迟加载', desc: 'dialogLaunchers.tsx 通过 import() 按需加载对话框, 减小初始包体积' },
  { title: 'Memoize 缓存', desc: 'lodash-es/memoize 缓存昂贵计算结果, 避免重复执行高开销操作' },
  { title: 'Fail-Closed 安全', desc: 'buildTool() 默认 isConcurrencySafe=false, isReadOnly=false, 未声明即拒绝' },
  { title: '并行预取', desc: 'main.tsx 中 setup / commands / agentDefs 并行加载, 最大化启动速度' },
  { title: '双模式运行', desc: 'REPL 交互式 + headless/SDK (--print), 同一核心适配两种使用场景' },
]

export default function Patterns() {
  return (
    <section id="patterns" className="section">
      <span className="section-tag">06 / Patterns</span>
      <h2 className="section-title">设计模式</h2>
      <p className="section-desc">源码中反复出现的 8 个核心工程模式</p>
      <div className="patterns-scroll">
        {patterns.map((p, i) => (
          <div key={i} className="pattern-card">
            <div className="pattern-num">#{String(i + 1).padStart(2, '0')}</div>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
