const axios = require("axios");
const userRepository = require("../models/user");
var crypto = require("crypto");
const moment = require("moment");
var userService = {
  all: function () { },
  save: (user, callback) => {
    userRepository.save(user, function (e, r) {
      callback(r);
    });
  },
  createSession: (user, callback) => {
    userService.getByUsername(user, u => {
      var sha = crypto.createHash("sha256");
      sha.update(Math.random().toString());
      var hashcode = sha.digest("hex");
      params = {
        hashcode: hashcode,
        userid: u.id,
        clientcode: u.clientcode,
        startdate: moment().format("Y-M-D H:m:s"),
        token: ""
      };
      userService.insertSession(params, r => {
        u.sessionid = r.hashcode;
        callback(u);
      });
    });
  },
  insertSession: (params, callback) => {
    userRepository.insertSession(params).then(r => {
      callback(r);
    });
  },
  validateSession: (params, callback) => {
    userRepository.getBySession(params.sessionid, r => {
      callback(r);
    });
  },

  validateToken: (token, callback) => {
    var data = userRepository.getByToken(token, r => {
      r.online = true;
      r.user_id = r.id;
      callback(r);
    });

    // o=new userRepository(data);
    //console.log(o);
  },
  getBalance: (userid, callback) => {
    userRepository.get(userid, r => {
      callback(r);
    });
  },

  getByUsername: (user, callback) => {
    userRepository.getByUsername(user, r => {
      callback(r);
    });
  },
  getByUsernameAndClient: params => {
    return new Promise((resolve, reject) => {
      userRepository.getByUsernameAndClient(params, (u, e) => {
        if (e) reject(e);
        else resolve(u);
      });
    });
  },

  verifyDuplicated: params => {
    return new Promise((resolve, reject) => {
      userRepository
        .verifyDuplicated(params)
        .then(r => {
          resolve(r);
        })
        .catch(e => {
          throw e;
        });
    });
  },
  getById: id => {
    return userRepository.getById(id);
  },
  auth: params => {
    hash = bcrypt.hashSync(params.username + params.client_server, 10);
    return new Promise((resolve, reject) => {
      userRepository.getByUsernameAndClient(params, (u, err) => {
        if (err) reject(err);
        else {
          userRepository.updateBalance(
            { balance: params.balance, userid: u.id },
            function (r) {
              let session = {
                hashcode: hash,
                userid: u.id,
                clientcode: u.clientcode,
                startdate: moment().format("Y-M-D H:m:s"),
                token: ""
              };
              userRepository
                .insertSession(session)
                .then(r => {
                  resolve({});
                })
                .catch(e => {
                  reject(new Error("ERROR:" + e));
                });
            }
          );
        }
      });
    });
  }
};
module.exports = userService;
