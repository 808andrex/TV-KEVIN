// scrapers/epgshare/scraper.js
//
// Scraper genérico para los XMLTV públicos de epgshare01.online
// (https://epgshare01.online/epgshare01/epg_ripper_<TAG>.xml.gz).
//
// Sirve para cualquier tag (EC1 = Ecuador, CO1 = Colombia, AR1 = Argentina, etc.).
// Recibe una lista de canales { id, nombre, idFuente } y devuelve fragmentos
// XMLTV con TUS ids (los mismos que usas en tvg-id de lista.m3u), con las horas
// ya convertidas a hora de Ecuador (-0500).

const axios = require('axios');
const zlib = require('zlib');

// Algunos archivos de epgshare01 traen las horas en UTC aunque estén etiquetadas
// con otro offset (pasa con DIRECTVSPORTS1). Si en EC1 los horarios salen
// corridos 5 horas, cambia EC1 a true y listo.
const HORA_EN_UTC = {
    EC1: false
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

// "Canal.Gamavisión.ec" -> "canalgamavisionec" (para comparar sin importar tildes/símbolos)
const normalizar = texto =>
    decodificar(String(texto))
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

// Convierte "20261014213000 +0100" (o sin offset) a hora de Ecuador: "20261014153000 -0500".
function aHoraEcuador(valor, tag) {
    const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*([+-]\d{4})?/.exec(valor);

    if (!m) return valor;

    let offsetMin = 0;

    if (m[7] && !HORA_EN_UTC[tag]) {
        const signo = m[7][0] === '-' ? -1 : 1;
        offsetMin = signo * (Number(m[7].slice(1, 3)) * 60 + Number(m[7].slice(3, 5)));
    }

    // hora local del archivo -> UTC -> Ecuador (UTC-5)
    const utc =
        Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) - offsetMin * 60 * 1000;
    const d = new Date(utc - 5 * 60 * 60 * 1000);
    const p = n => String(n).padStart(2, '0');

    return (
        `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
        `${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())} -0500`
    );
}

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

// [{ crudo, id }] de todos los canales presentes en el XML
function listarCanales(xml) {
    const lista = [];
    const re = /<channel\s+id="([^"]+)"/g;
    let m;

    while ((m = re.exec(xml)) !== null) {
        lista.push({ crudo: m[1], id: decodificar(m[1]) });
    }

    return lista;
}

async function obtenerEPGShare({ tag, canales, xml: xmlPrecargado }) {
    const xml = xmlPrecargado || (await descargarXMLTV(tag));
    const canalesArchivo = listarCanales(xml);

    // id crudo en el archivo -> id de salida
    const mapa = {};
    const encontrados = [];
    const noEncontrados = [];

    for (const canal of canales) {
        const objetivo = normalizar(canal.idFuente);

        // 1) coincidencia exacta; 2) coincidencia sin tildes/símbolos
        const hallado =
            canalesArchivo.find(c => c.id === canal.idFuente) ||
            canalesArchivo.find(c => normalizar(c.id) === objetivo);

        if (hallado) {
            mapa[hallado.crudo] = canal.id;
            encontrados.push(canal);
        } else {
            noEncontrados.push(canal);
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

        const start = /\bstart="([^"]*)"/.exec(atributos);
        const stop = /\bstop="([^"]*)"/.exec(atributos);

        if (!start || !stop) continue;

        programas.push({
            canal: mapa[canal[1]],
            start: aHoraEcuador(start[1], tag),
            stop: aHoraEcuador(stop[1], tag),
            cuerpo: m[2] // title, desc, etc. tal como vienen
        });
    }

    return {
        tag,
        encontrados,
        noEncontrados,
        programas,

        // Fragmentos XMLTV listos para pegar antes de </tv>
        xmlCanales: encontrados
            .map(
                c =>
                    `  <channel id="${escaparXML(c.id)}">\n    <display-name>${escaparXML(c.nombre)}</display-name>\n  </channel>`
            )
            .join('\n'),

        xmlProgramas: programas
            .map(
                p =>
                    `  <programme start="${p.start}" stop="${p.stop}" channel="${escaparXML(p.canal)}">${p.cuerpo}</programme>`
            )
            .join('\n'),

        // Para diagnóstico: todos los ids que trae el archivo
        idsArchivo: canalesArchivo.map(c => c.id)
    };
}

// Igual que obtenerEPGShare, pero cada canal puede traer su propio `tag`
// (si no lo trae usa `tag`). Un tag que falle no tumba a los demás.
async function obtenerEPGShareMulti({ tag: tagDefecto, canales }) {
    const grupos = {};

    for (const c of canales) {
        const t = c.tag || tagDefecto;
        (grupos[t] = grupos[t] || []).push(c);
    }

    const total = {
        encontrados: [],
        noEncontrados: [],
        programas: [],
        xmlCanales: [],
        xmlProgramas: []
    };

    for (const [tag, lista] of Object.entries(grupos)) {
        try {
            const r = await obtenerEPGShare({ tag, canales: lista });

            total.encontrados.push(...r.encontrados);
            total.noEncontrados.push(...r.noEncontrados);
            total.programas.push(...r.programas);
            if (r.xmlCanales) total.xmlCanales.push(r.xmlCanales);
            if (r.xmlProgramas) total.xmlProgramas.push(r.xmlProgramas);
        } catch (e) {
            console.error(`    ❌ Error con ${tag}:`, e.response?.status || e.message);
            total.noEncontrados.push(...lista);
        }
    }

    return {
        ...total,
        xmlCanales: total.xmlCanales.join('\n'),
        xmlProgramas: total.xmlProgramas.join('\n')
    };
}

module.exports = { obtenerEPGShare, obtenerEPGShareMulti, descargarXMLTV, listarCanales, normalizar };
