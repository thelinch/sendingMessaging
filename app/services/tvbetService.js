const axios = require("axios");
const gameRepository = require("../models/game");
const userRepository = require("../models/user");
const sessionRepository = require("../models/sessions");
const moment = require("moment");
const crypto = require("crypto");
var tvBetService = {};
const paymentType = [
  { cd: -1, description: "betting" },
  { cd: 1, description: "payment" },
  { cd: 2, description: "refund rate" },
  { cd: 4, description: "payout of the jackpot" }
]; //
const urlSign = "http://apiuniversalsoft.com:81/hashsign/hashSign.php";
/**
 * En cada respuesta que se da al servidor TvBet siempre se mandara estos parametros
 * {bodyRequest} es el cuerpo de la peticion que se esta haciendo,
 * {privateKey} la llave privada que se proporciono
 *
 */
tvBetService.buildGlobalBodyResponseTvBet = async function () {
  /*let si = crypto
    .createHash("md5")
    .update(JSON.stringify(bodyRequest).toString() + privateKey)
    .digest("base64");*/

  let seconds = this.getSeconds();
  return {
    ti: seconds,
    sc: true,
    cd: 0,
    er: ""
  };
}
tvBetService.generateSign = async function (body) {
  var headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/text'
  }
  let signGenerate = await axios.post(urlSign, body, headers);
  return signGenerate.data;
}
tvBetService.getSeconds = function () {
  return moment()
    .diff(moment("1970/01/01", "YYYY/MM/DD"), "seconds")
    .valueOf();
}
tvBetService.getUserData = async () => {
  let val;
  let user = await userRepository.getById(1);
  val = {
    uid: user.clientcode,
    cc: user.currency,
    to: "dddwdAQQW4145SDS",
    ts: true
  };

  return val;
}
/*Cuando se hace una apuesta , existe "errores" ,como por ejemplo que el balance del usuario sea menos a lo que quiere apostar,ahi surge una excepcion
o cuando la transaccion a sido cancelada ,se puede ver todas las excepciones en el controlador tvBetAPI array errorGetUserData,
como parametro tendra el body del request para que valide
*/
tvBetService.validRulesTransaction = function (params, user) {
  if (user.balance < params.sm) throw { cd: 8 };
}
/*
Cada vexz que se hace un request desde los servdores de tvBet , se valid el sign de esta solicitud.
si no coiciden se manda un error con cd:1 que define que el Sign no es valido.
*/
tvBetService.validSign = async function (body) {
  let signBody = body.si;
  delete body.si;
  signGenerate = await this.generateSign(body);
  if (signBody !== signGenerate) throw { cd: 1 }
}
tvBetService.makePayment = async function (bodyRequest) {
  const self = this;
  const transactionDescription = paymentType.find(
    paymentType => paymentType.cd == bodyRequest.tt
  );
  let transaction = {
    id: null,
    trxid: bodyRequest.bid,
    description: transactionDescription.description,
    amount: bodyRequest.sm,
    movement: "WIN",
    gameid: bodyRequest.ed.gid[0]
  };

  let user = await userRepository.getById(1);
  transaction.userid = user.id;
  if (transactionDescription.cd == -1) {
    self.validRulesTransaction(bodyRequest, user);
    self.bet(transaction, transactionDescription);
  } else if (transactionDescription.cd == 1) {
    if (bodyRequest.sm == 0) {
      self.lose(transaction, transactionDescription);
    }
  } else if (transactionDescription.cd == 2) {
    self.tasaDeReembolso(transaction, transactionDescription);
  } else if (transactionDescription.cd == 4) {
    self.pagoPorElPremioGordo(transaction, transactionDescription);
  }
  return transaction

}
/**
 * la apuesta que hace el usuario
 *  esta referenciado por la cantidad ,el movimiento que se esta haciendo y la descripcion.
 *{transaction} es la transaccio actual
 {transactionObject} es el objeto del tipo de transaccion que se esta realizando  */
tvBetService.bet = function (transaction, transactionObject) {
  transaction.amount = transaction.amount * -1;
  transaction.movement = "BET";
  transaction.description = transactionObject.description;
}
/**
 * el metodo se dispara cuando el usuario gana en la apuesta
 * {transaction} es la transaccion actual,
 * {transactionObject} es el objeto del tipo de transaccion que se esta realizando
 */
tvBetService.win = function () {
  console.log("WIN")
}
/**
 * el metodo se dispara cuando el usuario pierde en la apuesta
 * {transaction} es la transaccion actual,
 * {transactionObject} es el objeto del tipo de transaccion que se esta realizando
 */
tvBetService.lose = function (transaction, transactionObject) {
  transaction.amount = transaction.amount * -1;
  transaction.movement = "LOSE";
  transaction.description = transactionObject.description;
}
tvBetService.tasaDeReembolso = function (transaction, transactionObject) {
  transaction.movement = "Tasa de reembolso";
  transaction.description = transactionObject.description;
}
tvBetService.pagoPorElPremioGordo = function (transaction, transactionObject) {
  transaction.movement = "Pago por el premio gordo";
  transaction.description = transactionObject.description;
}
tvBetService.getPaymentInfo = async function (requestBody) {
  let transaction = await gameRepository.getTransactionById(requestBody.tid);
  if (!transaction || transaction.status == 0) throw { cd: 14 };
  let userTransaction = await userRepository.getById(transaction.userid);

  if (transaction.amount < 0) transaction.amount = transaction.amount * -1;
  let seconds = moment()
    .diff(moment("1970/01/01", "YYYY/MM/DD"), "seconds")
    .valueOf();
  val = {
    dt: seconds,
    bid: transaction.id,
    tt: -1,
    uid: userTransaction.id,
    sm: transaction.amount,
    description: transaction.description
  };
  return val;
}
tvBetService.errorResponseBody = function (bodyResponse, code, message) {
  bodyResponse.val = null;
  bodyResponse.cd = code;
  bodyResponse.sc = false;
  bodyResponse.er = message;
}
module.exports = tvBetService;