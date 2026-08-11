<div align="center">

# 🌐 NEXUS

**Modern, Privacy-First Network & Developer Utility Workbench**

*Instant telemetry, live reactive converters, and theme-aware aesthetics — all in one clean workspace.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![Built with Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)

[English](README.md) • [简体中文](README.zh-CN.md)

</div>

---

## ✨ Features

- **⚡ Zero-Click Telemetry Bar**: Automatically detects your Public IPv4/v6, Geolocation (Country/City), and WebRTC Leak Status on page load — no extra clicks required.
- **🔄 Live Reactive Workspaces**:
  - **JSON Studio**: Real-time formatting, minification, and instant syntax validation as you type.
  - **Encoder & Crypto**: Live Base64 encoding/decoding, JWT token payload parsing, and SHA-256/SHA-1 hash calculation.
  - **Timestamp Converter**: Bi-directional conversion between Unix epoch timestamps (s/ms), ISO 8601, and local/UTC datetimes.
- **🌐 Network Diagnostic Suite**:
  - **Ping Latency Tester**: Measures multi-region edge node response times.
  - **DNS Inspector**: Query A, AAAA, MX, and TXT DNS records for any domain.
- **☀️ Light & 🌙 Dark Mode**: High-contrast, beautifully refined light theme alongside a sleek night theme with localStorage persistence.
- **✨ Interactive Particle Canvas**: Theme-aware HTML5 Canvas particle matrix that reacts to mouse movement.
- **🌍 Full Internationalization**: Built-in multi-language support (English, 简体中文, 繁體中文, 日本語).
- **🚀 Developer Quality-of-Life**:
  - **Cmd+K Spotlight Search**: Instant keyboard launcher for all tools.
  - **Sample Data Presets**: One-click test datasets for JSON, JWT, and domains.
  - **Toast Notifications & SFX**: Non-intrusive feedback alerts backed by Web Audio API chord synthesis.

---

## 🛠️ Tech Stack

- **Core Framework**: Vanilla ES6+ Modules (Zero heavy UI framework overhead)
- **Bundler**: [Vite 5](https://vitejs.dev/)
- **Styling**: Modern CSS3 Custom Properties, Glassmorphism, Responsive Grid
- **Edge API**: Vercel Edge Functions (IP Geo & DNS Lookup)
- **Audio Engine**: Web Audio API (Synthesizer SFX)

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- `npm` or `pnpm`

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/nexus.git
   cd nexus
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```
nexus/
├── api/                   # Vercel Edge API Routes (ip.js, dns.js, ping.js)
├── public/                # Static assets
├── src/
│   ├── css/
│   │   ├── variables.css  # Light & Dark design system tokens
│   │   └── main.css       # Responsive UI & component layout
│   ├── js/
│   │   ├── modules/       # Decoupled utility modules
│   │   │   ├── canvas-bg.js    # Interactive particle matrix
│   │   │   ├── dev-tools.js    # JSON, Codec, & Timestamp logic
│   │   │   ├── dns-inspector.js# DNS resolver logic
│   │   │   ├── i18n.js         # Multi-language translation engine
│   │   │   ├── ip-detector.js  # IP & WebRTC leak detector
│   │   │   ├── ping-tester.js  # Global ping latency runner
│   │   │   ├── sfx.js          # Web Audio synthesizer
│   │   │   └── toast.js        # Notification toasts
│   │   └── main.js        # Application bootstrap & DOM bindings
│   └── index.html         # Application entry point
├── vercel.json            # Vercel deployment configuration
└── vite.config.js         # Vite bundler configuration
```

---

## 🔒 Privacy & Security

Nexus is designed with privacy in mind:
- **Client-Side First**: Code formatting, encoding, hashing, and timestamp conversions happen entirely inside your browser. Your sensitive JSON, JWT tokens, and plain text never leave your device.
- **Zero Tracker**: No third-party tracking scripts or telemetry analytics.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
