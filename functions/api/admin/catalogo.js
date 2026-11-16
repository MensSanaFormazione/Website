// API dell'area riservata: legge e riscrive il catalogo corsi.
//
// COME FUNZIONA, in breve. Il sito e' statico: le pagine dei corsi vengono
// generate quando il sito si pubblica, non quando qualcuno le apre. Quindi il
// pannello non "modifica il sito dal vivo": salva il file `catalogo.json`
// nel repository, e Cloudflare Pages, che sta in ascolto sul repository,
// ricostruisce e rimette online tutto da solo. Un minuto circa.
//
// ⛔ Il vantaggio, ed e' il motivo per cui e' stata scelta questa strada:
// ogni salvataggio e' un commit. Si vede chi ha cambiato cosa e quando, e
// qualunque errore si annulla tornando alla versione precedente. Niente e'
// mai perso davvero.
//
// Variabili d'ambiente (Cloudflare Pages > Settings > Variables and secrets,
// ambiente Production). Senza queste, la funzione rifiuta tutto:
//
//   ADMIN_EMAILS        chi puo' entrare (vedi src/server/sessione.js)
//   SESSION_SECRET      Secret, firma codici e sessioni
//   GITHUB_TOKEN        token GitHub "fine-grained", SOLO su MensSanaFormazione/Website,
//                       permesso "Contents: Read and write". Da salvare come
//                       Secret, mai come variabile in chiaro.

import { verificaSessione, configurazioneCompleta } from '../../../src/server/sessione.js';

// Il repository si chiamava ProjWS/Website: l'account e' stato rinominato.
const REPO = 'MensSanaFormazione/Website';
const PERCORSO = 'src/data/catalogo.json';
// L'offerta (riquadri gialli, bollini, prezzi in promozione, posti esauriti) sta in un file a parte.
const PERCORSO_PROMO = 'src/data/promozione.json';
const RAMO = 'main';

