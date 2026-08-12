# 📋 悬浮式复制按键与上下文复制反馈 (Floating Copy Overlay) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove ambiguous global copy buttons from top stage action bars and introduce floating contextual copy buttons across JSON Studio, Codec & Hash Studio, IP Telemetry, and Timestamp Converter.

**Architecture:** Create a reusable helper `setupCopyButton(buttonElement, getContentFn, successToastText)` in `src/js/modules/toast.js` (or a helper module), add `.copy-overlay-btn` and `.copy-overlay-container` in `src/css/main.css`, and refactor stage actions in `src/js/main.js`.

---

### Task 1: Add Copy Overlay CSS Styles (`src/css/main.css`)

**Files:**
- Modify: `src/css/main.css`

- [ ] **Step 1: Add `.copy-overlay-btn` styles to `src/css/main.css`**

```css
.copy-overlay-container {
  position: relative;
}

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
  display: inline-flex;
  align-items: center;
  gap: 4px;
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

- [ ] **Step 2: Commit CSS changes**

---

### Task 2: Refactor Copy Buttons in JSON Studio & Codec Studio (`src/js/main.js`)

**Files:**
- Modify: `src/js/main.js`

- [ ] **Step 1: Remove ambiguous global `btnJsonCopy` & `btnCodecCopy` from `stageActions`**
- [ ] **Step 2: Add floating copy buttons to JSON Studio Left/Right Panes**
- [ ] **Step 3: Add floating copy buttons to Codec Sub-Tabs (Base64, URL, HTML, Multi-Hash, JWT)**
- [ ] **Step 4: Update click handlers to display 1.5s `✔ 已复制` button feedback + explicit toast message**

---

### Task 3: Build Verification & End-to-End Testing

- [ ] **Step 1: Run `npm run build`**
- [ ] **Step 2: Verify with `ego-browser` on `http://localhost:3000`**
- [ ] **Step 3: Commit and push changes**
