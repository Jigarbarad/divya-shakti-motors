/* Admin panel (English only). All data comes from /api/admin/*, which the server restricts to the admin role. */
const A = App, esc = A.esc, $ = A.$;
const TYPES = { general: 'General enquiry', test_ride: 'Test ride', price: 'Price / offers', finance: 'Finance / EMI', exchange: 'Exchange', service: 'Service', contact: 'Message' };
const STATUS = { new: 'New', contacted: 'Contacted', done: 'Completed', cancelled: 'Cancelled' };
const pill = (s) => `<span class="pill p-${s}">${STATUS[s]}</span>`;
const opts = (obj, sel) => Object.entries(obj).map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${v}</option>`).join('');
const view = () => $('#view');
const when = (s) => A.fmtDate(s);
const waLink = (phone, name) => `https://wa.me/91${phone}?text=${encodeURIComponent('Hello ' + name + ', this is Divya Shakti Motors regarding your enquiry.')}`;
let tab = 'dash';

/* ---------- Dashboard ---------- */
async function dash() {
  const s = await A.api('/admin/stats');
  $('#newCount').hidden = !s.newEnquiries; $('#newCount').textContent = s.newEnquiries;
  view().innerHTML = `<div class="stat-grid">
    <div class="sc ${s.newEnquiries ? 'hot' : ''}"><b>${s.newEnquiries}</b><small>New enquiries</small></div>
    <div class="sc"><b>${s.today}</b><small>Received today</small></div>
    <div class="sc"><b>${s.testRides}</b><small>Open test rides</small></div>
    <div class="sc"><b>${s.enquiries}</b><small>Total enquiries</small></div>
    <div class="sc"><b>${s.activeProducts}<small> / ${s.products}</small></b><small>Bikes live on site</small></div>
    <div class="sc"><b>${s.customers}</b><small>Registered customers</small></div></div>
    <h3 style="margin-bottom:12px">Latest enquiries</h3>
    ${s.recent.length ? `<div class="tablewrap"><table class="t"><thead><tr><th>When</th><th>Name</th><th>Phone</th><th>Request</th><th>Bike</th><th>Status</th></tr></thead><tbody>` +
      s.recent.map((r) => `<tr><td>${esc(when(r.created_at))}</td><td>${esc(r.name)}</td><td><a href="tel:+91${r.phone}">${r.phone}</a></td>
        <td>${TYPES[r.type]}</td><td>${esc(r.product_name || '—')}</td><td>${pill(r.status)}</td></tr>`).join('') + '</tbody></table></div>'
      : '<p class="empty">No enquiries yet. They will appear here as soon as customers send them.</p>'}`;
}

