export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const clientIp = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || '127.0.0.1';
  const geoCountry = req.headers.get('x-vercel-ip-country') || 'UN';
  const geoCity = req.headers.get('x-vercel-ip-city') || 'Unknown';
  const geoRegion = req.headers.get('x-vercel-ip-country-region') || '';
  const geoLat = req.headers.get('x-vercel-ip-latitude') || '0';
  const geoLon = req.headers.get('x-vercel-ip-longitude') || '0';
  const userAgent = req.headers.get('user-agent') || '';

  return new Response(
    JSON.stringify({
      ip: clientIp,
      geo: {
        country: geoCountry,
        city: decodeURIComponent(geoCity),
        region: geoRegion,
        latitude: geoLat,
        longitude: geoLon,
      },
      userAgent,
      timestamp: Date.now()
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store'
      }
    }
  );
}
