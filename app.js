var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var session = require('express-session');
var config = require('./config');
var request = require('request');

var index = require('./routes/index.js');
var mongoose = require('./lib/mongoose');

var Note = require('./models/note_model.js').note; //db model

var app = express();

var router = express.Router();

// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(session({
        secret            : 'keyboard cat',
        saveUninitialized : true,
        resave            : true
    })
);

app.use('/', index);
app.use('/', router);
app.use('/index.html', index);

router.route('/notification.html').get(function(req, res) {
	Note.find({},{__v: false, _id: false}, function(err, data) {
		if (!err) {
			res.render('notification.ejs', {data: data});
		} else {
			console.log(err);
		}
	});
});

router.route('/s/:id').get(function(req, res) { //going to uri
	var id = req.params.id;
	if (id) {
		Note.find({id: {'$in' : [id]}}, {_id: false, __v: false}, function(err, data) {
			res.redirect(data[0].uri[id]);
			// console.log(data[0].uri[id]); //data[0].textarea, data[0].uri ...
		});
	}
});

router.route('/delete').post(function(req, res) { //deleting note by id
	var id = req.body.id;
	Note.remove({note_id: id}, function(err, note) {
		if (!err) {
			res.send('deleted');
		}
	});
});

router.route('/getForm').post(function(req, res) { //getting posted information
	if (req.session.captcha == parseInt(req.body.captcha_client)) {
		var textarea = req.body.textarea;

		var new_textarea = '';
		var tags = '';
		var new_tags = [];
		var new_http_array = [];
		var tag = [];
		var bool = true;
		var links = {};

		var http_array = textarea.match(/(http|https:\/\/){1,}[\w,?/+~#=&:%.-]{1,}/gi); //this array contain links
		
		if (http_array) {
			var http_length = http_array.length; //length of array
		}
		
		var k = 0;
		textarea = textarea.replace(/(http|https:\/\/){1,}[\w,?/+~#=&:%.-]{1,}/gi, '*'); //textarea without links

		var unique_id = 0;
		var unique_id_array = [];
		var note_id = 0;

		for (var item in http_array) (function(item, http_array) {
			request(http_array[item], function(err, _res, body) {
				if (!err) {
					if (_res.headers['content-type']) {
						if (_res.headers['content-type'].match(/(image\/){1}(\w){1,}/g)) { //if image
							new_http_array[item] = "<p><img style='max-width: 620px;' src='" + http_array[item] +"'></p>";
						} else { //if not image
							unique_id = Math.random().toString().substr(5, 4);
							new_http_array[item] = "<a class='link' href='http://localhost:"+ config.get('port') +"/s/" + unique_id + "'>" + "http://localhost" + config.get('port') +"/s/" + unique_id + "</a>";
							unique_id_array.push(unique_id);
							links[unique_id] = http_array[item]; //some link
						}
					} else {
						textarea = textarea.replace(/(\*)/, "");
					}
					k++;
				}
			});
		})(item, http_array);

		var timer = setInterval(function() { //waiting for all request
			if (k === http_length) {
				clearInterval(timer);
				please_work();
			}
		}, 200);

		function please_work() { //this function must work, because...
			if (new_http_array) {
				for (var item in new_http_array) { //replacing * with links
					if (bool) {
						new_textarea = textarea.replace(/\*/, new_http_array[item]);
						bool = false;
					} else {
						new_textarea = new_textarea.replace(/\*/, new_http_array[item]);
					}
				}
			}

			//new_textarea

			tags = new_textarea.match(/(#)(\w){1,}/gi);
			for (var item in tags) { //parsing hash tags - #
				new_tags[item] = "<a class='tags' href='http://localhost:"+ config.get('port') +"/t/" + tags[item].substr(1) + "'>" + tags[item] + "</a>"; //<a href='http://localhost:8080/t/new'>#new</a>
				tag[item] = tags[item].substr(1); //array => new, php, ...
			}

			new_textarea = new_textarea.replace(/(#)(\w){1,}/gi, "*");

			for (var item in new_tags) {
				new_textarea = new_textarea.replace(/\*/, new_tags[item]);
			}

			//new_textarea, new_tags, unique_id_array, tag, note_id,  ready to use
			note_id = Math.random().toString().substr(5, 6);

			var note = new Note({
				textarea: new_textarea,
				tags: tag,
				uri: links,
				id: unique_id_array,
				note_id: note_id
			});

			note.save(function(err, note) {
				if (!err) {
					var captcha = Math.round(100000 + Math.random() * 999999);
					req.session.captcha = captcha;
					res.render('index.ejs', {data: {success: "Notification siccessfully added :)", captcha: captcha}});
				}
			});
		}

	} else {
		var captcha = Math.round(100000 + Math.random() * 999999);
		req.session.captcha = captcha;
		res.render('index.ejs', {data: {error: "Captcha is incorrect", captcha: captcha, textarea: req.body.textarea}});
	}
});

router.route('/t/:tag').get(function(req, res) { //showing all matched tag note
	var tag_name = req.params.tag;
	if (tag_name) {
		Note.find({tags: tag_name}, function(err, data) {
			if (!err) {
				// console.log(data);
				res.render('notification.ejs', {data: data});
			}
		});
	}
});

app.use(function(req, res, next) { //404
	res.redirect('/');
});

module.exports = app;

// app.listen(config.get('port'), function() {
//   console.log('Express server listening on port ' + config.get('port'));
// });