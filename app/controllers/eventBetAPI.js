const gameService = require("../services/gameService");
const eventBetService = require("../services/eventBetService")
const urlApi = "https://lapokers.evenbetpoker.com/api/web"
const clientId = "uni-o4jkTth0mqH";
const privateKey = "HPhsfajuuXOCVpA8JDA7kuYrA5qxFM";
exports.view = async function (req, res) {
    let urlLoby = await eventBetService.getUrlLobby(req.query, clientId, urlApi, privateKey);
    res.render("eventBet/view", { urlLoby });
}   