/* ---------- Enquiries ---------- */
let eq = { status: '', type: '', q: '' };
async function enquiries() {
  view().innerHTML = `<div class="bar">
    <select id="fs"><option value="">All statuses</option>${opts(STATUS, eq.status)}</select>
    <select id="ft"><option value="">All types</option>${opts(TYPES, eq.type)}</select>
    <input id="fq" class="grow" type="search" placeholder="Search name, phone, message…" value="${esc(eq.q)}"></div>
    <div id="elist"></div>`;
  const load = async () => {
    const qs = new URLSearchParams(Object.entries(eq).filter(([, v]) => v)).toString();
    const rows = await A.api('/admin/enquiries' + (qs ? '?' + qs : ''));
    $('#elist').innerHTML = rows.length ? `<div class="tablewrap"><table class="t"><thead><tr><th>#</th><th>When</th><th>Customer</th><th>Request</th><th>Bike</th><th>Status</th><th></th></tr></thead><tbody>` +
      rows.map((r) => `<tr><td>${r.id}</td><td>${esc(when(r.created_at))}</td>
        <td><b>${esc(r.name)}</b>${r.registered ? ' <small class="muted">(account)</small>' : ''}<br><a href="tel:+91${r.phone}">${r.phone}</a> · <a href="${waLink(r.phone, r.name)}" target="_blank" rel="noopener">WhatsApp</a></td>
        <td>${TYPES[r.type]}${r.preferred_date ? `<br><small class="muted">Date: ${esc(r.preferred_date)}</small>` : ''}${r.message ? `<br><small class="muted" title="${esc(r.message)}">${esc(r.message.slice(0, 70))}${r.message.length > 70 ? '…' : ''}</small>` : ''}</td>
        <td>${esc(r.product_name || '—')}</td>
        <td><select data-st="${r.id}">${opts(STATUS, r.status)}</select></td>
        <td><button class="btn btn-line btn-sm" data-note="${r.id}">${r.admin_note ? 'Note ✎' : 'Note'}</button></td></tr>`).join('') + '</tbody></table></div>'
      : '<p class="empty">No enquiries match.</p>';
    $('#elist').onchange = async (e) => {
      const s = e.target.dataset.st; if (!s) return;
      try { await A.api('/admin/enquiries/' + s, { method: 'PATCH', body: { status: e.target.value } }); A.toast('Status updated'); refreshBadge(); }
      catch (ex) { A.toast(ex.message, true); }
    };
    $('#elist').onclick = (e) => {
      const b = e.target.closest('[data-note]'); if (!b) return;
      const r = rows.find((x) => x.id === Number(b.dataset.note));
      const m = A.modal(`<h2>Enquiry #${r.id}</h2><p class="muted">${esc(when(r.created_at))} · ${TYPES[r.type]}${r.product_name ? ' · ' + esc(r.product_name) : ''}</p>
        <p style="margin:10px 0"><b>${esc(r.name)}</b> · <a href="tel:+91${r.phone}">${r.phone}</a></p>
        ${r.message ? `<p style="background:var(--soft);padding:12px;border-radius:10px;white-space:pre-wrap">${esc(r.message)}</p>` : ''}
        <form id="nf" style="margin-top:14px"><label class="f"><span>Private note (only you can see this)</span><textarea name="admin_note" rows="3" maxlength="1000">${esc(r.admin_note || '')}</textarea></label>
        <div class="cta"><button class="btn btn-red btn-sm" type="submit">Save note</button>
        <button class="btn btn-danger btn-sm" type="button" id="del">Delete enquiry</button></div></form>`);
      $('#nf', m.el).onsubmit = async (ev) => {
        ev.preventDefault();
        try { await A.api('/admin/enquiries/' + r.id, { method: 'PATCH', body: { admin_note: ev.target.admin_note.value } }); m.close(); A.toast('Saved'); load(); }
        catch (ex) { A.toast(ex.message, true); }
      };
      $('#del', m.el).onclick = async () => {
        if (!confirm('Delete this enquiry permanently?')) return;
        try { await A.api('/admin/enquiries/' + r.id, { method: 'DELETE' }); m.close(); load(); refreshBadge(); } catch (ex) { A.toast(ex.message, true); }
      };
    };
  };
  $('#fs').onchange = (e) => { eq.status = e.target.value; load(); };
  $('#ft').onchange = (e) => { eq.type = e.target.value; load(); };
  let tm; $('#fq').oninput = (e) => { clearTimeout(tm); tm = setTimeout(() => { eq.q = e.target.value.trim(); load(); }, 300); };
  await load();
}

