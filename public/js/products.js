App.add({
  en: { pg_title: 'Our Bikes & Scooters', pg_sub: "Tap any bike for details, then enquire about today's price and offers.",
        all: 'All', search: 'Search bikes…', none: 'No bikes found.' },
  gu: { pg_title: 'અમારી બાઇક્સ અને સ્કૂટર', pg_sub: 'વિગતો માટે કોઈપણ બાઇક પર ટેપ કરો, પછી આજની કિંમત અને ઑફર વિશે પૂછપરછ કરો.',
        all: 'બધી', search: 'બાઇક શોધો…', none: 'કોઈ બાઇક મળી નથી.' },
});

let cat = '';
function render() {
  const q = App.$('#q').value.trim().toLowerCase();
  const list = (App.products || []).filter((p) => (!cat || p.category === cat) && (!q || p.name.toLowerCase().includes(q)));
  App.$('#grid').innerHTML = list.map(App.card).join('');
  App.$('#empty').hidden = list.length > 0;
  const chips = App.$$('#chips .chip');
  chips[0].textContent = App.t('all'); chips[1].textContent = App.t('motorcycle'); chips[2].textContent = App.t('scooter');
}

App.init('bikes', async () => {
  try { await App.loadProducts(); } catch (e) { App.toast(e.message, true); }
  App.bindCards(App.$('#grid'));
  App.$('#chips').addEventListener('click', (e) => {
    const c = e.target.closest('.chip'); if (!c) return;
    App.$$('#chips .chip').forEach((x) => x.classList.toggle('on', x === c));
    cat = c.dataset.cat; render();
  });
  App.$('#q').addEventListener('input', render);
  render(); App.onLang(render);
});
