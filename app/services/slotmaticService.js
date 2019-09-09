const axios = require('axios');
const moment=require('moment');
var crypto = require('crypto');
var md5 = require('md5');

module.exports = {

    ///// THE PUBLIC KEY ASSIGNED TO YOUR ACCOUNT:
    publickey : "3w8xT92EZFwXPYWJrcEB",
    ///// THE SECRET KEY ASSIGNED TO YOUR ACCOUNT:
    secretkey: "bX9TK88esBwGdfBEUq7Y",
    apilocation: "https://api4.slotomatic.net/api/",
    // funcion para conectarse la api de SlotGames
    // enpoint="casino/getBalance"
    testregeneratedHmac:function(){

        var params={'gamename': 'hot7',
        'gameversion': '201501200000-RBX04sOyqI',
        'softwaretime': '1',
        'softwarenonce': 'none',
        'softwarehmac': 'none',
        'pubkey':'3w8xT92EZFwXPYWJrcEB',
        'time' :1565893902,
        'nonce': '2d0738c9682072b1ae94dfdc220ad129',
        'requrl':encodeURIComponent('https://api4.slotomatic.net/api/game/demo/launchgame'),
        'hmac':encodeURIComponent('KhWpVg2abNM63G87MDiQCyETDrE=')};

        var data={'credit': 50000,
        'minbet': '1',
        'maxbet':'400',
        'betlist':'1,2,4,6,8,10,20,30,40,50,60,70,80,90,100,120,140,160,180,200,240,280,320,360,400',
        'gamekey':'23375a05ed9b924dad7e05683d8164b646b277a30045345001565893903z135z0',
        'minversion':0,
        'creditconversion': 100,
        'currencysymbol': '#',
        'currencydecimals': '1',
        'currencysymbolcomeslast': '0',
        'gamemode':'0',
        'jackpotmode': '1',
        'servertime': 1565893903,
        'softwarehmac': 'ZTBiZDJmNGNiYzlhNDVhZGNhOWE2MzI1MzkwNjc1ZjIzZTU1YzNhMw==',
        'status': 'OK'};

        let regeneratedhmac= crypto.createHmac("sha1", this.secretkey)
        regeneratedhmac.write(this.http_build_query(params)+"tnPEKn7ff1"+JSON.stringify(data))
        regeneratedhmac.end()
        return {
            regeneratedhmac:regeneratedhmac.read().toString("base64"),
            data:JSON.stringify(data),
            params:this.http_build_query(params)
        }
    },
    testregeneratedHmac2:function(){

        var params={
            'filter_brands': 'Playtech',
        'pubkey': '3w8xT92EZFwXPYWJrcEB',
        'time': 1565899258,
        'nonce': 'e60b8f62ccafd57771a5df0ec42ff369',
        'requrl': encodeURIComponent('https://api4.slotomatic.net/api/casino/list_games_v2'),
        'hmac': encodeURIComponent('PaUQig9T4hxirS2yrWO4+OcbGaQ=')
        };

        var data={
            'games':
                [{'gameId':'cherrylove',
        'gameLabel': 'Cherry Love',
        'gameBrand': 'Playtech',
        'gameCategory': 'Video Slots',
        'gameTechnology': 'flash',
        'desktop': 'yes',
        'mobile': 'no',
        'gameLines': '30',
        'gameFeatures': '',
        'gameDescription': '',
        'logoUrl': "https://static.gamingmodule.net/images/cherrylove.jpg" 
        } ],
        'status': 'OK'
        };
        let data_json = JSON.stringify(data);
        data_json=data_json.replace(/\//g,"\\/");
        //console.log(data_json);
        let regeneratedhmac= crypto.createHmac("sha1", this.secretkey)
        regeneratedhmac.write(this.http_build_query(params)+"tnPEKn7ff1"+data_json)
        regeneratedhmac.end()
        
        return {
            //logoUrl:JSON.parse( JSON.stringify(data.games[0].logoUrl) ),
            regeneratedhmac:regeneratedhmac.read().toString("base64"),
            data:data_json,
            params:this.http_build_query(params)
        }
    },
    testHmac:function(){

        //var str=this.shuffle( "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" ).substr(0,10);
        var str = "uMHWAB67Uf";
        var microtime="0.97199988 1565849126";
        var enpoint ="game/demo/launchgame";
        var params = {};
        params.pubkey=this.publickey;
        params.time="1565844352";
        params.nonce = md5(str+microtime);
        params.requrl=encodeURIComponent(this.apilocation+enpoint);
        let hmac= crypto.createHmac("sha1", this.secretkey)
        http_query=this.http_build_query(params);
        hmac.write(http_query+"ILN4kJYDx8")
        hmac.end()
        params.hmac = hmac.read().toString("base64");
        params.http_query = http_query;
        params.microtime= this.microtime();
        
        return params;
    },
    apirequest:function(enpoint, params={} ) {
        var self=this;
        return new Promise( function(resolve, reject){
            //var time ="1565850186";
            //var microtime= "0.97199988 1565849126";
            //var str= "uMHWAB67Uf";
            //var nonce = md5(str+microtime);
            var time=moment().unix();
            var str=self.shuffle( "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" ).substr(0,10);
            var nonce = md5(str + self.microtime());
           
            params.pubkey=self.publickey;
            params.time = time;
            params.nonce=nonce;
            //params.requrl=encodeURIComponent(self.apilocation+enpoint);
            params.requrl=self.apilocation+enpoint;
            //params.hmac=crypto.createHmac('sha1',self.secretkey).update(self.http_build_query(params)+"ILN4kJYDx8").digest().toString('base64');
            let hmac= crypto.createHmac("sha1", self.secretkey)
            hmac.write(self.http_build_query(params, true)+"ILN4kJYDx8")
            hmac.end()
            params.hmac = hmac.read().toString("base64");
            console.log("enviando hmac:"+params.hmac);
            params.requrl=self.apilocation+enpoint;
            
            //console.log(params);
            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
            axios.post("https://api4.slotomatic.net/api/"+enpoint,self.http_build_query(params, true),headers).then(r=>{
                
                let data = r.data;
                let result={};
                if( !("status" in data)){
                    result ={status:"Error: Response Status unknown."}
                }else if( r.data.status !="OK" ){
                    result={status:data.status}
                }else if( !("hmac" in data) ){
                    result = {status:"Error: Response HMAC not received."}
                }else{
                    
                    let responsehmac = data.hmac
                    delete data.hmac
                    //console.log(data)
                    //console.log(params)
                    let data_json = JSON.stringify(data)
                    if(enpoint=="casino/list_games_v2"){
                        data_json=data_json.replace(/\//g,"\\/")
                    }
                    
                     
                    let regeneratedhmac= crypto.createHmac("sha1", self.secretkey)
                    regeneratedhmac.write(self.http_build_query(params, true)+"tnPEKn7ff1"+data_json )
                    regeneratedhmac.end()
                    //let regeneratedhmac = crypto.createHmac('sha1',self.secretkey).update(self.http_build_query(params)+"tnPEKn7ff1"+JSON.stringify(data)).digest().toString('base64')
                    regeneratedhmac = regeneratedhmac.read().toString("base64");
                    console.log("hmac devuelto por api4: "+responsehmac)
                    console.log("Hmac regenerado: "+regeneratedhmac)
                    if(regeneratedhmac!=responsehmac){
                    //if(false){
                        result = {status:"Error: Response HMAC mismatch!!!!..."}
                    }else{
                        result = data
                    }
                }
                resolve(result);
            }).catch(e=>{
                console.log(e);
                reject(e);
            })
        });
    },
    // Sirve para barajar una cadena
    shuffle:function(string) {
        var parts = string.split('');
        for (var i = parts.length; i > 0;) {
            var random = parseInt(Math.random() * i);
            var temp = parts[--i];
            parts[i] = parts[random];
            parts[random] = temp;
        }
        return parts.join('');
    },

    // Para construir los parametos (&nombre=juan&time=123123123&..)
    http_build_query:function(jsonObj, encoded) {
        const keys = Object.keys(jsonObj);
        const values = keys.map(key => jsonObj[key]);
        return keys
        .map((key, index) => {
            if(encoded) return `${key}=`+encodeURIComponent(`${values[index]}`);
            else return `${key}=${values[index]}`;
        })
        .join("&");
    },

    //obtiene los microsegundos y los milisegundos
    microtime:function(getAsFloat) {
        var s,
            now = (Date.now ? Date.now() : new Date().getTime()) / 1000;
        // Getting microtime as a float is easy
        if(getAsFloat) {
            return now
        }
        // Dirty trick to only get the integer part
        s = now | 0
        return (Math.round((now - s) * 100000000) / 100000000) + ' ' + s
    },
    formatGames:function(list){
         list = list.filter(e=> !(/EGT/.test(e.gameBrand) && isNaN(e.gameId) ) );

        return list.map(function(g){ 
            let url="slotmatic/gameview";
            let brand = g.gameBrand.match(/Novomatic|Netent|EGT|Amatic|Wazdan/);
            if(brand!=null) url+="_"+brand[0].toLowerCase();
            console.log(url);
            if( ( /Amatic|Netent/.test(g.gameBrand) ) && g.mobile=='yes') url+="_mobile";
            console.log(url);
            if(g.gameBrand=='Amatic'&& g.mobile=='no') url+="_mobile";
            console.log(url);
            if( g.gameBrand=="Netent" && g.gameTechnology=='html5' ){
                url="slotmatic/gameview_netenthtml";
            }
            console.log(url);
            if(  /EGT/.test(g.gameBrand) ){
                url+="_mobile";
                console.log(g);
                console.log(url);
            }
            return {
                id:g.gameId, 
                name:g.gameLabel.replace(/'/g,""),
                brand:g.gameBrand,
                mobile:g.mobile, 
                url: url,
            }
        });
    },
    onGameEvent:function(playerid, newbalance,eventdescription,bet,win){ //never used. 
        console.log("player:"+playerid);
        console.log("newbalance:"+newbalance);
        console.log("eventdescription:"+eventdescription);
        console.log("bet:"+bet);
        console.log("win:"+win);
        // *******************************************************************************************************************************************
	// HERE IS SUPPOSED TO BE YOUR CODE TO UPDATE PLAYER'S BALANCE IN YOUR SYSTEM BASED ON GAME OUTCOMES AND LOG THE BETTING EVENT IF YOU WANT TO.
	//
	// $PLAYERID - THE IDENTIFIER YOU PREVIOUSLY ASSIGNED TO YOUR USER WHO DID BET
	// $NEWBALANCE - THE PLAYER'S CURRENT BALANCE IN OUR SYSTEM
	// $EVENTDESCRIPTION - A SHORT DESCRIPTION OF WHAT EXACTLY HAPPENED
	// *******************************************************************************************************************************************
    },
}