/* ---------- Products ---------- */
async function products() {
  const list = await A.api('/admin/products');
  view().innerHTML = `<div class="bar"><button class="btn btn-red btn-sm" id="add">+ Add bike</button>
    <span class="muted">Bikes marked “Live” show on the website. “Featured” bikes appear on the home page.</span></div>
    <div class="tablewrap"><table class="t"><thead><tr><th>Photo</th><th>Name</th><th>Type</th><th>Price</th><th>Live</th><th>Featured</th><th></th></tr></thead><tbody>` +
    list.map((p) => `<tr><td>${p.image ? `<img class="thumb" src="${esc(p.image)}" alt="">` : '<span class="thumb none">no photo</span>'}</td>
      <td><b>${esc(p.name)}</b></td><td>${p.category === 'scooter' ? 'Scooter' : 'Motorcycle'}</td>
      <td>${p.price ? '₹ ' + p.price.toLocaleString('en-IN') : '<span class="muted">—</span>'}</td>
      <td>${p.active ? '✅' : '—'}</td><td>${p.featured ? '⭐' : '—'}</td>
      <td class="rowact"><button class="btn btn-line btn-sm" data-edit="${p.id}">Edit</button><button class="btn btn-danger btn-sm" data-del="${p.id}">Delete</button></td></tr>`).join('') +
    '</tbody></table></div>';
  $('#add').onclick = () => productForm(null, products);
  view().onclick = async (e) => {
    const ed = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
    if (ed) productForm(list.find((p) => p.id === Number(ed.dataset.edit)), products);
    if (del && confirm('Delete this bike? Its saved-bike and enquiry links will be cleared.')) {
      try { await A.api('/admin/products/' + del.dataset.del, { method: 'DELETE' }); A.products = null; products(); } catch (ex) { A.toast(ex.message, true); }
    }
  };
}

