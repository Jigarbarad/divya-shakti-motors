App.add({
  en: { why_h: 'Why choose this bike?', test_btn: 'Book a test ride' },
  gu: { why_h: 'આ બાઇક કેમ પસંદ કરવી?', test_btn: 'ટેસ્ટ રાઇડ બુક કરો' },
});
let bike = null;

function render() {
  const t = App.t, esc = App.esc, p = bike, lang = App.lang();
  const view = App.$('#view');
  if (!p) { view.innerHTML = `<a class="crumb" href="/products.html">${t('back_all')}</a><p class="empty">${t('not_found')}</p>`; return; }
  document.title = p.name + ' | Divya Shakti Motors';
  const tag = p['tagline_' + lang] || p.tagline_en || '', desc = p['desc_' + lang] || p.desc_en || '';
  const rows = App.SPECS.filter((k) => p.specs && p.specs[k]).map((k) => `<tr><th>${t('sp_' + k)}</th><td>${esc(p.specs[k])}</td></tr>`).join('');
  const vars = (p.variants || []).map((v) => `<tr><td>${esc(v.name)}</td><td><b>₹ ${Number(v.price).toLocaleString('en-IN')}</b></td></tr>`).join('');
  const pts = ((p.highlights && p.highlights[lang]) || []).length ? p.highlights[lang] : ((p.highlights && p.highlights.en) || []);
  const best = (p.highlights && p.highlights.best && (p.highlights.best[lang] || p.highlights.best.en)) || '';
  const why = pts.length ? `<h3 class="whyh">${t('why_h')}</h3><ul class="why">${pts.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
  view.innerHTML = `<a class="crumb" href="/products.html">${t('back_all')}</a>
    <div class="detail">
      <div class="pimg">${App.imgHtml(p)}</div>
      <div>
        <span class="cat">${t(p.category)}</span>
        <h1>${esc(p.name)}</h1>
        <p class="muted">${esc(tag)}</p>
        <div class="bigprice">${App.price(p)}</div>
        <p>${esc(desc)}</p>
        ${best ? `<p class="best"><b>${t('best_for')}:</b> ${esc(best)}</p>` : ''}
        ${why}
        <label class="cmp" style="margin:16px 0"><input type="checkbox" data-cmp="${p.id}" ${App.cmp.includes(p.id) ? 'checked' : ''}> ${t('compare')}</label>
        <div class="cta"><button class="btn btn-red" id="enq">${t('enq_bike')}</button>
          <button class="btn btn-line" id="ride">${t('test_btn')}</button>
          <a class="btn btn-wa" target="_blank" rel="noopener" href="https://wa.me/${App.SHOP.phone}?text=${encodeURIComponent('Hello Divya Shakti Motors, I am interested in the ' + p.name + '.')}">WhatsApp</a></div>
      </div>
    </div>
    <div class="dspecs"><h2>${t('specs_h')}</h2>
      ${rows ? `<div class="tablewrap"><table class="t kv"><tbody>${rows}</tbody></table></div>` : `<p class="muted">${t('no_specs')}</p>`}
      ${vars ? `<h2 style="margin-top:30px">${t('variants_h')}</h2><div class="tablewrap"><table class="t"><thead><tr><th>${t('th_variant')}</th><th>${t('th_price')}</th></tr></thead><tbody>${vars}</tbody></table></div>` : ''}
      <p class="note">${t('spec_note')}</p></div>`;
  const openForm = (defaultType) => {
    const m = App.modal(`<h2>${esc(p.name)}</h2><div id="mform" style="margin-top:12px"></div>`);
    App.enquiryForm(App.$('#mform', m.el), { productId: p.id, defaultType });
  };
  App.$('#enq').onclick = () => openForm('general');
  App.$('#ride').onclick = () => openForm('test_ride');
}

App.init('bikes', async () => {
  try {
    const all = await App.loadProducts();
    bike = all.find((x) => x.id === Number(new URLSearchParams(location.search).get('id'))) || null;
  } catch (e) { App.toast(e.message, true); }
  render(); App.onLang(render);
});
