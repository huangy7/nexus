# JSON Studio (JSON 工坊) 设计规范

## 1. 概述 (Overview)
JSON Studio 是 Nexus 开发者极速工作台中的 JSON 格式化、解析、校验与转化工具。本次升级旨在参考 json.cn 的核心优秀交互体验，在保持现有双分栏 layout 架构的基础上，大幅提升 JSON 树状层级渲染、语法高亮、转义/去转义、Unicode 编码转换以及精确错误定位能力。

## 2. 界面与布局设计 (Layout & UI Architecture)

### 2.1 左右双分栏工作台 (Dual-Pane Workbench)
- **左栏 (Raw Input Pane / 原生输入区)**:
  - 放置原生 JSON 代码输入框 `textarea`，具备自动换行、实时语法检验能力。
  - **左栏工具栏**:
    - `📄 示例数据 (Sample Data)`
    - `🔤 转义 / 反转义 (Escape / Unescape)`
    - `🌐 Unicode 转换 (Unicode Decode)`
    - `🗑️ 清空 (Clear)`
- **右栏 (Interactive Tree & Highlighting View / 树状节点与高亮呈现区)**:
  - 可交互的渲染容器，支持层级缩进、节点收起与展开、元素计数与高亮语法显示。
  - **右栏工具栏**:
    - `✨ 格式化 (Format)`
    - `⚡ 压缩 (Minify)`
    - `展开全部 / 折叠全部 (Expand All / Collapse All)`
    - `📋 复制 (Copy)`
    - `📥 下载 JSON (Download .json)`

## 3. 语法高亮与树状节点折叠 (Syntax Highlighting & Tree Folding)

### 3.1 语法高亮调色盘 (Color Palette)
- **Key (键名)**: `--aurora-cyan` (`#00f0ff` / 浅色模式 `#0284c7`)
- **String (字符串值)**: `--aurora-emerald` (`#00ff9d` / 浅色模式 `#16a34a`)
- **Number (数值)**: `--aurora-amber` (`#f59e0b`)
- **Boolean / Null (布尔与空值)**: `--aurora-purple` (`#a855f7`)

### 3.2 树状节点折叠机制 (Collapsible Tree Folding)
- 每个对象 `{}` 与数组 `[]` 的开括号旁带有折叠图标（`▼` 展开 / `▶` 折叠）。
- 点击折叠图标时：
  - 节点收起为内联摘要，例如 `{ 4 items }` 或 `[ 12 items ]`。
  - 再度点击即可展平展开。
- 支持整树全部展开与全部收起的快捷按钮。

## 4. 辅助转化工具功能规范 (Transformation Utilities)

### 4.1 转义 / 反转义 (Escape / Unescape)
- **反转义 (Unescape)**：把带有 `\"` 和 `\\` 斜杠转义的字符串（例 `"{\"a\":1}"`）还原为干净的 JSON 对象字符串 `{"a":1}`。
- **转义 (Escape)**：把当前 JSON 对象转义为可直接放入代码字符串中的 `\"` 表达式。

### 4.2 Unicode 转换 (Unicode Decode / Encode)
- 将 `\u4e2d\u6587` 等 16 进制 Unicode 编码序列瞬间解码转换为可读中文汉字；反之亦可进行 Unicode 编码。

## 5. 错误定位与检验 (Error Handling & Precision Inspection)
- 当用户输入的 JSON 语法非法时：
  - 自动捕获 `SyntaxError` 并在右栏展示带有美观告警样式的错误卡片。
  - 提取具体错误行号与列号（例如：`❌ 语法错误 (第 14 行，第 8 列): Unexpected token '}'`）。

## 6. 国际化 (i18n)
- 关联 `src/js/modules/i18n.js` 中的 `zh-CN` 与 `en-US` 字典，保证工具栏按钮、提示文字、错误信息全量支持中英文实时切换。
