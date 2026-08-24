# Sito web Mens Sana Formazione — prima versione (solo formazione)

> **Cos'è questa cartella.** È la copia del sito completo con il **ramo digitale
> (Mens Sana Digital) rimosso**: pagina `/digital/`, voce di menu, card in home,
> opzione nel form contatti. Serve a pubblicare subito il ramo formazione senza
> aspettare il parere della commercialista sull'oggetto sociale. Quando arriva
> l'ok, la parte tech si rimette prendendola dalla cartella `Website/`, che è
> rimasta intatta.

Sito statico costruito con [Astro](https://astro.build): moderno, mobile-first,
velocissimo e senza database. Pagine:

| Pagina | URL | Contenuto |
|--------|-----|-----------|
| Home | `/` | Hero, corsi e consulenza, metodo Before/During/After, valori |
| Formazione | `/formazione/` | Catalogo 12 corsi (aree A–E), aree su richiesta (F/G/H), consulenze |
| Contatti | `/contatti/` | Form (via funzione Cloudflare `/api/contatto` + Brevo → info@mensanaformazione.com), dati societari |
| Privacy | `/privacy/` | Informativa Privacy e Cookie Policy (art. 13 GDPR): **testo della v2.0 del vecchio sito**, integrale, più le due sezioni che l'originale non poteva avere (dati raccolti dal modulo, Cloudflare e Brevo come responsabili) |
| Termini | `/termini/` | **Condizioni generali di contratto**: testo integrale del documento del vecchio sito, tutti e 9 gli articoli |
| Schede corso | `/corsi/<slug>/` | 12 pagine, una per corso: descrizione, perché iscriversi, destinatari, programma ad accordion, corsi correlati |

## Comandi

```bash
npm install        # solo la prima volta
npm run dev        # anteprima locale su http://localhost:4321
npm run build      # genera il sito statico nella cartella dist/
npm run preview    # anteprima della build
```

## Dove si modifica cosa

- **Corsi, prezzi e schede complete** (descrizioni, programmi, destinatari) → `src/data/corsi.js` (unica fonte, le pagine si aggiornano da sole)
- **Link LinkedIn** → costante `LINKEDIN_URL` in fondo a `src/data/corsi.js`
- **Link social** → costanti `LINKEDIN_URL` e `INSTAGRAM_URL` in fondo a `src/data/corsi.js`. ⛔ Se una costante è vuota, la relativa icona non compare da nessuna parte: nessun link rotto. ⛔ **Facebook: il vecchio sito lo linka, ma Nicola ha deciso di non metterlo. Non riproporlo**
- **Contatti/orari** (header, footer, pagina contatti) → `src/layouts/Base.astro` e `src/pages/contatti.astro`
- **Colori e stile** → `src/styles/global.css` (variabili CSS in `:root`)
- **Logo** → `public/logo.png`

## Deploy

Il sito è su **Cloudflare Pages** (repo GitHub `ProjWS/Website`, push = deploy).
Build command `npm run build`, publish directory `dist`, funzioni in `functions/`.
Il dominio `mensanaformazione.com` non è ancora collegato: l'URL attivo è
`https://website-5co.pages.dev`.

⛔ Il push lo fa **solo Nicola** da GitHub Desktop.

## Form contatti (funzione Cloudflare + Brevo)

Il form NON usa più formsubmit.co: invia i dati a `/api/contatto`
(`functions/api/contatto.js`, funzione Cloudflare Pages) che li inoltra a
info@mensanaformazione.com tramite Brevo (provider email UE, piano gratuito
300 mail/giorno). Nessun dato viene salvato. Prima che funzioni online servono
due passaggi una tantum (li fa Nicola):

1. Creare un account gratuito su https://www.brevo.com, verificare il mittente
   `info@mensanaformazione.com` (Settings > Senders) e generare una API key
   (Settings > SMTP & API > API Keys).
2. Nel progetto Cloudflare Pages: Settings > Environment variables > aggiungere
   `BREVO_API_KEY` (production) con la chiave, poi rifare il deploy.

Senza la chiave configurata il form mostra un messaggio di errore cortese con
l'invito a scrivere direttamente a info@. Antispam: campo honeypot invisibile.

## Note

- Privacy: il sito non usa NESSUN cookie (niente banner necessario). La pagina
  `/privacy/` è linkata nel footer; il form ha la checkbox di consenso.
- Sezione team volutamente assente: da aggiungere quando ci saranno nomi/foto.
- Verificato senza overflow orizzontale a 390px (iPhone) e menu mobile funzionante.
- **Documenti legali: si è scelto di attenersi a quelli del vecchio sito**
  (richiesta degli amministratori, 06/08). Privacy e T&C riprendono il testo
  originale dei due PDF in `DOCUMENTI da far controllare a CLAUDE/`. ⛔ Se un
  giorno vanno riscritti, si riscrivono partendo da lì, non da questa pagina.
- **Verificato il 06/08 contro il sito ancora online**: le pagine
  `/condizioni-generali-di-contratto` e `/informativa-privacy-e-cookie-policy`
  di mensanaformazione.com sono **identiche ai due PDF**, e queste pagine le
  riportano parola per parola, IBAN e numero di telefono compresi.
  ⚠️ Corretti solo due refusi dell'originale: "Si i cookie analytics" → "Se",
  "parzialemnte" → "parzialmente".
- ⚠️ **L'IBAN è pubblico** (art. 7.1), come lo è oggi sul vecchio sito. Se
  cambia, questa pagina va aggiornata subito.
- **Dati societari:** mancano registro imprese, numero REA e capitale sociale,
  obbligatori per una S.r.l. (art. 2250 c.c.). ⚠️ **Non ci sono nemmeno sul
  vecchio sito** (controllato il 06/08: il footer ha solo indirizzo, telefoni,
  email, PEC e P.IVA), quindi vanno presi dalla visura. Vedi `CLAUDE.md`,
  voce 31-bis.

## Caratteri (dal 24/08/2026)

⛔ **Fino al 24/08 il sito non aveva un carattere suo.** `global.css` dichiarava
`"Inter"` ma non lo caricava: nessun `@font-face`, nessun file. Ogni visitatore
lo vedeva col carattere del proprio sistema, quindi San Francisco su Mac e
iPhone, Segoe UI su Windows, Roboto su Android.

Ora sono **self-hostati in `public/fonts/`**, sottoinsiemi `latin` e
`latin-ext`, con le regole `@font-face` in cima a `src/styles/global.css`:

- **Fraunces** (variabile, 600-900) per i titoli, `--font-titoli`
- **Inter** (variabile, 400-800) per il testo, `--font-testo`

⛔ **Nessuna chiamata a Google Fonts:** il sito resta a zero terze parti e zero
cookie, che è la condizione per non avere il banner.

**Per cambiare carattere ai titoli** basta `--font-titoli` in `global.css`, più
`font-variation-settings` nella regola `h1, h2, h3, h4` (le impostazioni sono di
Fraunces e vanno tolte se si cambia famiglia).

**Per rigenerare i file:** si scarica il CSS di Google Fonts con uno user agent
da browser, si tengono solo i blocchi `latin` e `latin-ext`, si scaricano i
`woff2` in `public/fonts/` e si riscrivono gli `src` con i percorsi locali.
⚠️ I due `<link rel="preload">` in `Base.astro` puntano ai file `latin`: se
cambiano nome vanno aggiornati.
