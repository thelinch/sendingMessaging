var Game = require("../models/game.js");
const axios = require('axios');
const gameService = require('../services/gameService');
const userService = require('../services/userService');
const clientService = require('../services/clientService');
const joinAgregatorService = require("../services/joinAgregatorService")
const fs = require("fs")
const Path = require("path");
const appRoot = require("app-root-path");
const FCM = require("fcm-push")
const serverKey = "AAAAn8cp8Tk:APA91bEU3ZrDGTkbW7RrLJCwavvpSJo8UOqWk2x90OmlI6rlFy6UAM4StNpIWgUZ_-Vz541_zLohiAU38GsViLaCHn7btSgKLBCX4Cteol0c-G3RFaoOPHj2y3oyZhOFGDy5x2tdfgfb7PAfpSzMl0DttXbGAP1f1g"
var fcm = new FCM(serverKey);
const arrayUser = []
exports.index = function (req, res) {
	res.send("Welcome to our API");
}
exports.sendMessaging = async function (req, res) {
	var { messageBody, title, data, user } = req.body

	var message = {
		registration_ids: arrayUser.map(user => user.token),
		collapse_key: 'your_collapse_key',
		data: data,
		notification: {
			title: title,
			body: messageBody,
			click_action: "localhost:4200/persona/" + user.id + "/area/" + user.area.id + "/map?lt=" + data.lt + "&ln=" + data.ln,
		},
	};
	const respuesta = await fcm.send(message)
	res.json(respuesta)
}
exports.registerAndUpdateTokenUser = function (req, res) {
	const { user } = req.body
	console.log(user)
	if (arrayUser.length > 0) {
		const indexUser = arrayUser.findIndex(userLoged => userLoged.id == user.id)
		if (indexUser != -1) {
			arrayUser[indexUser].token = user.token
		}
	} else {
		arrayUser.push(user)
	}
	console.log(arrayUser)
	res.json(200, "ok")
}
exports.games = function (req, res) {
	Game.all(function (err, data) {
		res.json(200, data);
	});
}
/*
exports.callgames = function(req, res) {
	axios.get('https://api.joinaggregator.com/joingames/main.ashx?client=UniversalSoft&op=gamelist')
  .then(response => {
		parser = new xml2js.Parser();
	  	parser.parseString(response.data,  (err, result) => {
		  	games=result.DATA.RESPONSE[0].GAMES[0].GAME;
			});
		for (let index = 0; index < games.length; index++) {
			var object={gameid:games[index].ID,name:games[index].NAME,description:games[index].DESCRIPTION,type:games[index].TYPE,urlimage:games[index].URLIMAGE,mode:games[index].MODE,provider:'joinaggregator'};
			Game.save(object,res,function(err, data){
				console.log(data);
			});
		}
  })
  .catch(error => {
    console.log(error);
  });
}
*/
/*
exports.launchGameView=function(req, res){
	req.query.user=req.body.user;
	req.query.userid=req.body.userid;
	req.query.gameid=req.body.gameid;
	exports.launchGame(req,res);
}
*/
exports.launchGame = function (req, res) {

	//let userhash=req.headers["authorization"];
	let userhash = req.query.t;
	if (!userhash) throw new Error("User need authorization");
	console.log("validando token en BD...");
	userService.validateSession({ sessionid: userhash }, function (u) {
		//para decir la moneda tenemos 3 opciones con JOINGAMES: &currency=PEN|USD|BRL
		var params = {
			provider: req.query.p,
			brand: req.query.b,
			//user: {id: req.query.userid, name: req.query.user},
			user: { id: null, name: req.query.u },
			game: { id: req.query.g },
			currency: 'USD',
		};
		if (params.user.name != u.username) throw new Error("Token doesnt match with username");
		params.user.id = u.id;
		console.log("resolviendo: " + params.provider)
		if (params.provider == 'ja') {//joinaggregator
			gameService.resolveJoinGame(params).then(href => {
				res.render('launch', href);
			}).catch(e => { res.render('error', { message: 'ERROR', error: e }); });
		} else if (params.provider == "ho") {//horses
			var token = userhash
			gameService.resolveHorsesGame({ hashcode: token, token: token }).then(url => {
				res.redirect(url);
			}).catch(e => { res.status(500).send({ 'Error': e }) });

		} else if (params.provider == "vg") {//virtualg
			let url = gameService.resolveVirtualgGame({ mode: req.query.m, username: params.user.name });
			res.redirect(url);
		} else if (params.provider == "tvBet") {//TvBEt
			let url = gameService.resolveTvBetGame(req.query.t);
			res.redirect(url);
		}
	});
}
exports.updateImageProviders = async function () {
	var listGlobalGames = [];
	//listGlobalGames = (await slomaticService.apirequest("casino/list_games_v2")).games;
	listGlobalGames = await joinAgregatorService.games()
	for (let i = 0; i <= listGlobalGames.length - 1; i++) {
		const urlImage = listGlobalGames[i].URLIMAGE[0];
		const nameImg = urlImage.split("/");
		const path = Path.resolve(appRoot + "/public/", "assets", nameImg[nameImg.length - 1])
		const response = await axios({
			url: urlImage,
			method: "GET",
			responseType: "stream"
		})
		response.data.pipe(fs.createWriteStream(path));
	}

}
exports.getBalance = function (req, res) {
	var userid = req.body.pid;
	userService.getBalance(userid, r => {
		var response = { status: true, balance: r.balance, error: '' };
		res.status(200).send(response);
	});
}
exports.play = function (req, res) {
	let transaction = {
		id: null,
		trxid: gameService.getTransactionNumber(),
		gameid: req.body.gameid,
		userid: req.body.pid,
		description: req.body.type,
		movement: req.body.type,
		amount: gameService.getSignNumber(req.body.type, req.body.amount)
	};

	gameService.play(transaction, r => {

		clientService.clientNotification(transaction, r);
		res.status(200).send({ status: true, balance: r.balance, referenceTID: transaction.trxid, error: "" });
	});
}
/*api universal */
exports.createuser = function (req, res) {
	clientService.getByServer({ server: req.ip }).then(c => {
		let user = {
			clientcode: c.code,
			username: req.body.username,
			balance: req.body.balance,
			country: req.body.country,
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			gender: req.body.gender,
			currency: "USD",
			pass: "free",
			type: 13,
		}
		userService.verifyDuplicated({ username: user.username, client_server: c.server }).then(r => {
			if (!r) {
				userService.save(user, function (r) {
					res.send({ status: "OK", user: user.username, balance: user.balance });
				})
			} else {
				res.send({ status: "FAIL", error: "User Exist!" });
			}
		}).catch(e => { throw e })

	});

}
exports.auth = function (req, res) {
	let params = {
		client_server: req.ip,
		username: req.body.username,
		balance: req.body.balance
	}
	userService.auth(params).then(function (r) { res.send(hash); })
		.catch(e => {
			console.log(e);
			res.status(500).send({ 'error': e })
		});
}

exports.gamelist = function (req, res) {
	//FALTA EL ADMINISTRADOR PARA REGISTRAR LOS JUEGOS Y ASIGNAR PROVEEDORES A UN CLIENTE.
	/*Game.allforClient(req.query.client,res,function(err, data){
	});*/
	//POR AHORA LISTAMOS TODOS LOS QUE TENEMOS
	let params = { username: req.query.user, client_server: req.ip };
	userService.getByUsernameAndClient(params).then((u, e) => {
		if (e) throw new Error(e)
		gameService.directGames(u).then(list => {
			//res.set({"Content-Encoding":"gzip"})
			res.status(200).send(list);
		}).catch(error => {
			res.status(500).render('error', { message: 'ERROR', error: error });
		});
	}).catch(e => { throw e });

}
/*API para que consulten SlotGames*/
exports.GetPlayerBalance = function (req, res) {
	var userid = req.body.UserId;
	userService.getBalance(userid, r => {
		var response = { status: ok, balance: r.balance, error: '' };
		res.status(200).send(response);
	});
}

