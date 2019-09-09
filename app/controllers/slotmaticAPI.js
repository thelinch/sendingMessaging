const userService = require('../services/userService');
const slotmaticService = require('../services/slotmaticService');
const gameService = require('../services/gameService');
const clientService = require('../services/clientService');
const xml2js = require('xml2js');
const web_url="https://api4.slotomatic.net/api/";
const mobile_url="https://api4.slotomatic.net/api/";
const zlib = require('zlib');

exports.view = function(req,res){
	//pasar parametro ?mode=m para mobile
	var url=req.query.m=='mobile'?mobile_url:web_url;
	var user={username:'gilder'};
	//Creando Session ID 
	/*sessionid=userService.createSession(user, u =>{
		var params={
			Username: u.username,
			FirstName: u.firstname,
			LastName: u.lastname,
			Gender: u.gender,
			SessionId: u.sessionid,
			CurrencyISoCode: u.currency,
			Balance: u.balance,
		};
	});*/

	/*slotmaticService.apirequest("casino/create_player_if_not_exists").then(function(r){

	});*/
	slotmaticService.apirequest("casino/list_games_v2").then(function(r){
		//console.log(r);
		games=slotmaticService.formatGames(r.games);
		res.render('slotgames',{l:games});
	}).catch(function(e){
		console.log(e);
		throw new Error(e);
	});
}
exports.createPlayerifnotExists = function(req,res){
	userService.getUserByUsername({username:req.body.username},u=>{
		try{
			if(u===undefined) throw("El usuario no existe");
			res.status(200).send(u);
		}catch(e){
			res.status(500).send(e);
		}
		
	})
}

exports.showgame = function(req,res){
	view = req.params.view
	if(view==undefined) view ="";
	res.render("slotmatic/gameview"+view);
}

exports.gameplay=async function(req,res){
	let params =req.body
	let gameresult={};
	let endp = req.query.reqfile.trim()
	let endparr = endp.split("/")
	
	if(endparr[1] == "real" ){
		let userid= 'gilder'
		params.userid=userid
		//deberia usar el id del usuario que inicio session
		//console.log(params);
		try{
			r = await slotmaticService.apirequest("player/get_balance", {playerid:params.userid})
			console.log(r)
			r = await slotmaticService.apirequest("casino/create_player_if_not_exists", {playerid:params.userid})
			//r = await slotmaticService.apirequest("player/cashout", {playerid:params.userid})
			//r = await slotmaticService.apirequest("player/deposit", {playerid:params.userid, amount:900})
			
		}catch(e){
			console.log(e);
		}
	}

	slotmaticService.apirequest(endp, params).then(function(r){
		gameresult= r;
		if(gameresult.status=="OK"){
			if( "gameevent" in gameresult ){
				console.log(gameresult);
				let newevents=game.result.gameeevent.split("*")
				for(var i =0;i<newevents.length;i++){
					let event = newevents[i].split("|",4)
					slotmaticService.onGameEvent( gameresult.userid, event[0],event[1],event[2],event[3]);

				}
			}
		}
		res.contentType('text/xml; Charset=utf-8');
		res.render("slotmatic/gameplay",{gameresult});
	})
}
exports.getPlayerBalance=function(req, res){
	res.setHeader('Content-Type', 'application/xml');
	var data = '';
    req.on('data', function(chunk) { data += chunk.toString();});
    req.on('end', function() {
		//console.log(data);
		//<Request><OperatorId>universalPEN</OperatorId><UserId>gilder</UserId><GameId>hot7</GameId><GameBrand>amatic</GameBrand><SessionId>aa7ed80622b5dd3e7296f4678c06fa4a2ce5515e0310875001566502654z135z92838</SessionId><Reason>GameInitialization</Reason></Request>
		parser = new xml2js.Parser();
	  	parser.parseString(data, (err, result) => {
			  data = result.Request;
		});
		var username=data.UserId[0];
		userService.getByUsername({username:username}, u=>{
				userService.getBalance(u.id, r=>{
					var response = "<Response><status>ok</status><balance>"+r.balance+"</balance></Response>";
					//cuando se necesita comprimir la respuesta.
					/*zlib.gzip(response, function(err, response){ if (!err) { }else{}});*/
					// res.write(response,{"Content-Type":"text/xml"});
					 res.write(response);
					 res.end();
					 //console.log(res.headers);
					
				});
			});
	});
}

