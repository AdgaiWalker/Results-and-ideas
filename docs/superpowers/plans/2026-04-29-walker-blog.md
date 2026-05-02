# Walker 个人博客实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个以「行船」为核心意象的前卫实验风个人博客，支持多领域内容发布。

**Architecture:** Astro 静态站点 + Tailwind CSS 样式系统。内容以 Markdown 文件存储（可对接 Obsidian），通过 Astro Content Collections 管理。三个核心页面：首页（港口）、日志列表+详情（航海日志）、标签图谱（指南针）。首页全屏视频首屏，水波过渡动画贯穿全局。

**Tech Stack:** Astro 5.x, Tailwind CSS 4.x, TypeScript, Vercel 部署

---

## 文件结构

```
E:/桌面/blog/
├── src/
│   ├── content/
│   │   ├── config.ts              # Content Collections schema
│   │   └── log/                   # 示例内容（开发阶段，后续替换为 Obsidian 对接）
│   │       ├── hello-walker.md
│   │       ├── code-and-philosophy.md
│   │       ├── mountain-trip.md
│   │       ├── cooking-pasta.md
│   │       ├── design-thinking.md
│   │       └── a-thought.md
│   ├── layouts/
│   │   └── Base.astro             # 全局布局：导航、页脚、meta
│   ├── pages/
│   │   ├── index.astro            # 首页（港口）
│   │   ├── log/
│   │   │   ├── index.astro        # 日志列表
│   │   │   └── [...slug].astro    # 日志详情
│   │   └── compass.astro          # 指南针
│   ├── components/
│   │   ├── Navigation.astro       # 全局导航栏
│   │   ├── HeroVideo.astro        # 首屏视频组件
│   │   ├── TraceCard.astro        # 内容卡片（多 type 变体）
│   │   ├── RecentTraces.astro     # 首页最近痕迹区域
│   │   ├── HarborAbout.astro      # 首页底部个人区
│   │   ├── TagFilter.astro        # 日志页标签筛选条
│   │   ├── TagMap.astro           # 指南针页标签图谱
│   │   └── Footer.astro           # 全局页脚
│   ├── scripts/
│   │   └── scroll-fade.ts         # 首页视频滚动淡出逻辑
│   └── styles/
│       └── global.css             # 全局样式、CSS 变量、动画关键帧
├── public/
│   ├── video/
│   │   └── hero-fallback.jpg      # 视频降级静态图（用户提供）
│   └── images/
│       └── .gitkeep
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
└── docs/
    └── superpowers/
        ├── specs/
        └── plans/
```

---

### Task 1: 项目初始化与依赖安装

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `tailwind.config.mjs`

- [ ] **Step 1: 初始化 Astro 项目**

```bash
cd "E:/桌面/blog"
npm create astro@latest . -- --template minimal --no-install --typescript strict
```

如果提示目录非空，选择覆盖。如果有交互选项，选择：TypeScript strict，不安装依赖先。

- [ ] **Step 2: 安装依赖**

```bash
cd "E:/桌面/blog"
npm install
npm install @astrojs/tailwind tailwindcss
npm install @astrojs/mdx
npm install sharp
```

- [ ] **Step 3: 配置 astro.config.mjs**

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://walker.blog',
  integrations: [
    tailwind(),
    mdx(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
```

- [ ] **Step 4: 配置 tailwind.config.mjs**

```javascript
// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        sea: {
          deep: '#0a1628',
          mid: '#132040',
          light: '#1a2d52',
        },
        gold: {
          DEFAULT: '#d4af37',
          dim: '#a88a2a',
          glow: '#e8c84a',
        },
        mist: {
          DEFAULT: '#4a5568',
          light: '#9ca3af',
        },
        parchment: {
          DEFAULT: '#f0ead6',
          dim: '#c9c3b1',
        },
      },
      fontFamily: {
        heading: ['Sora', 'system-ui', 'sans-serif'],
        body: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 5: 配置 tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 6: 创建全局样式文件**

```css
/* src/styles/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-sea-deep text-parchment font-body antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }

  a {
    @apply text-gold hover:text-gold-glow transition-colors duration-200;
  }

  ::selection {
    @apply bg-gold/30 text-parchment;
  }
}

/* 水波过渡动画 */
@keyframes ripple-in {
  from {
    clip-path: circle(0% at var(--ripple-x, 50%) var(--ripple-y, 50%));
  }
  to {
    clip-path: circle(150% at var(--ripple-x, 50%) var(--ripple-y, 50%));
  }
}

/* 卡片进入视口动画 */
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 无障碍：减弱动效 */
@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }

  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 7: 创建占位静态图和目录**

```bash
mkdir -p "E:/桌面/blog/public/video"
mkdir -p "E:/桌面/blog/public/images"
touch "E:/桌面/blog/public/images/.gitkeep"
```

将用户提供的静态图复制为 `public/video/hero-fallback.jpg`（如果已有），否则先留一个空占位。

- [ ] **Step 8: 验证构建**

```bash
cd "E:/桌面/blog"
npm run build
```

Expected: 构建成功，`dist/` 目录生成。

- [ ] **Step 9: 提交**

```bash
cd "E:/桌面/blog"
git add -A
git commit -m "feat: 初始化 Astro 项目，配置 Tailwind、MDX、全局样式"
```

---

### Task 2: Content Collections Schema 与示例内容

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/log/hello-walker.md`
- Create: `src/content/log/code-and-philosophy.md`
- Create: `src/content/log/mountain-trip.md`
- Create: `src/content/log/cooking-pasta.md`
- Create: `src/content/log/design-thinking.md`
- Create: `src/content/log/a-thought.md`

- [ ] **Step 1: 创建内容 schema**

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const log = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    type: z.enum(['article', 'photo', 'thought', 'project']),
    published: z.boolean().default(true),
    cover: z.string().optional(),
    link: z.string().url().optional(),
  }),
});

