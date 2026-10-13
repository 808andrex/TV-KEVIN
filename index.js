const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { create } = require('xmlbuilder2');

// Función para pausar el script (evita que GatoTV nos bloquee)
const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function formatearFecha(horaStr) {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const horaLimpia = horaStr.replace(':', '');
    return `${year}${month}${day}${horaLimpia}00 -0300`;
}

// 📌 AQUÍ CONFIGURAS TU LISTA DE CANALES
// Asegúrate de que el 'id' coincida EXACTAMENTE con el tvg-id de tu lista .m3u
const canales = [
  { id: 'espn.ar', nombre: 'ESPN Argentina', url: 'https://www.gatotv.com/canal/espn_argentina' },
  { id: 'espn3.ar', nombre: 'ESPN 3', url: 'https://www.gatotv.com/canal/espn_3_argentina' },
  { id: 'espn4.ec', nombre: 'ESPN 4', url: 'https://www.gatotv.com/canal/espn_4_ecuador' },
  { id: 'espn5.ec', nombre: 'ESPN 5', url: 'https://www.gatotv.com/canal/espn_5_ecuador' },
    // Añade más canales así (separados por coma):
    // { id: 'tyc_sports', nombre: 'TyC Sports', url: 'https://www.gatotv.com/canal/tyc_sports' },
    // { id: 'telefe', nombre: 'Telefe', url: 'https://www.gatotv.com/canal/telefe' }
];

async function generarEPG() {
    console.log('Iniciando generador de EPG múltiple...\n');
    
    // 1. Iniciamos la estructura base del XML
    const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('tv');

    // 2. Iteramos sobre nuestra lista de canales
    for (const canal of canales) {
        console.log(`📡 Procesando canal: ${canal.nombre} ...`);
        
        // Añadimos la información del canal al XML
        root.ele('channel', { id: canal.id })
            .ele('display-name').txt(canal.nombre).up()
            .up();

        try {
            const respuesta = await axios.get(canal.url);
            const $ = cheerio.load(respuesta.data);
            let contadorProgramas = 0;

            $('table tr').each((i, elemento) => {
                const horaInicio = $(elemento).find('td').eq(0).text().trim();
                const horaFin = $(elemento).find('td').eq(1).text().trim();
                const columnaTitulo = $(elemento).find('td').eq(3).length > 0 ? 3 : 2;
                let titulo = $(elemento).find('td').eq(columnaTitulo).text().replace(/\s+/g, ' ').trim();

                if (horaInicio.includes(':') && titulo && horaInicio.length <= 5 && !titulo.includes('Horarios para hoy')) {
                    const start = formatearFecha(horaInicio);
                    const stop = formatearFecha(horaFin);
                    
                    root.ele('programme', { start: start, stop: stop, channel: canal.id })
                        .ele('title').txt(titulo).up()
                        .up();
                    
                    contadorProgramas++;
                }
            });

            console.log(`   ✔️  ${contadorProgramas} programas añadidos.`);
            
            // Esperamos 2 segundos antes de ir al siguiente canal de la lista
            await esperar(2000);

        } catch (error) {
            console.error(`   ❌ Error al procesar ${canal.nombre}:`, error.message);
        }
    }

    // 3. Transformamos todo a texto y lo guardamos
    const xml = root.end({ prettyPrint: true });
    fs.writeFileSync('mi_guia.xml', xml);
    console.log('\n¡Proceso finalizado! Revisa el archivo "mi_guia.xml".');
}

generarEPG();