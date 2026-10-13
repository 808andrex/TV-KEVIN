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
const canales = [
  { id: 'espn.ar', nombre: 'ESPN Argentina', url: 'https://www.gatotv.com/canal/espn_argentina' },
  { id: 'espn2.ar', nombre: 'ESPN 2 Argentina', url: 'https://www.gatotv.com/canal/espn_2_argentina' },
  { id: 'espn3.ar', nombre: 'ESPN 3 Argentina', url: 'https://www.gatotv.com/canal/espn_3_ecuador' },
  { id: 'espn4.ec', nombre: 'ESPN 4', url: 'https://www.gatotv.com/canal/espn_4_ecuador' },
  { id: 'espn5.ec', nombre: 'ESPN 5', url: 'https://www.gatotv.com/canal/espn_5_ecuador' },
  { id: 'espn6.ec', nombre: 'ESPN 6', url: 'https://www.gatotv.com/canal/espn_6_ecuador' },
  { id: 'espn7.ec', nombre: 'ESPN 7', url: 'https://www.gatotv.com/canal/espn_7_ecuador' }
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
            // ⚠️ AQUÍ ESTÁ EL CAMBIO CLAVE: Agregamos el User-Agent para evitar el bloqueo en GitHub
            const respuesta = await axios.get(canal.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
                }
            });
            
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

            console.log(`    ✔️  ${contadorProgramas} programas añadidos.`);
            
            // Esperamos 2 segundos antes de ir al siguiente canal de la lista
            await esperar(2000);

        } catch (error) {
            console.error(`    ❌ Error al procesar ${canal.nombre}:`, error.message);
        }
    }

    // 3. Transformamos todo a texto y lo guardamos
    const xml = root.end({ prettyPrint: true });
    fs.writeFileSync('mi_guia.xml', xml);
    console.log('\n¡Proceso finalizado! Revisa el archivo "mi_guia.xml".');
}

generarEPG();