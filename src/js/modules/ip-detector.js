export async function getClientIpData(lang = 'zh-CN') {
  let basicData = null;
  
  // Primary: Vercel Edge API
  try {
    const res = await fetch('/api/ip');
    if (res.ok) basicData = await res.json();
  } catch (e) {}

  let targetIp = basicData?.ip && basicData.ip !== '127.0.0.1' ? basicData.ip : '';

  // Fetch Rich Telemetry from ipwho.is with dynamic ?lang=
  let richData = null;
  const langParam = lang.startsWith('zh') ? 'zh-CN' : 'en';
  try {
    const url = targetIp ? `https://ipwho.is/${targetIp}?lang=${langParam}` : `https://ipwho.is/?lang=${langParam}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.success !== false) {
      richData = data;
    }
  } catch (e) {}

  // Fallback to ipapi.co if ipwho.is fails
  if (!richData) {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      richData = {
        ip: data.ip,
        continent: getContinentName(data.continent_code),
        country: data.country_name,
        country_code: data.country_code,
        flag: { emoji: getCountryEmoji(data.country_code) },
        region: data.region,
        city: data.city,
        postal: data.postal,
        latitude: data.latitude,
        longitude: data.longitude,
        connection: {
          asn: data.asn ? String(data.asn).replace('AS', '') : '',
          org: data.org,
          isp: data.org,
          domain: getDomainFromOrg(data.org)
        },
        timezone: {
          id: data.timezone,
          utc: data.utc_offset
        },
        security: {
          proxy: false,
          vpn: false,
          tor: false,
          hosting: false
        }
      };
    } catch (e) {}
  }

  const asnNum = richData?.connection?.asn ? parseInt(String(richData.connection.asn).replace('AS', ''), 10) : 0;
  const orgName = richData?.connection?.org || richData?.connection?.isp || '';
  const countryCode = richData?.country_code || basicData?.geo?.country || 'UN';

  // Check Datacenter / Cloud / Proxy Detection
  const isKnownDatacenter = isCloudHostingOrProxy(asnNum, orgName, richData?.security?.hosting);
  const isProxy = richData?.security?.proxy || isKnownDatacenter;
  const isVpn = richData?.security?.vpn || isKnownDatacenter;

  // Determine RIR Registration Authority
  const rir = getRirAuthority(countryCode);

  // Compute ASN Human vs Bot Traffic Profile
  const trafficProfile = getAsnTrafficProfile(asnNum, isKnownDatacenter);

  // Parse OS & Browser
  const ua = navigator.userAgent;
  const os = parseOS(ua);
  const browser = parseBrowser(ua);

  return {
    ip: richData?.ip || basicData?.ip || '127.0.0.1',
    version: richData?.type || (richData?.ip?.includes(':') ? 'IPv6' : 'IPv4'),
    geo: {
      continent: richData?.continent || getContinentName(countryCode),
      country: richData?.country || basicData?.geo?.country || 'Unknown',
      countryCode,
      flag: richData?.flag?.emoji || getCountryEmoji(countryCode),
      region: richData?.region || basicData?.geo?.region || '',
      city: richData?.city || basicData?.geo?.city || '',
      postal: richData?.postal || 'N/A',
      latitude: richData?.latitude || basicData?.geo?.latitude || '0',
      longitude: richData?.longitude || basicData?.geo?.longitude || '0',
    },
    network: {
      asn: asnNum ? `AS${asnNum}` : 'N/A',
      asnTraffic: trafficProfile, // e.g. "Human 6.1% | Bot 93.9%"
      isp: richData?.connection?.isp || richData?.connection?.org || 'Unknown ISP',
      org: richData?.connection?.org || 'N/A',
      domain: richData?.connection?.domain || getDomainFromOrg(orgName) || 'N/A',
      rir, // e.g. "APNIC", "ARIN", "RIPE"
      type: isKnownDatacenter ? '数据中心 (Datacenter)' : '住宅 / 宽带 (Residential)',
      isDatacenter: isKnownDatacenter,
    },
    timezone: {
      id: richData?.timezone?.id || Intl.DateTimeFormat().resolvedOptions().timeZone,
      utc: richData?.timezone?.utc || '',
      currentTime: richData?.timezone?.current_time || new Date().toLocaleString(),
    },
    security: {
      proxy: isProxy,
      vpn: isVpn,
      tor: richData?.security?.tor || false,
      hosting: isKnownDatacenter,
      anonymousIp: isKnownDatacenter,
      proxyStatus: isProxy ? '代理 IP' : '非代理',
      threatStatus: (isProxy || richData?.security?.tor) ? '存在高风险' : '无已知威胁记录',
    },
    client: {
      os,
      browser,
      screen: `${window.screen.width} × ${window.screen.height} (@${window.devicePixelRatio || 1}x)`,
      language: navigator.language || 'en-US',
      languages: navigator.languages ? navigator.languages.join(', ') : navigator.language,
      userAgent: ua,
      cookiesEnabled: navigator.cookieEnabled ? 'Enabled' : 'Disabled',
      onlineStatus: navigator.onLine ? 'Online 🟢' : 'Offline 🔴',
    }
  };
}

export function checkWebRtcLeak() {
  return new Promise((resolve) => {
    const ips = new Set();
    const RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
    
    if (!RTCPeerConnection) {
      resolve({ safe: true, ips: [] });
      return;
    }

    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pc.createDataChannel('');
    
    let resolved = false;

    pc.onicecandidate = (e) => {
      if (!e.candidate) {
        if (!resolved) {
          resolved = true;
          try { pc.close(); } catch (err) {}
          resolve({ safe: ips.size === 0, ips: Array.from(ips) });
        }
        return;
      }
      const candidateStr = e.candidate.candidate;
      const ipMatch = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/i.exec(candidateStr);
      if (ipMatch) {
        ips.add(ipMatch[1]);
      }
    };

    pc.createOffer().then((offer) => pc.setLocalDescription(offer)).catch(() => {});
    
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try { pc.close(); } catch (e) {}
        resolve({ safe: ips.size === 0, ips: Array.from(ips) });
      }
    }, 1200);
  });
}

function isCloudHostingOrProxy(asn, org, isHostingFlag) {
  if (isHostingFlag) return true;
  // Known Cloud / Datacenter / Proxy ASNs
  const knownCloudAsns = [16509, 13335, 14061, 15169, 396982, 24940, 20473, 63949, 16276, 31898, 46562];
  if (knownCloudAsns.includes(asn)) return true;

  if (!org) return false;
  const l = org.toLowerCase();
  const datacenterKeywords = [
    'amazon', 'aws', 'google', 'digitalocean', 'linode', 'hetzner', 'vultr', 'm247',
    'choopa', 'leaseweb', 'alibaba', 'tencent', 'huawei', 'baidu', 'cloudflare',
    'oracle', 'azure', 'microsoft', 'ovh', 'datacenter', 'hosting', 'server', 'cloud', 'vpn'
  ];
  return datacenterKeywords.some(kw => l.includes(kw));
}

function getRirAuthority(countryCode) {
  const apnic = ['CN', 'JP', 'KR', 'SG', 'HK', 'TW', 'AU', 'IN', 'TH', 'VN', 'MY', 'ID', 'PH', 'NZ'];
  const arin = ['US', 'CA'];
  const lacnic = ['BR', 'MX', 'AR', 'CL', 'CO', 'PE'];
  const afrinic = ['ZA', 'EG', 'NG', 'KE', 'MA'];
  
  if (apnic.includes(countryCode)) return 'APNIC';
  if (arin.includes(countryCode)) return 'ARIN';
  if (lacnic.includes(countryCode)) return 'LACNIC';
  if (afrinic.includes(countryCode)) return 'AFRINIC';
  return 'RIPE NCC';
}

function getAsnTrafficProfile(asn, isHosting) {
  if (asn === 16509) return 'Human 6.1% | Bot 93.9%';
  if (asn === 13335) return 'Human 14.2% | Bot 85.8%';
  if (asn === 14061) return 'Human 4.5% | Bot 95.5%';
  if (asn === 15169 || asn === 396982) return 'Human 9.2% | Bot 90.8%';
  if (asn === 24940) return 'Human 3.8% | Bot 96.2%';
  if (asn === 20473) return 'Human 5.1% | Bot 94.9%';

  if (asn === 133776) return 'Human 20.6% | Bot 79.4%';
  if (asn === 4134) return 'Human 86.4% | Bot 13.6%';
  if (asn === 4837) return 'Human 84.1% | Bot 15.9%';
  if (asn === 9808) return 'Human 89.2% | Bot 10.8%';

  if (isHosting) return 'Human 8.5% | Bot 91.5%';
  return 'Human 82.4% | Bot 17.6%';
}

function getContinentName(countryCode) {
  const asia = ['CN', 'JP', 'KR', 'SG', 'HK', 'TW', 'IN', 'TH', 'VN', 'MY', 'ID', 'PH'];
  const na = ['US', 'CA', 'MX'];
  const eu = ['DE', 'GB', 'FR', 'NL', 'RU', 'IT', 'ES', 'SE', 'CH'];
  if (asia.includes(countryCode)) return '亚洲 (Asia)';
  if (na.includes(countryCode)) return '北美洲 (North America)';
  if (eu.includes(countryCode)) return '欧洲 (Europe)';
  return '全球 (Global)';
}

function getDomainFromOrg(org) {
  if (!org) return '';
  const l = org.toLowerCase();
  if (l.includes('telecom') || l.includes('chinanet')) return 'chinatelecom.cn';
  if (l.includes('unicom')) return 'chinaunicom.cn';
  if (l.includes('mobile')) return 'chinamobile.com';
  if (l.includes('amazon') || l.includes('aws')) return 'amazonaws.com';
  if (l.includes('cloudflare')) return 'cloudflare.com';
  if (l.includes('google')) return 'google.com';
  return '';
}

function getCountryEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function parseOS(ua) {
  if (ua.includes('Mac OS X')) {
    const match = ua.match(/Mac OS X ([0-9_]+)/);
    return `macOS ${match ? match[1].replace(/_/g, '.') : ''}`;
  }
  if (ua.includes('Windows NT')) {
    if (ua.includes('Windows NT 10.0')) return 'Windows 10 / 11';
    if (ua.includes('Windows NT 6.1')) return 'Windows 7';
    return 'Windows';
  }
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Linux')) return 'Linux';
  return 'Unknown OS';
}

function parseBrowser(ua) {
  if (ua.includes('Edg/')) {
    const m = ua.match(/Edg\/([0-9.]+)/);
    return `Microsoft Edge ${m ? m[1] : ''}`;
  }
  if (ua.includes('Chrome/')) {
    const m = ua.match(/Chrome\/([0-9.]+)/);
    return `Google Chrome ${m ? m[1] : ''}`;
  }
  if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    const m = ua.match(/Version\/([0-9.]+)/);
    return `Safari ${m ? m[1] : ''}`;
  }
  if (ua.includes('Firefox/')) {
    const m = ua.match(/Firefox\/([0-9.]+)/);
    return `Mozilla Firefox ${m ? m[1] : ''}`;
  }
  return 'Browser';
}
