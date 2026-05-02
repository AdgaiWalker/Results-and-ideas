# Walker 知识空间重构 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 Walker 博客从传统架构重构为以概念图谱为核心的个人知识空间

**Architecture:** 数据层（概念+内容集合）→ 页面层（概念页面+内容模板）→ 体验层（图谱可视化+动画+过渡）→ AI可读层（llms.txt+JSON-LD）

**Tech Stack:** Astro 6, Tailwind CSS v4, MDX, D3.js, Pretext, Pagefind, View Transitions API

---

## 前置说明

### 内容目录策略

所有内容保持在 `src/content/log/` 下，通过子目录组织类型，用一个 `log` 集合 + `type` 字段区分。不拆成多个集合。

```
src/content/
├── concepts/              # 独立集合：概念节点
│   ├── subtraction.md
│   ├── human-sovereignty.md
│   └── ...
└── log/                   # 单一集合：所有内容
    ├── articles/          # type: article
    │   ├── ai-design-workflow.mdx
    │   ├── code-and-philosophy.md
    │   ├── hello-walker.md
    │   ├── mountain-trip.md
    │   └── design-thinking.md
    ├── thoughts/          # type: thought
    │   └── a-thought.md
    ├── dialogues/         # type: dialogue
    │   └── dialogue-on-subtraction.mdx
    └── recipes/           # type: recipe
        └── cooking-pasta.md
```

glob pattern `'**/*.{md,mdx}'` 会递归匹配所有子目录，无需改动 loader。

### Obsidian 与站的关系

Obsidian vault 的根目录直接指向 `src/content/`。用户在 Obsidian 里编辑就是在编辑站的数据源。无需同步脚本。双向链接 `[[概念名]]` 在构建时解析。

### 对话格式兼容

同时支持两种对话格式：
- **旧格式**：MDX 中的 `<DialogueBubble>` 组件（向后兼容）
- **新格式**：Markdown callout `> [!human]` / `> [!ai]`（未来推荐）
- **DeepSeek 格式**：通过 `source` 字段的链接自动抓取解析

---

## Phase 1: 数据层重构（地基）

### Task 1: 概念集合 + 内容重组 + schema 更新

**Files:**
- Modify: `src/content.config.ts`
- Create: `src/content/concepts/` 目录及 8 个概念文件
- Move: 现有 8 篇内容按类型移入子目录
- Modify: 每篇内容的 frontmatter（添加 concepts 字段）

- [ ] **Step 1: 更新 content.config.ts**

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const concepts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/concepts' }),
  schema: z.object({
    title: z.string(),
    type: z.literal('concept'),
    symbol: z.string().optional(),
    domain: z.array(z.string()),
    related: z.array(z.string()).default([]),
    layer: z.number().min(1).max(5).optional(),
    status: z.enum(['active', 'archived', 'draft']).default('active'),
  }),
});

const log = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/log' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    type: z.enum([
      'article', 'photo', 'thought', 'project', 'dialogue',
      'recipe', 'video', 'audio', 'gallery', 'prompt',
    ]),
    published: z.boolean().default(true),
    cover: z.string().optional(),
    link: z.string().optional(),
    source: z.string().optional(),   // DeepSeek 等外部对话链接
    concepts: z.array(z.string()).default([]),
  }),
});

export const collections = { concepts, log };
```

注意：`link` 从 `z.string().url()` 改为 `z.string().optional()` 以避免空值验证问题。新增 `source` 字段（外部对话链接）和 `concepts` 字段。type 枚举扩展为全部类型。

- [ ] **Step 2: 创建概念目录和文件**

创建 `src/content/concepts/` 目录，放入以下概念文件：

5 个框架概念：
- `subtraction.md` — 做减法（layer: 5, symbol: −, related: [human-sovereignty, entropy-reduction]）
- `human-sovereignty.md` — 人类主权（layer: 1, symbol: ⊕, related: [entropy-reduction, worldview-pluralism]）
- `entropy-reduction.md` — 熵减命令（layer: 2, symbol: ↘, related: [worldview-pluralism]）
- `worldview-pluralism.md` — 多元世界观（layer: 3, symbol: ∥, related: [quantity-quality]）
- `quantity-quality.md` — 量变质变（layer: 4, symbol: ∞, related: [subtraction]）

3 个领域概念：
- `cooking.md` — 厨艺（domain: [生活], related: [subtraction]）
- `design.md` — 设计（domain: [创作], related: [subtraction, worldview-pluralism]）
- `tech.md` — 技术（domain: [技术], related: [human-sovereignty, subtraction]）

每个文件的具体 frontmatter 内容见设计文档 Section 4.2。

- [ ] **Step 3: 重组现有内容到子目录**

在 `src/content/log/` 下创建子目录并移动文件：

```
src/content/log/articles/
├── ai-design-workflow.mdx    (从 log/ 根目录移入)
├── code-and-philosophy.md
├── hello-walker.md
├── mountain-trip.md
└── design-thinking.md

