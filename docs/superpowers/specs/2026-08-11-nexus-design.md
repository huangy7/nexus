# Nexus - Modern Network Diagnostics & Developer Tool Suite Design Spec

## 1. Overview & Positioning
Nexus is a modern, high-performance, visually striking web network diagnostics and developer tool suite.
It combines `ip.cx`'s deep IP & network telemetry capabilities with a rich suite of developer utility tools (JSON format/diff, Base64, JWT, Hash, Timestamp, Text Diff), encased in a Cyber-Telemetry HUD & Glass Slate visual aesthetic.
Deployed seamlessly on Vercel with zero server overhead and full privacy-first browser execution.

---

## 2. Architecture & Tech Stack

### 2.1 Tech Stack
- **Frontend Core**: Vanilla HTML5 / CSS3 / ES Modules + Vite (Instant HMR, 0kb bundle bloat, maximum performance).
- **Styling**: Modern CSS System (CSS Custom Properties, Glassmorphism, CSS Grid, Responsive Container Queries).
- **Backend & APIs**: Vercel Serverless / Edge API Routes (`/api/ip`, `/api/dns`, `/api/ping`).
- **Icons & Fonts**: Lucide Icons, `Plus Jakarta Sans` (UI Headings), `JetBrains Mono` (Telemetry & Code).

### 2.2 Directory Structure (`/Users/huangy/codes/workspace/nexus`)
```
nexus/
├── api/
│   ├── ip.js          # Vercel Edge API for IP, GeoIP, ISP, Headers
│   ├── dns.js         # Edge DNS query wrapper (DoH)
│   └── ping.js        # Edge latency probe
├── public/
│   ├── favicon.svg
│   └── sounds/        # Subtle Web Audio / synthetic SFX assets
├── src/
│   ├── css/
│   │   ├── reset.css
│   │   ├── variables.css
│   │   ├── typography.css
│   │   ├── components.css
│   │   └── main.css
│   ├── js/
│   │   ├── modules/
│   │   │   ├── ip-detector.js   # IP, GeoIP, WebRTC leak check
│   │   │   ├── ping-tester.js   # Multi-node latency tester
│   │   │   ├── dns-inspector.js # DoH lookup logic
│   │   │   ├── dev-tools.js     # JSON/Base64/Hash/Timestamp/Diff
│   │   │   ├── command-bar.js   # Cmd+K modal & fuzzy filter
│   │   │   └── sfx.js           # Web Audio API subtle feedback
│   │   └── main.js
│   └── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

---

## 3. Core Modules

### 3.1 Hero Suite: Network & IP Diagnostics
1. **Hero IP Card (`ip-detector.js`)**:
   - IPv4 and IPv6 dual-stack detection.
   - GeoIP details (Country flag, City, Region, ISP, ASN).
   - Real-time WebRTC Leak Detection via `RTCPeerConnection`.
2. **Ping & Latency Tester (`ping-tester.js`)**:
   - Multi-endpoint latency check (Cloudflare, Google, Vercel, AliDNS) with animated latency status dots.
3. **DNS & WHOIS Explorer (`dns-inspector.js`)**:
   - Query A, AAAA, CNAME, MX, TXT records with formatted status tags.

### 3.2 Dev Tools Suite (`dev-tools.js`)
1. **JSON Studio**: Format, minify, tree view, and two-way JSON diff.
2. **Base64 / JWT / Hash Suite**: Base64 encode/decode, JWT payload inspector, MD5/SHA256 hasher.
3. **Timestamp & Cron**: Epoch seconds/ms converter, current live clock, Cron expression reader.
4. **Text Diff**: Side-by-side or inline text diff checking.

### 3.3 Command Bar (`command-bar.js`)
- `Cmd + K` / `Ctrl + K` global hotkey launcher modal for instant tool filtering and IP lookup.

---

## 4. Visual Aesthetics & Design Tokens
- Colors: Obsidian `#080c14`, Glass Card `rgba(15, 23, 42, 0.75)`, Cyber Cyan `#00f0ff`, Emerald Green `#00ff9d`, Violet Accent `#a855f7`.
- Borders: `1px solid rgba(0, 240, 255, 0.18)`.
- Effects: Backdrop blur (`backdrop-filter: blur(16px)`), CSS pulse-glow animations, subtle audio click feedback.

---

## 5. Verification & Deployment
- Local dev verification with Vite (`npm run dev`).
- Production build verification (`npm run build`).
- Ready for GitHub push + Vercel deployment.
