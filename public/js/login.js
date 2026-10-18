App.add({
  en: { welcome: 'Welcome', sub: 'Log in to track your requests and save your favourite bikes.',
        t_login: 'Login', t_register: 'Create account', f_pass: 'Password', f_email: 'Email (optional)', f_pass_new: 'Password (min 8 characters)' },
  gu: { welcome: 'સ્વાગત છે', sub: 'તમારી વિનંતીઓ ટ્રૅક કરવા અને મનપસંદ બાઇક સાચવવા લૉગિન કરો.',
        t_login: 'લૉગિન', t_register: 'એકાઉન્ટ બનાવો', f_pass: 'પાસવર્ડ', f_email: 'ઇમેઇલ (વૈકલ્પિક)', f_pass_new: 'પાસવર્ડ (ઓછામાં ઓછા 8 અક્ષર)' },
});

function afterLogin(user) {
  const next = new URLSearchParams(location.search).get('next');
  const safe = next && /^\/[^/\\]/.test(next) ? next : null;
  location.href = safe || (user.role === 'admin' ? '/admin.html' : '/dashboard.html');
}

function wire(form, path) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = App.$('.err', form), btn = App.$('button[type=submit]', form);
    err.hidden = true; btn.disabled = true;
    try {
      const r = await App.api(path, { method: 'POST', body: Object.fromEntries(new FormData(form)) });
      afterLogin(r.user);
    } catch (ex) { err.textContent = ex.message; err.hidden = false; btn.disabled = false; }
  });
}

App.init('login', async () => {
  if (App.user) return afterLogin(App.user);
  const lf = App.$('#loginForm'), rf = App.$('#regForm');
  wire(lf, '/auth/login'); wire(rf, '/auth/register');
  App.$$('.tab').forEach((t) => t.addEventListener('click', () => {
    App.$$('.tab').forEach((x) => x.classList.toggle('on', x === t));
    const reg = t.dataset.tab === 'register';
    lf.hidden = reg; rf.hidden = !reg;
  }));
  if (location.hash === '#register') App.$('[data-tab=register]').click();
});
