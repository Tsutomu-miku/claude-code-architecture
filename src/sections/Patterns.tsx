import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ================================================================== */
/*  Syntax Highlighting (no external deps)                             */
/* ================================================================== */

function highlightCode(code: string): string {
  const lines = code.split('\n')
  return lines
    .map(line => {
      // Comments
      if (line.trimStart().startsWith('//')) {
        return `<span style="color:#94a3b8;font-style:italic">${escHtml(line)}</span>`
      }
      let result = escHtml(line)
      // Strings
      result = result.replace(
        /(&quot;[^&]*?&quot;|&#x27;[^&]*?&#x27;|`[^`]*?`)/g,
        '<span style="color:#059669">$1</span>'
      )
      // Keywords
      result = result.replace(
        /\b(const|let|var|function|async|await|return|if|else|for|while|switch|case|break|default|new|class|extends|import|export|from|throw|try|catch|finally|yield|of|in|typeof|instanceof|true|false|null|undefined|this|super)\b/g,
        '<span style="color:#dc2626;font-weight:500">$1</span>'
      )
      // Types
      result = result.replace(
        /\b(string|number|boolean|void|any|never|unknown|Promise|Record|Map|Set|Array|Object|Error)\b/g,
        '<span style="color:#7c3aed">$1</span>'
      )
      // Numbers
      result = result.replace(
        /\b(\d+\.?\d*)\b/g,
        '<span style="color:#3b82f6">$1</span>'
      )
      // Function calls
      result = result.replace(
        /(\w+)(\()/g,
        '<span style="color:#d97706">$1</span>$2'
      )
      return result
    })
    .join('\n')
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
}

/* ================================================================== */
/*  Pattern Data                                                       */
/* ================================================================== */

interface PatternData {
  emoji: string
  category: string
  categoryColor: string
  categoryBg: string
  accentColor: string
  title: string
  summary: string
  description: string
  code: string
}

const patterns: PatternData[] = [
  {
    emoji: '\u{1F30A}',
    category: '\u6570\u636E\u6D41',
    categoryColor: '#06b6d4',
    categoryBg: '#ecfeff',
    accentColor: '#06b6d4',
    title: 'AsyncGenerator \u6D41\u6A21\u5F0F',
    summary: 'query() \u5168\u94FE\u8DEF\u4F7F\u7528 async generator \u5B9E\u73B0\u6D41\u5F0F\u6D88\u606F\u4F20\u9012\u548C\u80CC\u538B\u63A7\u5236\uFF0C\u4F18\u96C5\u5904\u7406\u957F\u5BF9\u8BDD\u6D41\u3002',
    description:
      '\u6838\u5FC3\u5BF9\u8BDD\u5FAA\u73AF query.ts\uFF0868KB\uFF09\u7684 query() \u51FD\u6570\u662F\u4E00\u4E2A\u5DE8\u5927\u7684 async generator\u2014\u2014\u4F7F\u7528 yield* \u9010\u6B65\u4EA7\u51FA\u6D88\u606F\u4E8B\u4EF6\uFF08text_delta\u3001tool_use\u3001tool_result\uFF09\uFF0C\u8C03\u7528\u65B9\u901A\u8FC7 for-await-of \u6D88\u8D39\u3002\u8FD9\u79CD\u8BBE\u8BA1\u5929\u7136\u5B9E\u73B0\u4E86\u80CC\u538B\u63A7\u5236\uFF08backpressure\uFF09\uFF1A\u5F53\u4E0B\u6E38\u5904\u7406\u901F\u5EA6\u8DDF\u4E0D\u4E0A API \u54CD\u5E94\u901F\u5EA6\u65F6\uFF0Cgenerator \u81EA\u52A8\u6682\u505C\u4EA7\u51FA\u7B49\u5F85\u6D88\u8D39\u3002\u540C\u65F6\u652F\u6301\u63D0\u524D\u4E2D\u65AD\u2014\u2014\u8C03\u7528\u65B9\u8C03\u7528 generator.return() \u5373\u53EF\u7EC8\u6B62\u5BF9\u8BDD\u5FAA\u73AF\uFF0C\u8D44\u6E90\u81EA\u52A8\u6E05\u7406\u3002\u6574\u4E2A REPL \u7684\u4E3B\u5FAA\u73AF\u4E5F\u662F async generator\uFF0C\u5F62\u6210\u4E86\u4ECE API \u54CD\u5E94\u5230\u7EC8\u7AEF\u6E32\u67D3\u7684\u5B8C\u6574\u6D41\u5F0F\u7BA1\u9053\u3002',
    code: `// query.ts \u2014 \u6838\u5FC3\u5BF9\u8BDD\u5FAA\u73AF\uFF08\u7B80\u5316\u7248\uFF09
async function* query(
  messages: Message[],
  tools: Tool[],
  signal: AbortSignal
): AsyncGenerator<StreamEvent> {
  // 1. \u6784\u5EFA\u8BF7\u6C42\u5E76\u53D1\u9001\u7ED9 API
  const stream = await apiClient.messages.create({
    model: config.model,
    messages,
    tools: tools.map(t => t.toSchema()),
    stream: true,
  })

  // 2. \u9010 chunk \u4EA7\u51FA\u6D41\u5F0F\u4E8B\u4EF6
  for await (const chunk of stream) {
    if (signal.aborted) return

    if (chunk.type === 'content_block_delta') {
      yield { type: 'text_delta', text: chunk.delta.text }
    }

    if (chunk.type === 'content_block_stop'
        && chunk.content_block.type === 'tool_use') {
      // 3. \u5DE5\u5177\u8C03\u7528\uFF1A\u6267\u884C\u5E76\u4EA7\u51FA\u7ED3\u679C
      const tool = findTool(chunk.content_block.name)
      const result = await tool.execute(chunk.content_block.input)
      yield { type: 'tool_result', id: chunk.content_block.id, result }

      // 4. \u9012\u5F52\uFF1A\u5E26\u5DE5\u5177\u7ED3\u679C\u7EE7\u7EED\u5BF9\u8BDD
      yield* query([...messages, assistantMsg, toolResultMsg], tools, signal)
    }
  }
}

// REPL \u6D88\u8D39\u7AEF
for await (const event of query(messages, tools, controller.signal)) {
  switch (event.type) {
    case 'text_delta': renderText(event.text); break
    case 'tool_result': renderToolResult(event.result); break
  }
}`,
  },
  {
    emoji: '\u{1F4E6}',
    category: '\u67B6\u6784',
    categoryColor: '#4f46e5',
    categoryBg: '#eef2ff',
    accentColor: '#4f46e5',
    title: '\u6CE8\u518C\u8868\u6A21\u5F0F',
    summary: 'tools.ts / commands.ts / tasks.ts \u7EDF\u4E00\u6CE8\u518C\u8868\uFF0C\u96C6\u4E2D\u7BA1\u7406\u6240\u6709\u53EF\u6269\u5C55\u7EC4\u4EF6\u7684\u5143\u6570\u636E\u4E0E\u5B9E\u73B0\u3002',
    description:
      '\u6CE8\u518C\u8868\u6A21\u5F0F\uFF08Registry Pattern\uFF09\u662F Claude Code \u4E2D\u4F7F\u7528\u6700\u5E7F\u6CDB\u7684\u67B6\u6784\u6A21\u5F0F\u3002\u5DE5\u5177\u6CE8\u518C\u8868 tools.ts\uFF0817KB\uFF09\u7EF4\u62A4\u4E00\u4E2A Map<string, Tool>\uFF0C\u6240\u6709 40+ \u5DE5\u5177\u5728\u542F\u52A8\u65F6\u901A\u8FC7 registerTool() \u6CE8\u518C\u3002\u547D\u4EE4\u6CE8\u518C\u8868 commands.ts\uFF0825KB\uFF09\u7BA1\u7406 80+ \u659C\u6760\u547D\u4EE4\u3002\u4EFB\u52A1\u6CE8\u518C\u8868 tasks.ts \u7BA1\u7406\u540E\u53F0\u4EFB\u52A1\u5B9A\u4E49\u3002\u6CE8\u518C\u8868\u63D0\u4F9B\u7EDF\u4E00\u7684 CRUD \u63A5\u53E3\uFF1Aregister()\u3001get()\u3001list()\u3001has()\u3002\u8FD0\u884C\u65F6\u901A\u8FC7\u540D\u79F0\u67E5\u627E\u5373\u53EF\u83B7\u53D6\u5B8C\u6574\u7684\u5B9E\u4F8B\u3002\u8FD9\u79CD\u6A21\u5F0F\u7684\u6838\u5FC3\u4F18\u52BF\u662F O(1) \u67E5\u627E\u6027\u80FD\u548C\u96C6\u4E2D\u5316\u7684\u751F\u547D\u5468\u671F\u7BA1\u7406\u3002',
    code: `// tools.ts \u2014 \u5DE5\u5177\u6CE8\u518C\u8868
const toolRegistry = new Map<string, Tool>()

function registerTool(tool: Tool): void {
  if (toolRegistry.has(tool.name)) {
    throw new Error('Duplicate tool: ' + tool.name)
  }
  toolRegistry.set(tool.name, tool)
}

function getTool(name: string): Tool | undefined {
  return toolRegistry.get(name)
}

function listTools(): Tool[] {
  return Array.from(toolRegistry.values())
}

// \u6CE8\u518C\u793A\u4F8B
registerTool(new FileReadTool())
registerTool(new FileWriteTool())
registerTool(new BashTool())
registerTool(new GrepTool())
// ... 40+ \u5DE5\u5177

// commands.ts \u2014 \u547D\u4EE4\u6CE8\u518C\u8868\uFF08\u540C\u6837\u6A21\u5F0F\uFF09
const commandRegistry = new Map<string, Command>()

function registerCommand(cmd: Command): void {
  commandRegistry.set(cmd.name, cmd)
}

registerCommand({
  name: 'commit',
  description: '\u667A\u80FD\u63D0\u4EA4',
  args: z.object({ scope: z.string().optional() }),
  execute: async (args) => { /* ... */ },
})`,
  },
  {
    emoji: '\u{1F6A9}',
    category: '\u53D1\u5E03',
    categoryColor: '#d97706',
    categoryBg: '#fffbeb',
    accentColor: '#d97706',
    title: 'Feature Flag \u95E8\u63A7',
    summary: 'bun:bundle \u7279\u6027\u6807\u5FD7 + \u6B7B\u4EE3\u7801\u6D88\u9664\uFF0C\u8FD0\u884C\u65F6\u96F6\u5F00\u9500\u5207\u6362\u529F\u80FD\u6A21\u5757\u3002',
    description:
      'Claude Code \u4F7F\u7528\u53CC\u5C42 Feature Flag \u673A\u5236\u5B9E\u73B0\u96F6\u5F00\u9500\u7684\u529F\u80FD\u5207\u6362\u3002\u7B2C\u4E00\u5C42\u662F\u7F16\u8BD1\u65F6\u6807\u5FD7\uFF1A\u5728 bun build \u914D\u7F6E\u4E2D\u901A\u8FC7 define \u5C06 Flag \u503C\u6CE8\u5165\u4E3A\u5E38\u91CF\uFF0CBun bundler \u5728 tree-shaking \u9636\u6BB5\u5BF9 if (__FEATURE_X__) \u5206\u652F\u8FDB\u884C\u6B7B\u4EE3\u7801\u6D88\u9664\u3002\u7B2C\u4E8C\u5C42\u662F\u8FD0\u884C\u65F6\u6807\u5FD7\uFF1A\u901A\u8FC7 GrowthBook SDK \u52A8\u6001\u8BC4\u4F30\uFF0C\u652F\u6301\u7070\u5EA6\u53D1\u5E03\u548C A/B \u6D4B\u8BD5\u3002\u8FD9\u79CD\u53CC\u5C42\u8BBE\u8BA1\u517C\u987E\u4E86\u5305\u4F53\u79EF\u4F18\u5316\u548C\u7070\u5EA6\u53D1\u5E03\u7684\u7075\u6D3B\u6027\u3002',
    code: `// build.ts \u2014 \u7F16\u8BD1\u65F6 Feature Flag \u6CE8\u5165
await Bun.build({
  entrypoints: ['./src/main.tsx'],
  define: {
    '__FEATURE_KAIROS__': 'true',
    '__FEATURE_VOICE__': 'false',  // \u7F16\u8BD1\u540E\u5B8C\u5168\u79FB\u9664
    '__FEATURE_DAEMON__': 'true',
  },
})

// \u4E1A\u52A1\u4EE3\u7801\u4E2D\u4F7F\u7528
declare const __FEATURE_KAIROS__: boolean
declare const __FEATURE_VOICE__: boolean

if (__FEATURE_KAIROS__) {
  // \u6B64\u5206\u652F\u5728\u7F16\u8BD1\u540E\u4FDD\u7559
  const kairos = await import('./kairos-engine')
  kairos.enableExtendedThinking()
}

if (__FEATURE_VOICE__) {
  // \u6B64\u5206\u652F\u88AB DCE \u5B8C\u5168\u79FB\u9664\uFF0C\u5305\u62EC import
  const voice = await import('./voice-input')
  voice.startListening()
}

// \u8FD0\u884C\u65F6\u7070\u5EA6\u8BC4\u4F30\uFF08GrowthBook SDK\uFF09
const gb = new GrowthBook({ apiHost, clientKey })
await gb.loadFeatures()

if (gb.isOn('proactive-suggestions')) {
  enableProactiveSuggestions()
}`,
  },
  {
    emoji: '\u{1F512}',
    category: '\u5B89\u5168',
    categoryColor: '#dc2626',
    categoryBg: '#fef2f2',
    accentColor: '#dc2626',
    title: 'Fail-Closed \u5B89\u5168\u6A21\u5F0F',
    summary: 'buildTool() \u9ED8\u8BA4 isConcurrencySafe=false, isReadOnly=false\uFF0C\u672A\u58F0\u660E\u5373\u62D2\u7EDD\u3002',
    description:
      'Fail-Closed\uFF08\u9ED8\u8BA4\u62D2\u7EDD\uFF09\u662F Claude Code \u5B89\u5168\u6A21\u578B\u7684\u57FA\u77F3\u539F\u5219\u3002\u5728\u5DE5\u5177\u7CFB\u7EDF\u4E2D\u4F53\u73B0\u4E3A\uFF1A\u6240\u6709\u5B89\u5168\u76F8\u5173\u7684\u5C5E\u6027\u90FD\u9ED8\u8BA4\u4E3A\u201C\u4E0D\u5B89\u5168\u201D\u72B6\u6001\u2014\u2014isConcurrencySafe \u9ED8\u8BA4 false\u3001isReadOnly \u9ED8\u8BA4 false\u3001isDestructive \u9ED8\u8BA4 true\u3002\u5DE5\u5177\u5F00\u53D1\u8005\u5FC5\u987B\u663E\u5F0F\u58F0\u660E\u5B89\u5168\u5C5E\u6027\u624D\u80FD\u83B7\u5F97\u66F4\u5BBD\u677E\u7684\u6743\u9650\u3002\u6743\u9650\u7CFB\u7EDF\u540C\u6837\u9075\u5FAA\u6B64\u539F\u5219\u2014\u2014\u672A\u77E5\u7684\u6743\u9650\u8BF7\u6C42\u9ED8\u8BA4\u62D2\u7EDD\uFF0C\u8D85\u65F6\u672A\u54CD\u5E94\u7684\u786E\u8BA4\u5BF9\u8BDD\u6846\u9ED8\u8BA4\u62D2\u7EDD\u3002',
    code: `// Tool.ts \u2014 Fail-Closed \u9ED8\u8BA4\u503C
interface ToolMetadata {
  isReadOnly: boolean      // \u9ED8\u8BA4 false \u2192 \u89C6\u4E3A\u5199\u64CD\u4F5C
  isDestructive: boolean   // \u9ED8\u8BA4 false \u2192 \u4F46\u6743\u9650\u68C0\u67E5\u65F6\u7B49\u540C\u4E8E true
  isConcurrencySafe: boolean // \u9ED8\u8BA4 false \u2192 \u4E0D\u5141\u8BB8\u5E76\u53D1
  needsPermissions: string[] // \u9ED8\u8BA4 [] \u2192 \u4F46\u975E\u53EA\u8BFB\u5DE5\u5177\u4ECD\u9700\u786E\u8BA4
}

function buildTool(config: Partial<ToolMetadata>): ToolMetadata {
  return {
    isReadOnly: false,           // fail-closed: \u9ED8\u8BA4\u4E0D\u662F\u53EA\u8BFB
    isDestructive: false,
    isConcurrencySafe: false,    // fail-closed: \u9ED8\u8BA4\u4E0D\u5141\u8BB8\u5E76\u53D1
    needsPermissions: [],
    ...config,                   // \u5F00\u53D1\u8005\u663E\u5F0F\u8986\u76D6
  }
}

// \u5B89\u5168\u68C0\u67E5\u793A\u4F8B
function canRunConcurrently(tool: Tool): boolean {
  // \u53CC\u91CD\u68C0\u67E5\uFF1A\u5FC5\u987B\u540C\u65F6\u58F0\u660E\u5E76\u53D1\u5B89\u5168 AND \u53EA\u8BFB
  return tool.metadata.isConcurrencySafe && tool.metadata.isReadOnly
}

// \u6743\u9650\u786E\u8BA4\u8D85\u65F6 \u2192 \u9ED8\u8BA4\u62D2\u7EDD
async function requestPermission(tool: Tool): Promise<boolean> {
  const timer = setTimeout(() => resolve(false), 30_000)
  const allowed = await showConfirmDialog(tool)
  clearTimeout(timer)
  return allowed
}`,
  },
  {
    emoji: '\u{1F4BE}',
    category: '\u6027\u80FD',
    categoryColor: '#059669',
    categoryBg: '#ecfdf5',
    accentColor: '#059669',
    title: 'Memoize \u7F13\u5B58\u6A21\u5F0F',
    summary: 'lodash-es/memoize \u7F13\u5B58\u6602\u8D35\u8BA1\u7B97\u7ED3\u679C\uFF0C\u907F\u514D\u91CD\u590D\u6267\u884C\u9AD8\u5F00\u9500\u64CD\u4F5C\u3002',
    description:
      'Memoize\uFF08\u8BB0\u5FC6\u5316\uFF09\u6A21\u5F0F\u5728 Claude Code \u4E2D\u5E7F\u6CDB\u7528\u4E8E\u7F13\u5B58\u6602\u8D35\u7684\u8BA1\u7B97\u548C I/O \u7ED3\u679C\u3002\u5178\u578B\u5E94\u7528\u573A\u666F\u5305\u62EC\uFF1A(1) Git \u72B6\u6001\u67E5\u8BE2\u7F13\u5B58\uFF1B(2) \u6587\u4EF6\u5185\u5BB9\u7F13\u5B58\uFF1B(3) \u5DE5\u5177 Schema \u751F\u6210\u7F13\u5B58\uFF1B(4) \u914D\u7F6E\u89E3\u6790\u7F13\u5B58\u3002\u7F13\u5B58\u7B56\u7565\u4E3B\u8981\u4F7F\u7528 lodash-es \u7684 memoize \u51FD\u6570\uFF0C\u4EE5\u53C2\u6570\u7684 JSON \u5E8F\u5217\u5316\u503C\u4F5C\u4E3A\u7F13\u5B58\u952E\u3002\u5BF9\u4E8E\u9700\u8981\u5931\u6548\u7684\u573A\u666F\uFF0C\u901A\u8FC7 memoize.cache.clear() \u624B\u52A8\u6E05\u9664\u3002',
    code: `// \u4F7F\u7528 lodash-es memoize \u7F13\u5B58\u6602\u8D35\u8BA1\u7B97
import { memoize } from 'lodash-es'

// 1. Git \u72B6\u6001\u7F13\u5B58
const getGitStatus = memoize(async (cwd: string) => {
  const result = await exec('git status --porcelain', { cwd })
  return parseGitStatus(result.stdout)
})

// 2. \u5DE5\u5177 Schema \u7F13\u5B58
const getToolSchema = memoize((tool: Tool) => {
  return zodToJsonSchema(tool.inputSchema)
}, (tool) => tool.name)

// 3. \u914D\u7F6E\u89E3\u6790\u7F13\u5B58
const getResolvedConfig = memoize(() => {
  const global = loadJson('~/.claude/config.json')
  const project = loadJson('.claude/config.json')
  const merged = deepMerge(global, project)
  return Object.freeze(merged)
})

// 4. \u6587\u4EF6\u5185\u5BB9\u7F13\u5B58\uFF08\u5E26\u624B\u52A8\u5931\u6548\uFF09
const readFileCache = memoize(async (path: string) => {
  return await fs.readFile(path, 'utf-8')
})

function onFileChange(path: string) {
  readFileCache.cache.delete(path)
}`,
  },
  {
    emoji: '\u{1F4E6}',
    category: '\u6027\u80FD',
    categoryColor: '#059669',
    categoryBg: '#ecfdf5',
    accentColor: '#059669',
    title: '\u52A8\u6001\u5BFC\u5165\u5EF6\u8FDF\u52A0\u8F7D',
    summary: 'dialogLaunchers.tsx \u901A\u8FC7 import() \u6309\u9700\u52A0\u8F7D\u5BF9\u8BDD\u6846\uFF0C\u51CF\u5C0F\u521D\u59CB\u5305\u4F53\u79EF\u3002',
    description:
      '\u52A8\u6001\u5BFC\u5165\uFF08Dynamic Import\uFF09\u6A21\u5F0F\u901A\u8FC7 ES Module \u7684 import() \u8868\u8FBE\u5F0F\u5B9E\u73B0\u6309\u9700\u52A0\u8F7D\u3002dialogLaunchers.tsx\uFF0822KB\uFF09\u662F\u6700\u5178\u578B\u7684\u5E94\u7528\u2014\u2014\u6240\u6709\u5BF9\u8BDD\u6846\u7EC4\u4EF6\u90FD\u4E0D\u5728\u542F\u52A8\u65F6\u52A0\u8F7D\uFF0C\u800C\u662F\u5728\u7528\u6237\u9996\u6B21\u89E6\u53D1\u65F6\u624D\u901A\u8FC7 import() \u52A8\u6001\u52A0\u8F7D\u3002\u8FD9\u79CD\u7B56\u7565\u5C06\u51B7\u542F\u52A8\u65F6\u95F4\u51CF\u5C11\u4E86\u7EA6 200ms\u3002\u5176\u4ED6\u5E94\u7528\u573A\u666F\u5305\u62EC\u659C\u6760\u547D\u4EE4\u7684 handler \u6309\u9700\u52A0\u8F7D\u3001MCP \u5DE5\u5177\u9002\u914D\u5668\u52A8\u6001\u52A0\u8F7D\u7B49\u3002',
    code: `// dialogLaunchers.tsx \u2014 \u5BF9\u8BDD\u6846\u61D2\u52A0\u8F7D
export async function showTrustDialog(): Promise<boolean> {
  const { TrustDialog } = await import('./dialogs/TrustDialog')
  return renderDialog(TrustDialog)
}

export async function showApiKeyInput(): Promise<string | null> {
  const { ApiKeyDialog } = await import('./dialogs/ApiKeyDialog')
  return renderDialog(ApiKeyDialog)
}

export async function showPermissionConfirm(
  tool: Tool
): Promise<PermissionDecision> {
  const { PermissionDialog } = await import('./dialogs/PermissionDialog')
  return renderDialog(PermissionDialog, { tool })
}

// commands.ts \u2014 \u547D\u4EE4 handler \u6309\u9700\u52A0\u8F7D
registerCommand({
  name: 'review',
  description: '\u4EE3\u7801\u5BA1\u67E5',
  execute: async (args) => {
    const { executeReview } = await import('./handlers/review')
    return executeReview(args)
  },
})

// \u6761\u4EF6\u52A0\u8F7D\u793A\u4F8B
if (__FEATURE_VOICE__) {
  const startVoice = async () => {
    const { VoiceInput } = await import('./voice/VoiceInput')
    return new VoiceInput()
  }
}`,
  },
  {
    emoji: '\u26A1',
    category: '\u6027\u80FD',
    categoryColor: '#059669',
    categoryBg: '#ecfdf5',
    accentColor: '#059669',
    title: '\u5E76\u884C\u9884\u53D6\u6A21\u5F0F',
    summary: 'main.tsx \u4E2D setup / commands / agentDefs \u5E76\u884C\u52A0\u8F7D\uFF0C\u6700\u5927\u5316\u542F\u52A8\u901F\u5EA6\u3002',
    description:
      '\u5E76\u884C\u9884\u53D6\uFF08Parallel Prefetch\uFF09\u6A21\u5F0F\u5229\u7528 Promise.all() \u5C06\u542F\u52A8\u5E8F\u5217\u4E2D\u76F8\u4E92\u72EC\u7ACB\u7684\u521D\u59CB\u5316\u4EFB\u52A1\u4ECE\u4E32\u884C\u6539\u4E3A\u5E76\u884C\u6267\u884C\u3002main.tsx \u7684\u542F\u52A8\u7F16\u6392\u4E2D\uFF0C\u5E76\u884C\u542F\u52A8\u4E09\u7EC4\u72EC\u7ACB\u4EFB\u52A1\uFF1Asetup()\u3001loadCommands()\u3001loadAgentDefinitions()\u3002\u8FD9\u4E09\u7EC4\u4EFB\u52A1\u4E4B\u95F4\u65E0\u6570\u636E\u4F9D\u8D56\uFF0C\u5E76\u884C\u6267\u884C\u5C06\u542F\u52A8\u65F6\u95F4\u4ECE\u7EA6 850ms \u538B\u7F29\u5230\u7EA6 350ms\u3002\u7C7B\u4F3C\u7684\u5E76\u884C\u6A21\u5F0F\u4E5F\u5E94\u7528\u4E8E MCP \u670D\u52A1\u5668\u7684\u6279\u91CF\u542F\u52A8\u3002',
    code: `// main.tsx \u2014 \u542F\u52A8\u5E8F\u5217\u5E76\u884C\u5316
async function bootstrap() {
  // \u9636\u6BB5 1: \u4E32\u884C\u7684\u524D\u7F6E\u6B65\u9AA4
  const cliArgs = parseArguments(process.argv)
  const env = await detectEnvironment()

  // \u9636\u6BB5 2: \u5E76\u884C\u52A0\u8F7D\u65E0\u4F9D\u8D56\u7684\u6A21\u5757
  const [setupResult, commands, agentDefs] = await Promise.all([
    setup(cliArgs, env),
    loadCommands(),
    loadAgentDefinitions(),
  ])
  // \u603B\u8017\u65F6: ~200ms\uFF08\u800C\u975E 330ms \u4E32\u884C\uFF09

  // \u9636\u6BB5 3: MCP \u670D\u52A1\u5668\u5E76\u884C\u542F\u52A8
  const mcpConfigs = setupResult.config.mcpServers
  const mcpResults = await Promise.allSettled(
    mcpConfigs.map(cfg => startMCPServer(cfg))
  )

  for (const r of mcpResults) {
    if (r.status === 'rejected') {
      log.warn('MCP server failed:', r.reason)
    }
  }

  // \u9636\u6BB5 4: \u542F\u52A8 REPL \u6216\u6267\u884C headless \u4EFB\u52A1
  if (cliArgs.print) {
    await runHeadless(setupResult, commands)
  } else {
    await startREPL(setupResult, commands, agentDefs)
  }
}`,
  },
  {
    emoji: '\u{1F500}',
    category: '\u67B6\u6784',
    categoryColor: '#4f46e5',
    categoryBg: '#eef2ff',
    accentColor: '#4f46e5',
    title: '\u53CC\u6A21\u5F0F\u8FD0\u884C',
    summary: 'REPL \u4EA4\u4E92\u5F0F + headless/SDK (--print)\uFF0C\u540C\u4E00\u6838\u5FC3\u9002\u914D\u4E24\u79CD\u4F7F\u7528\u573A\u666F\u3002',
    description:
      '\u53CC\u6A21\u5F0F\u8FD0\u884C\uFF08Dual-Mode\uFF09\u662F Claude Code \u7684\u9876\u5C42\u67B6\u6784\u6A21\u5F0F\u2014\u2014\u540C\u4E00\u5957\u6838\u5FC3\u4EE3\u7801\u540C\u65F6\u652F\u6301\u4E24\u79CD\u8FD0\u884C\u65B9\u5F0F\u3002\u4EA4\u4E92\u6A21\u5F0F\uFF08REPL\uFF09\u901A\u8FC7 Ink \u6E32\u67D3\u5BCC\u6587\u672C\u7EC8\u7AEF\u754C\u9762\u3002Headless \u6A21\u5F0F\uFF08--print / SDK\uFF09\u4E0D\u542F\u52A8\u4EFB\u4F55\u7EC8\u7AEF UI\uFF0C\u76F4\u63A5\u5C06\u67E5\u8BE2\u7ED3\u679C\u8F93\u51FA\u5230 stdout\u3002\u4E24\u79CD\u6A21\u5F0F\u5171\u4EAB\u6838\u5FC3\u7684 QueryEngine \u548C\u5DE5\u5177\u6CE8\u518C\u8868\uFF0C\u5DEE\u5F02\u4EC5\u5728 I/O \u5C42\u3002\u6743\u9650\u7CFB\u7EDF\u5728 headless \u6A21\u5F0F\u4E0B\u9ED8\u8BA4\u5207\u6362\u4E3A bypassPermissions\u3002',
    code: `// main.tsx \u2014 \u53CC\u6A21\u5F0F\u5206\u652F
async function main() {
  const args = parseArguments(process.argv)

  // \u5171\u4EAB\u6838\u5FC3\u521D\u59CB\u5316
  const config = await loadConfig()
  const tools = registerAllTools()
  const queryEngine = new QueryEngine(config, tools)

  if (args.print) {
    // \u2500\u2500\u2500 Headless \u6A21\u5F0F \u2500\u2500\u2500
    const permMode = args.permissionMode ?? 'bypassPermissions'
    queryEngine.setPermissionMode(permMode)

    const result = await queryEngine.runOnce(args.print)
    process.stdout.write(result.text)
    process.exit(result.exitCode)

  } else {
    // \u2500\u2500\u2500 \u4EA4\u4E92\u6A21\u5F0F\uFF08REPL\uFF09\u2500\u2500\u2500
    const { render } = await import('ink')
    const { App } = await import('./components/App')

    render(
      <App
        queryEngine={queryEngine}
        config={config}
        initialPrompt={args.prompt}
      />
    )
  }
}

// SDK \u8C03\u7528\u793A\u4F8B
import { claude } from '@anthropic-ai/claude-code'

const result = await claude({
  prompt: '\u5206\u6790 src/ \u76EE\u5F55\u7684\u67B6\u6784',
  tools: ['FileReadTool', 'GrepTool'],
  permissionMode: 'bypassPermissions',
})
console.log(result.text)`,
  },
]

/* ================================================================== */
/*  Pattern Card Component                                             */
/* ================================================================== */

function PatternCard({ pattern, index }: { pattern: PatternData; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      style={{
        flex: 'none',
        width: '100%',
        cursor: 'pointer',
        background: '#ffffff',
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        borderTop: `3px solid ${pattern.accentColor}`,
        padding: '20px 22px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={() => setExpanded(e => !e)}
      whileHover={{
        boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
        y: -1,
      }}
      layout
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: '1.3rem' }}>{pattern.emoji}</span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem',
          fontWeight: 600,
          color: pattern.categoryColor,
          background: pattern.categoryBg,
          padding: '2px 10px',
          borderRadius: 4,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {pattern.category}
        </span>
        <span style={{
          marginLeft: 'auto',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem',
          color: '#94a3b8',
        }}>
          #{String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Title & Summary */}
      <h3 style={{
        fontSize: '1rem',
        fontWeight: 600,
        marginBottom: 8,
        color: '#0f172a',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        {pattern.title}
      </h3>
      <p style={{
        fontSize: '0.82rem',
        color: '#475569',
        lineHeight: 1.6,
        margin: 0,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        {pattern.summary}
      </p>

      {/* Expand hint */}
      <div style={{
        marginTop: 10,
        fontSize: '0.72rem',
        color: '#94a3b8',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {expanded ? '\u25BE \u6536\u8D77\u8BE6\u60C5' : '\u25B8 \u70B9\u51FB\u5C55\u5F00\u8BE6\u60C5\u4E0E\u4F2A\u4EE3\u7801'}
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid #e2e8f0',
            }}>
              {/* Description */}
              <p style={{
                fontSize: '0.82rem',
                color: '#475569',
                lineHeight: 1.75,
                marginBottom: 16,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}>
                {pattern.description}
              </p>

              {/* Code block */}
              <div style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                padding: '16px 20px',
                overflow: 'auto',
                maxHeight: 480,
              }}>
                <pre
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.75rem',
                    lineHeight: 1.7,
                    margin: 0,
                    color: '#e2e8f0',
                    whiteSpace: 'pre',
                    tabSize: 2,
                  }}
                  dangerouslySetInnerHTML={{ __html: highlightCode(pattern.code) }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export default function Patterns() {
  return (
    <section id="patterns" style={{
      padding: '80px 24px',
      maxWidth: 1100,
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
          06 / Patterns
        </span>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#0f172a',
          margin: '12px 0 16px',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          \u8BBE\u8BA1\u6A21\u5F0F
        </h2>
        <p style={{
          fontSize: '1rem',
          color: '#475569',
          maxWidth: 650,
          margin: '0 auto',
          lineHeight: 1.6,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          \u6E90\u7801\u4E2D\u53CD\u590D\u51FA\u73B0\u7684 8 \u4E2A\u6838\u5FC3\u5DE5\u7A0B\u6A21\u5F0F\u2014\u2014\u70B9\u51FB\u5361\u7247\u5C55\u5F00\u8BE6\u7EC6\u89E3\u6790\u4E0E\u4F2A\u4EE3\u7801
        </p>
      </div>

      {/* Responsive 2-column grid */}
      <style>{`
        .patterns-grid-2col {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 768px) {
          .patterns-grid-2col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="patterns-grid-2col">
        {patterns.map((p, i) => (
          <PatternCard key={i} pattern={p} index={i} />
        ))}
      </div>
    </section>
  )
}