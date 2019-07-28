'use strict';

const user = require('../models/user');
const nodemailer = require('nodemailer'); 
const config = require('../config/config.json');

exports.contact = (email, subject , message ) => 

	new Promise((resolve,reject) => {

		user.find({email: email})

		.then(users => {

			if (users.length == 0) {

				reject({ status: 404, message: 'Couldn\'t find your onescore account!' });

			} else {

				return users[0];

			}
		})

		.then(user => { 
// sent mail to onescore team  

const transporter = nodemailer.createTransport(`smtps://${config.email}:${config.password}@smtp.gmail.com`);

const mailOptions1 = {

from: `"${config.name}" <${config.email}>`,
to: email,  
subject: 'OneScore support' , 
html: `<pre style="font-family:Arial,sans-serif">Hello ${user.name},

Thank you for contacting us, we'll reply soon to your inquiry.

Best,
OneScore Team.</pre>`

};
	return transporter.sendMail(mailOptions1);
})	
.then(() => { 
// sent mail to user   

const transporter = nodemailer.createTransport(`smtps://${config.email}:${config.password}@smtp.gmail.com`);


const mailOptions = {

from: `"${config.name}" <${config.email}>`,
to: 'info.onescore@gmail.com',  
subject: subject , 
html: `<pre style="font-family:Arial,sans-serif">${ message }</pre><br><br style="font-family:Arial,sans-serif">Message from :<i>${email}</i>`

};

	return transporter.sendMail(mailOptions);

})	
//*************************************************************************
//*************************************************************************
		.then(() => resolve({ status: 200, message: 'Thank you for getting in touch.' }))

		.catch(err => reject({ status: 500, message: 'Internal server error!' }));

	});
 