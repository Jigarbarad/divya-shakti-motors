// Password hashing + cookie sessions (no external dependencies)
const crypto = require('crypto');
const db = require('./db');

const COOKIE = 'dsm_sid';
const DAYS = 14;
const sha = (t) => crypto.createHash('sha256').update(t).digest('hex');

function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const h = crypto.scryptSync(pw, salt, 64);
  return salt.toString('hex') + ':' + h.toString('hex');
}

function verifyPassword(pw, stored) {
  const [s, h] = String(stored).split(':');
  if (!s || !h) return false;
  const calc = crypto.scryptSync(pw, Buffer.from(s, 'hex'), 64);
  const hb = Buffer.from(h, 'hex');
  return hb.length === calc.length && crypto.timingSafeEqual(hb, calc);
}
// Used to keep login timing similar when the phone number doesn't exist
const DUMMY = hashPassword('not-a-real-password');

function cookieOf(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

function startSession(req, res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)')
    .run(sha(token), userId, Date.now() + DAYS * 864e5);
  res.cookie(COOKIE, token, {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: DAYS * 864e5,
    secure: req.secure || process.env.NODE_ENV === 'production',
  });
}

function endSession(req, res) {
  const t = cookieOf(req, COOKIE);
  if (t) db.prepare('DELETE FROM sessions WHERE token_hash=?').run(sha(t));
  res.clearCookie(COOKIE, { path: '/' });
}

function loadUser(req, res, next) {
  req.user = null;
  const t = cookieOf(req, COOKIE);
  if (t) {
    const row = db.prepare(`SELECT u.id,u.name,u.phone,u.email,u.role,s.expires_at
                            FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?`).get(sha(t));
    if (row && row.expires_at > Date.now()) {
      req.user = { id: row.id, name: row.name, phone: row.phone, email: row.email, role: row.role };
    }
  }
  next();
}

const requireAuth = (req, res, next) =>
  req.user ? next() : res.status(401).json({ error: 'Please log in.' });
const requireAdmin = (req, res, next) =>
  !req.user ? res.status(401).json({ error: 'Please log in.' })
  : req.user.role !== 'admin' ? res.status(403).json({ error: 'Admin access only.' }) : next();

setInterval(() => db.prepare('DELETE FROM sessions WHERE expires_at<?').run(Date.now()), 36e5).unref();

module.exports = { hashPassword, verifyPassword, DUMMY, startSession, endSession, loadUser, requireAuth, requireAdmin };
