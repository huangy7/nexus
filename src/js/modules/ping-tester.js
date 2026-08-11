export const PING_NODES = [
  // China & Regional
  { id: 'aliyun', name: '阿里云 DNS (杭州)', host: 'dns.alidns.com', category: 'china', flag: '🇨🇳', url: 'https://dns.alidns.com/resolve?name=example.com' },
  { id: 'dnspod', name: 'DNSPod / 腾讯云 (广州)', host: 'doh.pub', category: 'china', flag: '🇨🇳', url: 'https://doh.pub/dns-query' },
  { id: 'baidu', name: '百度 DNS (北京)', host: 'doh.bce.baidu.com', category: 'china', flag: '🇨🇳', url: 'https://doh.bce.baidu.com/dns-query' },
  { id: 'hk', name: '中国香港 Edge', host: 'ap-east-1.amazonaws.com', category: 'asia', flag: '🇭🇰', url: 'https://dynamodb.ap-east-1.amazonaws.com/ping' },

  // Asia-Pacific
  { id: 'tokyo', name: '日本东京 (AWS Tokyo)', host: 'ap-northeast-1.amazonaws.com', category: 'asia', flag: '🇯🇵', url: 'https://dynamodb.ap-northeast-1.amazonaws.com/ping' },
  { id: 'seoul', name: '韩国首尔 (AWS Seoul)', host: 'ap-northeast-2.amazonaws.com', category: 'asia', flag: '🇰🇷', url: 'https://dynamodb.ap-northeast-2.amazonaws.com/ping' },
  { id: 'singapore', name: '新加坡 (AWS Singapore)', host: 'ap-southeast-1.amazonaws.com', category: 'asia', flag: '🇸🇬', url: 'https://dynamodb.ap-southeast-1.amazonaws.com/ping' },

  // US & Europe
  { id: 'us-west', name: '美国西海岸 (AWS US-West)', host: 'us-west-1.amazonaws.com', category: 'western', flag: '🇺🇸', url: 'https://dynamodb.us-west-1.amazonaws.com/ping' },
  { id: 'us-east', name: '美国东海岸 (AWS US-East)', host: 'us-east-1.amazonaws.com', category: 'western', flag: '🇺🇸', url: 'https://dynamodb.us-east-1.amazonaws.com/ping' },
  { id: 'frankfurt', name: '德国法兰克福 (AWS Europe)', host: 'eu-central-1.amazonaws.com', category: 'western', flag: '🇩🇪', url: 'https://dynamodb.eu-central-1.amazonaws.com/ping' },

  // Developer & AI APIs
  { id: 'cloudflare', name: 'Cloudflare DNS', host: '1.1.1.1', category: 'dev', flag: '⚡', url: 'https://1.1.1.1/cdn-cgi/trace' },
  { id: 'github', name: 'GitHub API Service', host: 'api.github.com', category: 'dev', flag: '🐙', url: 'https://api.github.com/zen' },
  { id: 'openai', name: 'OpenAI API Gateway', host: 'api.openai.com', category: 'dev', flag: '🤖', url: 'https://api.openai.com/v1/models' },
  { id: 'vercel', name: 'Vercel Edge Gateway', host: 'nexus.vercel.app', category: 'dev', flag: '▲', url: '/api/ping' },
];

export function createCustomNode(rawInput) {
  let val = rawInput.trim();
  if (!val) return null;

  let url = val;
  let host = val;

  if (!val.startsWith('http://') && !val.startsWith('https://')) {
    url = `https://${val}`;
  }

  try {
    const parsed = new URL(url);
    host = parsed.host;
  } catch (e) {}

  const id = 'custom-' + Date.now();
  return {
    id,
    name: `自定义目标 (${host})`,
    host,
    category: 'custom',
    flag: '🎯',
    url,
    isCustom: true
  };
}

export async function singleProbe(url) {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    await fetch(url, { mode: 'no-cors', cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    return Math.round(performance.now() - start);
  } catch (e) {
    const duration = Math.round(performance.now() - start);
    return duration > 3500 ? -1 : duration;
  }
}

export async function runNodePing(node, sampleCount = 3) {
  const samples = [];
  let timeouts = 0;

  for (let i = 0; i < sampleCount; i++) {
    const t = await singleProbe(node.url);
    if (t < 0) {
      timeouts++;
    } else {
      samples.push(t);
    }
  }

  if (samples.length === 0) {
    return {
      ...node,
      status: 'timeout',
      min: '—',
      avg: '—',
      max: '—',
      loss: 100,
      grade: 'timeout'
    };
  }

  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const sum = samples.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / samples.length);
  const loss = Math.round((timeouts / sampleCount) * 100);

  let grade = 'fast';
  if (avg > 250 || loss >= 50) grade = 'slow';
  else if (avg > 120) grade = 'good';

  return {
    ...node,
    status: 'ok',
    min,
    avg,
    max,
    loss,
    grade
  };
}

export async function runGlobalPingSuite(nodesList, onProgress) {
  const results = [];
  
  // Parallel execution in batches of 4
  const batchSize = 4;
  for (let i = 0; i < nodesList.length; i += batchSize) {
    const batch = nodesList.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(node => runNodePing(node, 2)));
    batchResults.forEach(res => {
      results.push(res);
      if (onProgress) onProgress(res, results.length, nodesList.length);
    });
  }

  return results;
}
