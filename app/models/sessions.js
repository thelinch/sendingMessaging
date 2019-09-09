var sql = require("../../config/mysql_database.js");

var Session = function(session){ // usando constructor
    this.id = session.id;
    this.name = session.name;
    //this.created_at = new Date();
};

Session.save = function save(session,result){
    sql.query("INSERT INTO sessions set ? ", session, function(err, res){
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

Session.updateToken=(params)=>{
    return new Promise( (resolve, reject) =>{
        s_query="update session set token=? where hashcode=?";
        sql.query(s_query, [params.token, params.hashcode], (err, rows)=>{
        if(err) reject( new Error("Error SQL:"+err) )
        else { resolve({hashcode:params.hashcode});}
    })
    })

    sql.query("update user set balance=? where id=?",[params.balance,params.userid],(err,rows)=>{
        callback({});
    });
}

module.exports = Session;