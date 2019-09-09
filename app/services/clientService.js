const axios = require('axios');
const userRepository= require("../models/user");
const clientRepository= require("../models/client");
const moment = require("moment");
var parseString = require('xml2js').parseString;

module.exports = {

    clientNotification:function(trx, play_response){
        trx.id=play_response.lasttrx
		trx.clientcode=play_response.clientcode
        userRepository.getById(trx.userid, function(err, u){
            let params={ 
                trxid:trx.id,
                movement: trx.amount < 0? "BET":"WIN",
                amount:trx.amount,
                sessionid:u.sessionid
            };
            //console.log(trx)
            clientRepository.get({code:trx.clientcode}).then(client=>{
    
                axios.post(client.server+(params.movement=="BET"?'/insertBet':"betResult"),params).then(r=>{
                    console.log("notify client: "+params.movement + ": " + params.amount);
                }).catch(e=>{ console.log("ERROR 500: No se pudo enviar notificacion al server del cliente") });
            });
        });
    },
    getByServer:function(params){
        return new Promise( (resolve, reject) =>{
            clientRepository.getByServer(params).then( c =>{
                resolve(c)
            }).catch(e=>{ reject(e) })
        })
    },

    listHosts:function(params){
        return new Promise( (resolve, reject) =>{
            clientRepository.list(params).then( l =>{
                let list=l.map( function(item){ return item.server  })
                resolve(list)
            }).catch(e=>{ reject(e) })
        })
    }

};