src/content/log/thoughts/
└── a-thought.md

src/content/log/dialogues/
└── dialogue-on-subtraction.mdx

src/content/log/recipes/
└── cooking-pasta.md
```

移动后验证 glob pattern `'**/*.{md,mdx}'` 仍能匹配到所有文件。

- [ ] **Step 4: 为所有内容添加 concepts 字段**

为每篇内容的 frontmatter 添加 `concepts` 字段：

- `ai-design-workflow.mdx` → `concepts: [subtraction, human-sovereignty, entropy-reduction]`
- `dialogue-on-subtraction.mdx` → `concepts: [subtraction, human-sovereignty]`
- `code-and-philosophy.md` → `concepts: [subtraction, human-sovereignty]`
- `hello-walker.md` → `concepts: []`
- `mountain-trip.md` → `concepts: []`
- `cooking-pasta.md` → `concepts: [subtraction, cooking]`（type 改为 `recipe`）
- `design-thinking.md` → `concepts: [design, subtraction]`
- `a-thought.md` → `concepts: []`

同时更新 `cooking-pasta.md` 的 `type` 从 `article` 改为 `recipe`。

- [ ] **Step 5: 修复路径引用**

内容移入子目录后，MDX 文件中的组件 import 路径可能需要更新。检查 `ai-design-workflow.mdx` 和 `dialogue-on-subtraction.mdx` 中的 import 路径：

`dialogue-on-subtraction.mdx` 中：
```
import DialogueBubble from '../../components/DialogueBubble.astro';
```
移入 `dialogues/` 子目录后路径变为 `../../../components/DialogueBubble.astro`。同样检查 PromptBlock 路径。

`[...slug].astro` 中的 `getStaticPaths()` 使用 `entry.id`，glob loader 的 id 是基于 base 的相对路径（不含扩展名），移动后 id 会变成 `articles/hello-walker` 等。需要检查详情页路由是否匹配。

如果路由需要保持 `/log/hello-walker` 而非 `/log/articles/hello-walker`，有两个选择：
- **方案 A**：接受新路由（有子目录前缀）
- **方案 B**：在 `[...slug].astro` 中用 `slug` 参数去掉子目录前缀

建议用方案 A，新架构新路由。但需要更新 TraceCard 中的链接格式。

- [ ] **Step 6: 构建验证**

Run: `npx astro build`
Expected: 构建成功，所有页面正常生成，无 404

---

## Phase 2: 概念页面体系

### Task 2: 概念列表页 + 概念详情页

**Files:**
- Create: `src/pages/concept/index.astro`
- Create: `src/pages/concept/[id].astro`
- Create: `src/components/ConceptCard.astro`

- [ ] **Step 1: 创建概念列表页 `src/pages/concept/index.astro`**

展示所有 active 状态的概念，结构：
1. 页面标题「概念图谱」
2. 框架概念区域 — 五层逻辑按 layer 排序，带递进方向 ①→⑤，显示 symbol、标题、一句话定义
3. 领域概念区域 — 按 domain 分组显示
4. 每个概念显示：标题、定义摘要、关联内容数量
5. 点击进入概念详情页

- [ ] **Step 2: 创建概念详情页 `src/pages/concept/[id].astro`**

使用 `getStaticPaths()` + `entry.id` 生成每个概念的页面。注意：概念集合用 `entry.id`（不是 `entry.slug`，Astro 6 glob loader 没有 slug）。

```typescript
export async function getStaticPaths() {
  const concepts = await getCollection('concepts', ({ data }) => data.status === 'active');
  return concepts.map(concept => ({
    params: { id: concept.id },
    props: { concept },
  }));
}
```

页面需要获取两个集合的数据：
- 当前概念的定义和属性
- 所有 `concepts` 字段包含当前概念 id 的 log 内容（按 type 分组展示）

用 `render()` 函数渲染概念正文：`const { Content } = await render(concept);`

- [ ] **Step 3: 创建 ConceptCard 组件**

概念卡片组件，用于列表页和概念页面的关联概念区域。Props：title, symbol, domain, contentCount, id（用于链接）。显示概念标题、定义首句、symbol、关联内容数量。

- [ ] **Step 4: 构建验证**

Run: `npx astro build`
Expected: 新增 /concept/ 和 /concept/[id] 页面，可正常访问

---

### Task 3: 导航更新 + 框架页面

**Files:**
- Modify: `src/components/Navigation.astro`
- Create: `src/pages/framework.astro` — 五层逻辑专题页

- [ ] **Step 1: 更新导航项**

导航改为：
```typescript
const navItems = [
  { label: '港口', href: '/' },
  { label: '海域', href: '/log' },
  { label: '概念', href: '/concept' },
];
```

保留搜索按钮。

- [ ] **Step 2: 创建框架页面 `src/pages/framework.astro`**

五层逻辑的完整可视化页面（替代旧的指南针页面），展示：
1. 五层逻辑的连续递进流程图（①→②→③→④→⑤），每层有 symbol、名称、定义
2. 最后一层标注验证问题「你的工作更少了吗？」
3. 回溯箭头（验证不通过→回到对应层）
4. 每层链接到对应的概念详情页
5. 每层下方展示在实际内容中的体现（关联的内容链接）
6. 标签图谱保留（从现有 TagMap 组件迁移）

- [ ] **Step 3: 构建验证**

Run: `npx astro build`
验证导航正常，/framework 页面可访问

---

## Phase 3: 首页重构

### Task 4: 首页世界观 + D3.js 图谱

**前置：** `npm install d3 @types/d3`

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/components/KnowledgeGraph.astro`
- Create: `src/components/FiveLayerFlow.astro`
- Modify: `src/components/RecentTraces.astro`

