'use strict';

const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({ 

	name 			: String,
	email			: String, 
	hashed_password	: String,
	created_at		: String,
	temp_password	: String,
	temp_password_time: String

});

mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://localhost:27017/onescore', { useMongoClient: true }); // localhost
mongoose.connect('mongodb://2fe367726c5d2bac361bf48ef4e8f7b6:webmaster123@6a.mongo.evennode.com:27017,6b.mongo.evennode.com:27017/2fe367726c5d2bac361bf48ef4e8f7b6?replicaSet=eu-6' , { useMongoClient: true });
module.exports = mongoose.model('user', userSchema); 
