# Walker 博客重做提示词

## 核心理念

首页照搬 lvyovo-wiki.tech 的卡片式三栏布局。进入频道后的内容结构借鉴 hylarucoder.io 的编排方式。

## 设计参考（两个来源各取所需）

### 首页布局：照搬 lvyovo-wiki.tech

lvyovo 的首页是唯一参考。

### 内容结构：借鉴 hylarucoder.io

进入频道后的页面结构参考 HylaruCoder 的编排方式，不是照搬，是借鉴其分类思路。

- 频道化：每个内容类型有独立落地页和筛选体系
- 子分类：顶级导航支持展开子分类
- 内页筛选：
  - /log：按 domain（海域）/ type（形态）/ tag（主题）三维筛选
  - /ideas：按 tag 筛选
  - /dock：按 category（tool/skill/info-source）筛选
  - /works：按 platform 筛选
- About 页面作为信任锚（简介 + 技能 + 项目）

## 视觉语言

Walker 深海生物荧光主题：

- **底色**：abyss (#050d18) 深海黑
- **玻璃态卡片**：`backdrop-blur-xl bg-white/[0.03] border-white/[0.08]` + 顶部高光边
- **双色调**：bio-cyan (#00e5ff) 交互色 + gold (#d4af37) 品牌色
- **辅助色**：coral (#ff6b4a)、emerald (#34d399)
- **粒子背景**：Canvas 微粒漂浮
- **hover 效果**：外发光阴影 + 色带变宽 + 图标微放大

## 首页布局（照搬 lvyovo 结构）

## 技术约束

### 硬约束（不可变）

- **创作流程**：Obsidian 写作 → Git push 到 GitHub → Vercel 自动部署
- Obsidian 是唯一的内容编辑器，内容格式必须是 Obsidian 兼容的 Markdown
- GitHub 仓库是唯一的数据源，无外部 CMS
- Vercel 部署，必须是静态站点（SSG）

### 软约束（可调整）

- 当前用 Astro 6 + Tailwind CSS v4，但框架可换
- Lucide 图标（astro-icon + @iconify-json/lucide），图标库可换
- Pagefind 静态搜索，搜索方案可换
- 尊重 prefers-reduced-motion
- 用中文表述，不写兼容代码，不用 Emoji
