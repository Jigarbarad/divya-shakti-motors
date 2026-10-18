App.add({
  en: { cmp_title: 'Compare Bikes', cmp_sub: 'Pick up to 3 bikes and see them side by side.', add_bike: '+ Add a bike to compare',
        cmp_empty: 'Choose at least 2 bikes to compare.', remove: 'Remove', sp_price: 'Price' },
  gu: { cmp_title: 'બાઇકની સરખામણી', cmp_sub: '3 સુધી બાઇક પસંદ કરો અને સાથે-સાથે જુઓ.', add_bike: '+ સરખામણી માટે બાઇક ઉમેરો',
        cmp_empty: 'સરખામણી માટે ઓછામાં ઓછી 2 બાઇક પસંદ કરો.', remove: 'હટાવો', sp_price: 'કિંમત' },
});

// Bikes come from ?ids=1,2,3 (shared link) first, otherwise from this browser's compare list
const fromUrl = (new URLSearchParams(location.search).get('ids') || '').split(',').map(Number).filter(Boolean).slice(0, 3);
if (fromUrl.length) { App.cmp = fromUrl; try { localStorage.setItem('dsm_compare', JSON.stringify(fromUrl)); } catch (e) {} }

function render() {
  const t = App.t, esc = App.esc;
  const list = App.cmp.map((id) => App.products.find((p) => p.id === id)).filter(Boolean);
  const sel = App.$('#addSel');
  sel.innerHTML = `<option value="">${t('add_bike')}</option>` + App.products.filter((p) => !App.cmp.includes(p.id))
    .map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
  sel.hidden = list.length >= 3;
  history.replaceState(null, '', list.length ? '?ids=' + list.map((p) => p.id).join(',') : location.pathname);
  const view = App.$('#view');
  if (list.length < 2) {
    view.innerHTML = `<p class="empty">${t('cmp_empty')}</p>` + (list.length ? table(list) : '');
    return;
  }
  view.innerHTML = table(list);

  function table(list) {
    const head = list.map((p) => `<td class="cmphead"><div class="pimg">${App.imgHtml(p)}</div>
      <a class="nm" href="/bike.html?id=${p.id}">${esc(p.name)}</a><br>
      <button class="btn btn-line btn-sm" data-rm="${p.id}">${t('remove')}</button></td>`).join('');
    const spec = (k) => `<tr><td>${t('sp_' + k)}</td>${list.map((p) => `<td>${esc((p.specs && p.specs[k]) || '—')}</td>`).join('')}</tr>`;
    return `<div class="tablewrap"><table class="t cmptable"><tbody>
      <tr><td></td>${head}</tr>
      <tr><td>${t('sp_price')}</td>${list.map((p) => `<td><b style="color:var(--red)">${App.price(p)}</b></td>`).join('')}</tr>
      ${App.CMP_SPECS.map(spec).join('')}
      <tr><td>${t('variants_n')}</td>${list.map((p) => `<td>${(p.variants || []).length || '—'}</td>`).join('')}</tr>
      </tbody></table></div><p class="note">${t('spec_note')}</p>`;
  }
}

App.init('compare', async () => {
  try { await App.loadProducts(); } catch (e) { App.toast(e.message, true); App.products = []; }
  App.$('#addSel').addEventListener('change', (e) => { if (e.target.value && App.setCompare(e.target.value, true)) render(); });
  App.$('#view').addEventListener('click', (e) => {
    const b = e.target.closest('[data-rm]'); if (b) { App.setCompare(b.dataset.rm, false); render(); }
  });
  render(); App.onLang(render);
});
