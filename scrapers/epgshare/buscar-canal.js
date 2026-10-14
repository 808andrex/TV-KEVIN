// scrapers/epgshare/buscar-canal.js
// Busca canales por nombre en varios archivos de epgshare01.online y dice
// cuántos programas tiene cada coincidencia (para descartar los canales vacíos).
//
// Uso:
//   node scrapers/epgshare/buscar-canal.js ecuavisa rts tvc gamavision
//   node scrapers/epgshare/buscar-canal.js ecuavisa --tags=EC1,CO1,PE1
//
// Por defecto revisa: EC1 CO1 PE1 CL1 AR1 MX1 PA1 CR1 DO1 SV1 UY1

const { descargarXMLTV, listarCanales, normalizar } = require('./scraper');

const TAGS_POR_DEFECTO = ['EC1', 'CO1', 'PE1', 'CL1', 'AR1', 'MX1', 'PA1', 'CR1', 'DO1', 'SV1', 'UY1'];

const args = process.argv.slice(2);
const opcionTags = args.find(a => a.startsWith('--tags='));
const tags = opcionTags ? opcionTags.slice(7).split(',') : TAGS_POR_DEFECTO;
const palabras = args.filter(a => !a.startsWith('--')).map(normalizar);

if (!palabras.length) {
    console.log('Uso: node scrapers/epgshare/buscar-canal.js ecuavisa rts tvc [--tags=EC1,CO1]');
    process.exit(1);
}

// Compara por palabras sueltas del id: "rts" coincide con "Canal.RTS.ec" pero no con "Sports"
function coincide(id) {
    const tokens = id
        .split(/[^A-Za-z0-9\u00C0-\u024F]+/)
        .filter(Boolean)
        .map(normalizar);

    return palabras.some(p =>
        tokens.some(t => t === p || (p.length >= 5 && t.includes(p)))
    );
}

(async () => {
    for (const tag of tags) {
        try {
            process.stdout.write(`\n[${tag}] descargando... `);
            const xml = await descargarXMLTV(tag);
            const hallados = listarCanales(xml).filter(c => coincide(c.id));

            console.log(`${hallados.length} coincidencia(s)`);

            for (const c of hallados) {
                const n = xml.split(`channel="${c.crudo}"`).length - 1;
                console.log(`   ${String(n).padStart(5)} prog.  ${c.id}`);
            }
        } catch (e) {
            console.log(`error (${e.response?.status || e.message})`);
        }
    }

    console.log('\nListo.');
})();
