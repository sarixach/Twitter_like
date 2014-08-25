var express = require('express');
var router = express.Router();
var session = require('express-session');

/* GET home page. */
router.get('/', function(req, res) {
	var captcha = Math.round(100000 + Math.random() * 999999);
	req.session.captcha = captcha;
    res.render('index.ejs', {data: {captcha: captcha}});
});

module.exports = router;