const SPEC_LABELS = { engine: 'Engine', power: 'Max power', torque: 'Max torque', mileage: 'Mileage (claimed)', tank: 'Fuel tank', weight: 'Kerb weight', gearbox: 'Gearbox', brakes: 'Brakes', suspension: 'Suspension', tyres: 'Tyres', dimensions: 'Dimensions (L × W × H)', wheelbase: 'Wheelbase', seat: 'Seat height', clearance: 'Ground clearance' };
function productForm(p, done) {
  p = p || { name: '', category: 'motorcycle', price: '', engine: '', image: '', tagline_en: '', tagline_gu: '', desc_en: '', desc_gu: '', featured: 0, active: 1, sort: 0 };
  const m = A.modal(`<h2>${p.id ? 'Edit bike' : 'Add bike'}</h2>
    <form id="pform" novalidate><div class="err" hidden></div>
      <div class="grid2">
        <label class="f"><span>Name</span><input name="name" maxlength="100" required value="${esc(p.name)}"></label>
        <label class="f"><span>Type</span><select name="category"><option value="motorcycle" ${p.category === 'motorcycle' ? 'selected' : ''}>Motorcycle</option><option value="scooter" ${p.category === 'scooter' ? 'selected' : ''}>Scooter</option></select></label>
        <label class="f"><span>Price (₹, optional)</span><input name="price" type="number" min="0" step="1" value="${p.price ?? ''}"></label>
        <label class="f"><span>Engine (optional, e.g. 97.2 cc)</span><input name="engine" maxlength="60" value="${esc(p.engine || '')}"></label>
      </div>
      <label class="f"><span>Short line — English</span><input name="tagline_en" maxlength="120" value="${esc(p.tagline_en || '')}"></label>
      <label class="f"><span>Short line — ગુજરાતી</span><input name="tagline_gu" maxlength="120" value="${esc(p.tagline_gu || '')}"></label>
      <label class="f"><span>Description — English</span><textarea name="desc_en" rows="3" maxlength="1000">${esc(p.desc_en || '')}</textarea></label>
      <label class="f"><span>Description — ગુજરાતી</span><textarea name="desc_gu" rows="3" maxlength="1000">${esc(p.desc_gu || '')}</textarea></label>
      <div class="grid2"><label class="f"><span>Best for — English</span><input name="best_en" maxlength="120" value="${esc((p.highlights && p.highlights.best && p.highlights.best.en) || '')}"></label>
        <label class="f"><span>Best for — ગુજરાતી</span><input name="best_gu" maxlength="120" value="${esc((p.highlights && p.highlights.best && p.highlights.best.gu) || '')}"></label></div>
      <label class="f"><span>Why choose this bike — English (one point per line)</span><textarea name="hl_en" rows="3" maxlength="600">${esc(((p.highlights && p.highlights.en) || []).join('\n'))}</textarea></label>
      <label class="f"><span>Why choose this bike — ગુજરાતી (one point per line)</span><textarea name="hl_gu" rows="3" maxlength="600">${esc(((p.highlights && p.highlights.gu) || []).join('\n'))}</textarea></label>
      <h3 style="margin-top:6px">Specifications <small class="muted" style="font-weight:400">(shown on the bike page and in Compare; leave blank if unknown)</small></h3>
      <div class="grid2">${Object.entries(SPEC_LABELS).map(([k, l]) => `<label class="f"><span>${l}</span><input name="sp_${k}" maxlength="120" value="${esc((p.specs && p.specs[k]) || '')}"></label>`).join('')}</div>
      <label class="f"><span>Variants — one per line as <code>Name | Price</code></span>
        <textarea name="variants_text" rows="4" placeholder="Splendor+ i3S Xtec | 99911">${esc((p.variants || []).map((v) => v.name + ' | ' + v.price).join('\n'))}</textarea></label>
      <div class="f"><span style="font-weight:600;font-size:.88rem">Photo (PNG, JPG or WebP, up to 4 MB)</span>
        <input type="file" id="file" accept="image/png,image/jpeg,image/webp">
        <input type="hidden" name="image" value="${esc(p.image || '')}">
        <img class="imgprev" id="prev" alt="" ${p.image ? `src="${esc(p.image)}"` : 'hidden'}></div>
      <div class="grid2"><label class="f"><span>Display order (small number first)</span><input name="sort" type="number" step="1" value="${p.sort || 0}"></label></div>
      <div class="chk"><label><input type="checkbox" name="active" ${p.active ? 'checked' : ''}> Live on website</label>
        <label><input type="checkbox" name="featured" ${p.featured ? 'checked' : ''}> Featured on home page</label></div>
      <button class="btn btn-red" type="submit">Save bike</button></form>`);
  const form = $('#pform', m.el), err = $('.err', form);
  $('#file', m.el).onchange = (e) => {
    const f = e.target.files[0]; if (!f) return;
    if (f.size > 4 * 1024 * 1024) { err.textContent = 'Image is larger than 4 MB.'; err.hidden = false; e.target.value = ''; return; }
    const rd = new FileReader();
    rd.onload = async () => {
      try {
        const r = await A.api('/admin/upload', { method: 'POST', body: { data: rd.result } });
        form.image.value = r.url; $('#prev', m.el).src = r.url; $('#prev', m.el).hidden = false; err.hidden = true;
      } catch (ex) { err.textContent = ex.message; err.hidden = false; }
    };
    rd.readAsDataURL(f);
  };
  form.onsubmit = async (e) => {
    e.preventDefault(); err.hidden = true;
    const f = Object.fromEntries(new FormData(form));
    f.active = form.active.checked; f.featured = form.featured.checked;
    f.specs = {}; for (const k of Object.keys(SPEC_LABELS)) { f.specs[k] = f['sp_' + k] || ''; delete f['sp_' + k]; }
    f.variants = String(f.variants_text || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
      const i = l.lastIndexOf('|'); return { name: (i < 0 ? l : l.slice(0, i)).trim(), price: i < 0 ? NaN : Number(l.slice(i + 1).replace(/[,\s₹]/g, '')) };
    });
    delete f.variants_text;
    f.highlights = { en: String(f.hl_en || '').split('\n').map((l) => l.trim()).filter(Boolean), gu: String(f.hl_gu || '').split('\n').map((l) => l.trim()).filter(Boolean), best: { en: f.best_en || '', gu: f.best_gu || '' } };
    delete f.best_en; delete f.best_gu;
    delete f.hl_en; delete f.hl_gu;
    const badV = f.variants.find((v) => !v.name || !Number.isFinite(v.price));
    if (badV) { err.textContent = 'Each variant line must look like: Name | 99911'; err.hidden = false; return; }
    try {
      await A.api(p.id ? '/admin/products/' + p.id : '/admin/products', { method: p.id ? 'PUT' : 'POST', body: f });
      A.products = null; m.close(); A.toast('Saved'); done();
    } catch (ex) { err.textContent = ex.message; err.hidden = false; }
  };
}

