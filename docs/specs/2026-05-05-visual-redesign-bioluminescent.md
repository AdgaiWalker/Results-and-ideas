# Walker 博客视觉重做：深海生物荧光仪表盘

> 日期：2026-05-05
> 状态：待实施
> 范围：~30 文件，仅视觉层，不动数据模型和路由

## 背景

当前实现像通用 Astro 暗色模板，所有卡片统一 `border-mist/20 bg-sea-mid/40`，零辨识度。参考了两份审计报告（lvyovo-wiki 视觉辨识度 9、HylaruCoder 个人品牌 8）但未体现。

目标：从"暗色博客模板"变为"深海生物荧光仪表盘"。

---

## 设计语言：生物荧光玻璃仪器

- **玻璃面板**：`backdrop-blur-xl bg-white/[0.03] border-white/[0.08]` + 顶部高光边
- **双色调**：青色 `#00e5ff`（交互/生物荧光）+ 金色 `#d4af37`（品牌标识）
- **卡片差异化**：5 种内容类型各有独特视觉 DNA
- **深度背景**：径向渐变底层 + Canvas 粒子系统 + 玻璃面板分层
- **仪表盘首页**：CSS Grid 布局，非线性滚动

---

## 批次 1：主题基础 + 环境背景

### 1.1 `src/styles/global.css` — 完全重写

#### 新增颜色 token（@theme 内）

```css
/* 深渊底色 */
--color-abyss: #050d18;

/* 海洋层级微调 */
--color-sea-deep: #0a1628;    /* 保持不变 */
--color-sea-mid: #0f1d38;     /* 微调，更深 */
--color-sea-light: #162a4a;   /* 微调 */

/* 生物荧光 */
--color-bio-cyan: #00e5ff;
--color-bio-cyan-dim: #00b8cc;

/* 珊瑚 / 翡翠（状态色） */
--color-coral: #ff6b4a;
--color-emerald: #34d399;

/* 金色保持 */
--color-gold: #d4af37;
--color-gold-dim: #a88a2a;
--color-gold-glow: #e8c84a;

/* 玻璃系统 */
--color-glass-bg: rgba(255, 255, 255, 0.03);
--color-glass-bg-hover: rgba(255, 255, 255, 0.06);
--color-glass-border: rgba(255, 255, 255, 0.08);
--color-glass-border-hover: rgba(255, 255, 255, 0.15);
--color-glass-highlight: rgba(255, 255, 255, 0.12);

/* 迷雾 / 羊皮纸保持 */
--color-mist: #4a5568;
--color-mist-light: #9ca3af;
--color-parchment: #f0ead6;
--color-parchment-dim: #c9c3b1;

/* 字体保持 */
--font-heading: Sora, system-ui, sans-serif;
--font-body: "Noto Sans SC", system-ui, sans-serif;
--font-mono: "JetBrains Mono", monospace;
```

#### 新增关键帧动画

```css
@keyframes bio-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

@keyframes float-in {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes glow-breathe {
  0%, 100% { box-shadow: 0 0 8px rgba(0, 229, 255, 0.1); }
  50% { box-shadow: 0 0 20px rgba(0, 229, 255, 0.25); }
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes scan-line {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
```

#### 新增工具类

```css
/* 玻璃面板基础 */
.panel-glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 4px 24px rgba(0, 0, 0, 0.3);
}

.panel-glass:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
}

/* 面板标题栏 */
.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(240, 234, 214, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

/* 内发光 */
.glow-cyan {
  box-shadow: inset 0 0 20px rgba(0, 229, 255, 0.08);
}

.glow-gold {
  box-shadow: inset 0 0 20px rgba(212, 175, 55, 0.08);
}

/* 左侧彩色指示条 */
.card-accent-left {
  position: relative;
}

.card-accent-left::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 3px;
  border-radius: 3px;
}

/* 各类型色带 */
.accent-article::before { background: #00e5ff; }
.accent-thought::before { background: #d4af37; }
.accent-photo::before { background: #00e5ff; }
.accent-project::before { background: #d4af37; }
.accent-dialogue::before {
  background: linear-gradient(to bottom, #d4af37, #00e5ff);
}

/* 级联动画延迟 */
.reveal-delay-1 { transition-delay: 80ms; }
.reveal-delay-2 { transition-delay: 160ms; }
.reveal-delay-3 { transition-delay: 240ms; }
.reveal-delay-4 { transition-delay: 320ms; }
```