export const collections = { log };
```

- [ ] **Step 2: 创建示例内容 — hello-walker.md**

```markdown
---
title: Walker 启航
date: 2026-04-29
tags: [随想, 哲学]
type: thought
published: true
---

行过万里水路，记录每一次停靠。

这是 Walker 的第一篇日志。一艘小船驶入夜海，前方是未知，身后是平静。

为什么出发？因为不出发就不会知道海的那边有什么。
```

- [ ] **Step 3: 创建示例内容 — code-and-philosophy.md**

```markdown
---
title: 代码与哲学：论抽象的本质
date: 2026-04-27
tags: [技术, 哲学]
type: article
published: true
---

## 从柏拉图到面向对象

柏拉图说，现实世界是理念世界的投影。程序员说，对象是类的实例。

这两种说法惊人地相似。当我们写下 `class Dog` 的时候，我们在做什么？我们在定义一个"理念"——关于狗的本质属性和行为。而每一个 `new Dog()` 都是这个理念在内存中的一次"投影"。

## 抽象的代价

但抽象是有代价的。每一次抽象都在丢失信息，就像地图永远不会是领土本身。

```typescript
// 理念：完美的狗
interface PlatonicDog {
  bark(): string;
  fetch(item: unknown): Promise<unknown>;
}

// 现实：总有例外
class RealDog implements PlatonicDog {
  bark() {
    return Math.random() > 0.5 ? "woof" : "..."; // 有时候不想叫
  }
  async fetch(item: unknown) {
    if (Math.random() > 0.7) return null; // 有时候不想捡
    return item;
  }
}
```

也许好的代码和好的哲学一样：知道在哪里停止抽象，在哪里拥抱混沌。
```

- [ ] **Step 4: 创建示例内容 — mountain-trip.md**

```markdown
---
title: 黄山三日：在云海之上
date: 2026-04-20
tags: [旅行, 摄影]
type: photo
published: true
cover: /images/huangshan-cover.jpg
---

四月的黄山，云海翻涌如同一片白色的海。

凌晨四点起床，从光明顶出发，在冷风中等待日出。当第一道光穿过云层的时候，我理解了为什么人们说"五岳归来不看山"。

那光，和我博客首页的那道金光，是同一种光。

（图片待补充）
```

- [ ] **Step 5: 创建示例内容 — cooking-pasta.md**

```markdown
---
title: 一人食：蒜香橄榄油意面
date: 2026-04-18
tags: [厨艺]
type: article
published: true
---

## 为什么是这道菜

一个人住的时候，最需要的是一道 15 分钟就能做好、材料简单、但吃起来很满足的菜。蒜香橄榄油意面（Aglio e Olio）就是这样的存在。

## 材料

- 意面 100g
- 大蒜 4-5 瓣，切薄片
- 干辣椒 2 个
- 特级初榨橄榄油 3 大勺
- 盐、黑胡椒
- 欧芹碎（可选）

## 步骤

1. 烧一锅水，加盐，煮意面至比包装时间少 1 分钟
2. 平底锅中火，倒橄榄油，放入蒜片，小火慢煎至金黄
3. 加入干辣椒，翻炒 30 秒
4. 捞出意面直接放入锅中，加一勺煮面水，大火翻拌 1 分钟
5. 装盘，撒黑胡椒和欧芹碎

关键在于蒜片的火候——金黄但不焦，这是这道菜的灵魂。
```

- [ ] **Step 6: 创建示例内容 — design-thinking.md**

```markdown
---
title: 留白不是空：设计的呼吸感
date: 2026-04-15
tags: [设计]
type: article
published: true
---

## 一个实验

打开两个页面。一个塞满了信息和按钮，另一个只放了一行字和大量留白。

哪个让你更想读下去？

答案几乎是确定的。但我们自己做设计的时候，总是忍不住往里加东西——"这里空了，加点什么吧"。

## 留白是设计中的沉默

音乐家知道，音符之间的停顿和音符本身一样重要。爵士乐手 Miles Davis 说过："真正的技巧在于知道什么时候不吹。"

设计也一样。留白不是"没用到的空间"，而是设计中的沉默——它给眼睛一个休息的地方，给内容一个呼吸的节奏。

