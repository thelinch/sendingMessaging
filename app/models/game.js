var sql = require("../../config/mysql_database.js");

var Game = {};

Game.save = function save(o, result) {
  //var sql="INSERT INTO game (gameid,name,description,type,urlimage,mode) VALUES ("+o.gameid+",'"+o.name+"','"+o.description+"','"+o.type+"','"+o.urlimage+"','"+o.mode+"')";
  sql.query("INSERT INTO game set ? ", o, function(err, res) {
    if (err) {
      console.log("ERROR: ", err);
      //result(err, null);
    } else {
      console.log(res.insertId);
      //result(null, res.insertId);
    }
  });
};

Game.getById = function getById(id, result) {
  sql.query("Select task from game where id = ? ", id, function(err, res) {
    if (err) {
      console.log("error: ", err);
      //   result(err, null);
    } else {
      //   result(null, res);
    }
  });
};

Game.all = function all(result) {
  sql.query("Select * from game", function(err, rows) {
    if (err) {
      console.log("error: ", err);
      //result(null, err);
    } else {
      console.log("list : ", rows);

      // result(null, rows);
    }
  });
};

Game.saveTransaction = function(params, callback) {
  sql.query("INSERT INTO transaction set ?", params, function(err, res) {
    if (err) {
      console.log("ERROR: ", err);
      throw err;
    } else {
      callback(res.insertId);
      /*
            let credits=0;
            sql.query("select SUM(amount) as credits from `transaction` where userid= ? ", transaction.userid,function (err, rows) {
                console.log(rows[0].credits);
                credits= rows[0].credits;
                callback(rows[0]);
                /*res.status(200).send({
                    status: true,
                    balance: credits,
                    referenceTID:transaction.trxid,
                    error:""
                });
            }); */
    }
  });
};

Game.deleteTransaction = function(params, callback) {
  sql.query("UPDATE transaction SET status=0 WHERE id=?", [params.id], function(
    err,
    result
  ) {
    if (err) {
      throw err;
    } else {
      console.log(`Changed ${result.changedRows} row(s)`);
      callback(params.id);
    }
  });
};
Game.getCredits = (userid, callback) => {
  sql.query(
    "select SUM(amount) as credits from `transaction` where userid= ? ",
    userid,
    function(err, rows) {
      console.log(rows[0].credits);
      credits = rows[0].credits;
      callback(rows[0].credits);
      /*res.status(200).send({
            status: true,
            balance: credits,
            referenceTID:transaction.trxid,
            error:""
        });*/
    }
  );
};
Game.getTransactionById = transactionId => {
  return new Promise((result, reject) => {
    sql.query("select * from `transaction` where id=?", transactionId, function(
      err,
      rows
    ) {
      if (err) reject(err);
      else result(rows[0]);
    });
  });
};

Game.getByTrxAndUserid = (params, result) => {
  sql.query(
    "SELECT * FROM transaction t WHERE t.trxid='" + params.trxid + "' AND t.userid='"+params.userid+"' ",
    (err, rows) => {
      if (err) {
        console.log("ERROR: ", err);
        throw err;
      } else {
        var data = null;
        rows.forEach(row => {
          data = row;
        });
        result(data);
      }
    }
  );
};

Game.getByTrx = (trxid, result) => {
  sql.query(
    "SELECT * FROM transaction t WHERE t.trxid='" + trxid + "' ",
    (err, rows) => {
      if (err) {
        console.log("ERROR: ", err);
        throw err;
      } else {
        var data = null;
        rows.forEach(row => {
          data = row;
        });
        result(data);
      }
    }
  );
};
/* */
Game.allforClient = function all(clientcode, res) {
  sql.query(
    "select g.gameid,g.`name`,g.description,g.type,g.urlimage,g.`mode` from clientgames cg inner join game g on g.gameid=cg.gameid where clientcode='" +
      clientcode +
      "' and status=1",
    function(err, rows) {
      if (err) {
        console.log(err);
        res.status(200).send({
          status: false,
          error: "Connect with support of Univesal"
        });
      } else {
        res.status(200).send(rows);
      }
    }
  );
};
module.exports = Game;