#### 增强 `.reveal`

```css
.reveal {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
  transition:
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}
```

---

### 1.2 `src/layouts/Base.astro` — 添加环境背景层

在 `<body>` 内、`<Navigation />` 前插入：

```html
<!-- 环境背景层 -->
<div class="fixed inset-0 -z-20" aria-hidden="true">
  <!-- 径向渐变底色 -->
  <div class="absolute inset-0 bg-gradient-to-b from-abyss via-sea-deep to-abyss"></div>
  <!-- 青色光斑 -->
  <div class="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-bio-cyan/[0.03] blur-[120px]"></div>
  <!-- 金色光斑 -->
  <div class="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-gold/[0.02] blur-[100px]"></div>
</div>
<!-- 粒子画布 -->
<canvas id="ambient-particles" class="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true"></canvas>
```

`<main>` 加 `class="relative z-10"`

`</body>` 前添加粒子脚本：

```html
<script>
  import '../scripts/ambient';
</script>
```

---

### 1.3 新建 `src/scripts/ambient.ts` — Canvas 粒子系统

```
功能：
- 40 个微粒
- 70% 青色 + 30% 金色
- 低透明度（0.15~0.4）漂浮
- 微弱呼吸效果（透明度正弦波动）
- 外发光（shadowBlur）
- ~30fps 帧率限制
- 尊重 prefers-reduced-motion（禁用时清空画布）
- resize 自适应
```

伪代码：

```ts
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;    // '#00e5ff' 或 '#d4af37'
  phase: number;    // 呼吸相位
}

function init():
  canvas = document.getElementById('ambient-particles')
  ctx = canvas.getContext('2d')
  resize canvas to window size
  创建 40 个 Particle:
    - 随机位置
    - vx: ±0.1~0.3
    - vy: ±0.1~0.2
    - size: 1.5~3.5
    - alpha: 0.15~0.4
    - color: 70% cyan, 30% gold
    - phase: random 0~2π

function draw(p: Particle):
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size, 0, π*2)
  breathAlpha = p.alpha + sin(p.phase) * 0.1
  ctx.fillStyle = p.color + alphaHex(breathAlpha)
  ctx.shadowBlur = p.size * 4
  ctx.shadowColor = p.color
  ctx.fill()
  ctx.shadowBlur = 0

function update():
  每帧:
    清空画布
    for each particle:
      p.x += p.vx
      p.y += p.vy
      p.phase += 0.01
      边界反弹
      draw(p)
    帧率限制 ~30fps (每 33ms 一帧)

function onResize():
  重新设置 canvas 尺寸

function onMotionPref():
  if prefers-reduced-motion: 清空并停止
  else: 恢复
```

---

## 批次 2：导航 + 页脚 + 搜索

### 2.1 `src/components/Navigation.astro`

**背景**：始终显示 `backdrop-blur-xl bg-abyss/70 border-b border-white/[0.06]`

**Logo**：Walker 前加 6px 青色脉冲圆点

```html
<span class="relative flex h-1.5 w-1.5 mr-2">
  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-bio-cyan opacity-75"></span>
  <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-bio-cyan"></span>
</span>
```

**当前页**：`text-bio-cyan` + 底部 2px 青色指示条

```html
<a class="relative text-bio-cyan after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-bio-cyan">
```

**非当前页**：hover 时指示条从中间展开

```html
<a class="relative text-parchment/60 hover:text-parchment
  after:content-[''] after:absolute after:bottom-[-1px]
  after:left-1/2 after:right-1/2 after:h-[2px] after:bg-bio-cyan/50
  hover:after:left-0 hover:after:right-0
  after:transition-all after:duration-300">
```

**移动端菜单**：玻璃面板下滑

```html
<div class="md:hidden backdrop-blur-xl bg-abyss/95 border-t border-white/[0.06]">
```

### 2.2 `src/components/Footer.astro`

**容器**：`border-t border-white/[0.06] bg-abyss/50 backdrop-blur-md`

**顶部发光线**：

```html
<div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bio-cyan/20 to-transparent"></div>
```

**新增"回到顶部"按钮**（右下角固定或页脚内）：