## 实践原则

1. 先放内容，再调间距。不要先定网格再填内容。
2. 如果犹豫要不要加某个元素，不加。
3. 对齐、对比、重复、亲密性——四大基本原则比装饰重要一百倍。
```

- [ ] **Step 7: 创建示例内容 — a-thought.md**

```markdown
---
title: 无题
date: 2026-04-28
tags: [随想]
type: thought
published: true
---

今天在路上看到一只猫，它蹲在墙头看月亮。它没有在思考什么，它只是在看。

也许最好的生活状态就是：不为了什么，只是在看。
```

- [ ] **Step 8: 验证内容 schema**

```bash
cd "E:/桌面/blog"
npm run build
```

Expected: 构建成功，Astro 正确解析所有 Markdown 文件的 frontmatter。如果 schema 不匹配会报错。

- [ ] **Step 9: 提交**

```bash
cd "E:/桌面/blog"
git add src/content/
git commit -m "feat: 添加内容 schema 和 6 篇示例日志"
```

---

### Task 3: 全局布局（Base Layout + 导航 + 页脚）

**Files:**
- Create: `src/layouts/Base.astro`
- Create: `src/components/Navigation.astro`
- Create: `src/components/Footer.astro`

- [ ] **Step 1: 创建 Navigation 组件**

```astro
---
// src/components/Navigation.astro
const navItems = [
  { label: '港口', href: '/' },
  { label: '航海日志', href: '/log' },
  { label: '指南针', href: '/compass' },
];

const currentPath = Astro.url.pathname;
---

<nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" id="main-nav">
  <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="/" class="font-heading text-xl text-parchment hover:text-gold transition-colors no-underline">
      Walker
    </a>
    <div class="flex gap-8">
      {navItems.map(item => (
        <a
          href={item.href}
          class:list={[
            'font-heading text-sm tracking-wider uppercase no-underline transition-colors duration-200',
            currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href))
              ? 'text-gold'
              : 'text-mist-light hover:text-parchment',
          ]}
        >
          {item.label}
        </a>
      ))}
    </div>
  </div>
</nav>

<script>
  const nav = document.getElementById('main-nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (!nav) return;

    if (currentScroll > 80) {
      nav.classList.add('bg-sea-deep/90', 'backdrop-blur-md');
    } else {
      nav.classList.remove('bg-sea-deep/90', 'backdrop-blur-md');
    }
    lastScroll = currentScroll;
  });
</script>
```

- [ ] **Step 2: 创建 Footer 组件**

```astro
---
// src/components/Footer.astro
---

<footer class="border-t border-mist/20 py-8 px-6">
  <div class="max-w-6xl mx-auto flex flex-col items-center gap-2">
    <p class="text-mist-light text-sm font-heading tracking-wider">
      行过万里水路，记录每一次停靠
    </p>
    <p class="text-mist text-xs">
      &copy; {new Date().getFullYear()} Walker
    </p>
  </div>
</footer>
```

- [ ] **Step 3: 创建 Base Layout**

```astro
---
// src/layouts/Base.astro
import Navigation from '../components/Navigation.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title?: string;
  description?: string;
}

const {
  title = 'Walker',
  description = '行过万里水路，记录每一次停靠',
} = Astro.props;
---

<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="generator" content={Astro.generator} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Noto+Sans+SC:wght@300;400;500;700&family=Sora:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
    <title>{title}</title>
  </head>
  <body class="min-h-screen flex flex-col">
    <Navigation />
    <main class="flex-1">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 4: 验证构建**

```bash
cd "E:/桌面/blog"
npm run build
```

Expected: 构建成功。

- [ ] **Step 5: 提交**

```bash
cd "E:/桌面/blog"
git add src/layouts/ src/components/Navigation.astro src/components/Footer.astro
git commit -m "feat: 添加全局布局、导航栏、页脚组件"
```

---

### Task 4: 首页（港口）— 视频首屏 + 最近痕迹 + 个人区

**Files:**
- Create: `src/components/HeroVideo.astro`
- Create: `src/components/TraceCard.astro`
- Create: `src/components/RecentTraces.astro`
- Create: `src/components/HarborAbout.astro`
- Create: `src/scripts/scroll-fade.ts`
- Create: `src/pages/index.astro`

- [ ] **Step 1: 创建 HeroVideo 组件**

