/**
 * Format Unix Timestamp (supports 10-digit s, 13-digit ms, 16-digit μs, 19-digit ns)
 */
export function formatTimestampToAll(inputVal) {
  if (!inputVal && inputVal !== 0) return { success: false, error: '请输入时间戳' };
  let str = String(inputVal).trim();
  if (!/^\d+$/.test(str)) return { success: false, error: '时间戳必须为纯数字' };

  let num = Number(str);
  let ms = num;
  let unit = 'ms';

  if (str.length <= 10) {
    ms = num * 1000;
    unit = 's (秒)';
  } else if (str.length <= 13) {
    ms = num;
    unit = 'ms (毫秒)';
  } else if (str.length <= 16) {
    ms = Math.floor(num / 1000);
    unit = 'μs (微秒)';
  } else {
    ms = Math.floor(num / 1000000);
    unit = 'ns (纳秒)';
  }

  const d = new Date(ms);
  if (isNaN(d.getTime())) return { success: false, error: '无效的时间戳数值' };

  return {
    success: true,
    unit,
    unixSec: Math.floor(d.getTime() / 1000),
    unixMs: d.getTime(),
    local: formatLocalDate(d),
    iso: d.toISOString(),
    utc: d.toUTCString(),
    relative: getRelativeTimeString(d),
    dateObj: d
  };
}

/**
 * Parse Date String or Date Picker value into timestamps
 */
export function parseDateToTimestamps(dateStr) {
  if (!dateStr) return { success: false, error: '请输入日期时间' };
  const str = String(dateStr).trim().replace(' ', 'T');
  const d = new Date(str);
  if (isNaN(d.getTime())) return { success: false, error: '无法解析的日期时间格式' };

  return {
    success: true,
    unixSec: Math.floor(d.getTime() / 1000),
    unixMs: d.getTime(),
    local: formatLocalDate(d),
    iso: d.toISOString(),
    utc: d.toUTCString(),
    relative: getRelativeTimeString(d),
    dateObj: d
  };
}

/**
 * Format Date into YYYY-MM-DD HH:mm:ss
 */
export function formatLocalDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

/**
 * Relative time calculation (e.g. 5分钟前 / 2小时后)
 */
export function getRelativeTimeString(targetDate) {
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
  const absDiff = Math.abs(diffSec);

  if (absDiff < 5) return '刚刚';
  
  const minutes = Math.floor(absDiff / 60);
  const hours = Math.floor(absDiff / 3600);
  const days = Math.floor(absDiff / 86400);

  let label = '';
  if (days > 0) label = `${days} 天`;
  else if (hours > 0) label = `${hours} 小时`;
  else label = `${minutes} 分钟`;

  return diffSec > 0 ? `${label}前` : `${label}后`;
}

/**
 * Format time for global timezones
 */
export function getGlobalTimezones(date = new Date()) {
  const timezones = [
    { name: '北京 / 上海 (CST)', zone: 'Asia/Shanghai', badge: 'UTC+8' },
    { name: '协调世界时 (UTC)', zone: 'UTC', badge: 'UTC+0' },
    { name: '纽约 (美东 EDT/EST)', zone: 'America/New_York', badge: 'UTC-4/5' },
    { name: '洛杉矶 (美西 PDT/PST)', zone: 'America/Los_Angeles', badge: 'UTC-7/8' },
    { name: '伦敦 (英国 BST/GMT)', zone: 'Europe/London', badge: 'UTC+0/1' },
    { name: '东京 (日本 JST)', zone: 'Asia/Tokyo', badge: 'UTC+9' }
  ];

  return timezones.map(tz => {
    try {
      const formatted = new Intl.DateTimeFormat('zh-CN', {
        timeZone: tz.zone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(date);
      return { ...tz, formatted };
    } catch (e) {
      return { ...tz, formatted: date.toLocaleString() };
    }
  });
}

/**
 * Multi-language Code Snippets Cheat Sheet
 */
export function getCodeSnippets() {
  return [
    { lang: 'JavaScript', code: 'Math.floor(Date.now() / 1000)' },
    { lang: 'Python', code: 'import time\nint(time.time())' },
    { lang: 'Java', code: 'System.currentTimeMillis() / 1000' },
    { lang: 'Go', code: 'time.Now().Unix()' },
    { lang: 'Rust', code: 'use std::time::SystemTime;\nSystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap().as_secs();' },
    { lang: 'C#', code: 'DateTimeOffset.UtcNow.ToUnixTimeSeconds();' },
    { lang: 'PHP', code: 'time();' },
    { lang: 'SQL (MySQL)', code: 'SELECT UNIX_TIMESTAMP();' }
  ];
}
