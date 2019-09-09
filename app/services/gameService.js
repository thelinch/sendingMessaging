const axios = require('axios');
const gameRepository = require("../models/game");
const userRepository = require("../models/user");
const sessionRepository = require("../models/sessions");
const moment = require("moment");
const crypto = require("crypto")
var parseString = require('xml2js').parseString;
var xml2js = require('xml2js');
module.exports = {
    all: function () {
        return axios.all([this.getJoinGames(), this.getbetsoftGames(), this.getSpinomenalGames(), this.getTomHornGames()]);
        //return getJoinGames();
        //return this.getbetsoftGames();
    },
    getJoinGames: function () {
        return axios.get('https://api.joinaggregator.com/joingames/main.ashx?client=UniversalSoft&op=gamelist')
    },
    getbetsoftGames: function () {
        return axios.get('https://api.joinaggregator.com/betsoft/main.ashx?client=UniversalSoft&op=gamelist')
    },
    getSpinomenalGames: function () {
        return axios.get('https://api.joinaggregator.com/Spinomenal/main.ashx?client=UniversalSoft&op=gamelist')
    },
    getTomHornGames: function () {
        return axios.get('https://api.joinaggregator.com/TomHorn/main.ashx?client=UniversalSoft&op=gamelist')
    },

    insertJoinSession: function (params) {
        return axios.get('https://api.joinaggregator.com/' + params.brand + '/main.ashx?client=UniversalSoft&op=insert&usr=' + params.user.name + "&pid=" + params.user.id);
    },
    createJoinSession: function (params) {
        return axios.get('https://api.joinaggregator.com/' + params.brand + '/main.ashx?client=UniversalSoft&op=session&usr=' + params.user.name);
    },
    getgameURL: function (params) {
        return ruta = 'https://api.joinaggregator.com/' + params.brand + '/player.aspx?session=' + params.sessionid + '&id=' + params.game.id + "&currency=" + params.currency;
    },
    getByTrxAndUserid: (params, callback) => {
        gameRepository.getByTrxAndUserid(params, r => {
            callback(r)
        });
    },
    play: (params, callback) => {
        gameRepository.saveTransaction(params, r => {
            let txid = r;
            userRepository.get(params.userid, (u) => {
                u.lasttrx = txid
                u.balance += params.amount * 1
                var p = { userid: u.id, balance: u.balance }

                userRepository.updateBalance(p, r => {
                    callback(u);
                })
            })

        })
    },
    deleteTransaction: (params, callback) => {
        gameRepository.deleteTransaction(params, r => {
            userRepository.get(params.userid, (u) => {
                u.balance -= params.amount * 1
                var p = { userid: u.id, balance: u.balance }
                userRepository.updateBalance(p, r => {
                    callback(u);
                })
            })
        })
    },
    validateTrx: (params, callback) => {
        gameRepository.getByTrx(params.trxid, r => {
            callback(r);
        });
    },
    getTransactionNumber: function () {
        let currentDate = new Date();
        let number = "trx_" + currentDate.getFullYear() + "" + this.addZeroAtNumber(currentDate.getMonth() + 1, 2) + "" + this.addZeroAtNumber(currentDate.getDate(), 2) + "" + this.addZeroAtNumber(currentDate.getHours(), 2) + "" + this.addZeroAtNumber(currentDate.getMinutes(), 2) + "" + this.addZeroAtNumber(currentDate.getSeconds(), 2) + "" + this.addZeroAtNumber(currentDate.getMilliseconds(), 3);
        return number;
    },

    addZeroAtNumber: function (number, numberPad) {
        var str = "" + number;
        var pad = "";
        for (let index = 0; index < numberPad; index++) {
            pad += "0";
        }
        return pad.substring(0, pad.length - str.length) + str;
    },

    getSignNumber: (type, number) => {
        if (type == "BET" || type == "BUYIN") {
            number = number * -1;
        } else if (type == "CREDIT" || type == "WIN" || type == "REFOUND" || type == "UNBLOCKED") {
            number = number * 1;
        }
        return number;
    },

    createVirtualGToken: (params, callback) => {
        /*var params={
            Username: "BrianP",
            FirstName: "Brian",
            LastName: "Pando",
            Gender: "M",
            SessionId: "44523212312rrtr1223vswe4344t",
            CurrencyISoCode: "PEN"
        };*/
        axios.post("https://qacom-apisecsportrace.ody-services.net:15443/api/webclientauth", params).then(r => {
            /*
            {
                "access_token": "STYymylVA05YY3OyRnf5GtCqP7K8mnbl3LZHHTbQfgJ3ei5kO4Qb7gYOfPEKWyXy5xWQeGWNRHw4IX_F7J1-8us0SDYIX_xXjK2Gg8eznf2BJJ4Dz-7U3hVY9uu-inqS13HkQ2JtvV1QJ3VIp2C_GF2BCig31XDEl0Bwayw_GS-eMIzJFDXD9d-Oowixfcw74FjnFKrkXfzAK64ZAR80Iqn2fldZb2Z8WnJr17KFQ06GYMIfn6fbe_I-R9iCfG9esAzzb9DUoQwMxFMB1N-LzvKOirrZwqUZzjlzAdXkzmaePn91YkJYHObm7rInYb3OIF8K3LNBrT9hsYxkXdl7P4ePZ5W0UyGqTAEdJvZnV3cvtZAw2pnEcsVqkTL7mwnanj-XrBzcBgIcNXdhw78QpjNt5alelHQBdxsGP59EqXBdPDDU5qPvkBKkyTccfeOcq5whggTaId992lwRhOcXUBPYaeaDmkDpkBbr3WN2tOiQuItUSrJ801j4V3QJtg-DsUJ1tWiHYrmxk-LE3gNMHvcfocQyuZ4s_Zt-pngYppT_v441",
                "token_type": "bearer",
                "expires_in": 1209600,
                "userName": "BrianP",
                ".issued": "Thu, 09 May 2019 17:13:24 GMT",
                ".expires": "Thu, 23 May 2019 17:13:24 GMT"
            }
            */
            callback(r);
        }).catch(e => {
            console.log(e);
        });
    },
    createTvBetToken: (params) => {
        try {

            return "ddd";
        } catch (error) {
            console.log(error)
        }

    },
    mapTransactionTvBet: (params) => {

        return {
            trxid: params.TicketId,
            serial: params.CouponCode,
            gameid: "tvBet",
            userid: params.userid,
            description: params.description,
            movement: params.movement,
            amount: params.StakeGross,
            date: moment().format("YYYY-MM-DD HH:mm:ss")
        }
    },

    mapTransaction4VirtualG: (params) => {
        return {
            trxid: params.TicketId,
            serial: params.CouponCode,
            gameid: 'virtualg',
            userid: params.userid,
            description: params.description,
            movement: params.movement,
            amount: params.StakeGross,
            date: moment().format("YYYY-MM-DD HH:mm:ss"),
        };
    },

    mapTransaction4Slotmatic: (params) => {
        return {
            trxid: params.TransactionId[0],
            serial: params.BetId[0],
            gameid: params.GameId[0],
            userid: params.userid,
            description: params.DepositAmount[0] == 0 ? "BET" : "WIN",
            movement: params.DepositAmount[0] == 0 ? "BET" : "WIN",
            amount: params.DepositAmount[0] == 0 ? (params.WithdrawAmount[0] * -1) : params.DepositAmount[0],
            date: moment().format("YYYY-MM-DD HH:mm:ss"),
        };
    },
    //lista los juegos directo de los proveedores
    directGames: function (params) {
        //var user={id:1,username:"yelsin"};
        let user = { id: params.id, username: params.username }
        self = this;
        //let providers=[this.getJoinGames(), this.getbetsoftGames(), this.getSpinomenalGames(), this.getTomHornGames()];
        return new Promise((resolve, reject) => {
            var games = [];
            this.all().then(axios.spread(function (joingames, betsoft, spinomenal, tomhorn) {
                //parser = new xml2js.Parser()
                games = self.mapTvbet(games);
                games = self.mapHorses(games);
                games = self.mapGalgos(games);

                games = self.mapXMLJoinAgregator(joingames.data, games, "joingames", user);
                games = self.mapXMLJoinAgregator(betsoft.data, games, "betsoft", user);
                games = self.mapXMLJoinAgregator(spinomenal.data, games, "spinomenal", user);
                games = self.mapXMLJoinAgregator(tomhorn.data, games, "tomhorn", user);
                resolve(games);
            })).catch(err => {
                reject(err);
            });
        })
    },

    mapXMLJoinAgregator: function (data, list, brand, user) {
        parseString(data, (err, result) => {
            //if(result.DATA.RESPONSE.length==0) throw new Error("Games not available")
            if (result.DATA.RESPONSE.length > 0) {
                var l = result.DATA.RESPONSE[0].GAMES[0].GAME
                for (var i = 0; i < l.length; i++) {
                    list.push({
                        id: l[i]["ID"][0],
                        name: l[i]["NAME"][0],
                        //description:l[i]["DESCRIPTION"][0],
                        //type:l[i]["TYPE"][0],
                        //img:l[i]["URLIMAGE"][0],
                        mod: l[i]["MODE"][0] == 'mobile' ? 'mb' : 'wb',
                        brd: brand,
                        prov: "ja",
                        ln: "l?p=ja&b=" + brand + "&g=" + l[i]["ID"][0] + "&u=" + user.username,
                    });
                }
            }

        })
        return list;
    },
    mapTvbet: function (list) {
        list.push({

            id: "344",
            name: "tvBet",
            brd: "tvBet",
            mod: "wb",
            prov: "tvBet",
            ln: "l?p=tv"
        })
        return list;
    },
    mapHorses: function (list) {
        list.push({
            id: "345",
            name: "Horses Race",
            //description:"Horses Race in Live",
            //type:"sports",
            //img:"",
            mod: "wb",
            brd: "horses",
            prov: "ho",
            ln: "l?p=ho",
        });
        return list;
    },

    mapGalgos: function (list) {
        list.push({
            id: "346",
            name: "Galgos Race",
            //description:"Galgos Race in Live",
            //type:"sports",
            //img:"",
            mod: "wb",
            brd: "VirtualG",
            prov: "vg",
            ln: "l?p=vg",
        });
        return list;
    },

    resolveJoinGame: function (params) {
        var self = this;
        return new Promise((resolve, reject) => {
            console.log("insertando Join Session")
            this.insertJoinSession(params).then(function (response) {
                console.log("creando Join Session")
                self.createJoinSession(params).then(response => {
                    parser = new xml2js.Parser()
                    parser.parseString(response.data, (err, result) => {
                        sessionid = result.DATA.RESPONSE[0].RESULT[0];
                    })
                    params.sessionid = sessionid;
                    resolve({ src: self.getgameURL(params) })
                }).catch(error => { reject(new Error(error)) });
            }).catch(error => { reject(new Error(error)) });
        })


    },

    resolveHorsesGame: function (params) {

        return new Promise((resolve, reject) => {
            sessionRepository.updateToken(params).then(r => {
                resolve("/api/horses?t=" + params.token)
            }).catch(e => { reject(Error(e)) });
        })


    },
    resolveVirtualgGame: function (params) {
        return "/api/virtualg?m=" + params.mode + "&username=" + params.username;
    },
    resolveTvBetGame: function (token) {
        return "/api/tvbet?t=" + token + "";

    }
};