```astro
---
// src/components/HeroVideo.astro
---

<section class="relative w-full h-screen overflow-hidden" id="hero">
  <!-- 视频背景 -->
  <video
    class="absolute inset-0 w-full h-full object-cover"
    autoplay
    muted
    loop
    playsinline
    id="hero-video"
  >
    <source src="/video/hero.webm" type="video/webm" />
    <source src="/video/hero.mp4" type="video/mp4" />
  </video>

  <!-- 静态图降级（noscript 和弱网） -->
  <noscript>
    <img
      src="/video/hero-fallback.jpg"
      alt="孤帆在夜海中航行"
      class="absolute inset-0 w-full h-full object-cover"
    />
  </noscript>

  <!-- 底部渐变条：视频→页面背景 -->
  <div class="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-sea-deep to-transparent pointer-events-none"></div>

  <!-- 叠加文字 -->
  <div class="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
    <h1 class="font-heading text-6xl md:text-8xl text-parchment tracking-wider drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
      Walker
    </h1>
    <p class="mt-4 text-lg md:text-xl text-parchment/80 font-body drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
      行过万里水路，记录每一次停靠
    </p>
  </div>
</section>

<script>
  const video = document.getElementById('hero-video') as HTMLVideoElement;
  const hero = document.getElementById('hero');

  // 视频加载失败时降级为静态图
  if (video) {
    video.addEventListener('error', () => {
      const fallback = document.createElement('img');
      fallback.src = '/video/hero-fallback.jpg';
      fallback.alt = '孤帆在夜海中航行';
      fallback.className = 'absolute inset-0 w-full h-full object-cover';
      video.parentElement?.appendChild(fallback);
      video.style.display = 'none';
    });
  }

  // 滚动淡出
  if (hero) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const height = hero.offsetHeight;
      const opacity = Math.max(0, 1 - scrollY / height);
      hero.style.opacity = String(opacity);
    }, { passive: true });
  }
</script>
```

- [ ] **Step 2: 创建 TraceCard 组件**

```astro
---
// src/components/TraceCard.astro
interface Props {
  title: string;
  date: Date;
  tags: string[];
  type: 'article' | 'photo' | 'thought' | 'project';
  slug: string;
  cover?: string;
  excerpt?: string;
}

const { title, date, tags, type, slug, cover, excerpt } = Astro.props;

const typeStyles: Record<string, string> = {
  article: 'border-l-2 border-l-gold/50',
  photo: 'border-l-2 border-l-sea-light',
  thought: 'border-l-2 border-l-mist',
  project: 'border-l-2 border-l-gold-glow',
};

const formatDate = (d: Date) =>
  d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
---

<a
  href={`/log/${slug}`}
  class:list={[
    'block reveal group rounded-lg bg-sea-mid/40 p-5 transition-all duration-300',
    'hover:bg-sea-mid/70 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sea-deep/50',
    typeStyles[type],
  ]}
>
  {type === 'photo' && cover && (
    <div class="mb-3 rounded overflow-hidden aspect-video bg-sea-deep">
      <img src={cover} alt={title} class="w-full h-full object-cover" loading="lazy" />
    </div>
  )}

  <div class="flex items-center gap-3 mb-2">
    <time class="text-mist-light text-xs font-mono">{formatDate(date)}</time>
    <div class="flex gap-1.5">
      {tags.slice(0, 3).map(tag => (
        <span class:list={[
          'text-xs px-1.5 py-0.5 rounded',
          tag === '哲学'
            ? 'bg-gold/20 text-gold'
            : 'bg-sea-light/30 text-mist-light',
        ]}>
          {tag}
        </span>
      ))}
    </div>
  </div>

  {type === 'thought' ? (
    <p class="text-parchment/90 text-base italic leading-relaxed line-clamp-3">
      {excerpt || title}
    </p>
  ) : (
    <>
      <h3 class="text-parchment font-heading text-lg group-hover:text-gold transition-colors duration-200">
        {title}
      </h3>
      {excerpt && (
        <p class="mt-1.5 text-mist-light text-sm line-clamp-2 leading-relaxed">
          {excerpt}
        </p>
      )}
    </>
  )}
</a>
```

- [ ] **Step 3: 创建 RecentTraces 组件**

```astro
---
// src/components/RecentTraces.astro
import TraceCard from './TraceCard.astro';
import { getCollection } from 'astro:content';

const allLogs = await getCollection('log', ({ data }) => data.published);
const recentLogs = allLogs
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, 6);
---

<section class="max-w-4xl mx-auto px-6 py-20">
  <h2 class="font-heading text-2xl text-parchment mb-10 tracking-wide">最近痕迹</h2>
  <div class="grid gap-5 md:grid-cols-2">
    {recentLogs.map(entry => (
      <TraceCard
        title={entry.data.title}
        date={entry.data.date}
        tags={entry.data.tags}
        type={entry.data.type}
        slug={entry.slug}
        cover={entry.data.cover}
        excerpt={entry.body ? entry.body.slice(0, 120) + '...' : undefined}
      />
    ))}
  </div>
  <div class="mt-10 text-center">
    <a
      href="/log"
      class="inline-block font-heading text-sm text-gold hover:text-gold-glow transition-colors tracking-wider uppercase"
    >
      查看全部日志 →
    </a>
  </div>
</section>
```

- [ ] **Step 4: 创建 HarborAbout 组件**

```astro
---
// src/components/HarborAbout.astro
---

<section class="max-w-2xl mx-auto px-6 py-20 text-center">
  <div class="w-12 h-px bg-gold/40 mx-auto mb-8"></div>
  <p class="text-parchment/70 text-base leading-relaxed font-body">
    Walker。一个对一切都保持好奇的人。写代码、做饭、拍照、思考哲学、在路上。
    相信最好的生活状态是：永远在航行，永远对下一片海域充满好奇。
  </p>
</section>
```

