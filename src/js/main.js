import { getClientIpData, checkWebRtcLeak } from './modules/ip-detector.js';
import { localizeContinent, localizeCountry, localizeRegionCity, localizeIsp, localizeOrg, localizeRir, localizeTrafficProfile } from './modules/ip-localization.js';
import { runGlobalPingSuite, PING_NODES, createCustomNode, runNodePing } from './modules/ping-tester.js';
import { queryAllDnsRecords, RECORD_TYPES, BUILTIN_DNS_SERVERS, getCustomDnsServers, saveCustomDnsServers, createCustomDnsServer } from './modules/dns-inspector.js';
import { formatJson, minifyJson, processBase64, parseJwt, computeHash, convertTimestamp, SAMPLES } from './modules/dev-tools.js';
import { escapeJsonString, unescapeJsonString, decodeUnicode, encodeUnicode, parseJsonWithErrorInfo } from './modules/json-util.js';
import { renderJsonTree, expandAllTreeNodes, collapseAllTreeNodes } from './modules/json-tree.js';
import { encodeBase64, decodeBase64, encodeUrlComponent, decodeUrlComponent, encodeFullUrl, decodeFullUrl, encodeHtmlEntity, decodeHtmlEntity, computeAllHashes, parseJwtToken } from './modules/codec-util.js';
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
      cachedIpData = await getClientIpData(i18n.currentLang);
      tickerIp.textContent = cachedIpData.ip;
      
      const geoZh = localizeRegionCity(cachedIpData.geo.city, cachedIpData.geo.region, cachedIpData.geo.countryCode, i18n.currentLang);
      const countryZh = localizeCountry(cachedIpData.geo.country, cachedIpData.geo.countryCode, i18n.currentLang).split('(')[0].trim();
      tickerGeo.textContent = `${countryZh} · ${geoZh}`;

      // Click ticker to copy IP
      document.getElementById('ipTicker').addEventListener('click', () => {
        if (cachedIpData && cachedIpData.ip) {
          navigator.clipboard.writeText(cachedIpData.ip);
          sfx.playSuccess();
          toast.success(`${i18n.t('toast_copied')} (${cachedIpData.ip})`);
        }
      });
    } catch (e) {
      tickerIp.textContent = 'IP 检测完成';
    }

    try {
      const rtc = await checkWebRtcLeak();
      if (rtc.safe) {
        badge.textContent = `🛡️ ${i18n.t('status_safe')}`;
        badge.className = 'status-badge safe';
      } else {
        badge.textContent = `⚠️ ${i18n.t('status_leak')}: ${rtc.ips.join(', ')}`;
        badge.className = 'status-badge leak';
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

  function attachCopyBtn(container, getContentFn, toastMsg = '已复制到剪贴板', label = '📋 复制') {
    if (!container) return;
    container.classList.add('copy-overlay-container');
    let btn = container.querySelector(':scope > .copy-overlay-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'copy-overlay-btn';
      container.appendChild(btn);
    }
    btn.innerHTML = label;
    btn.onclick = (e) => {
      e.stopPropagation();
      const text = typeof getContentFn === 'function' ? getContentFn() : getContentFn;
      if (!text || !text.trim()) return;
      navigator.clipboard.writeText(text.trim());
      sfx.playSuccess();
      toast.success(toastMsg);
      btn.innerHTML = '✔ 已复制';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.innerHTML = label;
        btn.classList.remove('copied');
      }, 1500);
    };
  }

  function renderToolStage(id) {
    if (id === 'json') {
      stageActions.innerHTML = `
        <button class="btn-tool-action" id="btnJsonSample">📄 ${i18n.t('btn_sample')}</button>
        <button class="btn-tool-action" id="btnJsonClear">🗑️ ${i18n.t('btn_clear')}</button>
      `;
      stageContent.innerHTML = `
        <div class="split-editor">
          <div class="editor-pane">
            <div class="pane-label">
              <span>INPUT</span>
              <div class="pane-action-group">
                <button class="pane-action-btn" id="btnJsonEscape" title="JSON 字符串转义">🔤 转义</button>
                <button class="pane-action-btn" id="btnJsonUnescape" title="反转义 (去除斜杠)">↩️ 解转义</button>
                <button class="pane-action-btn" id="btnJsonUnicode" title="Unicode 解码 (\\u...)">🌐 Unicode</button>
                <button class="pane-action-btn" id="btnJsonCopyInput" title="复制源码">📋 复制源码</button>
              </div>
            </div>
            <textarea class="stage-textarea" id="jsonInput" placeholder="Paste or type JSON here..."></textarea>
          </div>
          <div class="editor-pane">
            <div class="pane-label">
              <span>OUTPUT</span>
              <div class="pane-action-group">
                <button class="pane-action-btn" id="btnJsonExpandAll" title="展开所有节点">▼ 展开</button>
                <button class="pane-action-btn" id="btnJsonCollapseAll" title="折叠所有节点">▶ 折叠</button>
                <button class="pane-action-btn" id="btnJsonMinify" title="切换压缩单行 / 树图">⚡ 单行</button>
                <button class="pane-action-btn" id="btnJsonDownload" title="导出下载 JSON 文件">📥 下载</button>
                <button class="pane-action-btn primary" id="btnJsonCopyOutput" title="复制格式化/压缩 JSON 结果">📋 复制结果</button>
              </div>
            </div>
            <div class="stage-output-box json-tree-container" id="jsonOutput"></div>
          </div>
        </div>
      `;

      const input = document.getElementById('jsonInput');
      const output = document.getElementById('jsonOutput');
      let isMinifiedView = false;
      let currentJsonData = null;

      const renderEmptyBlueprint = () => {
        output.innerHTML = `
          <div class="json-empty-blueprint">
            <div class="json-blueprint-icon">
              <div class="json-icon-orbit"></div>
              <span style="font-family:var(--font-mono);font-weight:700;font-size:1.6rem;color:var(--aurora-cyan);">{ }</span>
            </div>
            <div class="json-blueprint-title">${i18n.currentLang.startsWith('zh') ? 'JSON 交互式树节点视图' : 'JSON Collapsible Tree View'}</div>
            <div class="json-blueprint-desc">${i18n.currentLang.startsWith('zh') ? '在左侧输入或粘贴 JSON 数据，实时渲染高亮树节点' : 'Paste or type JSON data on the left to render interactive tree nodes'}</div>
            <div class="json-blueprint-tags">
              <span class="json-bp-tag">🌳 ${i18n.currentLang.startsWith('zh') ? '节点折叠' : 'Collapsible'}</span>
              <span class="json-bp-tag">🎨 ${i18n.currentLang.startsWith('zh') ? '五色高亮' : 'Syntax Colors'}</span>
              <span class="json-bp-tag">⚡ ${i18n.currentLang.startsWith('zh') ? '行号定位' : 'Line Inspector'}</span>
            </div>
          </div>
        `;
      };

      // Live Reactive Render with Tree View & Precision Error Line Extraction
      const updateJson = () => {
        const val = input.value;
        if (!val.trim()) {
          currentJsonData = null;
          renderEmptyBlueprint();
          return;
        }

        const parsed = parseJsonWithErrorInfo(val);
        if (parsed.success) {
          currentJsonData = parsed.data;
          output.innerHTML = '';
          if (isMinifiedView) {
            const minifiedStr = JSON.stringify(parsed.data);
            const pre = document.createElement('pre');
            pre.style.cssText = 'white-space:pre-wrap;word-break:break-all;color:var(--aurora-emerald);font-family:var(--font-mono);font-size:0.88rem;line-height:1.6;margin:0;padding:12px;';
            pre.textContent = minifiedStr;
            output.appendChild(pre);
          } else {
            const treeNode = renderJsonTree(parsed.data);
            output.appendChild(treeNode);
          }
        } else {
          currentJsonData = null;
          output.innerHTML = `
            <div class="json-error-card">
              <div class="json-error-title">❌ 语法错误 (Syntax Error)</div>
              <div><strong>位置:</strong> 第 ${parsed.error.line} 行，第 ${parsed.error.column} 列</div>
              <div style="margin-top:6px;opacity:0.85;font-size:0.8rem;">${parsed.error.message}</div>
            </div>
          `;
        }
      };

      renderEmptyBlueprint();

      input.addEventListener('input', updateJson);

      document.getElementById('btnJsonSample').onclick = () => {
        sfx.playClick();
        input.value = SAMPLES.json;
        updateJson();
        toast.info(i18n.t('toast_sample_loaded'));
      };

      document.getElementById('btnJsonEscape').onclick = () => {
        sfx.playClick();
        if (!input.value.trim()) return;
        input.value = escapeJsonString(input.value);
        updateJson();
        toast.success('已应用 JSON 字符串转义');
      };

      document.getElementById('btnJsonUnescape').onclick = () => {
        sfx.playClick();
        if (!input.value.trim()) return;
        input.value = unescapeJsonString(input.value);
        updateJson();
        toast.success('已完成反转义 (Unescape)');
      };

      document.getElementById('btnJsonUnicode').onclick = () => {
        sfx.playClick();
        if (!input.value.trim()) return;
        input.value = decodeUnicode(input.value);
        updateJson();
        toast.success('已解码 Unicode 字符序列');
      };

      document.getElementById('btnJsonCopyInput').onclick = () => {
        sfx.playClick();
        const val = input.value.trim();
        if (val) {
          navigator.clipboard.writeText(val);
          sfx.playSuccess();
          toast.success('已复制 JSON 源码');
        }
      };

      document.getElementById('btnJsonCopyOutput').onclick = () => {
        sfx.playClick();
        if (currentJsonData !== null) {
          const jsonText = isMinifiedView 
            ? JSON.stringify(currentJsonData) 
            : JSON.stringify(currentJsonData, null, 2);
          navigator.clipboard.writeText(jsonText);
          sfx.playSuccess();
          toast.success('已复制 JSON 结果');
        } else if (input.value.trim()) {
          navigator.clipboard.writeText(input.value.trim());
          sfx.playSuccess();
          toast.success('已复制 JSON 内容');
        }
      };

      document.getElementById('btnJsonExpandAll').onclick = () => {
        sfx.playClick();
        expandAllTreeNodes(output);
      };

      document.getElementById('btnJsonCollapseAll').onclick = () => {
        sfx.playClick();
        collapseAllTreeNodes(output);
      };

      document.getElementById('btnJsonMinify').onclick = () => {
        sfx.playClick();
        if (!input.value.trim()) return;
        const btn = document.getElementById('btnJsonMinify');
        isMinifiedView = !isMinifiedView;
        if (isMinifiedView) {
          btn.innerHTML = `🌳 树图`;
          btn.title = '还原为可折叠树形视图';
          toast.success('已切换为单行压缩模式');
        } else {
          btn.innerHTML = `⚡ 单行`;
          btn.title = '压缩为单行 JSON';
          toast.info('已还原为树形视图');
        }
        updateJson();
      };

      document.getElementById('btnJsonDownload').onclick = () => {
        const val = input.value.trim();
        if (!val) return;
        const blob = new Blob([val], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nexus-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        sfx.playSuccess();
        toast.success('JSON 文件已导出下载');
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
        <button class="btn-tool-action" id="btnCodecSample">📄 ${i18n.t('btn_sample')}</button>
        <button class="btn-tool-action" id="btnCodecClear">🗑️ ${i18n.t('btn_clear')}</button>
      `;
      stageContent.innerHTML = `
        <div class="codec-subtabs">
          <button class="codec-tab-btn active" data-subtab="base64">🔤 Base64 编解码</button>
          <button class="codec-tab-btn" data-subtab="url">🌐 URL 编解码</button>
          <button class="codec-tab-btn" data-subtab="html">🎨 HTML 实体</button>
          <button class="codec-tab-btn" data-subtab="hash">🔐 全算法哈希</button>
          <button class="codec-tab-btn" data-subtab="jwt">🎖️ JWT 令牌解包</button>
        </div>
        <div id="codecTabContent"></div>
      `;

      let activeSubTab = 'base64';
      let isUrlSafeBase64 = false;
      let hashUppercase = false;
      let hashSalt = '';

      const renderSubTab = () => {
        const contentBox = document.getElementById('codecTabContent');
        if (activeSubTab === 'base64') {
          contentBox.innerHTML = `
            <div class="split-editor">
              <div class="editor-pane">
                <div class="pane-label">
                  <span>INPUT TEXT / BASE64</span>
                  <div class="pane-action-group">
                    <button class="pane-action-btn" id="btnB64Encode">编码 Encode</button>
                    <button class="pane-action-btn" id="btnB64Decode">解码 Decode</button>
                    <button class="pane-action-btn ${isUrlSafeBase64 ? 'primary' : ''}" id="btnB64UrlSafe">URL-Safe ${isUrlSafeBase64 ? 'ON' : 'OFF'}</button>
                    <button class="pane-action-btn" id="btnCodecCopyInput">📋 复制源码</button>
                  </div>
                </div>
                <textarea class="stage-textarea" id="codecInput" placeholder="输入明文文本或 Base64 密文..."></textarea>
              </div>
              <div class="editor-pane">
                <div class="pane-label">
                  <span>OUTPUT RESULT</span>
                  <div class="pane-action-group">
                    <button class="pane-action-btn primary" id="btnCodecCopyOutput">📋 复制结果</button>
                  </div>
                </div>
                <div class="stage-output-box" id="codecOutput"></div>
              </div>
            </div>
          `;
        } else if (activeSubTab === 'url') {
          contentBox.innerHTML = `
            <div class="split-editor">
              <div class="editor-pane">
                <div class="pane-label">
                  <span>INPUT URL / TEXT</span>
                  <div class="pane-action-group">
                    <button class="pane-action-btn" id="btnUrlEncode">编码 Encode</button>
                    <button class="pane-action-btn" id="btnUrlDecode">解码 Decode</button>
                    <button class="pane-action-btn" id="btnCodecCopyInput">📋 复制源码</button>
                  </div>
                </div>
                <textarea class="stage-textarea" id="codecInput" placeholder="输入要转义或还原的 URL 字符串..."></textarea>
              </div>
              <div class="editor-pane">
                <div class="pane-label">
                  <span>OUTPUT RESULT</span>
                  <div class="pane-action-group">
                    <button class="pane-action-btn primary" id="btnCodecCopyOutput">📋 复制结果</button>
                  </div>
                </div>
                <div class="stage-output-box" id="codecOutput"></div>
              </div>
            </div>
          `;
        } else if (activeSubTab === 'html') {
          contentBox.innerHTML = `
            <div class="split-editor">
              <div class="editor-pane">
                <div class="pane-label">
                  <span>INPUT TEXT / HTML</span>
                  <div class="pane-action-group">
                    <button class="pane-action-btn" id="btnHtmlEncode">转义 Entity</button>
                    <button class="pane-action-btn" id="btnHtmlDecode">还原 Decode</button>
                    <button class="pane-action-btn" id="btnCodecCopyInput">📋 复制源码</button>
                  </div>
                </div>
                <textarea class="stage-textarea" id="codecInput" placeholder="输入包含 <script>, &, &quot; 等字符的 HTML 文本..."></textarea>
              </div>
              <div class="editor-pane">
                <div class="pane-label">
                  <span>OUTPUT RESULT</span>
                  <div class="pane-action-group">
                    <button class="pane-action-btn primary" id="btnCodecCopyOutput">📋 复制结果</button>
                  </div>
                </div>
                <div class="stage-output-box" id="codecOutput"></div>
              </div>
            </div>
          `;
        } else if (activeSubTab === 'hash') {
          contentBox.innerHTML = `
            <div class="split-editor">
              <div class="editor-pane">
                <div class="pane-label">
                  <span>INPUT TEXT</span>
                  <div class="pane-action-group">
                    <input type="text" class="stage-input" id="hashSaltInput" placeholder="Salt (加盐, 可选)" style="padding:2px 8px;font-size:0.75rem;width:120px;height:24px;" value="${hashSalt}" />
                    <button class="pane-action-btn ${hashUppercase ? 'primary' : ''}" id="btnHashCase">${hashUppercase ? 'HEX 大写' : 'hex 小写'}</button>
                    <button class="pane-action-btn" id="btnCodecCopyInput">📋 复制源码</button>
                  </div>
                </div>
                <textarea class="stage-textarea" id="codecInput" placeholder="输入任意文本，实时计算 MD5, SHA-1, SHA-256, SHA-512 散列值..."></textarea>
              </div>
              <div class="editor-pane">
                <div class="pane-label"><span>MULTI-HASH RESULTS</span></div>
                <div class="stage-output-box" id="codecOutput"></div>
              </div>
            </div>
          `;
        } else if (activeSubTab === 'jwt') {
          contentBox.innerHTML = `
            <div class="split-editor">
              <div class="editor-pane">
                <div class="pane-label">
                  <span>JWT TOKEN INPUT</span>
                  <div class="pane-action-group">
                    <button class="pane-action-btn" id="btnCodecCopyInput">📋 复制源码</button>
                  </div>
                </div>
                <textarea class="stage-textarea" id="codecInput" placeholder="粘贴 JWT 令牌字符串 (ey...)"></textarea>
              </div>
              <div class="editor-pane">
                <div class="pane-label"><span>DECODED PAYLOAD & HEADER</span></div>
                <div class="stage-output-box" id="codecOutput"></div>
              </div>
            </div>
          `;
        }

        bindSubTabEvents();
      };

      const bindSubTabEvents = () => {
        const input = document.getElementById('codecInput');
        const output = document.getElementById('codecOutput');
        if (!input || !output) return;

        const btnCopyInput = document.getElementById('btnCodecCopyInput');
        if (btnCopyInput) {
          btnCopyInput.onclick = () => {
            sfx.playClick();
            if (input.value.trim()) {
              navigator.clipboard.writeText(input.value.trim());
              sfx.playSuccess();
              toast.success('已复制输入源码');
            }
          };
        }

        const btnCopyOutput = document.getElementById('btnCodecCopyOutput');
        if (btnCopyOutput) {
          btnCopyOutput.onclick = () => {
            sfx.playClick();
            if (output.textContent.trim()) {
              navigator.clipboard.writeText(output.textContent.trim());
              sfx.playSuccess();
              toast.success('已复制转换结果');
            }
          };
        }

        const updateLive = async () => {
          const val = input.value;
          if (!val.trim()) {
            output.innerHTML = '';
            return;
          }

          if (activeSubTab === 'base64') {
            output.style.whiteSpace = 'pre-wrap';
            output.textContent = encodeBase64(val, isUrlSafeBase64);
          } else if (activeSubTab === 'url') {
            output.style.whiteSpace = 'pre-wrap';
            output.textContent = encodeUrlComponent(val);
          } else if (activeSubTab === 'html') {
            output.style.whiteSpace = 'pre-wrap';
            output.textContent = encodeHtmlEntity(val);
          } else if (activeSubTab === 'hash') {
            output.style.whiteSpace = 'normal';
            const salt = document.getElementById('hashSaltInput')?.value || '';
            const hashes = await computeAllHashes(val, salt, hashUppercase);
            output.innerHTML = `<div class="hash-grid">
                <div class="hash-card">
                  <div class="hash-card-header">
                    <span class="hash-algo-name">MD5 (32位)</span>
                    <button class="pane-action-btn btn-copy-hash" data-text="${hashes.md5}" data-toast="MD5 哈希已复制">📋 复制</button>
                  </div>
                  <div class="hash-val-text">${hashes.md5 || '-'}</div>
                </div>
                <div class="hash-card">
                  <div class="hash-card-header">
                    <span class="hash-algo-name">SHA-1 (40位)</span>
                    <button class="pane-action-btn btn-copy-hash" data-text="${hashes.sha1}" data-toast="SHA-1 哈希已复制">📋 复制</button>
                  </div>
                  <div class="hash-val-text">${hashes.sha1 || '-'}</div>
                </div>
                <div class="hash-card">
                  <div class="hash-card-header">
                    <span class="hash-algo-name">SHA-256 (64位)</span>
                    <button class="pane-action-btn btn-copy-hash" data-text="${hashes.sha256}" data-toast="SHA-256 哈希已复制">📋 复制</button>
                  </div>
                  <div class="hash-val-text">${hashes.sha256 || '-'}</div>
                </div>
                <div class="hash-card">
                  <div class="hash-card-header">
                    <span class="hash-algo-name">SHA-512 (128位)</span>
                    <button class="pane-action-btn btn-copy-hash" data-text="${hashes.sha512}" data-toast="SHA-512 哈希已复制">📋 复制</button>
                  </div>
                  <div class="hash-val-text">${hashes.sha512 || '-'}</div>
                </div>
              </div>`;
          } else if (activeSubTab === 'jwt') {
            output.style.whiteSpace = 'normal';
            const res = parseJwtToken(val);
            if (res.success) {
              output.innerHTML = `<div class="jwt-card">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <strong style="color:var(--aurora-cyan);">Header (头部)</strong>
                    <div>
                      <span class="jwt-badge-valid">JWT Format</span>
                      <button class="pane-action-btn btn-copy-hash" data-text='${JSON.stringify(res.header)}' data-toast="Header 已复制" style="margin-left:6px;">📋 复制 Header</button>
                    </div>
                  </div>
                  <pre style="margin:0;font-size:0.83rem;color:var(--aurora-cyan);white-space:pre-wrap;">${JSON.stringify(res.header, null, 2)}</pre>
                </div>
                <div class="jwt-card">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <strong style="color:var(--aurora-emerald);">Payload (载荷)</strong>
                    <div>
                      <span class="${res.status === 'expired' ? 'jwt-badge-expired' : 'jwt-badge-valid'}">${res.statusText}</span>
                      <button class="pane-action-btn btn-copy-hash" data-text='${JSON.stringify(res.payload)}' data-toast="Payload 已复制" style="margin-left:6px;">📋 复制 Payload</button>
                    </div>
                  </div>
                  <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:6px;">过期时间: ${res.expFormatted}</div>
                  <pre style="margin:0;font-size:0.83rem;color:var(--aurora-emerald);white-space:pre-wrap;">${JSON.stringify(res.payload, null, 2)}</pre>
                </div>
                <div class="jwt-card">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <strong style="color:var(--aurora-purple);">Signature (签名)</strong>
                    <button class="pane-action-btn btn-copy-hash" data-text="${res.signature}" data-toast="Signature 已复制">📋 复制</button>
                  </div>
                  <div class="hash-val-text" style="font-size:0.78rem;">${res.signature}</div>
                </div>`;
            } else {
              output.innerHTML = `<div class="json-error-card">
                  <div class="json-error-title">❌ ${res.error}</div>
                </div>`;
            }
          }
        };

        output.onclick = (e) => {
          const btn = e.target.closest('.btn-copy-hash');
          if (!btn) return;
          const text = btn.getAttribute('data-text');
          const toastMsg = btn.getAttribute('data-toast') || '已复制';
          if (text) {
            navigator.clipboard.writeText(text);
            sfx.playSuccess();
            toast.success(toastMsg);
            const origHtml = btn.innerHTML;
            btn.innerHTML = '✔ 已复制';
            btn.classList.add('copied');
            setTimeout(() => {
              btn.innerHTML = origHtml;
              btn.classList.remove('copied');
            }, 1500);
          }
        };

        input.addEventListener('input', updateLive);

        // SubTab-specific button bindings
        if (activeSubTab === 'base64') {
          document.getElementById('btnB64Encode').onclick = () => {
            sfx.playClick();
            output.textContent = encodeBase64(input.value, isUrlSafeBase64);
            toast.success('Base64 编码完成');
          };
          document.getElementById('btnB64Decode').onclick = () => {
            sfx.playClick();
            output.textContent = decodeBase64(input.value, isUrlSafeBase64);
            toast.success('Base64 解码完成');
          };
          document.getElementById('btnB64UrlSafe').onclick = () => {
            sfx.playClick();
            isUrlSafeBase64 = !isUrlSafeBase64;
            renderSubTab();
            toast.info(`URL-Safe Base64: ${isUrlSafeBase64 ? '已开启' : '已关闭'}`);
          };
        } else if (activeSubTab === 'url') {
          document.getElementById('btnUrlEncode').onclick = () => {
            sfx.playClick();
            output.textContent = encodeUrlComponent(input.value);
            toast.success('URL 编码完成');
          };
          document.getElementById('btnUrlDecode').onclick = () => {
            sfx.playClick();
            output.textContent = decodeUrlComponent(input.value);
            toast.success('URL 解码完成');
          };
        } else if (activeSubTab === 'html') {
          document.getElementById('btnHtmlEncode').onclick = () => {
            sfx.playClick();
            output.textContent = encodeHtmlEntity(input.value);
            toast.success('HTML 实体编码完成');
          };
          document.getElementById('btnHtmlDecode').onclick = () => {
            sfx.playClick();
            output.textContent = decodeHtmlEntity(input.value);
            toast.success('HTML 实体解码完成');
          };
        } else if (activeSubTab === 'hash') {
          const saltInput = document.getElementById('hashSaltInput');
          if (saltInput) {
            saltInput.addEventListener('input', (e) => {
              hashSalt = e.target.value;
              updateLive();
            });
          }
          document.getElementById('btnHashCase').onclick = () => {
            sfx.playClick();
            hashUppercase = !hashUppercase;
            renderSubTab();
            toast.info(`哈希字母转换: ${hashUppercase ? 'HEX 大写' : 'hex 小写'}`);
          };
        }
      };

      // Sub-Tab Switching Logic
      stageContent.querySelectorAll('.codec-tab-btn').forEach(btn => {
        btn.onclick = () => {
          sfx.playClick();
          stageContent.querySelectorAll('.codec-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeSubTab = btn.getAttribute('data-subtab');
          renderSubTab();
        };
      });

      // Sample Data Button
      document.getElementById('btnCodecSample').onclick = () => {
        sfx.playClick();
        const input = document.getElementById('codecInput');
        if (!input) return;
        if (activeSubTab === 'jwt') input.value = SAMPLES.jwt;
        else if (activeSubTab === 'base64') input.value = SAMPLES.base64;
        else input.value = "Nexus DevTools 2026! 🚀";
        
        const event = new Event('input');
        input.dispatchEvent(event);
        toast.info(i18n.t('toast_sample_loaded'));
      };

      // Clear Button
      document.getElementById('btnCodecClear').onclick = () => {
        sfx.playClick();
        const input = document.getElementById('codecInput');
        const output = document.getElementById('codecOutput');
        if (input) input.value = '';
        if (output) output.innerHTML = '';
        toast.info(i18n.t('toast_cleared'));
      };

      // Initial Render of default Sub-Tab (Base64)
      renderSubTab();
    }

    else if (id === 'time') {
      stageActions.innerHTML = `
        <button class="btn-tool-action btn-tool-primary" id="btnTimeNow">⚡ ${i18n.t('btn_now')}</button>
      `;
      stageContent.innerHTML = `
        <div class="split-editor">
          <div class="editor-pane">
            <div class="pane-label"><span>INPUT TIMESTAMP OR DATE STRING</span></div>
            <input class="stage-input" id="timeInput" placeholder="Unix timestamp (s/ms) or ISO date string..." value="${Date.now()}" />
          </div>
          <div class="editor-pane">
            <div class="pane-label">
              <span>CONVERTED TIME FORMATS</span>
              <div class="pane-action-group">
                <button class="pane-action-btn primary" id="btnTimeCopyOutput">📋 复制结果</button>
              </div>
            </div>
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
        toast.info('时间已重置为当前时刻');
      };

      document.getElementById('btnTimeCopyOutput').onclick = () => {
        if (output.textContent) {
          navigator.clipboard.writeText(output.textContent);
          sfx.playSuccess();
          toast.success('已复制时间转换结果');
        }
      };
    }

    else if (id === 'ip') {
      stageActions.innerHTML = ``;
      stageContent.innerHTML = `
        <div id="ipDashboard" style="width:100%;">
          <div class="ip-loading-stage">
            <!-- Top Radar Orbital Scanner -->
            <div class="ip-loading-scanner">
              <div class="ip-radar-orbit">
                <div class="ip-radar-ring ring-1"></div>
                <div class="ip-radar-ring ring-2"></div>
                <div class="ip-radar-core">🛰️</div>
              </div>
              <div class="ip-loading-text-wrap">
                <div class="ip-loading-title">${i18n.t('ip_loading_status')}</div>
                <div class="ip-loading-badges">
                  <span class="ip-loading-tag">${i18n.t('ip_loading_tag_1')}</span>
                  <span class="ip-loading-tag">${i18n.t('ip_loading_tag_2')}</span>
                  <span class="ip-loading-tag">${i18n.t('ip_loading_tag_3')}</span>
                </div>
              </div>
            </div>

            <!-- Skeleton Preview Cards Grid -->
            <div class="ip-skeleton-grid">
              <div class="ip-skeleton-card">
                <div class="ip-sk-header"><div class="ip-sk-circle"></div><div class="ip-sk-line title"></div></div>
                <div class="ip-sk-body">
                  <div class="ip-sk-row"><div class="ip-sk-line label"></div><div class="ip-sk-line val w70"></div></div>
                  <div class="ip-sk-row"><div class="ip-sk-line label"></div><div class="ip-sk-line val w50"></div></div>
                  <div class="ip-sk-row"><div class="ip-sk-line label"></div><div class="ip-sk-line val w80"></div></div>
                  <div class="ip-sk-row"><div class="ip-sk-line label"></div><div class="ip-sk-line val w60"></div></div>
                </div>
              </div>
              <div class="ip-skeleton-card">
                <div class="ip-sk-header"><div class="ip-sk-circle"></div><div class="ip-sk-line title"></div></div>
                <div class="ip-sk-body">
                  <div class="ip-sk-row"><div class="ip-sk-line label"></div><div class="ip-sk-line val w60"></div></div>
                  <div class="ip-sk-row"><div class="ip-sk-line label"></div><div class="ip-sk-line val w75"></div></div>
                  <div class="ip-sk-row"><div class="ip-sk-line label"></div><div class="ip-sk-line val w45"></div></div>
                  <div class="ip-sk-row"><div class="ip-sk-line label"></div><div class="ip-sk-line val w65"></div></div>
                </div>
              </div>
              <div class="ip-skeleton-card">
                <div class="ip-sk-header"><div class="ip-sk-circle"></div><div class="ip-sk-line title"></div></div>
                <div class="ip-sk-body">
                  <div class="ip-sk-row"><div class="ip-sk-line label"></div><div class="ip-sk-line val w50"></div></div>
                  <div class="ip-sk-row"><div class="ip-sk-line label"></div><div class="ip-sk-line val w65"></div></div>
                  <div class="ip-sk-row"><div class="ip-sk-line label"></div><div class="ip-sk-line val w40"></div></div>
                </div>
              </div>
              <div class="ip-skeleton-card">
                <div class="ip-sk-header"><div class="ip-sk-circle"></div><div class="ip-sk-line title"></div></div>
                <div class="ip-sk-body">
                  <div class="ip-sk-row"><div class="ip-sk-line label"></div><div class="ip-sk-line val w70"></div></div>
                  <div class="ip-sk-row"><div class="ip-sk-line label"></div><div class="ip-sk-line val w60"></div></div>
                  <div class="ip-sk-row"><div class="ip-sk-line label"></div><div class="ip-sk-line val w55"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      const loadDetailedIp = async () => {
        const data = cachedIpData || await getClientIpData(i18n.currentLang);
        cachedIpData = data;
        const rtc = await checkWebRtcLeak();
        const container = document.getElementById('ipDashboard');

        if (!container) return;

        const mapsUrl = `https://www.google.com/maps?q=${data.geo.latitude},${data.geo.longitude}`;
        const lang = i18n.currentLang;

        const continentLocalized = localizeContinent(data.geo.continent, lang);
        const countryLocalized = localizeCountry(data.geo.country, data.geo.countryCode, lang);
        const regionCityLocalized = localizeRegionCity(data.geo.city, data.geo.region, data.geo.countryCode, lang);
        const ispLocalized = localizeIsp(data.network.isp, lang);
        const orgLocalized = localizeOrg(data.network.org, lang);
        const rirLocalized = localizeRir(data.network.rir, lang);
        const trafficLocalized = localizeTrafficProfile(data.network.asnTraffic, lang);

        container.innerHTML = `
          <div class="ip-dash-grid">
            <!-- Card 1: IP & Geolocation -->
            <div class="ip-dash-card">
              <div class="ip-dash-header">
                <span class="ip-dash-icon">🌐</span>
                <h3>${lang.startsWith('zh') ? '网络身份与地理位置' : 'IP & Geolocation'}</h3>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">Public IP</span>
                <span class="ip-dash-val highlight">${data.geo.flag} ${data.ip} (${data.version})</span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '大洲' : 'Continent'}</span>
                <span class="ip-dash-val">${continentLocalized}</span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '国家 / 地区' : 'Country / Region'}</span>
                <span class="ip-dash-val">${countryLocalized}</span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '城市 / 省份' : 'City / Region'}</span>
                <span class="ip-dash-val">${regionCityLocalized}</span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '邮编' : 'Postal Code'}</span>
                <span class="ip-dash-val">${data.geo.postal}</span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '经纬度' : 'Coordinates'}</span>
                <span class="ip-dash-val">
                  ${data.geo.latitude}, ${data.geo.longitude}
                  <a href="${mapsUrl}" target="_blank" style="color:var(--aurora-cyan);margin-left:6px;text-decoration:none;">📍${lang.startsWith('zh') ? '地图' : 'Map'}</a>
                </span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '时区' : 'Timezone'}</span>
                <span class="ip-dash-val">${data.timezone.id} (${data.timezone.utc})</span>
              </div>
            </div>

            <!-- Card 2: Network & ISP -->
            <div class="ip-dash-card">
              <div class="ip-dash-header">
                <span class="ip-dash-icon">📡</span>
                <h3>${lang.startsWith('zh') ? '网络属性与 ASN 归属' : 'Network & ISP'}</h3>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? 'ASN 编号' : 'ASN'}</span>
                <span class="ip-dash-val highlight">
                  ${data.network.asn}
                  <span style="font-size:0.72rem;color:var(--aurora-cyan);font-weight:600;margin-left:4px;">[${trafficLocalized}]</span>
                </span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '网络运营商 (ISP)' : 'ISP Operator'}</span>
                <span class="ip-dash-val">${ispLocalized}</span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '自治组织 (Organization)' : 'Organization'}</span>
                <span class="ip-dash-val">${orgLocalized}</span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '关联域名' : 'Domain'}</span>
                <span class="ip-dash-val" style="color:var(--aurora-purple);">${data.network.domain}</span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '注册机构 (RIR)' : 'Registry (RIR)'}</span>
                <span class="ip-dash-val">${rirLocalized}</span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? 'IP 类型' : 'IP Type'}</span>
                <span class="ip-dash-val">
                  <span class="ip-tag ${data.security.hosting ? 'amber' : 'green'}">
                    ${data.security.hosting ? (lang.startsWith('zh') ? '数据中心 (Datacenter)' : 'Datacenter') : (lang.startsWith('zh') ? '住宅 / 宽带 (Residential)' : 'Residential')}
                  </span>
                </span>
              </div>
            </div>

            <!-- Card 3: Security & Privacy Audit -->
            <div class="ip-dash-card">
              <div class="ip-dash-header">
                <span class="ip-dash-icon">🛡️</span>
                <h3>${lang.startsWith('zh') ? '安全与代理泄露审计' : 'Security Audit'}</h3>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '数据中心 (Datacenter)' : 'Datacenter'}</span>
                <span class="ip-dash-val">
                  <span class="ip-tag ${data.security.hosting ? 'amber' : 'green'}">
                    ${data.security.hosting ? (lang.startsWith('zh') ? '是 (Datacenter)' : 'Yes') : (lang.startsWith('zh') ? '否 (Residential)' : 'No')}
                  </span>
                </span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '匿名 IP (Anonymous IP)' : 'Anonymous IP'}</span>
                <span class="ip-dash-val">
                  <span class="ip-tag ${data.security.anonymousIp ? 'amber' : 'green'}">
                    ${data.security.anonymousIp ? (lang.startsWith('zh') ? '是 (Anonymous)' : 'Yes') : (lang.startsWith('zh') ? '否 (Normal)' : 'No')}
                  </span>
                </span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '代理状态' : 'Proxy Status'}</span>
                <span class="ip-dash-val">
                  <span class="ip-tag ${data.security.proxy ? 'amber' : 'green'}">
                    ${data.security.proxy ? (lang.startsWith('zh') ? '代理 IP (Proxy)' : 'Proxy IP') : (lang.startsWith('zh') ? '非代理 (Direct)' : 'Direct')}
                  </span>
                </span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '威胁状态' : 'Threat Status'}</span>
                <span class="ip-dash-val">
                  <span class="ip-tag ${data.security.hosting ? 'amber' : 'green'}">
                    ${data.security.hosting ? (lang.startsWith('zh') ? '存在高风险' : 'High Risk') : (lang.startsWith('zh') ? '无已知威胁记录' : 'Clean')}
                  </span>
                </span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">WebRTC ${lang.startsWith('zh') ? '泄露状态' : 'Leak Status'}</span>
                <span class="ip-dash-val">
                  ${rtc.safe ? `
                  <span class="ip-tag green">🛡️ ${lang.startsWith('zh') ? '安全 (未泄露真实 IP)' : 'Safe (No Leak)'}</span>
                  ` : `
                  <span class="ip-tag red">⚠️ ${lang.startsWith('zh') ? '泄漏风险' : 'Leak Detected'} (${rtc.ips.join(', ')})</span>
                  `}
                </span>
              </div>
              ${rtc.ips.length ? `
              <div class="ip-dash-row">
                <span class="ip-dash-label">WebRTC ${lang.startsWith('zh') ? '泄露 IP' : 'Leaked IP'}</span>
                <span class="ip-dash-val" style="color:var(--aurora-rose);">${rtc.ips.join(', ')}</span>
              </div>` : ''}
            </div>

            <!-- Card 4: Client Environment & Fingerprint -->
            <div class="ip-dash-card">
              <div class="ip-dash-header">
                <span class="ip-dash-icon">💻</span>
                <h3>${lang.startsWith('zh') ? '客户端环境与指纹' : 'Client Fingerprint'}</h3>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '操作系统' : 'Operating System'}</span>
                <span class="ip-dash-val">${data.client.os}</span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '浏览器' : 'Browser'}</span>
                <span class="ip-dash-val">${data.client.browser}</span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '屏幕分辨率' : 'Screen Resolution'}</span>
                <span class="ip-dash-val">${data.client.screen}</span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '系统语言' : 'Language'}</span>
                <span class="ip-dash-val">${data.client.language}</span>
              </div>
              <div class="ip-dash-row">
                <span class="ip-dash-label">${lang.startsWith('zh') ? '网络与 Cookie' : 'Network & Cookies'}</span>
                <span class="ip-dash-val">${data.client.onlineStatus} · Cookie ${data.client.cookiesEnabled}</span>
              </div>
            </div>
          </div>
        `;
      };

      loadDetailedIp();

      document.getElementById('btnIpCopy').onclick = () => {
        if (cachedIpData) {
          const rawText = JSON.stringify(cachedIpData, null, 2);
          navigator.clipboard.writeText(rawText);
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
        <div class="ping-dash-container">
          <!-- Integrated Capsule Command Bar -->
          <div class="ping-input-bar">
            <span class="ping-input-icon">🎯</span>
            <input class="ping-input-field" id="customPingInput" placeholder="${i18n.t('ping_placeholder')}" />
            <button class="ping-input-submit" id="btnAddCustomPing">
              <span>${i18n.t('ping_add_btn')}</span>
              <kbd>↵</kbd>
            </button>
          </div>

          <!-- Filter & Control Bar -->
          <div class="ping-control-bar">
            <div class="ping-filter-row">
              <button class="ping-filter-btn active" data-filter="all">${i18n.t('ping_filter_all')}</button>
              <button class="ping-filter-btn" data-filter="china">${i18n.t('ping_filter_china')}</button>
              <button class="ping-filter-btn" data-filter="asia">${i18n.t('ping_filter_asia')}</button>
              <button class="ping-filter-btn" data-filter="western">${i18n.t('ping_filter_west')}</button>
              <button class="ping-filter-btn" data-filter="dev">${i18n.t('ping_filter_dev')}</button>
            </div>
            <span style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text-dim);" id="pingStatusText"></span>
          </div>

          <!-- Live Progress Bar -->
          <div class="ping-progress-wrap" id="pingProgressWrap">
            <div class="ping-progress-fill" id="pingProgressFill"></div>
          </div>

          <!-- Summary Stats -->
          <div class="ping-stats-row">
            <div class="ping-stat-card">
              <div class="ping-stat-label">${i18n.t('ping_stat_min')}</div>
              <div class="ping-stat-val" id="statPingMin" style="color:var(--aurora-emerald);">—</div>
            </div>
            <div class="ping-stat-card">
              <div class="ping-stat-label">${i18n.t('ping_stat_avg')}</div>
              <div class="ping-stat-val" id="statPingAvg">—</div>
            </div>
            <div class="ping-stat-card">
              <div class="ping-stat-label">${i18n.t('ping_stat_fast')}</div>
              <div class="ping-stat-val" id="statPingFast" style="color:var(--aurora-cyan);">—</div>
            </div>
            <div class="ping-stat-card">
              <div class="ping-stat-label">${i18n.t('ping_stat_loss')}</div>
              <div class="ping-stat-val" id="statPingLoss" style="color:var(--aurora-amber);">—</div>
            </div>
          </div>

          <!-- Node Grid -->
          <div class="ping-node-grid" id="pingNodeGrid"></div>
        </div>
      `;

      let currentFilter = 'all';
      
      // Load custom nodes from localStorage
      const loadCustomNodes = () => {
        try {
          return JSON.parse(localStorage.getItem('nexus_custom_ping_nodes') || '[]');
        } catch (e) {
          return [];
        }
      };

      const saveCustomNodes = (nodes) => {
        try {
          localStorage.setItem('nexus_custom_ping_nodes', JSON.stringify(nodes));
        } catch (e) {}
      };

      let customNodes = loadCustomNodes();
      const gridContainer = document.getElementById('pingNodeGrid');
      const progressWrap = document.getElementById('pingProgressWrap');
      const progressFill = document.getElementById('pingProgressFill');
      const statusText = document.getElementById('pingStatusText');
      const customInput = document.getElementById('customPingInput');
      const addCustomBtn = document.getElementById('btnAddCustomPing');

      // Bind filter buttons
      document.querySelectorAll('.ping-filter-btn').forEach(btn => {
        btn.onclick = () => {
          sfx.playClick();
          document.querySelectorAll('.ping-filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentFilter = btn.dataset.filter;
          startPingSuite();
        };
      });

      const getActiveNodes = () => {
        const base = currentFilter === 'all'
          ? PING_NODES
          : PING_NODES.filter(n => n.category === currentFilter);
        return [...customNodes, ...base];
      };

      const bindCardActionButtons = () => {
        // Delete Custom Node
        gridContainer.querySelectorAll('.ping-delete-btn').forEach(btn => {
          btn.onclick = (e) => {
            e.stopPropagation();
            sfx.playClick();
            const id = btn.dataset.id;
            customNodes = customNodes.filter(n => n.id !== id);
            saveCustomNodes(customNodes);
            toast.info('已移除自定义测速目标');
            startPingSuite();
          };
        });

        // Single Node Re-Test
        gridContainer.querySelectorAll('.ping-retest-btn').forEach(btn => {
          btn.onclick = async (e) => {
            e.stopPropagation();
            sfx.playClick();
            const id = btn.dataset.id;
            const activeNodes = getActiveNodes();
            const targetNode = activeNodes.find(n => n.id === id);
            if (!targetNode) return;

            const card = document.getElementById(`ping-card-${id}`);
            if (card) {
              card.querySelector('.ping-node-metrics').innerHTML = `
                <div class="ping-avg-ms timeout">...</div>
                <div class="ping-node-submeta" style="font-size:0.72rem;color:var(--aurora-cyan);font-family:var(--font-mono);">单点重新测速中...</div>
              `;
            }

            const res = await runNodePing(targetNode, 3);
            sfx.playSuccess();

            if (card) {
              const avgStr = res.status === 'ok' ? `${res.avg} ms` : '超时 (Timeout)';
              card.querySelector('.ping-node-metrics').innerHTML = `
                <div style="display:flex;align-items:center;gap:8px;">
                  <div class="ping-avg-ms ${res.grade}">${avgStr}</div>
                  <button class="ping-retest-btn" data-id="${res.id}" title="重新测试此节点">🔄</button>
                </div>
                <div class="ping-node-submeta" style="font-size:0.72rem;color:var(--text-dim);font-family:var(--font-mono);">MIN ${res.min}ms · MAX ${res.max}ms · LOSS ${res.loss}%</div>
              `;
              bindCardActionButtons();
            }

            toast.success(`【${res.name}】单点测速完成: ${res.avg} ms`);
          };
        });
      };

      const renderInitialCards = () => {
        const nodes = getActiveNodes();
        statusText.textContent = `当前列表：${nodes.length} 节点`;
        gridContainer.innerHTML = nodes.map(n => `
          <div class="ping-node-card" id="ping-card-${n.id}">
            <div class="ping-node-info">
              <span class="ping-node-flag">${n.flag}</span>
              <div>
                <div class="ping-node-name" style="display:flex;align-items:center;gap:6px;">
                  <span>${n.name}</span>
                  ${n.isCustom ? `<span class="ip-tag amber">自定义</span><button class="ping-delete-btn" data-id="${n.id}" title="删除此节点" style="background:none;border:none;color:var(--aurora-rose);cursor:pointer;font-size:0.9rem;padding:0 4px;">✕</button>` : ''}
                </div>
                <div class="ping-node-meta" style="color:var(--aurora-cyan);font-weight:500;">${n.host}</div>
              </div>
            </div>
            <div class="ping-node-metrics">
              <div style="display:flex;align-items:center;gap:8px;">
                <div class="ping-avg-ms timeout">—</div>
                <button class="ping-retest-btn" data-id="${n.id}" title="重新测试此节点">🔄</button>
              </div>
              <div class="ping-node-submeta" style="font-size:0.72rem;color:var(--text-dim);font-family:var(--font-mono);">等待测速</div>
            </div>
          </div>
        `).join('');

        bindCardActionButtons();
      };

      let isPingRunning = false;

      const startPingSuite = async () => {
        if (isPingRunning) return;
        isPingRunning = true;

        const btnRunPing = document.getElementById('btnRunPing');
        if (btnRunPing) {
          btnRunPing.disabled = true;
          btnRunPing.classList.add('btn-loading');
          btnRunPing.innerHTML = `<span class="btn-spinner"></span> ${i18n.t('ping_running_btn')}`;
        }

        try {
          renderInitialCards();
          const activeNodes = getActiveNodes();
          progressWrap.classList.add('show');
          progressFill.style.width = '0%';
          statusText.textContent = i18n.t('ping_running_status');

          const completedResults = [];

          await runGlobalPingSuite(activeNodes, (res, current, total) => {
            completedResults.push(res);
            const percent = Math.round((current / total) * 100);
            progressFill.style.width = `${percent}%`;

            // Update individual card
            const card = document.getElementById(`ping-card-${res.id}`);
            if (card) {
              const avgStr = res.status === 'ok' ? `${res.avg} ms` : i18n.t('ping_timeout');
              const gradeClass = res.grade;
              card.querySelector('.ping-node-metrics').innerHTML = `
                <div style="display:flex;align-items:center;gap:8px;">
                  <div class="ping-avg-ms ${gradeClass}">${avgStr}</div>
                  <button class="ping-retest-btn" data-id="${res.id}" title="${i18n.t('ping_retest_tooltip')}">🔄</button>
                </div>
                <div class="ping-node-submeta" style="font-size:0.72rem;color:var(--text-dim);font-family:var(--font-mono);">MIN ${res.min}ms · MAX ${res.max}ms · LOSS ${res.loss}%</div>
              `;
              bindCardActionButtons();
            }

            // Update Summary Stats
            const validAvgs = completedResults.filter(r => r.status === 'ok').map(r => r.avg);
            const mins = completedResults.filter(r => r.status === 'ok').map(r => r.min);
            const fastCount = completedResults.filter(r => r.status === 'ok' && r.avg < 120).length;

            if (mins.length) {
              const elMin = document.getElementById('statPingMin');
              const elAvg = document.getElementById('statPingAvg');
              const elFast = document.getElementById('statPingFast');
              const elLoss = document.getElementById('statPingLoss');

              if (elMin) elMin.textContent = `${Math.min(...mins)} ms`;
              if (elAvg) {
                const avgSum = validAvgs.reduce((a, b) => a + b, 0);
                elAvg.textContent = `${Math.round(avgSum / validAvgs.length)} ms`;
              }
              if (elFast) elFast.textContent = `${fastCount} / ${completedResults.length}`;
              if (elLoss) {
                const totalLoss = completedResults.reduce((a, b) => a + b.loss, 0);
                elLoss.textContent = `${Math.round(totalLoss / completedResults.length)}%`;
              }
            }
          });

          sfx.playSuccess();
          if (statusText) statusText.textContent = i18n.t('ping_completed_status');
          if (progressWrap) setTimeout(() => progressWrap.classList.remove('show'), 1500);
        } finally {
          isPingRunning = false;
          if (btnRunPing) {
            btnRunPing.disabled = false;
            btnRunPing.classList.remove('btn-loading');
            btnRunPing.innerHTML = i18n.t('btn_run_ping');
          }
        }
      };

      // Add Custom Ping Target Logic
      const handleAddCustom = async () => {
        const val = customInput.value.trim();
        if (!val) {
          toast.info('请先在输入框中填入 IP、域名或 URL (例: google.com)');
          customInput.focus();
          return;
        }
        try { sfx.playClick(); } catch(e) {}
        const newNode = createCustomNode(val);
        if (!newNode) {
          toast.error('无效的 IP 或域名格式');
          return;
        }
        customNodes.unshift(newNode);
        saveCustomNodes(customNodes);
        customInput.value = '';
        toast.success(`已添加并保存测速目标: ${newNode.host}`);
        startPingSuite();
      };

      addCustomBtn.onclick = handleAddCustom;
      customInput.onkeydown = (e) => {
        if (e.key === 'Enter') handleAddCustom();
      };

      document.getElementById('btnRunPing').onclick = () => {
        sfx.playClick();
        startPingSuite();
      };

      startPingSuite();
    }

    else if (id === 'dns') {
      stageActions.innerHTML = `
        <button class="btn-tool-action" id="btnDnsSample">${i18n.t('btn_sample')}</button>
        <button class="btn-tool-action btn-tool-primary" id="btnRunDns">${i18n.t('btn_run_dns')}</button>
      `;
      stageContent.innerHTML = `
        <div class="dns-dash-container">
          <!-- Controls Bar -->
          <div class="dns-control-bar">
            <div class="dns-input-wrap">
              <input class="stage-input" id="dnsInput" placeholder="输入要查询的域名 (例: github.com / google.com)..." value="github.com" style="margin-bottom:0;" />
            </div>

            <!-- Record Type Select -->
            <select id="dnsTypeSelect" class="dns-select">
              <option value="ALL">ALL (常用全部记录)</option>
              ${RECORD_TYPES.map(t => `<option value="${t}">${t} 记录</option>`).join('')}
            </select>

            <!-- Upstream DNS Provider Select -->
            <select id="dnsProviderSelect" class="dns-select">
              <!-- Dynamically Populated -->
            </select>
            <button class="dns-add-btn" id="btnAddCustomDnsBtn" title="添加自定义 DoH 服务器">➕ 自定义</button>
          </div>

          <!-- Summary Stats -->
          <div class="dns-stats-row">
            <div class="dns-stat-card">
              <div class="dns-stat-label">总解析记录数 (TOTAL)</div>
              <div class="dns-stat-val" id="statDnsTotal" style="color:var(--aurora-cyan);">—</div>
            </div>
            <div class="dns-stat-card">
              <div class="dns-stat-label">IPv4 / IPv6 地址</div>
              <div class="dns-stat-val" id="statDnsIp" style="color:var(--aurora-emerald);">—</div>
            </div>
            <div class="dns-stat-card">
              <div class="dns-stat-label">邮件服务器 (MX)</div>
              <div class="dns-stat-val" id="statDnsMx" style="color:var(--aurora-purple);">—</div>
            </div>
            <div class="dns-stat-card">
              <div class="dns-stat-label">权威响应状态</div>
              <div class="dns-stat-val" id="statDnsStatus" style="color:var(--aurora-amber);">—</div>
            </div>
          </div>

          <!-- Records Cards Container -->
          <div class="dns-records-grid" id="dnsRecordsGrid"></div>
        </div>
      `;

      const input = document.getElementById('dnsInput');
      const typeSelect = document.getElementById('dnsTypeSelect');
      const providerSelect = document.getElementById('dnsProviderSelect');
      const addCustomDnsBtn = document.getElementById('btnAddCustomDnsBtn');
      const gridContainer = document.getElementById('dnsRecordsGrid');

      let customDnsList = getCustomDnsServers();

      const populateProviderSelect = () => {
        const all = [...BUILTIN_DNS_SERVERS, ...customDnsList];
        providerSelect.innerHTML = all.map(s => `
          <option value="${s.id}">${s.flag} ${s.name}${s.isCustom ? ' [自定义]' : ''}</option>
        `).join('');
      };

      populateProviderSelect();

      let isDnsRunning = false;

      async function executeDns() {
        const dom = input.value.trim();
        if (!dom || isDnsRunning) return;
        isDnsRunning = true;

        const btnRunDns = document.getElementById('btnRunDns');
        if (btnRunDns) {
          btnRunDns.disabled = true;
          btnRunDns.classList.add('btn-loading');
          btnRunDns.innerHTML = `<span class="btn-spinner"></span> ${i18n.t('dns_running_btn')}`;
        }

        try {
          try { sfx.playClick(); } catch(e) {}
          
          const selectedText = providerSelect.selectedOptions[0]?.text || 'DNS';
          gridContainer.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-dim);font-family:var(--font-mono);">${i18n.t('dns_querying_status', { provider: selectedText })}</div>`;

          const res = await queryAllDnsRecords(dom, typeSelect.value, providerSelect.value);
          try { sfx.playSuccess(); } catch(e) {}

          // Update Stats
          const elTotal = document.getElementById('statDnsTotal');
          const elIp = document.getElementById('statDnsIp');
          const elMx = document.getElementById('statDnsMx');
          const elStatus = document.getElementById('statDnsStatus');

          if (elTotal) elTotal.textContent = res.totalRecords;
          const ipCount = (res.grouped['A']?.length || 0) + (res.grouped['AAAA']?.length || 0);
          if (elIp) elIp.textContent = `${ipCount}`;
          if (elMx) elMx.textContent = `${res.grouped['MX']?.length || 0}`;
          if (elStatus) elStatus.textContent = 'NOERROR';

          if (res.totalRecords === 0) {
            gridContainer.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-dim);font-family:var(--font-mono);">${i18n.t('dns_no_records', { type: typeSelect.value })}</div>`;
            return;
          }

          // Render Categorized Cards
          gridContainer.innerHTML = Object.entries(res.grouped)
            .filter(([_, records]) => records && records.length > 0)
            .map(([type, records]) => `
              <div class="dns-type-card">
                <div class="dns-type-header">
                  <div class="dns-type-title">
                    <span>📌 ${type}</span>
                    <span class="dns-type-badge">${records.length}</span>
                  </div>
                </div>
                <table class="dns-record-table">
                  <thead>
                    <tr>
                      <th style="width:180px;">${i18n.t('dns_th_name')}</th>
                      <th style="width:90px;">${i18n.t('dns_th_ttl')}</th>
                      <th>${i18n.t('dns_th_value')}</th>
                      <th style="width:60px;text-align:right;">${i18n.t('dns_th_copy')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${records.map(r => `
                      <tr>
                        <td style="color:var(--aurora-cyan);">${r.name}</td>
                        <td style="color:var(--text-dim);">${r.ttl}s</td>
                        <td style="font-family:var(--font-mono);">${r.data}</td>
                        <td style="text-align:right;">
                          <button class="dns-copy-btn" data-val="${r.data}" title="${i18n.t('dns_th_copy')}">📋</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `).join('');

          // Bind Copy buttons
          gridContainer.querySelectorAll('.dns-copy-btn').forEach(btn => {
            btn.onclick = () => {
              navigator.clipboard.writeText(btn.dataset.val);
              try { sfx.playSuccess(); } catch(e) {}
              toast.success(i18n.t('dns_copy_toast'));
            };
          });
        } finally {
          isDnsRunning = false;
          if (btnRunDns) {
            btnRunDns.disabled = false;
            btnRunDns.classList.remove('btn-loading');
            btnRunDns.innerHTML = i18n.t('btn_run_dns');
          }
        }
      }

      const triggerAddCustomDns = () => {
        try { sfx.playClick(); } catch(e) {}
        openDnsModal((dohUrl, serverName) => {
          const newServer = createCustomDnsServer(serverName || dohUrl, dohUrl);
          customDnsList.push(newServer);
          saveCustomDnsServers(customDnsList);
          populateProviderSelect();
          providerSelect.value = newServer.id;
          toast.success(`已保存自定义 DNS: ${newServer.name}`);
          executeDns();
        });
      };

      providerSelect.onchange = executeDns;
      typeSelect.onchange = executeDns;
      input.onkeydown = (e) => {
        if (e.key === 'Enter') executeDns();
      };

      if (addCustomDnsBtn) {
        addCustomDnsBtn.onclick = triggerAddCustomDns;
      }

      document.getElementById('btnRunDns').onclick = executeDns;
      document.getElementById('btnDnsSample').onclick = () => {
        input.value = SAMPLES.domain;
        executeDns();
      };

      executeDns();
    }
  }

  // ====== Custom Integrated Glass Modal Manager ======
  const modalOverlay = document.getElementById('customModalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalCancel = document.getElementById('modalCancel');
  const modalConfirm = document.getElementById('modalConfirm');
  const modalDohUrl = document.getElementById('modalDohUrl');
  const modalDohName = document.getElementById('modalDohName');

  function openDnsModal(onConfirmCallback) {
    if (!modalOverlay) return;
    if (modalDohUrl) modalDohUrl.value = '';
    if (modalDohName) modalDohName.value = '';
    modalOverlay.classList.add('open');
    setTimeout(() => modalDohUrl?.focus(), 50);

    modalConfirm.onclick = () => {
      const dohUrl = modalDohUrl ? modalDohUrl.value.trim() : '';
      const serverName = modalDohName ? modalDohName.value.trim() : '';
      if (!dohUrl) {
        toast.info('请先输入有效的 DoH 服务器 URL (例: https://doh.dns.sb/dns-query)');
        if (modalDohUrl) modalDohUrl.focus();
        return;
      }
      if (onConfirmCallback) onConfirmCallback(dohUrl, serverName);
      modalOverlay.classList.remove('open');
    };
  }

  const closeModal = () => modalOverlay && modalOverlay.classList.remove('open');
  if (modalClose) modalClose.onclick = closeModal;
  if (modalCancel) modalCancel.onclick = closeModal;
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Initial load: Default to IP Lookup Homepage
  switchTool('ip');

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
