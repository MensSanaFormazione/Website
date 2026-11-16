// Catalogo corsi Mens Sana Formazione. Prezzi +IVA, corsi online su Microsoft Teams (16/11/2026).
// Contenuti e programmi ripresi dal sito storico mensanaformazione.com (lug 2026),
// riscritti e integrati con i riferimenti normativi piu recenti.
//
// ⛔ I DATI NON STANNO PIU' QUI: stanno in `catalogo.json`, in questa stessa
// cartella. Questo file resta come unico punto da cui le pagine leggono, cosi'
// gli import esistenti non cambiano.
// ⛔ `catalogo.json` e' scritto anche dall'area riservata (/admin): si modifica
// a mano solo sapendo cosa si fa, e mai mentre qualcuno sta usando il pannello.

import catalogo from './catalogo.json';
import promozione from './promozione.json';

// Offerta in corso (src/data/promozione.json). Risponde i dati dell'offerta
// del corso, o null se il corso non e' in offerta o la promozione e' spenta.
export function offerta(cod) {
  const voce = promozione.attiva ? promozione.corsi[cod] : null;
  if (!voce) return null;
  return { ...voce, scadenza: promozione.scadenza, sconto: Math.round((1 - voce.prezzo / voce.listino) * 100) };
}
export const offertaAttiva = promozione.attiva === true;
// Corsi in offerta a posti esauriti (F2, F3): da fuori si vedono come offerta,
// entrando nella scheda c'e' la frase di promozione.json (decisione degli amministratori, 16/11).
export function esaurita(cod) {
  return promozione.attiva && promozione.esaurite && promozione.esaurite[cod] ? promozione.esaurite[cod] : null;
}
// Prezzo mostrato da fuori per F2 e F3 (uguale a F1, deciso il 16/11).
export function vetrina(cod) {
  const v = esaurita(cod) && promozione.vetrinaEsaurite ? promozione.vetrinaEsaurite[cod] : null;
  return v ? { ...v, sconto: Math.round((1 - v.prezzo / v.listino) * 100) } : null;
}
// Prezzo da mostrare nelle schede riassuntive: offerta vera o vetrina degli esauriti.
export const prezzoPromo = (cod) => offerta(cod) || vetrina(cod);
// Riquadro giallo e bollino: corso in offerta o a posti esauriti.
export const inPromozione = (cod) => Boolean(offerta(cod) || esaurita(cod));
// Sconto piu' alto fra i corsi in offerta di un'area (per il bollino della scheda area).
export function scontoArea(area) {
  const sconti = area.corsi.map((c) => offerta(c.cod)).filter(Boolean).map((o) => o.sconto);
  return sconti.length ? Math.max(...sconti) : null;
}
export const scadenzaOfferta = promozione.scadenza;
// La scadenza si scrive una volta sola in promozione.json (gg/mm/aaaa, modificabile dal pannello)
// e da qui esce nelle due forme usate dal sito: "31 dicembre 2026" e "31/12".
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const [gg, mm, aa] = String(promozione.scadenza || '').split('/').map(Number);
export const scadenzaLunga = gg && mm && aa ? `${gg} ${MESI[mm - 1]} ${aa}` : String(promozione.scadenza || '');
export const scadenzaBreve = gg && mm ? `${String(gg).padStart(2, '0')}/${String(mm).padStart(2, '0')}` : String(promozione.scadenza || '');
// Nell'ordine dello schema degli amministratori (F1, I1, I2, D2, D3).
export const corsiInOfferta = () => Object.keys(promozione.corsi)
  .map((cod) => catalogo.corsi.find((c) => c.cod === cod && c.pubblicato !== false))
  .filter((c) => c && offerta(c.cod))
  .map((c) => ({ ...c, offerta: offerta(c.cod) }));

export const impostazioni = catalogo.impostazioni;

// Un corso con `pubblicato: false` sparisce dal sito: niente pagina, niente
// card, niente correlati. Non viene cancellato, resta nel file e si ripubblica
// rimettendo l'interruttore.
export const corsi = catalogo.corsi.filter((c) => c.pubblicato !== false);

// Il prezzo si vede solo se sono veri sia l'interruttore generale sia quello
// del singolo corso. Basta uno dei due spento e la pagina non lo mostra.
// Senza una cifra salvata il corso resta comunque "Su richiesta".
export function mostraPrezzo(corso) {
  return catalogo.impostazioni.mostraPrezzi !== false && corso.mostraPrezzo !== false
    && typeof corso.prezzo === 'number' && corso.prezzo > 0;
}

// L'interruttore generale da solo. Serve alle pagine che devono cambiare il
// TESTO, non solo il numero: l'indice del catalogo diceva "Prezzi IVA esclusa"
// anche a prezzi spenti, cioe' annunciava una colonna che non c'era piu'.
// ⛔ 01/09: spento su decisione di Nicola. Si riaccende dal pannello
// dell'area riservata, scheda "Impostazioni", senza toccare il codice.
export const prezziAttivi = catalogo.impostazioni.mostraPrezzi !== false;

