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
  /* Stessa palette e stessi caratteri del sito (complete.css, Base.astro). */
  @font-face { font-family: 'Inter'; src: url('/assets/inter-latin.woff2') format('woff2'); font-weight: 100 900; font-display: swap; }
  @font-face { font-family: 'Fraunces'; src: url('/assets/fraunces-latin.woff2') format('woff2'); font-weight: 100 900; font-display: swap; }
  :root {
    --rosso: #bb2531; --rosso-tenue: #f8e9ea; --nero: #242a26;
    --grigio-900: #242a26; --grigio-700: #4b5049; --grigio-500: #666a62;
    --grigio-300: #cfd1c8; --grigio-100: #e6e5dd; --carta: #f7f6f2; --bianco: #fffefb;
    --verde: #2e6b45; --giallo: #f2cd48;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--carta); color: var(--grigio-900);
    font: 16px/1.55 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  header.barra {
    position: sticky; top: 0; z-index: 20; background: var(--bianco);
    border-bottom: 1px solid var(--grigio-100); padding: .8rem 1.2rem;
    display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
  }
  .barra h1 { font-size: 1.05rem; margin: 0; letter-spacing: .02em; }
  .barra h1::before { content: ''; display: inline-block; width: .55rem; height: .55rem; border-radius: 50%; background: var(--rosso); margin-right: .5rem; vertical-align: middle; }
  .barra .chi { color: var(--grigio-500); font-size: .85rem; }
  .barra .spazio { flex: 1; }
  .impianto { max-width: 64rem; margin: 0 auto; padding: 1.5rem 1.2rem 6rem; }
  .tessere { display: grid; gap: .9rem; grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr)); margin-bottom: 1.6rem; }
  .tessera { all: unset; box-sizing: border-box; cursor: pointer; display: flex; flex-direction: column; gap: .5rem; min-height: 8.5rem; padding: 1.1rem 1.2rem; background: var(--bianco); border: 1px solid var(--grigio-100); border-radius: 14px; box-shadow: 0 6px 18px -14px rgba(0,0,0,.35); transition: transform .15s, border-color .15s; }
  .tessera:hover, .tessera:focus-visible { transform: translateY(-2px); border-color: var(--rosso); }
  .tessera .sigla-g { width: 2.4rem; height: 2.4rem; border-radius: 10px; display: grid; place-items: center; background: var(--rosso-tenue); color: var(--rosso); font-weight: 800; font-size: 1.1rem; }
  .tessera strong { font-size: 1.05rem; line-height: 1.25; }
  .tessera .dettaglio { margin-top: auto; font-size: .84rem; color: var(--grigio-500); }
  .tessera .dettaglio b { color: #8a5a00; }
  .tessera--offerta { background: var(--giallo); border-color: #dcb43a; }
  .tessera--offerta .sigla-g { background: var(--rosso); color: #fff; }
  .tessera--offerta .dettaglio { color: var(--grigio-900); }
  .indietro { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: .4rem; font-weight: 700; font-size: .95rem; padding: .55rem .9rem; border-radius: 999px; background: var(--bianco); border: 1px solid var(--grigio-300); margin-bottom: 1.2rem; }
  .indietro:hover { border-color: var(--rosso); color: var(--rosso); }
  .tessera--nuovo { border-style: dashed; border-color: var(--grigio-300); background: transparent; box-shadow: none; }
  .tessera--nuovo .sigla-g { background: var(--nero); color: #fff; }
  details.corso.corso--pagina > summary { display: none; }
  details.corso.corso--pagina .corpo { padding-top: 1.1rem; }
  .passo { background: var(--bianco); border: 1px solid var(--grigio-100); border-radius: 14px; padding: 1.1rem 1.2rem .4rem; margin-bottom: 1rem; }
  .passo__testa { display: flex; align-items: baseline; gap: .8rem; flex-wrap: wrap; }
  .passo__numero { font-size: .75rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--rosso); }
  .passo h3 { margin: 0; font-size: 1.15rem; }
  .passo__spiega { margin: .35rem 0 .9rem; color: var(--grigio-700); font-size: .9rem; }
  details.corso.corso--pagina { background: transparent; border: 0; }
  details.corso.corso--pagina .corpo { padding: 0; }
  .fine-scheda { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; margin-top: 1rem; }
  .saluto { display: flex; align-items: center; gap: 1.2rem; flex-wrap: wrap; margin: .5rem 0 1rem; }
  .saluto__logo { height: 3.4rem; width: auto; }
  .saluto__titolo { flex-basis: 100%; margin: .4rem 0 0; font-family: 'Fraunces', Georgia, serif; font-style: italic; font-size: clamp(2.6rem, 6vw, 4rem); line-height: 1; letter-spacing: -.03em; color: var(--rosso); font-weight: 600; }
  .saluto__sotto { flex-basis: 100%; margin: 0; font-size: 1.15rem; color: var(--grigio-700); }
  .tre-passi { list-style: none; padding: 0; margin: 0 0 1.6rem; display: flex; gap: .6rem; flex-wrap: wrap; }
  .tre-passi li { display: flex; align-items: center; gap: .5rem; background: var(--bianco); border: 1px solid var(--grigio-100); border-radius: 999px; padding: .4rem .9rem .4rem .45rem; font-size: .9rem; font-weight: 600; }
  .tre-passi b { width: 1.6rem; height: 1.6rem; border-radius: 50%; display: grid; place-items: center; background: var(--rosso); color: #fff; font-size: .82rem; }
  .sezione-titolo { font-size: 1.05rem; text-transform: uppercase; letter-spacing: .06em; color: var(--grigio-700); }
  .percorso { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; margin-bottom: 1.2rem; font-size: .95rem; }
  .percorso__link { all: unset; cursor: pointer; font-weight: 700; padding: .45rem .85rem; border-radius: 999px; background: var(--bianco); border: 1px solid var(--grigio-300); }
  .percorso__link:hover { border-color: var(--rosso); color: var(--rosso); }
  .percorso__sep { color: var(--grigio-500); }
  .percorso__qui { font-weight: 700; color: var(--grigio-700); }
  .etichetta-offerta { display: inline-block; margin-top: .35rem; background: var(--rosso); color: #fff; font-size: .72rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; padding: .15rem .5rem; border-radius: 4px; }
  .tessera--offerta .dettaglio b { color: var(--nero); }
  .benvenuto { font-size: 1.05rem; color: var(--grigio-700); margin: 0 0 1.2rem; }
  main { min-width: 0; }
  nav.menu { position: sticky; top: 4.6rem; align-self: start; display: flex; flex-direction: column; gap: .2rem; }
  nav.menu .gruppo { font-size: .72rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--grigio-500); margin: 1rem .6rem .3rem; }
  nav.menu button { all: unset; cursor: pointer; display: flex; align-items: center; gap: .5rem; padding: .55rem .7rem; border-radius: 10px; font-size: .9rem; font-weight: 600; color: var(--grigio-900); }
  nav.menu button:hover { background: var(--grigio-100); }
  nav.menu button[aria-current="true"] { background: var(--nero); color: #fff; }
  nav.menu .sigla { width: 1.6rem; height: 1.6rem; border-radius: 6px; display: inline-grid; place-items: center; background: var(--rosso-tenue); color: var(--rosso); font-size: .78rem; flex: none; }
  nav.menu button[aria-current="true"] .sigla { background: var(--rosso); color: #fff; }
  nav.menu .conta { margin-left: auto; font-size: .75rem; color: var(--grigio-500); font-weight: 600; }
  nav.menu button[aria-current="true"] .conta { color: var(--grigio-300); }
  nav.menu .pallino { width: .5rem; height: .5rem; border-radius: 50%; background: #e0a100; flex: none; }
  .intestazione { display: flex; align-items: baseline; gap: .8rem; flex-wrap: wrap; margin: 0 0 1rem; }
  .intestazione h2 { margin: 0; font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 1.9rem; letter-spacing: -.02em; }
  @media (max-width: 52rem) {
    .impianto { grid-template-columns: 1fr; }
    nav.menu { position: static; flex-direction: row; overflow-x: auto; gap: .3rem; padding-bottom: .4rem; }
    nav.menu .gruppo { display: none; }
    nav.menu button { white-space: nowrap; }
  }
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
  .da-fare { margin-left: auto; color: #8a5a00; background: #fff4d6; border-radius: 6px; padding: .1rem .5rem; font-weight: 600; font-size: .74rem; }
  h3.area-titolo { font-size: .95rem; margin: 1.4rem 0 .5rem; color: var(--grigio-700); }
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
<div class="impianto">
<nav id="menu" aria-label="Navigazione"></nav>
<main id="contenuto">
  <p class="nota">Un attimo…</p>
</main>
</div>

<script>
(function () {
  var dati = null, sha = null, promo = null, promoSha = null, cambiato = false;
  var elContenuto = document.getElementById('contenuto');
  var elMenu = document.getElementById('menu');
  var vista = (location.hash || '#inizio').slice(1);
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
    var i = el('input', { type: 'number', min: '0', step: '10', value: oggetto[chiave] == null ? '' : oggetto[chiave] });
    i.addEventListener('input', function () { oggetto[chiave] = i.value === '' ? null : Number(i.value); segnaCambiato(); });
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

  // Descrizione: un paragrafo per riga; le righe che cominciano con "- " formano un elenco puntato.
  function descrizione(corso) {
    var t = el('textarea', { rows: 8 });
    var righe = [];
    (corso.descrizione || []).forEach(function (x) {
      if (x && typeof x === 'object' && Array.isArray(x.elenco)) x.elenco.forEach(function (v) { righe.push('- ' + v); });
      else righe.push(String(x == null ? '' : x));
    });
    t.value = righe.join('\\n');
    t.addEventListener('input', function () {
      var out = [];
      t.value.split('\\n').map(function (r) { return r.trim(); }).filter(Boolean).forEach(function (r) {
        if (r.slice(0, 2) === '- ') {
          var ultimo = out[out.length - 1];
          if (ultimo && typeof ultimo === 'object') ultimo.elenco.push(r.slice(2).trim());
          else out.push({ elenco: [r.slice(2).trim()] });
        } else out.push(r);
      });
      corso.descrizione = out; segnaCambiato();
    });
    return campo('Descrizione', 'un paragrafo per riga; le righe che iniziano con "- " diventano un elenco puntato', t);
  }

  // Quante sezioni del corso sono ancora vuote: si vede nel titolo, cosi' le schede da completare saltano all'occhio.
  function mancanti(corso) {
    var m = [];
    if (!corso.sottotitolo) m.push('sottotitolo');
    if (!(corso.descrizione || []).length) m.push('descrizione');
    if (!(corso.destinatari || []).filter(Boolean).length) m.push('a chi si rivolge');
    if (!(corso.perche || []).filter(function (p) { return p.titolo || p.testo; }).length) m.push('perché iscriversi');
    if (!(corso.programma || []).filter(function (p) { return p.sezione || (p.voci || []).length; }).length) m.push('programma');
    return m;
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

  // Indirizzo della pagina ricavato da codice e titolo (solo per i corsi nuovi).
  function indirizzo(corso) {
    return ((corso.cod || '') + ' ' + (corso.titolo || '')).toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').split('-').slice(0, 7).join('-');
  }

  // Un passo della scheda guidata: numero, titolo, cosa scrivere, campi.
  function passo(n, tot, titolo, spiegazione, figli) {
    return el('section', { class: 'passo' }, [
      el('div', { class: 'passo__testa' }, [el('span', { class: 'passo__numero', testo: 'Passo ' + n + ' di ' + tot }), el('h3', { testo: titolo })]),
      spiegazione ? el('p', { class: 'passo__spiega', testo: spiegazione }) : null,
    ].concat(figli));
  }

  function schedaCorso(corso, indice) {
    var titolo = el('summary', {}, [
      el('span', { class: 'cod', testo: corso.cod || '—' }),
      el('span', { testo: corso.titolo || 'Corso senza titolo' }),
    ]);
    var corpo = el('div', { class: 'corpo' });
    var T = promo ? 9 : 8;

    // 1. Sul sito
    corpo.appendChild(passo(1, T, 'Sul sito', 'Decidi se il corso si vede sul sito e se mostrare il suo prezzo di listino.', [
      el('div', { class: 'interruttori' }, [
        interruttore(corso, 'pubblicato', 'Visibile sul sito', true),
        interruttore(corso, 'mostraPrezzo', 'Mostra il prezzo', true),
      ]),
    ]));

    // Offerta del corso (al posto della sezione Offerta separata)
    if (promo) {
      var st = corso.cod ? statoOfferta(corso.cod) : 'no';
      var sel = el('select', { disabled: !corso.cod });
      [['no', 'No, prezzo normale'], ['offerta', 'Sì, è in offerta'], ['esaurito', 'Era in offerta, posti esauriti']].forEach(function (o) {
        var opt = el('option', { value: o[0], testo: o[1] }); if (o[0] === st) opt.selected = true; sel.appendChild(opt);
      });
      sel.addEventListener('change', function () { cambiaStato(corso, sel.value); });
      var figliOfferta = [campo('Questo corso è in offerta?', corso.cod ? null : 'prima scrivi il codice del corso', sel)];
      if (st === 'offerta') {
        var v = promo.corsi[corso.cod];
        figliOfferta.push(el('div', { class: 'due' }, [
          numero(v, 'listino', 'Prezzo pieno', 'euro, IVA esclusa: compare barrato'),
          numero(v, 'prezzo', 'Prezzo in offerta', 'euro, IVA esclusa'),
        ]));
        figliOfferta.push(testo(v, 'breve', 'Nome breve', 'come compare nella fascia della home'));
        figliOfferta.push(testo(v, 'durata', 'Durata'));
        figliOfferta.push(elencoTesti(v, 'edizioni', 'Date delle edizioni', 'una per riga, es. 20 e 27 gennaio 2027, ore 14-18 (due mercoledì)', 3));
      } else if (st === 'esaurito') {
        var w = promo.vetrinaEsaurite[corso.cod] = promo.vetrinaEsaurite[corso.cod] || { breve: corso.titolo || '', listino: null, prezzo: null };
        figliOfferta.push(el('div', { class: 'due' }, [
          numero(w, 'listino', 'Prezzo pieno mostrato', 'barrato'),
          numero(w, 'prezzo', 'Prezzo in offerta mostrato', 'vuoto = solo "In offerta"'),
        ]));
        figliOfferta.push(testo(w, 'breve', 'Nome breve', 'come compare nella fascia della home'));
        figliOfferta.push(areaTesto(promo.esaurite, corso.cod, 'Frase dentro la scheda', 'compare sotto la scritta POSTI ESAURITI', 3));
      }
      corpo.appendChild(passo(2, T, 'Offerta', 'Se scegli "Sì", sul sito il corso diventa giallo con il bollino dello sconto e il prezzo barrato, e anche la sua area diventa gialla. "Posti esauriti" lo lascia giallo, ma dentro la scheda dice che i posti sono finiti.', figliOfferta));
    }

    // 2. Dati principali
    var aree = el('select');
    Object.keys(dati.nomiAree).forEach(function (sigla) {
      var o = el('option', { value: sigla, testo: sigla + ' · ' + dati.nomiAree[sigla] });
      if (corso.area === sigla) o.selected = true;
      aree.appendChild(o);
    });
    aree.addEventListener('change', function () { corso.area = aree.value; corso.areaNome = dati.nomiAree[aree.value]; segnaCambiato(); });
    var campoCod = testo(corso, 'cod', 'Codice', 'lettera dell’area e numero, es. D4');
    var campoTit = testo(corso, 'titolo', 'Titolo del corso');
    var campoSlug = testo(corso, 'slug', 'Indirizzo della pagina',
      corso.nuovo ? 'si compila da solo dal codice e dal titolo' : 'non si cambia: è l’indirizzo già online e nei risultati di Google', !corso.nuovo);
    if (corso.nuovo) {
      var aggiorna = function () { corso.slug = indirizzo(corso); campoSlug.querySelector('input').value = corso.slug; };
      campoCod.querySelector('input').addEventListener('input', aggiorna);
      campoTit.querySelector('input').addEventListener('input', aggiorna);
    }
    corpo.appendChild(passo(2 + (promo ? 1 : 0), T, 'Dati principali', 'Il codice e il titolo compaiono ovunque sul sito. Il prezzo è IVA esclusa: lascialo vuoto se il corso è "su richiesta".', [
      el('div', { class: 'due' }, [campoCod, numero(corso, 'prezzo', 'Prezzo di listino in euro', 'IVA esclusa, vuoto = su richiesta')]),
      campoTit, campo('Area', null, aree), campoSlug,
    ]));

    // 3. Presentazione
    corpo.appendChild(passo(3 + (promo ? 1 : 0), T, 'Presentazione', 'La frase sotto al titolo e la durata. Per i corsi su Teams scrivi la durata così: "8 ore online su Microsoft Teams".', [
      areaTesto(corso, 'sottotitolo', 'Sottotitolo', 'una o due frasi', 3),
      el('div', { class: 'due' }, [testo(corso, 'durataVideo', 'Durata e formato'), testo(corso, 'durataStudio', 'Studio individuale', 'facoltativo, di solito vuoto')]),
    ]));

    // 4. Descrizione
    corpo.appendChild(passo(4 + (promo ? 1 : 0), T, 'Descrizione', 'Di cosa parla il corso. Un paragrafo per riga. Per un elenco puntato, inizia la riga con un trattino e uno spazio: "- ".', [descrizione(corso)]));

    // 5. A chi si rivolge
    corpo.appendChild(passo(5 + (promo ? 1 : 0), T, 'A chi si rivolge', 'Una figura per riga, per esempio: Uffici legali, Responsabili HR, Imprenditori.', [
      elencoTesti(corso, 'destinatari', 'Destinatari', 'una voce per riga', 5),
    ]));

    // 6. Perché iscriversi
    var perche = el('div');
    corso.perche = corso.perche || [];
    while (corso.perche.length < 3) corso.perche.push({ titolo: '', testo: '' });
    elencoBlocchi(perche, corso.perche,
      [{ chiave: 'titolo', etichetta: 'Titolo del motivo' }, { chiave: 'testo', etichetta: 'Spiegazione', multiriga: true }],
      'Aggiungi un motivo', function () { return { titolo: '', testo: '' }; });
    corpo.appendChild(passo(6 + (promo ? 1 : 0), T, 'Perché iscriversi', 'Tre motivi concreti: un titolo breve e due righe di spiegazione ciascuno. I riquadri lasciati vuoti non vengono pubblicati.', [perche]));

    // 7. Programma
    var programma = el('div');
    corso.programma = corso.programma || [];
    if (!corso.programma.length) corso.programma.push({ sezione: '', voci: [] });
    elencoBlocchi(programma, corso.programma,
      [{ chiave: 'sezione', etichetta: 'Titolo del modulo' }, { chiave: 'voci', etichetta: 'Argomenti del modulo', elenco: true }],
      'Aggiungi un modulo', function () { return { sezione: '', voci: [] }; });
    corpo.appendChild(passo(7 + (promo ? 1 : 0), T, 'Programma', 'Un riquadro per ogni modulo: il titolo e gli argomenti, uno per riga.', [programma]));

    // 8. Nota finale
    corpo.appendChild(passo(8 + (promo ? 1 : 0), T, 'Nota finale', 'Facoltativa: una riga che compare in fondo alla scheda, per esempio sul materiale o sull’attestato.', [
      areaTesto(corso, 'plus', 'Nota finale', null, 3),
    ]));

    corpo.appendChild(el('div', { class: 'fine-scheda' }, [
      el('p', { class: 'nota', testo: 'Hai finito? Premi "Salva e pubblica" in alto a destra.' }),
      el('button', {
        class: 'btn btn--piccolo btn--togli', testo: 'Elimina questo corso',
        onclick: function () {
          if (!confirm('Elimini il corso "' + (corso.titolo || '') + '"? Se vuoi solo toglierlo dal sito, spegni invece "Visibile sul sito".')) return;
          var suaArea = corso.area; dati.corsi.splice(indice, 1); segnaCambiato(); vai('area-' + suaArea);
        },
      }),
    ]));

    return el('details', { class: 'corso', 'data-i': String(indice) }, [titolo, corpo]);
  }


  // ---------------------------------------------------------------- Offerta
  // Riquadri gialli, bollini, prezzi in promozione e "posti esauriti" escono tutti
  // da qui (src/data/promozione.json): accendere o spegnere un corso basta.
  function statoOfferta(cod) {
    if (promo.corsi && promo.corsi[cod]) return 'offerta';
    if (promo.esaurite && promo.esaurite[cod]) return 'esaurito';
    return 'no';
  }
  function cambiaStato(corso, nuovo) {
    var cod = corso.cod;
    promo.corsi = promo.corsi || {}; promo.esaurite = promo.esaurite || {}; promo.vetrinaEsaurite = promo.vetrinaEsaurite || {};
    var prima = promo.corsi[cod] || promo.vetrinaEsaurite[cod] || {};
    delete promo.corsi[cod]; delete promo.esaurite[cod]; delete promo.vetrinaEsaurite[cod];
    if (nuovo === 'offerta') {
      promo.corsi[cod] = { breve: prima.breve || corso.titolo || '', durata: prima.durata || '8 ore, in 2 mezze giornate da 4 ore',
        listino: prima.listino || null, prezzo: prima.prezzo || null, edizioni: prima.edizioni || [] };
    } else if (nuovo === 'esaurito') {
      promo.esaurite[cod] = 'L\\'offerta su questo corso non è più valida: è stato raggiunto il numero massimo di partecipanti per ciascuna classe.';
      promo.vetrinaEsaurite[cod] = { breve: prima.breve || corso.titolo || '', listino: prima.listino || null, prezzo: prima.prezzo || null };
    }
    segnaCambiato(); disegna();
  }
  function disegnaOfferta() {
    var box = el('div', { class: 'riquadro' });
    box.appendChild(el('div', { class: 'interruttori' }, [
      interruttore(promo, 'attiva', 'Offerta attiva sul sito', false),
      interruttore(promo, 'moduloIscrizione', 'Modulo di iscrizione nelle schede corso', true),
    ]));
    box.appendChild(el('p', { class: 'nota', testo: 'Spenta, spariscono in un colpo riquadri gialli, bollini, prezzi in offerta, avvisi di posti esauriti e la fascia in home. Tutto resta scritto qui e torna quando la riaccendi.' }));
    box.appendChild(testo(promo, 'scadenza', 'Scadenza delle iscrizioni in offerta', 'scritta come 31/12/2026: si aggiorna da sola in tutto il sito'));
    box.appendChild(areaTesto(promo, 'fascia', 'Frase della fascia in home', 'quando e come si svolgono i corsi; il resto della fascia si scrive da solo', 2));
    box.appendChild(elencoTesti(promo, 'condizioni', 'Condizioni dell’offerta', 'compaiono nella scheda di ogni corso in offerta, una per riga', 4));
    elContenuto.appendChild(box);

    var lista = el('div', { class: 'riquadro' });
    lista.appendChild(el('p', { class: 'nota', testo: 'Per ogni corso: "In offerta" lo mette in giallo con bollino e prezzo; "Posti esauriti" lo lascia giallo da fuori, ma dentro la scheda dice che i posti sono finiti.' }));
    var liberi = dati.corsi.filter(function (c) { return c.cod && statoOfferta(c.cod) === 'no'; });
    if (liberi.length) {
      var agg = el('select');
      agg.appendChild(el('option', { value: '', testo: 'Scegli un corso…' }));
      liberi.forEach(function (c) { agg.appendChild(el('option', { value: c.cod, testo: c.cod + ' · ' + (c.titolo || '') })); });
      agg.addEventListener('change', function () {
        var c = dati.corsi.find(function (x) { return x.cod === agg.value; }); if (c) cambiaStato(c, 'offerta');
      });
      lista.appendChild(campo('Metti in offerta un altro corso', null, agg));
    }
    dati.corsi.filter(function (c) { return c.cod && statoOfferta(c.cod) !== 'no'; }).forEach(function (corso) {
      var st = statoOfferta(corso.cod);
      var sel = el('select');
      [['no', 'Togli dall\\'offerta'], ['offerta', 'In offerta'], ['esaurito', 'Posti esauriti']].forEach(function (o) {
        var opt = el('option', { value: o[0], testo: o[1] }); if (o[0] === st) opt.selected = true; sel.appendChild(opt);
      });
      sel.addEventListener('change', function () { cambiaStato(corso, sel.value); });
      var riga = el('div', { class: 'blocco' }, [campo(corso.cod + ' · ' + (corso.titolo || ''), null, sel)]);
      if (st === 'offerta') {
        var v = promo.corsi[corso.cod];
        riga.appendChild(testo(v, 'breve', 'Nome breve', 'quello della fascia in home'));
        riga.appendChild(el('div', { class: 'due' }, [
          numero(v, 'listino', 'Prezzo di listino', 'euro, IVA esclusa, compare barrato'),
          numero(v, 'prezzo', 'Prezzo in offerta', 'euro, IVA esclusa'),
        ]));
        riga.appendChild(testo(v, 'durata', 'Durata'));
        riga.appendChild(elencoTesti(v, 'edizioni', 'Date delle edizioni', 'una per riga, es. 20 e 27 gennaio 2027, ore 14-18 (due mercoledì)', 3));
      } else if (st === 'esaurito') {
        var w = promo.vetrinaEsaurite[corso.cod] = promo.vetrinaEsaurite[corso.cod] || { breve: corso.titolo || '', listino: null, prezzo: null };
        riga.appendChild(testo(w, 'breve', 'Nome breve', 'quello della fascia in home'));
        riga.appendChild(el('div', { class: 'due' }, [
          numero(w, 'listino', 'Prezzo di listino mostrato', 'barrato'),
          numero(w, 'prezzo', 'Prezzo in offerta mostrato', 'vuoto = solo "In offerta"'),
        ]));
        riga.appendChild(areaTesto(promo.esaurite, corso.cod, 'Frase dentro la scheda', 'sotto la scritta POSTI ESAURITI', 3));
      }
      lista.appendChild(riga);
    });
    elContenuto.appendChild(lista);
  }

  function vai(v) { vista = v; history.replaceState(null, '', '#' + v); disegna(); window.scrollTo(0, 0); }

  function voceMenu(v, figli) {
    var b = el('button', { type: 'button', 'aria-current': vista === v ? 'true' : 'false', onclick: function () { vai(v); } }, figli);
    return b;
  }

  function disegnaMenu() {
    elMenu.innerHTML = '';
    if (vista === 'inizio') return;
    var pezzi = [{ v: 'inizio', t: 'Pagina iniziale' }];
    if (vista.slice(0, 5) === 'area-') pezzi.push({ t: 'Area ' + vista.slice(5) + ' · ' + dati.nomiAree[vista.slice(5)] });
    if (vista.slice(0, 6) === 'corso-') {
      var c = dati.corsi[Number(vista.slice(6))] || {};
      var ar = Object.prototype.hasOwnProperty.call(dati.nomiAree, c.area) ? c.area : Object.keys(dati.nomiAree)[0];
      pezzi.push({ v: 'area-' + ar, t: 'Area ' + ar + ' · ' + dati.nomiAree[ar] });
      pezzi.push({ t: c.cod || 'Nuovo corso' });
    }
    if (vista === 'offerta') pezzi.push({ t: 'Offerta' });
    if (vista === 'consulenza') pezzi.push({ t: 'Consulenza' });
    if (vista === 'impostazioni') pezzi.push({ t: 'Impostazioni' });
    var nav = el('div', { class: 'percorso' });
    pezzi.forEach(function (x, k) {
      if (k) nav.appendChild(el('span', { class: 'percorso__sep', testo: '›' }));
      nav.appendChild(x.v ? el('button', { type: 'button', class: 'percorso__link', testo: (k === 0 ? '← ' : '') + x.t, onclick: function () { vai(x.v); } })
        : el('span', { class: 'percorso__qui', testo: x.t }));
    });
    elMenu.appendChild(nav);
  }

  function tessera(v, sigla, titolo, dettaglio, classe) {
    return el('button', { type: 'button', class: 'tessera' + (classe ? ' ' + classe : ''), onclick: function () { vai(v); } },
      [el('span', { class: 'sigla-g', testo: sigla }), el('strong', { testo: titolo }), dettaglio]);
  }

  function disegnaInizio() {
    elContenuto.appendChild(el('div', { class: 'saluto' }, [
      el('img', { src: '/logo.png', alt: 'Mens Sana Formazione', class: 'saluto__logo' }),
      el('h2', { class: 'saluto__titolo', testo: 'Ciao Ory!' }),
      el('p', { class: 'saluto__sotto', testo: 'Qui sotto trovi le aree dei corsi. Scegli dove entrare.' }),
    ]));
    elContenuto.appendChild(el('ol', { class: 'tre-passi' }, [
      el('li', {}, [el('b', { testo: '1' }), el('span', { testo: 'Clicca l’area' })]),
      el('li', {}, [el('b', { testo: '2' }), el('span', { testo: 'Clicca il corso' })]),
      el('li', {}, [el('b', { testo: '3' }), el('span', { testo: 'Modifica e premi "Salva e pubblica"' })]),
    ]));
    elContenuto.appendChild(el('h2', { class: 'sezione-titolo', testo: 'Le aree dei corsi' }));
    var t2 = el('div', { class: 'tessere' });
    Object.keys(dati.nomiAree).forEach(function (sigla) {
      var corsi = dati.corsi.filter(function (c) { return c.area === sigla; });
      var daFare = corsi.filter(function (c) { return mancanti(c).length; }).length;
      var det = el('span', { class: 'dettaglio' }, [document.createTextNode(corsi.length + (corsi.length === 1 ? ' corso' : ' corsi'))]);
      if (daFare) { det.appendChild(document.createTextNode(' · ')); det.appendChild(el('b', { testo: daFare + ' da completare' })); }
      // Come sul sito: un'area con almeno un corso in offerta (o a posti esauriti) diventa gialla da sola.
      var inPromo = promo && promo.attiva && corsi.some(function (c) { return c.cod && statoOfferta(c.cod) !== 'no'; });
      if (inPromo) { det.appendChild(el('br')); det.appendChild(el('span', { class: 'etichetta-offerta', testo: 'Corsi in offerta' })); }
      t2.appendChild(tessera('area-' + sigla, sigla, dati.nomiAree[sigla], det, inPromo ? 'tessera--offerta' : ''));
    });
    elContenuto.appendChild(t2);
  }

  function intestazione(titolo, sotto) {
    elContenuto.appendChild(el('div', { class: 'intestazione' }, [el('h2', { testo: titolo }), sotto ? el('span', { class: 'nota', testo: sotto }) : null]));
  }

  function disegna() {
    var aperti = {};
    elContenuto.querySelectorAll('details.corso').forEach(function (d) { aperti[d.getAttribute('data-i')] = d.open; });
    if (vista === 'offerta' && !promo) vista = 'inizio';
    if (vista !== 'inizio' && vista.slice(0, 5) !== 'area-' && vista.slice(0, 6) !== 'corso-') vista = 'inizio';
    if (vista.slice(0, 5) === 'area-' && !Object.prototype.hasOwnProperty.call(dati.nomiAree, vista.slice(5))) vista = 'area-' + Object.keys(dati.nomiAree)[0];
    disegnaMenu();
    elContenuto.innerHTML = '';

    if (vista === 'inizio') {
      disegnaInizio();
    } else if (vista === 'offerta') {
      intestazione('Offerta in corso', 'riquadri gialli, bollini, prezzi in promozione e posti esauriti');
      disegnaOfferta();
    } else if (vista.slice(0, 5) === 'area-') {
      var sigla = vista.slice(5);
      var indici = [];
      dati.corsi.forEach(function (c, i) { if (c.area === sigla) indici.push(i); });
      intestazione('Area ' + sigla + ' · ' + dati.nomiAree[sigla], 'clicca un corso per modificarlo');
      var tc = el('div', { class: 'tessere' });
      indici.forEach(function (i) {
        var c = dati.corsi[i];
        var info = [];
        info.push(c.pubblicato === false ? 'Nascosto dal sito' : 'Visibile sul sito');
        if (promo && c.cod && statoOfferta(c.cod) === 'offerta') info.push('in offerta');
        if (promo && c.cod && statoOfferta(c.cod) === 'esaurito') info.push('posti esauriti');
        var det = el('span', { class: 'dettaglio' }, [document.createTextNode(info.join(' · '))]);
        if (mancanti(c).length) { det.appendChild(el('br')); det.appendChild(el('b', { testo: 'Da completare: ' + mancanti(c).join(', ') })); }
        tc.appendChild(tessera('corso-' + i, c.cod || '?', c.titolo || 'Corso senza titolo', det,
          promo && c.cod && statoOfferta(c.cod) !== 'no' ? 'tessera--offerta' : ''));
      });
      tc.appendChild(el('button', {
        type: 'button', class: 'tessera tessera--nuovo',
        onclick: function () {
          dati.corsi.push({
            nuovo: true, pubblicato: false, mostraPrezzo: true, cod: '', slug: '',
            area: sigla, areaNome: dati.nomiAree[sigla],
            titolo: '', sottotitolo: '', prezzo: null, durataVideo: '8 ore online su Microsoft Teams', durataStudio: '',
            descrizione: [], perche: [], destinatari: [], programma: [], plus: '',
          });
          segnaCambiato(); vai('corso-' + (dati.corsi.length - 1));
        },
      }, [el('span', { class: 'sigla-g', testo: '+' }), el('strong', { testo: 'Aggiungi un nuovo corso' }), el('span', { class: 'dettaglio', testo: 'nasce nascosto: lo accendi quando è pronto' })]));
      elContenuto.appendChild(tc);
    } else if (vista.slice(0, 6) === 'corso-') {
      var k = Number(vista.slice(6));
      var corso = dati.corsi[k];
      if (!corso) { vai('inizio'); return; }
      intestazione((corso.cod ? corso.cod + ' · ' : '') + (corso.titolo || 'Nuovo corso'), corso.nuovo ? 'compila i campi, poi accendi "Visibile sul sito" e premi Salva e pubblica' : 'modifica i campi e premi Salva e pubblica in alto');
      var sch = schedaCorso(corso, k);
      sch.open = true; sch.classList.add('corso--pagina');
      elContenuto.appendChild(sch);
    } else if (vista === 'consulenza') {
      intestazione('Consulenza', 'le materie della pagina Consulenza');
      var cons = el('div', { class: 'riquadro' });
      elencoBlocchi(cons, dati.consulenze,
        [{ chiave: 'titolo', etichetta: 'Titolo' }, { chiave: 'testo', etichetta: 'Testo', multiriga: true }],
        'Aggiungi una consulenza', function () { return { titolo: '', testo: '' }; });
      elContenuto.appendChild(cons);
    } else {
      intestazione('Impostazioni');
      elContenuto.appendChild(el('div', { class: 'riquadro' }, [
        el('div', { class: 'interruttori' }, [
          interruttore(dati.impostazioni, 'mostraPrezzi', 'Mostra i prezzi dei corsi sul sito', true),
        ]),
        el('p', { class: 'nota', testo: 'Spento, i prezzi di listino spariscono da tutte le pagine e al loro posto compare "Su richiesta". I prezzi dell\\'offerta si gestiscono dalla sezione Offerta.' }),
      ]));
      elContenuto.appendChild(el('h2', { testo: 'Aree su richiesta' }));
      var sr = el('div', { class: 'riquadro' });
      elencoBlocchi(sr, dati.areeSuRichiesta,
        [{ chiave: 'sigla', etichetta: 'Sigla' }, { chiave: 'nome', etichetta: 'Nome dell\\'area' }],
        'Aggiungi un\\'area', function () { return { sigla: '', nome: '' }; });
      elContenuto.appendChild(sr);
    }
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
    if (promo && promo.vetrinaEsaurite) Object.keys(promo.vetrinaEsaurite).forEach(function (k) {
      var v = promo.vetrinaEsaurite[k]; if (!v || !v.listino || !v.prezzo) delete promo.vetrinaEsaurite[k];
    });
    pulito.corsi.forEach(function (c) {
      delete c.nuovo;
      if (c.perche) c.perche = c.perche.filter(function (p) { return (p.titolo || '').trim() || (p.testo || '').trim(); });
      if (c.programma) c.programma = c.programma.filter(function (p) { return (p.sezione || '').trim() || (p.voci || []).length; });
    });
    fetch('/api/admin/catalogo', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ dati: pulito, sha: sha, promo: promo, promoSha: promoSha }),
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
      if (res.j.promoSha) promoSha = res.j.promoSha;
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
    dati = res.j.dati; sha = res.j.sha; promo = res.j.promo || null; promoSha = res.j.promoSha || null;
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
