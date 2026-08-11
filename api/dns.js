export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  const type = searchParams.get('type') || 'A';

  if (!name) {
    return new Response(JSON.stringify({ error: 'Missing name parameter' }), { status: 400 });
  }

  try {
    const dohUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;
    const res = await fetch(dohUrl, {
      headers: { 'Accept': 'application/dns-json' }
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
