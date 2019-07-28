'use strict';

const user = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer'); 
const config = require('../config/config.json');
exports.registerUser = (name,last_name, email, password) => 

	new Promise((resolve,reject) => {

	    const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(password, salt);

		const newUser = new user({

			name: name,
			last_name : last_name,
			email: email,
			hashed_password: hash,
			account_type: false ,
			created_at: new Date()
		});

		newUser.save() 
//**************************************************************************
//**************************************************************************
// sent mail to user 
.then(() => {

const transporter = nodemailer.createTransport(`smtps://${config.email}:${config.password}@smtp.gmail.com`);

const mailOptions = {

from: `"${config.name}" <${config.email}>`,
to: email,  
subject: 'Sign up confirmation', 
html: `<pre style="font-family:Arial,sans-serif">Hello ${newUser.name},

Thank you for signing up for OneScore! Soon you'll get access to an infinite world of sheet music, where you can purchase the transcription of any song or track you want.

You can also join our community of transcribers and earn money from your passion.

Enjoy the OneScore experience!

Best,
OneScore Team.</pre>`

};

	return transporter.sendMail(mailOptions);

})
//*************************************************************************
//*************************************************************************

		.then(() => resolve({ status: 201, message: 'You’ve been successfully registered.' }))

		.catch(err => {

			if (err.code == 11000) {

				reject({ status: 409, message: 'You’re already registered!' });

			} else {

				reject({ status: 500, message: 'Internal server error!' });
			}
		});
	});