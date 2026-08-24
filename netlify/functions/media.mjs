import { getStore } from '@netlify/blobs';

// Zentraler Speicher (Netlify Blobs) – Datenmodell v2:
// { v:2, video:{cats:[{id,name}], items:[{uid,yt,t,s,cat}]},
//        read: {cats:[{id,name}], items:[{uid,u,t,s,cat}]} }
const KEY = 'data';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,x-admin-token',
  'Content-Type': 'application/json; charset=utf-8',
};
function json(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: CORS }); }
function uid() { return 'u' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
function cid() { return 'c' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
function clean(v, max) { return String(v == null ? '' : v).trim().slice(0, max); }
function parseYouTubeId(url) {
  if (!url) return null; url = String(url).trim();
  const pats = [/[?&]v=([\w-]{11})/, /youtu\.be\/([\w-]{11})/, /\/embed\/([\w-]{11})/, /\/shorts\/([\w-]{11})/, /\/live\/([\w-]{11})/];
  for (const p of pats) { const m = url.match(p); if (m) return m[1]; }
  if (/^[\w-]{11}$/.test(url)) return url;
  return null;
}

const CATS = [
  ['g_grund', 'Grundlagen, Terroir & Verkostung'], ['g_ch', 'Schweiz'], ['g_de', 'Deutschland'],
  ['g_at', 'Österreich'], ['g_fr', 'Frankreich'], ['g_es', 'Spanien'], ['g_za', 'Südafrika'], ['g_nw', 'Neue Welt'],
];
function seedData() {
  const cats = () => CATS.map(([id, name]) => ({ id, name }));
  return {
    v: 2,
    video: {
      cats: cats(),
      items: [
        { uid: 'sv01', yt: 'RiU53oTqXq0', t: 'Thema Wein – vom edlen Tropfen bis zur Verkostung', s: 'SRF Wissen / Einstein', cat: 'g_grund' },
        { uid: 'sv02', yt: 'R1Y9Tb8iD74', t: 'Terroir mit Tiefgang: Wie deutsche Winzer Massstäbe setzen', s: 'WELT Food', cat: 'g_grund' },
        { uid: 'sv03', yt: '6IP-LIUZ-OQ', t: 'Der Letzte seines Standes: Der Fassbinder', s: 'Benedikt Kuby Filmproduktion', cat: 'g_grund' },
        { uid: 'sv04', yt: 'gW9P3lzvy-s', t: 'Mysterium Schweizer Wein – Drei-Seen, Waadt, Wallis', s: 'Johannes trinkt Wein', cat: 'g_ch' },
        { uid: 'sv05', yt: 'd-2CB4DpZ2c', t: 'Schmidt Max und der Wein in der Schweiz', s: 'Bayerischer Rundfunk', cat: 'g_ch' },
        { uid: 'sv06', yt: 'Q8BNA4sWqo4', t: 'Die Spiritualität der Zisterzienser (Lavaux-Terrassen)', s: 'CTS Hochschule Münster', cat: 'g_ch' },
        { uid: 'sv07', yt: 'oQJORPCS5XE', t: 'Yvorne: Wine, Tradition, and Scenic Beauty', s: 'Voyages Tours', cat: 'g_ch' },
        { uid: 'sv08', yt: 'S2zTPZg_5q8', t: 'Deutscher Wein an der Mosel – eine Riesling-Reise', s: 'BR · Schmidt Max', cat: 'g_de' },
        { uid: 'sv09', yt: 'fHHJoYzQuz8', t: 'Zauberhafte Mosel (360° – GEO Reportage)', s: 'wocomoTRAVEL', cat: 'g_de' },
        { uid: 'sv19', yt: 'dIm7pyNB88g', t: 'Geisenheim – Jung im Herzen, verwurzelt im Wein', s: 'Rheingau.deineRegion', cat: 'g_de' },
        { uid: 'sv10', yt: 'ZoxmAViSYWw', t: 'Wein.Wege.Winzer – Region Südsteiermark', s: 'POPUPMEDIA', cat: 'g_at' },
        { uid: 'sv20', yt: 'VxR_0UiuXIs', t: 'Schloss Esterházy – 100 Jahre Burgenland', s: 'Esterhazy', cat: 'g_at' },
        { uid: 'sv21', yt: 'nqCGYkwBNNY', t: 'Schloss Gobelsburg 2023', s: 'POPUPMEDIA', cat: 'g_at' },
        { uid: 'sv11', yt: 'aUdwIEo53SU', t: 'Robert Parker Wine Advocate Team', s: 'Robert Parker Wine Advocate', cat: 'g_fr' },
        { uid: 'sv12', yt: 'uI8IwZsphCA', t: 'The Truth about Robert Parker', s: 'Bonner Private Wines', cat: 'g_fr' },
        { uid: 'sv13', yt: 'J-VkJlL_6Oc', t: 'Field Trip to Avondale: Why Biodynamic Wine Matters', s: 'Optimal Life', cat: 'g_za' },
        { uid: 'sv14', yt: 'QdvrWc2zZFU', t: 'Embark on a Virtual De Toren Tasting Experience', s: 'De Toren Private Cellar', cat: 'g_za' },
        { uid: 'sv15', yt: 'C3ioJD3Ggug', t: 'Discover Chile’s Signature Grape: Carménère (WSET 3)', s: 'Wine With Jimmy', cat: 'g_nw' },
        { uid: 'sv16', yt: 'dcuCMmwY2gE', t: 'Energieeffiziente Weinproduktion in Chile', s: 'DW Deutsch · Global Ideas', cat: 'g_nw' },
        { uid: 'sv17', yt: 'eAzvhF9yp4g', t: '7 Best Wineries & Bodegas in Mendoza, Argentina', s: 'Before You Go', cat: 'g_nw' },
        { uid: 'sv18', yt: 'O9rcb6FBmxw', t: 'Bodega Garzón in Wine Folly (Uruguay · Tannat)', s: 'Bodega Garzón', cat: 'g_nw' },
      ],
    },
    read: {
      cats: cats(),
      items: [
        { uid: 'sr01', u: 'https://www.nzz.ch/zuerich/ld.1878368', t: 'Am Zürichsee setzt Müller-Thurgau 1892 eine neue Traubensorte', s: 'Neue Zürcher Zeitung', cat: 'g_ch' },
        { uid: 'sr02', u: 'https://bordeaux-kompass.de/klassifikation-der-grands-crus-im-medoc-von-1855/', t: 'Klassifikation der Grands Crus im Médoc von 1855', s: 'Bordeaux-Kompass', cat: 'g_fr' },
        { uid: 'sr03', u: 'https://www.stern.de/genuss/weingut-creation-', t: 'Weingut Creation – wie ein Schweizer das beste Weingut Afrikas machte', s: 'Stern', cat: 'g_za' },
        { uid: 'sr04', u: 'https://www.avondalewine.co.za/', t: 'Avondale Wines – biodynamisches Weingut (Wein „La Luna")', s: 'Avondale, Paarl (ZA)', cat: 'g_za' },
      ],
    },
  };
}

// v1 -> v2 Migration (bestehende Community-Einträge erhalten)
function catForGroup(seed, group) {
  const g = (group || '').toLowerCase().trim();
  const byName = seed.video.cats.find(c => c.name.toLowerCase() === g);
  if (byName) return byName.id;
  if (g.includes('frankreich')) return 'g_fr';
  if (g.includes('deutschland') || g.includes('mosel') || g.includes('rheingau')) return 'g_de';
  if (g.includes('schweiz')) return 'g_ch';
  if (g.includes('österreich')) return 'g_at';
  if (g.includes('südafrika')) return 'g_za';
  if (g.includes('spanien')) return 'g_es';
  if (g.includes('neue welt') || g.includes('chile') || g.includes('argentin') || g.includes('uruguay')) return 'g_nw';
  if (g.includes('grundlagen') || g.includes('terroir')) return 'g_grund';
  return null;
}
function migrate(old) {
  const seed = seedData();
  (old.videos || []).forEach(v => {
    let cat = catForGroup(seed, v.group);
    if (!cat) { cat = cid(); seed.video.cats.push({ id: cat, name: v.group || 'Weitere Videos' }); }
    seed.video.items.push({ uid: v.uid || uid(), yt: v.id, t: v.t || '', s: v.s || '', cat });
  });
  (old.reads || []).forEach(r => {
    seed.read.items.push({ uid: r.uid || uid(), u: r.u, t: r.t || '', s: r.s || '', cat: seed.read.cats[0].id });
  });
  return seed;
}
function normalize(d) {
  ['video', 'read'].forEach(k => {
    if (!d[k]) d[k] = { cats: [], items: [] };
    if (!Array.isArray(d[k].cats)) d[k].cats = [];
    if (!Array.isArray(d[k].items)) d[k].items = [];
  });
  return d;
}
async function readData(store) {
  let d = null;
  try { d = await store.get(KEY, { type: 'json' }); } catch (e) {}
  if (d && d.v === 2) return normalize(d);
  const fresh = (d && (Array.isArray(d.videos) || Array.isArray(d.reads))) ? migrate(d) : seedData();
  try { await store.setJSON(KEY, fresh); } catch (e) {}
  return fresh;
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  let store;
  try { store = getStore('weinakademie-media'); } catch (e) { return json({ error: 'blobs_unavailable' }, 500); }

  try {
    if (req.method === 'GET') return json(await readData(store));

    const body = req.method === 'DELETE' ? await req.json().catch(() => ({})) : (req.method === 'POST' ? await req.json().catch(() => ({})) : {});
    const action = req.method === 'DELETE' ? 'del_item' : (body.action || 'add');
    const type = body.type;
    if (type !== 'video' && type !== 'read') return json({ error: 'bad_type' }, 400);
    const data = await readData(store);
    const T = data[type];
    const save = async () => { await store.setJSON(KEY, data); return json(data); };

    // ---- Offene Aktion: Eintrag hinzufügen (Community) ----
    if (req.method === 'POST' && action === 'add') {
      const it = body.item || {};
      if (!T.cats.find(c => c.id === it.cat)) return json({ error: 'bad_cat' }, 400);
      const t = clean(it.t, 140); if (!t) return json({ error: 'missing_title' }, 400);
      if (type === 'video') {
        const yt = parseYouTubeId(it.yt || it.url || ''); if (!yt) return json({ error: 'invalid_youtube' }, 400);
        T.items.push({ uid: uid(), yt, t, s: clean(it.s, 80), cat: it.cat });
      } else {
        const u = clean(it.u || it.url, 600); if (!/^https?:\/\/.+/i.test(u)) return json({ error: 'invalid_url' }, 400);
        T.items.push({ uid: uid(), u, t, s: clean(it.s, 80), cat: it.cat });
      }
      if (T.items.length > 1000) T.items = T.items.slice(-1000);
      return save();
    }

    // ---- Ab hier: Admin nötig ----
    const admin = process.env.ADMIN_TOKEN || '';
    const token = req.headers.get('x-admin-token') || '';
    if (admin && token !== admin) return json({ error: 'unauthorized' }, 401);

    if (action === 'del_item') {
      T.items = T.items.filter(x => x.uid !== body.uid);
      return save();
    }
    if (action === 'edit') {
      const it = T.items.find(x => x.uid === body.uid); if (!it) return json({ error: 'not_found' }, 404);
      const f = body.item || {};
      if (type === 'video' && (f.yt || f.url)) { const yt = parseYouTubeId(f.yt || f.url); if (!yt) return json({ error: 'invalid_youtube' }, 400); it.yt = yt; }
      if (type === 'read' && (f.u || f.url)) { const u = clean(f.u || f.url, 600); if (!/^https?:\/\/.+/i.test(u)) return json({ error: 'invalid_url' }, 400); it.u = u; }
      if (f.t != null) it.t = clean(f.t, 140);
      if (f.s != null) it.s = clean(f.s, 80);
      if (f.cat) { if (!T.cats.find(c => c.id === f.cat)) return json({ error: 'bad_cat' }, 400); it.cat = f.cat; }
      return save();
    }
    if (action === 'add_cat') {
      const name = clean(body.name, 60); if (!name) return json({ error: 'missing_name' }, 400);
      T.cats.push({ id: cid(), name });
      return save();
    }
    if (action === 'rename_cat') {
      const c = T.cats.find(x => x.id === body.cat); if (!c) return json({ error: 'not_found' }, 404);
      const name = clean(body.name, 60); if (!name) return json({ error: 'missing_name' }, 400);
      c.name = name; return save();
    }
    if (action === 'move_cat') {
      const arr = T.cats; const i = arr.findIndex(x => x.id === body.cat); if (i < 0) return json({ error: 'not_found' }, 404);
      const j = body.dir === 'up' ? i - 1 : i + 1; if (j < 0 || j >= arr.length) return json(data);
      [arr[i], arr[j]] = [arr[j], arr[i]]; return save();
    }
    if (action === 'del_cat') {
      if (T.items.some(x => x.cat === body.cat)) return json({ error: 'cat_not_empty' }, 400);
      T.cats = T.cats.filter(x => x.id !== body.cat);
      return save();
    }
    return json({ error: 'bad_action' }, 400);
  } catch (e) {
    return json({ error: 'server_error', detail: String(e && e.message || e) }, 500);
  }
};
