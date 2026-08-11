// JSON Tools
export function formatJson(input) {
  if (!input || !input.trim()) return { success: false, error: 'Empty input' };
  try {
    const parsed = JSON.parse(input);
    return { success: true, formatted: JSON.stringify(parsed, null, 2), parsed };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function minifyJson(input) {
  if (!input || !input.trim()) return { success: false, error: 'Empty input' };
  try {
    const parsed = JSON.parse(input);
    return { success: true, minified: JSON.stringify(parsed) };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Base64 / JWT / Crypto Tools
export function processBase64(input, isEncode = true) {
  if (!input) return { success: false, error: 'Empty input' };
  try {
    if (isEncode) {
      return { success: true, result: btoa(unescape(encodeURIComponent(input))) };
    } else {
      return { success: true, result: decodeURIComponent(escape(atob(input.trim()))) };
    }
  } catch (e) {
    return { success: false, error: 'Invalid Base64 string' };
  }
}

export function parseJwt(token) {
  if (!token || !token.trim()) return { success: false, error: 'Empty token' };
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return { success: false, error: 'JWT must have 3 parts separated by dots' };
    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return { success: true, header, payload, signature: parts[2] };
  } catch (e) {
    return { success: false, error: 'Failed to decode JWT payload: ' + e.message };
  }
}

export async function computeHash(text, algo = 'SHA-256') {
  if (!text) return { success: false, hash: '' };
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algo, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return { success: true, hash: hashHex };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Timestamp Converter
export function convertTimestamp(value) {
  if (!value) return { success: false, error: 'Empty timestamp' };
  try {
    let num = Number(value);
    let date;
    if (isNaN(num)) {
      date = new Date(value);
    } else {
      // 10 digits -> seconds, 13 digits -> milliseconds
      if (value.trim().length === 10) num *= 1000;
      date = new Date(num);
    }
    if (isNaN(date.getTime())) return { success: false, error: 'Invalid Date/Timestamp' };
    return {
      success: true,
      unixSec: Math.floor(date.getTime() / 1000),
      unixMs: date.getTime(),
      iso: date.toISOString(),
      local: date.toLocaleString(),
      utc: date.toUTCString()
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Sample Data Generator for testing
export const SAMPLES = {
  json: JSON.stringify({
    name: "Nexus DevTools",
    version: "2.0.0",
    features: ["Zero-Click IP", "Live Reaction", "Multi-Language"],
    settings: { darkMode: true, soundFX: true },
    timestamp: Date.now()
  }, null, 2),
  jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIERldiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  base64: "Hello Nexus DevTools! 🚀",
  domain: "github.com"
};
