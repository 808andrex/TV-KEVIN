// scrapers/web/diagnostico.js
// Descarga una página y busca en qué parte del HTML cruda aparece un texto
// (por ejemplo el nombre de un programa), para saber de dónde salen los datos.
//
// Uso:
//   node scrapers/web/diagnostico.js https://www.tvc.com.ec/programacion/ Esmeralda
//   node scrapers/web/diagnostico.js https://www.rts.com.ec/programacion/ Combate

const axios = require('axios');

const url = process.argv[2];
const palabra = process.argv[3] || 'Esmeralda';

if (!url) {
    console.log('Uso: node scrapers/web/diagnostico.js <url> [texto a buscar]');
    process.exit(1);
}

const recorte = (texto, pos, ancho = 220) =>
    texto
        .slice(Math.max(0, pos - ancho), pos + ancho)
        .replace(/\s+/g, ' ');

(async () => {
    const r = await axios.get(url, {
        timeout: 20000,
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Accept-Language': 'es-EC,es;q=0.9'
        }
    });

    const html = String(r.data);

    console.log(`HTTP ${r.status}, ${html.length} bytes\n`);

    // 1) Dónde aparece el texto buscado
    const re = new RegExp(palabra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const hallazgos = [...html.matchAll(re)];

    console.log(`=== "${palabra}" aparece ${hallazgos.length} vez/veces en el HTML crudo ===`);
    hallazgos.slice(0, 6).forEach((m, i) =>
        console.log(`\n[${i + 1}] posición ${m.index}:\n${recorte(html, m.index)}`)
    );

    // 2) Marcas de la plantilla de programación
    console.log('\n=== Marcas de la plantilla ===');
    ['schedule-segment', 'data-start', 'wp-schedule-grid', 'schedule'].forEach(t =>
        console.log(`  "${t}": ${(html.match(new RegExp(t, 'g')) || []).length} veces`)
    );

    // 3) Scripts externos que parezcan del sitio (no analítica)
    console.log('\n=== <script src> del propio sitio ===');
    const srcs = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)]
        .map(m => m[1])
        .filter(s => !/google|gtag|facebook|doubleclick|cloudflare|gstatic|adsby|taboola|clarity/i.test(s));
    srcs.forEach(s => console.log('  ' + s));

    // 4) Bloques JSON incrustados
    console.log('\n=== Bloques <script type="application/json|ld+json"> ===');
    const json = [...html.matchAll(/<script[^>]+type=["']application\/(?:ld\+)?json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    json.forEach((m, i) =>
        console.log(`  [${i + 1}] ${m[1].length} bytes: ${recorte(m[1], 0, 150)}`)
    );
    if (!json.length) console.log('  (ninguno)');

    // 5) URLs de API / admin-ajax / wp-json mencionadas
    console.log('\n=== Posibles endpoints (wp-json, admin-ajax, .json, /api/) ===');
    const eps = new Set(
        [...html.matchAll(/["'(]([^"'()\s]*(?:wp-json|admin-ajax|\.json|\/api\/)[^"'()\s]*)/gi)].map(m => m[1])
    );
    [...eps].slice(0, 25).forEach(e => console.log('  ' + e));
    if (!eps.size) console.log('  (ninguno)');
})().catch(e => console.error('Error:', e.response?.status || e.message));