- [ ] **Step 1: 安装 D3.js**

Run: `npm install d3 @types/d3`

- [ ] **Step 2: 创建知识图谱组件 `src/components/KnowledgeGraph.astro`**

使用 D3.js force-directed graph。数据从概念集合和关联关系生成，通过 `data-*` 属性传递给客户端脚本。

图谱数据结构：
```
nodes: [{ id, title, symbol, domain, layer, contentCount }]
links: [{ source, target }]
```

客户端脚本用 D3.js 创建 force simulation：
- 节点渲染为圆形光点，大小根据 contentCount 缩放
- 五层逻辑的节点（有 layer 属性）有金色光晕
- 连线为半透明发光线条
- 悬停显示 tooltip（概念名称 + 内容数量）
- 点击导航到 `/concept/[id]`
- 响应式：移动端简化布局

- [ ] **Step 3: 创建五层流程线组件 `src/components/FiveLayerFlow.astro`**

从概念集合中筛选有 layer 属性的概念，按 layer 排序，渲染为水平流程线：
- ① → ② → ③ → ④ → ⑤
- 每层：symbol + 名称 + 一句话
- 最后一层（⑤做减法）额外标注「验证：你的工作更少了吗？」
- 每层可点击，链接到概念详情页
- 整体用金色渐变线条连接

- [ ] **Step 4: 重构首页结构**

```astro
<Base title="Walker — 行过万里水路">
  <HeroVideo />
  <KnowledgeGraph />
  <FiveLayerFlow />
  <RecentTraces limit={3} />
  <HarborAbout />
  <script src="../scripts/scroll-fade.ts"></script>
</Base>
```

- [ ] **Step 5: 更新 RecentTraces**

增加 `limit` prop（默认 3），视觉上弱化。适配新的子目录结构（entry.id 现在包含子目录前缀）。

- [ ] **Step 6: 构建并浏览器验证**

