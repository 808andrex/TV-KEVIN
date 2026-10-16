// scrapers/epgshare/buscar-canal.js
// Busca canales en varios archivos de epgshare01.online y dice cuántos programas
// tiene cada uno (para descartar los canales vacíos).
//
// Uso:
//   node scrapers/epgshare/buscar-canal.js ecuavisa rts tvc      -> busca por nombre
//   node scrapers/epgshare/buscar-canal.js --todos               -> lista TODO lo que traen los archivos
//                                                                   (solo canales con programas y que aún no tienes)
//   node scrapers/epgshare/buscar-canal.js --todos --tags=CO1,PE1
//   node scrapers/epgshare/buscar-canal.js --todos --con-ya      -> incluye también los que ya tienes
//
// Por defecto revisa: EC1 CO1 PE1 CL1 AR1 MX1 PA1 CR1 DO1 SV1 UY1

const { descargarXMLTV, listarCanales, normalizar } = require('./scraper');
const { canales: canalesEC, TAG: TAG_EC } = require('./canales-ec');

const TAGS_POR_DEFECTO = ['EC1', 'CO1', 'PE1', 'CL1', 'AR1', 'MX1', 'PA1', 'CR1', 'DO1', 'SV1', 'UY1'];

const args = process.argv.slice(2);
const opcionTags = args.find(a => a.startsWith('--tags='));
const tags = opcionTags ? opcionTags.slice(7).split(',') : TAGS_POR_DEFECTO;
const todos = args.includes('--todos');
const conYa = args.includes('--con-ya');
const palabras = args.filter(a => !a.startsWith('--')).map(normalizar);

if (!palabras.length && !todos) {
    console.log('Uso: node scrapers/epgshare/buscar-canal.js ecuavisa rts tvc [--tags=EC1,CO1]');
    console.log('     node scrapers/epgshare/buscar-canal.js --todos [--tags=EC1,CO1] [--con-ya]');
    process.exit(1);
}

// Los que ya tienes en canales-ec.js: "TAG|idnormalizado"
const yaTengo = new Set(
    canalesEC.map(c => `${c.tag || TAG_EC}|${normalizar(c.idFuente)}`)
);

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
            const todosLosCanales = listarCanales(xml);

            let hallados = [];

            for (const c of todosLosCanales) {
                if (!todos && !coincide(c.id)) continue;

                const n = xml.split(`channel="${c.crudo}"`).length - 1;
                const ya = yaTengo.has(`${tag}|${normalizar(c.id)}`);

                if (todos && (n === 0 || (ya && !conYa))) continue;

                hallados.push({ id: c.id, n, ya });
            }

            hallados.sort((a, b) => a.id.localeCompare(b.id));

            console.log(
                todos
                    ? `${todosLosCanales.length} canales en el archivo, ${hallados.length} para mostrar`
                    : `${hallados.length} coincidencia(s)`
            );

            for (const h of hallados) {
                console.log(`   ${String(h.n).padStart(5)} prog.  ${h.id}${h.ya ? '   (ya lo tienes)' : ''}`);
            }
        } catch (e) {
            console.log(`error (${e.response?.status || e.message})`);
        }
    }

    console.log('\nListo.');
})();
