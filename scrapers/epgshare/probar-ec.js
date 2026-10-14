// scrapers/epgshare/probar-ec.js
// Descarga EC1 y muestra, por cada canal, qué está al aire AHORA (hora de Ecuador).
// Sirve para comprobar que los horarios no estén corridos 5 horas.
//
// Uso:
//   node scrapers/epgshare/probar-ec.js            -> prueba los canales de canales-ec.js
//   node scrapers/epgshare/probar-ec.js ids        -> lista TODOS los ids que trae EC1
//   node scrapers/epgshare/probar-ec.js tvc teleamazonas  -> busca ids que contengan esas palabras

const { obtenerEPGShareMulti, descargarXMLTV, listarCanales, normalizar } = require('./scraper');
const { TAG, canales } = require('./canales-ec');

function ahoraEcuador() {
    const d = new Date(Date.now() - 5 * 60 * 60 * 1000);
    const p = n => String(n).padStart(2, '0');

    return (
        `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
        `${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`
    );
}

const titulo = cuerpo => {
    const m = /<title[^>]*>([^<]*)<\/title>/.exec(cuerpo);
    return m ? m[1].trim() : '(sin título)';
};

const hhmm = v => `${v.slice(8, 10)}:${v.slice(10, 12)}`;

(async () => {
    const args = process.argv.slice(2);

    console.log(`Descargando ${TAG}...`);
    const xml = await descargarXMLTV(TAG);

    // Modo: listar / buscar ids
    if (args.length) {
        const todos = listarCanales(xml).map(c => c.id);

        const filtrados =
            args[0] === 'ids'
                ? todos
                : todos.filter(id =>
                      args.some(a => normalizar(id).includes(normalizar(a)))
                  );

        console.log(`\n${filtrados.length} ids:`);
        filtrados.forEach(id => console.log('  ', id));
        return;
    }

    const r = await obtenerEPGShareMulti({ tag: TAG, canales });
    const ahora = ahoraEcuador();

    console.log(`\nHora actual en Ecuador: ${hhmm(ahora)}`);
    console.log(`Canales encontrados: ${r.encontrados.length}/${canales.length}`);
    console.log(`Programas totales:   ${r.programas.length}\n`);

    for (const c of r.encontrados) {
        const lista = r.programas.filter(p => p.canal === c.id);
        const actual = lista.find(p => p.start.slice(0, 14) <= ahora && p.stop.slice(0, 14) > ahora);

        console.log(
            `${c.nombre.padEnd(26)} ${String(lista.length).padStart(4)} prog.  ` +
                (actual
                    ? `AHORA ${hhmm(actual.start)}-${hhmm(actual.stop)}  ${titulo(actual.cuerpo)}`
                    : '(nada al aire ahora)')
        );
    }

    if (r.noEncontrados.length) {
        console.log('\n⚠️ No encontrados en el archivo (revisa idFuente):');
        r.noEncontrados.forEach(c => console.log(`   ${c.id}  ->  ${c.idFuente}`));
    }
})().catch(e => console.error('Error:', e.response?.status || e.message));
