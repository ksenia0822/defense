'use strict';

var router = require('express').Router();

var HttpError = require('../utils/HttpError');
var User = require('../api/users/user.model');


var crypto = require('crypto');

router.post('/login', function (req, res, next) {
	User.findOne(req.body).exec()
	.then(function(user) {
		console.log(user)
		var salt = user.salt;
		var iterations = 1;
		var bytes = 64;
		var buffer = crypto.pbkdf2Sync(user.password, salt, iterations, bytes);
		var hash = buffer.toString('base64');
		return user;
	})
	.then(function (user) {
		if (!user) throw HttpError(401);
		else if ()
		req.login(user, function () {
			res.json(user);
		});
	})
	.then(null, next);
});

router.post('/signup', function (req, res, next) {
	var salt = crypto.randomBytes(16);
	var iterations = 1;
	var bytes = 64;
	var buffer = crypto.pbkdf2Sync(req.body.password, salt, iterations, bytes);
	var hash = buffer.toString('base64');

	User.create(req.body)
	.then(function (user) {
		req.login(user, function () {
			res.status(201).json(user);
		})
		return user;
	})
	.then(function(user) {
		var update = { $set: {password: hash, salt: salt}}
		User.findOneAndUpdate({_id: user._id}, update, {new: true}, function(err, user) {
			if (err) return next(err);
			// console.log('user is ', user)
			// console.log('hash is ', hash)
			res.status(201);
		})

	})
	.then(null, next);
});

router.get('/me', function (req, res, next) {
	res.json(req.user);
});

router.delete('/me', function (req, res, next) {
	req.logout();
	res.status(204).end();
});

router.use('/google', require('./google.oauth'));

router.use('/twitter', require('./twitter.oauth'));

router.use('/github', require('./github.oauth'));

module.exports = router;