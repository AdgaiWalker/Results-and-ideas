---
title: 用 Claude Code 自动生成 PR 审查报告
scenario: 每次提 PR 都要手动审查 diff，耗时且容易遗漏。写一个 GitHub Action，在 PR 创建时自动调用 Claude 生成审查报告，包含风险评估、测试覆盖建议和代码质量评分。
tags: [AI, 工具, 开源]
date: 2026-05-05
followups:
  - who: 小A
    status: exploring
    note: 在调研 GitHub Action + Claude API 的集成方案
---