- [ ] **Step 5: 创建 scroll-reveal 脚本**

```typescript
// src/scripts/scroll-fade.ts
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
```

- [ ] **Step 6: 创建首页**

```astro
---
// src/pages/index.astro
import Base from '../layouts/Base.astro';
import HeroVideo from '../components/HeroVideo.astro';
import RecentTraces from '../components/RecentTraces.astro';
import HarborAbout from '../components/HarborAbout.astro';
---

<Base title="Walker — 行过万里水路">
  <HeroVideo />
  <RecentTraces />
  <HarborAbout />
  <script src="../scripts/scroll-fade.ts"></script>
</Base>
```

- [ ] **Step 7: 验证首页构建和预览**

```bash
cd "E:/桌面/blog"
npm run build
npx astro preview
```

在浏览器打开 `http://localhost:4321`，检查：
- 页面背景为深靛蓝
- 导航栏显示 "Walker | 港口 | 航海日志 | 指南针"
- 视频区域占满首屏（目前会显示空白因为视频文件还没放，这是预期的）
- 6 张卡片以两列网格排列
- 底部个人区文字显示

- [ ] **Step 8: 提交**

```bash
cd "E:/桌面/blog"
git add src/pages/index.astro src/components/HeroVideo.astro src/components/TraceCard.astro src/components/RecentTraces.astro src/components/HarborAbout.astro src/scripts/
git commit -m "feat: 实现首页港口——视频首屏、最近痕迹、个人区"
```

---

### Task 5: 航海日志列表页

**Files:**
- Create: `src/components/TagFilter.astro`
- Create: `src/pages/log/index.astro`

- [ ] **Step 1: 创建 TagFilter 组件**

```astro
---
// src/components/TagFilter.astro
interface Props {
  tags: string[];
  activeTag?: string;
}

const { tags, activeTag } = Astro.props;
const currentUrl = Astro.url.pathname;
---

<div class="mb-10">
  <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
    <a
      href="/log"
      class:list={[
        'shrink-0 text-xs font-heading tracking-wider px-3 py-1.5 rounded-full transition-colors no-underline',
        !activeTag
          ? 'bg-gold text-sea-deep'
          : 'bg-sea-light/30 text-mist-light hover:text-parchment',
      ]}
    >
      全部
    </a>
    {tags.map(tag => (
      <a
        href={`/log?tag=${encodeURIComponent(tag)}`}
        class:list={[
          'shrink-0 text-xs font-heading tracking-wider px-3 py-1.5 rounded-full transition-colors no-underline',
          activeTag === tag
            ? 'bg-gold text-sea-deep'
            : tag === '哲学'
              ? 'bg-gold/20 text-gold hover:bg-gold/30'
              : 'bg-sea-light/30 text-mist-light hover:text-parchment',
        ]}
      >
        {tag}
      </a>
    ))}
  </div>
</div>

<style>
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
```

- [ ] **Step 2: 创建日志列表页**

```astro
---
// src/pages/log/index.astro
import Base from '../../layouts/Base.astro';
import TagFilter from '../../components/TagFilter.astro';
import TraceCard from '../../components/TraceCard.astro';
import { getCollection } from 'astro:content';

const PAGE_SIZE = 12;

const activeTag = Astro.url.searchParams.get('tag') ?? undefined;

let allLogs = await getCollection('log', ({ data }) => data.published);

if (activeTag) {
  allLogs = allLogs.filter(entry => entry.data.tags.includes(activeTag));
}

allLogs.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

const page = Number(Astro.url.searchParams.get('page') ?? '1');
const totalPages = Math.ceil(allLogs.length / PAGE_SIZE);
const logs = allLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

// 收集所有标签并按频次排序
const tagCount = new Map<string, number>();
allLogs.forEach(entry => {
  entry.data.tags.forEach(tag => {
    tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1);
  });
});
const allTags = [...tagCount.entries()]
  .sort((a, b) => b[1] - a[1])
  .map(([tag]) => tag);
---

<Base title={activeTag ? `${activeTag} — Walker 航海日志` : '航海日志 — Walker'}>
  <div class="max-w-4xl mx-auto px-6 pt-28 pb-20">
    <h1 class="font-heading text-3xl text-parchment mb-8 tracking-wide">航海日志</h1>

    <TagFilter tags={allTags} activeTag={activeTag} />

    {logs.length === 0 ? (
      <p class="text-mist-light text-center py-20">这片海域暂时没有记录。</p>
    ) : (
      <div class="grid gap-5 md:grid-cols-2">
        {logs.map(entry => (
          <TraceCard
            title={entry.data.title}
            date={entry.data.date}
            tags={entry.data.tags}
            type={entry.data.type}
            slug={entry.slug}
            cover={entry.data.cover}
            excerpt={entry.body ? entry.body.slice(0, 120) + '...' : undefined}
          />
        ))}
      </div>
    )}

    {totalPages > 1 && (
      <div class="mt-12 text-center">
        {page < totalPages ? (
          <a
            href={`/log?page=${page + 1}${activeTag ? `&tag=${encodeURIComponent(activeTag)}` : ''}`}
            class="inline-block px-6 py-2.5 rounded-full bg-sea-light/30 text-parchment font-heading text-sm tracking-wider hover:bg-sea-light/50 transition-colors no-underline"
          >
            加载更多
          </a>
        ) : (
          <p class="text-mist text-sm">已到达最后一片海域。</p>
        )}
      </div>
    )}
  </div>
  <script src="../../scripts/scroll-fade.ts"></script>
</Base>
```

