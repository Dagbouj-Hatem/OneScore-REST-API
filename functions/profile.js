'use strict';

const user = require('../models/user');
const bcrypt = require('bcryptjs');

// get profile name / last  name
exports.getProfile = email => 

	new Promise((resolve,reject) => {

		user.find({ email: email }, { name: 1 , last_name : 1 , _id: 0 })

		.then(users => resolve(users[0]))

		.catch(err => reject({ status: 500, message: 'Internal server error!' }))

	});
// get User infos
exports.getProfileUser = email => 

	new Promise((resolve,reject) => {

		user.find({ email: email }, { name: 1 , last_name : 1 , email : 1 ,  _id: 0 })

		.then(users => resolve(users[0]))

		.catch(err => reject({ status: 500, message: 'Internal server error!' }))

	});
// get Transcriber infos
exports.getProfileTranscriber = email => 

	new Promise((resolve,reject) => {

		user.find({ email: email }, { name: 1 , last_name : 1  , email : 1 , date_of_birth : 1 , title_string : 1  , university  : 1 , about  : 1 , _id: 0 })

		.then(users => resolve(users[0]))

		.catch(err => reject({ status: 500, message: 'Internal server error!' }))

	});
// updates .........
// get User infos
exports.getProfileUserSave = (id , name , last_name , email , password )=> 

	new Promise((resolve,reject) => {

		user.find({ email: id })
			.then(users => {

			const  user = users[0]; 
			// update user to transcriber  
				user.set("name" , name ); 
				user.set("last_name", last_name);
				user.set("email" , email); 
				if(password!="")
				{
					const salt = bcrypt.genSaltSync(10);
					const hash = bcrypt.hashSync(password, salt);
					user.set("hashed_password"	, hash);
				}
				 

			// return statements
			return user.save();

			  
		})

		.then(user => resolve({ status: 200, message: 'Profile updated sucessfully.' }))

		.catch(err => reject({ status: 500, message: 'Internal server error!' }))

	});
// get Transcriber infos
exports.getProfileTranscriberSave = (id, name , last_name , email , password , date_of_birth, title_string , university , about) => 

	new Promise((resolve,reject) => {

		user.find({ email: id })
			.then(users => {

			const  user = users[0]; 
			// update user to transcriber  
				user.set("name" , name ); 
				user.set("last_name", last_name);
				user.set("email" , email); 
				if(password!="")
				{
					const salt = bcrypt.genSaltSync(10);
					const hash = bcrypt.hashSync(password, salt);
					user.set("hashed_password"	, hash);
				}
				 
				user.set("date_of_birth", date_of_birth);
				user.set("title_string" , title_string); 
				user.set("university"	, university);
				user.set("about"		, about);
				
			// return statements
			return user.save();

			  
		})

		.then(user => resolve({ status: 200, message: 'Profile updated sucessfully.' }))

		.catch(err => reject({ status: 500, message: 'Internal server error!' }))

	});
