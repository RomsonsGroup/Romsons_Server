module.exports = app => {
    const Auth = require("../controllers/auth.controller");
  
    var router = require("express").Router();
  
   
    // Retrieve all published osbss
    router.post("/loginApps", Auth.login);
    // router.post("/checkStatus", Auth.checkStatus);
    router.post("/changepassword", Auth.changepassword);
    app.use('/', router);
  };
  