Run: `npx astro build && npx astro preview`
验证：首页显示图谱、五层流程线、少量最新内容。图谱节点可点击。

---

## Phase 4: 内容格式差异化

### Task 5: 各内容类型独立模板

**Files:**
- Modify: `src/pages/log/[...slug].astro` — 根据 type 选择模板
- Create: `src/components/templates/ArticleTemplate.astro`
- Create: `src/components/templates/DialogueTemplate.astro`
- Create: `src/components/templates/RecipeTemplate.astro`
- Create: `src/components/templates/ThoughtTemplate.astro`
- Create: `src/components/templates/ProjectTemplate.astro`
- Create: `src/components/RelatedConcepts.astro` — 所有模板共用的关联概念区域

- [ ] **Step 1: 创建 RelatedConcepts 组件**

通用组件，显示内容关联的概念列表。Props：`concepts: string[]`。根据 id 从概念集合查找标题和 symbol，渲染为可点击的标签/链接。所有内容模板底部统一使用。

- [ ] **Step 2: 重构详情页为模板路由器**

`[...slug].astro` 根据 `entry.data.type` 动态选择模板组件。每个模板接收 `entry` 和 `Content` 作为 props。注意 `getStaticPaths()` 使用 `entry.id` 作为 slug 参数。

- [ ] **Step 3: 创建 ArticleTemplate**

保留现有排版（prose 样式），底部添加 `<RelatedConcepts>`。支持 MDX 组件（PromptBlock、DialogueBubble）。

- [ ] **Step 4: 创建 DialogueTemplate**

气泡对话模板：
- 兼容两种格式：MDX `<DialogueBubble>` 组件 + Markdown callout `> [!human]`/`> [!ai]`
- 对 callout 格式，在构建时用 remark/rehype 插件或 Astro 组件解析
- 底部：收获提炼区（如果正文有 `## 收获` section）
- 底部：原始对话链接（`source` 字段）
- 底部：`<RelatedConcepts>`

- [ ] **Step 5: 创建 RecipeTemplate**

食谱模板：
- 顶部：菜名 + 时间 + 食材列表（从 frontmatter 或正文解析）
- 中部：步骤（有序列表）
- 底部：思考区（链接到概念）+ `<RelatedConcepts>`

- [ ] **Step 6: 创建 ThoughtTemplate**

随想模板：极简，只有文字 + `<RelatedConcepts>`。或者 thought 类型在列表页直接读完，不生成独立详情页。

- [ ] **Step 7: 创建 ProjectTemplate**

项目模板：成果展示（图片/链接）+ 关键决策列表 + `<RelatedConcepts>`

- [ ] **Step 8: 构建验证**

Run: `npx astro build`
验证：article 用 ArticleTemplate、dialogue 用 DialogueTemplate、recipe 用 RecipeTemplate

---

### Task 6: DeepSeek 对话抓取和解析

**Files:**
- Create: `src/scripts/fetch-dialogue.ts` — 构建时脚本
- Modify: `src/content.config.ts` 或构建流程

- [ ] **Step 1: 调研 DeepSeek 分享页面的 HTML 结构**

访问一个 DeepSeek 分享链接，分析页面中对话内容的 DOM 结构。确定用户消息和 AI 消息的 CSS 选择器或数据结构。

如果分享页面是客户端渲染（SPA），可能需要用 Puppeteer 或检查其 API 端点。如果是服务端渲染，可以直接 fetch + HTML 解析。

- [ ] **Step 2: 编写对话抓取脚本**

创建 `src/scripts/fetch-dialogue.ts`：
- 输入：DeepSeek 分享链接 URL
- 输出：Markdown 格式的对话内容，用 `> [!human]` / `> [!ai]` callout 标记
- 错误处理：链接无效、网络超时、页面结构变化时的 fallback

- [ ] **Step 3: 集成到构建流程**

两种集成方式（根据调研结果选择）：

**方案 A：构建时抓取（推荐）**
- 在 `astro.config.mjs` 的 `astro:build:start` hook 中运行
- 扫描所有 dialogue 类型内容的 `source` 字段
- 抓取对话内容，存入缓存，构建时使用

**方案 B：手动运行**
- 作为独立脚本，在构建前手动运行
- 输出 Markdown 文件到 dialogues/ 目录
- 用户粘贴链接后运行一次 `npm run fetch-dialogues`

