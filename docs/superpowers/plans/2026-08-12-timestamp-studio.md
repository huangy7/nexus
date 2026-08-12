# ⏱️ 时间戳工坊 (Timestamp Studio) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the basic timestamp tool into a feature-rich, high-craft **Timestamp Studio** with a live digital clock banner, smart bi-directional conversion (auto-unit detection + relative time), multi-timezone cards, and multi-language code snippets.

**Architecture:** Create `src/js/modules/time-util.js`, add UI styles to `src/css/main.css`, and update `src/js/main.js` for stage `id === 'time'`.

---

### Task 1: Create Time Utility Module (`src/js/modules/time-util.js`)

**Files:**
- Create: `src/js/modules/time-util.js`

- [ ] **Step 1: Create `src/js/modules/time-util.js`**
  - Implement `formatTimestampToAll(input)` (auto-detects 10-digit s, 13-digit ms, 16-digit μs, 19-digit ns, outputs YYYY-MM-DD HH:mm:ss, ISO, Relative Time like "3分钟前").
  - Implement `parseDateToTimestamps(dateStr)` (parses datetime string or local datetime picker value into seconds & milliseconds).
  - Implement `getMultiTimezoneTimes(dateObj)` (computes formatted time for Asia/Shanghai, UTC, America/New_York, America/Los_Angeles, Europe/London, Asia/Tokyo).
  - Implement `getCodeSnippets()` (returns copyable snippets for JS, Python, Java, Go, Rust, C#, PHP, SQL).
- [ ] **Step 2: Verify build with `npm run build`**

---

### Task 2: Add Timestamp Studio CSS Styles (`src/css/main.css`)

**Files:**
- Modify: `src/css/main.css`

- [ ] **Step 1: Add CSS rules for `.time-clock-banner`, `.tz-grid`, `.tz-card`, `.code-grid`, and `.code-card`**
- [ ] **Step 2: Verify build with `npm run build`**

---

### Task 3: Wire Timestamp Studio UI and Reactivity (`src/js/main.js`)

**Files:**
- Modify: `src/js/main.js`

- [ ] **Step 1: Import functions from `time-util.js`**
- [ ] **Step 2: Update `id === 'time'` stage in `renderToolStage`**
  - Live clock header updating every second with `⏸️ 暂停 / ▶️ 恢复` button state.
  - Left pane (Timestamp -> Date) with auto-unit detection and relative time.
  - Right pane (Date -> Timestamp) with datetime picker & freeform text input.
  - Bottom section: Global Timezone cards & Multi-language Code Snippets cheat sheet with 1-click copy.
- [ ] **Step 3: Verify build with `npm run build`**

---

### Task 4: End-to-End Verification & Final Build

- [ ] **Step 1: Test with `ego-browser` on `http://localhost:3000`**
- [ ] **Step 2: Confirm zero errors in `npm run build`**