// Le schede delle aree stanno QUI e non in `catalogo.json`, di proposito:
// quel file lo riscrive anche il pannello dell'area riservata, e una chiave che
// il pannello non conosce rischia di sparire al primo salvataggio.
// ⛔ Gli indirizzi sono gli stessi del vecchio sito (`/it/corsi/compliance`...),
// cosi' i rimandi in `public/_redirects` portano ognuno sulla sua area invece
// che tutti sulla pagina generica.
const SCHEDE_AREE = {
  A: {
    slug: 'diritto-societario',
    occhiello: 'Chi governa la società, con quali poteri e con quale responsabilità.',
    intro:
      "Organi sociali, deleghe e modelli organizzativi: come si distribuisce il potere dentro una società e fin dove arriva la responsabilità di chi amministra.",
  },
  B: {
    slug: 'organismi-di-controllo',
    occhiello: "Le tre funzioni che controllano l'impresa dall'interno.",
    intro:
      "Internal auditing, risk management e compliance: come si costruiscono le funzioni di controllo, come lavorano sul campo e come rispondono al vertice.",
  },
  C: {
    slug: 'contrattualistica',
    occhiello: 'Scrivere e negoziare contratti che reggono anche quando qualcosa va storto.',
    intro:
      "Contratti d'impresa nazionali, internazionali e pubblici: struttura, clausole tipiche, legge applicabile, foro e arbitrato, con le simulazioni di negoziazione.",
  },
  D: {
    slug: 'credit-management',
    occhiello: 'Dal credito commerciale al recupero, prima e dopo il giudice.',
    intro:
      "Gestione del credito, normativa del recupero e fase giudiziale ed esecutiva: come si tiene sotto controllo l'incasso e cosa si fa davvero quando il cliente non paga.",
  },
  E: {
    slug: 'finance-e-fiscale',
    occhiello: "I numeri dell'impresa e il rapporto con il fisco.",
    intro:
      "Bilancio, controlli di gestione, economia e finanza d'impresa e project management, più diritto e contenzioso tributario: la parte quantitativa del governo aziendale.",
  },
  F: {
    slug: 'compliance',
    occhiello: "Le regole che l'impresa deve darsi da sola, e cosa rischia se non lo fa.",
    intro:
      "GDPR e figura del Data Protection Officer, responsabilità amministrativa degli enti ex D.Lgs. 231/01, antiriciclaggio: i tre presidi che un'impresa strutturata non può più non avere.",
  },
  G: {
    slug: 'business-coaching',
    occhiello: 'Percorsi individuali per chi guida persone.',
    intro:
      "Non sono lezioni di gruppo ma percorsi di incontri con un coach, online su Microsoft Teams, costruiti sugli obiettivi concordati insieme alla committenza e alla persona.",
  },
  H: {
    slug: 'digitalizzazione-pa',
    occhiello: 'La transizione digitale degli enti pubblici.',
    intro:
      "La transizione digitale degli enti pubblici, dal Codice dell'amministrazione digitale al PNRR fino a cybersicurezza e intelligenza artificiale: la materia di chi lavora dentro la pubblica amministrazione o insieme a lei.",
  },
  I: {
    slug: 'intelligenza-artificiale',
    occhiello: "AI Act, privacy, proprietà intellettuale e responsabilità nell'uso dell'IA.",
    intro:
      "Un percorso di sedici ore, da seguire per intero o in due corsi da otto: il primo affronta l'AI Act e la protezione dei dati, il secondo la proprietà intellettuale e chi risponde quando un sistema di intelligenza artificiale sbaglia.",
  },
};

// ⛔ QUANTI CORSI E QUANTE AREE: si CONTANO, non si scrivono a mano.
// Il 04/09, aggiungendo l'area I, le pagine dicevano ancora "Ventidue corsi in
// otto aree" in cinque punti diversi: e' lo stesso difetto dei prezzi spenti
// dell'01/09, dove l'interruttore era stato girato ma le frasi scritte attorno
// al dato erano rimaste. Da qui in avanti il numero lo fa il file.
const NUMERI = ['zero', 'un', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette',
  'otto', 'nove', 'dieci', 'undici', 'dodici', 'tredici', 'quattordici',
  'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove', 'venti',
  'ventuno', 'ventidue', 'ventitre', 'ventiquattro', 'venticinque', 'ventisei',
  'ventisette', 'ventotto', 'ventinove', 'trenta'];

export function inLettere(n) {
  return NUMERI[n] ?? String(n);
}

export const numeroCorsi = corsi.length;
export const numeroAree = new Set(corsi.map((c) => c.area)).size;
export const corsiInLettere = inLettere(numeroCorsi);
export const areeInLettere = inLettere(numeroAree);

// Aree con i rispettivi corsi (per la home, la pagina catalogo e le pagine area)
export const aree = Object.entries(catalogo.nomiAree).map(([sigla, nome]) => ({
  sigla,
  nome,
  ...SCHEDE_AREE[sigla],
  corsi: corsi.filter((c) => c.area === sigla),
}));

// Aree a catalogo senza corsi online pubblicati: erogabili su richiesta.
export const areeSuRichiesta = catalogo.areeSuRichiesta;

export const consulenze = catalogo.consulenze;

export const LINKEDIN_URL = catalogo.LINKEDIN_URL;

// Profilo Instagram ripreso dal footer del vecchio sito mensanaformazione.com
// (verificato il 06/08/2026: è quello linkato dal sito ancora online).
// ⛔ Se la costante è vuota, l'icona NON compare da nessuna parte nel sito:
// nessun link rotto.
// ⛔ Facebook: il vecchio sito linka anche facebook.com/mensanaformazione,
// ma Nicola ha deciso il 06/08 di NON metterlo. Non riproporlo.
export const INSTAGRAM_URL = catalogo.INSTAGRAM_URL;
