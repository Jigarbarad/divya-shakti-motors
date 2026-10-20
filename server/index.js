try { process.loadEnvFile(require('path').join(__dirname, '..', '.env')); } catch (e) { /* no .env file: use the real environment */ }
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('./db');
const A = require('./auth');
const notify = require('./notify');

const PORT = process.env.PORT || 3000;
const SHOP_PHONE = '9924065266';
const UPLOADS = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(UPLOADS, { recursive: true });

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY) app.set('trust proxy', 1);

/* ---------- helpers ---------- */
const str = (v, max) => String(v ?? '').trim().slice(0, max);
const normPhone = (p) => {
  let d = String(p || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
};
const validEmail = (e) => !e || /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(e);
const bad = (res, msg, code = 400) => res.status(code).json({ error: msg });

function limiter(max, windowMs) {
  const hits = new Map();
  setInterval(() => hits.clear(), windowMs).unref();
  return (req, res, next) => {
    const k = req.ip, now = Date.now();
    const arr = (hits.get(k) || []).filter((t) => now - t < windowMs);
    if (arr.length >= max) return bad(res, 'Too many attempts. Please try again later.', 429);
    arr.push(now); hits.set(k, arr); next();
  };
}
const authLimit = limiter(10, 15 * 60e3);
const enqLimit = limiter(10, 60 * 60e3);

/* ---------- security headers ---------- */
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src https://fonts.gstatic.com; img-src 'self' data: https:; frame-src https://www.google.com; " +
      "connect-src 'self'; base-uri 'self'; form-action 'self'",
  });
  next();
});

// Every state-changing API call must carry this header; browsers can't add it cross-site without CORS.
app.use('/api', (req, res, next) => {
  if (!['GET', 'HEAD'].includes(req.method) && req.headers['x-requested-with'] !== 'dsm') return bad(res, 'Bad request.', 403);
  res.set('Cache-Control', 'no-store');
  next();
});

app.use(A.loadUser);

/* ---------- admin image upload (own, larger body parser; must come before the global one) ---------- */
app.post('/api/admin/upload', A.requireAdmin, express.json({ limit: '6mb' }), (req, res) => {
  const m = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(req.body?.data || ''));
  if (!m) return bad(res, 'Please upload a PNG, JPG or WebP image.');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 4 * 1024 * 1024) return bad(res, 'Image is too large (max 4 MB).');
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  const name = crypto.randomBytes(12).toString('hex') + '.' + ext;
  fs.writeFileSync(path.join(UPLOADS, name), buf);
  res.json({ url: '/uploads/' + name });
});

app.use(express.json({ limit: '100kb' }));

/* ---------- auth ---------- */
const publicUser = (u) => ({ id: u.id, name: u.name, phone: u.phone, email: u.email, role: u.role });

app.post('/api/auth/register', authLimit, (req, res) => {
  const name = str(req.body.name, 80), email = str(req.body.email, 120).toLowerCase();
  const phone = normPhone(req.body.phone), pw = String(req.body.password || '');
  if (name.length < 2) return bad(res, 'Please enter your name.');
  if (!phone) return bad(res, 'Please enter a valid 10-digit mobile number.');
  if (!validEmail(email)) return bad(res, 'Please enter a valid email or leave it blank.');
  if (pw.length < 8 || pw.length > 100) return bad(res, 'Password must be at least 8 characters.');
  if (db.prepare('SELECT 1 FROM users WHERE phone=?').get(phone)) return bad(res, 'This number is already registered. Please log in.', 409);
  const id = Number(db.prepare('INSERT INTO users (name,phone,email,pass) VALUES (?,?,?,?)')
    .run(name, phone, email || null, A.hashPassword(pw)).lastInsertRowid);
  // Link earlier enquiries made with this number
  db.prepare('UPDATE enquiries SET user_id=? WHERE phone=? AND user_id IS NULL').run(id, phone);
  A.startSession(req, res, id);
  res.json({ user: publicUser({ id, name, phone, email: email || null, role: 'user' }) });
});

app.post('/api/auth/login', authLimit, (req, res) => {
  const phone = normPhone(req.body.phone), pw = String(req.body.password || '');
  const u = phone && db.prepare('SELECT * FROM users WHERE phone=?').get(phone);
  const ok = A.verifyPassword(pw.slice(0, 100), u ? u.pass : A.DUMMY);
  if (!u || !ok) return bad(res, 'Incorrect mobile number or password.', 401);
  A.startSession(req, res, u.id);
  res.json({ user: publicUser(u) });
});

app.post('/api/auth/logout', (req, res) => { A.endSession(req, res); res.json({ ok: true }); });
app.get('/api/me', (req, res) => res.json({ user: req.user }));

