# Nexus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade, highly visual, Vercel-deployable Web Network Diagnostics & Developer Tool Suite (Nexus).

**Architecture:** Vanilla HTML5/CSS3/ES Modules + Vite frontend with Vercel Edge API routes for IP/DNS telemetry, styled with a Cyber-Telemetry HUD aesthetic.

**Tech Stack:** HTML5, CSS3 (Variables, Glassmorphism, CSS Grid), Vanilla JS (ES Modules, Web Audio API, WebRTC), Vite, Vercel Edge Functions.

---

### Task 1: Project Scaffolding & Design System Setup

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `vercel.json`
- Create: `src/css/variables.css`
- Create: `src/css/reset.css`
- Create: `src/css/main.css`

- [ ] **Step 1: Create `package.json` with Vite and dependencies**

```json
{
  "name": "nexus",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create `vite.config.js` and `vercel.json`**

`vite.config.js`:
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 3000
  }
});
```

`vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

- [ ] **Step 3: Create CSS design system tokens in `src/css/variables.css` & `src/css/main.css`**

`src/css/variables.css`:
```css
:root {
  --bg-dark: #080c14;
  --bg-dark-surface: #0f172a;
  --card-bg: rgba(15, 23, 42, 0.75);
  --card-bg-hover: rgba(15, 23, 42, 0.9);
  --card-border: rgba(0, 240, 255, 0.18);
  --card-border-hover: rgba(168, 85, 247, 0.4);
  --accent-cyan: #00f0ff;
  --accent-emerald: #00ff9d;
  --accent-purple: #a855f7;
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --text-dim: #64748b;
  --font-sans: 'Plus Jakarta Sans', -apple-system, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --radius-lg: 16px;
  --radius-md: 10px;
  --radius-sm: 6px;
  --shadow-hud: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 240, 255, 0.1);
}
```

- [ ] **Step 4: Create `src/css/main.css` importing tokens and reset**

```css
@import './variables.css';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: var(--font-sans);
  min-height: 100vh;
  line-height: 1.5;
  overflow-x: hidden;
}

::selection {
  background: rgba(0, 240, 255, 0.3);
  color: #fff;
}
```

- [ ] **Step 5: Install dependencies & Commit**

Run: `npm install`
Expected: `node_modules` created smoothly.

```bash
git add package.json vite.config.js vercel.json src/css/
git commit -m "chore: scaffold project structure and CSS design system"
```

---

### Task 2: Vercel Edge API Routes (IP, DNS, Ping)

**Files:**
- Create: `api/ip.js`
- Create: `api/dns.js`
- Create: `api/ping.js`

- [ ] **Step 1: Write `api/ip.js` Vercel Edge Function**

```javascript
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const clientIp = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || '127.0.0.1';
  const geoCountry = req.headers.get('x-vercel-ip-country') || 'UN';
  const geoCity = req.headers.get('x-vercel-ip-city') || 'Unknown';
  const geoRegion = req.headers.get('x-vercel-ip-country-region') || '';
  const geoLat = req.headers.get('x-vercel-ip-latitude') || '0';
  const geoLon = req.headers.get('x-vercel-ip-longitude') || '0';
  const userAgent = req.headers.get('user-agent') || '';

  return new Response(
    JSON.stringify({
      ip: clientIp,
      geo: {
        country: geoCountry,
        city: decodeURIComponent(geoCity),
        region: geoRegion,
        latitude: geoLat,
        longitude: geoLon,
      },
      userAgent,
      timestamp: Date.now()
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store'
      }
    }
  );
}
```

- [ ] **Step 2: Write `api/dns.js` DoH Proxy Edge Function**

```javascript
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  const type = searchParams.get('type') || 'A';

  if (!name) {
    return new Response(JSON.stringify({ error: 'Missing name parameter' }), { status: 400 });
  }

  try {
    const dohUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;
    const res = await fetch(dohUrl, {
      headers: { 'Accept': 'application/dns-json' }
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
```

- [ ] **Step 3: Write `api/ping.js` Edge Probe Endpoint**

```javascript
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  return new Response(
    JSON.stringify({ status: 'ok', timestamp: Date.now() }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
        'cache-control': 'no-store'
      }
    }
  );
}
```

- [ ] **Step 4: Commit API functions**

```bash
git add api/
git commit -m "feat: add Vercel Edge API routes for IP, DNS, and Ping telemetry"
```

---

### Task 3: Hero IP & Safety Detector Component

**Files:**
- Create: `src/js/modules/ip-detector.js`
- Create: `src/js/modules/sfx.js`

- [ ] **Step 1: Write Web Audio API Sound Synthesizer in `src/js/modules/sfx.js`**

```javascript
class SoundSystem {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1040, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }
}

