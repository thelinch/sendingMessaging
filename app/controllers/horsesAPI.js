
const gameService = require('../services/gameService');
const userService = require('../services/userService');


exports.view = function(req, res) {
	let token=req.query.t;
	//let token="Q3xgQRgrzLiKl04K30EnUrWPA1qAlYtPl0yxPynpTpO5gVZr5kSKq"; //era l
	res.render('horses',{token});
}

exports.getBalance = function(req, res) {
	var userid=req.query.user_id;
	userService.getBalance(userid, r=>{
		res.status(200).send({balance:r.balance,currency:r.currency});
	});
}

exports.addCredit = function(req, res) {
	var gameid="horses";
	let transaction={
		id:null,
		gameid:gameid,
		trxid:req.body.ticket,
		userid:req.body.user,
		description:req.body.type,
		amount:req.body.amount,
		serial:req.body.serial,
		movement:'credit',
	};
	gameService.play(transaction,r=>{
		clientService.clientNotification(transaction, r)
		var response={balance:r.balance, currency: r.currency, reference: transaction.serial };
		res.status(200).send(response);
	});
}
exports.debit = function(req, res) {
	var gameid="horses";
	let transaction={
		id:null,
		gameid:gameid,
		trxid:req.body.ticket,
		userid:req.body.user,
		description:req.body.type,
		amount:req.body.amount*-1,
		serial:req.body.serial,
		movement:'debit',
	};
	gameService.play(transaction,r=>{
		clientService.clientNotification(transaction, r)
		var response={balance:r.balance, currency: r.currency, reference: transaction.serial };
		res.status(200).send(response);
	})
}

exports.validateUserToken = (req, res) => {
	var token=req.body.token;
	if (token==null) token = req.query.token;
	userService.validateToken(token, r=>{
		res.status(200).send(r);
	});
}



    
