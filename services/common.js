const jwt = require("jsonwebtoken");

exports.isAuth = (req, res, done)=>{
    return authenticate('jwt')
     }