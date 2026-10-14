// scrapers/directv/probar-dsports.js
// Prueba las dos fuentes y muestra qué programación trae cada una.
// Uso:  node scrapers/directv/probar-dsports.js

const { obtenerDSports, CANALES_SALIDA } = require('./scraper');

function titulo(cuerpo) {
    const m = /<title[^>]*>([^<]*)<\/title>/.exec(cuerpo);
    return m ? m[1].trim() : '(sin título)';
}

function formatear(inicio) {
    // 20261014213000 -0500  ->  21:30
    return `${inicio.slice(8, 10)}:${inicio.slice(10, 12)}`;
}

(async () => {
    for (const fuente of ['CO1', 'DIRECTVSPORTS1']) {
        console.log(`\n==================== ${fuente} ====================`);

        try {
            const r = await obtenerDSports({ fuente });

            console.log(
                `Canales DSports en el archivo (${r.idsDSports.length}):`
            );
            r.idsDSports.forEach(id => console.log('   ', id));

            for (const canal of CANALES_SALIDA) {
                const lista = r.programas.filter(p => p.canal === canal.id);

                console.log(`\n--- ${canal.nombre} (${canal.id}): ${lista.length} programas`);

                lista.slice(0, 6).forEach(p =>
                    console.log(
                        `   ${p.start.slice(0, 8)} ${formatear(p.start)}  ${titulo(p.cuerpo)}`
                    )
                );
            }
        } catch (error) {
            console.error(
                `Error con ${fuente}:`,
                error.response?.status || error.message
            );
        }
    }

    console.log('\nPrueba terminada.');
})();
