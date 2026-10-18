// SQLite database (Node's built-in node:sqlite, no native modules needed)
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const dir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(dir, { recursive: true });
const db = new DatabaseSync(path.join(dir, 'dsm.db'));

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL UNIQUE,
  email      TEXT,
  pass       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'motorcycle',
  tagline_en TEXT, tagline_gu TEXT,
  desc_en    TEXT, desc_gu    TEXT,
  price      INTEGER,
  engine     TEXT,
  image      TEXT,
  featured   INTEGER NOT NULL DEFAULT 0,
  active     INTEGER NOT NULL DEFAULT 1,
  sort       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS enquiries (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  type           TEXT NOT NULL,
  product_id     INTEGER REFERENCES products(id) ON DELETE SET NULL,
  preferred_date TEXT,
  message        TEXT,
  status         TEXT NOT NULL DEFAULT 'new',
  admin_note     TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_enq_status ON enquiries(status, created_at);
CREATE INDEX IF NOT EXISTS idx_enq_user ON enquiries(user_id);

CREATE TABLE IF NOT EXISTS wishlist (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, product_id)
);
`);

// Extra product detail columns (added after the first release, so migrate older databases too)
const pcols = db.prepare('PRAGMA table_info(products)').all().map((c) => c.name);
if (!pcols.includes('specs')) db.exec('ALTER TABLE products ADD COLUMN specs TEXT');
if (!pcols.includes('variants')) db.exec('ALTER TABLE products ADD COLUMN variants TEXT');
if (!pcols.includes('highlights')) db.exec('ALTER TABLE products ADD COLUMN highlights TEXT');

// Seed the Hero range on first run. Price/engine are left empty for the owner to fill in from the admin panel.
if (db.prepare('SELECT COUNT(*) n FROM products').get().n === 0) {
  const seed = [
    ['Hero Splendor+', 'motorcycle', 'Most popular commuter · Great mileage', 'સૌથી લોકપ્રિય કમ્યુટર · શાનદાર માઇલેજ',
      'A hugely popular everyday commuter. Easy to ride and easy to maintain. Ask us about current colours, variants and offers.',
      'રોજિંદા ઉપયોગ માટેની ખૂબ જ લોકપ્રિય કમ્યુટર બાઇક. ચલાવવામાં અને જાળવવામાં સરળ. હાલના રંગ, વેરિયન્ટ અને ઑફર વિશે અમને પૂછો.', 1],
    ['Hero Passion Pro', 'motorcycle', 'Stylish commuter · Smooth ride', 'સ્ટાઇલિશ કમ્યુટર · સ્મૂથ રાઇડ',
      'A stylish commuter built for a comfortable daily ride. Visit the showroom for a test ride.',
      'આરામદાયક રોજિંદી સવારી માટેની સ્ટાઇલિશ કમ્યુટર બાઇક. ટેસ્ટ રાઇડ માટે શોરૂમની મુલાકાત લો.', 1],
    ['Hero HF Deluxe', 'motorcycle', 'Budget-friendly · Reliable', 'બજેટ-ફ્રેન્ડલી · ભરોસાપાત્ર',
      'A dependable, budget-friendly motorcycle for everyday use. Ask us for finance and exchange options.',
      'રોજિંદા ઉપયોગ માટેની ભરોસાપાત્ર અને બજેટ-ફ્રેન્ડલી બાઇક. ફાઇનાન્સ અને એક્સચેન્જના વિકલ્પો વિશે અમને પૂછો.', 1],
    ['Hero Xtreme', 'motorcycle', 'Sporty · Performance', 'સ્પોર્ટી · દમદાર પરફોર્મન્સ',
      'A sporty Hero motorcycle for riders who want more performance and attitude. Book a test ride to feel the difference.',
      'વધુ પરફોર્મન્સ અને સ્ટાઇલ ઇચ્છતા રાઇડર્સ માટેની સ્પોર્ટી હીરો બાઇક. ફરક અનુભવવા ટેસ્ટ રાઇડ બુક કરો.', 1],
    ['Hero Destini 125', 'scooter', 'Scooter · Comfortable & stylish', 'સ્કૂટર · આરામદાયક અને સ્ટાઇલિશ',
      'A comfortable and stylish 125cc-class scooter for the whole family.',
      'આખા પરિવાર માટે આરામદાયક અને સ્ટાઇલિશ 125cc સ્કૂટર.', 0],
    ['Hero Maestro Edge', 'scooter', 'Scooter · Smart & sporty', 'સ્કૂટર · સ્માર્ટ અને સ્પોર્ટી',
      'A smart, sporty scooter with a modern look. Ask us for colours and current offers.',
      'આધુનિક લુક સાથેનું સ્માર્ટ અને સ્પોર્ટી સ્કૂટર. રંગ અને હાલની ઑફર વિશે અમને પૂછો.', 0],
    ['Hero Pleasure+', 'scooter', 'Scooter · Light & easy to ride', 'સ્કૂટર · હલકું અને ચલાવવામાં સરળ',
      'A light, easy-to-ride scooter that is a great fit for everyone at home.',
      'હલકું અને ચલાવવામાં સરળ સ્કૂટર, ઘરના દરેક સભ્ય માટે યોગ્ય.', 0],
  ];
  const ins = db.prepare(`INSERT INTO products (name,category,tagline_en,tagline_gu,desc_en,desc_gu,featured,sort)
                          VALUES (?,?,?,?,?,?,?,?)`);
  seed.forEach((s, i) => ins.run(s[0], s[1], s[2], s[3], s[4], s[5], s[6], i + 1));
}

// One-time addition of the rest of Hero's petrol range (runs once; deleting a bike later keeps it deleted).
db.exec('CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)');
if (!db.prepare("SELECT 1 FROM meta WHERE key='lineup_v2'").get()) {
  const more = [
    ['Hero HF 100', 'motorcycle', 'Entry-level commuter · Easy on the pocket', 'એન્ટ્રી-લેવલ કમ્યુટર · ખિસ્સાને પરવડે એવી'],
    ['Hero Splendor+ Xtec', 'motorcycle', 'Splendor+ with extra tech features', 'વધારાના ટેક ફીચર્સ સાથે Splendor+'],
    ['Hero Super Splendor Xtec', 'motorcycle', 'Bigger Splendor · Tech features', 'મોટી Splendor · ટેક ફીચર્સ'],
    ['Hero Glamour', 'motorcycle', 'Stylish 125cc commuter', 'સ્ટાઇલિશ 125cc કમ્યુટર'],
    ['Hero Glamour X', 'motorcycle', 'Stylish 125cc · Modern features', 'સ્ટાઇલિશ 125cc · આધુનિક ફીચર્સ'],
    ['Hero Glamour Xtec', 'motorcycle', '125cc · Tech features', '125cc · ટેક ફીચર્સ'],
    ['Hero Xtreme 125R', 'motorcycle', 'Sporty 125cc · Young & fast', 'સ્પોર્ટી 125cc · યુવા અને ઝડપી'],
    ['Hero Xtreme 160R 4V', 'motorcycle', 'Sporty 160cc · Performance', 'સ્પોર્ટી 160cc · દમદાર પરફોર્મન્સ'],
    ['Hero Xpulse 200 4V', 'motorcycle', 'Adventure · Go anywhere', 'એડવેન્ચર · ક્યાંય પણ જાઓ'],
    ['Hero Xpulse 210', 'motorcycle', 'Adventure · Built for the trail', 'એડવેન્ચર · કઠિન રસ્તા માટે બનેલી'],
    ['Hero Destini 110', 'scooter', 'Scooter · Easy city ride', 'સ્કૂટર · શહેરમાં સરળ સવારી'],
    ['Hero Destini Prime', 'scooter', 'Scooter · Comfortable & premium look', 'સ્કૂટર · આરામદાયક અને પ્રીમિયમ લુક'],
    ['Hero Xoom 110', 'scooter', 'Scooter · Sporty & youthful', 'સ્કૂટર · સ્પોર્ટી અને યુવા'],
    ['Hero Xoom 125', 'scooter', 'Scooter · Sporty 125cc', 'સ્કૂટર · સ્પોર્ટી 125cc'],
    ['Hero Xoom 160', 'scooter', 'Scooter · Premium & sporty', 'સ્કૂટર · પ્રીમિયમ અને સ્પોર્ટી'],
  ];
  const has = db.prepare('SELECT 1 FROM products WHERE lower(name)=lower(?)');
  const ins = db.prepare(`INSERT INTO products (name,category,tagline_en,tagline_gu,desc_en,desc_gu,featured,sort)
                          VALUES (?,?,?,?,?,?,0,?)`);
  let sort = db.prepare('SELECT COALESCE(MAX(sort),0) m FROM products').get().m;
  for (const [name, cat, en, gu] of more) {
    if (has.get(name)) continue;
    ins.run(name, cat, en, gu,
      `${name} from Hero MotoCorp. Ask us about colours, variants, price, offers and availability, or book a test ride.`,
      `Hero MotoCorp ની ${name}. રંગ, વેરિયન્ટ, કિંમત, ઑફર અને ઉપલબ્ધતા વિશે અમને પૂછો, અથવા ટેસ્ટ રાઇડ બુક કરો.`, ++sort);
  }
  db.prepare("INSERT INTO meta (key,value) VALUES ('lineup_v2','1')").run();
}

// One-time fill of researched specs + price-list variants (only for bikes that have none; later admin edits are never overwritten)
if (!db.prepare("SELECT 1 FROM meta WHERE key='specs_v1'").get()) {
  const { SPECS, VARIANTS } = require('./lineup');
  const upS = db.prepare('UPDATE products SET specs=? WHERE name=? AND specs IS NULL');
  const upV = db.prepare('UPDATE products SET variants=? WHERE name=? AND variants IS NULL');
  const upP = db.prepare('UPDATE products SET price=? WHERE name=? AND price IS NULL');
  for (const [name, spec] of Object.entries(SPECS)) upS.run(JSON.stringify(spec), name);
  for (const [name, list] of Object.entries(VARIANTS)) {
    upV.run(JSON.stringify(list), name);
    upP.run(Math.min(...list.map((v) => v.price)), name);
  }
  db.prepare("INSERT INTO meta (key,value) VALUES ('specs_v1','1')").run();
}

// One-time fill of the product copy (label, description, selling points). Replaces the first-draft text; later admin edits are never overwritten.
if (!db.prepare("SELECT 1 FROM meta WHERE key='copy_v1'").get()) {
  const { COPY } = require('./copy');
  const up = db.prepare('UPDATE products SET tagline_en=?, tagline_gu=?, desc_en=?, desc_gu=?, highlights=? WHERE name=?');
  for (const [name, c] of Object.entries(COPY)) up.run(c.tag[0], c.tag[1], c.desc[0], c.desc[1], JSON.stringify({ en: c.pts[0], gu: c.pts[1] }), name);
  db.prepare("INSERT INTO meta (key,value) VALUES ('copy_v1','1')").run();
}

module.exports = db;

// One-time fill of extra specs and the "best for" line. Existing spec values are kept; later admin edits are never overwritten.
if (!db.prepare("SELECT 1 FROM meta WHERE key='extra_v1'").get()) {
  const { EXTRA } = require('./extra');
  const get = db.prepare('SELECT id, specs, highlights FROM products WHERE name=?'), up = db.prepare('UPDATE products SET specs=?, highlights=? WHERE id=?');
  for (const [name, e] of Object.entries(EXTRA)) {
    const row = get.get(name); if (!row) continue;
    const { best, ...more } = e;
    const specs = { ...more, ...(row.specs ? JSON.parse(row.specs) : {}) };
    const hl = row.highlights ? JSON.parse(row.highlights) : { en: [], gu: [] };
    if (best) hl.best = { en: best[0], gu: best[1] };
    up.run(JSON.stringify(specs), JSON.stringify(hl), row.id);
  }
  db.prepare("INSERT INTO meta (key,value) VALUES ('extra_v1','1')").run();
}