app.patch('/api/me', A.requireAuth, (req, res) => {
  const name = str(req.body.name, 80), email = str(req.body.email, 120).toLowerCase();
  if (name.length < 2) return bad(res, 'Please enter your name.');
  if (!validEmail(email)) return bad(res, 'Please enter a valid email or leave it blank.');
  db.prepare('UPDATE users SET name=?, email=? WHERE id=?').run(name, email || null, req.user.id);
  res.json({ user: { ...req.user, name, email: email || null } });
});

app.post('/api/me/password', A.requireAuth, authLimit, (req, res) => {
  const cur = String(req.body.current || ''), next = String(req.body.next || '');
  const u = db.prepare('SELECT pass FROM users WHERE id=?').get(req.user.id);
  if (!A.verifyPassword(cur.slice(0, 100), u.pass)) return bad(res, 'Current password is incorrect.', 401);
  if (next.length < 8 || next.length > 100) return bad(res, 'New password must be at least 8 characters.');
  db.prepare('UPDATE users SET pass=? WHERE id=?').run(A.hashPassword(next), req.user.id);
  res.json({ ok: true });
});

/* ---------- public: products + enquiries ---------- */
const PUBLIC_COLS = 'id,name,category,tagline_en,tagline_gu,desc_en,desc_gu,price,engine,image,featured,specs,variants,highlights';
const jparse = (s) => { try { return s ? JSON.parse(s) : null; } catch (e) { return null; } };
const withJson = (p) => ({ ...p, specs: jparse(p.specs) || {}, variants: jparse(p.variants) || [], highlights: jparse(p.highlights) || { en: [], gu: [] } });
app.get('/api/products', (req, res) => {
  res.json(db.prepare(`SELECT ${PUBLIC_COLS} FROM products WHERE active=1 ORDER BY sort,id`).all().map(withJson));
});

const ENQ_TYPES = ['general', 'test_ride', 'price', 'finance', 'exchange', 'service', 'contact'];
app.post('/api/enquiries', enqLimit, (req, res) => {
  const b = req.body;
  if (b.website) return res.json({ ok: true }); // honeypot: bots fill this hidden field
  const name = str(b.name, 80), phone = normPhone(b.phone), message = str(b.message, 1000);
  const type = ENQ_TYPES.includes(b.type) ? b.type : null;
  if (name.length < 2) return bad(res, 'Please enter your name.');
  if (!phone) return bad(res, 'Please enter a valid 10-digit mobile number.');
  if (!type) return bad(res, 'Please choose a request type.');
  if (type === 'contact' && message.length < 3) return bad(res, 'Please write your message.');
  let productId = null;
  if (b.product_id) {
    productId = Number(b.product_id);
    if (!db.prepare('SELECT 1 FROM products WHERE id=?').get(productId)) productId = null;
  }
  const date = /^\d{4}-\d{2}-\d{2}$/.test(b.preferred_date || '') ? b.preferred_date : null;
  const id = Number(db.prepare(`INSERT INTO enquiries (user_id,name,phone,type,product_id,preferred_date,message)
                                VALUES (?,?,?,?,?,?,?)`)
    .run(req.user ? req.user.id : null, name, phone, type, productId, date, message || null).lastInsertRowid);
  notify.sendEnquiryEmail({ name, phone, type, message, preferred_date: date,
    bike: productId ? db.prepare('SELECT name FROM products WHERE id=?').get(productId).name : '' });
  res.json({ ok: true, id });
});

/* ---------- customer dashboard ---------- */
app.get('/api/my/enquiries', A.requireAuth, (req, res) => {
  res.json(db.prepare(`SELECT e.id,e.type,e.status,e.message,e.preferred_date,e.created_at,e.product_id,p.name AS product_name
                       FROM enquiries e LEFT JOIN products p ON p.id=e.product_id
                       WHERE e.user_id=? ORDER BY e.id DESC LIMIT 200`).all(req.user.id));
});
app.post('/api/my/enquiries/:id/cancel', A.requireAuth, (req, res) => {
  const r = db.prepare(`UPDATE enquiries SET status='cancelled', updated_at=datetime('now')
                        WHERE id=? AND user_id=? AND status='new'`).run(Number(req.params.id), req.user.id);
  if (!r.changes) return bad(res, 'This request can no longer be cancelled.', 409);
  res.json({ ok: true });
});
app.get('/api/my/wishlist', A.requireAuth, (req, res) => {
  res.json(db.prepare('SELECT product_id FROM wishlist WHERE user_id=?').all(req.user.id).map((r) => r.product_id));
});
app.post('/api/my/wishlist/:pid', A.requireAuth, (req, res) => {
  const pid = Number(req.params.pid);
  if (!db.prepare('SELECT 1 FROM products WHERE id=? AND active=1').get(pid)) return bad(res, 'Bike not found.', 404);
  db.prepare('INSERT OR IGNORE INTO wishlist (user_id,product_id) VALUES (?,?)').run(req.user.id, pid);
  res.json({ ok: true });
});
app.delete('/api/my/wishlist/:pid', A.requireAuth, (req, res) => {
  db.prepare('DELETE FROM wishlist WHERE user_id=? AND product_id=?').run(req.user.id, Number(req.params.pid));
  res.json({ ok: true });
});