- [ ] **Step 3: 验证构建和预览**

```bash
cd "E:/桌面/blog"
npm run build
npx astro preview
```

在浏览器打开 `http://localhost:4321/log`，检查：
- 标题 "航海日志"
- 标签筛选条显示所有标签，哲学标签金色
- 内容卡片两列排列
- 点击标签筛选正常
- "加载更多" 按钮功能正常

- [ ] **Step 4: 提交**

```bash
cd "E:/桌面/blog"
git add src/components/TagFilter.astro src/pages/log/
git commit -m "feat: 实现航海日志列表页——标签筛选、分页加载"
```

---

### Task 6: 日志详情页

**Files:**
- Create: `src/pages/log/[...slug].astro`

- [ ] **Step 1: 创建日志详情页**

```astro
---
// src/pages/log/[...slug].astro
import Base from '../../layouts/Base.astro';
import { getCollection } from 'astro:content';

const { slug } = Astro.params;
const entry = await getCollection('log').then(entries =>
  entries.find(e => e.slug === slug && e.data.published)
);

if (!entry) {
  return Astro.redirect('/404');
}

const formatDate = (d: Date) =>
  d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
---

<Base title={`${entry.data.title} — Walker`} description={entry.body?.slice(0, 160)}>
  <article class="max-w-3xl mx-auto px-6 pt-28 pb-20">
    <!-- 头部 -->
    <header class="mb-12">
      <div class="flex items-center gap-3 mb-4">
        <time class="text-mist-light text-sm font-mono">{formatDate(entry.data.date)}</time>
        <div class="flex gap-1.5">
          {entry.data.tags.map(tag => (
            <a
              href={`/log?tag=${encodeURIComponent(tag)}`}
              class:list={[
                'text-xs px-2 py-0.5 rounded no-underline transition-colors',
                tag === '哲学'
                  ? 'bg-gold/20 text-gold hover:bg-gold/30'
                  : 'bg-sea-light/30 text-mist-light hover:text-parchment',
              ]}
            >
              {tag}
            </a>
          ))}
        </div>
      </div>
      <h1 class="font-heading text-3xl md:text-4xl text-parchment leading-tight">
        {entry.data.title}
      </h1>
    </header>

    {entry.data.type === 'photo' && entry.data.cover && (
      <div class="mb-10 rounded-lg overflow-hidden">
        <img
          src={entry.data.cover}
          alt={entry.data.title}
          class="w-full"
          loading="lazy"
        />
      </div>
    )}

    <!-- 正文 -->
    <div class="prose prose-invert prose-parchment max-w-none
                prose-headings:font-heading prose-headings:text-parchment
                prose-p:text-parchment/85 prose-p:leading-relaxed
                prose-a:text-gold prose-a:no-underline hover:prose-a:text-gold-glow
                prose-code:text-gold prose-code:bg-sea-deep prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                prose-pre:bg-sea-deep prose-pre:border prose-pre:border-mist/20
                prose-blockquote:border-gold/40 prose-blockquote:text-parchment/70
                prose-img:rounded-lg
                prose-hr:border-mist/20">
      <entry.Content />
    </div>

    <!-- 底部导航 -->
    <footer class="mt-16 pt-8 border-t border-mist/20">
      <a href="/log" class="text-gold font-heading text-sm tracking-wider hover:text-gold-glow transition-colors no-underline">
        ← 返回航海日志
      </a>
    </footer>
  </article>
</Base>
```

- [ ] **Step 2: 配置 prose 样式（Tailwind typography 插件）**

```bash
cd "E:/桌面/blog"
npm install @tailwindcss/typography
```

在 `tailwind.config.mjs` 中添加插件：

```javascript
// tailwind.config.mjs — 仅展示变更部分
export default {
  // ... theme 配置不变 ...
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
```

- [ ] **Step 3: 验证构建和预览**

```bash
cd "E:/桌面/blog"
npm run build
npx astro preview
```

在浏览器中点击任一日志卡片，检查：
- 文章标题、日期、标签正确显示
- Markdown 内容正确渲染
- 代码块有语法高亮
- "返回航海日志" 链接正常
- 页面整体深色背景配暖白文字

- [ ] **Step 4: 提交**

```bash
cd "E:/桌面/blog"
git add src/pages/log/\[\...slug\].astro tailwind.config.mjs package.json package-lock.json
git commit -m "feat: 实现日志详情页——Markdown 渲染、代码高亮、prose 排版"
```

---

