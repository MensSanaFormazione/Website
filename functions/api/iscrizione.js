// Funzione Cloudflare Pages: riceve il modulo di iscrizione delle schede corso
// (src/components/ModuloIscrizione.astro) e lo inoltra via email a
// info@mensanaformazione.com con Brevo, come il modulo contatti.
// Nessun dato viene salvato: il messaggio transita e basta.
//
// Usa le stesse variabili d'ambiente di functions/api/contatto.js
// (BREVO_API_KEY obbligatoria, EMAIL_COPIA facoltativa) e lo stesso
// antispam (src/server/antispam.js). Nessuna variabile nuova da impostare.

import { verificaGettone, motivoSpam } from '../../src/server/antispam.js';

const DESTINATARIO = 'info@mensanaformazione.com';
const MITTENTE = { name: 'Sito Mens Sana Formazione', email: 'info@mensanaformazione.com' };
const MAX_PARTECIPANTI = 10;
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function destinatariInCopia(valore) {
  return (valore || '')
    .split(',')
    .map((voce) => voce.trim())
    .filter((voce) => EMAIL_OK.test(voce))
    .map((email) => ({ email }));
}

// Legge e controlla il modulo. Risponde { errore } oppure { dati }.
// Esportata per poterla provare senza spedire niente.
export function leggiIscrizione(form) {
  const campo = (nome, max = 200) => (form.get(nome) || '').toString().trim().slice(0, max);
  const tutti = (nome, max = 200) => form.getAll(nome).map((v) => v.toString().trim().slice(0, max));

  const tipo = ['azienda', 'ente', 'privato'].includes(campo('tipo')) ? campo('tipo') : 'azienda';
  const d = {
    corso: campo('corso', 10),
    corsoTitolo: campo('corso_titolo', 200),
    offerta: campo('offerta', 3) === 'si',
    edizione: campo('edizione', 120),
    referente: {
      nome: campo('ref_nome', 80), cognome: campo('ref_cognome', 80), ruolo: campo('ref_ruolo', 80),
      email: campo('ref_email'), telefono: campo('ref_telefono', 40),
    },
    tipo,
    fattura: {
      ragioneSociale: campo('ragione_sociale', 160), indirizzo: campo('indirizzo', 160), cap: campo('cap', 10),
      citta: campo('citta', 80), provincia: campo('provincia', 2).toUpperCase(),
      piva: tipo === 'privato' ? '' : campo('piva', 20), cf: campo('cf', 20).toUpperCase(),
      sdi: tipo === 'privato' ? '' : campo('sdi', 10).toUpperCase(), pec: tipo === 'privato' ? '' : campo('pec'),
    },
    finanziata: tipo !== 'privato' && campo('finanziata', 3) === 'si',
    note: campo('note', 2000),
    condizioni: campo('condizioni', 3) === 'si',
    privacy: campo('privacy', 3) === 'si',
  };

  const nomi = tutti('p_nome', 80);
  const cognomi = tutti('p_cognome', 80);
  const email = tutti('p_email');
  const ruoli = tutti('p_ruolo', 80);
  d.partecipanti = nomi.map((nome, i) => ({ nome, cognome: cognomi[i] || '', email: email[i] || '', ruolo: ruoli[i] || '' }))
    .filter((p) => p.nome || p.cognome || p.email);

  const r = d.referente;
  const f = d.fattura;
  if (!/^[A-I]\d{1,2}$/.test(d.corso) || !d.edizione) return { errore: 'corso o edizione' };
  if (!r.nome || !r.cognome || !EMAIL_OK.test(r.email) || !r.telefono) return { errore: 'referente' };
  if (d.partecipanti.length === 0 || d.partecipanti.length > MAX_PARTECIPANTI) return { errore: 'partecipanti' };
  if (d.partecipanti.some((p) => !p.nome || !p.cognome || !EMAIL_OK.test(p.email))) return { errore: 'partecipanti' };
  if (!f.ragioneSociale || !f.indirizzo || !f.cap || !f.citta || !f.provincia || !f.cf) return { errore: 'fattura' };
  if (tipo !== 'privato' && !f.piva) return { errore: 'partita iva' };
  if (f.pec && !EMAIL_OK.test(f.pec)) return { errore: 'pec' };
  if (!d.condizioni || !d.privacy) return { errore: 'consensi' };
  return { dati: d };
}