/* ---------- Customers ---------- */
async function users() {
  const list = await A.api('/admin/users');
  view().innerHTML = `<div class="tablewrap"><table class="t"><thead><tr><th>Name</th><th>Mobile</th><th>Email</th><th>Role</th><th>Requests</th><th>Joined</th><th></th></tr></thead><tbody>` +
    list.map((u) => `<tr><td><b>${esc(u.name)}</b></td><td><a href="tel:+91${u.phone}">${u.phone}</a></td><td>${esc(u.email || '—')}</td>
      <td>${u.role}</td><td>${u.enquiries}</td><td>${esc(when(u.created_at))}</td>
      <td>${u.id === A.user.id ? '' : `<button class="btn btn-danger btn-sm" data-u="${u.id}">Delete</button>`}</td></tr>`).join('') + '</tbody></table></div>';
  view().onclick = async (e) => {
    const b = e.target.closest('[data-u]');
    if (b && confirm('Delete this customer account? Their enquiries are kept.')) {
      try { await A.api('/admin/users/' + b.dataset.u, { method: 'DELETE' }); users(); } catch (ex) { A.toast(ex.message, true); }
    }
  };
}

/* ---------- Account ---------- */
function account() {
  view().innerHTML = `<div class="formcard" style="max-width:440px"><h3 style="margin-bottom:14px">Change your password</h3>
    <form id="pw" novalidate><div class="err" hidden></div>
      <label class="f"><span>Current password</span><input name="current" type="password" autocomplete="current-password" required></label>
      <label class="f"><span>New password (min 8 characters)</span><input name="next" type="password" minlength="8" autocomplete="new-password" required></label>
      <button class="btn btn-red" type="submit">Update password</button></form></div>`;
  $('#pw').onsubmit = async (e) => {
    e.preventDefault(); const err = $('.err', e.target); err.hidden = true;
    try { await A.api('/me/password', { method: 'POST', body: Object.fromEntries(new FormData(e.target)) }); e.target.reset(); A.toast('Password updated'); }
    catch (ex) { err.textContent = ex.message; err.hidden = false; }
  };
}

async function refreshBadge() {
  try { const s = await A.api('/admin/stats'); $('#newCount').hidden = !s.newEnquiries; $('#newCount').textContent = s.newEnquiries; } catch (e) {}
}

async function show() {
  view().onclick = null; view().innerHTML = '<p class="empty">Loading…</p>';
  try { await ({ dash, enq: enquiries, prod: products, users, acct: async () => account() }[tab])(); }
  catch (ex) { view().innerHTML = `<p class="empty">${esc(ex.message)}</p>`; }
}

A.init('admin', async () => {
  if (!A.user) { location.href = '/login.html?next=/admin.html'; return; }
  if (A.user.role !== 'admin') { location.href = '/dashboard.html'; return; }
  $('#who').textContent = 'Signed in as ' + A.user.name + ' (+91 ' + A.user.phone + ')';
  $('#tabs').addEventListener('click', (e) => {
    const b = e.target.closest('.tab'); if (!b) return;
    A.$$('#tabs .tab').forEach((x) => x.classList.toggle('on', x === b)); tab = b.dataset.tab; show();
  });
  $('#logout').onclick = async () => { await A.api('/auth/logout', { method: 'POST' }); location.href = '/'; };
  refreshBadge(); show();
});
