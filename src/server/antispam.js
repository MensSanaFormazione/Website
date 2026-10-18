// Difese antispam dei moduli del sito (contatti e "Lavora con noi").
// Nate il 18/10/2026: gli amministratori ricevevano su info@ decine di
// richieste finte al giorno (indirizzi mail.ru, bk.ru, fuhrenmail...), che
// superavano il campo nascosto "azienda" e consumavano il piano di Brevo.
//
// Due controlli:
//
// 1. IL GETTONE. Quando la pagina si apre, forms.js chiede a /api/gettone un
//    gettone firmato con l'ora. Il modulo lo rimanda insieme ai dati.
//    Un bot che spedisce i dati direttamente all'indirizzo del modulo non ce
//    l'ha; uno che lo compila in meno di 3 secondi nemmeno una persona lo
//    farebbe. La firma usa una chiave ricavata da BREVO_API_KEY, che sta solo
//    nelle variabili di Cloudflare: il repository e' pubblico, qui non c'e'
//    nessun segreto.
//
// 2. IL CONTENUTO. Caratteri cirillici, domini usa e getta e indirizzi Gmail
//    pieni di punti (wood.ford.j.am.es.o.n.4@gmail.com) sono firme tipiche
//    dello spam automatico. ⛔ I LINK NON SI FILTRANO (deciso il
//    18/10): capita che un cliente o un docente mandi il profilo LinkedIn.

const ETA_MINIMA = 3; // secondi: sotto, nessuna persona compila il modulo
const ETA_MASSIMA = 24 * 60 * 60; // secondi: una pagina lasciata aperta un giorno

const DOMINI_SPAM = [
  'mail.ru', 'bk.ru', 'list.ru', 'inbox.ru', 'internet.ru',
  'yandex.ru', 'yandex.com', 'rambler.ru',
  'fuhrenmail.com', 'legenmail.com', 'ultraleadgeneration.com',
];

const codificatore = new TextEncoder();

function base64url(buffer) {
  let binario = '';
  new Uint8Array(buffer).forEach((b) => { binario += String.fromCharCode(b); });
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function firma(env, testo) {
  const chiave = await crypto.subtle.importKey(
    'raw',
    codificatore.encode(`gettone-moduli:${env.BREVO_API_KEY}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return base64url(await crypto.subtle.sign('HMAC', chiave, codificatore.encode(testo)));
}

export async function creaGettone(env) {
  const ora = Math.floor(Date.now() / 1000);
  return `${ora}.${await firma(env, `modulo:${ora}`)}`;
}

// Risponde 'ok', oppure il motivo dello scarto.
export async function verificaGettone(env, valore) {
  const [ora, sigillo] = (valore || '').split('.');
  if (!ora || !sigillo || !/^\d{9,11}$/.test(ora)) return 'gettone-mancante';
  if ((await firma(env, `modulo:${ora}`)) !== sigillo) return 'gettone-falso';
  const eta = Math.floor(Date.now() / 1000) - Number(ora);
  if (eta < ETA_MINIMA) return 'troppo-veloce';
  if (eta > ETA_MASSIMA) return 'gettone-scaduto';
  return 'ok';
}

// Risponde il motivo se il contenuto ha le firme dello spam, altrimenti null.
export function motivoSpam({ nome = '', email = '', testi = [] }) {
  if (/[Ѐ-ӿ]/.test([nome, ...testi].join(' '))) return 'cirillico';
  const [locale = '', dominio = ''] = email.toLowerCase().split('@');
  if (dominio.endsWith('.ru') || DOMINI_SPAM.includes(dominio)) return `dominio ${dominio}`;
  if (dominio === 'gmail.com' && (locale.match(/\./g) || []).length >= 4) return 'gmail a punti';
  return null;
}
