var home = require("../app/controllers/home");
var api = require("../app/controllers/api");
var horsesAPI = require("../app/controllers/horsesAPI");
var virtualgAPI = require("../app/controllers/virtualgAPI");
var slotmaticAPI = require("../app/controllers/slotmaticAPI");
var tvBetAPI = require("../app/controllers/tvBetAPI");
//you can include all your controllers
var eventBetAPI = require("../app/controllers/eventBetAPI");
module.exports = function (app, passport) {
  // app.get('/login', home.login);
  // app.get('/signup', home.signup);
  //app.get('/', home.loggedIn, home.home);//home
  app.get("/", api.index);
  //app.get('/home', home.loggedIn, home.home);//home
  //app.get('/createUser', home.createUser);//home
  //app.get('/lauch', home.launch);//home
  /*app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/home', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/home', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));*/

  /*  functions for join games */
  //app.get("/api/getBalance", api.getBalance);
  app.post("/api/getBalance", api.getBalance);
  app.post("/api/setPlay", api.play);
  app.post("/api/sendMessaging", api.sendMessaging);
  app.post("/api/registerAndUpdateTokenUser", api.registerAndUpdateTokenUser)
  app.post("/api/clean", api.clean)

  //for horses integration
  app.get("/api/horses", horsesAPI.view);
  app.get("/api/horses/getBalance", horsesAPI.getBalance);
  app.post("/api/horses/credit", horsesAPI.addCredit);
  app.post("/api/horses/debit", horsesAPI.debit);
  app.get("/api/horses/validateUserToken", horsesAPI.validateUserToken);

  //for virtualG integration
  app.get("/api/virtualg", virtualgAPI.view);
  app.post("/api/virtualg/insertBet", virtualgAPI.insertbet);
  app.post("/api/virtualg/cancelBet", virtualgAPI.cancelbet);
  app.post("/api/virtualg/betResult", virtualgAPI.betresult);
  //app.get('/api/virtualg/createtoken', virtualgAPI.createToken);

  //for slotmatic
  app.get("/api/slotmatic/testhmac", slotmaticAPI.testHmac);
  app.get(
    "/api/slotmatic/testregeneratedhmac",
    slotmaticAPI.testregeneratedHmac
  );
  app.get("/api/slotmatic", slotmaticAPI.view);
  app.post("/venum/GetPlayerBalance", slotmaticAPI.getPlayerBalance);
  app.post("/venum/WithdrawAndDeposit", slotmaticAPI.withdrawAndDeposit);
  app.post("/venum/Cancel", slotmaticAPI.cancel);
  app.post("/api/slotmatic/gameplay", slotmaticAPI.gameplay);
  app.get("/api/slotmatic/login", slotmaticAPI.createPlayerifnotExists);
  app.get("/api/slotmatic/gameview:view?", slotmaticAPI.showgame);
  app.get("/crossdomain.xml", function (req, res) {
    res.contentType("text/xml; Charset=utf-8");
    res.render("crossdomain");
  });
  /*universal api */
  app.post("/api/createuser", api.createuser);
  app.post("/api/auth", api.auth);
  app.get("/api/gamelist", api.gamelist); //obtener la lista de juegos por cliente
  app.get("/api/l", api.launchGame);

  //for tvBet
  app.get("/api/tvbet", tvBetAPI.view);
  app.post("/api/tvbet/GetUserData", tvBetAPI.getUserData);
  app.post("/api/tvbet/MakePayment", tvBetAPI.makePayment);
  app.post("/api/tvbet/GetPaymentInfo", tvBetAPI.getPaymentInfo);
  //for eventBetApi
  app.get("/api/games", api.updateImageProviders)
  app.get("/api/eventBet", eventBetAPI.view)
};
