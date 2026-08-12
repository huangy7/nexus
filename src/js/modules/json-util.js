/**
 * Escapes a JSON string into an escaped string literal with \" and \\
 */
export function escapeJsonString(str) {
  try {
    return JSON.stringify(str);
  } catch (e) {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
  }
}

/**
 * Unescapes a string containing escaped quotes (\") and slashes (\\)
 */
export function unescapeJsonString(str) {
  if (!str) return '';
  let cleaned = str.trim();

  // If it's wrapped in double quotes (e.g. "\"{\\\"name\\\":...}\""), try JSON.parse unescape
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    try {
      const parsed = JSON.parse(cleaned);
      if (typeof parsed === 'string') {
        return parsed;
      }
    } catch (e) {}
  }

  // General regex unescaping for slashes, quotes, and newlines
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
 * Parses JSON safely and extracts line/column error information if syntax fails.
 * Unwraps multi-level escaped string literals automatically if inner content is valid JSON.
 */
export function parseJsonWithErrorInfo(inputStr) {
  let text = inputStr.trim();
  if (!text) {
    return { success: false, data: null, error: { message: 'Empty input', line: 1, column: 1 } };
  }

  // Iteratively unwrap string literals if JSON.parse yields an inner JSON string
  let data = null;
  let parseErr = null;

  try {
    data = JSON.parse(text);
    // If the parsed result is a string that looks like a JSON object/array, try parsing inner JSON
    while (typeof data === 'string' && (data.trim().startsWith('{') || data.trim().startsWith('['))) {
      try {
        data = JSON.parse(data.trim());
      } catch (innerErr) {
        break;
      }
    }
    return { success: true, data, error: null };
  } catch (err) {
    parseErr = err;
  }

  // Fallback: try unescaping backslashes if direct parse failed
  try {
    const unescaped = unescapeJsonString(text);
    if (unescaped !== text) {
      data = JSON.parse(unescaped);
      while (typeof data === 'string' && (data.trim().startsWith('{') || data.trim().startsWith('['))) {
        try {
          data = JSON.parse(data.trim());
        } catch (e) { break; }
      }
      return { success: true, data, error: null };
    }
  } catch (e) {}

  // Parse error line & column calculation
  const message = parseErr ? parseErr.message : 'Invalid JSON Syntax';
  let line = 1;
  let column = 1;

  const posMatch = message.match(/at position (\d+)/i);
  if (posMatch) {
    const pos = parseInt(posMatch[1], 10);
    const lines = text.slice(0, pos).split('\n');
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
