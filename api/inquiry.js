// Receives the /contact and /donate forms and stores them in the Foundation's
// inquiries table (Supabase, insert-only for the public key; no public read).
// Works with plain HTML form posts (redirects to /thanks) and fetch (JSON).
const SUPABASE_URL = process.env.INQUIRY_DB_URL || 'https://oczhijrgbzjtrykpsalf.supabase.co';
// Publishable (public) key: can only INSERT into foundation_site_inquiries per RLS.
const SUPABASE_KEY = process.env.INQUIRY_DB_PUBLIC_KEY || 'sb_publishable_IkCMiw7s0zFfPc1eKuRgwA_u0zxhCI5';
const TABLE = 'foundation_site_inquiries';

const clean = (v, max) => {
  if (v === undefined || v === null) return null;
  const s = String(Array.isArray(v) ? v[0] : v).replace(/\u0000/g, '').trim();
  return s ? s.slice(0, max) : null;
};

function parseBody(req) {
  const b = req.body;
  if (!b) return {};
  if (typeof b === 'string') {
    try { return JSON.parse(b); } catch (_) { return Object.fromEntries(new URLSearchParams(b)); }
  }
  if (Buffer.isBuffer(b)) return Object.fromEntries(new URLSearchParams(b.toString('utf8')));
  return b;
}

module.exports = async (req, res) => {
  const wantsJson = /application\/json/.test(req.headers['accept'] || '');
  const fail = (code, msg, back) => {
    if (wantsJson) return res.status(code).json({ ok: false, error: msg });
    res.status(code).setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>BRSA Foundation</title><body style="font-family:system-ui;background:#04060c;color:#eef1f6;padding:40px;line-height:1.6"><h1>We could not send that</h1><p>' + msg + '</p><p><a style="color:#ffe6a3" href="' + (back || '/contact') + '">Go back</a> or call (505) 750-9202 / email info@brsafoundation.org.</p></body>');
  };

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return fail(405, 'This address only accepts form submissions.');
  }

  const b = parseBody(req);
  const form = clean(b.form, 20) === 'donate' ? 'donate' : 'contact';
  const back = '/' + form;

  // Honeypot: bots fill hidden fields. Pretend success, store nothing.
  if (clean(b.website, 200)) {
    if (wantsJson) return res.status(200).json({ ok: true });
    res.statusCode = 303; res.setHeader('Location', '/thanks'); return res.end();
  }

  const row = {
    form,
    name: clean(b.name, 120),
    email: clean(b.email, 200),
    phone: clean(b.phone, 40),
    organization: clean(b.organization, 160),
    topic: clean(b.topic, 80),
    pledge_amount: clean(b.pledge_amount, 40),
    message: clean(b.message, 5000) || '',
    page: clean(b.page, 200) || back,
  };

  if (!row.name) return fail(400, 'Please enter your name.', back);
  if (!row.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) return fail(400, 'Please enter a valid email address.', back);
  if (form === 'contact' && !row.message) return fail(400, 'Please enter a message.', back);

  try {
    const r = await fetch(SUPABASE_URL + '/rest/v1/' + TABLE, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(row),
    });
    if (!r.ok) {
      console.error('inquiry insert failed', r.status, await r.text().catch(() => ''));
      return fail(502, 'Our form is having trouble right now.', back);
    }
  } catch (e) {
    console.error('inquiry insert error', e && e.message);
    return fail(502, 'Our form is having trouble right now.', back);
  }

  if (wantsJson) return res.status(200).json({ ok: true });
  res.statusCode = 303;
  res.setHeader('Location', '/thanks?form=' + form);
  return res.end();
};
