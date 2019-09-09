var sql = require("../../config/mysql_database.js");
const moment=require('moment');
var Client = function(c){ // usando constructor
    this.id = c.id;
    this.businessname = c.businessname;
};

Client.save = function save(c,result){
    sql.query("INSERT INTO client set ? ", c, function(err, res){
        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
            console.log(res.insertId);
            result(null, res.insertId);
        }
    });
}

Client.get=function get(params){

    return new Promise( (resolve, reject) =>{
        let query="SELECT * FROM client WHERE status=1 AND code = ? ";
        sql.query(query,params.code, (err, rows)=>{
        if(err) reject( new Error("Error SQL:"+err) )
        else { resolve(rows);}
    })
    })
}

Client.getByServer = function(params){
    return new Promise( (resolve, reject) =>{
        let query="SELECT * FROM client WHERE status=1 AND server = ? ";
        sql.query(query,params.server, (err, rows)=>{
        if(err) reject( new Error("Error SQL:"+err) )
        else { resolve(rows[0]);}
    })
    })
}

Client.list = function(params){
    return new Promise( (resolve, reject) =>{
        let query="SELECT * FROM client WHERE status=1";
        sql.query(query,[], (err, rows)=>{
        if(err) reject( new Error("Error SQL:"+err) )
        else { resolve(rows);}
    })
    })
}


module.exports = Client;