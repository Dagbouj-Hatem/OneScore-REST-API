'use strict';

const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({ 

	name 			: String,
	file			: String,  

});

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://6cc064a3650fdff1771e4c99f684a70b:onscore123@6a.mongo.evennode.com:27017,6b.mongo.evennode.com:27017/6cc064a3650fdff1771e4c99f684a70b?replicaSet=eu-6' , { useMongoClient: true });
module.exports = mongoose.model('transcription', userSchema); 
