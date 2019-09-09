var sql = require("../../config/mysql_database.js");
const moment = require("moment");
var User = function(user) {
  // usando constructor
  this.id = user.id;
  this.name = user.name;
  //this.created_at = new Date();
};

User.save = function save(user, result) {
  sql.query("INSERT INTO user set ? ", user, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      console.log(res.insertId);
      result(null, res.insertId);
    }
  });
};

User.getById = function getById(id) {
  return new Promise((result, reject) => {
    sql.query(
      "SELECT u.id, u.clientcode, u.username, u.firstname, u.lastname, u.gender, u.balance, u.currency, u.country, u.type, u.online, s.hashcode as sessionid, s.token FROM user u LEFT JOIN session s ON u.id = s.userid WHERE u.id = ? ORDER BY u.id DESC limit 1",
      id,
      function(err, res) {
        if (err) {
          reject(err);
        } else {
          if (res.length > 0) result(res[0]);
          else reject({ cd: 3 });
        }
      }
    );
  });
};

User.verifyDuplicated = function verifyDuplicated(params) {
  return new Promise((resolve, reject) => {
    sql.query(
      "SELECT * FROM user u inner join client c on u.clientcode=c.code WHERE u.username=? and c.server=? ",
      [params.username, params.client_server],
      function(err, rows) {
        if (err) reject(err);
        else {
          let exist = rows.length > 0 ? rows[0] : false;
          resolve(exist);
        }
      }
    );
  });
};

User.all = function all(result) {
  sql.query("Select * from users", function(err, rows) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("list : ", rows);

      result(null, rows);
    }
  });
};

(User.getByToken = (token, result) => {
  console.log(token);
  sql.query(
    "SELECT u.id, u.clientcode, u.username, u.balance, u.currency, u.country, u.type, u.online FROM user u INNER JOIN session s ON u.id = s.userid WHERE s.token='" +
      token +
      "'",
    (err, rows) => {
      if (err) {
        console.log("error: ", err);
        throw err;
      } else {
        var data = {};
        rows.forEach(row => {
          data = row;
        });
        result(data);
      }
    }
  );
}),
  (User.getByUsername = (user, result) => {
    var query =
      "SELECT u.id, u.clientcode, u.username, u.firstname, u.lastname, u.gender, u.balance, u.currency, u.country, u.type, u.online, s.hashcode as sessionid, s.token FROM user u LEFT JOIN session s ON u.id = s.userid WHERE u.username='" +
      user.username +
      "'";
    console.log(query);
    sql.query(query, (err, rows) => {
      if (err) {
        console.log("error: ", err);
        throw err;
      } else {
        result(rows[0]);
      }
    });
  }),
  (User.getByUsernameAndClient = (user, result) => {
    var query =
      "SELECT u.id, u.clientcode, u.username, u.firstname, u.lastname, u.gender, u.balance, u.currency, u.country, u.type, u.online, s.hashcode as sessionid, s.token FROM user u inner join client c on u.clientcode=c.code  LEFT JOIN session s ON u.id = s.userid WHERE u.username='" +
      user.username +
      "' and c.server='" +
      user.client_server +
      "'";

    sql.query(query, (err, rows) => {
      if (err) {
        throw err;
      } else {
        if (rows.length > 0) result(rows[0], null);
        else result(null, "user doesnt exist for " + user.client_server);
      }
    });
  }),
  (User.getBySession = (sessionid, result) => {
    sql.query(
      "SELECT u.id, u.clientcode, u.username, u.balance, u.currency, u.country, u.type, u.online FROM user u INNER JOIN session s ON u.id = s.userid WHERE s.hashcode='" +
        sessionid +
        "'",
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
  });
// get only user by username
(User.getUserByUsername = (user, result) => {
  console.log(user);
  var query =
    "SELECT u.id, u.clientcode, u.username, u.firstname, u.lastname, u.gender, u.balance, u.currency, u.country, u.type FROM user u WHERE u.username='" +
    user.username +
    "'";
  console.log(query);
  sql.query(query, (err, rows) => {
    if (err) {
      console.log("error: ", err);
      throw err;
    } else {
      result(rows[0]);
    }
  });
}),
  (User.get = function(id, callback) {
    //sql.query("select SUM(amount) as credits from `transaction` where userid= ? ", id,function (err, rows) {
    sql.query("select * from user where id= ? ", [id], function(err, rows) {
      if (err) {
        console.log("error: ", err);
        throw err;
      } else {
        var data = {};
        rows.forEach(row => {
          data = row;
        });
        callback(data);
      }
    });
  });

User.updateBalance = (params, callback) => {
  sql.query(
    "update user set balance=? where id=?",
    [params.balance, params.userid],
    (err, rows) => {
      callback({});
    }
  );
};

User.insertSession = params => {
  return new Promise((resolve, reject) => {
    s_query =
      "insert into session (hashcode, userid, clientcode, startdate, updatedate, status, token) values(?,?,?,?,?,?,?)";
    sql.query(
      s_query,
      [
        params.hashcode,
        params.userid,
        params.clientcode,
        params.startdate,
        moment().format("Y-M-D H:m:s"),
        1,
        params.token
      ],
      (err, rows) => {
        if (err) reject(new Error("Error SQL:" + err));
        else {
          console.log("ejecuto SQL correcto");
          resolve({ hashcode: params.hashcode });
        }
      }
    );
  });
};

module.exports = User;
