# 🔐 编解码/哈希 (Codec & Hash Studio) Design Specification

## Overview

The **Codec & Hash Studio** in Nexus provides developers with a suite of encoding, decoding, hashing, and token parsing utilities in a single, high-performance, client-side interface. The interface follows "Option A": a sub-tabbed navigation layout where users can seamlessly switch between specific tool modes.

---

## 1. Feature Specifications

### 1.1 Sub-Tab 1: Base64 编解码 (Base64 Encoder/Decoder)
- **Functions**:
  - Standard Base64 Encoding / Decoding (`UTF-8` safe for Chinese and Unicode characters).
  - URL-Safe Base64 Toggle (`+` $\to$ `-`, `/` $\to$ `_`).
  - Data-URI Image Detection: If the output is a valid `data:image/...` string or base64 image data, display an instant image preview box.
- **Actions**: `编码 (Encode)`, `解码 (Decode)`, `复制 (Copy)`, `清空 (Clear)`.

### 1.2 Sub-Tab 2: URL 编解码 (URL Encoder/Decoder)
- **Functions**:
  - `encodeURIComponent` / `decodeURIComponent` (Default, for query parameters).
  - `encodeURI` / `decodeURI` (Full URL mode, preserving `http://`, `?`, `&`).
- **Actions**: `编码 (Encode)`, `解码 (Decode)`, `全URL编码 (Full URL)`, `复制 (Copy)`, `清空 (Clear)`.

### 1.3 Sub-Tab 3: HTML 实体 (HTML Entity Encoder/Decoder)
- **Functions**:
  - Encodes special characters (`<`, `>`, `&`, `"`, `'`) to HTML entities (`&lt;`, `&gt;`, `&amp;`, `&quot;`, `&#39;`).
  - Decodes named and numeric HTML entities.
- **Actions**: `编码 (Encode)`, `解码 (Decode)`, `复制 (Copy)`, `清空 (Clear)`.

### 1.4 Sub-Tab 4: 全算法哈希 (Multi-Hash Engine)
- **Functions**:
  - Real-time simultaneous hash calculation for:
    - **MD5** (32-character hex)
    - **SHA-1** (40-character hex)
    - **SHA-256** (64-character hex)
    - **SHA-512** (128-character hex)
  - Options:
    - `Salt (加盐)` input field: Prepend/Append salt to string before hashing.
    - `大写 (HEX)` / `小写 (hex)` toggle switch.
- **UI Card Layout**: Grid of 4 cards showing algorithm name, hash result, character length badge, and a `📋 复制` button.

### 1.5 Sub-Tab 5: JWT 令牌解包 (JWT Inspector)
- **Functions**:
  - Decodes 3-part JWT (`Header`, `Payload`, `Signature`).
  - Decodes Base64Url header and payload JSON with full formatting & color-coded JSON tree.
  - Expiration Inspection: Checks `exp` and `nbf` claims, displaying a badge (`🟢 有效 (Valid)`, `🔴 已过期 (Expired)`, `⚠️ 格式错误 (Invalid)`).
  - Displays human-readable datetime for `exp` and `iat`.
- **Actions**: `📄 载入示例 (Sample JWT)`, `📋 复制 Payload`, `🗑️ 清空 (Clear)`.

---

## 2. Architecture & File Structure

### 2.1 Utility Module (`src/js/modules/codec-util.js`)
Contains pure functions without DOM dependencies:
- `encodeBase64(str, isUrlSafe)`
- `decodeBase64(str, isUrlSafe)`
- `encodeUrlComponent(str)` / `decodeUrlComponent(str)`
- `encodeFullUrl(str)` / `decodeFullUrl(str)`
- `encodeHtmlEntity(str)` / `decodeHtmlEntity(str)`
- `computeMd5(str)`
- `computeSha1(str)`
- `computeSha256(str)`
- `computeSha512(str)`
- `computeAllHashes(str, salt, isUppercase)`
- `parseJwtToken(jwtStr)`

### 2.2 UI Wiring & Integration (`src/js/main.js`)
Handles sub-tab switching, DOM rendering, button event bindings, and live reactive updates for each mode.

---

## 3. Verification Plan

### Automated Build Verification
- Run `npm run build` to verify clean module imports and bundle generation.

### Manual & Ego-Browser End-to-End Verification
- **Base64**: Test Chinese characters `"Hello 世界"` $\to$ `SGVsbG8gOSVlNCViOCU4NCVlNSViOSVhZg==` and back.
- **URL**: Test query string with Chinese/symbols $\to$ verify `encodeURIComponent`.
- **HTML Entity**: Test `<script>alert("XSS")</script>` $\to$ `&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;`.
- **Multi-Hash**: Input `"123456"`, verify MD5 = `e10adc3949ba59abbe56e057f20f883e`, SHA-256 = `8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92`. Test uppercase toggle and salt.
- **JWT**: Input sample JWT, verify Header, Payload, and Expired/Valid badge.
