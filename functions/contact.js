'use strict';

const user = require('../models/user');
const nodemailer = require('nodemailer'); 
const config = require('../config/config.json');

exports.contact = (email, subject , message ) => 

	new Promise((resolve,reject) => {

		user.find({email: email})

		.then(users => {

			if (users.length == 0) {

				reject({ status: 404, message: 'User Not Found !' });

			} else {

				return users[0];

			}
		})

		.then(user => { 
// sent mail to user  

const transporter = nodemailer.createTransport(`smtps://${config.email}:${config.password}@smtp.gmail.com`);

const mailOptions = {

from: `"${config.name}" <${config.email}>`,
to: email,  
subject: subject , 
html: `<pre>${ message }</pre>`

};

	return transporter.sendMail(mailOptions);

})
//*************************************************************************
//*************************************************************************
		.then(user => resolve({ status: 200, message: 'You have successfully registered !' }))

		.catch(err => reject({ status: 500, message: 'Internal Server Error !' }));

	});
 