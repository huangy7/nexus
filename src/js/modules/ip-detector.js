export async function getClientIpData() {
  try {
    const res = await fetch('/api/ip');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}
  
  // Fallback public IP API
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    return {
      ip: data.ip,
      geo: {
        country: data.country_code,
        city: data.city,
        region: data.region,
        latitude: data.latitude,
        longitude: data.longitude
      },
      userAgent: navigator.userAgent
    };
  } catch (e) {
    return {
      ip: '127.0.0.1',
      geo: { country: 'LOCAL', city: 'Localhost', region: 'Dev' },
      userAgent: navigator.userAgent
    };
  }
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
