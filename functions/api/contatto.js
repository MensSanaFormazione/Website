// Funzione Cloudflare Pages: riceve il modulo contatti e lo inoltra via
// email a info@mensanaformazione.com usando Brevo (provider UE).
// Nessun dato viene salvato: il messaggio transita e basta.
//
// ⛔ Perché serve un servizio esterno: questo sito è statico e non ha un server
// che possa spedire email. Il vecchio sito era Drupal su Aruba e le mandava dal
// server, per questo finora non serviva niente.
//
// Due variabili d'ambiente, entrambe in Cloudflare Pages
// (Settings > Variables and secrets, ambiente Production):
//
//   BREVO_API_KEY   OBBLIGATORIA. Senza, il modulo risponde "errore" a ogni
//                   invio. Si genera su Brevo in SMTP & API > API Keys, e si
//                   legge una volta sola.
//   EMAIL_COPIA     FACOLTATIVA. Un secondo indirizzo che riceve in copia ogni
//                   richiesta. ⛔ Serve perché il destinatario è la casella
//                   della società: senza questa copia, chi non ha accesso a
//                   info@ non vede arrivare niente, ed è esattamente il modo in
//                   cui nel 2025 le richieste sono rimaste senza risposta.
//                   Se non è impostata, la funzione si comporta come prima.
//
// ⚠️ Serve anche un mittente verificato su Brevo (info@mensanaformazione.com):
// finché non lo è, Brevo rifiuta l'invio. E finché l'SPF del dominio non
// include Brevo, le email partono ma rischiano la cartella spam.

const DESTINATARIO = 'info@mensanaformazione.com';
const MITTENTE = { name: 'Sito Mens Sana Formazione', email: 'info@mensanaformazione.com' };

// Accetta un solo indirizzo o più separati da virgola, e scarta quelli scritti
// male invece di far fallire l'invio a tutti.
function destinatariInCopia(valore) {
  return (valore || '')
    .split(',')
    .map((voce) => voce.trim())
    .filter((voce) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(voce))
    .map((email) => ({ email }));
}

export async function onRequestPost({ request, env }) {
  const tornaAlForm = (esito) =>
    Response.redirect(new URL(`/esito/${esito === "inviato" ? "richiesta-inviata" : esito === "anteprima" ? "prova-contatti" : "errore-contatti"}/`, request.url).toString(), 303);

  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return tornaAlForm('errore');
  if (Number(request.headers.get('content-length') || 0) > 65536) return tornaAlForm('errore');
  let form;
  try {
    form = await request.formData();
  } catch {
    return tornaAlForm('errore');
  }

  // Honeypot antispam: il campo "azienda" è invisibile agli umani.
  // Se è compilato, è un bot: fingiamo che sia andato tutto bene.
  if ((form.get('azienda') || '').toString().trim() !== '') {
    return tornaAlForm('inviato');
  }

  const campo = (nome, max = 500) =>
    (form.get(nome) || '').toString().trim().slice(0, max);

  const nome = campo('nome', 120);
  const email = campo('email', 200);
  const telefono = campo('telefono', 40);
  const interesse = campo('interesse', 120);
  const messaggio = campo('messaggio', 4000);
  const privacy = campo('privacy', 5);

  const emailValida = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  if (!nome || !emailValida || !interesse || !messaggio || privacy !== 'si') {
    return tornaAlForm('errore');
  }

  if (env.LOCAL_PREVIEW === true) return tornaAlForm('anteprima');

  if (!env.BREVO_API_KEY) {
    return tornaAlForm('errore');
  }

  const copie = destinatariInCopia(env.EMAIL_COPIA);

  const testo = [
    'Nuova richiesta dal sito mensanaformazione.com',
    '',
    `Nome: ${nome}`,
    `Email: ${email}`,
    `Telefono: ${telefono || 'non indicato'}`,
    `Interesse: ${interesse || 'non indicato'}`,
    '',
    'Messaggio:',
    messaggio,
    '',
    'Consenso privacy: prestato (checkbox informativa art. 13 GDPR).',
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
        // In copia solo se EMAIL_COPIA è impostata: Brevo rifiuta la richiesta
        // se "cc" è presente ma vuoto.
        ...(copie.length ? { cc: copie } : {}),
        replyTo: { email, name: nome },
        subject: `Nuova richiesta dal sito: ${interesse || 'contatto'}`,
        textContent: testo,
      }),
    });
    if (!risposta.ok) return tornaAlForm('errore');
  } catch {
    return tornaAlForm('errore');
  }

  return tornaAlForm('inviato');
}
