var sql = require("../../config/mysql_database.js");
const moment=require('moment');
var Provider = function(){ // usando constructor
};

Provider.list = function(params){
    return new Promise( (resolve, reject) =>{
        let query="SELECT * FROM provider WHERE status=1";
        sql.query(query,[], (err, rows)=>{
        if(err) reject( new Error("Error SQL:"+err) )
        else { resolve(rows);}
    })
    })
}


module.exports = Provider;