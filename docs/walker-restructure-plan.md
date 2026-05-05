# Walker 博客重构方案

## Context

Walker 博客当前有 3 个页面（首页、日志、指南针），8 篇内容，扁平标签无维度筛选，无法有效浏览和发现内容。用户需要将博客重构为"内容承载库 + 个人品牌站"，核心主题是 AI，双域框架为 AI 生活（源）→ AI 探索（升华）。参考了 lvyovo-wiki（可探索的个人空间）和 HylaruCoder（清晰的内容中枢）的设计审计。

## 目标架构

```
/          内容仪表盘（双域入口 + 最新内容 + 动态）
/log       日志（三维筛选：视角 × 形态 × 主题）
/ideas     Idea 留言板（公开备忘录 + 协作看板）
/dock      补给舱（Skills / 工具 / 信息源）
/works     跨平台作品（B 站 / 抖音 / 小红书 / 知乎）
/compass   指南针（核心理论 + 标签云）
/about     关于我（现首页内容 + 社交平台 + 联系方式）
```

导航：首页 | 日志 | Ideas | 补给舱 | 指南针 | 关于

## 内容创作工作流

```
方式 1（主力）：Obsidian 写 .md → Templater 模板自动填充 frontmatter → Obsidian Git 自动 push → Vercel 自动构建
方式 2（备用）：网站 /keystatic 在线编辑 → 自动 commit → Vercel 自动构建
```

两种方式改的是同一批 `.md` 文件，互不冲突。

## 多媒体渲染规则

用 Markdown 原生语法控制是否渲染为富媒体：

| 写法 | 效果 |
|---|---|
| `https://bilibili.com/video/BV1xxx` | 普通链接，点击跳转 |
| `![](https://bilibili.com/video/BV1xxx)` | 渲染为视频播放器 |
| `https://github.com/xxx/tool` | 普通链接 |
| `![](https://github.com/xxx/tool)` | 渲染为仓库信息卡 |
| `https://example.com/audio.mp3` | 普通链接 |
| `![](https://example.com/audio.mp3)` | 渲染为音频播放器 |
| `![](https://example.com/image.jpg)` | 图片（Markdown 原生） |

实现方式：Astro remark 插件，构建时识别 `![]()` 中的已知域名 URL，替换为对应 HTML 组件。全部用 `.md`，不需要 `.mdx`。

---

## 优先级拆解

### P0 — 核心骨架（必须先做，其他都依赖它）

**1. 数据模型更新**
- 修改 `src/content.config.ts`
  - log 集合新增 `domain: z.enum(['ai-exploration', 'ai-life']).default('ai-exploration')`
  - 新增 idea 集合（`src/content/idea/`）：title, scenario, tags[], status, followups[], published, date
  - 新增 dockItem 集合（`src/content/dock/`）：name, description, category(skill/tool/info-source), tags[], rating?, url?, published
  - 新增 work 集合（`src/content/works/`）：title, platform, url, cover?, description, tags[], date, published
- 创建内容目录：`src/content/idea/`, `src/content/dock/`, `src/content/works/`
- 迁移现有 8 篇文章，添加 domain 字段
- 新建工具文件：`src/utils/domains.ts`, `src/utils/formats.ts`, `src/utils/platforms.ts`
- 验证：`npm run build` 通过

**2. 关于页 `/about`**
- 新建 `src/pages/about.astro`
- 复用现首页 `<HeroVideo />` 和 `<HarborAbout />`
- 新建 `SocialLinks.astro` — 社交平台网格（B 站、抖音、小红书、知乎、GitHub）
- 新建 `ContactSection.astro` — 邮箱、联系方式
- 验证：`/about` 页面渲染正常

**3. 首页重写 `/`**
- 重写 `src/pages/index.astro`
- 新建 `HeroBanner.astro` — 缩短版 Hero（~40vh）
- 新建 `DomainEntries.astro` — 双域入口卡（AI 探索 / AI 生活），各展示 2-3 条最近内容，"查看全部"链接到 `/log?domain=...`
- 新建 `LatestContent.astro` — 跨域最新 4-6 条内容网格
- 新建 `ActivityFeed.astro` — 最近活动时间线
- 验证：首页显示仪表盘布局，双域入口可点击

**4. 日志页重构 `/log`**
- 重写 `src/pages/log/index.astro`
- 新建 `DimensionFilter.astro` — 三行筛选器：域 / 形态 / 主题
- URL 格式：`/log?domain=ai-exploration&type=article&tag=技术`
- 服务端过滤：先 domain，再 type，再 tag
- 修改 `TraceCard.astro` — 添加域标识徽章
- 修改 `log/[...slug].astro` — 头部显示域标签
- 验证：三维筛选组合正常工作

