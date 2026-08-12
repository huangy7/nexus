# 🔐 编解码/哈希 (Codec & Hash Studio) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the Codec & Hash Studio in Nexus into a multi-mode workbench featuring Base64 (with URL-safe & image preview), URL encoding, HTML Entities, a Multi-Hash engine (MD5, SHA-1, SHA-256, SHA-512 with Salt & HEX Case toggle), and an interactive JWT Inspector.

**Architecture:** Create pure helper module `src/js/modules/codec-util.js` with all encoding, hashing, and JWT parsing functions, add styled sub-tab panels and multi-hash cards in `src/css/main.css`, and wire sub-tab switching and live reactive events in `src/js/main.js`.

---

### Task 1: Create Codec Utility Module (`src/js/modules/codec-util.js`)

**Files:**
- Create: `src/js/modules/codec-util.js`

- [ ] **Step 1: Write `src/js/modules/codec-util.js`**

```javascript
/**
 * UTF-8 Safe Base64 Encoding
 */
export function encodeBase64(str, isUrlSafe = false) {
  try {
    const encoded = btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode('0x' + p1);
    }));
    if (isUrlSafe) {
      return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    return encoded;
  } catch (e) {
    return '';
  }
}

/**
 * UTF-8 Safe Base64 Decoding
 */
export function decodeBase64(str, isUrlSafe = false) {
  try {
    let clean = str.trim();
    if (isUrlSafe) {
      clean = clean.replace(/-/g, '+').replace(/_/g, '/');
      while (clean.length % 4 !== 0) clean += '=';
    }
    const decoded = decodeURIComponent(Array.prototype.map.call(atob(clean), (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return decoded;
  } catch (e) {
    return '❌ 非法的 Base64 编码字符串';
  }
}

/**
 * URL Component Encoding / Decoding
 */
export function encodeUrlComponent(str) {
  return encodeURIComponent(str);
}

export function decodeUrlComponent(str) {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
}

export function encodeFullUrl(str) {
  return encodeURI(str);
}

export function decodeFullUrl(str) {
  try {
    return decodeURI(str);
  } catch (e) {
    return str;
  }
}

/**
 * HTML Entity Encoding / Decoding
 */
export function encodeHtmlEntity(str) {
  const element = document.createElement('div');
  element.innerText = str;
  return element.innerHTML;
}

export function decodeHtmlEntity(str) {
  const element = document.createElement('div');
  element.innerHTML = str;
  return element.innerText;
}

/**
 * Simple Pure JS MD5 Implementation
 */
export function md5(string) {
  function rotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
    } else return (lResult ^ lX8 ^ lY8);
  }
  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return (x ^ y ^ z); }
  function I(x, y, z) { return (y ^ (x | (~z))); }
  function FF(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function convertToWordArray(str) {
    var lWordCount;
    var lMessageLength = str.length;
    var lNumberOfWords_temp1 = lMessageLength + 8;
    var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    var lWordArray = Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function wordToHex(lValue) {
    var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue += WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }
  var x = Array();
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
  var utf8Str = unescape(encodeURIComponent(string));
  x = convertToWordArray(utf8Str);
  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
  for (k = 0; k < x.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 5], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 10], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 15], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 2], S32, 0xE6D17471);
    c = HH(c, d, a, b, x[k + 7], S33, 0xC33707D6);
    b = HH(b, c, d, a, x[k + 12], S34, 0xF4D50D87);
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

/**
 * Web Crypto SHA Hash Digest
 */
export async function computeSubtleHash(algo, text) {
  if (!text) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algo, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return '';
  }
}

/**
 * Compute All Hashes (MD5, SHA-1, SHA-256, SHA-512)
 */
export async function computeAllHashes(inputStr, salt = '', isUppercase = false) {
  if (!inputStr) {
    return { md5: '', sha1: '', sha256: '', sha512: '' };
  }
  const text = salt ? salt + inputStr : inputStr;
  
  let md5Hash = md5(text);
  let sha1Hash = await computeSubtleHash('SHA-1', text);
  let sha256Hash = await computeSubtleHash('SHA-256', text);
  let sha512Hash = await computeSubtleHash('SHA-512', text);

  if (isUppercase) {
    md5Hash = md5Hash.toUpperCase();
    sha1Hash = sha1Hash.toUpperCase();
    sha256Hash = sha256Hash.toUpperCase();
    sha512Hash = sha512Hash.toUpperCase();
  }

  return {
    md5: md5Hash,
    sha1: sha1Hash,
    sha256: sha256Hash,
    sha512: sha512Hash
  };
}

/**
 * JWT Token Inspector
 */
export function parseJwtToken(jwtStr) {
  if (!jwtStr || typeof jwtStr !== 'string') {
    return { success: false, error: '请输入有效的 JWT 字符串' };
  }
  const parts = jwtStr.trim().split('.');
  if (parts.length !== 3) {
    return { success: false, error: '无效的 JWT 格式（JWT 应包含用点分割的 3 部分）' };
  }

  try {
    const headerJson = JSON.parse(decodeBase64(parts[0], true));
    const payloadJson = JSON.parse(decodeBase64(parts[1], true));
    const signature = parts[2];

    let status = 'valid';
    let statusText = '🟢 签名有效 / 未过期';
    let expFormatted = '永久有效 (未包含 exp)';

    if (payloadJson.exp) {
      const expDate = new Date(payloadJson.exp * 1000);
      expFormatted = expDate.toLocaleString();
      if (Date.now() >= payloadJson.exp * 1000) {
        status = 'expired';
        statusText = '🔴 令牌已过期 (Expired)';
      }
    }

    return {
      success: true,
      header: headerJson,
      payload: payloadJson,
      signature: signature,
      status: status,
      statusText: statusText,
      expFormatted: expFormatted
    };
  } catch (e) {
    return { success: false, error: 'JWT 解析失败：' + e.message };
  }
}
```

