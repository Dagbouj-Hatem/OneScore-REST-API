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
    score : [ {
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
mongoose.connect('mongodb://efc86f9ac69a0a7f752d44be2696e6a8:onescore123@9a.mongo.evennode.com:27017,9b.mongo.evennode.com:27017/efc86f9ac69a0a7f752d44be2696e6a8?replicaSet=eu-9' , { useMongoClient: true });
module.exports = mongoose.model('user', userSchema); 