/* ---------- admin ---------- */
const admin = express.Router();
admin.use(A.requireAdmin);

admin.get('/stats', (req, res) => {
  const n = (sql) => db.prepare(sql).get().n;
  const ist = "date(created_at,'+5 hours','+30 minutes')=date('now','+5 hours','+30 minutes')";
  res.json({
    products: n('SELECT COUNT(*) n FROM products'),
    activeProducts: n('SELECT COUNT(*) n FROM products WHERE active=1'),
    customers: n("SELECT COUNT(*) n FROM users WHERE role='user'"),
    enquiries: n('SELECT COUNT(*) n FROM enquiries'),
    newEnquiries: n("SELECT COUNT(*) n FROM enquiries WHERE status='new'"),
    today: n(`SELECT COUNT(*) n FROM enquiries WHERE ${ist}`),
    testRides: n("SELECT COUNT(*) n FROM enquiries WHERE type='test_ride' AND status IN ('new','contacted')"),
    recent: db.prepare(`SELECT e.id,e.name,e.phone,e.type,e.status,e.created_at,p.name AS product_name
                        FROM enquiries e LEFT JOIN products p ON p.id=e.product_id ORDER BY e.id DESC LIMIT 8`).all(),
  });
});

// products
const SPEC_KEYS = ['engine', 'power', 'torque', 'mileage', 'tank', 'weight', 'gearbox', 'brakes', 'suspension', 'tyres', 'dimensions', 'wheelbase', 'seat', 'clearance'];
const imgOk = (s) => !s || /^\/uploads\/[a-f0-9]+\.(png|jpg|webp)$/.test(s) || /^https:\/\/[^\s"'<>]+$/.test(s);
function cleanProduct(b) {
  const name = str(b.name, 100);
  if (name.length < 2) return { error: 'Please enter the bike name.' };
  const category = ['motorcycle', 'scooter'].includes(b.category) ? b.category : 'motorcycle';
  let price = null;
  if (b.price !== '' && b.price != null) {
    price = Math.round(Number(b.price));
    if (!Number.isFinite(price) || price < 0 || price > 10000000) return { error: 'Please enter a valid price.' };
  }
  const image = str(b.image, 300);
  if (!imgOk(image)) return { error: 'Invalid image.' };
  const specs = {};
  for (const k of SPEC_KEYS) { const v = str(b.specs && b.specs[k], 120); if (v) specs[k] = v; }
  const variants = [];
  for (const x of Array.isArray(b.variants) ? b.variants.slice(0, 40) : []) {
    const vn = str(x && x.name, 90), vp = Math.round(Number(x && x.price));
    if (vn && Number.isFinite(vp) && vp >= 0 && vp <= 10000000) variants.push({ name: vn, price: vp });
  }
  const hl = {};
  for (const l of ['en', 'gu']) hl[l] = (Array.isArray(b.highlights && b.highlights[l]) ? b.highlights[l] : []).map((x) => str(x, 140)).filter(Boolean).slice(0, 8);
  for (const l of ['en', 'gu']) { const x = str(b.highlights && b.highlights.best && b.highlights.best[l], 120); if (x) (hl.best = hl.best || {})[l] = x; }
  return { v: [name, category, str(b.tagline_en, 120), str(b.tagline_gu, 120), str(b.desc_en, 1000), str(b.desc_gu, 1000),
               price, str(b.engine, 60), image || null, b.featured ? 1 : 0, b.active === false || b.active === 0 ? 0 : 1,
               Number.isFinite(Number(b.sort)) ? Math.round(Number(b.sort)) : 0,
               Object.keys(specs).length ? JSON.stringify(specs) : null, variants.length ? JSON.stringify(variants) : null,
               hl.en.length || hl.gu.length || hl.best ? JSON.stringify(hl) : null] };
}
const PCOLS = 'name=?,category=?,tagline_en=?,tagline_gu=?,desc_en=?,desc_gu=?,price=?,engine=?,image=?,featured=?,active=?,sort=?,specs=?,variants=?,highlights=?';
admin.get('/products', (req, res) => res.json(db.prepare('SELECT * FROM products ORDER BY sort,id').all().map(withJson)));
admin.post('/products', (req, res) => {
  const c = cleanProduct(req.body); if (c.error) return bad(res, c.error);
  const id = Number(db.prepare(`INSERT INTO products (name,category,tagline_en,tagline_gu,desc_en,desc_gu,price,engine,image,featured,active,sort,specs,variants,highlights)
                                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(...c.v).lastInsertRowid);
  res.json({ id });
});
admin.put('/products/:id', (req, res) => {
  const c = cleanProduct(req.body); if (c.error) return bad(res, c.error);
  const r = db.prepare(`UPDATE products SET ${PCOLS} WHERE id=?`).run(...c.v, Number(req.params.id));
  r.changes ? res.json({ ok: true }) : bad(res, 'Not found.', 404);
});
admin.delete('/products/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id=?').run(Number(req.params.id));
  res.json({ ok: true });
});

// enquiries
const STATUSES = ['new', 'contacted', 'done', 'cancelled'];
admin.get('/enquiries', (req, res) => {
  const w = [], p = [];
  if (STATUSES.includes(req.query.status)) { w.push('e.status=?'); p.push(req.query.status); }
  if (ENQ_TYPES.includes(req.query.type)) { w.push('e.type=?'); p.push(req.query.type); }
  const q = str(req.query.q, 60);
  if (q) { w.push("(e.name LIKE ? ESCAPE '\\' OR e.phone LIKE ? ESCAPE '\\' OR e.message LIKE ? ESCAPE '\\')");
           const like = '%' + q.replace(/[\\%_]/g, '\\$&') + '%'; p.push(like, like, like); }
  res.json(db.prepare(`SELECT e.*, p.name AS product_name, (e.user_id IS NOT NULL) AS registered
                       FROM enquiries e LEFT JOIN products p ON p.id=e.product_id
                       ${w.length ? 'WHERE ' + w.join(' AND ') : ''} ORDER BY e.id DESC LIMIT 500`).all(...p));
});
admin.patch('/enquiries/:id', (req, res) => {
  const cur = db.prepare('SELECT status,admin_note FROM enquiries WHERE id=?').get(Number(req.params.id));
  if (!cur) return bad(res, 'Not found.', 404);
  const status = STATUSES.includes(req.body.status) ? req.body.status : cur.status;
  const note = req.body.admin_note === undefined ? cur.admin_note : str(req.body.admin_note, 1000);
  db.prepare("UPDATE enquiries SET status=?, admin_note=?, updated_at=datetime('now') WHERE id=?").run(status, note, Number(req.params.id));
  res.json({ ok: true });
});
admin.delete('/enquiries/:id', (req, res) => {
  db.prepare('DELETE FROM enquiries WHERE id=?').run(Number(req.params.id));
  res.json({ ok: true });
});

// customers
admin.get('/users', (req, res) => {
  res.json(db.prepare(`SELECT u.id,u.name,u.phone,u.email,u.role,u.created_at,
                       (SELECT COUNT(*) FROM enquiries e WHERE e.user_id=u.id) AS enquiries
                       FROM users u ORDER BY u.id DESC LIMIT 500`).all());
});
admin.delete('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return bad(res, "You can't delete your own account.");
  db.prepare('DELETE FROM users WHERE id=?').run(id);
  res.json({ ok: true });
});
app.use('/api/admin', admin);

app.use('/api', (req, res) => bad(res, 'Not found.', 404));

/* ---------- static site ---------- */
app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'], index: 'index.html' }));

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return bad(res, 'Bad request.');
  if (err.type === 'entity.too.large') return bad(res, 'Request is too large.', 413);
  console.error(err);
  bad(res, 'Something went wrong. Please try again.', 500);
});

/* ---------- first-run admin account ---------- */
function ensureAdmin() {
  if (db.prepare("SELECT 1 FROM users WHERE role='admin'").get()) return;
  const phone = normPhone(process.env.ADMIN_PHONE) || SHOP_PHONE;
  const given = process.env.ADMIN_PASSWORD;
  const pw = given || crypto.randomBytes(9).toString('base64url');
  const existing = db.prepare('SELECT id FROM users WHERE phone=?').get(phone);
  if (existing) db.prepare("UPDATE users SET role='admin', pass=? WHERE id=?").run(A.hashPassword(pw), existing.id);
  else db.prepare("INSERT INTO users (name,phone,pass,role) VALUES ('Divya Shakti Motors',?,?,'admin')").run(phone, A.hashPassword(pw));
  console.log('\n==============================================');
  console.log(' Admin account created');
  console.log('   Login (mobile): ' + phone);
  console.log('   Password:       ' + pw + (given ? '' : '   <- shown only once, change it in Admin > Account'));
  console.log('==============================================\n');
}
ensureAdmin();

app.listen(PORT, () => {
  console.log(`Divya Shakti Motors running at http://localhost:${PORT}`);
  console.log(notify.configured() ? `Enquiry emails: on (to ${process.env.NOTIFY_TO})` : 'Enquiry emails: off (set NOTIFY_TO, SMTP_USER, SMTP_PASS in .env to turn on)');
});
