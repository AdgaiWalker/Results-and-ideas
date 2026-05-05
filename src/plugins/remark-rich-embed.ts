import { visit } from 'unist-util-visit';
import type { Root, Image } from 'mdast';

// 从 B 站 URL 中提取 BV ID
function parseBilibili(url: string): string | null {
  const match = url.match(/bilibili\.com\/video\/(BV[\w]+)/i);
  return match ? match[1] : null;
}

// 从 YouTube URL 中提取 video ID
function parseYouTube(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}

// 判断是否为音频链接
function isAudioUrl(url: string): boolean {
  return /\.(mp3|wav|ogg|m4a)(\?.*)?$/i.test(url);
}

// 判断是否为 GitHub 仓库链接
function parseGitHub(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([\w-]+)\/([\w.-]+?)(?:\/|$)/);
  return match ? { owner: match[1], repo: match[2] } : null;
}

export default function remarkRichEmbed() {
  return (tree: Root) => {
    visit(tree, 'image', (node: Image, index: number | undefined, parent: any) => {
      if (index === undefined || !parent) return;
      const url = node.url;

      // B 站视频
      const bvId = parseBilibili(url);
      if (bvId) {
        parent.children[index] = {
          type: 'html',
          value: `<div class="rich-embed rich-embed-video">
  <div class="rich-embed-ratio">
    <iframe src="https://player.bilibili.com/player.html?bvid=${bvId}&autoplay=0"
      scrolling="no" border="0" frameborder="no" framespacing="0"
      allowfullscreen="true"
      class="rich-embed-iframe"
      loading="lazy">
    </iframe>
  </div>
  <a href="${url}" target="_blank" rel="noopener noreferrer" class="rich-embed-link">
    <iconify-icon icon="lucide:external-link" width="12" height="12"></iconify-icon>
    在 B 站观看
  </a>
</div>`,
        };
        return;
      }

      // YouTube 视频
      const ytId = parseYouTube(url);
      if (ytId) {
        parent.children[index] = {
          type: 'html',
          value: `<div class="rich-embed rich-embed-video">
  <div class="rich-embed-ratio">
    <iframe src="https://www.youtube.com/embed/${ytId}"
      allowfullscreen="true"
      class="rich-embed-iframe"
      loading="lazy">
    </iframe>
  </div>
  <a href="${url}" target="_blank" rel="noopener noreferrer" class="rich-embed-link">
    <iconify-icon icon="lucide:external-link" width="12" height="12"></iconify-icon>
    在 YouTube 观看
  </a>
</div>`,
        };
        return;
      }

      // 音频
      if (isAudioUrl(url)) {
        const title = node.alt || '音频';
        parent.children[index] = {
          type: 'html',
          value: `<div class="rich-embed rich-embed-audio">
  <div class="rich-embed-audio-bar">
    <iconify-icon icon="lucide:music" width="16" height="16" class="rich-embed-audio-icon"></iconify-icon>
    <span class="rich-embed-audio-title">${title}</span>
  </div>
  <audio controls class="rich-embed-audio-player" preload="metadata">
    <source src="${url}" />
  </audio>
</div>`,
        };
        return;
      }

      // GitHub 仓库
      const gh = parseGitHub(url);
      if (gh) {
        parent.children[index] = {
          type: 'html',
          value: `<div class="rich-embed rich-embed-github">
  <a href="${url}" target="_blank" rel="noopener noreferrer" class="rich-embed-github-link">
    <iconify-icon icon="lucide:github" width="18" height="18" class="rich-embed-github-icon"></iconify-icon>
    <div class="rich-embed-github-info">
      <span class="rich-embed-github-repo">${gh.owner}/${gh.repo}</span>
      <span class="rich-embed-github-domain">github.com</span>
    </div>
    <iconify-icon icon="lucide:arrow-up-right" width="14" height="14" class="rich-embed-github-arrow"></iconify-icon>
  </a>
</div>`,
        };
        return;
      }

      // 其他链接：富链接卡
      const domain = (() => {
        try { return new URL(url).hostname; } catch { return ''; }
      })();
      const title = node.alt || '';
      if (domain) {
        parent.children[index] = {
          type: 'html',
          value: `<div class="rich-embed rich-embed-linkcard">
  <a href="${url}" target="_blank" rel="noopener noreferrer" class="rich-embed-linkcard-link">
    <div class="rich-embed-linkcard-info">
      <span class="rich-embed-linkcard-title">${title || domain}</span>
      <span class="rich-embed-linkcard-domain">${domain}</span>
    </div>
    <iconify-icon icon="lucide:external-link" width="14" height="14" class="rich-embed-linkcard-icon"></iconify-icon>
  </a>
</div>`,
        };
      }
    });
  };
}
