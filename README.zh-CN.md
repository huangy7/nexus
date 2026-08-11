<div align="center">

# 🌐 NEXUS 开发者工作台

**现代、隐私优先的网络诊断与开发者实用工具箱**

*零点击网络检测 · 实时响应转换器 · 极简美学双主题工作台*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![Built with Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)

[English](README.md) • [简体中文](README.zh-CN.md)

</div>

---

## ✨ 核心特性

- **⚡ 零点击网络遥测 (Zero-Click Telemetry)**：打开页面无需任何额外点击，自动实时检测你的公网 IPv4/v6、地理位置（国家/城市）及 WebRTC 安全泄漏状态。
- **🔄 实时响应工作台 (Live Reactive Workspaces)**：
  - **JSON 工坊**：输入或粘贴的同时自动进行格式化、压缩及实时语法错误校验。
  - **编解码与哈希**：支持 Base64 编解码、JWT Payload 载荷解析，同步生成 SHA-256 / SHA-1 哈希值。
  - **时间戳转换**：Unix 时间戳（秒/毫秒）与 ISO 8601、本地时间、UTC 标准时间双向实时转换。
- **🌐 网络诊断工具箱**：
  - **Ping 延迟测速**：全球多区域边缘节点响应时间实测。
  - **DNS 全记录查询**：一键查询任意域名的 A、AAAA、MX 及 TXT 记录。
- **☀️ 浅色 / 🌙 深色双主题**：高对比度清爽浅色模式与赛博暗黑模式自由切换，支持 `localStorage` 偏好保存。
- **✨ 动态鼠标粒子星空**：基于 HTML5 Canvas 的主题自适应交互粒子矩阵，随鼠标移动产生吸引与连线。
- **🌍 完整国际化支持**：原生内置多语言切换（简体中文、繁體中文、English、日本語）。
- **🚀 开发者体验优化 (Quality of Life)**：
  - **⌘K Spotlight 搜索**：键盘快捷调出全局工具搜索框。
  - **示例数据一键预设**：一键载入 JSON、JWT、域名等测试样例数据。
  - **Toast 微提示与合成音效**：基于 Web Audio API 声音合成的即时非阻塞消息反馈。

---

## 🛠️ 技术栈

- **核心框架**：原生 ES6+ Modules（零重型 UI 框架负担）
- **构建工具**：[Vite 5](https://vitejs.dev/)
- **样式系统**：CSS3 Variables 变量系统、毛玻璃 (Glassmorphism)、响应式网格
- **边缘 API**：Vercel Edge Functions (IP 地理位置与 DNS 查询)
- **音频引擎**：Web Audio API 纯代码合成音效

---

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) (v18.0.0 或更高版本)
- `npm` 或 `pnpm`

### 本地开发

1. **克隆项目仓库**：
   ```bash
   git clone https://github.com/your-username/nexus.git
   cd nexus
   ```

2. **安装依赖**：
   ```bash
   npm install
   ```

3. **启动本地开发服务器**：
   ```bash
   npm run dev
   ```
   在浏览器访问 `http://localhost:3000`。

4. **打包生产环境**：
   ```bash
   npm run build
   ```

---

## 📂 项目结构

```
nexus/
├── api/                   # Vercel Edge API 路由 (ip.js, dns.js, ping.js)
├── public/                # 静态资源
├── src/
│   ├── css/
│   │   ├── variables.css  # 浅色/深色主题设计变量
│   │   └── main.css       # 响应式 UI 与组件布局
│   ├── js/
│   │   ├── modules/       # 解耦功能模块
│   │   │   ├── canvas-bg.js    # 动态粒子星空
│   │   │   ├── dev-tools.js    # JSON、编解码与时间戳逻辑
│   │   │   ├── dns-inspector.js# DNS 查询逻辑
│   │   │   ├── i18n.js         # 多语言翻译引擎
│   │   │   ├── ip-detector.js  # IP 与 WebRTC 泄漏检测
│   │   │   ├── ping-tester.js  # 全球 Ping 测速执行器
│   │   │   ├── sfx.js          # Web Audio 音频合成器
│   │   │   └── toast.js        # 消息提示 Toast
│   │   └── main.js        # 应用初始化与 DOM 绑定
│   └── index.html         # 应用入口文件
├── vercel.json            # Vercel 部署配置
└── vite.config.js         # Vite 构建配置
```

---

## 🔒 隐私与安全

Nexus 秉承隐私优先的设计理念：
- **纯客户端计算**：所有代码格式化、编解码、哈希计算与时间戳转换均完全在你的浏览器本地进行。敏感 JSON、JWT Token 及明文数据绝不会离开你的设备。
- **无追踪器**：零第三方追踪脚本与遥测统计。

---

## 📄 开源协议

本项目采用 [MIT 许可证](LICENSE)。
