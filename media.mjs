import { getStore } from '@netlify/blobs';

// Zentraler Speicher (Netlify Blobs) für Community-Uploads:
// { videos: [{uid,id,t,s,group}], reads: [{uid,u,t,s}] }
const KEY = 'data';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,x-admin-token',
  'Content-Type': 'application/json; charset=utf-8',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

function newUid() {
  return 'u' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
}

function parseYouTubeId(url) {
  if (!url) return null;
  url = String(url).trim();
  const pats = [
    /[?&]v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /\/embed\/([\w-]{11})/,
    /\/shorts\/([\w-]{11})/,
    /\/live\/([\w-]{11})/,
  ];
  for (const p of pats) { const m = url.match(p); if (m) return m[1]; }
  if (/^[\w-]{11}$/.test(url)) return url;
  return null;
}

function clean(v, max) { return String(v == null ? '' : v).trim().slice(0, max); }

async function readData(store) {
  try {
    const d = await store.get(KEY, { type: 'json' });
    if (d && typeof d === 'object') {
      return { videos: Array.isArray(d.videos) ? d.videos : [], reads: Array.isArray(d.reads) ? d.reads : [] };
    }
  } catch (e) { /* leer */ }
  return { videos: [], reads: [] };
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  let store;
  try { store = getStore('weinakademie-media'); }
  catch (e) { return json({ error: 'blobs_unavailable' }, 500); }

  try {
    if (req.method === 'GET') {
      return json(await readData(store));
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const data = await readData(store);
      const it = body.item || {};

      if (body.type === 'video') {
        const id = parseYouTubeId(it.id || it.url || '');
        const t = clean(it.t, 140);
        if (!id) return json({ error: 'invalid_youtube' }, 400);
        if (!t) return json({ error: 'missing_title' }, 400);
        data.videos.push({ uid: newUid(), id, t, s: clean(it.s, 80), group: clean(it.group, 60) || 'Weitere Videos' });
      } else if (body.type === 'read') {
        const u = clean(it.u, 600);
        const t = clean(it.t, 140);
        if (!/^https?:\/\/.+/i.test(u)) return json({ error: 'invalid_url' }, 400);
        if (!t) return json({ error: 'missing_title' }, 400);
        data.reads.push({ uid: newUid(), u, t, s: clean(it.s, 80) });
      } else {
        return json({ error: 'bad_type' }, 400);
      }

      // Kappung gegen Missbrauch
      if (data.videos.length > 500) data.videos = data.videos.slice(-500);
      if (data.reads.length > 500) data.reads = data.reads.slice(-500);

      await store.setJSON(KEY, data);
      return json(data);
    }

    if (req.method === 'DELETE') {
      const admin = process.env.ADMIN_TOKEN || '';
      const token = req.headers.get('x-admin-token') || '';
      // Wenn ein ADMIN_TOKEN gesetzt ist, muss es stimmen. Ohne gesetztes Token ist Löschen offen.
      if (admin && token !== admin) return json({ error: 'unauthorized' }, 401);

      const body = await req.json().catch(() => ({}));
      const data = await readData(store);
      if (body.type === 'video') data.videos = data.videos.filter((v) => v.uid !== body.uid);
      else if (body.type === 'read') data.reads = data.reads.filter((r) => r.uid !== body.uid);
      else return json({ error: 'bad_type' }, 400);

      await store.setJSON(KEY, data);
      return json(data);
    }

    return json({ error: 'method_not_allowed' }, 405);
  } catch (e) {
    return json({ error: 'server_error', detail: String(e && e.message || e) }, 500);
  }
};
