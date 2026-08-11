export async function getClientIpData() {
  let basicData = null;
  
  // Primary: Vercel Edge API
  try {
    const res = await fetch('/api/ip');
    if (res.ok) basicData = await res.json();
  } catch (e) {}

  let targetIp = basicData?.ip && basicData.ip !== '127.0.0.1' ? basicData.ip : '';

  // Fetch Rich Telemetry from ipwho.is (free, no API key needed, detailed JSON)
  let richData = null;
  try {
    const res = await fetch(targetIp ? `https://ipwho.is/${targetIp}` : 'https://ipwho.is/');
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
        country: data.country_name,
        country_code: data.country_code,
        flag: { emoji: getCountryEmoji(data.country_code) },
        region: data.region,
        city: data.city,
        postal: data.postal,
        latitude: data.latitude,
        longitude: data.longitude,
        connection: {
          asn: data.asn,
          org: data.org,
          isp: data.org,
          domain: ''
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

  // Parse OS & Browser from User Agent
  const ua = navigator.userAgent;
  const os = parseOS(ua);
  const browser = parseBrowser(ua);

  return {
    ip: richData?.ip || basicData?.ip || '127.0.0.1',
    version: richData?.type || (richData?.ip?.includes(':') ? 'IPv6' : 'IPv4'),
    geo: {
      country: richData?.country || basicData?.geo?.country || 'Unknown',
      countryCode: richData?.country_code || basicData?.geo?.country || 'UN',
      flag: richData?.flag?.emoji || getCountryEmoji(richData?.country_code || basicData?.geo?.country),
      region: richData?.region || basicData?.geo?.region || '',
      city: richData?.city || basicData?.geo?.city || '',
      postal: richData?.postal || 'N/A',
      latitude: richData?.latitude || basicData?.geo?.latitude || '0',
      longitude: richData?.longitude || basicData?.geo?.longitude || '0',
    },
    network: {
      asn: richData?.connection?.asn ? `AS${richData.connection.asn}` : 'N/A',
      isp: richData?.connection?.isp || richData?.connection?.org || 'Unknown ISP',
      org: richData?.connection?.org || 'N/A',
      domain: richData?.connection?.domain || 'N/A',
    },
    timezone: {
      id: richData?.timezone?.id || Intl.DateTimeFormat().resolvedOptions().timeZone,
      utc: richData?.timezone?.utc || '',
      currentTime: richData?.timezone?.current_time || new Date().toLocaleString(),
    },
    security: {
      proxy: richData?.security?.proxy || false,
      vpn: richData?.security?.vpn || false,
      tor: richData?.security?.tor || false,
      hosting: richData?.security?.hosting || false,
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
