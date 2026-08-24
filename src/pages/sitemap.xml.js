// Mappa del sito generata a ogni build: le pagine fisse piu' una riga per ogni
// corso pubblicato. ⛔ Si aggiorna da sola quando un corso viene nascosto dal
// pannello dell'area riservata, quindi non va mantenuta a mano.
// Fuori restano /admin, /api e la 404.
import { corsi, aree } from '../data/corsi.js';

const fisse = ['/', '/formazione/', '/su-misura/', '/contatti/', '/digital/', '/privacy/', '/termini/'];

export function GET({ site }) {
  const oggi = new Date().toISOString().slice(0, 10);
  const indirizzi = [
    ...fisse.map((p) => ({ url: new URL(p, site).href, priorita: p === '/' ? '1.0' : '0.8' })),
    ...aree
      .filter((a) => a.corsi.length > 0)
      .map((a) => ({ url: new URL(`/formazione/${a.slug}/`, site).href, priorita: '0.8' })),
    ...corsi.map((c) => ({ url: new URL(`/corsi/${c.slug}/`, site).href, priorita: '0.7' })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indirizzi
  .map(
    (v) => `  <url>
    <loc>${v.url}</loc>
    <lastmod>${oggi}</lastmod>
    <priority>${v.priorita}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