const risposta = (dati, stato = 200) =>
  new Response(JSON.stringify(dati), {
    status: stato,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

function intestazioniGitHub(env) {
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'mensana-area-riservata',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

// ⛔ Controllo di forma prima di scrivere. Il catalogo alimenta la
// generazione del sito: un dato sbagliato qui non rompe una pagina, blocca
// la pubblicazione di tutto il sito. Meglio rifiutare il salvataggio e dirlo.
export function controlla(dati) {
  const errori = [];
  if (!dati || typeof dati !== 'object') return ['Il contenuto inviato non e\' leggibile'];

  if (!dati.impostazioni || typeof dati.impostazioni.mostraPrezzi !== 'boolean') {
    errori.push('Manca l\'impostazione generale sui prezzi');
  }
  if (!dati.nomiAree || typeof dati.nomiAree !== 'object') errori.push('Mancano le aree');
  if (!Array.isArray(dati.corsi)) errori.push('Manca l\'elenco dei corsi');
  if (!Array.isArray(dati.consulenze)) errori.push('Manca l\'elenco delle consulenze');
  if (!Array.isArray(dati.areeSuRichiesta)) errori.push('Mancano le aree su richiesta');
  if (errori.length) return errori;

  const slugVisti = new Set();
  dati.corsi.forEach((corso, i) => {
    const dove = `Corso ${i + 1}${corso && corso.cod ? ' (' + corso.cod + ')' : ''}`;
    if (!corso || typeof corso !== 'object') {
      errori.push(`${dove}: dati non leggibili`);
      return;
    }
    if (!corso.titolo || !String(corso.titolo).trim()) errori.push(`${dove}: manca il titolo`);
    if (!corso.cod || !String(corso.cod).trim()) errori.push(`${dove}: manca il codice`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(corso.slug || ''))) {
      errori.push(`${dove}: l'indirizzo della pagina puo' contenere solo lettere minuscole, numeri e trattini`);
    }
    if (slugVisti.has(corso.slug)) errori.push(`${dove}: l'indirizzo "${corso.slug}" e' gia' usato da un altro corso`);
    slugVisti.add(corso.slug);
    if (!Object.prototype.hasOwnProperty.call(dati.nomiAree, corso.area)) {
      errori.push(`${dove}: l'area "${corso.area}" non esiste`);
    }
    // Dal 04/11/2026 i prezzi di listino non stanno piu' nel repository pubblico: vuoto e' ammesso.
    if (corso.prezzo !== null && corso.prezzo !== undefined
      && (typeof corso.prezzo !== 'number' || !Number.isFinite(corso.prezzo) || corso.prezzo < 0)) {
      errori.push(`${dove}: il prezzo deve essere un numero, oppure vuoto`);
    }
    ['descrizione', 'destinatari', 'perche', 'programma'].forEach((campo) => {
      if (corso[campo] !== undefined && !Array.isArray(corso[campo])) {
        errori.push(`${dove}: il campo "${campo}" e' scritto male`);
      }
    });
  });

  if (dati.corsi.filter((c) => c.pubblicato !== false).length === 0) {
    errori.push('Non puoi nascondere tutti i corsi: il sito resterebbe senza catalogo');
  }
  return errori;
}

const numeroPositivo = (n) => typeof n === 'number' && Number.isFinite(n) && n > 0;

// Controllo dell'offerta. Come per il catalogo: un dato sbagliato bloccherebbe la pubblicazione.
export function controllaPromo(promo, catalogo) {
  const errori = [];
  if (!promo || typeof promo !== 'object') return ['L\'offerta non e\' leggibile'];
  if (typeof promo.attiva !== 'boolean') errori.push('Offerta: manca l\'interruttore generale');
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(String(promo.scadenza || ''))) errori.push('Offerta: la scadenza va scritta come 31/12/2026');
  if (promo.condizioni !== undefined && (!Array.isArray(promo.condizioni) || promo.condizioni.some((c) => typeof c !== 'string'))) errori.push('Offerta: le condizioni vanno scritte una per riga');
  if (promo.fascia !== undefined && typeof promo.fascia !== 'string') errori.push('Offerta: la frase della fascia non e\' leggibile');
  const codici = new Set((catalogo && catalogo.corsi ? catalogo.corsi : []).map((c) => c.cod));
  const corsi = promo.corsi || {};
  const esaurite = promo.esaurite || {};
  const vetrina = promo.vetrinaEsaurite || {};
  Object.keys(corsi).forEach((cod) => {
    const v = corsi[cod];
    const dove = `Offerta ${cod}`;
    if (!codici.has(cod)) errori.push(`${dove}: il corso non esiste nel catalogo`);
    if (!v || typeof v !== 'object') { errori.push(`${dove}: dati non leggibili`); return; }
    if (!String(v.breve || '').trim()) errori.push(`${dove}: manca il nome breve`);
    if (!numeroPositivo(v.listino)) errori.push(`${dove}: il prezzo di listino deve essere un numero`);
    if (!numeroPositivo(v.prezzo)) errori.push(`${dove}: il prezzo in offerta deve essere un numero`);
    if (numeroPositivo(v.listino) && numeroPositivo(v.prezzo) && v.prezzo >= v.listino) errori.push(`${dove}: il prezzo in offerta deve essere piu' basso del listino`);
    if (!Array.isArray(v.edizioni) || !v.edizioni.length) errori.push(`${dove}: serve almeno una data`);
    if (esaurite[cod]) errori.push(`${dove}: un corso non puo' essere insieme in offerta e a posti esauriti`);
  });
  Object.keys(esaurite).forEach((cod) => {
    const dove = `Posti esauriti ${cod}`;
    if (!codici.has(cod)) errori.push(`${dove}: il corso non esiste nel catalogo`);
    if (!String(esaurite[cod] || '').trim()) errori.push(`${dove}: manca la frase da mostrare nella scheda`);
    const v = vetrina[cod];
    if (v && (!numeroPositivo(v.listino) || !numeroPositivo(v.prezzo) || v.prezzo >= v.listino)) {
      errori.push(`${dove}: listino e prezzo in vetrina devono essere numeri, e il prezzo piu' basso del listino`);
    }
  });
  return errori;
}

async function leggiFile(env, percorso) {
  const url = `https://api.github.com/repos/${REPO}/contents/${percorso}?ref=${RAMO}`;
  const r = await fetch(url, { headers: intestazioniGitHub(env) });
  if (!r.ok) throw new Error(`GitHub ha risposto ${r.status} leggendo ${percorso}`);
  const meta = await r.json();
  const testo = new TextDecoder().decode(
    Uint8Array.from(atob(meta.content.replace(/\n/g, '')), (c) => c.charCodeAt(0)),
  );
  return { dati: JSON.parse(testo), sha: meta.sha };
}

async function scriviFile(env, percorso, dati, sha, messaggio) {
  const testo = JSON.stringify(dati, null, 2) + '\n';
  const contenuto = btoa(String.fromCharCode(...new TextEncoder().encode(testo)));
  return fetch(`https://api.github.com/repos/${REPO}/contents/${percorso}`, {
    method: 'PUT',
    headers: { ...intestazioniGitHub(env), 'content-type': 'application/json' },
    body: JSON.stringify({ message: messaggio, content: contenuto, sha, branch: RAMO }),
  });
}

export async function onRequestGet({ request, env, next }) {
  // ⛔ Se l'area non e' configurata, questa API deve rispondere come /admin:
  // la 404 del sito. Una risposta diversa direbbe a un estraneo che qui c'e'
  // un'area riservata, solo spenta.
  if (!configurazioneCompleta(env)) return next();
  const accesso = await verificaSessione(request, env);
  if (!accesso.ok) return risposta({ errore: accesso.motivo }, 403);
  if (!env.GITHUB_TOKEN) return risposta({ errore: 'Collegamento a GitHub non configurato' }, 500);

  try {
    const [catalogo, promo] = await Promise.all([leggiFile(env, PERCORSO), leggiFile(env, PERCORSO_PROMO)]);
    return risposta({ dati: catalogo.dati, sha: catalogo.sha, promo: promo.dati, promoSha: promo.sha, email: accesso.email });
  } catch (e) {
    return risposta({ errore: String(e.message || e) }, 502);
  }
}

export async function onRequestPut({ request, env, next }) {
  if (!configurazioneCompleta(env)) return next();
  const accesso = await verificaSessione(request, env);
  if (!accesso.ok) return risposta({ errore: accesso.motivo }, 403);
  if (!env.GITHUB_TOKEN) return risposta({ errore: 'Collegamento a GitHub non configurato' }, 500);

  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return risposta({ errore: 'Richiesta non leggibile' }, 400);
  }

  const errori = [...controlla(corpo.dati), ...(corpo.promo ? controllaPromo(corpo.promo, corpo.dati) : [])];
  if (errori.length) return risposta({ errore: 'Controlla questi punti', dettagli: errori }, 400);

  // ⛔ `sha` e' la versione da cui e' partita la modifica. Se nel frattempo
  // qualcun altro ha salvato, GitHub rifiuta invece di sovrascrivere il suo
  // lavoro: e' la rete di protezione contro due persone che modificano insieme.
  if (!corpo.sha || (corpo.promo && !corpo.promoSha)) return risposta({ errore: 'Ricarica la pagina prima di salvare' }, 409);

  // Si scrive solo il file che e' cambiato davvero: ogni scrittura e' una pubblicazione.
  let attuali;
  try {
    attuali = await Promise.all([leggiFile(env, PERCORSO), leggiFile(env, PERCORSO_PROMO)]);
  } catch (e) {
    return risposta({ errore: String(e.message || e) }, 502);
  }
  const uguale = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const esito = { ok: true, sha: corpo.sha, promoSha: corpo.promoSha };
  const conflitto = () => risposta({ errore: 'Il sito e\' cambiato nel frattempo. Ricarica la pagina e rifai la modifica.' }, 409);

  if (!uguale(corpo.dati, attuali[0].dati)) {
    if (corpo.sha !== attuali[0].sha) return conflitto();
    const r = await scriviFile(env, PERCORSO, corpo.dati, corpo.sha, `Catalogo aggiornato dall'area riservata (${accesso.email})`);
    if (r.status === 409 || r.status === 422) return conflitto();
    if (!r.ok) return risposta({ errore: `GitHub ha risposto ${r.status} salvando il catalogo` }, 502);
    esito.sha = (await r.json()).content.sha;
  }
  if (corpo.promo && !uguale(corpo.promo, attuali[1].dati)) {
    if (corpo.promoSha !== attuali[1].sha) return conflitto();
    const r = await scriviFile(env, PERCORSO_PROMO, corpo.promo, corpo.promoSha, `Offerta aggiornata dall'area riservata (${accesso.email})`);
    if (r.status === 409 || r.status === 422) return conflitto();
    if (!r.ok) return risposta({ errore: `GitHub ha risposto ${r.status} salvando l'offerta` }, 502);
    esito.promoSha = (await r.json()).content.sha;
  }
  return risposta(esito);
}