```html
<button onclick="window.scrollTo({top:0,behavior:'smooth'})"
  class="inline-flex items-center gap-2 text-sm text-parchment/40 hover:text-bio-cyan transition-colors">
  <Icon name="lucide:arrow-up" class="w-4 h-4" />
  回到顶部
</button>
```

### 2.3 `src/components/SearchModal.astro`

**背景遮罩**：加径向青色微光

```html
<div class="fixed inset-0 z-50 ... bg-abyss/80 backdrop-blur-sm">
  <!-- 径向微光 -->
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.05)_0%,transparent_70%)]"></div>
</div>
```

**搜索面板**：`panel-glass`

**输入框**：`focus-within` 青色发光边

```html
<div class="panel-glass focus-within:border-bio-cyan/30 focus-within:shadow-[0_0_20px_rgba(0,229,255,0.1)]">
  <input class="bg-transparent ..." />
</div>
```

**结果项**：hover 左侧青色指示条

```html
<a class="block px-4 py-3 hover:bg-white/[0.04] hover:border-l-2 hover:border-l-bio-cyan/50 transition-all">
```

**弹入动画**：容器加 `animation: modal-enter 0.2s ease-out`

---

## 批次 3：首页仪表盘布局

### 3.1 `src/pages/index.astro` — CSS Grid

```
网格布局：
grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5

├── col-span-8: HeroBanner（船长仪表）
├── col-span-4:
│   ├── ActivityFeed（声纳）
│   └── DomainEntries（两域面板）
└── col-span-12: LatestContent（最近航迹）
```

外层容器：

```html
<section class="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
  <div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
    ...
  </div>
</section>
```

### 3.2 `src/components/HeroBanner.astro` — 船长仪表面板

**容器**：`panel-glass h-full flex flex-col`

**标题栏**：`panel-header`

```html
<div class="panel-header">
  <Icon name="lucide:compass" class="w-3.5 h-3.5 text-bio-cyan/50" />
  CAPTAIN'S LOG
</div>
```

**主体**：

```html
<div class="flex-1 flex flex-col justify-center px-6 py-8">
  <h1 class="font-heading text-5xl md:text-6xl font-bold text-parchment">
    Walker
  </h1>
  <p class="mt-3 text-lg text-parchment/50 font-body">
    行过万里水路，记录每一次停靠
  </p>
</div>
```

**底部统计栏**：

```html
<div class="flex items-center gap-6 px-6 py-4 border-t border-white/[0.06]">
  <div class="flex items-center gap-2">
    <Icon name="lucide:book-open" class="w-4 h-4 text-bio-cyan/60" />
    <span class="text-sm text-parchment/60"><span class="text-bio-cyan font-mono">{logCount}</span> 日志</span>
  </div>
  <!-- 重复：ideas、tools、works -->
</div>
```

**快捷导航**（4 个圆形玻璃按钮）：

```html
<div class="flex items-center gap-3 px-6 py-4 border-t border-white/[0.06]">
  <a href="/log" class="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08]
    flex items-center justify-center hover:bg-bio-cyan/10 hover:border-bio-cyan/20 transition-all">
    <Icon name="lucide:book-open" class="w-4 h-4 text-parchment/60" />
  </a>
  <!-- Ideas, Dock, Compass 同理 -->
</div>
```

### 3.3 `src/components/DomainEntries.astro` — 双域仪器面板

**两个面板竖排**，每个：

```html
<div class="panel-glass">
  <div class="panel-header">
    <Icon name="lucide:compass" class="w-3.5 h-3.5 text-bio-cyan/50" />
    AI 探索
  </div>
  <div class="p-4 space-y-3">
    {entries.slice(0, 3).map(entry => (
      <a href={`/log/${entry.slug}`} class="block group">
        <div class="flex items-center justify-between">
          <span class="text-sm text-parchment/80 group-hover:text-bio-cyan transition-colors">
            {entry.data.title}
          </span>
          <span class="text-xs text-parchment/30">{date}</span>
        </div>
        <div class="flex items-center gap-1.5 mt-1">
          <Icon name={typeIcon} class="w-3 h-3 text-parchment/30" />
          <span class="text-xs text-parchment/30">{type}</span>
        </div>
      </a>
    ))}
    <a href="/log?domain=ai-exploration" class="text-xs text-bio-cyan hover:text-bio-cyan/80 transition-colors">
      查看全部 →
    </a>
  </div>
</div>
```