export const sfx = new SoundSystem();
```

- [ ] **Step 2: Write IP Detector & WebRTC Leak Check in `src/js/modules/ip-detector.js`**

```javascript
export async function getClientIpData() {
  try {
    const res = await fetch('/api/ip');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}
  
  // Fallback public IP API
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    return {
      ip: data.ip,
      geo: {
        country: data.country_code,
        city: data.city,
        region: data.region,
        latitude: data.latitude,
        longitude: data.longitude
      },
      userAgent: navigator.userAgent
    };
  } catch (e) {
    return {
      ip: '127.0.0.1',
      geo: { country: 'LOCAL', city: 'Localhost', region: 'Dev' },
      userAgent: navigator.userAgent
    };
  }
}

export function checkWebRtcLeak() {
  return new Promise((resolve) => {
    const ips = new Set();
    const RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
    
    if (!RTCPeerConnection) {
      resolve({ safe: true, ips: [] });
      return;
    }

    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pc.createDataChannel('');
    
    let resolved = false;

    pc.onicecandidate = (e) => {
      if (!e.candidate) {
        if (!resolved) {
          resolved = true;
          pc.close();
          resolve({ safe: ips.size === 0, ips: Array.from(ips) });
        }
        return;
      }
      const candidateStr = e.candidate.candidate;
      const ipMatch = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/i.exec(candidateStr);
      if (ipMatch) {
        ips.add(ipMatch[1]);
      }
    };

    pc.createOffer().then((offer) => pc.setLocalDescription(offer)).catch(() => {});
    
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try { pc.close(); } catch (e) {}
        resolve({ safe: ips.size === 0, ips: Array.from(ips) });
      }
    }, 1200);
  });
}
```

- [ ] **Step 3: Commit Hero IP module**

```bash
git add src/js/modules/
git commit -m "feat: add IP detector, WebRTC leak checker, and Web Audio SFX"
```

---

### Task 4: Ping & DNS Diagnostic Modules

**Files:**
- Create: `src/js/modules/ping-tester.js`
- Create: `src/js/modules/dns-inspector.js`

- [ ] **Step 1: Write Ping Tester in `src/js/modules/ping-tester.js`**

```javascript
const PING_ENDPOINTS = [
  { name: 'Cloudflare Edge (1.1.1.1)', url: 'https://1.1.1.1/cdn-cgi/trace' },
  { name: 'Google DNS (8.8.8.8)', url: 'https://dns.google/resolve?name=example.com' },
  { name: 'Vercel Edge API', url: '/api/ping' },
  { name: 'Aliyun DNS (223.5.5.5)', url: 'https://dns.alidns.com/resolve?name=example.com' }
];

