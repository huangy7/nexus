# JSON Studio (JSON 工坊) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the JSON Studio tool in Nexus to support syntax highlighted, collapsible tree nodes, string escaping/unescaping, Unicode decoding, and precise error line/column inspection.

**Architecture:** Create modular helpers `src/js/modules/json-util.js` (for string escapes, Unicode transforms, and error location extraction) and `src/js/modules/json-tree.js` (for syntax highlighting and interactive collapsible tree nodes), then wire them into `src/js/main.js` and `src/index.html`.

**Tech Stack:** Vanilla JavaScript (ES modules), CSS variables, HTML5.

---

### Task 1: Create JSON Helper Utility Module (`src/js/modules/json-util.js`)

**Files:**
- Create: `src/js/modules/json-util.js`

- [ ] **Step 1: Write `src/js/modules/json-util.js` with escape, unescape, unicode, and error parser functions**

```javascript
/**
 * Escapes a JSON string into an escaped string literal with \" and \\
 */
export function escapeJsonString(str) {
  try {
    return JSON.stringify(str);
  } catch (e) {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }
}

/**
 * Unescapes a string containing escaped quotes (\") and slashes (\\)
 */
export function unescapeJsonString(str) {
  let cleaned = str.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    try {
      cleaned = JSON.parse(cleaned);
    } catch (e) {}
  }
  return cleaned
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t');
}

/**
 * Decodes \uXXXX Unicode escape sequences into human-readable Chinese / characters
 */
export function decodeUnicode(str) {
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
}

/**
 * Encodes non-ASCII characters (e.g. Chinese) into \uXXXX Unicode sequences
 */
export function encodeUnicode(str) {
  return str.replace(/[\u007F-\uFFFF]/g, (char) => {
    return '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
  });
}

/**
 * Parses JSON safely and extracts line/column error information if syntax fails
 */
export function parseJsonWithErrorInfo(inputStr) {
  try {
    const data = JSON.parse(inputStr);
    return { success: true, data, error: null };
  } catch (err) {
    const message = err.message;
    let line = 1;
    let column = 1;

    // Extract position numbers from V8 error messages (e.g. "at position 42" or "line 2 column 5")
    const posMatch = message.match(/at position (\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const lines = inputStr.slice(0, pos).split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    } else {
      const lineColMatch = message.match(/line (\d+) column (\d+)/i);
      if (lineColMatch) {
        line = parseInt(lineColMatch[1], 10);
        column = parseInt(lineColMatch[2], 10);
      }
    }

    return {
      success: false,
      data: null,
      error: {
        message,
        line,
        column
      }
    };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/js/modules/json-util.js
git commit -m "feat(json): create json-util module for escaping, unicode transforms and error parser

1. 🔤 增加 JSON 字符串转义 (escapeJsonString) 与反转义 (unescapeJsonString) 导出
2. 🌐 增加 Unicode 开头 \uXXXX 编解码转换函数
3. 🚨 增加精准 SyntaxError 行号与列号定位解析"
```

---

### Task 2: Create Rendered Tree Component Generator (`src/js/modules/json-tree.js`)

**Files:**
- Create: `src/js/modules/json-tree.js`
- Modify: `src/css/main.css`

- [ ] **Step 1: Write `src/js/modules/json-tree.js` with tree node rendering and folding**