AI 生活面板用 `lucide:waves` 图标。

**hover**：顶部发光

```css
.panel-glass:hover {
  box-shadow: inset 0 1px 0 rgba(0, 229, 255, 0.08);
}
```

### 3.4 `src/components/LatestContent.astro` — 声纳网格

**外层**：`panel-glass` + `panel-header` "RECENT TRACES"

```html
<div class="panel-glass">
  <div class="panel-header">
    <Icon name="lucide:radar" class="w-3.5 h-3.5 text-bio-cyan/50" />
    RECENT TRACES
  </div>
  <div class="p-4 md:p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(item => <TraceCard ... />)}
    </div>
  </div>
</div>
```

### 3.5 `src/components/ActivityFeed.astro` — 声纳时间线

**紧凑面板**：`panel-glass` + `panel-header` "SONAR"

```html
<div class="panel-glass">
  <div class="panel-header">
    <Icon name="lucide:activity" class="w-3.5 h-3.5 text-bio-cyan/50" />
    SONAR
  </div>
  <div class="p-4 space-y-0">
    {activities.slice(0, 5).map(act => (
      <div class="flex items-start gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
        <!-- 左侧彩色圆点 -->
        <div class="mt-1.5 w-2 h-2 rounded-full bg-bio-cyan/60 shrink-0"></div>
        <!-- 内容 -->
        <div class="min-w-0">
          <span class="text-sm text-parchment/70">{act.title}</span>
          <span class="text-xs text-parchment/30 ml-2">{act.date}</span>
        </div>
      </div>
    ))}
  </div>
</div>
```

金色圆点用于 ideas 活动。

---

## 批次 4：卡片差异化（全部重做）

### 4.1 `src/components/TraceCard.astro` — 5 种视觉 DNA

#### article（声纳读数）

```html
<article class="panel-glass card-accent-left accent-article reveal group">
  <div class="p-5 pl-6">
    <!-- 域标签 -->
    <span class="text-xs text-bio-cyan/70 font-mono">{domain}</span>
    <h3 class="mt-1 text-base font-heading text-parchment group-hover:text-bio-cyan transition-colors">
      {title}
    </h3>
    <!-- 标签药丸 -->
    <div class="flex flex-wrap gap-1.5 mt-2">
      {tags.map(tag => (
        <span class="px-2 py-0.5 rounded-full text-xs bg-white/[0.06] text-parchment/50 border border-white/[0.06]">
          {tag}
        </span>
      ))}
    </div>
    <!-- 摘要 -->
    <p class="mt-2 text-sm text-parchment/40 line-clamp-2">{excerpt}</p>
    <!-- CTA -->
    <a href={url} class="mt-3 inline-flex items-center gap-1 text-xs text-bio-cyan/70 hover:text-bio-cyan transition-colors">
      阅读 <Icon name="lucide:arrow-right" class="w-3 h-3" />
    </a>
  </div>
</article>
```

#### thought（船长低语）

```html
<article class="bg-gold/[0.03] rounded-xl p-5 reveal group">
  <div class="flex items-center gap-2 mb-2">
    <span class="w-2 h-2 rounded-full bg-gold/60 animate-[bio-pulse_3s_ease-in-out_infinite]"></span>
    <span class="text-xs text-gold/50 font-mono uppercase">Captain's Whisper</span>
  </div>
  <p class="text-sm italic text-parchment/60 leading-relaxed">{content}</p>
</article>
```

#### photo（潜望镜）

```html
<article class="panel-glass overflow-hidden reveal group">
  {image && (
    <div class="aspect-video overflow-hidden">
      <img src={image} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    </div>
  )}
  <div class="p-4">
    <h3 class="text-sm text-parchment/80">{title}</h3>
  </div>
  <!-- hover 发光边 -->
  <style>
    .group:hover { border-color: rgba(0, 229, 255, 0.3); }
  </style>
</article>
```

#### project（船坞）

```html
<article class="panel-glass border-gold/20 bg-gold/[0.03] glow-gold reveal group">
  <div class="p-5">
    <div class="flex items-center gap-2 mb-2">
      <Icon name="lucide:anchor" class="w-4 h-4 text-gold/60" />
      <span class="text-xs text-gold/50 font-mono uppercase">Shipyard</span>
    </div>
    <h3 class="text-base font-heading text-parchment group-hover:text-gold-glow transition-colors">{title}</h3>
    <p class="mt-2 text-sm text-parchment/40">{description}</p>
  </div>
</article>
```

