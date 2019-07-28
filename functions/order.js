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
html: `<pre style="font-family:Arial,sans-serif">Hello ${user.name},

You will recieve your ordered score in a few days. 

Best,
OneScore Team.</pre>`

};

	return transporter.sendMail(mailOptions);

})
//*************************************************************************
//*************************************************************************
		.then(user => resolve({ status: 200, message: 'Your request have been saved.' }))

		.catch(err => reject({ status: 500, message: 'Internal server error!' }));

	});

// delete order 
exports.delete = (email , id ) => 

	new Promise((resolve, reject) => {

		user.update({ email: email }, { $pull: { order : { id : id } } }, { safe: true }) 

		.then(user => resolve({ status: 200, message: 'delete successfully.' }))

		.catch(err => reject({ status: 500, message: 'Internal server error!' }));

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

		.then(user => resolve({ status: 200, message: 'Request added to transcription list.' }))

		.catch(err => reject({ status: 500, message: 'Internal server error!' }));

});

exports.allOrder = (email) => 

	new Promise((resolve, reject) => { 
		// delete from order 
		user.find({ email: email }, { order: 1 , _id: 0})
		.then(users => resolve(users[0].order))

		.catch(err => reject({ status: 500, message: 'Internal server error!' }));

});

exports.allScore= (email) => 

	new Promise((resolve, reject) => { 
		// delete from score 
		user.find({ email: email }, { score: 1 , _id: 0})
		.then(users => resolve(users[0].score))

		.catch(err => reject({ status: 500, message: 'Internal server error!' }));

});

exports.bayScore= (email, link)=>
	new Promise((resolve, reject) => { 
		// delete from score 
		user.find({ email: email })
		.then(users => {
			const  user = users[0]; 
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
subject: 'Your purchase', 
html: `<pre style="font-family:Arial,sans-serif">Hello ${user.name},

Thank you for your purchase. Attached to this email is your score file.

Best,
OneScore Team.</pre>
<img src='http://onescore.eu-4.evennode.com/api/v1/image/${link}' >

`

};

	return transporter.sendMail(mailOptions);

})
//*************************************************************************
//*************************************************************************
		.then(user => resolve({ status: 200, message: 'Please check your email.' }))

		.catch(err => reject({ status: 500, message: 'Internal server error!' }));

	});

