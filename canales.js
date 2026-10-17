// canales.js
//
// Canales que se sacan con los scrapers de gatotv.com y mi.tv.
// El resto sale de epgshare01.online:
//   - scrapers/epgshare/canales-ec.js  -> canales de Ecuador (EC1, SV1, UY1)
//   - scrapers/directv/scraper.js      -> DSPORTS 1, 2 y +

const canales = [
  // ---- gatotv.com (funciona en tu PC; bloquea a GitHub Actions) ----
  { id: 'espn.ar', nombre: 'ESPN Argentina', url: 'https://www.gatotv.com/canal/espn_argentina' },
  { id: 'espn5.ec', nombre: 'ESPN 5', url: 'https://www.gatotv.com/canal/espn_5_ecuador' },
  { id: 'espn6.ec', nombre: 'ESPN 6', url: 'https://www.gatotv.com/canal/espn_6_ecuador' },
  { id: 'espn7.ec', nombre: 'ESPN 7', url: 'https://www.gatotv.com/canal/espn_7_ecuador' },
  { id: 'espn.premium', nombre: 'ESPN Premium', url: 'https://www.gatotv.com/canal/espn_premium_chile' },
  { id: 'cartoonito.ec', nombre: 'Cartoonito', url: 'https://www.gatotv.com/canal/cartoonito_ecuador' },
  { id: 'teleamazonas', nombre: 'Teleamazonas', url: 'https://www.gatotv.com/canal/teleamazonas' },
  { id: 'espn.co', nombre: 'ESPN co', url: 'https://www.gatotv.com/canal/espn_colombia' },
  { id: 'gamavision.ec', nombre: 'Gamavisión', url: 'https://www.gatotv.com/canal/gamavision' },
  { id: 'tyc_sports.ar', nombre: 'TyC Sports', url: 'https://www.gatotv.com/canal/tyc_sports' },

  // ---- página oficial del canal (scrapers/web/scraper.js) ----
  { id: 'tvc', nombre: 'TVC', url: 'https://www.tvc.com.ec/programacion/' },
  { id: 'rts', nombre: 'RTS', url: 'https://www.rts.com.ec/programacion/' },

  // ---- mi.tv (funciona también en GitHub Actions) ----
  { id: 'fox.ar', nombre: 'FOX Sports', url: 'https://mi.tv/ar/canales/fox-sports-hd' },
  { id: 'fox2.ar', nombre: 'FOX Sports 2 ', url: 'https://mi.tv/ar/canales/fox-sports-2' },
  { id: 'fox3.ar', nombre: 'FOX Sports 3 ', url: 'https://mi.tv/ar/canales/fox-sports-3' },
  { id: 'tnt_sports.ar', nombre: 'TNT Sports ', url: 'https://mi.tv/ar/canales/tnt-sports' }

  // Ahora salen de EC1 (canales-ec.js): ESPN 2, 3 y 4, Cartoon Network, Nickelodeon,
  // Disney Channel, Disney Junior, Discovery Kids, TC Televisión, Ecuavisa y RTS.
  // tvc: sin fuente por ahora.
];

module.exports = canales;
