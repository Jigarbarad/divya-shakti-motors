// Owner-only login: the server accepts admin accounts only.
function wire(form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = App.$('.err', form), btn = App.$('button[type=submit]', form);
    err.hidden = true; btn.disabled = true;
    try {
      await App.api('/auth/login', { method: 'POST', body: Object.fromEntries(new FormData(form)) });
      location.href = '/admin.html';
    } catch (ex) { err.textContent = ex.message; err.hidden = false; btn.disabled = false; }
  });
}

App.init('login', async () => {
  if (App.user && App.user.role === 'admin') { location.href = '/admin.html'; return; }
  wire(App.$('#loginForm'));
});