```javascript
/**
 * Renders JSON data into an interactive, collapsible DOM structure with syntax highlighting
 */
export function renderJsonTree(data, isLast = true, level = 0) {
  const container = document.createElement('div');
  container.className = 'json-tree-node';

  if (data === null) {
    container.innerHTML = `<span class="json-val-null">null</span>${isLast ? '' : '<span class="json-comma">,</span>'}`;
    return container;
  }

  const type = typeof data;

  if (type === 'boolean') {
    container.innerHTML = `<span class="json-val-bool">${data}</span>${isLast ? '' : '<span class="json-comma">,</span>'}`;
    return container;
  }

  if (type === 'number') {
    container.innerHTML = `<span class="json-val-num">${data}</span>${isLast ? '' : '<span class="json-comma">,</span>'}`;
    return container;
  }

  if (type === 'string') {
    const escaped = escapeHtml(JSON.stringify(data));
    container.innerHTML = `<span class="json-val-str">${escaped}</span>${isLast ? '' : '<span class="json-comma">,</span>'}`;
    return container;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      container.innerHTML = `<span class="json-bracket">[]</span>${isLast ? '' : '<span class="json-comma">,</span>'}`;
      return container;
    }

    const foldBtn = document.createElement('span');
    foldBtn.className = 'json-tree-toggle open';
    foldBtn.textContent = '▼';

    const header = document.createElement('div');
    header.className = 'json-tree-header';
    header.appendChild(foldBtn);

    const openBracket = document.createElement('span');
    openBracket.className = 'json-bracket';
    openBracket.textContent = '[';
    header.appendChild(openBracket);

    const badge = document.createElement('span');
    badge.className = 'json-badge';
    badge.textContent = ` ${data.length} items `;
    header.appendChild(badge);

    const body = document.createElement('div');
    body.className = 'json-tree-body';

    data.forEach((item, idx) => {
      const child = renderJsonTree(item, idx === data.length - 1, level + 1);
      body.appendChild(child);
    });

    const footer = document.createElement('div');
    footer.className = 'json-tree-footer';
    footer.innerHTML = `<span class="json-bracket">]</span>${isLast ? '' : '<span class="json-comma">,</span>'}`;

    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(footer);

    foldBtn.onclick = (e) => {
      e.stopPropagation();
      const isOpen = foldBtn.classList.contains('open');
      if (isOpen) {
        foldBtn.classList.remove('open');
        foldBtn.textContent = '▶';
        body.style.display = 'none';
        badge.style.display = 'inline-block';
      } else {
        foldBtn.classList.add('open');
        foldBtn.textContent = '▼';
        body.style.display = 'block';
        badge.style.display = 'none';
      }
    };

    return container;
  }

  if (type === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      container.innerHTML = `<span class="json-bracket">{}</span>${isLast ? '' : '<span class="json-comma">,</span>'}`;
      return container;
    }

    const foldBtn = document.createElement('span');
    foldBtn.className = 'json-tree-toggle open';
    foldBtn.textContent = '▼';

    const header = document.createElement('div');
    header.className = 'json-tree-header';
    header.appendChild(foldBtn);

    const openBrace = document.createElement('span');
    openBrace.className = 'json-bracket';
    openBrace.textContent = '{';
    header.appendChild(openBrace);

    const badge = document.createElement('span');
    badge.className = 'json-badge';
    badge.textContent = ` ${keys.length} keys `;
    header.appendChild(badge);

    const body = document.createElement('div');
    body.className = 'json-tree-body';

    keys.forEach((key, idx) => {
      const row = document.createElement('div');
      row.className = 'json-tree-row';

      const keySpan = document.createElement('span');
      keySpan.className = 'json-key';
      keySpan.textContent = `"${key}": `;
      row.appendChild(keySpan);

      const valNode = renderJsonTree(data[key], idx === keys.length - 1, level + 1);
      row.appendChild(valNode);

      body.appendChild(row);
    });

    const footer = document.createElement('div');
    footer.className = 'json-tree-footer';
    footer.innerHTML = `<span class="json-bracket">}</span>${isLast ? '' : '<span class="json-comma">,</span>'}`;

    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(footer);

    foldBtn.onclick = (e) => {
      e.stopPropagation();
      const isOpen = foldBtn.classList.contains('open');
      if (isOpen) {
        foldBtn.classList.remove('open');
        foldBtn.textContent = '▶';
        body.style.display = 'none';
        badge.style.display = 'inline-block';
      } else {
        foldBtn.classList.add('open');
        foldBtn.textContent = '▼';
        body.style.display = 'block';
        badge.style.display = 'none';
      }
    };

    return container;
  }

  return container;
}

export function expandAllTreeNodes(container) {
  container.querySelectorAll('.json-tree-toggle').forEach(btn => {
    btn.classList.add('open');
    btn.textContent = '▼';
  });
  container.querySelectorAll('.json-tree-body').forEach(body => {
    body.style.display = 'block';
  });
  container.querySelectorAll('.json-badge').forEach(badge => {
    badge.style.display = 'none';
  });
}

export function collapseAllTreeNodes(container) {
  container.querySelectorAll('.json-tree-toggle').forEach(btn => {
    btn.classList.remove('open');
    btn.textContent = '▶';
  });
  container.querySelectorAll('.json-tree-body').forEach(body => {
    body.style.display = 'none';
  });
  container.querySelectorAll('.json-badge').forEach(badge => {
    badge.style.display = 'inline-block';
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
```

- [ ] **Step 2: Add JSON Tree styles in `src/css/main.css`**

