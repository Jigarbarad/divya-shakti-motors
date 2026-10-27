App.add({
  en: { hello: 'Hello', logout: 'Log out', tab_req: 'My Requests', tab_saved: 'Saved Bikes', tab_profile: 'Profile',
        new_req: 'New request', no_req: "You haven't made any requests yet.", no_saved: 'No saved bikes yet. Tap the ♥ on any bike to save it.',
        th_date: 'Date', th_type: 'Request', th_bike: 'Bike', th_status: 'Status', th_visit: 'Preferred date', cancel: 'Cancel', cancel_q: 'Cancel this request?',
        cancelled_ok: 'Request cancelled.', browse: 'Browse bikes',
        p_details: 'Your details', p_save: 'Save changes', p_saved: 'Profile updated.', p_pass: 'Change password',
        p_cur: 'Current password', p_new: 'New password (min 8 characters)', p_change: 'Update password', p_pass_ok: 'Password updated.',
        f_email: 'Email (optional)' },
  gu: { hello: 'નમસ્તે', logout: 'લૉગ આઉટ', tab_req: 'મારી વિનંતીઓ', tab_saved: 'સાચવેલી બાઇક્સ', tab_profile: 'પ્રોફાઇલ',
        new_req: 'નવી વિનંતી', no_req: 'તમે હજી કોઈ વિનંતી કરી નથી.', no_saved: 'હજી કોઈ બાઇક સાચવી નથી. સાચવવા માટે બાઇક પર ♥ દબાવો.',
        th_date: 'તારીખ', th_type: 'વિનંતી', th_bike: 'બાઇક', th_status: 'સ્થિતિ', th_visit: 'પસંદગીની તારીખ', cancel: 'રદ કરો', cancel_q: 'આ વિનંતી રદ કરવી છે?',
        cancelled_ok: 'વિનંતી રદ થઈ.', browse: 'બાઇક્સ જુઓ',
        p_details: 'તમારી વિગતો', p_save: 'ફેરફાર સાચવો', p_saved: 'પ્રોફાઇલ અપડેટ થઈ.', p_pass: 'પાસવર્ડ બદલો',
        p_cur: 'હાલનો પાસવર્ડ', p_new: 'નવો પાસવર્ડ (ઓછામાં ઓછા 8 અક્ષર)', p_change: 'પાસવર્ડ અપડેટ કરો', p_pass_ok: 'પાસવર્ડ અપડેટ થયો.',
        f_email: 'ઇમેઇલ (વૈકલ્પિક)' },
});

let tab = 'req', reqs = [];
const view = () => App.$('#view');

function head() {
  App.$('#hello').textContent = App.t('hello') + ', ' + App.user.name;
  App.$('#phoneLine').textContent = '+91 ' + App.user.phone;
}

async function showReq() {
  const esc = App.esc, t = App.t;
  try { reqs = await App.api('/my/enquiries'); } catch (e) { App.toast(e.message, true); }
  const newBtn = `<div class="cta" style="margin-bottom:16px"><a class="btn btn-red btn-sm" href="/products.html">${t('browse')}</a></div>`;
  if (!reqs.length) { view().innerHTML = newBtn + `<p class="empty">${t('no_req')}</p>`; return; }
  view().innerHTML = newBtn + `<div class="tablewrap"><table class="t"><thead><tr>
    <th>${t('th_date')}</th><th>${t('th_type')}</th><th>${t('th_bike')}</th><th>${t('th_visit')}</th><th>${t('th_status')}</th><th></th></tr></thead><tbody>` +
    reqs.map((r) => `<tr><td>${esc(App.fmtDate(r.created_at))}</td><td>${t('ty_' + r.type)}${r.message ? `<br><small class="muted">${esc(r.message.slice(0, 80))}</small>` : ''}</td>
      <td>${esc(r.product_name || '—')}</td><td>${esc(r.preferred_date || '—')}</td><td>${App.pill(r.status)}</td>
      <td>${r.status === 'new' ? `<button class="btn btn-danger btn-sm" data-cancel="${r.id}">${t('cancel')}</button>` : ''}</td></tr>`).join('') +
    '</tbody></table></div>';
}

async function showSaved() {
  try { await App.loadProducts(); } catch (e) {}
  const list = (App.products || []).filter((p) => App.wish.has(p.id));
  view().innerHTML = list.length
    ? `<div class="grid g3">${list.map(App.card).join('')}</div>`
    : `<p class="empty">${App.t('no_saved')}</p><p style="text-align:center"><a class="btn btn-red btn-sm" href="/products.html">${App.t('browse')}</a></p>`;
}

function showProfile() {
  const u = App.user, esc = App.esc, t = App.t;
  view().innerHTML = `<div class="two">
    <div class="formcard"><h3 style="margin-bottom:14px">${t('p_details')}</h3>
      <form id="pf" novalidate><div class="err" hidden></div>
        <label class="f"><span>${t('f_name')}</span><input name="name" maxlength="80" required value="${esc(u.name)}"></label>
        <label class="f"><span>${t('f_phone')}</span><input value="${esc(u.phone)}" disabled></label>
        <label class="f"><span>${t('f_email')}</span><input name="email" type="email" value="${esc(u.email || '')}"></label>
        <button class="btn btn-red" type="submit">${t('p_save')}</button></form></div>
    <div class="formcard"><h3 style="margin-bottom:14px">${t('p_pass')}</h3>
      <form id="pw" novalidate><div class="err" hidden></div>
        <label class="f"><span>${t('p_cur')}</span><input name="current" type="password" autocomplete="current-password" required></label>
        <label class="f"><span>${t('p_new')}</span><input name="next" type="password" minlength="8" autocomplete="new-password" required></label>
        <button class="btn btn-line" type="submit">${t('p_change')}</button></form></div></div>`;
  const submit = (form, path, method, ok, after) => form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = App.$('.err', form); err.hidden = true;
    try { const r = await App.api(path, { method, body: Object.fromEntries(new FormData(form)) }); App.toast(App.t(ok)); after && after(r); }
    catch (ex) { err.textContent = ex.message; err.hidden = false; }
  });
  submit(App.$('#pf'), '/me', 'PATCH', 'p_saved', (r) => { App.user = r.user; head(); });
  submit(App.$('#pw'), '/me/password', 'POST', 'p_pass_ok', () => App.$('#pw').reset());
}

const show = () => ({ req: showReq, saved: showSaved, profile: showProfile }[tab])();

App.init('account', async () => {
  if (!App.user) { location.href = '/login.html?next=/dashboard.html'; return; }
  head(); show();
  App.onLang(() => { head(); show(); });
  App.$('#tabs').addEventListener('click', (e) => {
    const b = e.target.closest('.tab'); if (!b) return;
    App.$$('#tabs .tab').forEach((x) => x.classList.toggle('on', x === b)); tab = b.dataset.tab; show();
  });
  App.$('#logout').addEventListener('click', async () => { await App.api('/auth/logout', { method: 'POST' }); location.href = '/'; });
  view().addEventListener('click', async (e) => {
    const c = e.target.closest('[data-cancel]');
    if (c && confirm(App.t('cancel_q'))) {
      try { await App.api('/my/enquiries/' + c.dataset.cancel + '/cancel', { method: 'POST' }); App.toast(App.t('cancelled_ok')); showReq(); }
      catch (ex) { App.toast(ex.message, true); }
    }
  });
  App.bindCards(view());
});