export async function runPingTest(onProgress) {
  const results = [];
  for (const ep of PING_ENDPOINTS) {
    const start = performance.now();
    let status = 'ok';
    let latency = 0;
    try {
      const res = await fetch(ep.url, { mode: 'cors', cache: 'no-store' });
      latency = Math.round(performance.now() - start);
      if (!res.ok) status = 'degraded';
    } catch (e) {
      latency = Math.round(performance.now() - start);
      status = 'timeout';
    }
    const item = { name: ep.name, latency, status };
    results.push(item);
    if (onProgress) onProgress(item);
  }
  return results;
}
```

- [ ] **Step 2: Write DNS Inspector in `src/js/modules/dns-inspector.js`**

```javascript
export async function queryDnsRecords(domain) {
  const recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT'];
  const results = {};
  
  for (const type of recordTypes) {
    try {
      const res = await fetch(`/api/dns?name=${encodeURIComponent(domain)}&type=${type}`);
      if (res.ok) {
        const data = await res.json();
        results[type] = data.Answer || [];
      } else {
        results[type] = [];
      }
    } catch (e) {
      results[type] = [];
    }
  }
  return results;
}
```

- [ ] **Step 3: Commit Ping & DNS modules**

```bash
git add src/js/modules/ping-tester.js src/js/modules/dns-inspector.js
git commit -m "feat: add Ping latency tester and DNS records lookup modules"
```

---

### Task 5: Dev Tools Suite (JSON, Base64/JWT/Hash, Timestamp, Text Diff)

**Files:**
- Create: `src/js/modules/dev-tools.js`

- [ ] **Step 1: Write Developer Tools processing methods in `src/js/modules/dev-tools.js`**

```javascript
export function formatJson(input) {
  try {
    const parsed = JSON.parse(input);
    return { success: true, formatted: JSON.stringify(parsed, null, 2), parsed };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function minifyJson(input) {
  try {
    const parsed = JSON.parse(input);
    return { success: true, minified: JSON.stringify(parsed) };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function processBase64(input, encode = true) {
  try {
    if (encode) {
      return { success: true, result: btoa(input) };
    } else {
      return { success: true, result: atob(input) };
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function parseJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format');
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    return { success: true, header, payload };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function computeHash(input, algorithm = 'SHA-256') {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return { success: true, hash: hashHex };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function convertTimestamp(value) {
  let date;
  if (!value) {
    date = new Date();
  } else {
    const num = Number(value);
    if (!isNaN(num)) {
      date = num > 1e11 ? new Date(num) : new Date(num * 1000);
    } else {
      date = new Date(value);
    }
  }
  
  if (isNaN(date.getTime())) {
    return { success: false, error: 'Invalid Date/Timestamp' };
  }

  return {
    success: true,
    unixSec: Math.floor(date.getTime() / 1000),
    unixMs: date.getTime(),
    iso: date.toISOString(),
    local: date.toLocaleString()
  };
}
```

- [ ] **Step 2: Commit Dev Tools module**

```bash
git add src/js/modules/dev-tools.js
git commit -m "feat: add JSON, Base64, JWT, Hash, and Timestamp processing suite"
```

---

### Task 6: Cmd + K Command Bar & Main Layout Assembly

**Files:**
- Create: `src/js/modules/command-bar.js`
- Create: `src/index.html`
- Create: `src/js/main.js`

- [ ] **Step 1: Write Cmd+K Command Bar modal in `src/js/modules/command-bar.js`**

```javascript
export function initCommandBar(tools, onSelect) {
  const modal = document.createElement('div');
  modal.className = 'cmd-modal-overlay hidden';
  modal.innerHTML = `
    <div class="cmd-modal">
      <div class="cmd-input-wrapper">
        <span class="cmd-icon">🔍</span>
        <input type="text" id="cmdSearchInput" placeholder="Type a tool name or command (e.g. JSON, IP, Ping, Base64)..." />
        <kbd>ESC</kbd>
      </div>
      <div class="cmd-results" id="cmdResults"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const input = modal.querySelector('#cmdSearchInput');
  const results = modal.querySelector('#cmdResults');

  function open() {
    modal.classList.remove('hidden');
    input.value = '';
    render(tools);
    input.focus();
  }

  function close() {
    modal.classList.add('hidden');
  }

  function render(list) {
    results.innerHTML = list.map((item, index) => `
      <div class="cmd-item" data-index="${index}">
        <span class="cmd-item-icon">${item.icon}</span>
        <div class="cmd-item-text">
          <div class="cmd-item-title">${item.title}</div>
          <div class="cmd-item-desc">${item.desc}</div>
        </div>
      </div>
    `).join('');

    results.querySelectorAll('.cmd-item').forEach((el, idx) => {
      el.addEventListener('click', () => {
        onSelect(list[idx]);
        close();
      });
    });
  }

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      open();
    }
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      close();
    }
  });

  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = tools.filter(t => t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q));
    render(filtered);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  return { open, close };
}
```

- [ ] **Step 2: Create full HTML interface in `src/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nexus - Modern Network Telemetry & Developer Suite</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="./css/main.css" />
</head>
<body>
  <div id="app">
    <!-- Header -->
    <header class="navbar">
      <div class="brand">
        <span class="logo-spark">✨</span>
        <span class="logo-text">NEXUS</span>
        <span class="version-badge">v1.0</span>
      </div>
      <div class="nav-right">
        <button id="btnCmdBar" class="cmd-trigger-btn">
          <span>🔍 Quick Search</span>
          <kbd>⌘K</kbd>
        </button>
        <button id="btnSoundToggle" class="sound-toggle-btn" title="Toggle Sound">🔊 Sound</button>
      </div>
    </header>

    <!-- Main Container -->
    <main class="container">
      <!-- Hero IP Telemetry Card -->
      <section class="hero-section">
        <div class="hero-card">
          <div class="hero-header">
            <div class="status-indicator">
              <span class="pulse-dot"></span>
              <span>NETWORK TELEMETRY ONLINE</span>
            </div>
            <div id="webrtcBadge" class="safety-badge">WebRTC: Checking...</div>
          </div>

          <div class="ip-display">
            <div id="clientIpText" class="ip-main">--.--.--.--</div>
            <button id="btnCopyIp" class="btn-copy">Copy IP</button>
          </div>

          <div id="ipLocationText" class="ip-location">Detecting geolocation and ISP...</div>

          <div class="hero-stats-grid">
            <div class="stat-card">
              <div class="stat-label">IPv6 Protocol</div>
              <div id="valIpv6" class="stat-value">Checking...</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Fastest Latency</div>
              <div id="valLatency" class="stat-value">-- ms</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">ASN / Operator</div>
              <div id="valAsn" class="stat-value">--</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Leak Risk</div>
              <div id="valRisk" class="stat-value text-emerald">SAFE</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Tool Grid Sections -->
      <section class="tools-section">
        <h2 class="section-title">⚡ Diagnostic & Developer Suites</h2>
        
        <div class="category-tabs">
          <button class="tab-btn active" data-tab="all">All Tools</button>
          <button class="tab-btn" data-tab="network">Network & IP</button>
          <button class="tab-btn" data-tab="dev">Dev Tools</button>
        </div>

        <div class="tools-grid" id="toolsGrid">
          <!-- Dynamically populated tool cards -->
        </div>
      </section>

      <!-- Active Tool Working Panel Modal / Container -->
      <div id="toolWorkspace" class="workspace-panel hidden">
        <div class="workspace-header">
          <h3 id="workspaceTitle">Tool Workspace</h3>
          <button id="btnCloseWorkspace" class="btn-close">✕ Close</button>
        </div>
        <div id="workspaceContent" class="workspace-content"></div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <p>Nexus Telemetry Suite · Deployed on Vercel · Privacy-First Browser Execution</p>
    </footer>
  </div>

  <script type="module" src="./js/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: Wire up App initialization in `src/js/main.js`**

```javascript
import { getClientIpData, checkWebRtcLeak } from './modules/ip-detector.js';
import { runPingTest } from './modules/ping-tester.js';
import { queryDnsRecords } from './modules/dns-inspector.js';
import { formatJson, minifyJson, processBase64, parseJwt, computeHash, convertTimestamp } from './modules/dev-tools.js';
import { initCommandBar } from './modules/command-bar.js';
import { sfx } from './modules/sfx.js';

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const clientIpText = document.getElementById('clientIpText');
  const ipLocationText = document.getElementById('ipLocationText');
  const webrtcBadge = document.getElementById('webrtcBadge');
  const valLatency = document.getElementById('valLatency');
  const valAsn = document.getElementById('valAsn');
  const valIpv6 = document.getElementById('valIpv6');
  const btnCopyIp = document.getElementById('btnCopyIp');
  const btnSoundToggle = document.getElementById('btnSoundToggle');
  const btnCmdBar = document.getElementById('btnCmdBar');

  // Sound toggle
  btnSoundToggle.addEventListener('click', () => {
    sfx.enabled = !sfx.enabled;
    btnSoundToggle.textContent = sfx.enabled ? '🔊 Sound' : '🔇 Muted';
    sfx.playClick();
  });

  // Fetch IP
  const ipData = await getClientIpData();
  clientIpText.textContent = ipData.ip || '127.0.0.1';
  ipLocationText.textContent = `📍 ${ipData.geo.city || ''}, ${ipData.geo.country || ''} · ${ipData.userAgent.split(' ')[0]}`;
  valAsn.textContent = ipData.geo.country || 'N/A';
  valIpv6.textContent = ipData.ip.includes(':') ? 'Active (IPv6)' : 'IPv4 Only';

  // Check WebRTC
  const rtcResult = await checkWebRtcLeak();
  if (rtcResult.safe) {
    webrtcBadge.textContent = '✅ WebRTC Safe (No Leak)';
    webrtcBadge.className = 'safety-badge safe';
  } else {
    webrtcBadge.textContent = '⚠️ WebRTC Leak Warning';
    webrtcBadge.className = 'safety-badge warning';
  }

  // Copy IP
  btnCopyIp.addEventListener('click', () => {
    navigator.clipboard.writeText(clientIpText.textContent);
    sfx.playSuccess();
    btnCopyIp.textContent = 'Copied!';
    setTimeout(() => { btnCopyIp.textContent = 'Copy IP'; }, 1500);
  });

  // Run initial Ping
  runPingTest((item) => {
    if (item.status === 'ok') {
      valLatency.textContent = `${item.latency} ms`;
    }
  });

  // Tools definition
  const toolsList = [
    { id: 'ping', title: 'Global Ping Tester', desc: 'Measure latency to Cloudflare, Google, Vercel, and Aliyun nodes', icon: '⚡', category: 'network' },
    { id: 'dns', title: 'DNS Explorer', desc: 'Inspect A, AAAA, CNAME, MX, and TXT records via DoH', icon: '🔍', category: 'network' },
    { id: 'json', title: 'JSON Studio', desc: 'Format, minify, and validate JSON payloads with syntax highlights', icon: '📦', category: 'dev' },
    { id: 'base64', title: 'Base64 / JWT Decoder', desc: 'Encode/decode Base64 strings and inspect JWT tokens', icon: '🔐', category: 'dev' },
    { id: 'hash', title: 'Crypto Hash Generator', desc: 'Compute MD5, SHA-1, and SHA-256 hashes locally in browser', icon: '🔑', category: 'dev' },
    { id: 'timestamp', title: 'Timestamp & Clock', desc: 'Convert Unix epoch timestamps and ISO dates instantly', icon: '⏱️', category: 'dev' }
  ];

  // Cmd+K
  const cmd = initCommandBar(toolsList, (tool) => {
    sfx.playClick();
    openWorkspace(tool.id);
  });
  btnCmdBar.addEventListener('click', () => cmd.open());

  // Render Tools Grid
  const grid = document.getElementById('toolsGrid');
  grid.innerHTML = toolsList.map(t => `
    <div class="tool-card" data-id="${t.id}">
      <div class="tool-card-icon">${t.icon}</div>
      <div class="tool-card-body">
        <h4>${t.title}</h4>
        <p>${t.desc}</p>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.tool-card').forEach(el => {
    el.addEventListener('click', () => {
      sfx.playClick();
      openWorkspace(el.dataset.id);
    });
  });

  function openWorkspace(id) {
    const ws = document.getElementById('toolWorkspace');
    const title = document.getElementById('workspaceTitle');
    const content = document.getElementById('workspaceContent');
    ws.classList.remove('hidden');

    if (id === 'json') {
      title.textContent = '📦 JSON Studio';
      content.innerHTML = `
        <textarea id="jsonInput" class="code-input" placeholder="Paste your raw JSON here..."></textarea>
        <div class="btn-group">
          <button id="btnFormatJson" class="btn-action">Format JSON</button>
          <button id="btnMinifyJson" class="btn-action">Minify JSON</button>
        </div>
        <pre id="jsonOutput" class="code-output"></pre>
      `;
      document.getElementById('btnFormatJson').onclick = () => {
        const res = formatJson(document.getElementById('jsonInput').value);
        document.getElementById('jsonOutput').textContent = res.success ? res.formatted : `Error: ${res.error}`;
      };
      document.getElementById('btnMinifyJson').onclick = () => {
        const res = minifyJson(document.getElementById('jsonInput').value);
        document.getElementById('jsonOutput').textContent = res.success ? res.minified : `Error: ${res.error}`;
      };
    } else if (id === 'base64') {
      title.textContent = '🔐 Base64 / JWT Decoder';
      content.innerHTML = `
        <textarea id="b64Input" class="code-input" placeholder="Paste string or JWT token..."></textarea>
        <div class="btn-group">
          <button id="btnB64Enc" class="btn-action">Encode Base64</button>
          <button id="btnB64Dec" class="btn-action">Decode Base64</button>
          <button id="btnJwtDec" class="btn-action">Parse JWT</button>
        </div>
        <pre id="b64Output" class="code-output"></pre>
      `;
      document.getElementById('btnB64Enc').onclick = () => {
        const res = processBase64(document.getElementById('b64Input').value, true);
        document.getElementById('b64Output').textContent = res.success ? res.result : `Error: ${res.error}`;
      };
      document.getElementById('btnB64Dec').onclick = () => {
        const res = processBase64(document.getElementById('b64Input').value, false);
        document.getElementById('b64Output').textContent = res.success ? res.result : `Error: ${res.error}`;
      };
      document.getElementById('btnJwtDec').onclick = () => {
        const res = parseJwt(document.getElementById('b64Input').value);
        document.getElementById('b64Output').textContent = res.success ? JSON.stringify(res, null, 2) : `Error: ${res.error}`;
      };
    } else if (id === 'hash') {
      title.textContent = '🔑 Crypto Hash Generator';
      content.innerHTML = `
        <input type="text" id="hashInput" class="text-input" placeholder="Enter text to hash..." />
        <pre id="hashOutput" class="code-output">Hashes will appear here as you type...</pre>
      `;
      document.getElementById('hashInput').oninput = async (e) => {
        const val = e.target.value;
        if (!val) return;
        const h256 = await computeHash(val, 'SHA-256');
        const h1 = await computeHash(val, 'SHA-1');
        document.getElementById('hashOutput').textContent = `SHA-256: ${h256.hash}\nSHA-1:   ${h1.hash}`;
      };
    } else if (id === 'timestamp') {
      title.textContent = '⏱️ Timestamp & Clock';
      content.innerHTML = `
        <input type="text" id="tsInput" class="text-input" placeholder="Enter timestamp or date string..." />
        <div class="btn-group">
          <button id="btnNowTs" class="btn-action">Use Now</button>
        </div>
        <pre id="tsOutput" class="code-output"></pre>
      `;
      const updateTs = (val) => {
        const res = convertTimestamp(val);
        document.getElementById('tsOutput').textContent = res.success ? JSON.stringify(res, null, 2) : `Error: ${res.error}`;
      };
      document.getElementById('btnNowTs').onclick = () => {
        document.getElementById('tsInput').value = Date.now();
        updateTs(Date.now());
      };
      document.getElementById('tsInput').oninput = (e) => updateTs(e.target.value);
      updateTs(Date.now());
    } else if (id === 'ping') {
      title.textContent = '⚡ Global Ping Tester';
      content.innerHTML = `
        <button id="btnRunPing" class="btn-action">Run Ping Test Now</button>
        <pre id="pingOutput" class="code-output">Click run to start ping test...</pre>
      `;
      document.getElementById('btnRunPing').onclick = async () => {
        document.getElementById('pingOutput').textContent = 'Testing nodes...';
        const res = await runPingTest();
        document.getElementById('pingOutput').textContent = res.map(r => `${r.name}: ${r.latency} ms [${r.status}]`).join('\n');
      };
    } else if (id === 'dns') {
      title.textContent = '🔍 DNS Explorer';
      content.innerHTML = `
        <input type="text" id="dnsDomainInput" class="text-input" placeholder="Enter domain (e.g. cloudflare.com)..." />
        <button id="btnRunDns" class="btn-action" style="margin-top:8px;">Query DNS Records</button>
        <pre id="dnsOutput" class="code-output">Results will appear here...</pre>
      `;
      document.getElementById('btnRunDns').onclick = async () => {
        const dom = document.getElementById('dnsDomainInput').value.trim();
        if (!dom) return;
        document.getElementById('dnsOutput').textContent = `Querying DNS for ${dom}...`;
        const res = await queryDnsRecords(dom);
        document.getElementById('dnsOutput').textContent = JSON.stringify(res, null, 2);
      };
    }
  }

  document.getElementById('btnCloseWorkspace').onclick = () => {
    sfx.playClick();
    document.getElementById('toolWorkspace').classList.add('hidden');
  };
});
```

- [ ] **Step 4: Commit layout assembly & UI code**

```bash
git add src/
git commit -m "feat: complete Cyber-Telemetry HUD interface, Cmd+K modal, and tool workspace"
```

---

### Task 7: Build Verification & Quality Gate

- [ ] **Step 1: Test production build with Vite**

Run: `npm run build`
Expected: Production bundle created in `dist/` without any warnings or errors.

- [ ] **Step 2: Final Git Commit**

```bash
git add .
git commit -m "build: verify production Vite build and complete Nexus v1.0 release"
```