export function testoIscrizione(d) {
  const r = d.referente;
  const f = d.fattura;
  const tipi = { azienda: 'Azienda o professionista', ente: 'Ente pubblico', privato: 'Privato' };
  return [
    'Nuova ISCRIZIONE dal sito mensanaformazione.com',
    '',
    `Corso: ${d.corso} - ${d.corsoTitolo}`,
    `Edizione: ${d.edizione}`,
    `Offerta 2027: ${d.offerta ? 'SI, prezzo in promozione' : 'no'}`,
    `Partecipanti: ${d.partecipanti.length}`,
    '',
    'CHI EFFETTUA L\'ISCRIZIONE',
    `${r.nome} ${r.cognome}${r.ruolo ? ` (${r.ruolo})` : ''}`,
    `Email: ${r.email}`,
    `Telefono: ${r.telefono}`,
    '',
    'PARTECIPANTI',
    ...d.partecipanti.map((p, i) => `${i + 1}. ${p.nome} ${p.cognome}, ${p.email}${p.ruolo ? `, ${p.ruolo}` : ''}`),
    '',
    `DATI PER LA FATTURA (${tipi[d.tipo]})`,
    f.ragioneSociale,
    `${f.indirizzo}, ${f.cap} ${f.citta} (${f.provincia})`,
    ...(f.piva ? [`Partita IVA: ${f.piva}`] : []),
    `Codice fiscale: ${f.cf}`,
    ...(d.tipo !== 'privato' ? [`Codice SDI: ${f.sdi || 'non indicato'}`, `PEC: ${f.pec || 'non indicata'}`] : []),
    ...(d.tipo === 'ente' ? ['Ente pubblico: verificare split payment e CIG.'] : []),
    ...(d.finanziata ? ['', 'FORMAZIONE FINANZIATA: chiede di essere ricontattato per gestirla.'] : []),
    '',
    'Note:',
    d.note || 'nessuna',
    '',
    'Condizioni di iscrizione: accettate.',
    'Consenso privacy: prestato (art. 13 GDPR).',
    '',
    'Prossimo passo: rispondere entro un giorno lavorativo con la conferma e le coordinate per il bonifico.',
  ].join('\n');
}

export async function onRequestPost({ request, env }) {
  const esito = (stato) =>
    Response.redirect(new URL(`/esito/${stato === 'inviato' ? 'iscrizione-inviata' : 'errore-iscrizione'}/`, request.url).toString(), 303);

  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return esito('errore');
  if (Number(request.headers.get('content-length') || 0) > 65536) return esito('errore');
  let form;
  try {
    form = await request.formData();
  } catch {
    return esito('errore');
  }

  // Campo trappola "azienda": invisibile alle persone, lo compilano i bot.
  if ((form.get('azienda') || '').toString().trim() !== '') return esito('inviato');

  const { errore, dati } = leggiIscrizione(form);
  if (errore) {
    console.log(`iscrizione rifiutata: ${errore}`);
    return esito('errore');
  }

  if (!env.BREVO_API_KEY) return esito('errore');
  const esitoGettone = await verificaGettone(env, (form.get('gettone') || '').toString());
  if (esitoGettone === 'gettone-mancante' || esitoGettone === 'gettone-scaduto') return esito('errore');
  const r = dati.referente;
  const spam = esitoGettone !== 'ok' ? esitoGettone : motivoSpam({
    nome: `${r.nome} ${r.cognome}`,
    email: r.email,
    testi: [dati.note, dati.fattura.ragioneSociale, ...dati.partecipanti.map((p) => `${p.nome} ${p.cognome}`)],
  });
  if (spam) {
    console.log(`iscrizione scartata come spam: ${spam}`);
    return esito('inviato');
  }

  const copie = destinatariInCopia(env.EMAIL_COPIA);
  const n = dati.partecipanti.length;
  try {
    const risposta = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: MITTENTE,
        to: [{ email: DESTINATARIO }],
        ...(copie.length ? { cc: copie } : {}),
        replyTo: { email: r.email, name: `${r.nome} ${r.cognome}` },
        subject: `ISCRIZIONE ${dati.corso}${dati.offerta ? ' (offerta)' : ''}: ${dati.fattura.ragioneSociale}, ${n} ${n === 1 ? 'partecipante' : 'partecipanti'}`,
        textContent: testoIscrizione(dati),
      }),
    });
    if (!risposta.ok) return esito('errore');
  } catch {
    return esito('errore');
  }
  return esito('inviato');
}
