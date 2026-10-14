// scrapers/directv/scraper.js
//
// Obtiene la programación de DSPORTS 1, DSPORTS 2 y DSPORTS+ desde los archivos
// XMLTV públicos de epgshare01.online (no se consulta directv.com.* porque
// está protegido con captcha).
//
// Devuelve fragmentos XMLTV con los ids de TU proyecto (dsports1.ec, etc.),
// listos para insertarse en mi_guia.xml.

const axios = require('axios');
const zlib = require('zlib');

// Canales de salida (ids que usará tu lista.m3u / mi_guia.xml)
const CANALES_SALIDA = [
    { id: 'dsports1.ec', nombre: 'DSPORTS 1' },
    { id: 'dsports2.ec', nombre: 'DSPORTS 2' },
    { id: 'dsportsplus.ec', nombre: 'DSPORTS +' }
];

// Cómo reconocer cada canal dentro de cada archivo de epgshare01
const FUENTES = {
    // Colombia: misma zona horaria que Ecuador (UTC-5)
    CO1: {
        'dsports1.ec': id => id.includes('(DTSCHD)'),
        'dsports2.ec': id => id.includes('(DTV2HD)'),
        'dsportsplus.ec': id => id.includes('(DTS+HD)')
    },
    // Archivo dedicado a DIRECTV Sports (feeds de Argentina)
    DIRECTVSPORTS1: {
        'dsports1.ec': id => id === 'DSPORTS.(ARG).dtvsp',
        'dsports2.ec': id => id === 'DSPORTS.2.HD.dtvsp',
        'dsportsplus.ec': id => id === 'DSPORTS.+.HD.dtvsp'
    }
};

const decodificar = texto =>
    texto
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");

const escaparXML = texto =>
    String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

async function descargarXMLTV(tag) {
    const url = `https://epgshare01.online/epgshare01/epg_ripper_${tag}.xml.gz`;

    const respuesta = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 120000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    return zlib.gunzipSync(Buffer.from(respuesta.data)).toString('utf8');
}

// Lista de ids de canal presentes en el XML: [{ crudo, id }]
function listarCanales(xml) {
    const lista = [];
    const re = /<channel\s+id="([^"]+)"/g;
    let m;

    while ((m = re.exec(xml)) !== null) {
        lista.push({ crudo: m[1], id: decodificar(m[1]) });
    }

    return lista;
}

async function obtenerDSports({ fuente = 'DIRECTVSPORTS1' } = {}) {
    const reglas = FUENTES[fuente];

    if (!reglas) {
        throw new Error(`Fuente desconocida: ${fuente}`);
    }

    const xml = await descargarXMLTV(fuente);
    const canalesArchivo = listarCanales(xml);

    // id crudo en el archivo -> id de salida
    const mapa = {};

    for (const salida of CANALES_SALIDA) {
        const encontrado = canalesArchivo.find(c => reglas[salida.id](c.id));

        if (encontrado) {
            mapa[encontrado.crudo] = salida.id;
        }
    }

    // Una sola pasada por todos los <programme>
    const programas = [];
    const re = /<programme\b([^>]*)>([\s\S]*?)<\/programme>/g;
    let m;

    while ((m = re.exec(xml)) !== null) {
        const atributos = m[1];
        const canal = /\bchannel="([^"]*)"/.exec(atributos);

        if (!canal || !mapa[canal[1]]) continue;

        const idSalida = mapa[canal[1]];
        const start = /\bstart="([^"]*)"/.exec(atributos);
        const stop = /\bstop="([^"]*)"/.exec(atributos);

        if (!start || !stop) continue;

        programas.push({
            canal: idSalida,
            start: start[1],
            stop: stop[1],
            // cuerpo original (title, desc, etc.)
            cuerpo: m[2]
        });
    }

    const encontrados = CANALES_SALIDA.filter(c =>
        Object.values(mapa).includes(c.id)
    );

    return {
        fuente,
        canalesEncontrados: encontrados,
        programas,

        // Fragmentos XMLTV listos para pegar antes de </tv>
        xmlCanales: encontrados
            .map(
                c =>
                    `  <channel id="${c.id}">\n    <display-name>${escaparXML(c.nombre)}</display-name>\n  </channel>`
            )
            .join('\n'),

        xmlProgramas: programas
            .map(
                p =>
                    `  <programme start="${p.start}" stop="${p.stop}" channel="${p.canal}">${p.cuerpo}</programme>`
            )
            .join('\n'),

        // Para diagnóstico
        idsDSports: canalesArchivo
            .filter(c => /dsports/i.test(c.id))
            .map(c => c.id)
    };
}

module.exports = { obtenerDSports, CANALES_SALIDA };
