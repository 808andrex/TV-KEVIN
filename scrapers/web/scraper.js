// scrapers/web/scraper.js
//
// Lee la programación de la página oficial de un canal (TVC, RTS).
// Ambas webs usan la misma plantilla de WordPress y la guía viene incrustada en la
// página como JSON (<script type="application/json">), con la semana completa:
//
//   schedule.days.monday | tuesday | ... | sunday  ->  [
//     { show: { name }, customName, startsAt: "5:00:00 pm", endsAt: "5:59:59 pm",
//       enabled: "true", hideSchedule: "false", ... }
//   ]
//
// Devuelve [{ hora: "HH:mm", titulo, descripcion }] de HOY (hora de Ecuador),
// ordenado por hora, en el mismo formato que usa el scraper de mi.tv.
//
// Prueba suelta (sin tocar mi_guia.xml):
//   node scrapers/web/scraper.js https://www.tvc.com.ec/programacion/
//   node scrapers/web/scraper.js https://www.rts.com.ec/programacion/ friday   (otro día)

const axios = require('axios');
const cheerio = require('cheerio');

const limpiar = texto => String(texto || '').replace(/\s+/g, ' ').trim();

// Día de la semana de hoy en Ecuador, en inglés y minúsculas: "friday"
function diaHoyEcuador() {
    return new Date()
        .toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/Guayaquil' })
        .toLowerCase();
}

// "5:00:00 pm" / "12:00:00 am" / "17:00" -> "17:00" / "00:00"; null si no es una hora
function a24h(valor) {
    const m = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*([ap])?\.?\s*m?\.?$/i.exec(String(valor || '').trim());

    if (!m) return null;

    let horas = Number(m[1]);

    if (m[3]) {
        const pm = m[3].toLowerCase() === 'p';

        if (horas === 12) horas = pm ? 12 : 0;
        else if (pm) horas += 12;
    }

    if (horas > 23 || Number(m[2]) > 59) return null;

    return String(horas).padStart(2, '0') + ':' + m[2];
}

const minutos = hora => {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
};

// Busca entre los bloques JSON de la página el que trae schedule.days
function extraerAgenda(html) {
    const $ = cheerio.load(html);
    let agenda = null;

    $('script[type="application/json"]').each((_, el) => {
        if (agenda) return;

        const texto = $(el).contents().text().trim();

        // Evita parsear los bloques pequeños que no tienen la guía
        if (!texto.includes('"schedule"')) return;

        try {
            const datos = JSON.parse(texto);

            if (datos && datos.schedule && datos.schedule.days) agenda = datos.schedule.days;
        } catch (e) {
            // otro bloque JSON, se ignora
        }
    });

    return { agenda, titulo: $('title').text().trim() };
}

async function obtenerProgramacionWeb(url, dia = diaHoyEcuador()) {
    const respuesta = await axios.get(url, {
        timeout: 20000,
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'es-EC,es;q=0.9'
        }
    });

    const { agenda, titulo } = extraerAgenda(String(respuesta.data));

    if (!agenda || !Array.isArray(agenda[dia])) {
        console.warn(
            `    ⚠️ ${url}: no se encontró schedule.days.${dia} en la página ` +
            `(HTTP ${respuesta.status}, título: "${titulo}"). ` +
            `Es posible que el sitio haya cambiado su estructura.`
        );
        return [];
    }

    const porHora = new Map();

    for (const item of agenda[dia]) {
        if (!item) continue;

        // Entradas vacías/desactivadas (startsAt "null", enabled "false")
        if (String(item.enabled) === 'false' || String(item.hideSchedule) === 'true') continue;

        const hora = a24h(item.startsAt);
        const nombre = limpiar(item.customName) || limpiar(item.show && item.show.name);

        if (!hora || !nombre) continue;

        const descripcion =
            item.show && typeof item.show.description === 'string'
                ? limpiar(item.show.description)
                : '';

        // Si dos entradas caen a la misma hora, se queda la primera
        if (!porHora.has(hora)) porHora.set(hora, { hora, titulo: nombre, descripcion });
    }

    return [...porHora.values()].sort((a, b) => minutos(a.hora) - minutos(b.hora));
}

module.exports = { obtenerProgramacionWeb };

// Ejecución directa: muestra lo que encontró
if (require.main === module) {
    const url = process.argv[2];
    const dia = (process.argv[3] || diaHoyEcuador()).toLowerCase();

    if (!url) {
        console.log('Uso: node scrapers/web/scraper.js <url de /programacion/> [monday|tuesday|...]');
        process.exit(1);
    }

    obtenerProgramacionWeb(url, dia)
        .then(lista => {
            console.log(`${lista.length} programas en ${url} (${dia})\n`);
            lista.forEach(p =>
                console.log(`  ${p.hora}  ${p.titulo}${p.descripcion ? '  —  ' + p.descripcion : ''}`)
            );
        })
        .catch(e => console.error('Error:', e.response?.status || e.message));
}