#### dialogue（无线电）

```html
<article class="panel-glass overflow-hidden reveal group">
  <!-- 双色头部 -->
  <div class="h-1 bg-gradient-to-r from-gold/40 to-bio-cyan/40"></div>
  <div class="p-5">
    <div class="flex items-center gap-2 mb-2">
      <Icon name="lucide:radio" class="w-4 h-4 text-bio-cyan/60" />
      <span class="text-xs text-bio-cyan/50 font-mono uppercase">Radio</span>
    </div>
    <h3 class="text-base font-heading text-parchment">{title}</h3>
    <p class="mt-2 text-sm text-parchment/40">{excerpt}</p>
  </div>
  <!-- 底部波形装饰 -->
  <div class="px-5 pb-4 flex items-center gap-0.5">
    {[1,2,3,4,5,6,7,8].map(i => (
      <div class="w-1 bg-bio-cyan/20 rounded-full" style={`height:${4+Math.sin(i)*4}px`}></div>
    ))}
  </div>
</article>
```

### 4.2 `src/components/IdeaCard.astro` — 灯塔卡

```html
<article class="panel-glass overflow-hidden reveal group">
  <!-- 顶部渐变条 -->
  <div class="h-[3px] bg-gradient-to-r from-gold via-coral to-bio-cyan group-hover:opacity-100 opacity-70 transition-opacity"></div>

  <div class="p-5">
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-2">
        <Icon name="lucide:lightbulb" class="w-5 h-5 text-gold/60" style="filter: drop-shadow(0 0 6px rgba(212,175,55,0.3))" />
        <h3 class="font-heading text-parchment">{title}</h3>
      </div>
      <!-- 状态徽章 -->
      <span class="px-2 py-0.5 rounded text-xs font-mono
        bg-bio-cyan/10 text-bio-cyan/80 border border-bio-cyan/20">
        {status}
      </span>
    </div>
    <p class="mt-2 text-sm text-parchment/50">{scenario}</p>
    <!-- 标签 -->
    <div class="flex flex-wrap gap-1.5 mt-3">
      {tags.map(tag => (
        <span class="px-2 py-0.5 rounded-full text-xs bg-white/[0.06] text-parchment/50">
          {tag}
        </span>
      ))}
    </div>
    <!-- 跟进记录 -->
    {followups && followups.map(f => (
      <div class="mt-3 pt-3 border-t border-white/[0.04] flex items-center gap-2 text-xs">
        <Icon name={statusIcon} class="w-3.5 h-3.5 text-emerald/60" />
        <span class="text-parchment/40">{f.who}: {f.status}</span>
      </div>
    ))}
  </div>
</article>
```

### 4.3 `src/components/DockItemCard.astro` — 补给箱

分类徽章色：skill=`bio-cyan`、tool=`gold`、info-source=`coral`

```html
<article class="panel-glass reveal group">
  <div class="p-5">
    <!-- 分类徽章 -->
    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono
      {categoryClass}">
      <Icon name={categoryIcon} class="w-3 h-3" />
      {category}
    </span>
    <h3 class="mt-2 font-heading text-parchment">{name}</h3>
    <p class="mt-1 text-sm text-parchment/50">{description}</p>
    <!-- 标签 -->
    <div class="flex flex-wrap gap-1.5 mt-2">...</div>
    <!-- 星级 -->
    {rating && (
      <div class="flex items-center gap-1 mt-3">
        {Array.from({length: 5}).map((_, i) => (
          <Icon name="lucide:star" class={`w-3.5 h-3.5 ${i < rating ? 'text-gold/70' : 'text-white/10'}`} />
        ))}
      </div>
    )}
  </div>
</article>
```

分类样式映射：

```ts
const categoryStyles = {
  skill: 'bg-bio-cyan/10 text-bio-cyan/80 border border-bio-cyan/20',
  tool: 'bg-gold/10 text-gold/80 border border-gold/20',
  'info-source': 'bg-coral/10 text-coral/80 border border-coral/20',
};
```

### 4.4 `src/components/WorkCard.astro` — 广播卡