### Task 7: 指南针页面（标签图谱）

**Files:**
- Create: `src/components/TagMap.astro`
- Create: `src/pages/compass.astro`

- [ ] **Step 1: 创建 TagMap 组件**

```astro
---
// src/components/TagMap.astro
import TraceCard from './TraceCard.astro';

interface TagInfo {
  name: string;
  count: number;
  entries: Array<{
    title: string;
    date: Date;
    tags: string[];
    type: 'article' | 'photo' | 'thought' | 'project';
    slug: string;
    cover?: string;
    excerpt?: string;
  }>;
}

interface Props {
  tags: TagInfo[];
}

const { tags } = Astro.props;
const maxCount = Math.max(...tags.map(t => t.count));
---

<div class="space-y-16">
  {/* 标签图谱 */}
  <div class="flex flex-wrap gap-3 justify-center">
    {tags.map(tag => {
      const ratio = tag.count / maxCount;
      const size = ratio > 0.7 ? 'text-2xl' : ratio > 0.4 ? 'text-xl' : 'text-base';
      return (
        <a
          href={`#tag-${tag.name}`}
          class:list={[
            'no-underline font-heading px-4 py-2 rounded-lg transition-all duration-200',
            'hover:scale-105 hover:shadow-lg',
            size,
            tag.name === '哲学'
              ? 'bg-gold/20 text-gold hover:bg-gold/30 shadow-gold/10'
              : 'bg-sea-light/30 text-parchment hover:bg-sea-light/50',
          ]}
          style={`opacity: ${0.5 + ratio * 0.5}`}
        >
          {tag.name}
          <span class="ml-1 text-xs opacity-60">{tag.count}</span>
        </a>
      );
    })}
  </div>

  {/* 分隔线 */}
  <div class="w-24 h-px bg-gold/30 mx-auto"></div>

  {/* 各标签内容列表 */}
  {tags.map(tag => (
    <section id={`tag-${tag.name}`}>
      <div class="flex items-center gap-3 mb-6">
        <h2 class:list={[
          'font-heading text-xl',
          tag.name === '哲学' ? 'text-gold' : 'text-parchment',
        ]}>
          {tag.name}
        </h2>
        <span class="text-mist text-sm">{tag.count} 篇</span>
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        {tag.entries.map(entry => (
          <TraceCard {...entry} />
        ))}
      </div>
    </section>
  ))}
</div>
```

- [ ] **Step 2: 创建指南针页面**

```astro
---
// src/pages/compass.astro
import Base from '../layouts/Base.astro';
import TagMap from '../components/TagMap.astro';
import { getCollection } from 'astro:content';

const allLogs = await getCollection('log', ({ data }) => data.published);

// 收集标签数据
const tagMap = new Map<string, Array<{
  title: string;
  date: Date;
  tags: string[];
  type: 'article' | 'photo' | 'thought' | 'project';
  slug: string;
  cover?: string;
  excerpt?: string;
}>>();

allLogs.forEach(entry => {
  entry.data.tags.forEach(tag => {
    if (!tagMap.has(tag)) tagMap.set(tag, []);
    tagMap.get(tag)!.push({
      title: entry.data.title,
      date: entry.data.date,
      tags: entry.data.tags,
      type: entry.data.type,
      slug: entry.slug,
      cover: entry.data.cover,
      excerpt: entry.body ? entry.body.slice(0, 120) + '...' : undefined,
    });
  });
});

const tags = [...tagMap.entries()]
  .map(([name, entries]) => ({
    name,
    count: entries.length,
    entries: entries.sort((a, b) => b.date.getTime() - a.date.getTime()),
  }))
  .sort((a, b) => b.count - a.count);

const totalPosts = allLogs.length;
const totalTags = tags.length;
---

<Base title="指南针 — Walker">
  <div class="max-w-4xl mx-auto px-6 pt-28 pb-20">
    <div class="text-center mb-16">
      <h1 class="font-heading text-3xl text-parchment mb-4 tracking-wide">指南针</h1>
      <p class="text-mist-light text-base">
        {totalPosts} 篇日志，{totalTags} 个方向
      </p>
      <p class="mt-4 text-parchment/50 text-sm max-w-md mx-auto leading-relaxed">
        不定义自己是什么，而是展示自己关注什么。点击任一方向，探索那片海域。
      </p>
    </div>

    <TagMap tags={tags} />
  </div>
  <script src="../scripts/scroll-fade.ts"></script>
</Base>
```

- [ ] **Step 3: 验证构建和预览**

```bash
cd "E:/桌面/blog"
npm run build
npx astro preview
```

在浏览器打开 `http://localhost:4321/compass`，检查：
- 标签图谱以不同大小显示
- 哲学标签金色高亮
- 每个标签显示内容数量
- 点击标签跳转到对应内容列表
- 每个标签下列出相关内容卡片

- [ ] **Step 4: 提交**

```bash
cd "E:/桌面/blog"
git add src/components/TagMap.astro src/pages/compass.astro
git commit -m "feat: 实现指南针页面——标签图谱、兴趣统计"
```