根据 DeepSeek 页面的可访问性决定。如果需要浏览器渲染，用方案 B。如果可以直接 fetch HTML，用方案 A。

- [ ] **Step 4: 构建验证**

创建一个测试 dialogue 文件（用现有 DeepSeek 链接），验证抓取→解析→渲染流程。

---

### Task 7: 提示词库独立页面

**Files:**
- Create: `src/pages/prompts.astro`
- Create: `src/components/PromptCard.astro`

- [ ] **Step 1: 创建提示词库页面**

独立页面 `/prompts`，展示所有 type 为 `prompt` 的内容 + 所有文章/对话中嵌入的 PromptBlock。

按概念分组，每个提示词显示：
- 标题
- 内容（可复制）
- 所属概念（链接）
- 适用场景
- 来源文章（链接）

- [ ] **Step 2: 创建 PromptCard 组件**

独立提示词卡片，比嵌入式的 PromptBlock 多显示场景说明和概念关联。

- [ ] **Step 3: 构建验证**

Run: `npx astro build`
验证 /prompts 页面可访问

---

## Phase 5: AI 可读层

**依赖：Phase 4 完成（需要知道内容页面的最终模板结构）**

### Task 8: llms.txt + JSON-LD

**Files:**
- Create: `public/llms.txt`
- Create: `src/components/JsonLd.astro` — 通用 JSON-LD 组件
- Modify: `src/layouts/Base.astro`
- Modify: `src/pages/concept/[id].astro`

- [ ] **Step 1: 创建 llms.txt**

在 `public/llms.txt` 创建 AI 说明书：

```markdown
# Walker — 个人知识空间

> AI 时代的个人知识空间。行船意象，五层逻辑，人机协作。

## 核心框架（五层逻辑）
1. 人类主权（/concept/human-sovereignty）— 人决策，AI 执行
2. 熵减命令（/concept/entropy-reduction）— 高熵→低熵
3. 多元世界观（/concept/worldview-pluralism）— 蓝图 vs 现实，偏差驱动
4. 量变质变（/concept/quantity-quality）— 积累→突破
5. 做减法（/concept/subtraction）— 验证：工作更少了吗？

## 内容领域
- 厨艺 /concept/cooking
- 设计 /concept/design
- 技术 /concept/tech

## 提示词
（构建时自动生成提示词列表）

## 概念页面
（构建时自动生成所有概念 URL）
```

- [ ] **Step 2: 创建 JsonLd 组件**

通用 JSON-LD 渲染组件，根据页面类型输出不同的结构化数据：

概念页面：
```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "做减法",
  "description": "如无必要，勿增实体",
  "url": "/concept/subtraction",
  "about": ["奥卡姆剃刀"],
  "relatedLink": ["/concept/human-sovereignty"]
}
```

内容页面：
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "AI 辅助设计的工作流",
  "datePublished": "2026-04-26",
  "about": ["/concept/subtraction", "/concept/human-sovereignty"]
}
```

- [ ] **Step 3: 在 Base layout 和概念页中集成 JSON-LD**

Base layout 接收 JSON-LD props，概念页面传递概念数据。

- [ ] **Step 4: 构建验证**

验证 `dist/llms.txt` 存在。检查页面 HTML 中的 `<script type="application/ld+json">` 标签内容正确。

---

## Phase 6: 交互升级

### Task 9: View Transitions + scroll-driven animations

**Files:**
- Modify: `src/layouts/Base.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: 启用 Astro View Transitions**

在 Base layout 中引入 `<ClientRouter />`（Astro 6 的 View Transitions 组件）。配置过渡动画样式，使页面切换有「航行」感——淡入淡出 + 轻微位移。

- [ ] **Step 2: 添加 scroll-driven animations**

在 `global.css` 中用 CSS scroll-driven animations：
- 首页：视频淡出 → 图谱浮现（`animation-timeline: scroll()`）
- 概念页面：关联内容列表渐显（`@keyframes` + `animation-timeline`）
- 五层流程线：逐步展开（`scroll()` 驱动进度）

注意：这些是渐进增强。不支持 scroll-driven animations 的浏览器直接显示最终状态，不影响内容可访问性。