```html
<article class="panel-glass overflow-hidden reveal group">
  <!-- 顶部品牌色条 -->
  <div class="h-[1.5px]" style={`background:${platformColor}; box-shadow: 0 1px 4px ${platformColor}40`}></div>

  <div class="p-5">
    <div class="flex items-center gap-2 mb-2">
      <Icon name={platformIcon} class="w-4 h-4" style={`color:${platformColor}`} />
      <span class="text-xs font-mono" style={`color:${platformColor}80`}>{platform}</span>
    </div>
    <h3 class="font-heading text-parchment">{title}</h3>
    <p class="mt-1 text-sm text-parchment/50">{description}</p>
    <!-- 标签 -->
    <div class="flex flex-wrap gap-1.5 mt-3">...</div>
    <!-- 外链 -->
    <a href={url} class="mt-3 inline-flex items-center gap-1 text-xs text-parchment/40 hover:text-bio-cyan transition-colors">
      查看作品 <Icon name="lucide:external-link" class="w-3 h-3" />
    </a>
  </div>
</article>
```

---

## 批次 5：筛选器 + 次要组件

### 5.1 统一筛选器"开关"风格

**激活态**：

```html
<button class="px-3 py-1.5 rounded-lg text-sm font-medium
  bg-bio-cyan/15 text-bio-cyan border border-bio-cyan/25
  shadow-[0_0_8px_rgba(0,229,255,0.1)] transition-all">
  {label}
</button>
```

**未激活态**：

```html
<button class="px-3 py-1.5 rounded-lg text-sm
  bg-white/[0.04] text-parchment/50 border border-white/[0.06]
  hover:bg-white/[0.06] hover:border-white/[0.1] transition-all">
  {label}
</button>
```

### 5.2 `DimensionFilter` 三行标签

每行加标签：

```html
<div class="space-y-3">
  <div>
    <span class="text-xs text-parchment/30 font-mono uppercase tracking-wider mb-1.5 block">海域</span>
    <div class="flex flex-wrap gap-2">{/* 域筛选按钮 */}</div>
  </div>
  <div>
    <span class="text-xs text-parchment/30 font-mono uppercase tracking-wider mb-1.5 block">形态</span>
    <div class="flex flex-wrap gap-2">{/* 形态筛选按钮 */}</div>
  </div>
  <div>
    <span class="text-xs text-parchment/30 font-mono uppercase tracking-wider mb-1.5 block">主题</span>
    <div class="flex flex-wrap gap-2">{/* 主题筛选按钮 */}</div>
  </div>
</div>
```

### 5.3 `SocialLinks.astro` — 信号格

每个平台 hover 用品牌色发光：

```html
<a href={url} class="panel-glass flex items-center gap-3 p-4 group
  hover:shadow-[inset_0_0_20px_{brandColor}15] transition-all">
  <Icon name={icon} class="w-5 h-5 text-parchment/40 group-hover:text-{brandColor} transition-colors" />
  <span class="text-sm text-parchment/60 group-hover:text-parchment">{name}</span>
</a>
```

品牌色映射：GitHub=`white`、B站=`#00a1d6`、抖音=`#fe2c55`、小红书=`#ff2442`、知乎=`#0066ff`

### 5.4 `ContactSection.astro` — 发射面板

分隔线改为渐变：

```html
<div class="h-px bg-gradient-to-r from-white/[0.08] via-bio-cyan/30 to-white/[0.08]"></div>
```

邮箱按钮：

```html
<a href="mailto:..." class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
  border border-bio-cyan/20 text-bio-cyan hover:bg-bio-cyan/10
  hover:shadow-[0_0_16px_rgba(0,229,255,0.15)] transition-all">
  <Icon name="lucide:mail" class="w-4 h-4" />
  发射信号
</a>
```

### 5.5 `TagMap.astro` — 兴趣星图

标签改为玻璃药丸：

```html
<button class="px-3 py-1.5 rounded-full text-sm
  bg-white/[0.04] border border-white/[0.06] text-parchment/50
  hover:border-bio-cyan/25 hover:text-bio-cyan hover:shadow-[0_0_8px_rgba(0,229,255,0.1)]
  transition-all">
  {tag}
</button>
```

---

## 批次 6：内页布局更新

### 通用

