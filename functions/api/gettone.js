// Consegna alla pagina il gettone firmato che i moduli devono rimandare.
// Spiegazione completa in src/server/antispam.js.
import { creaGettone } from '../../src/server/antispam.js';

export async function onRequestGet({ env }) {
  const intestazioni = { 'content-type': 'application/json', 'cache-control': 'no-store' };
  if (!env.BREVO_API_KEY) {
    return new Response(JSON.stringify({ gettone: '' }), { status: 503, headers: intestazioni });
  }
  return new Response(JSON.stringify({ gettone: await creaGettone(env) }), { headers: intestazioni });
}