exports.withdrawAndDeposit=function(req, res){
	res.setHeader('Content-Type', 'application/xml');
	var data = '';
    req.on('data', function(chunk) { data += chunk.toString();});
    req.on('end', function() {
		//<Request><OperatorId>APItest</OperatorId><UserId>testuser</UserId><GameId>bookofradeluxe</GameId> <GameBrand>novomatic</GameBrand> <SessionId>3327f6a9cdadced495343a577b58c8e818</SessionId> <BetId>3934347</BetId> <TransactionId>100103</TransactionId> <Reason>SlotSpin</Reason> <WithdrawAmount>0.10</WithdrawAmount> <DepositAmount>0.40</DepositAmount></Request>
		parser = new xml2js.Parser();
	  	parser.parseString(data, (err, result) => {
			  data = result.Request;
		});
		var username=data.UserId[0];
		userService.getByUsername({username:username}, u=>{
				data.userid=u.id;
				let transaction=gameService.mapTransaction4Slotmatic(data);
				//console.log(transaction);
				// var response = "<Response><status>ok</status><balance>1000</balance></Response>";
				// 			res.write(response,{"Content-Type":"text/xml"});
				// 			res.end();
				gameService.play(transaction,r=>{
					clientService.clientNotification(transaction, r)
					var response = "<Response><status>ok</status><balance>"+r.balance+"</balance></Response>";
					res.write(response,{"Content-Type":"text/xml"});
					res.end();
				});

			});
	});
}

exports.cancel=function(req, res){
	//<Request><OperatorId>APItest</OperatorId><UserId>testuser</UserId><TransactionId>100103</TransactionId> </Request>
	res.setHeader('Content-Type', 'application/xml');
	var data = '';
	req.on('data', function(chunk) { data += chunk.toString();});
	
	req.on('end', function() {
		parser = new xml2js.Parser();
	  	parser.parseString(data, (err, result) => {
			  data = result.Request;
		});
		let username=data.UserId[0];
		let trxid=data.TransactionId[0];
		
		userService.getByUsername({username:username}, u=>{
			var params={trxid:trxid,userid:u.id};

			gameService.getByTrxAndUserid(params,t=>{
				//console.log(t)
				if(t==undefined||t==null){
					let response = "<?xml version='1.0' encoding='utf-8'?> <Response><status>ok</status><balance>"+u.balance+"</balance></Response>";
					res.write(response,{"Content-Type":"text/xml"});
					res.end();
				} else {
					gameService.deleteTransaction({id:t.id,userid:params.userid, amount: t.amount}, us=>{
						console.log(us);
						//let new_balance= u.balance + t.amount;
						let response = "<?xml version='1.0' encoding='utf-8'?> <Response><status>ok</status><balance>"+us.balance+"</balance></Response>";
						console.log(response)
						res.write(response,{"Content-Type":"text/xml"});
						res.end();
					})
				}
			});
			
		});
		
	});
}


exports.testHmac = function(req, res){
	var params=slotmaticService.testHmac();
	res.json(params);
}

exports.testregeneratedHmac = function(req, res){
	var params=slotmaticService.testregeneratedHmac();
	console.log(params.data);
	console.log(params.params);
	res.json(params);
}
exports.testregeneratedHmac2 = function(req, res){
	var params=slotmaticService.testregeneratedHmac2();
	//console.log(params.data);
	//console.log(params.params);
	res.json(params);
}