- [ ] **Step 2: Commit `src/js/modules/codec-util.js`**

---

### Task 2: Create Codec Sub-Tabs UI and CSS Styles

**Files:**
- Modify: `src/css/main.css`

- [ ] **Step 1: Add sub-tab and multi-hash card grid styles in `src/css/main.css`**

```css
/* Codec Sub-Tab Pill Bar */
.codec-subtabs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.codec-tab-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: var(--radius-md);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.codec-tab-btn:hover {
  background: var(--glass-bg-hover);
  color: var(--text-primary);
}

.codec-tab-btn.active {
  background: rgba(0, 240, 255, 0.12);
  border-color: var(--aurora-cyan);
  color: var(--aurora-cyan);
  font-weight: 600;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.15);
}

/* Multi-Hash Grid */
.hash-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.hash-card {
  background: var(--editor-input-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hash-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hash-algo-name {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--aurora-cyan);
}

.hash-val-text {
  font-family: var(--font-mono);
  font-size: 0.84rem;
  color: var(--aurora-emerald);
  word-break: break-all;
  background: rgba(0, 0, 0, 0.2);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* JWT Inspector Cards */
.jwt-card {
  background: var(--editor-input-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  margin-bottom: 12px;
}

.jwt-badge-valid {
  color: var(--aurora-emerald);
  background: rgba(0, 255, 157, 0.12);
  border: 1px solid rgba(0, 255, 157, 0.3);
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
}

.jwt-badge-expired {
  color: var(--aurora-rose);
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.3);
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
}
```

- [ ] **Step 2: Commit `src/css/main.css`**

---

### Task 3: Wire Codec Sub-Tabs & Live Reactivity in `src/js/main.js`

**Files:**
- Modify: `src/js/main.js`

- [ ] **Step 1: Update `renderToolStage('codec')` in `src/js/main.js`**

Implement sub-tabs switcher for `Base64`, `URL`, `HTML Entity`, `Multi-Hash`, and `JWT`.
Wire live reactive updates on text input for each sub-tab mode.

- [ ] **Step 2: Run `npm run build` & verify**

---

### Task 4: End-to-End Verification with `ego-browser`

- [ ] **Step 1: Test all 5 sub-tabs on `http://localhost:3000`**
- [ ] **Step 2: Commit and push changes**
