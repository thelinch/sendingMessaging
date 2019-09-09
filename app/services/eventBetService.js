const axios = require("axios");
const gameRepository = require("../models/game");
const userRepository = require("../models/user");
const sessionRepository = require("../models/sessions");
const moment = require("moment");
const crypto = require("crypto");
var eventBetService = {}
/**
 * mtodo para crear el sign de seguridad
 * @param(params) es el query del request ,
 * @param(secretKey) la llave privada
 */
eventBetService.createSign = function (params = {}, secretKey) {
    let self = this;
    if (params.hasOwnProperty("clientId")) {
        delete params["clientId"]
    }
    params = self.sordObjectRecursive(params);
    let paramString = self.implodeRecursive(params);
    paramString += secretKey;
    return crypto.createHash("sha256").update(paramString).digest("base64");
}
eventBetService.sordObjectRecursive = function (obj) {
    let self = this
    var keys = Object.keys(obj).sort();
    var sortedObject = {}
    keys.forEach((key) => {
        let value = obj[key]
        if (value instanceof Object || value instanceof Array) {
            sortedObject[key] = self.sordObjectRecursive(value)
        } else {
            sortedObject[key] = value
        }
    })
    return sortedObject;
}
eventBetService.implodeRecursive = function (obj, separator = "") {
    var str = "";
    for (let key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        let value = obj[key]
        if (value instanceof Object || value instanceof Array) {
            str += this.implodeRecursive(value, separator) + separator;
        } else {
            str += value + separator;
        }
    }
    return str.substring(0, str.length - separator.length);
}
/**
 * Crea la url del loby de apuestas.
 * @param(params) la query del request
 * @param(clientId) el id del casino.
 * @param(url) a url del servidor de eventBet.
 * @param(privateKey) llave privada .
 * @returns la url del lobby a la que el usuario ingresara a apostar.
 */
eventBetService.getUrlLobby = async function (params, clientId, url, privateKey) {
    let urlSession;
    try {
        let user = await userRepository.getById(1);
        let data = {
            nick: user.username,
        }
        let sign = this.createSign(data, privateKey);
        urlSession = await axios.post(url + "/v2/app/users/" + user.clientcode + "/session?clientId=" + clientId, data, { headers: { Authorization: sign } })
    } catch (error) {
        console.log(error)
    }
    return urlSession;
}

module.exports = eventBetService;