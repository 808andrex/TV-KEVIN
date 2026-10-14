const axios = require('axios');
const cheerio = require('cheerio');

async function extraerProgramacion() {
    const canal = 'fox-sports-hd';
    const zonaHoraria = -300;

    const url =
        `https://mi.tv/ar/async/channel/${canal}/${zonaHoraria}`;

    try {
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

            const subtitulo = item
                .find('.sub-title')
                .first()
                .text()
                .trim();

            const descripcion = item
                .find('.synopsis')
                .first()
                .text()
                .trim();

            if (hora && titulo) {
                programas.push({
                    hora,
                    titulo,
                    subtitulo,
                    descripcion
                });
            }
        });

        console.log('Canal:', canal);
        console.log('Programas encontrados:', programas.length);
        console.log(JSON.stringify(programas, null, 2));
    } catch (error) {
        console.error(
            'Error:',
            error.response?.status || error.code || error.message
        );
    }
}

extraerProgramacion();