const gameService = require("../services/gameService")
const axios = require('axios');
var xml2js = require('xml2js');

var joinAgregatorService = {}
joinAgregatorService.games = async function () {
    var games = [];
    const [joingames, betsoft, spinomenal, tomhorn] = await gameService.all();
    const [joingamesData, betsofData, spinomenalData, tomhornData] = await axios.all([joingames, betsoft, spinomenal, tomhorn]);
    parser = new xml2js.Parser()
    parser.parseString(joingamesData.data, (err, result) => {
        games = result.DATA.RESPONSE[0].GAMES[0].GAME
    })
    games = games.map(function (g) { g.brand = 'joingames'; g.provider = 'joinagregator'; return g; });

    parser.parseString(betsofData.data, (err, result) => {
        var g2 = result.DATA.RESPONSE[0].GAMES[0].GAME;
        g2 = g2.map(function (g) { g.brand = 'betsoft'; g.provider = 'joinagregator'; return g; });
        for (var i = 0; i < g2.length; i++) { games.push(g2[i]); }
    })

    parser.parseString(spinomenalData.data, (err, result) => {
        var g = result.DATA.RESPONSE[0].GAMES[0].GAME;
        g = g.map(function (g) { g.brand = 'spinomenal'; g.provider = 'joinagregator'; return g; });
        for (var i = 0; i < g.length; i++) { games.push(g[i]); }
    })

    parser.parseString(tomhornData.data, (err, result) => {
        var g = result.DATA.RESPONSE[0].GAMES[0].GAME;
        g = g.map(function (g) { g.brand = 'tomhorn'; g.provider = 'joinagregator'; return g; });
        for (var i = 0; i < g.length; i++) { games.push(g[i]); }
    })
    return games;

    /*  gameService.all().then(axios.spread(function (joingames, betsoft, spinomenal, tomhorn) {
          parser = new xml2js.Parser()
          parser.parseString(joingames.data, (err, result) => {
              games = result.DATA.RESPONSE[0].GAMES[0].GAME
          })
          games = games.map(function (g) { g.brand = 'joingames'; g.provider = 'joinagregator'; return g; });
  
          parser.parseString(betsoft.data, (err, result) => {
              var g2 = result.DATA.RESPONSE[0].GAMES[0].GAME;
              g2 = g2.map(function (g) { g.brand = 'betsoft'; g.provider = 'joinagregator'; return g; });
              for (var i = 0; i < g2.length; i++) { games.push(g2[i]); }
          })
  
          parser.parseString(spinomenal.data, (err, result) => {
              var g = result.DATA.RESPONSE[0].GAMES[0].GAME;
              g = g.map(function (g) { g.brand = 'spinomenal'; g.provider = 'joinagregator'; return g; });
              for (var i = 0; i < g.length; i++) { games.push(g[i]); }
          })
  
          parser.parseString(tomhorn.data, (err, result) => {
              var g = result.DATA.RESPONSE[0].GAMES[0].GAME;
              g = g.map(function (g) { g.brand = 'tomhorn'; g.provider = 'joinagregator'; return g; });
              for (var i = 0; i < g.length; i++) { games.push(g[i]); }
          })
          return games;
  
      })).catch(error => {
          console.log(error);
      });*/
}




module.exports = joinAgregatorService;