// Pagina dell'area riservata. Non e' un file statico dentro `dist/`: la serve
// la funzione `functions/admin/index.js`, e solo a chi ha superato Cloudflare
// Access. Cosi' chi non e' autorizzato non trova nemmeno la pagina.
//
// ⛔ Niente librerie esterne e nessun CDN: sono le regole del sito, e in piu'
// qui varrebbe doppio, visto che questa pagina puo' cambiare il catalogo.

export const paginaAdmin = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Area riservata · Mens Sana Formazione</title>
<style>
  :root {
    --rosso: #c8202f; --rosso-tenue: #fdf0f1; --nero: #17181c;
    --grigio-900: #24262c; --grigio-700: #4a4d57; --grigio-500: #767a85;
    --grigio-300: #c9ccd3; --grigio-100: #e9ebef; --carta: #fafaf8; --bianco: #fff;
    --verde: #1f7a44;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--carta); color: var(--grigio-900);
    font: 16px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  header.barra {
    position: sticky; top: 0; z-index: 20; background: var(--bianco);
    border-bottom: 1px solid var(--grigio-100); padding: .8rem 1.2rem;
    display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
  }
  .barra h1 { font-size: 1.05rem; margin: 0; }
  .barra .chi { color: var(--grigio-500); font-size: .85rem; }
  .barra .spazio { flex: 1; }
  main { max-width: 60rem; margin: 0 auto; padding: 1.5rem 1.2rem 6rem; }
  h2 { font-size: 1.15rem; margin: 2rem 0 .8rem; }
  .riquadro {
    background: var(--bianco); border: 1px solid var(--grigio-100);
    border-radius: 12px; padding: 1.1rem 1.2rem; margin-bottom: .8rem;
  }
  .campo { margin-bottom: .9rem; }
  .campo > label { display: block; font-weight: 600; font-size: .85rem; margin-bottom: .25rem; }
  .campo .aiuto { font-weight: 400; color: var(--grigio-500); font-size: .78rem; }
  input[type=text], input[type=number], textarea, select {
    width: 100%; padding: .55rem .7rem; border: 1px solid var(--grigio-300);
    border-radius: 8px; font: inherit; background: var(--bianco); color: inherit;
  }
  textarea { resize: vertical; min-height: 5.5rem; }
  input:focus, textarea:focus, select:focus { outline: 2px solid var(--rosso); outline-offset: 1px; border-color: var(--rosso); }
  input[disabled] { background: var(--grigio-100); color: var(--grigio-500); }
  .interruttori { display: flex; gap: 1.2rem; flex-wrap: wrap; margin-bottom: .9rem; }
  .interruttore { display: flex; align-items: center; gap: .45rem; font-size: .9rem; font-weight: 600; }
  .interruttore input { width: 1.1rem; height: 1.1rem; accent-color: var(--rosso); }
  .btn {
    border: 1px solid var(--grigio-300); background: var(--bianco); color: var(--grigio-900);
    padding: .5rem .95rem; border-radius: 999px; font: inherit; font-weight: 600; cursor: pointer;
  }
  .btn:hover { border-color: var(--grigio-500); }
  .btn--rosso { background: var(--rosso); border-color: var(--rosso); color: #fff; }
  .btn--rosso[disabled] { opacity: .5; cursor: default; }
  .btn--piccolo { padding: .28rem .7rem; font-size: .82rem; }
  .btn--togli { color: var(--rosso); border-color: var(--grigio-300); }
  details.corso { background: var(--bianco); border: 1px solid var(--grigio-100); border-radius: 12px; margin-bottom: .6rem; }
  details.corso[open] { border-color: var(--grigio-300); }
  details.corso > summary {
    list-style: none; cursor: pointer; padding: .85rem 1.1rem; display: flex;
    align-items: center; gap: .7rem; font-weight: 700;
  }
  details.corso > summary::-webkit-details-marker { display: none; }
  .corpo { padding: 0 1.1rem 1.1rem; }
  .cod { background: var(--rosso-tenue); color: var(--rosso); border-radius: 6px; padding: .1rem .45rem; font-size: .78rem; }
  .nascosto { color: var(--grigio-500); font-weight: 600; font-size: .78rem; }
  .blocco { border-left: 3px solid var(--grigio-100); padding-left: .8rem; margin-bottom: .8rem; }
  .due { display: grid; gap: .9rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); }
  .stato { font-size: .88rem; font-weight: 600; }
  .stato--ok { color: var(--verde); }
  .stato--errore { color: var(--rosso); }
  .avviso { background: var(--rosso-tenue); border: 1px solid var(--rosso); border-radius: 10px; padding: .8rem 1rem; margin-bottom: 1rem; font-size: .9rem; }
  .avviso ul { margin: .4rem 0 0; padding-left: 1.1rem; }
  .nota { color: var(--grigio-500); font-size: .85rem; }
</style>
</head>
<body>
<header class="barra">
  <h1>Area riservata</h1>
  <span class="chi" id="chi"></span>
  <span class="spazio"></span>
  <span class="stato" id="stato">Carico il catalogo…</span>
  <button class="btn btn--rosso" id="salva" disabled>Salva e pubblica</button>
  <button class="btn" id="esci">Esci</button>
</header>
<main id="contenuto">
  <p class="nota">Un attimo…</p>
</main>

<script>
(function () {
  var dati = null, sha = null, cambiato = false;
  var elContenuto = document.getElementById('contenuto');
  var elStato = document.getElementById('stato');
  var elSalva = document.getElementById('salva');

  function stato(testo, tipo) {
    elStato.textContent = testo;
    elStato.className = 'stato' + (tipo ? ' stato--' + tipo : '');
  }
  function segnaCambiato() {
    cambiato = true;
    elSalva.disabled = false;
    stato('Modifiche non ancora salvate');
  }
  window.addEventListener('beforeunload', function (e) {
    if (cambiato) { e.preventDefault(); e.returnValue = ''; }
  });

  function el(tag, attributi, figli) {
    var n = document.createElement(tag);
    Object.keys(attributi || {}).forEach(function (k) {
      if (k === 'class') n.className = attributi[k];
      else if (k === 'testo') n.textContent = attributi[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attributi[k]);
      else if (attributi[k] === true) n.setAttribute(k, '');
      else if (attributi[k] !== false && attributi[k] != null) n.setAttribute(k, attributi[k]);
    });
    (figli || []).forEach(function (f) { if (f) n.appendChild(f); });
    return n;
  }

  function campo(etichetta, aiuto, controllo) {
    var lab = el('label', { testo: etichetta });
    if (aiuto) lab.appendChild(el('span', { class: 'aiuto', testo: ' · ' + aiuto }));
    return el('div', { class: 'campo' }, [lab, controllo]);
  }

  function testo(oggetto, chiave, etichetta, aiuto, bloccato) {
    var i = el('input', { type: 'text', value: oggetto[chiave] == null ? '' : oggetto[chiave], disabled: !!bloccato });
    i.addEventListener('input', function () { oggetto[chiave] = i.value; segnaCambiato(); });
    return campo(etichetta, aiuto, i);
  }

  function numero(oggetto, chiave, etichetta, aiuto) {
    var i = el('input', { type: 'number', min: '0', step: '10', value: oggetto[chiave] });
    i.addEventListener('input', function () { oggetto[chiave] = i.value === '' ? 0 : Number(i.value); segnaCambiato(); });
    return campo(etichetta, aiuto, i);
  }

  function areaTesto(oggetto, chiave, etichetta, aiuto, righe) {
    var t = el('textarea', { rows: righe || 4 });
    t.value = oggetto[chiave] == null ? '' : oggetto[chiave];
    t.addEventListener('input', function () { oggetto[chiave] = t.value; segnaCambiato(); });
    return campo(etichetta, aiuto, t);
  }

  // Elenchi di frasi: una riga vuota separa un blocco dall'altro non serve,
  // basta una riga per voce. E' il modo piu' semplice da spiegare a voce.
  function elencoTesti(oggetto, chiave, etichetta, aiuto, righe) {
    var t = el('textarea', { rows: righe || 5 });
    t.value = (oggetto[chiave] || []).join('\\n');
    t.addEventListener('input', function () {
      oggetto[chiave] = t.value.split('\\n').map(function (r) { return r.trim(); }).filter(Boolean);
      segnaCambiato();
    });
    return campo(etichetta, aiuto || 'una voce per riga', t);
  }

  function interruttore(oggetto, chiave, etichetta, predefinito) {
    var i = el('input', { type: 'checkbox' });
    i.checked = oggetto[chiave] === undefined ? !!predefinito : !!oggetto[chiave];
    i.addEventListener('change', function () { oggetto[chiave] = i.checked; segnaCambiato(); disegna(); });
    return el('label', { class: 'interruttore' }, [i, el('span', { testo: etichetta })]);
  }

  function elencoBlocchi(contenitore, lista, campi, etichettaAggiungi, nuovo) {
    lista.forEach(function (voce, i) {
      var blocco = el('div', { class: 'blocco' });
      campi.forEach(function (c) {
        blocco.appendChild(c.multiriga ? areaTesto(voce, c.chiave, c.etichetta, c.aiuto, 3)
          : c.elenco ? elencoTesti(voce, c.chiave, c.etichetta, c.aiuto, 4)
          : testo(voce, c.chiave, c.etichetta, c.aiuto));
      });
      blocco.appendChild(el('button', {
        class: 'btn btn--piccolo btn--togli', testo: 'Togli questo blocco',
        onclick: function () { lista.splice(i, 1); segnaCambiato(); disegna(); },
      }));
      contenitore.appendChild(blocco);
    });
    contenitore.appendChild(el('button', {
      class: 'btn btn--piccolo', testo: etichettaAggiungi,
      onclick: function () { lista.push(nuovo()); segnaCambiato(); disegna(); },
    }));
  }

  function schedaCorso(corso, indice) {
    var titolo = el('summary', {}, [
      el('span', { class: 'cod', testo: corso.cod || '—' }),
      el('span', { testo: corso.titolo || 'Corso senza titolo' }),
      corso.pubblicato === false ? el('span', { class: 'nascosto', testo: '· nascosto dal sito' }) : null,
    ]);
    var corpo = el('div', { class: 'corpo' });

    corpo.appendChild(el('div', { class: 'interruttori' }, [
      interruttore(corso, 'pubblicato', 'Visibile sul sito', true),
      interruttore(corso, 'mostraPrezzo', 'Mostra il prezzo', true),
    ]));

    var due = el('div', { class: 'due' }, [
      testo(corso, 'cod', 'Codice', 'es. A1'),
      numero(corso, 'prezzo', 'Prezzo in euro', 'IVA esclusa'),
    ]);
    corpo.appendChild(due);
    corpo.appendChild(testo(corso, 'titolo', 'Titolo del corso'));
    corpo.appendChild(areaTesto(corso, 'sottotitolo', 'Sottotitolo', 'la frase sotto al titolo', 3));

    var aree = el('select');
    Object.keys(dati.nomiAree).forEach(function (sigla) {
      var o = el('option', { value: sigla, testo: sigla + ' · ' + dati.nomiAree[sigla] });
      if (corso.area === sigla) o.selected = true;
      aree.appendChild(o);
    });
    aree.addEventListener('change', function () {
      corso.area = aree.value; corso.areaNome = dati.nomiAree[aree.value]; segnaCambiato();
    });
    corpo.appendChild(campo('Area', null, aree));

    corpo.appendChild(testo(corso, 'slug', 'Indirizzo della pagina',
      'non si cambia: e\\'l\\'indirizzo gia\\' online e nei risultati di Google', !corso.nuovo));

    var due2 = el('div', { class: 'due' }, [
      testo(corso, 'durataVideo', 'Durata e formato'),
      testo(corso, 'durataStudio', 'Studio individuale'),
    ]);
    corpo.appendChild(due2);

    corpo.appendChild(elencoTesti(corso, 'descrizione', 'Descrizione', 'un paragrafo per riga', 6));
    corpo.appendChild(elencoTesti(corso, 'destinatari', 'A chi si rivolge', 'una voce per riga', 5));
    corpo.appendChild(areaTesto(corso, 'plus', 'Nota finale', 'la riga in fondo alla scheda', 3));

    corpo.appendChild(el('h2', { testo: 'Perche\\' iscriversi' }));
    var perche = el('div');
    corso.perche = corso.perche || [];
    elencoBlocchi(perche, corso.perche,
      [{ chiave: 'titolo', etichetta: 'Titolo' }, { chiave: 'testo', etichetta: 'Testo', multiriga: true }],
      'Aggiungi un motivo', function () { return { titolo: '', testo: '' }; });
    corpo.appendChild(perche);

    corpo.appendChild(el('h2', { testo: 'Programma' }));
    var programma = el('div');
    corso.programma = corso.programma || [];
    elencoBlocchi(programma, corso.programma,
      [{ chiave: 'sezione', etichetta: 'Titolo della sezione' }, { chiave: 'voci', etichetta: 'Argomenti', elenco: true }],
      'Aggiungi una sezione', function () { return { sezione: '', voci: [] }; });
    corpo.appendChild(programma);

    corpo.appendChild(el('button', {
      class: 'btn btn--piccolo btn--togli', testo: 'Elimina questo corso',
      onclick: function () {
        if (!confirm('Elimini il corso "' + (corso.titolo || '') + '"? Se vuoi solo toglierlo dal sito, usa invece l\\'interruttore "Visibile sul sito".')) return;
        dati.corsi.splice(indice, 1); segnaCambiato(); disegna();
      },
    }));

    return el('details', { class: 'corso' }, [titolo, corpo]);
  }

  function disegna() {
    var aperti = {};
    elContenuto.querySelectorAll('details.corso').forEach(function (d, i) { aperti[i] = d.open; });
    elContenuto.innerHTML = '';

    var generali = el('div', { class: 'riquadro' }, [
      el('div', { class: 'interruttori' }, [
        interruttore(dati.impostazioni, 'mostraPrezzi', 'Mostra i prezzi dei corsi sul sito', true),
      ]),
      el('p', { class: 'nota', testo: 'Spento, i prezzi spariscono da tutte le pagine e al loro posto compare "Su richiesta". I prezzi restano scritti qui dentro e tornano quando lo riaccendi.' }),
    ]);
    elContenuto.appendChild(el('h2', { testo: 'Impostazioni generali' }));
    elContenuto.appendChild(generali);

    elContenuto.appendChild(el('h2', { testo: 'Corsi (' + dati.corsi.length + ')' }));
    dati.corsi.forEach(function (corso, i) {
      var scheda = schedaCorso(corso, i);
      if (aperti[i]) scheda.open = true;
      elContenuto.appendChild(scheda);
    });
    elContenuto.appendChild(el('button', {
      class: 'btn', testo: 'Aggiungi un corso',
      onclick: function () {
        dati.corsi.push({
          nuovo: true, pubblicato: false, mostraPrezzo: true, cod: '', slug: '',
          area: Object.keys(dati.nomiAree)[0], areaNome: dati.nomiAree[Object.keys(dati.nomiAree)[0]],
          titolo: '', sottotitolo: '', prezzo: 0, durataVideo: '', durataStudio: '',
          descrizione: [], perche: [], destinatari: [], programma: [], plus: '',
        });
        segnaCambiato(); disegna();
      },
    }));

    elContenuto.appendChild(el('h2', { testo: 'Consulenza' }));
    var cons = el('div', { class: 'riquadro' });
    elencoBlocchi(cons, dati.consulenze,
      [{ chiave: 'titolo', etichetta: 'Titolo' }, { chiave: 'testo', etichetta: 'Testo', multiriga: true }],
      'Aggiungi una consulenza', function () { return { titolo: '', testo: '' }; });
    elContenuto.appendChild(cons);

    elContenuto.appendChild(el('h2', { testo: 'Aree su richiesta' }));
    var sr = el('div', { class: 'riquadro' });
    elencoBlocchi(sr, dati.areeSuRichiesta,
      [{ chiave: 'sigla', etichetta: 'Sigla' }, { chiave: 'nome', etichetta: 'Nome dell\\'area' }],
      'Aggiungi un\\'area', function () { return { sigla: '', nome: '' }; });
    elContenuto.appendChild(sr);
  }

  function mostraErrori(messaggio, dettagli) {
    var box = el('div', { class: 'avviso' }, [el('strong', { testo: messaggio })]);
    if (dettagli && dettagli.length) {
      var ul = el('ul');
      dettagli.forEach(function (d) { ul.appendChild(el('li', { testo: d })); });
      box.appendChild(ul);
    }
    elContenuto.prepend(box);
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  elSalva.addEventListener('click', function () {
    elSalva.disabled = true;
    stato('Salvo…');
    var pulito = JSON.parse(JSON.stringify(dati));
    pulito.corsi.forEach(function (c) { delete c.nuovo; });
    fetch('/api/admin/catalogo', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ dati: pulito, sha: sha }),
    }).then(function (r) {
      return r.json().then(function (j) { return { ok: r.ok, j: j }; });
    }).then(function (res) {
      if (!res.ok) {
        stato('Non salvato', 'errore');
        elSalva.disabled = false;
        mostraErrori(res.j.errore || 'Errore', res.j.dettagli);
        return;
      }
      sha = res.j.sha;
      cambiato = false;
      dati.corsi.forEach(function (c) { delete c.nuovo; });
      stato('Salvato. Il sito si aggiorna da solo entro un paio di minuti.', 'ok');
    }).catch(function () {
      stato('Non salvato', 'errore');
      elSalva.disabled = false;
      mostraErrori('Non sono riuscito a contattare il server. Riprova.');
    });
  });

  document.getElementById('esci').addEventListener('click', function () {
    if (cambiato && !confirm('Hai modifiche non salvate. Esci lo stesso?')) return;
    cambiato = false;
    fetch('/admin/esci', { method: 'POST' }).then(function () { window.location.reload(); });
  });

  fetch('/api/admin/catalogo').then(function (r) {
    return r.json().then(function (j) { return { ok: r.ok, j: j }; });
  }).then(function (res) {
    if (!res.ok) {
      stato('Non accessibile', 'errore');
      elContenuto.innerHTML = '';
      mostraErrori(res.j.errore || 'Accesso negato');
      return;
    }
    dati = res.j.dati; sha = res.j.sha;
    document.getElementById('chi').textContent = res.j.email || '';
    stato('Catalogo caricato');
    disegna();
  }).catch(function () {
    stato('Non accessibile', 'errore');
    elContenuto.innerHTML = '';
    mostraErrori('Non sono riuscito a caricare il catalogo.');
  });
})();
</script>
</body>
</html>`;
