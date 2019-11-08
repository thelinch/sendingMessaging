'user strict';
var mysql = require('mysql');

//local mysql db connection
var connection = mysql.createConnection({
    host: '162.243.172.145',
    user: 'universal_api',
    password: 's.94teward',
    database: 'universal_api'
});

connection.connect(function (err) {
    if (err) console.log("no se pudo conectar mysql");
});

module.exports = connection;