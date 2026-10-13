const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const { create } = require('xmlbuilder2');

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
    console.log('Iniciando generador de EPG con un navegador real (Puppeteer)...\n');
    
    const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('tv');

    // Lanzamos el navegador invisible. Los argumentos son vitales para GitHub Actions
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    
    // Simulamos ser una persona usando Chrome en Windows
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

    for (const canal of canales) {
        console.log(`📡 Procesando canal: ${canal.nombre} ...`);
        
        root.ele('channel', { id: canal.id })
            .ele('display-name').txt(canal.nombre).up()
            .up();

        try {
            // Navegamos a la URL y esperamos a que el tráfico de red se detenga (JS cargado)
            await page.goto(canal.url, { waitUntil: 'networkidle2', timeout: 45000 });
            
            // Extraemos todo el HTML ya renderizado por el navegador
            const content = await page.content();
            const $ = cheerio.load(content);
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
            await esperar(3000); // Pausa ligeramente mayor para no saturar al servidor

        } catch (error) {
            console.error(`    ❌ Error al procesar ${canal.nombre}:`, error.message);
        }
    }

    await browser.close(); // Cerramos el navegador

    const xml = root.end({ prettyPrint: true });
    fs.writeFileSync('mi_guia.xml', xml);
    console.log('\n¡Proceso finalizado! Revisa el archivo "mi_guia.xml".');
}

generarEPG();