# 📡 端口工坊 (Port Studio) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the basic port tool into a high-craft **Port Studio** featuring Cyber Matrix Radar Dashboard, 5 preset场景 Pill, 40+ categorized foldable port cards with latency & risk badges, and a searchable port service dictionary.

**Architecture:** Create `src/js/modules/port-util.js`, add CSS styles to `src/css/main.css`, and update `src/js/main.js` for stage `id === 'port'`.

---

### Task 1: Create Port Utility Module (`src/js/modules/port-util.js`)

**Files:**
- Create: `src/js/modules/port-util.js`

- [ ] **Step 1: Create `src/js/modules/port-util.js`**
  - Define `PORT_DATABASE` array covering 40+ common ports (HTTP, HTTPS, SSH, RDP, MySQL, Postgres, Redis, MongoDB, RabbitMQ, Kafka, Docker, Kubernetes, etc.) grouped into 5 categories.
  - Implement `parsePortsInput(inputStr)` (handles range `80-90`, list `21,22,80`, returns deduplicated sorted port list).
  - Implement `getPresetPorts(presetType)` (returns port arrays for Web, Remote, Database, MQ, HighRisk, All).
  - Implement `probePortStatus(host, port)` (probe status Open/Closed/Filtered with latency RTT).
  - Implement `searchPortDictionary(keyword)` (filters 40+ port catalog for the dictionary view).
- [ ] **Step 2: Verify build with `npm run build`**

---

### Task 2: Add Port Studio CSS Styles (`src/css/main.css`)

**Files:**
- Modify: `src/css/main.css`

- [ ] **Step 1: Add CSS rules for `.port-preset-bar`, `.port-preset-pill`, `.port-cat-section`, `.port-card-grid`, `.port-status-card`, `.port-dict-grid`, and `.port-dict-card`**
- [ ] **Step 2: Verify build with `npm run build`**

---

### Task 3: Wire Port Studio UI and Reactivity (`src/js/main.js`)

**Files:**
- Modify: `src/js/main.js`

- [ ] **Step 1: Import functions from `port-util.js`**
- [ ] **Step 2: Update `id === 'port'` stage in `renderToolStage`**
  - Control banner with target host input + preset pills + custom ports input + scan button.
  - Filter toolbar: All / Open Only / High Risk Only.
  - Render 5 categorized foldable sections with animated progress bar during scanning.
  - Render searchable Port Knowledge Dictionary with click-to-add functionality.
  - Add result copy handlers.
- [ ] **Step 3: Verify build with `npm run build`**

---

### Task 4: End-to-End Verification & Final Build

- [ ] **Step 1: Test with `ego-browser` on `http://localhost:3000`**
- [ ] **Step 2: Confirm zero errors in `npm run build`**
