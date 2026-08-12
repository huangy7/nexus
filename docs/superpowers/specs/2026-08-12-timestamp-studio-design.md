# ⏱️ 时间戳工坊 (Timestamp Studio) Design Specification

## Overview

时间戳转换是开发者日常高频使用的核心工具之一。本文档定义了 **Nexus 时间戳工坊 (Timestamp Studio)** 的全面升级规范，涵盖动态晶体数字时钟、智能双向转换、多时区实时对照卡片以及多语言代码速查表。

---

## 1. 架构与组件设计

### 1.1 顶部：动态晶体数字时钟栏 (Live Clock Banner)
- **实时显示**：每秒/毫秒动态刷新当前 Epoch 时间戳（秒 10位 / 毫秒 13位）。
- **操作按钮**：
  - `⚡ 填入当前时间`：将当前时间秒数/毫秒数快速填充至下方转换输入框。
  - `⏸️ 暂停 / ▶️ 恢复`：暂停/恢复顶部时钟的自动跳动。
  - `📋 复制秒` / `📋 复制毫秒`：快捷复制当前时间戳。

### 1.2 中部：双栏双向转换器 (Split Bi-directional Converter)

#### 左栏：时间戳 ➡️ 日期时间 (Timestamp -> Human Date)
- **智能识别**：自动判断 10位 (s)、13位 (ms)、16位 (μs)、19位 (ns) 时间戳，无需用户手动切单位。
- **转换输出项**：
  - 标准日期时间格式：`YYYY-MM-DD HH:mm:ss`
  - ISO 8601 标准字符串：`2026-08-12T14:58:46.377Z`
  - 相对时间描述（人性化时间格式）：如 `3 分钟前` / `2 小时后`
  - UTC 协调世界时

#### 右栏：日期时间 ➡️ 时间戳 (Human Date -> Timestamp)
- **输入支持**：
  - 日期时间选择器控件（原生 `<input type="datetime-local">` 结合文本框）
  - 支持常见日期格式文本解析（如 `2026-08-12 14:58:46`, `2026-08-12`, `2026/08/12 14:58` 等）
- **转换输出项**：
  - 10位 Unix 秒级时间戳 (s)
  - 13位 Unix 毫秒级时间戳 (ms)

### 1.3 底部：扩展功能 (Extensions Grid)

#### 1.3.1 全球常用时区对照卡片 (Global Timezone Cards)
根据当前输入的时间（或默认当前时间），实时显示以下主要时区的时间：
- 🇨🇳 北京/上海 (Asia/Shanghai, UTC+8)
- 🌐 协调世界时 (UTC)
- 🇺🇸 美东时间 (America/New_York, UTC-4/5)
- 🇺🇸 美西时间 (America/Los_Angeles, UTC-7/8)
- 🇬🇧 伦敦时间 (Europe/London, UTC+0/1)
- 🇯🇵 东京时间 (Asia/Tokyo, UTC+9)

#### 1.3.2 常用编程语言时间戳速查表 (Code Snippets)
提供开发常用语言获取当前时间戳的代码片段，右上角附带一键复制：
- **JavaScript**: `Math.floor(Date.now() / 1000)` / `Date.now()`
- **Python**: `import time; int(time.time())`
- **Java**: `System.currentTimeMillis() / 1000`
- **Go**: `time.Now().Unix()`
- **Rust**: `SystemTime::now().duration_since(UNIX_EPOCH)`
- **SQL (MySQL)**: `SELECT UNIX_TIMESTAMP();`

---

## 2. 模块划分

- `src/js/modules/time-util.js`: 时间戳自动识别、格式化、时区计算、相对时间计算及各语言代码片段提取。
- `src/css/main.css`: 补充时间戳顶部数字时钟卡片 `.time-clock-banner`、时区网格 `.tz-grid`、代码速查卡片 `.code-snippet-card` 样式。
- `src/js/main.js`: `id === 'time'` 阶段的 DOM 渲染与事件绑定（时钟定时器、输入监听、复制与填入逻辑）。

---

## 3. 验证计划 (Verification Plan)

- 校验 10/13/16/19 位时间戳自动解析精确无误。
- 校验日期选择器与手动格式输入的实时双向转换。
- 使用 `ego-browser` 在 `http://localhost:3000` 执行端到端测试，验证全局时区卡片与代码速查复制功能。
- 执行 `npm run build` 确保生产环境打包零 Error。
