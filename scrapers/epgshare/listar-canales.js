// scrapers/epgshare/listar-canales.js
// Sin internet: lee mi_guia.xml y lista.m3u y te dice
//   1) qué canales tiene la guía y cuántos programas tiene cada uno
//   2) qué canales de tu lista.m3u NO tienen guía (o tienen 0 programas)
//   3) qué canales de la guía todavía no están en tu lista.m3u (con su id listo para copiar)
//
// Uso:
//   node scrapers/epgshare/listar-canales.js          -> los 3 reportes
//   node scrapers/epgshare/listar-canales.js guia     -> solo el reporte 1
//   node scrapers/epgshare/listar-canales.js m3u      -> solo el reporte 2
//   node scrapers/epgshare/listar-canales.js nuevos   -> solo el reporte 3
// Además guarda canales_guia.txt (id<TAB>nombre<TAB>programas).

const fs = require('fs');

const modo = process.argv[2] || 'todo';

const decodificar = t =>
    t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");

// ---- mi_guia.xml ----
const xml = fs.readFileSync('mi_guia.xml', 'utf8');

const nombres = new Map(); // id -> nombre
for (const m of xml.matchAll(/<channel id="([^"]+)">\s*<display-name>([^<]*)<\/display-name>/g)) {
    nombres.set(decodificar(m[1]), decodificar(m[2]).trim());
}

const conteo = new Map(); // id -> programas
for (const m of xml.matchAll(/<programme\b[^>]*\bchannel="([^"]+)"/g)) {
    const id = decodificar(m[1]);
    conteo.set(id, (conteo.get(id) || 0) + 1);
}

// ---- lista.m3u ----
const m3u = fs.existsSync('lista.m3u') ? fs.readFileSync('lista.m3u', 'utf8') : '';
const canalesM3U = [];

for (const m of m3u.matchAll(/#EXTINF:[^\n]*?(?:tvg-id="([^"]*)")?[^\n]*,(.*)/g)) {
    // tvg-id puede estar en cualquier posición dentro de la línea
    const linea = m[0];
    const id = (/tvg-id="([^"]*)"/.exec(linea) || [])[1] || '';
    const nombre = (m[2] || '').trim();
    canalesM3U.push({ id, nombre });
}

const idsM3U = new Set(canalesM3U.map(c => c.id).filter(Boolean));

// ---- reportes ----
const filas = [...nombres.entries()].map(([id, nombre]) => ({ id, nombre, n: conteo.get(id) || 0 }));

if (modo === 'todo' || modo === 'guia') {
    console.log(`\n=== 1) CANALES EN mi_guia.xml (${filas.length}) ===`);
    console.log('ID'.padEnd(28) + 'NOMBRE'.padEnd(30) + 'PROGRAMAS');
    for (const f of filas) {
        console.log(f.id.padEnd(28) + f.nombre.padEnd(30) + (f.n === 0 ? '0  <-- vacío' : f.n));
    }
}

if (modo === 'todo' || modo === 'm3u') {
    console.log(`\n=== 2) CANALES DE lista.m3u SIN GUÍA ===`);
    let hay = false;
    for (const c of canalesM3U) {
        if (!c.id) {
            console.log(`  (sin tvg-id)  ${c.nombre}`);
            hay = true;
        } else if (!nombres.has(c.id)) {
            console.log(`  ${c.id.padEnd(26)} ${c.nombre}   <-- no existe en la guía`);
            hay = true;
        } else if ((conteo.get(c.id) || 0) === 0) {
            console.log(`  ${c.id.padEnd(26)} ${c.nombre}   <-- existe pero con 0 programas`);
            hay = true;
        }
    }
    if (!hay) console.log('  Todos tus canales tienen guía.');
}

if (modo === 'todo' || modo === 'nuevos') {
    console.log(`\n=== 3) CANALES DE LA GUÍA QUE NO ESTÁN EN TU lista.m3u ===`);
    console.log('(Copia el id en tvg-id cuando agregues el stream)');
    const nuevos = filas.filter(f => !idsM3U.has(f.id));
    for (const f of nuevos) {
        console.log(`  tvg-id="${f.id}"`.padEnd(40) + f.nombre + (f.n === 0 ? '  (sin programas)' : ''));
    }
    console.log(`  -> ${nuevos.length} canales`);
}

fs.writeFileSync(
    'canales_guia.txt',
    filas.map(f => `${f.id}\t${f.nombre}\t${f.n}`).join('\n'),
    'utf8'
);
console.log('\nGuardado en canales_guia.txt');
