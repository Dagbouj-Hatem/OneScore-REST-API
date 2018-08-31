'use strict';

const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({ 

    name            : String,
	last_name 		: String,
	email			: String, 
	hashed_password	: String,

	account_type	: Boolean, // false --> simple user 
	date_of_birth: {
        type 	: String,
        required: false 
    },
    title_string: {
        type 	: String,
        required: false 
    },	
    university: {
        type 	: String,
        required: false 
    },    
    about: {
        type 	: String,
        required: false 
    },
    order : [ {
    id : String,
    link : String,
    title : String,
    description : String,
    thumbnails : String
     }] ,

	created_at		: String,
	temp_password	: String,
	temp_password_time: String

});

mongoose.Promise = global.Promise; 
mongoose.connect('mongodb://7b0d56b99a1200fb152dc1036fb3ef9d:onescore123@6a.mongo.evennode.com:27017,6b.mongo.evennode.com:27017/7b0d56b99a1200fb152dc1036fb3ef9d?replicaSet=eu-6' , { useMongoClient: true });
module.exports = mongoose.model('user', userSchema); 
