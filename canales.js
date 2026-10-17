// canales.js
//
// Canales que se sacan con los scrapers de gatotv.com y mi.tv.
// El resto sale de epgshare01.online:
//   - scrapers/epgshare/canales-ec.js  -> canales de Ecuador (EC1, SV1, UY1, AR1, CO1...)
//   - scrapers/directv/scraper.js      -> DSPORTS 1, 2 y +

const canales = [
  // ---- gatotv.com ----
  // OJO: gatotv muestra la hora según la ubicación de quien lo visita. Desde tu PC (Ecuador)
  // sale bien, pero desde GitHub Actions sale corrida (2 h antes en horario de verano de EE. UU.).
  // Por eso aquí solo quedan los canales que no existen en epgshare01.
  { id: 'espn.premium', nombre: 'ESPN Premium', url: 'https://www.gatotv.com/canal/espn_premium_chile' },
  { id: 'teleamazonas', nombre: 'Teleamazonas', url: 'https://www.gatotv.com/canal/teleamazonas' },
  { id: 'gamavision.ec', nombre: 'Gamavisión', url: 'https://www.gatotv.com/canal/gamavision' },

  // ---- página oficial del canal (scrapers/web/scraper.js) ----
  { id: 'tvc', nombre: 'TVC', url: 'https://www.tvc.com.ec/programacion/' },
  { id: 'rts', nombre: 'RTS', url: 'https://www.rts.com.ec/programacion/' },

  // ---- mi.tv (funciona también en GitHub Actions) ----
  { id: 'fox.ar', nombre: 'FOX Sports', url: 'https://mi.tv/ar/canales/fox-sports-hd' },
  { id: 'fox2.ar', nombre: 'FOX Sports 2 ', url: 'https://mi.tv/ar/canales/fox-sports-2' },
  { id: 'fox3.ar', nombre: 'FOX Sports 3 ', url: 'https://mi.tv/ar/canales/fox-sports-3' },
  { id: 'tnt_sports.ar', nombre: 'TNT Sports ', url: 'https://mi.tv/ar/canales/tnt-sports' }

  // Ahora salen de epgshare01 (canales-ec.js): ESPN 2, 3 y 4, ESPN Argentina, ESPN 5, 6 y 7,
  // ESPN Colombia, TyC Sports, Cartoonito, Cartoon Network, Nickelodeon, Disney Channel,
  // Disney Junior, Discovery Kids, TC Televisión, Ecuavisa y RTS.
  // tvc: sin fuente por ahora.
];

module.exports = canales;
