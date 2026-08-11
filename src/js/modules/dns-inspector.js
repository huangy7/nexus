export async function queryDnsRecords(domain) {
  const recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT'];
  const results = {};
  
  for (const type of recordTypes) {
    try {
      const res = await fetch(`/api/dns?name=${encodeURIComponent(domain)}&type=${type}`);
      if (res.ok) {
        const data = await res.json();
        results[type] = data.Answer || [];
      } else {
        results[type] = [];
      }
    } catch (e) {
      results[type] = [];
    }
  }
  return results;
}
