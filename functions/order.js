'use strict';

const user = require('../models/user'); 

const nodemailer = require('nodemailer'); 
const config = require('../config/config.json');

exports.order = (id ,link,title,description,thumbnails, email) => 



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
		}).exec();

		user.find({ email: email })

		.then(users => {
			const  user = users[0]; 
			// return statements
			return user;
		})
 
//**************************************************************************
//**************************************************************************
// sent mail to user 
.then((user) => {

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

})
//*************************************************************************
//*************************************************************************
		.then(user => resolve({ status: 200, message: 'Order request saved successfully , check mail for more informations' }))

		.catch(err => reject({ status: 500, message: 'Internal Server Error !' }));

	});

// delete order 
exports.delete = (email , id ) => 

	new Promise((resolve, reject) => {

		user.update({ email: email }, { $pull: { order : { id : id } } }, { safe: true }) 

		.then(user => resolve({ status: 200, message: 'delete successfully  !' }))

		.catch(err => reject({ status: 500, message: 'Internal Server Error !' }));

});

// accept order 
exports.accept = (email , id ,link,title,description,thumbnails) => 

	new Promise((resolve, reject) => {
		// add to score
		user.update({ email : email  },
		{
		 $push : {
		    score :  { 
		            "id" : id,
				    "link" : link,
				    "title" : title,
				    "description" : description,
				    "thumbnails" : thumbnails
		           } //inserted data is the object to be inserted 
		  }
		},
	    {
		    multi: false //means update all matching docs
		}).exec();
		// delete from order 
		user.update({ email: email }, { $pull: { order : { id : id } } }, { safe: true })

		.then(user => resolve({ status: 200, message: 'delete successfully  !' }))

		.catch(err => reject({ status: 500, message: 'Internal Server Error !' }));

});
