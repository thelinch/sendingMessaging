const gameService = require("../services/gameService");
const userService = require("../services/userService");
const tvBetService = require("../services/tvbetService");
const clientService = require("../services/clientService");
const slomaticService = require("../services/slotmaticService");
const errorGetUserData = [
  { cd: 1, message: "Signature of request is invalid" },
  { cd: 2, message: "Request timeout exceeded" },
  { cd: 3, message: "User not found" },
  { cd: 4, message: " An interaction token not found" },
  { cd: 5, message: " Token not valid" },
  { cd: 6, message: "Token obsolete" },
  { cd: 7, message: "The amount is not correct" },
  { cd: 8, message: "There are not enough funds on the balance of the user" },
  { cd: 9, message: "Adding transaction error" },
  { cd: 10, message: "Rate transaction not found" },
  { cd: 11, message: "User is locked" },
  { cd: 12, message: "Transaction already exists" },
  { cd: 13, message: "The user does not comply with the transaction" },
  { cd: 14, message: "Transaction not found" },
  { cd: 16, message: "The bet has already been canceled." },
  { cd: 17, message: "Invalid type of transaction" },
  { cd: 18, message: "Request data error" },
  { cd: 19, message: "Promo code has already been used" },
  { cd: 20, message: "The promotion code is not found" },
  { cd: 21, message: "Insufficient user registration data to use promo code" },
  { cd: 22, message: "Free bet promo code is over" },
  { cd: 23, message: "User is not allowed to use promo code data" },

  { cd: 1000, message: "System error API" }
];

const privateKey =
  "1434ed83ad41e4253c98293eb07e761ea913473dd137c7f4c008eaadb433a99e";
//const privateKey = "faas3c1e3a3c8ae56r8g845e0ba2tb3ccv";
exports.view = function (req, res) {
  let token = req.query.t;
  console.log(tvBetService.buildGlobalBodyResponseTvBet(req.body, privateKey));
  let server = "https://tvbetframe27.com";
  let clientId = "1419";
  let language = "es";
  res.render("tvbet/viewgame", { server, token, clientId, language });
};

exports.getUserData = async function (req, res) {
  let token = gameService.createTvBetToken(req.params);
  let bodyResponseGlobal = await tvBetService.buildGlobalBodyResponseTvBet();
  try {
    val = await tvBetService.getUserData();
    bodyResponseGlobal.val = val;
  } catch (errorParam) {
    let errorObject = errorGetUserData.find(error => error.cd == errorParam.cd);
    tvBetService.errorResponseBody(
      bodyResponseGlobal,
      errorObject.cd,
      errorObject.message
    );
  }
  bodyResponseGlobal.si = await tvBetService.generateSign(bodyResponseGlobal);
  console.log(bodyResponseGlobal)
  res.status(200).send(bodyResponseGlobal);
};
/**
 * Se dispara cuando se va a realizar una transaccion ya sea para pago, apuesta perdida:
 * Los codigos "cd" son:
 * -1 apuesta,
 * 1 pago si sm=0 se el usuario perdio.
 * 2 tasa de reembolso.
 * 4 pago por el premio gordo.
 */
exports.makePayment = async function (req, res) {
  let bodyResponseGlobal = await tvBetService.buildGlobalBodyResponseTvBet();
  try {
    let transaction = await tvBetService.makePayment(req.body);
    gameService.play(transaction, async function (r) {
      bodyResponseGlobal.val = {
        tid:
          r.lasttrx.toString(), dt: tvBetService.getSeconds()
      };;
      bodyResponseGlobal.si = await tvBetService.generateSign(bodyResponseGlobal);
      res.status(200).send(bodyResponseGlobal);
    });
  } catch (errorParam) {
    let errorObject = errorGetUserData.find(error => error.cd == errorParam.cd);
    tvBetService.errorResponseBody(
      bodyResponseGlobal,
      errorObject.cd,
      errorObject.message
    );
    bodyResponseGlobal.si = await tvBetService.generateSign(bodyResponseGlobal);
    res.status(200).send(bodyResponseGlobal);
  }
};
exports.getPaymentInfo = async function (req, res) {
  let bodyResponseGlobal = tvBetService.buildGlobalBodyResponseTvBet(
    req.body,
    privateKey
  );
  try {
    bodyResponseGlobal.val = await tvBetService.getPaymentInfo(req.body);
    let transactionDescription = paymentType.find(paymentTypeParam => {
      return paymentTypeParam.description == bodyResponseGlobal.val.description;
    });
    bodyResponseGlobal.val.tt = transactionDescription.cd;
    delete bodyResponseGlobal.val.description;
  } catch (errorParam) {
    let errorObject = errorGetUserData.find(error => error.cd == errorParam.cd);
    tvBetService.errorResponseBody(
      bodyResponseGlobal,
      errorObject.cd,
      errorObject.message
    );
  }
  res.status(200).send(bodyResponseGlobal);
};
