/* Shared code for every page: language, header/footer, API helper, product cards, enquiry form */
(function () {
  const SHOP = {
    phone: '919924065266', phoneDisplay: '+91 99240 65266',
    dir: 'https://www.google.com/maps/dir/?api=1&destination=Divya+Shakti+Motors+Sutrapada+Gujarat',
    reviews: 'https://www.google.com/maps/search/?api=1&query=Divya+Shakti+Motors+Sutrapada',
  };
  const dict = { en: {}, gu: {} };
  let lang = 'en';
  try { const s = localStorage.getItem('dsm_lang'); if (s === 'gu' || s === 'en') lang = s; } catch (e) {}
  const langListeners = [];

  const App = { SHOP, user: null, products: null, wish: new Set() };
  App.$ = (s, r = document) => r.querySelector(s);
  App.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  App.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  App.lang = () => lang;
  App.add = (d) => { for (const l of ['en', 'gu']) Object.assign(dict[l], d[l] || {}); };
  App.t = (k) => dict[lang][k] ?? dict.en[k] ?? k;
  App.onLang = (fn) => langListeners.push(fn);

  App.api = async (path, opt = {}) => {
    const o = { method: opt.method || 'GET', credentials: 'same-origin', headers: { 'X-Requested-With': 'dsm' } };
    if (opt.body !== undefined) { o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(opt.body); }
    let r;
    try { r = await fetch('/api' + path, o); } catch (e) { throw new Error(App.t('err_net')); }
    let j = null; try { j = await r.json(); } catch (e) {}
    if (!r.ok) { const e = new Error((j && j.error) || App.t('err_generic')); e.status = r.status; throw e; }
    return j;
  };

  App.toast = (msg, bad) => {
    const el = document.createElement('div');
    el.className = 'toast' + (bad ? ' bad' : ''); el.textContent = msg;
    document.body.appendChild(el); setTimeout(() => el.remove(), 3200);
  };

  App.modal = (html) => {
    const bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><button class="x" aria-label="Close">×</button>${html}</div>`;
    const close = () => { bg.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    bg.addEventListener('mousedown', (e) => { if (e.target === bg) close(); });
    App.$('.x', bg).addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(bg);
    App.applyI18n(bg);
    return { el: App.$('.modal', bg), close };
  };

  App.fmtDate = (s) => { // DB times are UTC
    if (!s) return '';
    const d = new Date(String(s).replace(' ', 'T') + 'Z');
    return d.toLocaleString(lang === 'gu' ? 'gu-IN' : 'en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };
  App.price = (p) => p.price ? '₹ ' + Number(p.price).toLocaleString('en-IN') : App.t('contact_price');
  App.pill = (s) => `<span class="pill p-${s}">${App.t('st_' + s)}</span>`;

  App.applyI18n = (root = document) => {
    App.$$('[data-i18n]', root).forEach((el) => { el.innerHTML = App.t(el.dataset.i18n); });
    App.$$('[data-i18n-ph]', root).forEach((el) => { el.placeholder = App.t(el.dataset.i18nPh); });
  };

  /* ---------- shared strings ---------- */
  App.add({
    en: {
      nav_home: 'Home', nav_bikes: 'Bikes', nav_services: 'Services', nav_about: 'About', nav_contact: 'Contact',
      login: 'Login', account: 'My Account', admin: 'Admin', call: 'Call', directions: 'Directions', get_directions: 'Get Directions',
      foot_addr: 'Highway, Veraval-Kodinar Rd, opp. Mamladar Office, Sutrapada, Gujarat 362275',
      foot_hours: 'Mon-Sat 8 am-8 pm · Sunday closed', m_call: '📞 Call',
      explore: 'Explore', compare: 'Compare', cmp_max: 'You can compare up to 3 bikes.', cmp_go: 'Compare', cmp_need: 'Pick 2 or more', cmp_clear: 'Clear',
      back_all: '← All bikes', specs_h: 'Specifications', variants_h: 'Available variants', no_specs: 'Specifications coming soon.',
      spec_note: 'Specifications are manufacturer-claimed figures and can vary by variant. Please confirm details and the final price at the showroom.',
      enq_bike: 'Enquire about this bike', th_variant: 'Variant', th_price: 'Price', not_found: 'Bike not found.', variants_n: 'Variants',
      sp_engine: 'Engine', sp_power: 'Max power', sp_torque: 'Max torque', sp_mileage: 'Mileage (claimed)', sp_tank: 'Fuel tank', sp_weight: 'Kerb weight', sp_gearbox: 'Gearbox', sp_brakes: 'Brakes', sp_suspension: 'Suspension', sp_tyres: 'Tyres', sp_dimensions: 'Dimensions (L × W × H)', sp_wheelbase: 'Wheelbase', sp_seat: 'Seat height', sp_clearance: 'Ground clearance', best_for: 'Best for',
      onwards: 'onwards', exshow: 'Ex-showroom', contact_price: 'Ask manager for price', soon: 'Photo coming soon', view_enquire: 'View / Enquire',
      motorcycle: 'Motorcycle', scooter: 'Scooter',
      err_net: 'Network problem. Please check your connection.', err_generic: 'Something went wrong. Please try again.',
      f_name: 'Your name', f_phone: 'Mobile number', f_msg: 'Message', f_msg_opt: 'Anything else? (optional)', f_date: 'Preferred date (optional)',
      f_type: 'What do you need?', ph_bike: 'Bike you are interested in (optional)', f_send: 'Send Request', sending: 'Sending…',
      ty_general: 'General enquiry', ty_test_ride: 'Book a test ride', ty_price: 'Get price / offers', ty_finance: 'Finance / EMI details',
      ty_exchange: 'Exchange my old bike', ty_service: 'Service booking', ty_contact: 'Message',
      ok_title: "Thank you! We've received your request.", ok_sub: "We'll call you shortly. You can also message us on WhatsApp.",
      ok_track: 'Track it in My Account', ok_wa: 'Message on WhatsApp', ok_another: 'Send another',
      st_new: 'New', st_contacted: 'Contacted', st_done: 'Completed', st_cancelled: 'Cancelled',
      days: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday', hrs: '8 am – 8 pm', closed_day: 'Closed',
      open_now: '● Open now · closes 8 pm', closed_now: '● Closed now · opens 8 am Mon-Sat',
    },
    gu: {
      nav_home: 'હોમ', nav_bikes: 'બાઇક્સ', nav_services: 'સર્વિસ', nav_about: 'અમારા વિશે', nav_contact: 'સંપર્ક',
      login: 'લૉગિન', account: 'મારું એકાઉન્ટ', admin: 'એડમિન', call: 'કૉલ', directions: 'દિશા', get_directions: 'દિશા મેળવો',
      foot_addr: 'હાઇવે, વેરાવળ-કોડીનાર રોડ, મામલતદાર કચેરીની સામે, સુત્રાપાડા, ગુજરાત 362275',
      foot_hours: 'સોમ-શનિ સવારે 8 – રાત્રે 8 · રવિવાર બંધ', m_call: '📞 કૉલ',
      explore: 'વિગતો જુઓ', compare: 'સરખામણી', cmp_max: 'તમે વધુમાં વધુ 3 બાઇકની સરખામણી કરી શકો છો.', cmp_go: 'સરખામણી કરો', cmp_need: '2 કે વધુ પસંદ કરો', cmp_clear: 'સાફ કરો',
      back_all: '← બધી બાઇક્સ', specs_h: 'સ્પેસિફિકેશન', variants_h: 'ઉપલબ્ધ વેરિયન્ટ', no_specs: 'સ્પેસિફિકેશન ટૂંક સમયમાં.',
      spec_note: 'સ્પેસિફિકેશન કંપનીના દાવા મુજબ છે અને વેરિયન્ટ પ્રમાણે બદલાઈ શકે છે. વિગતો અને અંતિમ કિંમત શોરૂમમાં ચકાસી લો.',
      enq_bike: 'આ બાઇક વિશે પૂછપરછ', th_variant: 'વેરિયન્ટ', th_price: 'કિંમત', not_found: 'બાઇક મળી નથી.', variants_n: 'વેરિયન્ટ',
      sp_engine: 'એન્જિન', sp_power: 'મહત્તમ પાવર', sp_torque: 'મહત્તમ ટોર્ક', sp_mileage: 'માઇલેજ (કંપનીના દાવા મુજબ)', sp_tank: 'ફ્યુઅલ ટાંકી', sp_weight: 'કર્બ વજન', sp_gearbox: 'ગિયરબોક્સ', sp_brakes: 'બ્રેક્સ', sp_suspension: 'સસ્પેન્શન', sp_tyres: 'ટાયર', sp_dimensions: 'માપ (લંબાઈ × પહોળાઈ × ઊંચાઈ)', sp_wheelbase: 'વ્હીલબેઝ', sp_seat: 'સીટની ઊંચાઈ', sp_clearance: 'ગ્રાઉન્ડ ક્લિયરન્સ', best_for: 'આ માટે શ્રેષ્ઠ',
      onwards: 'થી શરૂ', exshow: 'એક્સ-શોરૂમ', contact_price: 'કિંમત માટે મેનેજરને પૂછો', soon: 'ફોટો ટૂંક સમયમાં', view_enquire: 'જુઓ / પૂછપરછ',
      motorcycle: 'બાઇક', scooter: 'સ્કૂટર',
      err_net: 'નેટવર્કમાં સમસ્યા છે. કૃપા કરીને તમારું કનેક્શન તપાસો.', err_generic: 'કંઈક ખોટું થયું. કૃપા કરીને ફરી પ્રયાસ કરો.',
      f_name: 'તમારું નામ', f_phone: 'મોબાઇલ નંબર', f_msg: 'સંદેશ', f_msg_opt: 'બીજું કંઈ? (વૈકલ્પિક)', f_date: 'પસંદગીની તારીખ (વૈકલ્પિક)',
      f_type: 'તમને શું જોઈએ છે?', ph_bike: 'તમને કઈ બાઇકમાં રસ છે (વૈકલ્પિક)', f_send: 'વિનંતી મોકલો', sending: 'મોકલી રહ્યા છીએ…',
      ty_general: 'સામાન્ય પૂછપરછ', ty_test_ride: 'ટેસ્ટ રાઇડ બુક કરો', ty_price: 'કિંમત / ઑફર જાણો', ty_finance: 'ફાઇનાન્સ / EMI વિગત',
      ty_exchange: 'મારી જૂની બાઇક એક્સચેન્જ કરો', ty_service: 'સર્વિસ બુકિંગ', ty_contact: 'સંદેશ',
      ok_title: 'આભાર! અમને તમારી વિનંતી મળી ગઈ છે.', ok_sub: 'અમે ટૂંક સમયમાં તમને કૉલ કરીશું. તમે વોટ્સએપ પર પણ સંદેશ કરી શકો છો.',
      ok_track: 'મારા એકાઉન્ટમાં જુઓ', ok_wa: 'વોટ્સએપ પર સંદેશ કરો', ok_another: 'બીજી વિનંતી મોકલો',
      st_new: 'નવી', st_contacted: 'સંપર્ક થયો', st_done: 'પૂર્ણ', st_cancelled: 'રદ',
      days: 'રવિવાર,સોમવાર,મંગળવાર,બુધવાર,ગુરુવાર,શુક્રવાર,શનિવાર', hrs: 'સવારે 8 – રાત્રે 8', closed_day: 'બંધ',
      open_now: '● હમણાં ખુલ્લું · રાત્રે 8 વાગ્યે બંધ', closed_now: '● હમણાં બંધ · સોમ-શનિ સવારે 8 વાગ્યે ખુલશે',
    },
  });

  /* ---------- header / footer / mobile bar ---------- */
  let activePage = '';
  function chrome() {
    const t = App.t, u = App.user;
    const PERSON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z"/></svg>';
    const acct = u
      ? `<a class="btn btn-red acct" href="${u.role === 'admin' ? '/admin.html' : '/dashboard.html'}" aria-label="${u.role === 'admin' ? t('admin') : t('account')}">${PERSON}<span>${u.role === 'admin' ? t('admin') : t('account')}</span></a>`
      : `<a class="btn btn-red acct" href="/login.html" aria-label="${t('login')}">${PERSON}<span>${t('login')}</span></a>`;
    const link = (id, href, k) => `<li><a href="${href}" data-nav="${id}" class="${activePage === id ? 'on' : ''}">${t(k)}</a></li>`;
    App.$('#hdr').innerHTML = `<div class="wrap nav">
      <a href="/" class="logo">DIVYA <span>SHAKTI</span> MOTORS</a>
      <nav id="nav"><ul>
        ${link('home', '/', 'nav_home')}${link('bikes', '/#bikes', 'nav_bikes')}${link('services', '/#services', 'nav_services')}
        ${link('about', '/#about', 'nav_about')}${link('contact', '/contact.html', 'nav_contact')}
        <li class="nav-ind" aria-hidden="true"></li>
      </ul></nav>
      <div class="nav-right">
        <button class="lang" id="langBtn" aria-label="Language / ભાષા"><span data-l="en" class="${lang === 'en' ? 'on' : ''}">EN</span><span data-l="gu" class="${lang === 'gu' ? 'on' : ''}">ગુજ</span></button>
        ${acct}
        <button class="menu-btn" id="menuBtn" aria-label="Menu">☰</button>
      </div></div>`;
    App.$('#ftr').innerHTML = `<div class="wrap row">
      <div><b style="color:#fff">Divya Shakti Motors</b><br>${t('foot_addr')}</div>
      <div>${t('foot_hours')}<br><a href="tel:+${SHOP.phone}">${SHOP.phoneDisplay}</a></div>
      <div>© ${new Date().getFullYear()} Divya Shakti Motors</div></div>`;
    App.$('#mbar').innerHTML = `<a href="tel:+${SHOP.phone}" style="background:var(--red)">${t('m_call')}</a>
      <a href="https://wa.me/${SHOP.phone}" target="_blank" rel="noopener" style="background:#1fa855">WhatsApp</a>
      <a href="${SHOP.dir}" target="_blank" rel="noopener" style="background:var(--ink)">${t('directions')}</a>`;
    const nav = App.$('#nav');
    App.$('#menuBtn').onclick = () => nav.classList.toggle('nav-open');
    nav.onclick = (e) => { if (e.target.tagName === 'A') nav.classList.remove('nav-open'); };
    nav.addEventListener('mouseover', (e) => { const l = e.target.closest('a[data-nav]'); if (l) App.navInd(l); });
    nav.addEventListener('focusin', (e) => { const l = e.target.closest('a[data-nav]'); if (l) App.navInd(l); });
    nav.addEventListener('mouseleave', () => App.navInd());
    nav.addEventListener('focusout', () => App.navInd());
    App.spy();
    App.$('#langBtn').onclick = () => App.setLang(lang === 'en' ? 'gu' : 'en');
  }

  // On the home page, highlight Services / About while that section is on screen (they are anchors on the same page, so the page itself never changes)
  App.spy = () => {
    if (activePage !== 'home') return App.navInd();
    const on = (id) => document.querySelectorAll('nav a[data-nav]').forEach((a) => a.classList.toggle('on', a.dataset.nav === id));
    const inView = (sel) => { const el = document.querySelector(sel); if (!el) return false; const r = el.getBoundingClientRect(); return r.top <= 140 && r.bottom > 140; };
    on(inView('#bikes') ? 'bikes' : inView('#services') ? 'services' : inView('#about') ? 'about' : 'home');
    App.navInd();
  };
  {
    let t = false;
    addEventListener('scroll', () => { if (t) return; t = true; requestAnimationFrame(() => { App.spy(); t = false; }); }, { passive: true });
  }

  // Sliding red underline under the menu: follows the hovered link and rests under the current one
  App.navInd = (el) => {
    const ind = document.querySelector('.nav-ind');
    if (!ind || innerWidth <= 820) return;
    const a = el || document.querySelector('nav a.on');
    if (!a) { ind.style.width = '0'; return; }
    const u = ind.parentElement.getBoundingClientRect(), r = a.getBoundingClientRect();
    ind.style.top = (r.bottom - u.top + 3) + 'px';
    ind.style.width = r.width + 'px';
    ind.style.transform = `translateX(${r.left - u.left}px)`;
    if (!ind.classList.contains('ready')) requestAnimationFrame(() => requestAnimationFrame(() => ind.classList.add('ready')));
  };
  addEventListener('resize', () => App.navInd());
  document.fonts && document.fonts.ready.then(() => App.navInd());

  App.setLang = (l) => {
    lang = l;
    try { localStorage.setItem('dsm_lang', l); } catch (e) {}
    document.documentElement.lang = l;
    chrome(); App.applyI18n(); langListeners.forEach((fn) => fn());
  };

  /* ---------- products, wishlist ---------- */
  App.loadProducts = async () => (App.products ||= await App.api('/products'));
  App.pname = (id) => (App.products || []).find((p) => p.id === Number(id))?.name || '';

  // Bike photo, or the shared placeholder (with a "Photo coming soon" tag) when a bike has no photo yet
  App.imgHtml = (p) => p.image
    ? `<img class="shot" src="${App.esc(p.image)}" alt="${App.esc(p.name)}" loading="lazy">`
    : `<img src="/img/bike-placeholder.jpg" alt="${App.esc(p.name)}" loading="lazy"><span class="soon">${App.t('soon')}</span>`;
  // If an image fails to load (e.g. placeholder file missing), fall back to a plain grey box with the bike name
  document.addEventListener('error', (e) => {
    const el = e.target; if (!el || el.tagName !== 'IMG') return;
    const box = el.closest('.pimg'); if (!box) return;
    const ph = document.createElement('div'); ph.className = 'ph'; ph.textContent = el.alt;
    el.replaceWith(ph); const tag = App.$('.soon', box); if (tag) tag.remove();
  }, true);

  App.card = (p) => {
    const t = App.t, esc = App.esc, tag = p['tagline_' + lang] || p.tagline_en || '';
    return `<article class="card"><div class="pimg">${App.imgHtml(p)}
      <button class="heart ${App.wish.has(p.id) ? 'on' : ''}" data-wish="${p.id}" aria-label="Save">♥</button></div>
      <div class="body"><span class="cat">${t(p.category)}</span><h3>${esc(p.name)}</h3><p>${esc(tag)}</p>
      <div class="price">${App.price(p)}</div>
      <a class="btn btn-red" href="/bike.html?id=${p.id}">${t('explore')}</a>
      <label class="cmp"><input type="checkbox" data-cmp="${p.id}" ${App.cmp.includes(p.id) ? 'checked' : ''}> ${t('compare')}</label></div></article>`;
  };

  // Click handling for product grids: heart toggles, button opens the detail modal
  App.bindCards = (container) => container.addEventListener('click', async (e) => {
    const w = e.target.closest('[data-wish]');
    if (w) {
      if (!App.user) { location.href = '/login.html?next=' + encodeURIComponent(location.pathname); return; }
      const id = Number(w.dataset.wish), on = App.wish.has(id);
      try {
        await App.api('/my/wishlist/' + id, { method: on ? 'DELETE' : 'POST' });
        on ? App.wish.delete(id) : App.wish.add(id);
        w.classList.toggle('on', !on);
      } catch (err) { App.toast(err.message, true); }
    }
  });

  App.productModal = (id) => {
    const p = (App.products || []).find((x) => x.id === id); if (!p) return;
    const esc = App.esc, t = App.t;
    const desc = p['desc_' + lang] || p.desc_en || '';
    const m = App.modal(`<h2>${esc(p.name)}</h2><span class="cat" style="margin-top:6px">${t(p.category)}</span>
      <div class="pimg">${App.imgHtml(p)}</div>
      <p class="muted">${esc(desc)}</p>
      ${p.engine ? `<p style="margin-top:8px"><b>Engine:</b> ${esc(p.engine)}</p>` : ''}
      <div class="price" style="font-size:1.2rem">${App.price(p)}</div>
      <div id="mform"></div>`);
    App.enquiryForm(App.$('#mform', m.el), { productId: p.id });
  };

  /* ---------- enquiry form (used on home, bikes, contact) ---------- */
  App.enquiryForm = async (host, opt = {}) => {
    const types = opt.types || ['general', 'test_ride', 'price', 'finance', 'exchange', 'service'];
    const fixed = types.length === 1 ? types[0] : null, contact = fixed === 'contact';
    const today = new Date().toISOString().slice(0, 10);
    await App.loadProducts().catch(() => {});
    const bikeOpts = (App.products || []).map((p) => `<option value="${p.id}" ${p.id === opt.productId ? 'selected' : ''}>${App.esc(p.name)}</option>`).join('');
    const u = App.user;
    const build = () => {
      host.innerHTML = `<form novalidate>
        <div class="err" hidden></div>
        <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
        <label class="f"><span data-i18n="f_name"></span><input name="name" maxlength="80" autocomplete="name" required value="${App.esc(u ? u.name : '')}"></label>
        <label class="f"><span data-i18n="f_phone"></span><input name="phone" type="tel" inputmode="numeric" maxlength="15" autocomplete="tel" required value="${App.esc(u ? u.phone : '')}"></label>
        ${fixed ? '' : `<label class="f"><span data-i18n="f_type"></span><select name="type">${types.map((x) => `<option value="${x}" data-i18n="ty_${x}"></option>`).join('')}</select></label>`}
        ${contact ? '' : `<label class="f"><span data-i18n="ph_bike"></span><select name="product_id"><option value=""></option>${bikeOpts}</select></label>
        <label class="f" data-datebox><span data-i18n="f_date"></span><input name="preferred_date" type="date" min="${today}"></label>`}
        <label class="f"><span data-i18n="${contact ? 'f_msg' : 'f_msg_opt'}"></span><textarea name="message" rows="${contact ? 5 : 3}" maxlength="1000" ${contact ? 'required' : ''}></textarea></label>
        <button class="btn btn-wa" type="submit" data-i18n="f_send"></button></form>`;
      App.applyI18n(host);
      const form = App.$('form', host), typeSel = form.elements.type, dbox = App.$('[data-datebox]', form);
      const syncDate = () => { if (dbox) dbox.hidden = !['test_ride', 'service'].includes(fixed || typeSel.value); };
      if (typeSel) typeSel.addEventListener('change', syncDate);
      if (opt.defaultType && typeSel) typeSel.value = opt.defaultType;
      syncDate();
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const err = App.$('.err', form), btn = App.$('button[type=submit]', form);
        err.hidden = true; btn.disabled = true; btn.textContent = App.t('sending');
        const f = Object.fromEntries(new FormData(form));
        const body = { ...f, type: fixed || f.type, product_id: f.product_id || undefined };
        try {
          await App.api('/enquiries', { method: 'POST', body });
          done(body);
        } catch (ex) {
          err.textContent = ex.message; err.hidden = false;
          btn.disabled = false; btn.textContent = App.t('f_send');
        }
      });
    };
    const done = (b) => {
      const label = App.t('ty_' + b.type);
      const bike = b.product_id ? App.pname(b.product_id) : '';
      const wa = `Hello Divya Shakti Motors, I'm ${b.name}. ${dict.en['ty_' + b.type]}${bike ? ' - ' + bike : ''}. ${b.message || ''}`.trim();
      host.innerHTML = `<div class="okbox"><h3 data-i18n="ok_title"></h3><p data-i18n="ok_sub"></p>
        <div class="cta"><a class="btn btn-wa" target="_blank" rel="noopener" href="https://wa.me/${SHOP.phone}?text=${encodeURIComponent(wa)}" data-i18n="ok_wa"></a>
        ${App.user ? '<a class="btn btn-line" href="/dashboard.html" data-i18n="ok_track"></a>' : ''}
        <button class="btn btn-line" type="button" id="again" data-i18n="ok_another"></button></div></div>`;
      App.applyI18n(host); void label;
      App.$('#again', host).onclick = build;
    };
    build();
  };

  /* ---------- opening hours (home + contact) ---------- */
  App.renderHours = (table, statusEl) => {
    const ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const today = ist.getDay(), hr = ist.getHours() + ist.getMinutes() / 60, open = today !== 0 && hr >= 8 && hr < 20;
    const days = App.t('days').split(',');
    if (table) table.innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) =>
      `<tr class="${d === today ? 'today' : ''}"><td>${days[d]}</td><td>${d === 0 ? App.t('closed_day') : App.t('hrs')}</td></tr>`).join('');
    if (statusEl) { statusEl.className = 'status ' + (open ? 'open' : 'closed'); statusEl.textContent = App.t(open ? 'open_now' : 'closed_now'); }
  };

  /* ---------- scroll rider: a little bike that rides along a road as you scroll ---------- */
  function initRider() {
    if (App.$('#rider')) return;
    const el = document.createElement('div');
    el.id = 'rider'; el.className = 'rider'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<div class="track"><div class="fill"></div></div>
      <div class="bikewrap"><svg class="bikesvg" viewBox="0 0 64 46" width="34" height="24">
        <g class="body">
          <path d="M14 34 L26 23 H40 L50 34 M26 23 L22 17" fill="none" stroke="#d62828" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M28 23 q5-9 14-5 l-2 5z" fill="#d62828"/>
          <rect x="20" y="18.5" width="14" height="4.5" rx="2.2" fill="#14161a" stroke="#fff" stroke-width="1"/>
          <path d="M42 23 L46 13 H52" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M29 17 L31 9" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
          <circle cx="32" cy="6" r="5.2" fill="#f4b400"/><path d="M33 4.2h5v3.2h-5z" fill="#14161a" opacity=".75"/>
          <path d="M31 12 L40 13.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
        </g>
        <g class="wheel"><circle cx="14" cy="36" r="8" fill="#14161a" stroke="#fff" stroke-width="2"/><path d="M14 29v14M7 36h14" stroke="#fff" stroke-width="1.4"/></g>
        <g class="wheel"><circle cx="50" cy="36" r="8" fill="#14161a" stroke="#fff" stroke-width="2"/><path d="M50 29v14M43 36h14" stroke="#fff" stroke-width="1.4"/></g>
      </svg></div>`;
    document.body.appendChild(el);
    const wrap = App.$('.bikewrap', el), fill = App.$('.fill', el);
    let last = 0, dir = 1, tm, ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      const y = window.scrollY, pct = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      const x = pct * (innerWidth - 34);
      wrap.style.transform = `translateX(${x}px)`;
      fill.style.width = (x + 17) + 'px';
      if (Math.abs(y - last) > 1) dir = y > last ? 1 : -1;
      wrap.classList.toggle('back', dir < 0);
      last = y;
      el.classList.add('moving'); clearTimeout(tm); tm = setTimeout(() => el.classList.remove('moving'), 140);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    update(); setTimeout(() => el.classList.remove('moving'), 200);
  }

  /* ---------- compare (up to 3 bikes, remembered in this browser) ---------- */
  App.SPECS = ['engine', 'power', 'torque', 'mileage', 'tank', 'weight', 'gearbox', 'brakes', 'suspension', 'tyres', 'dimensions', 'wheelbase', 'seat', 'clearance'];
  App.CMP_SPECS = App.SPECS.filter((k) => k !== 'suspension' && k !== 'dimensions');
  App.cmp = [];
  try { const a = JSON.parse(localStorage.getItem('dsm_compare') || '[]'); if (Array.isArray(a)) App.cmp = a.map(Number).filter(Boolean).slice(0, 3); } catch (e) {}
  const saveCmp = () => { try { localStorage.setItem('dsm_compare', JSON.stringify(App.cmp)); } catch (e) {} };
  App.setCompare = (id, on) => {
    id = Number(id);
    const has = App.cmp.includes(id);
    if (on && !has) { if (App.cmp.length >= 3) { App.toast(App.t('cmp_max'), true); return false; } App.cmp.push(id); }
    if (!on && has) App.cmp = App.cmp.filter((x) => x !== id);
    saveCmp(); App.syncCompare(); return true;
  };
  App.syncCompare = () => {
    App.$$('[data-cmp]').forEach((cb) => { cb.checked = App.cmp.includes(Number(cb.dataset.cmp)); });
    renderTray();
  };
  document.addEventListener('change', (e) => {
    const cb = e.target.closest && e.target.closest('[data-cmp]');
    if (cb && !App.setCompare(cb.dataset.cmp, cb.checked)) cb.checked = false;
  });

  let tray = null;
  async function renderTray() {
    if (!tray) return;
    if (!App.cmp.length) { tray.hidden = true; return; }
    try { await App.loadProducts(); } catch (e) {}
    const list = App.cmp.map((id) => (App.products || []).find((p) => p.id === id)).filter(Boolean);
    if (!list.length) { tray.hidden = true; return; }
    const ok = list.length >= 2;
    tray.hidden = false;
    tray.innerHTML = `<div class="cmp-in"><div class="cmp-chips">${list.map((p) =>
      `<span class="cmp-chip">${App.esc(p.name.replace(/^Hero /, ''))}<button type="button" data-cmprm="${p.id}" aria-label="Remove">×</button></span>`).join('')}</div>
      ${ok ? `<a class="btn btn-red btn-sm" href="/compare.html?ids=${list.map((p) => p.id).join(',')}">${App.t('cmp_go')} (${list.length})</a>`
           : `<span class="cmp-need">${App.t('cmp_need')}</span>`}
      <button type="button" class="cmp-clear" id="cmpClear">${App.t('cmp_clear')}</button></div>`;
  }
  function initTray(page) {
    if (page === 'admin' || page === 'compare' || App.$('#cmpTray')) return;
    tray = document.createElement('div'); tray.id = 'cmpTray'; tray.className = 'cmp-tray'; tray.hidden = true;
    document.body.appendChild(tray);
    tray.addEventListener('click', (e) => {
      const rm = e.target.closest('[data-cmprm]');
      if (rm) App.setCompare(rm.dataset.cmprm, false);
      if (e.target.id === 'cmpClear') { App.cmp = []; saveCmp(); App.syncCompare(); }
    });
    langListeners.push(renderTray);
    renderTray();
  }

  /* ---------- init ---------- */
  App.init = async (page, onReady) => {
    activePage = page; document.documentElement.lang = lang;
    try { App.user = (await App.api('/me')).user; } catch (e) {}
    if (App.user) { try { App.wish = new Set(await App.api('/my/wishlist')); } catch (e) {} }
    chrome(); App.applyI18n();
    if (page !== 'admin') initRider();
    initTray(page);
    if (onReady) await onReady();
  };

  window.App = App;
})();
