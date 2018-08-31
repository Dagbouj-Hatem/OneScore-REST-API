'use strict';

const user = require('../models/user'); 

const nodemailer = require('nodemailer'); 
const config = require('../config/config.json');

exports.register = (email , date_of_birth , title_string , university , about ) => 

	new Promise((resolve, reject) => {

		user.find({ email: email })

		.then(users => {

			const  user = users[0];
            //const name= user.name;
            //console.log(name);
			// update user to transcriber  
				user.set("account_type" , true ); 
				user.set("date_of_birth", date_of_birth);
				user.set("title_string" , title_string); 
				user.set("university"	, university);
				user.set("about"		, about);
			// send mail to transcriber 

			// return statements
			return user.save();

			  
		})
//**************************************************************************
//**************************************************************************
// sent mail to user 
.then((user) => {

const transporter = nodemailer.createTransport(`smtps://${config.email}:${config.password}@smtp.gmail.com`);

const mailOptions = {

from: `"${config.name}" <${config.email}>`,
to: email,  
subject: 'Welcome to our community!', 
html: `<pre>Hello ${user.name},

Thank you for joining our community as a transcriber/proffreader. As a first step, you'll need to apply to our basic music transcription test that you find on your OneScore app, 'My tests'.

Best,
OneScore Team.</pre>`

};

	return transporter.sendMail(mailOptions);

})
//*************************************************************************
//*************************************************************************
		.then(user => resolve({ status: 200, message: 'You have successfully registered !' }))

		.catch(err => reject({ status: 500, message: 'Internal Server Error !' }));

	});