var numeral = require('numeral');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');
const axios = require('axios');
var xml2js = require('xml2js');
const joinAgregatorService = require("../services/joinAgregatorService");
/*
exports.loggedIn = function(req, res, next){
	if (req.session.user) { // req.session.passport._id
		next();
	} else {
		res.redirect('/login');
	}
}
exports.home = function(req, res) {
	res.render('home.ejs', {
		error : req.flash("error"),
		success: req.flash("success"),
		session:req.session,
	 });
}
exports.signup = function(req, res) {
	if (req.session.user) {
		res.redirect('/home');
	} else {
		res.render('signup', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
	}
}
exports.login = function(req, res) {
	if (req.session.user) {
		res.redirect('/home');
	} else {
		res.render('login', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
	}
}
*/

exports.games = async function (req, res) {
	var games = [];
	games = await joinAgregatorService.games();
	res.render('games', {
		session: req.session,
		games: games,
	});
}
exports.createUser = function (req, res) {
	axios.get('https://api.joinaggregator.com/joingames/main.ashx?client=UniversalSoft&op=insert&usr=prueba')
		.then(response => {
			parser = new xml2js.Parser()
			parser.parseString(response.data, (err, result) => {
				resultados = result.DATA.RESPONSE[0]
			})
			axios.get('https://api.joinaggregator.com/joingames/main.ashx?client=UniversalSoft&op=session&usr=prueba')
				.then(response => {
					parser = new xml2js.Parser()
					parser.parseString(response.data, (err, result) => {
						resultados = result.DATA.RESPONSE[0]
					})
					exports.launch(resultados.RESULT[0], 11, res);
				})
				.catch(error => {
					console.log(error);
				});
		})
		.catch(error => {
			console.log(error);
		});
}
exports.launch = function (sessionid, gameid, res) {
	var ruta = 'https://api.joinaggregator.com/joingames/player.aspx?session=' + sessionid + '&id=' + gameid;
	console.log(ruta);
	res.render('launch', {
		src: ruta
	});
}




