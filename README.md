# Claude Code 源码架构解析

> 深入解读 Anthropic AI 终端助手的 512,000+ 行 TypeScript 源代码

## 在线预览

**[https://tsutomu-miku.github.io/claude-code-architecture/](https://tsutomu-miku.github.io/claude-code-architecture/)**

## 关于

本项目是对 [Claude Code](https://github.com/Tsutomu-miku/claude-code) 源代码的完整架构分析和可视化展示。

### 包含内容

- **分层架构图** — 入口层、会话层、工具层、基础设施层
- **数据流图** — 从用户输入到最终响应的完整请求处理流程
- **六大核心系统** — 工具系统、命令系统、服务层、桥接系统、权限系统、功能开关
- **目录结构** — 可交互的源码目录树
- **设计模式** — AsyncGenerator流、Feature Flag门控等8大设计模式
- **启动流程** — 从进程启动到REPL就绪的完整时序

### 技术栏

| 技术 | 用途 |
|------|------|
| Bun | 运行时 |
| TypeScript | 编程语言（严格模式） |
| React + Ink | 终端 UI |
| Commander.js | CLI 解析 |
| Zod v4 | Schema 验证 |
| MCP SDK + LSP | 协议集成 |
| Anthropic SDK | API 调用 |

## 本站技术栏

- Vite + React + TypeScript
- Framer Motion
- GitHub Pages

## 声明

本站仅用于技术学习和架构分析目的。

## License

MIT
