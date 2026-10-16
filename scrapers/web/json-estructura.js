// scrapers/web/json-estructura.js
// Busca en el bloque <script type="application/json"> más grande de la página
// los arreglos de programas (objetos con la clave "show") y muestra su ruta,
// su tamaño y unos ejemplos, para saber qué campos traen la hora.
//
// Uso:
//   node scrapers/web/json-estructura.js https://www.rts.com.ec/programacion/
//   node scrapers/web/json-estructura.js https://www.tvc.com.ec/programacion/

const axios = require('axios');
const cheerio = require('cheerio');

const url = process.argv[2];

if (!url) {
    console.log('Uso: node scrapers/web/json-estructura.js <url>');
    process.exit(1);
}

const corto = (valor, max = 110) => {
    const s = typeof valor === 'string' ? valor : JSON.stringify(valor);
    return s && s.length > max ? s.slice(0, max) + '…' : s;
};

// Resumen de un elemento sin las partes pesadas (logos, etc.)
function resumen(item) {
    const out = {};

    for (const [k, v] of Object.entries(item)) {
        if (k === 'show') {
            out.show = { name: v && v.name, slug: v && v.slug, keys: v && Object.keys(v).length };
        } else if (k === 'fallbackLogo') {
            continue;
        } else {
            out[k] = corto(v);
        }
    }

    return out;
}

(async () => {
    const r = await axios.get(url, {
        timeout: 20000,
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Accept-Language': 'es-EC,es;q=0.9'
        }
    });

    const $ = cheerio.load(r.data);

    // Bloque JSON más grande
    let mayor = '';

    $('script[type="application/json"]').each((_, el) => {
        const t = $(el).contents().text();
        if (t.length > mayor.length) mayor = t;
    });

    if (!mayor) {
        console.log('No hay bloques <script type="application/json">.');
        return;
    }

    let datos;

    try {
        datos = JSON.parse(mayor.trim());
    } catch (e) {
        console.log('El bloque JSON más grande no se pudo parsear:', e.message);
        console.log(corto(mayor, 400));
        return;
    }

    console.log(`Bloque JSON: ${mayor.length} bytes`);
    console.log('Claves de primer nivel:', Object.keys(datos).join(', '));
    if (datos.page) console.log('Claves de "page":', Object.keys(datos.page).join(', '));

    // Recorre todo el JSON buscando arreglos cuyos elementos tengan "show"
    const hallados = [];

    (function recorrer(nodo, ruta, profundidad) {
        if (profundidad > 12 || nodo === null || typeof nodo !== 'object') return;

        if (Array.isArray(nodo)) {
            if (nodo.length && nodo.some(x => x && typeof x === 'object' && 'show' in x)) {
                hallados.push({ ruta, arreglo: nodo });
                return; // no entrar a los elementos
            }

            nodo.forEach((x, i) => recorrer(x, `${ruta}[${i}]`, profundidad + 1));
            return;
        }

        for (const [k, v] of Object.entries(nodo)) {
            recorrer(v, ruta ? `${ruta}.${k}` : k, profundidad + 1);
        }
    })(datos, '', 0);

    console.log(`\nArreglos con "show": ${hallados.length}`);

    hallados.slice(0, 8).forEach((h, i) => {
        console.log(`\n--- [${i + 1}] ${h.ruta}  (${h.arreglo.length} elementos) ---`);
        console.log('Claves del primer elemento:', Object.keys(h.arreglo[0]).join(', '));

        [0, 1, h.arreglo.length - 1].forEach(n => {
            if (h.arreglo[n]) {
                console.log(`  elemento ${n}:`, JSON.stringify(resumen(h.arreglo[n])));
            }
        });
    });

    if (hallados.length > 8) console.log(`\n(+${hallados.length - 8} arreglos más)`);
})().catch(e => console.error('Error:', e.response?.status || e.message));
