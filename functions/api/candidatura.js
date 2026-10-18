// Funzione Cloudflare Pages: riceve il modulo "Lavora con noi" e lo inoltra
// via email a info@mensanaformazione.com usando Brevo, esattamente come
// /api/contatto. Nessun dato viene salvato: il messaggio transita e basta.
//
// ⛔ PERCHE' NON RIUSA /api/contatto, che pure fa la stessa cosa. Tre motivi,
// e il primo da solo basterebbe:
//   1. quella funzione rimanda SEMPRE su /contatti/. Chiamata dalla pagina
//      "Lavora con noi", dopo l'invio l'utente si ritroverebbe su un'altra
//      pagina, senza capire se la candidatura sia partita;
//   2. i campi sono altri (partita IVA, area, esperienza) e vanno controllati
//      qui, non fatti passare come testo libero;
//   3. l'oggetto della mail e' quello che si legge nella lista della posta:
//      "Candidatura docente" va distinto da "Nuova richiesta dal sito",
//      altrimenti le due cose si mescolano nella stessa casella.
//
// Le variabili d'ambiente sono le stesse gia' impostate su Cloudflare Pages
// (Settings > Variables and secrets, ambiente Production), quindi non c'e'
// niente di nuovo da configurare:
//
//   BREVO_API_KEY   OBBLIGATORIA, la stessa del modulo contatti. Senza, il
//                   modulo risponde "errore" a ogni invio.
//   EMAIL_COPIA     FACOLTATIVA. ⚠️ Il 18/08 Nicola ha deciso di non usarla e
//                   di tenere il solo info@: se un giorno viene impostata,
//                   questa funzione la rispetta come l'altra.

import { verificaGettone, motivoSpam } from '../../src/server/antispam.js';

const DESTINATARIO = 'info@mensanaformazione.com';
const MITTENTE = { name: 'Sito Mens Sana Formazione', email: 'info@mensanaformazione.com' };

function destinatariInCopia(valore) {
  return (valore || '')
    .split(',')
    .map((voce) => voce.trim())
    .filter((voce) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(voce))
    .map((email) => ({ email }));
}

export async function onRequestPost({ request, env }) {
  // ⛔ Torna sulla pagina da cui si e' partiti, non su /contatti/.
  const tornaAlForm = (esito) =>
    Response.redirect(
      new URL(`/esito/${esito === "inviato" ? "candidatura-inviata" : esito === "anteprima" ? "prova-candidatura" : "errore-candidatura"}/`, request.url).toString(),
      303
    );

  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return tornaAlForm('errore');
  if (Number(request.headers.get('content-length') || 0) > 65536) return tornaAlForm('errore');
  let form;
  try {
    form = await request.formData();
  } catch {
    return tornaAlForm('errore');
  }

  // Honeypot antispam: il campo "azienda" e' invisibile agli umani.
  // Se e' compilato, e' un bot: fingiamo che sia andato tutto bene.
  if ((form.get('azienda') || '').toString().trim() !== '') {
    return tornaAlForm('inviato');
  }

  const campo = (nome, max = 500) =>
    (form.get(nome) || '').toString().trim().slice(0, max);

  const nome = campo('nome', 120);
  const email = campo('email', 200);
  const telefono = campo('telefono', 40);
  const citta = campo('citta', 80);
  const partitaIva = campo('partitaiva', 60);
  const area = campo('area', 120);
  const codice = campo('codice', 60);
  const esperienza = campo('esperienza', 60);
  const docenza = campo('docenza', 80);
  const profilo = campo('profilo', 300);
  const messaggio = campo('messaggio', 4000);
  const privacy = campo('privacy', 5);

  const emailValida = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  // ⛔ La partita IVA e l'area sono obbligatorie tanto quanto il nome: sono le
  // due domande di screening, e una candidatura che arriva senza e' proprio
  // quella che poi fa perdere tempo (voce 78).
  if (!nome || !emailValida || !messaggio || !partitaIva || !area || !esperienza || !docenza || privacy !== 'si') {
    return tornaAlForm('errore');
  }

  if (env.LOCAL_PREVIEW === true) return tornaAlForm('anteprima');

  // Antispam (src/server/antispam.js). Senza gettone valido si risponde
  // "errore": una persona vera vede la pagina con l'indirizzo info@ e puo'
  // scrivere lo stesso. Allo spam riconosciuto si risponde "inviato", cosi'
  // il bot non capisce di essere stato fermato, e la mail non parte.
  if (!env.BREVO_API_KEY) return tornaAlForm('errore');
  const esitoGettone = await verificaGettone(env, campo('gettone', 200));
  if (esitoGettone === 'gettone-mancante' || esitoGettone === 'gettone-scaduto') {
    console.log(`modulo scartato: ${esitoGettone}`);
    return tornaAlForm('errore');
  }
  const spam = esitoGettone !== 'ok' ? esitoGettone : motivoSpam({ nome, email, testi: [messaggio, profilo, citta] });
  if (spam) {
    console.log(`modulo scartato come spam: ${spam}`);
    return tornaAlForm('inviato');
  }

  if (!env.BREVO_API_KEY) {
    return tornaAlForm('errore');
  }

  const copie = destinatariInCopia(env.EMAIL_COPIA);

  // ⛔ La partita IVA sta nella PRIMA riga del corpo e nell'oggetto: chi apre
  // la mail deve poter decidere se andare avanti senza scorrere niente.
  const testo = [
    'Nuova candidatura dalla pagina "Lavora con noi" di mensanaformazione.com',
    '',
    `Partita IVA: ${partitaIva}`,
    `Area: ${area}`,
    `Codice corso: ${codice || 'non indicato'}`,
    '',
    `Nome: ${nome}`,
    `Email: ${email}`,
    `Telefono: ${telefono || 'non indicato'}`,
    `Citta: ${citta || 'non indicata'}`,
    `Profilo: ${profilo || 'non indicato'}`,
    '',
    `Esperienza sulla materia: ${esperienza || 'non indicata'}`,
    `Ha gia insegnato: ${docenza || 'non indicato'}`,
    '',
    'Presentazione:',
    messaggio,
    '',
    'Consenso privacy: prestato (informativa art. 13 GDPR, sezione candidature).',
  ].join('\n');

  try {
    const risposta = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: MITTENTE,
        to: [{ email: DESTINATARIO }],
        ...(copie.length ? { cc: copie } : {}),
        replyTo: { email, name: nome },
        subject: `Candidatura docente: ${area}${partitaIva.startsWith('No') ? ' (SENZA partita IVA)' : ''}`,
        textContent: testo,
      }),
    });
    if (!risposta.ok) return tornaAlForm('errore');
  } catch {
    return tornaAlForm('errore');
  }

  return tornaAlForm('inviato');
}
