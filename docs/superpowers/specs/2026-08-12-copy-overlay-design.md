# 📋 悬浮式复制按键与上下文复制反馈 (Floating Copy Overlay) Design Specification

## Overview

在Nexus项目中的多工具界面（JSON工坊、编解码/哈希工坊、IP检测、时间戳等）集中存在“复制按钮指向不明确”的问题。本文档定义了 **方案 B（悬浮式角落复制与上下文明确反馈）** 的设计与实现规范。

---

## 1. 核心改进设计

### 1.1 机制原则
1. **移除顶部模糊的全局复制**：取消工具栏（如 `stageActions`）中未明确指向的全局“复制”按钮。
2. **区域悬浮按键（Floating Copy Button）**：在每一个可复制的文本区域（输入框、输出树图、哈希结果卡片、JWT字段等）右上角添加独立悬浮复制按钮。
3. **悬浮显示逻辑（Hover & Focus）**：
   - 默认状态：暗色主题下呈现为低调半透明图标或渐隐（`opacity: 0.4`）。
   - 悬浮/聚焦（Hover / Focus）：按键提升显眼度（`opacity: 1`）并带微交互提升效果。
4. **状态反馈（Feedback）**：
   - 点击后图标与文案瞬时切换为 `✔ 已复制`（持续 1.5 秒）。
   - 同时配合精准 Toast 提示（如：“已复制 JSON 树图结果”、“已复制 MD5 哈希”）。

---

## 2. 各模块应用细节

### 2.1 JSON 工坊 (JSON Studio)
- **左栏 (INPUT)**：右上角悬浮按钮 `📋 复制源码`（点击复制原始输入）。
- **右栏 (OUTPUT)**：右上角悬浮按钮 `📋 复制结果`（点击复制当前渲染的树图/压缩文本）。

### 2.2 编解码/哈希工坊 (Codec & Hash)
- **Base64 / URL / HTML 实体**：
  - 左栏：`📋 复制源码`
  - 右栏：`📋 复制结果`
- **全算法哈希 (Multi-Hash)**：
  - 各算法卡片（MD5, SHA-1, SHA-256, SHA-512）右上角保留独立 `📋 复制` 按钮，点击复制对应哈希值。
- **JWT 解包**：
  - Header 卡片：右上角 `📋 复制 Header`
  - Payload 卡片：右上角 `📋 复制 Payload`
  - Signature 卡片：右上角 `📋 复制 Signature`

### 2.3 顶部 IP 广播栏 (IP Telemetry)
- IP 地址卡片旁保留 `📋` 按钮，气泡提示 `复制 IP 地址`。

---

## 3. 样式与组件规范 (`src/css/main.css`)

```css
/* 悬浮复制按键基类 */
.copy-overlay-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0.5;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--card-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 0.72rem;
  font-family: var(--font-sans);
  cursor: pointer;
  z-index: 10;
}

.copy-overlay-container {
  position: relative;
}

.copy-overlay-container:hover .copy-overlay-btn,
.copy-overlay-btn:focus {
  opacity: 1;
  background: var(--card-bg-hover);
  border-color: var(--aurora-cyan);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.copy-overlay-btn.copied {
  opacity: 1;
  border-color: var(--aurora-emerald);
  color: var(--aurora-emerald);
  background: rgba(0, 255, 157, 0.12);
}
```

---

## 4. 验证 plan (Verification Plan)

- 检查所有页面的顶部 `stageActions` 区域不再有歧义复制按钮。
- 在 JSON 工坊、Codec 5大子选项卡分别测试悬浮复制功能。
- 验证复制到剪贴板的内容正确无误，且带有明确的 Toast 提示。
