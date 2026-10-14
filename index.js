const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { create } = require('xmlbuilder2');

// Importamos los canales
const canales = require('./canales');

// Importamos el scraper funcional de mi.tv
const { obtenerProgramacion } = require('./scrapers/mitv/scraper');

// Scraper de DSPORTS 1, 2 y + (fuente: epgshare01.online)
const { obtenerDSports } = require('./scrapers/directv/scraper');

const esperar = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));

// Formatea la fecha y la hora para XMLTV
function formatearFecha(horaStr, zonaHoraria) {
    const fecha = new Date();

    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    const horaLimpia = horaStr.replace(':', '').trim();

    return `${year}${month}${day}${horaLimpia}00 ${zonaHoraria}`;
}

// Convierte una hora HH:mm a minutos desde medianoche
function horaAMinutos(horaStr) {
    const [horas, minutos] = horaStr.split(':').map(Number);

    return horas * 60 + minutos;
}

// Genera el archivo XMLTV
async function generarEPG() {
    console.log('Iniciando generador de EPG múltiple...\n');

    const root = create({
        version: '1.0',
        encoding: 'UTF-8'
    }).ele('tv');

    for (const canal of canales) {
        console.log(`📡 Procesando canal: ${canal.nombre} ...`);

        root.ele('channel', { id: canal.id })
            .ele('display-name')
            .txt(canal.nombre)
            .up()
            .up();

        try {
            let contadorProgramas = 0;

            // ==========================================
            // GATOTV
            // ==========================================
            if (canal.url.includes('gatotv.com')) {
                const respuesta = await axios.get(canal.url, {
                    timeout: 20000,
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                        'Accept':
                            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language':
                            'es-ES,es;q=0.9,en;q=0.8'
                    }
                });

                const $ = cheerio.load(respuesta.data);

                $('table tr').each((i, elemento) => {
                    const columnas = $(elemento).find('td');

                    const horaInicio = columnas.eq(0).text().trim();
                    const horaFin = columnas.eq(1).text().trim();

                    const columnaTitulo =
                        columnas.eq(3).length > 0 ? 3 : 2;

                    const titulo = columnas
                        .eq(columnaTitulo)
                        .text()
                        .replace(/\s+/g, ' ')
                        .trim();

                    if (
                        horaInicio.includes(':') &&
                        horaFin.includes(':') &&
                        titulo &&
                        horaInicio.length <= 5 &&
                        !titulo.includes('Horarios para hoy')
                    ) {
                        const start = formatearFecha(
                            horaInicio,
                            '-0500'
                        );

                        const stop = formatearFecha(
                            horaFin,
                            '-0500'
                        );

                        root.ele('programme', {
                            start,
                            stop,
                            channel: canal.id
                        })
                            .ele('title')
                            .txt(titulo)
                            .up()
                            .up();

                        contadorProgramas++;
                    }
                });

            // ==========================================
            // MI.TV
            // ==========================================
            } else if (canal.url.includes('mi.tv')) {
                // Extraemos el identificador del canal
                // Ejemplo: fox-sports-hd
                const partesURL = new URL(canal.url).pathname
                    .split('/')
                    .filter(Boolean);

                const idCanal = partesURL[partesURL.length - 1];

                // Usamos el scraper que ya funciona
                const programas = await obtenerProgramacion(idCanal);

                console.log(
                    `    Programas encontrados en mi.tv: ${programas.length}`
                );

                for (let i = 0; i < programas.length; i++) {
                    const programa = programas[i];
                    const siguiente = programas[i + 1];

                    const start = formatearFecha(
                        programa.hora,
                        '-0300'
                    );

                    let horaFin;

                    if (siguiente) {
                        horaFin = siguiente.hora;
                    } else {
                        // Duración provisional de una hora
                        const minutos = horaAMinutos(programa.hora) + 60;

                        const horasFin = Math.floor(minutos / 60) % 24;
                        const minutosFin = minutos % 60;

                        horaFin =
                            String(horasFin).padStart(2, '0') +
                            ':' +
                            String(minutosFin).padStart(2, '0');
                    }

                    const stop = formatearFecha(
                        horaFin,
                        '-0300'
                    );

                    const elementoPrograma = root.ele('programme', {
                        start,
                        stop,
                        channel: canal.id
                    });

                    elementoPrograma
                        .ele('title')
                        .txt(programa.titulo)
                        .up();

                    if (programa.subtitulo) {
                        elementoPrograma
                            .ele('sub-title')
                            .txt(programa.subtitulo)
                            .up();
                    }

                    if (programa.descripcion) {
                        elementoPrograma
                            .ele('desc')
                            .txt(programa.descripcion)
                            .up();
                    }

                    contadorProgramas++;
                }

            } else {
                console.warn(
                    `    ⚠️ No existe un scraper para ${canal.url}`
                );
            }

            console.log(
                `    ✔️ ${contadorProgramas} programas añadidos.`
            );

            // Pausa entre canales para reducir las solicitudes
            await esperar(2000);

        } catch (error) {
            console.error(
                `    ❌ Error al procesar ${canal.nombre}:`,
                error.response?.status || error.message
            );
        }
    }

    // Generamos el XML
    let xml = root.end({
        prettyPrint: true
    });

    // ==========================================
    // DSPORTS 1, 2 y + (epgshare01.online)
    // ==========================================
    try {
        console.log('\n📡 Procesando DSPORTS 1, 2 y + ...');

        const dsports = await obtenerDSports({ fuente: 'DIRECTVSPORTS1' });

        // Se usa una función como reemplazo para que los '$' del texto no se interpreten
        xml = xml.replace(
            '</tv>',
            () => `${dsports.xmlCanales}\n${dsports.xmlProgramas}\n</tv>`
        );

        console.log(
            `    ✔️ ${dsports.programas.length} programas añadidos a ` +
            `${dsports.canalesEncontrados.length} canales DSPORTS.`
        );
    } catch (error) {
        console.error(
            '    ❌ Error al procesar DSPORTS:',
            error.response?.status || error.message
        );
    }

    fs.writeFileSync('mi_guia.xml', xml, 'utf8');

    console.log(
        '\n¡Proceso finalizado! Revisa el archivo "mi_guia.xml".'
    );
}

generarEPG();