**5. 导航更新**
- 修改 `Navigation.astro` — navItems 更新为 6 项
- 修改 `Footer.astro` — 添加辅助链接
- 验证：所有页面导航链接正确

---

### P1 — 核心新功能（P0 完成后立即做）

**6. 多媒体渲染（remark 插件）**
- 新建 `src/plugins/remark-rich-embed.ts` — Astro remark 插件
- 识别 `![]()` 中的 URL，匹配已知域名：
  - bilibili.com → 视频播放器
  - youtube.com / youtu.be → 视频播放器
  - github.com → 仓库信息卡
  - .mp3/.wav/.ogg → 音频播放器
  - 其他 URL → 富预览卡片
- 普通链接（不加 `![]()`）保持不变
- 在 `astro.config.mjs` 中注册插件
- 验证：测试文章中 `![]()` 链接渲染为对应组件，普通链接保持原样

**7. Idea 留言板 `/ideas`**
- 新建 `src/pages/ideas.astro`
- 新建 `IdeaCard.astro` — 标题 + 场景 + 标签 + 可展开详情/跟进记录 + "联系我 → /about"
- 新建 `IdeaTagFilter.astro` — 标签筛选
- 验证：idea 列表渲染，标签筛选正常

**8. 补给舱 `/dock`**
- 新建 `src/pages/dock.astro`
- 新建 `DockCategoryFilter.astro` — 分类切换：Skills / 工具 / 信息源
- 新建 `DockSearch.astro` — 客户端搜索过滤
- 新建 `DockItemCard.astro` — 名称 + 描述 + 标签 + 星级 + 外链
- 验证：分类切换和搜索正常

---

### P2 — 扩展功能（P1 完成后做）

**9. 跨平台作品 `/works`**
- 新建 `src/pages/works.astro`
- 新建 `PlatformFilter.astro` — 平台筛选
- 新建 `WorkCard.astro` — 平台徽章 + 封面 + 标题 + 描述 + 外链

**10. 指南针优化 `/compass`**
- 更新副标题定位为核心方法论
- 标签云添加域筛选
- `TagMap.astro` 支持可选 domain prop
- 公理卡片链接到相关 `/log` 条目

---

### P3 — 编辑体验优化（最后做）

**11. Keystatic CMS 集成**
- 安装 `@keystatic/core` + `@keystatic/astro`
- 配置 `keystatic.config.ts` — 为所有集合定义编辑表单
- 添加 `/keystatic` 路由到 Astro
- 验证：`/keystatic` 可以在线编辑内容并 commit

**12. Obsidian 配置**
- Templater 模板：日志模板、Idea 模板、补给舱模板、作品模板
- Obsidian Git 插件配置：自动 commit + push
- `.obsidian/` 配置文件纳入版本管理

---

## 优先级总览

```
P0（核心骨架）：
  1. 数据模型 → 2. 关于页 → 3. 首页 → 4. 日志页重构 → 5. 导航更新

P1（核心新功能）：
  6. 多媒体渲染 → 7. Ideas → 8. 补给舱

P2（扩展功能）：
  9. 作品页 → 10. 指南针优化

P3（编辑体验）：
  11. Keystatic → 12. Obsidian 配置
```

---

## 文件清单

| 操作 | 文件 | 数量 |
|---|---|---|
| 修改 | `content.config.ts`, `Navigation.astro`, `Footer.astro`, `TraceCard.astro`, `TagMap.astro`, `compass.astro`, `log/index.astro`, `log/[...slug].astro`, `astro.config.mjs` | 9 |
| 重写 | `index.astro` | 1 |
| 新建页面 | `about.astro`, `ideas.astro`, `dock.astro`, `works.astro` | 4 |
| 新建组件 | HeroBanner, DomainEntries, LatestContent, ActivityFeed, SocialLinks, ContactSection, DimensionFilter, IdeaCard, IdeaTagFilter, DockCategoryFilter, DockSearch, DockItemCard, PlatformFilter, WorkCard | 14 |
| 新建插件 | `remark-rich-embed.ts` | 1 |
| 新建工具 | `domains.ts`, `formats.ts`, `platforms.ts` | 3 |
| 新建配置 | `keystatic.config.ts` | 1 |
| 迁移内容 | 8 篇现有文章加 domain 字段 | 8 |
| **总计** | | **41 处变更** |
