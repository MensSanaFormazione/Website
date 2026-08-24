// Catalogo corsi Mens Sana Formazione. Prezzi +IVA, formato videolezione + studio individuale.
// Contenuti e programmi ripresi dal sito storico mensanaformazione.com (lug 2026),
// riscritti e integrati con i riferimenti normativi piu recenti.
//
// ⛔ I DATI NON STANNO PIU' QUI: stanno in `catalogo.json`, in questa stessa
// cartella. Questo file resta come unico punto da cui le pagine leggono, cosi'
// gli import esistenti non cambiano.
// ⛔ `catalogo.json` e' scritto anche dall'area riservata (/admin): si modifica
// a mano solo sapendo cosa si fa, e mai mentre qualcuno sta usando il pannello.

import catalogo from './catalogo.json';

export const impostazioni = catalogo.impostazioni;

// Un corso con `pubblicato: false` sparisce dal sito: niente pagina, niente
// card, niente correlati. Non viene cancellato, resta nel file e si ripubblica
// rimettendo l'interruttore.
export const corsi = catalogo.corsi.filter((c) => c.pubblicato !== false);

// Il prezzo si vede solo se sono veri sia l'interruttore generale sia quello
// del singolo corso. Basta uno dei due spento e la pagina non lo mostra.
export function mostraPrezzo(corso) {
  return catalogo.impostazioni.mostraPrezzi !== false && corso.mostraPrezzo !== false;
}

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
      "Non sono videolezioni ma percorsi di incontri con un coach, costruiti sugli obiettivi concordati insieme alla committenza e alla persona.",
  },
  H: {
    slug: 'digitalizzazione-pa',
    occhiello: 'Il documento informatico e la transizione digitale degli enti pubblici.',
    intro:
      "Ciclo di vita del documento informatico e processo di transizione digitale prefigurato dal PNRR: la materia di chi lavora dentro la pubblica amministrazione o insieme a lei.",
  },
};

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
