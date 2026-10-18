(() => {
  const forms = document.querySelectorAll('form[action^="/api/"]');
  const params = new URLSearchParams(location.search);
  const interests = { consulenza:'Una consulenza su un caso specifico', corsi:'Un corso a catalogo', 'su-misura':'Formazione aziendale su misura' };
  forms.forEach(form => {
    if (form.elements.interesse && interests[params.get('interesse')]) form.elements.interesse.value = interests[params.get('interesse')];
    const course = params.get('corso');
    if (form.elements.interesse && course && /^[A-I]\d{1,2}$/.test(course)) form.elements.messaggio.value = `Vorrei informazioni sul corso ${course}.`;
    // The HTML form also works without JavaScript. Local-only feedback is explicit.
    if (['127.0.0.1','localhost','[::1]'].includes(location.hostname)) {
      const note = document.createElement('p');
      note.className = 'preview-note';
      note.textContent = 'Anteprima locale: puoi provare il modulo. Nessun messaggio viene inviato e nessun dato viene salvato.';
      form.append(note);
    }
    // Antispam: gettone firmato chiesto all'apertura (functions/api/gettone.js).
    const gettone = document.createElement('input');
    gettone.type = 'hidden';
    gettone.name = 'gettone';
    form.append(gettone);
    const chiedi = () => fetch('/api/gettone', { cache: 'no-store' })
      .then(r => r.json()).then(d => { gettone.value = d.gettone || ''; }).catch(() => {});
    const pronto = chiedi();
    form.addEventListener('submit', (evento) => {
      if (!gettone.value && !form.dataset.attesa) {
        evento.preventDefault();
        form.dataset.attesa = '1';
        pronto.then(() => (gettone.value ? null : chiedi())).finally(() => form.submit());
        return;
      }
      const submit = form.querySelector('[type=submit]');
      if (submit) { submit.disabled = true; submit.setAttribute('aria-busy','true'); }
    });
  });
  window.addEventListener('pageshow', () => forms.forEach(form => {
    const submit = form.querySelector('[type=submit]');
    if (submit) { submit.disabled = false; submit.removeAttribute('aria-busy'); }
  }));
})();