```css
/* JSON Studio Tree Viewer Styling */
.json-tree-container {
  font-family: var(--font-mono);
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--text-primary);
  padding: 12px;
  user-select: text;
}

.json-tree-node {
  position: relative;
  display: inline-block;
  vertical-align: top;
}

.json-tree-header {
  display: flex;
  align-items: center;
  gap: 4px;
}

.json-tree-toggle {
  cursor: pointer;
  font-size: 0.72rem;
  color: var(--text-dim);
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  transition: transform 0.15s ease, color 0.15s ease;
}

.json-tree-toggle:hover {
  color: var(--aurora-cyan);
}

.json-tree-body {
  padding-left: 20px;
  border-left: 1px dashed rgba(255, 255, 255, 0.12);
  margin-left: 6px;
}

[data-theme="light"] .json-tree-body {
  border-left-color: rgba(0, 0, 0, 0.12);
}

.json-tree-row {
  display: flex;
  align-items: flex-start;
  margin: 2px 0;
}

.json-key {
  color: var(--aurora-cyan);
  font-weight: 600;
  margin-right: 4px;
  white-space: nowrap;
}

.json-val-str { color: var(--aurora-emerald); word-break: break-all; }
.json-val-num { color: var(--aurora-amber); font-weight: 600; }
.json-val-bool { color: var(--aurora-purple); font-weight: 600; }
.json-val-null { color: var(--text-dim); font-style: italic; }
.json-bracket { color: var(--text-secondary); font-weight: 600; }
.json-comma { color: var(--text-dim); }

.json-badge {
  display: none;
  font-size: 0.72rem;
  background: rgba(0, 240, 255, 0.12);
  color: var(--aurora-cyan);
  border: 1px solid rgba(0, 240, 255, 0.25);
  border-radius: 4px;
  padding: 0 6px;
  margin-left: 6px;
  font-family: var(--font-mono);
}

.json-error-card {
  padding: 20px;
  border-radius: 8px;
  background: rgba(244, 63, 94, 0.08);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: var(--aurora-rose);
  font-family: var(--font-mono);
  font-size: 0.88rem;
  line-height: 1.6;
}

.json-error-title {
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/js/modules/json-tree.js src/css/main.css
git commit -m "feat(json): create json-tree view generator and CSS styles

1. 🌳 实现递归 DOM 渲染器 renderJsonTree，支持开括号侧边折叠图标 (▼/▶)
2. 🎨 配置 Key, String, Number, Boolean, Null 极光五色语法高亮调色盘
3. 📦 增加 expandAllTreeNodes 与 collapseAllTreeNodes 工具函数"
```

---

### Task 3: Wire JSON Studio Tool in `src/js/main.js` & `src/js/modules/dev-tools.js`

**Files:**
- Modify: `src/js/main.js`
- Modify: `src/js/modules/dev-tools.js`

- [ ] **Step 1: Import json-util and json-tree in `src/js/main.js` and wire up JSON Studio action bar**

Update JSON stage in `src/js/main.js`:
- Action buttons: `Sample Data`, `Escape / Unescape`, `Unicode Decode`, `Expand All`, `Collapse All`, `Copy`, `Download`, `Clear`.
- Real-time reactivity: When inputting JSON in left textarea, run `parseJsonWithErrorInfo(input)`.
- If valid: Render `renderJsonTree(data)` inside `#jsonOutput`.
- If invalid: Render `.json-error-card` showing exact line & column numbers.

- [ ] **Step 2: Commit**

```bash
git add src/js/main.js src/js/modules/dev-tools.js
git commit -m "feat(json): integrate interactive collapsible tree viewer & escape/unicode tools in JSON Studio

1. 🔀 重新配置 JSON 工坊分栏工具栏与事件绑定
2. 🌳 将常规格式化输出升级为具交互可折叠树状节点渲染
3. 🚨 精确展示非法 JSON 错误的行号、列号与原文本高亮位置"
```

---

### Task 4: Verification & Build Validation

**Files:**
- Test build: `npm run build`
- Browser test: `ego-browser` on `http://localhost:3000`

- [ ] **Step 1: Execute production build**

Run: `npm run build 2>&1`
Expected: `built in ...ms` with 0 errors.

- [ ] **Step 2: Verify in ego-browser**

Inspect JSON Studio in browser with sample JSON input, toggle fold icons, test escape/unescape and unicode buttons.

- [ ] **Step 3: Commit**
