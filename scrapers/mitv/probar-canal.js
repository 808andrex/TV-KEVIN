const axios = require('axios');
const fs = require('fs');

async function probarCanal() {
    const url = 'https://mi.tv/ar/async/channel/fox-sports-hd/-300';

    try {
        const respuesta = await axios.get(url, {
            timeout: 20000,
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'text/html, */*',
                'Referer': 'https://mi.tv/ar/guide'
            }
        });

        const html = respuesta.data.toString();

        console.log('Estado HTTP:', respuesta.status);
        console.log('Content-Type:', respuesta.headers['content-type']);
        console.log('Tamaño:', html.length);

        fs.writeFileSync('mitv-canal.html', html, 'utf8');

        console.log('HTML guardado en mitv-canal.html');

        console.log('\n--- Fragmento inicial ---\n');
        console.log(html.slice(0, 5000));

        console.log('\n--- Palabras relacionadas con programas ---');

        for (const palabra of [
            'listings',
            'program',
            'title',
            'time',
            'channel',
            'schedule'
        ]) {
            console.log(
                `${palabra}:`,
                html.toLowerCase().includes(palabra.toLowerCase())
            );
        }
    } catch (error) {
        console.error(
            'Error:',
            error.response?.status || error.code || error.message
        );

        if (error.response?.data) {
            console.log(
                String(error.response.data).slice(0, 1000)
            );
        }
    }
}

probarCanal();