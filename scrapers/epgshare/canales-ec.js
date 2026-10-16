// scrapers/epgshare/canales-ec.js
//
// Canales del archivo EC1 de epgshare01.online (guía de Ecuador).
//   id         -> el que usas en tvg-id de lista.m3u (y en mi_guia.xml)
//   nombre     -> nombre que se muestra en la guía
//   idFuente   -> id EXACTO del canal dentro de EC1 (sin el prefijo "EC1#")
//
// No se repiten los que ya salen de gatotv en canales.js (ESPN 2/3/4, Cartoon
// Network, Nickelodeon, Disney Channel/Junior, Discovery Kids, TC y Teleamazonas).
// Si quieres usar la guía de EC1 para alguno de esos, bórralo de canales.js y
// agrégalo aquí con el mismo id.

const TAG = 'EC1';

const canales = [
    // ---------- Nacionales / Ecuador ----------
    // Ecuavisa: EC1 no trae programación; se usa la señal Internacional (archivo SV1).
    // Su parrilla puede diferir un poco de la señal local.
    { id: 'ecuavisa',        nombre: 'Ecuavisa',        tag: 'SV1', idFuente: 'Canal.Ecuavisa.Internacional.sv' },
    // RTS y Gamavisión: EC1 y SV1 vienen vacíos; ahora se prueban desde gatotv (ver canales.js).
    { id: 'ecuador_tv.ec',   nombre: 'Ecuador TV',      idFuente: 'Canal.Ecuador.TV.ec' },
    { id: 'hola_tv.ec',      nombre: '¡HOLA! TV',       idFuente: 'Canal.¡HOLA!.TV.ec' },
    { id: 'esne_tv.ec',      nombre: 'ESNE TV',         idFuente: 'Canal.ESNE.TV.ec' },
    { id: 'inti_network.ec', nombre: 'Inti Network',    idFuente: 'Canal.Inti.Network.ec' },
    { id: 'claro_tv.ec',     nombre: 'Claro TV',        idFuente: 'Canal.Claro.TV.ec' },

    // ---------- Deportes ----------
    { id: 'espn.ec',         nombre: 'ESPN',            idFuente: 'Canal.ESPN.(Ecuador).ec' },
    // GolTV: EC1 viene vacío; se usa la señal Latin America de Uruguay (UY1).
    { id: 'goltv.ec',        nombre: 'GolTV',           tag: 'UY1', idFuente: '[GOLTVL].GolTV.Latin.America.uy' },

    // ---------- Noticias ----------
    { id: 'cnn_espanol.ec',      nombre: 'CNN en Español',      idFuente: 'Canal.CNN.en.Español.ec' },
    { id: 'cnn_chile.ec',        nombre: 'CNN Chile',           idFuente: 'Canal.CNN.Chile.ec' },
    { id: 'bbc_world_news.ec',   nombre: 'BBC World News',      idFuente: 'Canal.BBC.World.News.ec' },
    { id: 'dw.ec',               nombre: 'DW Latinoamérica',    idFuente: 'Canal.DW.(Latinoamérica).ec' },
    { id: 'fox_news.ec',         nombre: 'Fox News',            idFuente: 'Canal.Fox.News.ec' },
    { id: 'tve_internacional.ec', nombre: 'TVE Internacional',  idFuente: 'Canal.TVE.Internacional.(Televisión.Española).ec' },
    { id: 'rai_international.ec', nombre: 'RAI International',  idFuente: 'Canal.RAI.International.ec' },
    { id: 'caracol_internacional.ec', nombre: 'Caracol Internacional', idFuente: 'Canal.Caracol.Internacional.ec' },
    { id: 'rcn_nuestra_tele.ec', nombre: 'RCN Nuestra Tele',    idFuente: 'Canal.RCN.Nuestra.Tele.(Internacional).ec' },
    { id: 'telefe_internacional.ec', nombre: 'Telefe Internacional', idFuente: 'Canal.Telefe.Internacional.ec' },
    { id: 'tv_chile.ec',         nombre: 'TV Chile',            idFuente: 'Canal.TV.Chile.ec' },
    { id: 'teleantioquia.ec',    nombre: 'Teleantioquia',       idFuente: 'Canal.Teleantioquia.ec' },
    { id: 'antena3.ec',          nombre: 'Antena 3',            idFuente: 'Canal.Antena.3.ec' },
    { id: 'tv_azteca_mundo.ec',  nombre: 'TV Azteca Mundo',     idFuente: 'Canal.TV.Azteca.Mundo.ec' },
    { id: 'las_estrellas.ec',    nombre: 'Las Estrellas',       idFuente: 'Canal.Las.Estrellas.(Ecuador).ec' },
    { id: 'telemundo.ec',        nombre: 'Telemundo',           idFuente: 'Canal.Telemundo.(Ecuador).ec' },
    { id: 'univision.ec',        nombre: 'Univisión',           idFuente: 'Canal.Univision.(Ecuador).ec' },

    // ---------- Infantil ----------
    { id: 'baby_tv.ec',      nombre: 'Baby TV',         idFuente: 'Canal.Baby.TV.(Latinoamérica).ec' },
    { id: 'nick_jr.ec',      nombre: 'Nick Jr.',        idFuente: 'Canal.Nick.Jr..(Ecuador).ec' },
    { id: 'zoomoo.ec',       nombre: 'ZooMoo',          idFuente: 'Canal.ZooMoo.Latinoamérica.ec' },

    // ---------- Películas y series ----------
    { id: 'amc.ec',          nombre: 'AMC',             idFuente: 'Canal.AMC.(Ecuador).ec' },
    { id: 'axn.ec',          nombre: 'AXN',             idFuente: 'Canal.AXN.(Ecuador).ec' },
    { id: 'cinecanal.ec',    nombre: 'Cinecanal',       idFuente: 'Canal.Cinecanal.(Ecuador).ec' },
    { id: 'cinelatino.ec',   nombre: 'Cinelatino',      idFuente: 'Canal.Cinelatino.ec' },
    { id: 'cinemax.ec',      nombre: 'Cinemax',         idFuente: 'Canal.Cinemax.(Ecuador).ec' },
    { id: 'de_pelicula.ec',  nombre: 'De Película',     idFuente: 'Canal.De.Película.ec' },
    { id: 'film_arts.ec',    nombre: 'Film & Arts',     idFuente: 'Canal.Film.&.Arts.ec' },
    { id: 'fx.ec',           nombre: 'FX',              idFuente: 'Canal.FX.(Ecuador).ec' },
    { id: 'golden.ec',       nombre: 'Golden',          idFuente: 'Canal.Golden.(Ecuador).ec' },
    { id: 'space.ec',        nombre: 'Space',           idFuente: 'Canal.Space.(Ecuador).ec' },
    { id: 'studio_universal.ec', nombre: 'Studio Universal', idFuente: 'Canal.Studio.Universal.(Ecuador).ec' },
    { id: 'tcm.ec',          nombre: 'TCM',             idFuente: 'Canal.TCM.(Ecuador).ec' },
    { id: 'tnt.ec',          nombre: 'TNT',             idFuente: 'Canal.TNT.(Ecuador).ec' },
    { id: 'universal_tv.ec', nombre: 'Universal TV',    idFuente: 'Canal.Universal.TV.(Ecuador).ec' },
    { id: 'usa_network.ec',  nombre: 'USA Network',     idFuente: 'Canal.USA.Network.(Ecuador).ec' },
    { id: 'warner_tv.ec',    nombre: 'Warner TV',       idFuente: 'Canal.Warner.TV.(Ecuador).ec' },
    { id: 'multipremier.ec', nombre: 'Multipremier',    idFuente: 'Canal.Multipremier.ec' },
    { id: 'comedy_central.ec', nombre: 'Comedy Central', idFuente: 'Canal.Comedy.Central.(Ecuador).ec' },
    { id: 'eurochannel.ec',  nombre: 'Eurochannel',     idFuente: 'Canal.Eurochannel.ec' },
    { id: 'europa_europa.ec', nombre: 'Europa Europa',  idFuente: 'Canal.Europa.Europa.ec' },

    // ---------- HBO y Paramount (otros archivos de epgshare01) ----------
    // CO1 tiene el mismo huso horario que Ecuador (UTC-5). Signature, Mundi y Plus solo están en MX1.
    { id: 'hbo.co',           nombre: 'HBO',             tag: 'CO1', idFuente: 'HBO.co' },
    { id: 'hbo2.co',          nombre: 'HBO 2',           tag: 'CO1', idFuente: 'HBO.2.co' },
    { id: 'hbo_family.co',    nombre: 'HBO Family',      tag: 'CO1', idFuente: 'HBO.Family.co' },
    { id: 'hbo_pop.co',       nombre: 'HBO Pop',         tag: 'CO1', idFuente: 'HBO.POP.co' },
    { id: 'hbo_xtreme.co',    nombre: 'HBO Xtreme',      tag: 'CO1', idFuente: 'HBO.XTREME.co' },
    { id: 'hbo_signature.mx', nombre: 'HBO Signature',   tag: 'MX1', idFuente: 'Canal.HBO.Signature.Latinoamérica.mx' },
    { id: 'hbo_mundi.mx',     nombre: 'HBO Mundi',       tag: 'MX1', idFuente: 'Canal.HBO.Mundi.mx' },
    { id: 'hbo_plus.mx',      nombre: 'HBO Plus',        tag: 'MX1', idFuente: 'Canal.HBO.Plus.mx' },
    // Paramount: CO1 viene vacío; se prueba Perú (PE1, también UTC-5). Alternativa: MX1 'Canal.Paramount.Channel.(México).mx'
    { id: 'paramount.ec',     nombre: 'Paramount Channel', tag: 'PE1', idFuente: 'PARAMOUNT.HD.(Paramount.HD).pe' },

    // ---------- Novelas ----------
    { id: 'tnt_novelas.ec',  nombre: 'TNT Novelas',     idFuente: 'Canal.TNT.Novelas.(Ecuador).ec' },
    { id: 'tlnovelas.ec',    nombre: 'TLNovelas',       idFuente: 'Canal.TLNovelas.(Ecuador).ec' },
    { id: 'rcn_novelas.ec',  nombre: 'RCN Novelas',     idFuente: 'Canal.RCN.Novelas.ec' },
    { id: 'pasiones.ec',     nombre: 'Pasiones',        idFuente: 'Canal.Pasiones.(Latinoamérica).ec' },
    { id: 've_plus.ec',      nombre: 'Ve Plus',         idFuente: 'Canal.Ve.Plus.(Latinoamérica).ec' },
    { id: 'zona_latina.ec',  nombre: 'Zona Latina',     idFuente: 'Canal.Zona.Latina.ec' },

    // ---------- Cultura / documentales ----------
    { id: 'animal_planet.ec',   nombre: 'Animal Planet',     idFuente: 'Canal.Animal.Planet.(Ecuador).ec' },
    { id: 'discovery_home_health.ec', nombre: 'Discovery Home & Health', idFuente: 'Canal.Discovery.Home.&.Health.(Ecuador).ec' },
    { id: 'discovery_science.ec', nombre: 'Discovery Science', idFuente: 'Canal.Discovery.Science.(Latinoamérica).ec' },
    { id: 'discovery_theater.ec', nombre: 'Discovery Theater', idFuente: 'Canal.Discovery.Theater.(Latinoamérica).ec' },
    { id: 'discovery_turbo.ec',   nombre: 'Discovery Turbo',   idFuente: 'Canal.Discovery.Turbo.(Latinoamérica).ec' },
    { id: 'discovery_world.ec',   nombre: 'Discovery World',   idFuente: 'Canal.Discovery.World.Latinoamérica.ec' },
    { id: 'investigation_discovery.ec', nombre: 'Investigation Discovery', idFuente: 'Canal.Investigation.Discovery.(Ecuador).ec' },
    { id: 'history.ec',      nombre: 'History',         idFuente: 'Canal.History.(Chile).ec' },
    { id: 'history2.ec',     nombre: 'History 2',       idFuente: 'Canal.History.2.(Ecuador).ec' },
    { id: 'tlc.ec',          nombre: 'TLC',             idFuente: 'Canal.TLC.(Ecuador).ec' },
    { id: 'a_e.ec',          nombre: 'A&E',             idFuente: 'Canal.A&E.(Ecuador).ec' },
    { id: 'lifetime.ec',     nombre: 'Lifetime',        idFuente: 'Canal.Lifetime.(Ecuador).ec' },
    { id: 'elgourmet.ec',    nombre: 'El Gourmet',      idFuente: 'Canal.Elgourmet.ec' },
    { id: 'e_entertainment.ec', nombre: 'E! Entertainment', idFuente: 'Canal.E!.Entertainment.Television.(Ecuador).ec' },
    { id: 'ewtn.ec',         nombre: 'EWTN en Español', idFuente: 'Canal.EWTN.en.Español.ec' },
    { id: 'dhe.ec',          nombre: 'DHE',             idFuente: 'Canal.DHE.ec' },
    { id: 'htv.ec',          nombre: 'HTV',             idFuente: 'Canal.HTV.ec' },

    // ---------- Música ----------
    { id: 'mtv.ec',          nombre: 'MTV',             idFuente: 'Canal.MTV.(Ecuador).ec' },
    { id: 'telehit.ec',      nombre: 'Telehit',         idFuente: 'Canal.Telehit.ec' },

    // ---------- Antes venían de gatotv (que bloquea a GitHub Actions) ----------
    // Mismos ids que ya usas en lista.m3u.
    { id: 'espn2.ar',           nombre: 'ESPN 2',          idFuente: 'Canal.ESPN.2.(Ecuador).ec' },
    { id: 'espn3.ar',           nombre: 'ESPN 3',          idFuente: 'Canal.ESPN.3.(Ecuador).ec' },
    { id: 'espn4.ec',           nombre: 'ESPN 4',          idFuente: 'Canal.ESPN.4.(Ecuador).ec' },
    { id: 'cartoon-network.ec', nombre: 'Cartoon Network', idFuente: 'Canal.Cartoon.Network.(Ecuador).ec' },
    { id: 'nickelodeon.ec',     nombre: 'Nickelodeon',     idFuente: 'Canal.Nickelodeon.(Ecuador).ec' },
    { id: 'disney_channel.ec',  nombre: 'Disney Channel',  idFuente: 'Canal.Disney.Channel.(Ecuador).ec' },
    { id: 'disney_junior.ec',   nombre: 'Disney Junior',   idFuente: 'Canal.Disney.Junior.(Ecuador).ec' },
    { id: 'discovery_kids.ec',  nombre: 'Discovery Kids',  idFuente: 'Canal.Discovery.Kids.(Ecuador).ec' },
    { id: 'tc_television',      nombre: 'TC Television',   idFuente: 'Canal.TC.Televisión.ec' }
];

module.exports = { TAG, canales };
