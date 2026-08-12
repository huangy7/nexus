export const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'CAA'];

export const BUILTIN_DNS_SERVERS = [
  { id: 'google', name: 'Google DNS (8.8.8.8)', flag: '🌐', doh: 'https://dns.google/resolve' },
  { id: 'cloudflare', name: 'Cloudflare DNS (1.1.1.1)', flag: '⚡', doh: 'https://cloudflare-dns.com/dns-query' },
  { id: 'aliyun', name: '阿里云 AliDNS (223.5.5.5)', flag: '🇨🇳', doh: 'https://dns.alidns.com/resolve' },
  { id: 'dnspod', name: 'DNSPod (119.29.29.29)', flag: '🇨🇳', doh: 'https://doh.pub/dns-query' },
  { id: 'quad9', name: 'Quad9 DNS (9.9.9.9)', flag: '🛡️', doh: 'https://dns.quad9.net/dns-query' },
];

const DNS_TYPE_CODES = {
  1: 'A',
  28: 'AAAA',
  5: 'CNAME',
  15: 'MX',
  16: 'TXT',
  2: 'NS',
  6: 'SOA',
  257: 'CAA'
};

export function getCustomDnsServers() {
  try {
    return JSON.parse(localStorage.getItem('nexus_custom_dns_servers') || '[]');
  } catch (e) {
    return [];
  }
}

export function saveCustomDnsServers(servers) {
  try {
    localStorage.setItem('nexus_custom_dns_servers', JSON.stringify(servers));
  } catch (e) {}
}

export function createCustomDnsServer(name, dohUrl) {
  let url = dohUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  const id = 'custom-dns-' + Date.now();
  return {
    id,
    name: name.trim() || url,
    flag: '🎯',
    doh: url,
    isCustom: true
  };
}

export async function fetchDnsRecordFromProvider(domain, type, providerIdOrUrl = 'google') {
  const customList = getCustomDnsServers();
  const allServers = [...BUILTIN_DNS_SERVERS, ...customList];
  
  let provider = allServers.find(s => s.id === providerIdOrUrl);
  if (!provider) {
    if (providerIdOrUrl.startsWith('http://') || providerIdOrUrl.startsWith('https://')) {
      provider = { id: 'custom', name: 'Custom DNS', doh: providerIdOrUrl };
    } else {
      provider = BUILTIN_DNS_SERVERS[0];
    }
  }

  const sanitizedDomain = sanitizeDomainInput(domain);

  try {
    let url = `${provider.doh}?name=${encodeURIComponent(sanitizedDomain)}&type=${type}`;
    const headers = { 'Accept': 'application/dns-json' };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) return { type, success: false, records: [] };
    const data = await res.json();

    const answers = (data.Answer || []).map(ans => {
      const typeName = DNS_TYPE_CODES[ans.type] || type;
      return {
        name: ans.name,
        type: typeName,
        ttl: ans.TTL,
        data: cleanRecordData(ans.data, typeName)
      };
    });

    return {
      type,
      success: true,
      status: data.Status === 0 ? 'NOERROR' : `STATUS_${data.Status}`,
      records: answers
    };
  } catch (e) {
    return { type, success: false, records: [] };
  }
}

export async function queryAllDnsRecords(domain, targetType = 'ALL', providerIdOrUrl = 'google') {
  const sanitized = sanitizeDomainInput(domain);
  const typesToQuery = targetType === 'ALL' ? RECORD_TYPES : [targetType];

  const results = await Promise.all(
    typesToQuery.map(t => fetchDnsRecordFromProvider(sanitized, t, providerIdOrUrl))
  );

  const grouped = {};
  let totalRecords = 0;

  results.forEach(res => {
    grouped[res.type] = res.records;
    totalRecords += res.records.length;
  });

  return {
    domain: sanitized,
    provider: providerIdOrUrl,
    totalRecords,
    grouped,
    raw: results
  };
}

export function sanitizeDomainInput(raw) {
  if (!raw) return '';
  let clean = raw.trim().toLowerCase();
  clean = clean.replace(/^(https?:\/\/)?(www\.)?/, '');
  clean = clean.split('/')[0].split('?')[0].split('#')[0];
  return clean;
}

function cleanRecordData(dataStr, type) {
  if (!dataStr) return '';
  let val = String(dataStr).trim();
  if (val.startsWith('"') && val.endsWith('"')) {
    val = val.slice(1, -1);
  }
  return val;
}
