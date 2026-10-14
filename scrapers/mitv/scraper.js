const axios = require('axios');
const cheerio = require('cheerio');

async function obtenerProgramacion(canal) {
    const url = `https://mi.tv/ar/async/channel/${canal}/-300`;

    const respuesta = await axios.get(url, {
        timeout: 20000,
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'text/html, */*',
            'Referer': 'https://mi.tv/ar/'
        }
    });

    const $ = cheerio.load(respuesta.data);
    const programas = [];

    $('#listings ul.broadcasts li').each((_, elemento) => {
        const item = $(elemento);

        const hora = item.find('.time').first().text().trim();
        const titulo = item.find('h2').first().text().trim();
        const subtitulo = item.find('.sub-title').first().text().trim();
        const descripcion = item.find('.synopsis').first().text().trim();

        if (hora && titulo && /^\d{2}:\d{2}$/.test(hora)) {
            programas.push({
                hora,
                titulo,
                subtitulo,
                descripcion
            });
        }
    });

    return programas;
}

module.exports = { obtenerProgramacion };