---

### Task 8: 响应式适配与移动端优化

**Files:**
- Modify: `src/components/Navigation.astro`

- [ ] **Step 1: 为导航添加移动端汉堡菜单**

在 Navigation.astro 中追加移动端菜单按钮和展开逻辑：

```astro
---
// src/components/Navigation.astro
const navItems = [
  { label: '港口', href: '/' },
  { label: '航海日志', href: '/log' },
  { label: '指南针', href: '/compass' },
];

const currentPath = Astro.url.pathname;
---

<nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" id="main-nav">
  <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="/" class="font-heading text-xl text-parchment hover:text-gold transition-colors no-underline">
      Walker
    </a>

    <!-- 桌面端导航 -->
    <div class="hidden md:flex gap-8">
      {navItems.map(item => (
        <a
          href={item.href}
          class:list={[
            'font-heading text-sm tracking-wider uppercase no-underline transition-colors duration-200',
            currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href))
              ? 'text-gold'
              : 'text-mist-light hover:text-parchment',
          ]}
        >
          {item.label}
        </a>
      ))}
    </div>

    <!-- 移动端汉堡按钮 -->
    <button
      class="md:hidden text-parchment p-2"
      id="menu-toggle"
      aria-label="打开菜单"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
  </div>

  <!-- 移动端菜单 -->
  <div class="md:hidden hidden bg-sea-deep/95 backdrop-blur-md" id="mobile-menu">
    <div class="px-6 py-4 flex flex-col gap-4">
      {navItems.map(item => (
        <a
          href={item.href}
          class:list={[
            'font-heading text-base tracking-wider uppercase no-underline transition-colors duration-200',
            currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href))
              ? 'text-gold'
              : 'text-mist-light hover:text-parchment',
          ]}
        >
          {item.label}
        </a>
      ))}
    </div>
  </div>
</nav>

<script>
  // 滚动时导航背景
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    if (!nav) return;
    if (window.scrollY > 80) {
      nav.classList.add('bg-sea-deep/90', 'backdrop-blur-md');
    } else {
      nav.classList.remove('bg-sea-deep/90', 'backdrop-blur-md');
    }
  });

  // 移动端菜单切换
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  toggle?.addEventListener('click', () => {
    menu?.classList.toggle('hidden');
  });
</script>
```

- [ ] **Step 2: 验证移动端表现**

```bash
cd "E:/桌面/blog"
npm run build
npx astro preview
```

在浏览器中按 F12 → 切换到移动端模拟（如 iPhone 14），检查：
- 汉堡菜单显示正常
- 点击展开/折叠菜单
- 卡片单列排列
- 视频全屏覆盖
- 标签筛选条可横向滚动

- [ ] **Step 3: 提交**

```bash
cd "E:/桌面/blog"
git add src/components/Navigation.astro
git commit -m "feat: 添加移动端汉堡菜单和响应式适配"
```

---

### Task 9: 部署配置与最终验证

**Files:**
- Create: `vercel.json`
- Create: `public/favicon.svg`

- [ ] **Step 1: 创建 Vercel 配置**

```json
{
  "framework": "astro",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

- [ ] **Step 2: 创建 favicon（简约船形 SVG）**

```xml
<!-- public/favicon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="4" fill="#0a1628"/>
  <path d="M16 6 L16 22 M16 8 L24 18 L16 16 Z" stroke="#d4af37" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
  <path d="M8 24 Q12 22 16 24 Q20 22 24 24" stroke="#4a5568" stroke-width="1" fill="none"/>
</svg>
```

- [ ] **Step 3: 完整构建测试**

```bash
cd "E:/桌面/blog"
npm run build
```

Expected: 构建成功，`dist/` 目录包含所有页面。

- [ ] **Step 4: 本地全面预览**

```bash
npx astro preview
```

逐页检查：
- `/` — 视频首屏（暂显示降级图）、最近痕迹、个人区
- `/log` — 日志列表、标签筛选、分页
- `/log/hello-walker` — 详情页、Markdown 渲染
- `/compass` — 标签图谱、内容展开
- 导航：页面间跳转正常
- 移动端：F12 模拟响应式正常

- [ ] **Step 5: 提交**

```bash
cd "E:/桌面/blog"
git add vercel.json public/favicon.svg
git commit -m "feat: 添加 Vercel 部署配置和 favicon"
```

---

## 实施后待办（用户侧）

1. **生成首页视频**：使用 Task 4 中的 AI 视频提示词，生成 `hero.webm` 放入 `public/video/`
2. **替换静态降级图**：将原始「夜海孤帆」图片放入 `public/video/hero-fallback.jpg`
3. **确认首页标语**：替换所有 "行过万里水路，记录每一次停靠" 为最终文案
4. **确认个人简介**：编辑 `HarborAbout.astro` 中的简介文字
5. **对接 Obsidian**：将 `src/content/log/` 链接或映射到 Obsidian vault
6. **Vercel 部署**：连接 Git 仓库，推送即部署
7. **删除示例内容**：替换为自己的真实内容
