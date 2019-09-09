var express = require('express');
var app = express();
var multer = require('multer')
var constants = require('constants');
var constant = require('./config/constants');
var timeout = require('connect-timeout');
var cors = require('cors')


const securityip = require("./app/middlewares/securityip")


var port = process.env.PORT || 8042;
//var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var path = require('path');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var dateFormat = require('dateformat');
var now = new Date();
const IMG_DIR = __dirname + "/public/assets/"
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


/***************Mongodb configuratrion********************/
//var mongoose = require('mongoose');
//var configDB = require('./config/database.js');
//configuration ===============================================================
//mongoose.connect(configDB.url); // connect to our database


require('./config/passport')(passport); // pass passport for configuration
var corsOptions = {
    origin: 'https://157.230.208.35:4200',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions))
//set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
//app.use(bodyParser()); // get information from html forms
//view engine setup

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');
app.use("/img", express.static(IMG_DIR))
//required for passport
//app.use(session({ secret: 'iloveyoudear...' })); // session secret
app.use(session({
    secret: 'I Love India...',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//IPFILTER
//app.use(securityip.verify)
/*
providerService.listHosts().then(function(providers){
    let ips=providers;
    clientService.listHosts().then(function(clients){
        for(c of clients){ ips.push(c)}
        const jaggrator_ip="::ffff:54.36.166.144", horses_pi="::ffff:216.250.115.88", virtualg_ip="::ffff:127.0.0.1"
const lwp_ip="::ffff:190.237.228.227"
const ipss = [jaggrator_ip,horses_pi,virtualg_ip, lwp_ip]
        console.log(ipss)
        //ips=['109.09.08.06'];
        app.use(ipfilter(ipss, { mode: 'allow' }))
    })
})*/

// routes ======================================================================
require('./config/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

//catch 404 and forward to error handler

app.use(function (req, res, next) {
    res.status(404).render('404', { title: "Sorry, page not found", session: req.sessionbo });
});

app.use(function (req, res, next) {
    res.status(500).render('404', { title: "Sorry, page not found" });
});
/*
app.use(timeout(150000));
app.use(haltOnTimedout);

function haltOnTimedout(req, res, next){
  if (!req.timedout) next();
}*/
//launch ======================================================================
app.listen(port);
console.log('The magic happens port ' + port);
exports = module.exports = app;
