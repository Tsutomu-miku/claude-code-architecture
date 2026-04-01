import { useEffect, useRef } from 'react'

const steps = [
  { title: 'profileCheckpoint', desc: '性能基准打点, 标记启动开始时间' },
  { title: 'startMdmRawRead', desc: 'MDM (Mobile Device Management) 企业配置预读' },
  { title: 'startKeychainPrefetch', desc: 'Keychain 凭证预取, 异步加载 API Key' },
  { title: '动态 imports 加载', desc: '按需加载核心模块, 减少阻塞时间' },
  { title: 'main() 函数执行', desc: '应用主函数入口, 初始化 Commander 程序' },
  { title: 'run() Commander program', desc: 'Commander.js 解析 CLI 参数并路由' },
  { title: 'action handler 触发', desc: '匹配到的命令处理器开始执行' },
  { title: '[并行] setup() + getCommands() + getAgentDefs()', desc: '环境配置、命令注册、代理定义并行加载', parallel: true },
  { title: 'showSetupScreens()', desc: '信任对话框 + 入门引导流程展示' },
  { title: 'launchRepl()', desc: 'REPL 循环启动, 等待用户输入' },
]

export default function BootSeq() {
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      })
    }, { threshold: 0.2 })
    refs.current.forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="boot" className="section">
      <span className="section-tag">07 / Boot Sequence</span>
      <h2 className="section-title">启动流程</h2>
      <p className="section-desc">从进程启动到 REPL 就绪的 10 个关键步骤</p>
      <div className="timeline">
        {steps.map((s, i) => (
          <div
            key={i}
            ref={el => { refs.current[i] = el }}
            className={`tl-step${(s as any).parallel ? ' parallel' : ''}`}
          >
            <div className="tl-dot" />
            <div className="tl-idx">Step {i + 1}</div>
            <div className="tl-title">{s.title}</div>
            <div className="tl-desc">{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