- [ ] **Step 3: 构建并浏览器验证**

验证页面切换有过渡动画，滚动有叙事效果。在不支持的浏览器上确认内容仍然可读。

---

## Phase 7: Pretext 集成

### Task 10: Pretext 排版引擎

**前置：确认 Pretext 的正确 npm 包名**

**Files:**
- Install: pretext（确认包名后安装）
- Modify: 内容列表组件或 TraceCard

- [ ] **Step 1: 确认 Pretext npm 包名并安装**

检查 Cheng Lou 的 Pretext 项目的 npm 包名。根据之前搜索，包名可能是 `pretext`。Run: `npm search pretext` 确认，然后安装。

- [ ] **Step 2: 在内容卡片中集成 Pretext**

使用 Pretext 的 `prepare()` + `layout()` 预计算卡片文本高度。用计算出的高度替代 CSS columns 的自动布局，实现精确的瀑布流。

- [ ] **Step 3: 为虚拟滚动做准备**

创建内容列表的抽象层，将数据与渲染分离。未来内容增长到几百篇时，只需加入虚拟滚动组件（只渲染可见区域的 DOM），不需要重构数据层。

- [ ] **Step 4: 构建验证**

验证瀑布流布局精确，无高度计算错误。对比新旧布局的视觉效果。

---

## Phase 8: 清理和优化

### Task 11: 清理旧页面和组件

**Files:**
- Handle: `src/pages/compass.astro` → 重定向到 `/concept` 或 `/framework`
- Handle: `src/components/TagMap.astro` → 融入概念图谱或框架页面
- Handle: `src/components/TagFilter.astro` → 更新为支持概念过滤
- Remove: 不再使用的旧组件

- [ ] **Step 1: 处理指南针页面**

将 `/compass` 301 重定向到 `/concept` 或 `/framework`。在 `src/pages/compass.astro` 中用 `Astro.redirect()`。

- [ ] **Step 2: 更新标签过滤组件**

TagFilter 增加按概念过滤的能力。URL 参数支持 `?concept=subtraction` 和 `?tag=技术`。

- [ ] **Step 3: 迁移 TagMap 到框架页面**

将 TagMap 组件（标签频率可视化）融入 `/framework` 页面，作为五层逻辑下方的「兴趣星图」。

- [ ] **Step 4: 删除不再需要的旧文件**

清理：
- 旧的 `src/components/TraceCard.astro` 如果被新组件替代
- 任何不再引用的模板或样式

- [ ] **Step 5: 全站构建 + Pagefind 索引 + 最终验证**

Run: `npx astro build && npx pagefind --site dist --output-path dist/pagefind`

验证清单：
- [ ] 所有页面可访问，无 404
- [ ] 概念页面正确显示关联内容
- [ ] 内容模板按类型差异化渲染
- [ ] 知识图谱可交互
- [ ] 五层流程线有方向感
- [ ] 提示词库页面可复制
- [ ] llms.txt 存在且内容完整
- [ ] JSON-LD 在关键页面中存在
- [ ] Pagefind 搜索索引包含所有内容
- [ ] View Transitions 正常工作
- [ ] 移动端布局正常
- [ ] 导航链接正确

---

## 执行顺序和依赖关系

```
Phase 1 (数据层) ──────── 所有后续 Phase 的前提
    ↓
Phase 2 (概念页面) ──────── 依赖 Phase 1 的概念数据
    ↓
Phase 3 (首页) ──────── 依赖 Phase 1+2
    ↓
Phase 4 (内容模板+对话+提示词) ── 依赖 Phase 1 的 concepts 字段
    ↓  Task 5, 6, 7 可在 Phase 1 后并行
Phase 5 (AI 可读) ────── 依赖 Phase 4（需要最终模板结构）
    ↓
Phase 6 (交互) ──────── 依赖 Phase 3 的首页结构
    ↓
Phase 7 (Pretext) ────── 依赖 Phase 3-4（需要最终布局）
    ↓
Phase 8 (清理) ──────── 最后执行
```

Phase 4 内的 Task 5、6、7 可以并行执行（互相不依赖）。
Phase 6 和 Phase 7 可以并行执行。
