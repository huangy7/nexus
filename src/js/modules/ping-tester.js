const PING_ENDPOINTS = [
  { name: 'Cloudflare Edge (1.1.1.1)', url: 'https://1.1.1.1/cdn-cgi/trace' },
  { name: 'Google DNS (8.8.8.8)', url: 'https://dns.google/resolve?name=example.com' },
  { name: 'Vercel Edge API', url: '/api/ping' },
  { name: 'Aliyun DNS (223.5.5.5)', url: 'https://dns.alidns.com/resolve?name=example.com' }
];

export async function runPingTest(onProgress) {
  const results = [];
  for (const ep of PING_ENDPOINTS) {
    const start = performance.now();
    let status = 'ok';
    let latency = 0;
    try {
      const res = await fetch(ep.url, { mode: 'cors', cache: 'no-store' });
      latency = Math.round(performance.now() - start);
      if (!res.ok) status = 'degraded';
    } catch (e) {
      latency = Math.round(performance.now() - start);
      status = 'timeout';
    }
    const item = { name: ep.name, latency, status };
    results.push(item);
    if (onProgress) onProgress(item);
  }
  return results;
}
