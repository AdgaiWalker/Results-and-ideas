# UI Image Generation Prompts

Generation model: `gpt-image-2`
Output size: `1536x1024`
Quality: `high`
Mode: screenshot-informed image edit

All prompt files in `docs/ui-image-generation/prompts/` share the same visual contract:

- Preserve the real route layout and information hierarchy from the source screenshot.
- Use Walker Blog's warm off-white, mint/cyan, glass-panel visual system.
- Keep the interface Chinese-first and Lucide-like.
- Generate polished concept UI images for documentation, not live UI replacements.
- Avoid watermarks, fake brands, generic SaaS hero art, decorative blobs, and unrelated objects.

Route prompt files:

| Slug | Prompt file | Source screenshot | Final image |
| --- | --- | --- | --- |
| `home` | `docs/ui-image-generation/prompts/home.txt` | `docs/ui-image-generation/source-screenshots/home.png` | `public/images/ui-generated/home.png` |
| `posts` | `docs/ui-image-generation/prompts/posts.txt` | `docs/ui-image-generation/source-screenshots/posts.png` | `public/images/ui-generated/posts.png` |
| `post-detail` | `docs/ui-image-generation/prompts/post-detail.txt` | `docs/ui-image-generation/source-screenshots/post-detail.png` | `public/images/ui-generated/post-detail.png` |
| `ai-learn` | `docs/ui-image-generation/prompts/ai-learn.txt` | `docs/ui-image-generation/source-screenshots/ai-learn.png` | `public/images/ui-generated/ai-learn.png` |
| `ai-sources` | `docs/ui-image-generation/prompts/ai-sources.txt` | `docs/ui-image-generation/source-screenshots/ai-sources.png` | `public/images/ui-generated/ai-sources.png` |
| `ai-toolkit` | `docs/ui-image-generation/prompts/ai-toolkit.txt` | `docs/ui-image-generation/source-screenshots/ai-toolkit.png` | `public/images/ui-generated/ai-toolkit.png` |
| `ai-ideas` | `docs/ui-image-generation/prompts/ai-ideas.txt` | `docs/ui-image-generation/source-screenshots/ai-ideas.png` | `public/images/ui-generated/ai-ideas.png` |
| `explore` | `docs/ui-image-generation/prompts/explore.txt` | `docs/ui-image-generation/source-screenshots/explore.png` | `public/images/ui-generated/explore.png` |
| `explore-detail` | `docs/ui-image-generation/prompts/explore-detail.txt` | `docs/ui-image-generation/source-screenshots/explore-detail.png` | `public/images/ui-generated/explore-detail.png` |
| `about` | `docs/ui-image-generation/prompts/about.txt` | `docs/ui-image-generation/source-screenshots/about.png` | `public/images/ui-generated/about.png` |
| `not-found` | `docs/ui-image-generation/prompts/not-found.txt` | `docs/ui-image-generation/source-screenshots/not-found.png` | `public/images/ui-generated/not-found.png` |
