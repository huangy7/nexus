import { getClientIpData, checkWebRtcLeak } from './modules/ip-detector.js';
import { runPingTest } from './modules/ping-tester.js';
import { queryDnsRecords } from './modules/dns-inspector.js';
import { formatJson, minifyJson, processBase64, parseJwt, computeHash, convertTimestamp, SAMPLES } from './modules/dev-tools.js';
import { sfx } from './modules/sfx.js';
import { i18n } from './modules/i18n.js';
import { toast } from './modules/toast.js';
import { initCyberCanvas, setCanvasTheme } from './modules/canvas-bg.js';

document.addEventListener('DOMContentLoaded', () => {
  // ====== Mouse Glow Follower ======
  const mouseGlow = document.getElementById('mouseGlow');
  document.addEventListener('mousemove', (e) => {
    mouseGlow.style.left = e.clientX + 'px';
    mouseGlow.style.top = e.clientY + 'px';
  });

  // ====== Theme Switcher & Particle Canvas ======
  const themeToggle = document.getElementById('themeToggle');
  let currentTheme = localStorage.getItem('nexus_theme') || 'light';

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nexus_theme', theme);
    themeToggle.textContent = theme === 'light' ? '☀️ Light' : '🌙 Dark';
    setCanvasTheme(theme);
  }

  // Init theme & particle matrix canvas
  applyTheme(currentTheme);
  initCyberCanvas(currentTheme);

  themeToggle.addEventListener('click', () => {
    sfx.playClick();
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
    toast.info(`Theme switched to ${nextTheme.toUpperCase()}`);
  });

  // ====== Sound Toggle ======
  const sfxToggle = document.getElementById('sfxToggle');
  sfxToggle.addEventListener('click', () => {
    sfx.enabled = !sfx.enabled;
    sfxToggle.textContent = sfx.enabled ? '🔊' : '🔇';
    sfxToggle.classList.toggle('off', !sfx.enabled);
    if (sfx.enabled) sfx.playClick();
  });

  // ====== i18n Init ======
  const langSelect = document.getElementById('langSelect');
  langSelect.value = i18n.currentLang;
  i18n.updateDom();
  langSelect.addEventListener('change', (e) => {
    sfx.playClick();
    i18n.set(e.target.value);
    switchTool(currentToolId);
  });

  // ====== ZERO-CLICK IP TICKER INIT ======
  let cachedIpData = null;
  async function initZeroClickIp() {
    const tickerIp = document.getElementById('tickerIp');
    const tickerGeo = document.getElementById('tickerGeo');
    const badge = document.getElementById('webrtcBadge');

    try {
      cachedIpData = await getClientIpData();
      tickerIp.textContent = cachedIpData.ip;
      tickerGeo.textContent = `${cachedIpData.geo.country} · ${cachedIpData.geo.city || cachedIpData.geo.region}`;

      // Click ticker to copy IP
      document.getElementById('ipTicker').addEventListener('click', () => {
        if (cachedIpData && cachedIpData.ip) {
          navigator.clipboard.writeText(cachedIpData.ip);
          sfx.playSuccess();
          toast.success(`${i18n.t('toast_copied')} (${cachedIpData.ip})`);
        }
      });
    } catch (e) {
      tickerIp.textContent = 'IP Fetch Failed';
    }

    try {
      const rtc = await checkWebRtcLeak();
      if (rtc.safe) {
        badge.textContent = `🛡️ ${i18n.t('status_safe')}`;
        badge.className = 'webrtc-badge safe';
      } else {
        badge.textContent = `⚠️ ${i18n.t('status_leak')}`;
        badge.className = 'webrtc-badge leak';
      }
    } catch (e) {}
  }
  initZeroClickIp();

  // ====== Tools Definition ======
  function getTools() {
    return [
      { id: 'json',  icon: '{ }', title: i18n.t('json_title'),  desc: i18n.t('json_desc') },
      { id: 'codec', icon: '🔐', title: i18n.t('codec_title'), desc: i18n.t('codec_desc') },
      { id: 'time',  icon: '⏱',  title: i18n.t('time_title'),  desc: i18n.t('time_desc') },
      { id: 'ip',    icon: '📡', title: i18n.t('ip_title'),    desc: i18n.t('ip_desc') },
      { id: 'ping',  icon: '⚡', title: i18n.t('ping_title'),  desc: i18n.t('ping_desc') },
      { id: 'dns',   icon: '🔍', title: i18n.t('dns_title'),   desc: i18n.t('dns_desc') },
    ];
  }

  // ====== Active Tool State & Navigation ======
  let currentToolId = 'json';

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      sfx.playClick();
      switchTool(item.dataset.id);
    });
  });

  function switchTool(id) {
    currentToolId = id;
    navItems.forEach(el => el.classList.toggle('active', el.dataset.id === id));
    const tool = getTools().find(t => t.id === id);
    if (!tool) return;

    document.getElementById('stageIcon').textContent = tool.icon;
    document.getElementById('stageTitle').textContent = tool.title;
    document.getElementById('stageDesc').textContent = tool.desc;

    renderToolStage(id);
  }

  // ====== Render Main Stage Content ======
  const stageActions = document.getElementById('stageActions');
  const stageContent = document.getElementById('stageContent');

  function renderToolStage(id) {
    if (id === 'json') {
      stageActions.innerHTML = `
        <button class="btn-tool-action" id="btnJsonSample">${i18n.t('btn_sample')}</button>
        <button class="btn-tool-action" id="btnJsonMinify">${i18n.t('btn_minify')}</button>
        <button class="btn-tool-action btn-tool-primary" id="btnJsonCopy">${i18n.t('btn_copy')}</button>
        <button class="btn-tool-action" id="btnJsonClear">${i18n.t('btn_clear')}</button>
      `;
      stageContent.innerHTML = `
        <div class="split-editor">
          <div class="editor-pane">
            <div class="pane-label"><span>INPUT (JSON)</span></div>
            <textarea class="stage-textarea" id="jsonInput" placeholder="Paste or type JSON here..."></textarea>
          </div>
          <div class="editor-pane">
            <div class="pane-label"><span>OUTPUT (FORMATTED)</span></div>
            <div class="stage-output-box" id="jsonOutput"></div>
          </div>
        </div>
      `;

      const input = document.getElementById('jsonInput');
      const output = document.getElementById('jsonOutput');

      // Live Reactive Conversion on Input
      const updateJson = () => {
        const val = input.value;
        if (!val.trim()) {
          output.textContent = '';
          output.classList.remove('error');
          return;
        }
        const res = formatJson(val);
        if (res.success) {
          output.textContent = res.formatted;
          output.classList.remove('error');
        } else {
          output.textContent = `❌ ${res.error}`;
          output.classList.add('error');
        }
      };

      input.addEventListener('input', updateJson);

      document.getElementById('btnJsonSample').onclick = () => {
        sfx.playClick();
        input.value = SAMPLES.json;
        updateJson();
        toast.info(i18n.t('toast_sample_loaded'));
      };

      document.getElementById('btnJsonMinify').onclick = () => {
        sfx.playClick();
        const res = minifyJson(input.value);
        if (res.success) {
          output.textContent = res.minified;
          toast.success(i18n.t('toast_formatted'));
        } else {
          toast.error(res.error);
        }
      };

      document.getElementById('btnJsonCopy').onclick = () => {
        if (output.textContent) {
          navigator.clipboard.writeText(output.textContent);
          sfx.playSuccess();
          toast.success(i18n.t('toast_copied'));
        }
      };

      document.getElementById('btnJsonClear').onclick = () => {
        sfx.playClick();
        input.value = '';
        updateJson();
        toast.info(i18n.t('toast_cleared'));
      };
    }

    else if (id === 'codec') {
      stageActions.innerHTML = `
        <button class="btn-tool-action" id="btnCodecSample">${i18n.t('btn_sample')}</button>
        <button class="btn-tool-action btn-tool-primary" id="btnCodecCopy">${i18n.t('btn_copy')}</button>
        <button class="btn-tool-action" id="btnCodecClear">${i18n.t('btn_clear')}</button>
      `;
      stageContent.innerHTML = `
        <div class="split-editor">
          <div class="editor-pane">
            <div class="pane-label"><span>INPUT TEXT / JWT / BASE64</span></div>
            <textarea class="stage-textarea" id="codecInput" placeholder="Type text or paste JWT/Base64..."></textarea>
          </div>
          <div class="editor-pane">
            <div class="pane-label"><span>LIVE CONVERSION & HASHES</span></div>
            <div class="stage-output-box" id="codecOutput"></div>
          </div>
        </div>
      `;

      const input = document.getElementById('codecInput');
      const output = document.getElementById('codecOutput');

      const updateCodec = async () => {
        const val = input.value;
        if (!val.trim()) {
          output.textContent = '';
          return;
        }

        // Try Base64 Enc/Dec, JWT Parse, and SHA-256 simultaneously
        const b64Enc = processBase64(val, true).result;
        const b64Dec = processBase64(val, false);
        const jwtRes = parseJwt(val);
        const sha256 = (await computeHash(val, 'SHA-256')).hash;

        let outText = `=== BASE64 ENCODE ===\n${b64Enc}\n\n`;
        if (b64Dec.success) {
          outText += `=== BASE64 DECODE ===\n${b64Dec.result}\n\n`;
        }
        if (jwtRes.success) {
          outText += `=== JWT PAYLOAD DECODED ===\n${JSON.stringify(jwtRes, null, 2)}\n\n`;
        }
        outText += `=== SHA-256 HASH ===\n${sha256}`;

        output.textContent = outText;
      };

      input.addEventListener('input', updateCodec);

      document.getElementById('btnCodecSample').onclick = () => {
        sfx.playClick();
        input.value = SAMPLES.jwt;
        updateCodec();
        toast.info(i18n.t('toast_sample_loaded'));
      };

      document.getElementById('btnCodecCopy').onclick = () => {
        if (output.textContent) {
          navigator.clipboard.writeText(output.textContent);
          sfx.playSuccess();
          toast.success(i18n.t('toast_copied'));
        }
      };

      document.getElementById('btnCodecClear').onclick = () => {
        sfx.playClick();
        input.value = '';
        updateCodec();
        toast.info(i18n.t('toast_cleared'));
      };
    }

    else if (id === 'time') {
      stageActions.innerHTML = `
        <button class="btn-tool-action btn-tool-primary" id="btnTimeNow">${i18n.t('btn_now')}</button>
        <button class="btn-tool-action" id="btnTimeCopy">${i18n.t('btn_copy')}</button>
      `;
      stageContent.innerHTML = `
        <div class="split-editor">
          <div class="editor-pane">
            <div class="pane-label"><span>INPUT TIMESTAMP OR DATE STRING</span></div>
            <input class="stage-input" id="timeInput" placeholder="Unix timestamp (s/ms) or ISO date string..." value="${Date.now()}" />
          </div>
          <div class="editor-pane">
            <div class="pane-label"><span>CONVERTED TIME FORMATS</span></div>
            <div class="stage-output-box" id="timeOutput"></div>
          </div>
        </div>
      `;

      const input = document.getElementById('timeInput');
      const output = document.getElementById('timeOutput');

      const updateTime = () => {
        const res = convertTimestamp(input.value);
        if (res.success) {
          output.textContent = [
            `Unix (Sec):  ${res.unixSec}`,
            `Unix (Ms):   ${res.unixMs}`,
            `ISO 8601:    ${res.iso}`,
            `Local Time:  ${res.local}`,
            `UTC Time:    ${res.utc}`
          ].join('\n');
          output.classList.remove('error');
        } else {
          output.textContent = `❌ ${res.error}`;
          output.classList.add('error');
        }
      };

      input.addEventListener('input', updateTime);
      updateTime();

      document.getElementById('btnTimeNow').onclick = () => {
        sfx.playClick();
        input.value = Date.now();
        updateTime();
        toast.info(i18n.t('btn_now'));
      };

      document.getElementById('btnTimeCopy').onclick = () => {
        if (output.textContent) {
          navigator.clipboard.writeText(output.textContent);
          sfx.playSuccess();
          toast.success(i18n.t('toast_copied'));
        }
      };
    }

    else if (id === 'ip') {
      stageActions.innerHTML = `
        <button class="btn-tool-action btn-tool-primary" id="btnIpCopy">${i18n.t('btn_copy')}</button>
      `;
      stageContent.innerHTML = `
        <div class="editor-pane">
          <div class="pane-label"><span>DETAILED NETWORK IDENTITY</span></div>
          <div class="stage-output-box" id="ipOutput" style="min-height:340px;">Fetching IP details...</div>
        </div>
      `;
      const output = document.getElementById('ipOutput');
      const loadDetailedIp = async () => {
        const data = cachedIpData || await getClientIpData();
        const rtc = await checkWebRtcLeak();
        output.textContent = [
          `Public IPv4 / v6: ${data.ip}`,
          `Country:          ${data.geo.country}`,
          `Region / City:    ${data.geo.region} / ${data.geo.city}`,
          `Latitude/Longitude:${data.geo.latitude}, ${data.geo.longitude}`,
          ``,
          `WebRTC Status:    ${rtc.safe ? '🛡️ Safe (No Leak)' : '⚠️ Leak Risk Detected'}`,
          rtc.ips.length ? `WebRTC IPs:       ${rtc.ips.join(', ')}` : '',
          ``,
          `User Agent:       ${data.userAgent}`
        ].filter(Boolean).join('\n');
      };
      loadDetailedIp();

      document.getElementById('btnIpCopy').onclick = () => {
        if (output.textContent) {
          navigator.clipboard.writeText(output.textContent);
          sfx.playSuccess();
          toast.success(i18n.t('toast_copied'));
        }
      };
    }

    else if (id === 'ping') {
      stageActions.innerHTML = `
        <button class="btn-tool-action btn-tool-primary" id="btnRunPing">${i18n.t('btn_run_ping')}</button>
      `;
      stageContent.innerHTML = `
        <div class="editor-pane">
          <div class="pane-label"><span>GLOBAL NODE PING LATENCY</span></div>
          <div class="stage-output-box" id="pingOutput" style="min-height:340px;">Click "Run Ping Test" to measure global node latency...</div>
        </div>
      `;

      const output = document.getElementById('pingOutput');
      document.getElementById('btnRunPing').onclick = async () => {
        sfx.playClick();
        output.textContent = 'Measuring latency to global edge nodes...';
        const res = await runPingTest();
        sfx.playSuccess();
        output.textContent = res.map(r =>
          `${r.name.padEnd(32)} ${String(r.latency).padStart(4)} ms   [${r.status}]`
        ).join('\n');
      };
    }

    else if (id === 'dns') {
      stageActions.innerHTML = `
        <button class="btn-tool-action" id="btnDnsSample">${i18n.t('btn_sample')}</button>
        <button class="btn-tool-action btn-tool-primary" id="btnRunDns">${i18n.t('btn_run_dns')}</button>
      `;
      stageContent.innerHTML = `
        <div class="split-editor">
          <div class="editor-pane">
            <div class="pane-label"><span>TARGET DOMAIN</span></div>
            <input class="stage-input" id="dnsInput" placeholder="e.g. github.com" value="github.com" />
          </div>
          <div class="editor-pane">
            <div class="pane-label"><span>DNS RECORDS (A, AAAA, MX, TXT)</span></div>
            <div class="stage-output-box" id="dnsOutput"></div>
          </div>
        </div>
      `;

      const input = document.getElementById('dnsInput');
      const output = document.getElementById('dnsOutput');

      const executeDns = async () => {
        const dom = input.value.trim();
        if (!dom) return;
        sfx.playClick();
        output.textContent = `Resolving DNS records for ${dom}...`;
        const res = await queryDnsRecords(dom);
        sfx.playSuccess();
        output.textContent = JSON.stringify(res, null, 2);
      };

      document.getElementById('btnRunDns').onclick = executeDns;
      document.getElementById('btnDnsSample').onclick = () => {
        input.value = SAMPLES.domain;
        executeDns();
      };
      executeDns();
    }
  }

  // Initial load
  switchTool('json');

  // ====== Cmd+K Spotlight ======
  const cmdkOverlay = document.getElementById('cmdkOverlay');
  const cmdkInput = document.getElementById('cmdkInput');
  const cmdkResults = document.getElementById('cmdkResults');
  const searchTrigger = document.getElementById('searchTrigger');

  searchTrigger.addEventListener('click', openCmdk);

  function openCmdk() {
    cmdkOverlay.classList.add('open');
    cmdkInput.value = '';
    renderCmdk(getTools());
    setTimeout(() => cmdkInput.focus(), 50);
  }
  function closeCmdk() { cmdkOverlay.classList.remove('open'); }

  function renderCmdk(list) {
    if (!list.length) {
      cmdkResults.innerHTML = `<div class="cmdk-empty">No tools found</div>`;
      return;
    }
    cmdkResults.innerHTML = list.map(t => `
      <div class="cmdk-item" data-id="${t.id}">
        <span class="cmdk-item-icon">${t.icon}</span>
        <div>
          <div class="cmdk-item-title">${t.title}</div>
          <div class="cmdk-item-desc">${t.desc}</div>
        </div>
      </div>
    `).join('');
    cmdkResults.querySelectorAll('.cmdk-item').forEach(el => {
      el.addEventListener('click', () => {
        sfx.playClick();
        closeCmdk();
        switchTool(el.dataset.id);
      });
    });
  }

  cmdkInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    renderCmdk(getTools().filter(t => t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)));
  });

  cmdkOverlay.addEventListener('click', (e) => { if (e.target === cmdkOverlay) closeCmdk(); });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      cmdkOverlay.classList.contains('open') ? closeCmdk() : openCmdk();
    }
    if (e.key === 'Escape') {
      if (cmdkOverlay.classList.contains('open')) closeCmdk();
    }
  });
});
