'use strict';

const user = require('../models/user'); 

const nodemailer = require('nodemailer'); 
const config = require('../config/config.json');

exports.order = (id ,link,title,description,thumbnails) => 



	new Promise((resolve, reject) => {

		user.update({ "account_type" : true  },
		{
		 $push : {
		    order :  { 
		            "id" : id,
				    "link" : link,
				    "title" : title,
				    "description" : description,
				    "thumbnails" : thumbnails
		           } //inserted data is the object to be inserted 
		  }
		},
	    {
		    multi: true //means update all matching docs
		})
/*
		.then(users => {

			let user = users[0];

			// update user to transcriber  
				user.set(); 
				user.set("date_of_birth", date_of_birth);
				user.set("title_string" , title_string); 
				user.set("university"	, university);
				user.set("about"		, about);
			// send mail to transcriber 

			// return statements
			return user.save();

			  
		})*/
//**************************************************************************
//**************************************************************************
// sent mail to user 
/*.then(() => {

const transporter = nodemailer.createTransport(`smtps://${config.email}:${config.password}@smtp.gmail.com`);

const mailOptions = {

from: `"${config.name}" <${config.email}>`,
to: email,  
subject: 'Your order', 
html: `<pre>Hello ${user.name},

You will recieve your ordered score in a few days. 

Best,
OneScore Team.</pre>`

};

	return transporter.sendMail(mailOptions);

})*/
//*************************************************************************
//*************************************************************************
		.then(user => resolve({ status: 200, message: 'saved .... !' }))

		.catch(err => reject({ status: 500, message: 'Internal Server Error !' }));

	});



// delete order 
exports.delete = (email , id ) => 

	new Promise((resolve, reject) => {

		user.update({ email: email }, { $pull: { orders : { _id : id } } }, { safe: true }) 

		.then(user => resolve({ status: 200, message: 'delete successfully  !' }))

		.catch(err => reject({ status: 500, message: 'Internal Server Error !' }));

});
