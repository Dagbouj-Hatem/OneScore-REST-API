'use strict';

const transcription = require('../models/transcription');
const bcrypt = require('bcryptjs');

exports.getTranscription = (name) => 

	new Promise((resolve,reject) => {

		transcription.find({name: name})

		.then(users => {

			if (users.length == 0) {

				reject({ status: 404, message: 'User Not Found !' });

			} else {

				return users[0];

			}
		})

		.then(user => {

			const hashed_password = user.hashed_password;

			if (bcrypt.compareSync(password, hashed_password)) {

				resolve({ status: 200, message: email });

			} else {

				reject({ status: 401, message: 'Invalid Credentials !' });
			}
		})

		.catch(err => reject({ status: 401, message: 'This score not found !' }));

	});