- 移除所有页面内的 `fixed inset-0` 渐变覆盖层（Base 的环境背景接管）
- 页头金线改为：`bg-gradient-to-r from-white/[0.08] to-transparent`
- 页头加青色圆点装饰

### `src/pages/log/index.astro`

- 移除固定渐变 div
- 时间段标题用 `panel-header` 风格
- 卡片用差异化 TraceCard

### `src/pages/log/[...slug].astro`

- prose 样式更新：

```html
<div class="prose prose-invert max-w-none
  prose-code:bg-abyss prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
  prose-pre:bg-abyss prose-pre:border prose-pre:border-white/[0.06]
  prose-blockquote:bg-gold/[0.03] prose-blockquote:border-l-gold/30
  prose-a:text-bio-cyan">
```

- 返回链接：`text-bio-cyan`

### `src/pages/compass.astro`

- 公理卡片符号圆圈：`w-14 h-14 bg-white/[0.04] border border-white/[0.08] rounded-xl`
- hover 时：`shadow-[0_0_12px_rgba(0,229,255,0.15)]`
- 标签云：玻璃药丸 + hover `glow-cyan`

### `src/pages/about.astro`

- HeroVideo 加玻璃边框：`panel-glass overflow-hidden`
- HarborAbout 包在 `panel-glass` 居中卡片

---

## 批次 7：动画脚本增强

### `src/scripts/scroll-fade.ts`

```ts
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('visible');

          // data-stagger 级联
          const parent = el.closest('[data-stagger]');
          if (parent) {
            const children = parent.querySelectorAll('.reveal');
            children.forEach((child, i) => {
              (child as HTMLElement).style.transitionDelay = `${i * 80}ms`;
              child.classList.add('visible');
            });
          }

          observer.unobserve(el);
        }
      });
    },
    {
      threshold: 0.05,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
```

---

## 批次 8：内容渲染组件

### `PromptBlock.astro`

```html
<div class="panel-glass border-l-2 border-l-gold/30 my-6">
  <div class="panel-header">
    <Icon name="lucide:terminal" class="w-3.5 h-3.5 text-gold/50" />
    PROMPT
  </div>
  <div class="p-4 relative">
    <pre class="text-sm text-parchment/70 font-mono whitespace-pre-wrap">{content}</pre>
    <button class="absolute top-3 right-3 px-2 py-1 rounded bg-white/[0.06] text-xs text-parchment/40
      hover:bg-white/[0.1] hover:text-parchment/60 transition-all">
      复制
    </button>
  </div>
</div>
```

### `DialogueBubble.astro`

**人类气泡**：

```html
<div class="panel-glass bg-gold/[0.08] border-gold/15 my-3 ml-4">
  <div class="p-4">
    <span class="text-xs font-mono text-gold/50 uppercase">Human</span>
    <p class="mt-1 text-sm text-parchment/70">{content}</p>
  </div>
</div>
```

**AI 气泡**：

```html
<div class="panel-glass bg-bio-cyan/[0.06] border-bio-cyan/15 my-3 mr-4">
  <div class="p-4">
    <span class="text-xs font-mono text-bio-cyan/50 uppercase">AI</span>
    <p class="mt-1 text-sm text-parchment/70">{content}</p>
  </div>
</div>
```

---

## 执行顺序

1. 批次 1（主题+环境）→ 所有后续依赖
2. 批次 7（动画）→ 快速完成
3. 批次 2（导航+页脚+搜索）→ 全站立即刷新
4. 批次 4（卡片）→ 视觉核心
5. 批次 5（筛选器+次要）→ 依赖批次 1 风格
6. 批次 3（首页仪表盘）→ 组合前面组件
7. 批次 6（内页）→ 依赖前面所有
8. 批次 8（内容组件）→ 最低优先级

## 验证清单

- [ ] `npx astro build` 零错误通过
- [ ] `npx pagefind --site dist` 索引成功
- [ ] 所有 15 个页面生成
- [ ] 环境粒子 Canvas 正常渲染
- [ ] 所有卡片视觉差异化明显
- [ ] 首页 CSS Grid 仪表盘布局正常
- [ ] 移动端单列折叠正常
- [ ] `prefers-reduced-motion` 禁用粒子+动画
- [ ] 搜索弹窗玻璃效果正常
- [ ] 筛选器交互反馈（青色发光切换）正常
