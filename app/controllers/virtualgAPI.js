
const gameService = require('../services/gameService');
const userService = require('../services/userService');
const clientService = require('../services/clientService');
const axios = require('axios');
//const web_url="https://qacom-virtsportrace.ody-services.net";//Testing
const web_url="https://virtsportrace.vg-services.net";
//const web_url="https://virtsportracefull.vg-services.net";//INCLUYE galLOS
//const mobile_url="https://qacom-mobvirtsportrace.ody-services.net";Testing
const mobile_url="https://mobvirtsportrace.vg-services.net";
//const mobile_url="https://mobvirtsportracefull.vg-services.net";//incluye gallos

exports.createToken=function(req, res){
	//for testing propose
	var params={
		Username: "BrianP",
		FirstName: "Brian",
		LastName: "Pando",
		Gender: "M",
		SessionId: "445232232312312rr3434wwwe4344t",
		CurrencyISoCode: "PEN"
	}
	gameService.createVirtualGToken(params, r=>{
	//	userService.saveSession({ token:r.data.access_token });
		res.end( JSON.stringify(r.data) );
	});
},


exports.view = function(req,res){
	//pasar parametro ?mode=m para mobile
	var url=req.query.m=='mobile'?mobile_url:web_url;
	//var user={username:'gilder'};
	let user = {username: req.query.username }
	//Creando Session ID 
	sessionid=userService.createSession(user, u =>{
		var params={
			Username: u.username,
			FirstName: u.firstname,
			LastName: u.lastname,
			Gender: u.gender,
			SessionId: u.sessionid,
			CurrencyISoCode: u.currency,
			Balance: u.balance,
		};
		//var access_token="cb6O8bHZ05LRLE_ORqw9arVRvU6kM7rct6l8xxb1dbe7z8QGzqgRriVOydJhP7Tua9aqC7XEfO1Fq2NJjEwG3euaEVM-W3S6PY4h47lMWqokJVsjgAUeftPo3Q-BvxJ8Pgc5L0416fUJXqq9Dg0T65OssEdGGrr3EZcHB7EXXLp3Damip7yfszDpo0M6dUS2ekkQUnf-QGjqBbu9K39v6zSkIusHQao1vApStkVerTPRNCgZ8Ccu4fLtCoj9BunqShD8M2-v9Lsehgg6gpBJuF-D5nYCeTXQ0kTOwuf8GTIv-QrcG8WUj9pTDKGSBunoGCHg2sQxtEMHaokPRDmsoZlSF05Yd3h2A_cYNuLIlia69Xq3B5IFmLFVu68KoRUjM5-7L6IqYi6bExLRu0HMA1aWfwSrRLO-yLq33ZU-6Z7J5GvzIRdfxyLpjG_-U6Vfnn0nNrWTSuZvxPuvAaydGflCzVGTobrbYaz1QhqKQbAM4qxN1jIdvmnbaICA9-UHCplIJLANmETiCDkTqFTngwPAkyEHQqScthtlSTBbwSikYEp4";
		//res.render('virtualg',{url:url,token:access_token});
		console.log(params);
		//const security_url="https://qacom-apisecsportrace.ody-services.net:15443/api/webclientauth";
		const security_url="https://apisecsportrace.vg-services.net:18443/api/webclientauth";
		console.log("generando Token en: "+security_url);
		
		axios.post(security_url,params).then(r=>{
			console.log(r.data);
			res.render('virtualg',{url:url,token:r.data.access_token});
		}).catch(e=>{
			console.log(e);
			res.end("Error");
		});
	});
	/*------ */
}

exports.insertbet = function(req, res) {
	console.log("insertando apuesta.");
	var params=req.body;
	console.log(params);
	/*
	"StakeGross" = 1.00,
	"CurrencyCode" = "EUR",
	"TicketId" = "0641653a-cb44-4974-990d-81bfc187ddb5",
	"SessionId" = "1234567891",
	"CouponCode" = "VDCP39-1UZ-3U3S1W",
	"JackpotContribution" = 0.2
	*/

	//params.SessionId="Q3xgQRgrzLiKl04K30EnUrWPA1qAlYtPl0yxPynpTpO5gVZr5kSKl";
	

	userService.validateSession({sessionid:params.SessionId} , r =>{
		try {
			if(r==null) throw("Session doesnt exist");
			params.userid=r.id;
			params.description="BET";
			params.movement=1;
			params.StakeGross*=-1;
			var transaction=gameService.mapTransaction4VirtualG(params);
			gameService.play(transaction,r=>{
				clientService.clientNotification(transaction, r)
				var response={status:1, balance:r.balance}
				res.status(200).send(response);
			});
		} catch (e) {
			res.status(500).send(e);
		}
		
	});
}

exports.cancelbet = function(req, res) {
	var params=req.body;
	/*
	"TicketId" : "0641653a-cb44-4974-990d-81bfc187ddb5",
	"SessionId" : "1234567891",
	"ReasonCode" : "RollBack"
	*/
	try {
		gameService.validateTrx({trxid:params.TicketId} , t =>{
			if(t==null) throw "Ticket doesnt exist";
			gameService.deleteTransaction(t,r=>{
				var response={status:1, balance:r.balance};
				res.status(200).send(response);
			});
		});
	} catch (e) {
		res.status(500).send(e);
	}
	
}
exports.betresult = function(req, res) {//si gano la apuesta se invoca este metodo.
	let params=req.body;
	/*
	"CloseRound" = "true",
	"CouponCode" = "VDCP39-1UZ-3U3S1W",
	"CouponStatus" = 3,
	"TicketId" = "0641653a-cb44-4974-990d-81bfc187ddb5",
	"SessionId" = "1234567891","Won" = 1.40
	*/
	userService.validateSession({sessionid:params.SessionId} , r =>{
		try {
			if(r==null) throw("Session doesnt exist");
			params.userid=r.id;
			params.description="WIN";
			params.movement="WIN";
			params.StakeGross=params.Won;
			var transaction=gameService.mapTransaction4VirtualG(params);
			gameService.play(transaction,r=>{
				clientService.clientNotification(transaction,r)
				var response={status:1, balance:r.balance};
				res.status(200).send(response);
			});
		} catch (e) {
			res.status(500).send(e);
		}
		

		
	});
}




    
