'use strict';

const auth = require('basic-auth');
const jwt = require('jsonwebtoken');

const register = require('./functions/register');
const contact = require('./functions/contact');
const register_transcriber = require('./functions/register_transcriber');
const login = require('./functions/login');
const profile = require('./functions/profile');
const password = require('./functions/password');
const order = require('./functions/order');
const config = require('./config/config.json');
// added lib
const search = require('youtube-search');
// files sections 
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://efc86f9ac69a0a7f752d44be2696e6a8:onescore123@9a.mongo.evennode.com:27017,9b.mongo.evennode.com:27017/efc86f9ac69a0a7f752d44be2696e6a8?replicaSet=eu-9';
var path = require('path');
var multer = require('multer');
var gridfs = require("gridfs-stream");
var fs = require("fs");
var mongoose = require('mongoose');
mongoose.connect(url, { useMongoClient: true });
gridfs.mongo = mongoose.mongo;
mongoose.Promise = global.Promise;
 
gridfs.mongo = mongoose.mongo;
// Create a storage object with a given configuration
const storage = require('multer-gridfs-storage')({
   url: url
});

// end file section 

module.exports = router => {
/*
*   Home route : return hello message (test api)
*    access URL : http://localhost:8080/api/v1/
*/
	router.get('/', (req, res) => res.end('Welcome to onescore ...'));
/*
*	Auth route : return the result of auth  user 
*   access URL : http://localhost:8080/api/v1/authenticate
*/
	router.post('/auth', (req, res) => {

		const credentials = auth(req);

		if (!credentials) {

			res.status(400).json({ message: 'Invalid request!' });

		} else {

			login.loginUser(credentials.name, credentials.pass)

			.then(result => {

				const token = jwt.sign(result, config.secret, { expiresIn: 86400 });

				res.status(result.status).json({ message: result.message, account_type : result.account_type , token: token });

			})

			.catch(err => res.status(err.status).json({ message: err.message }));
		}
	});
/*
   Register route :: the body containt JSON of user data
    exemple of input : 
    
	{
		"name":"Hatem" , 
		"last_name": "Dagbouj",
		"email":"dagboujhatem2017@gmail.com",
		"password":"password"
	}
*/
	router.post('/users', (req, res) => {

		const name = req.body.name;
		const last_name= req.body.last_name;
		const email = req.body.email;
		const password = req.body.password;


		if (!name || !email || !password || !name.trim() || !email.trim() || !password.trim() || !last_name || !last_name.trim()) {

			res.status(400).json({message: 'Invalid request!'+ req.body.email +" :"+ req.query});

		} else {

			register.registerUser(name, last_name, email, password)

			.then(result => {

				res.setHeader('Location', '/users/'+email);
				res.status(result.status).json({ message: result.message })
			})

			.catch(err => res.status(err.status).json({ message: err.message }));
		}
	});
// get  User profil by  id   
// access URL : http://localhost:8080/api/v1/users/dagboujhatem2017@gmail.com

	router.get('/users/:id', (req,res) => { 

			profile.getProfile(req.params.id)
			.then(result => res.json(result))
			.catch(err => res.status(err.status).json({ message: err.message }));
	});

	router.get('/users/profile/:id', (req,res) => { 

			profile.getProfileUser(req.params.id)
			.then(result => res.json(result))
			.catch(err => res.status(err.status).json({ message: err.message }));
	});

	router.get('/transcriber/profile/:id', (req,res) => { 

			profile.getProfileTranscriber(req.params.id)
			.then(result => res.json(result))
			.catch(err => res.status(err.status).json({ message: err.message }));
	});

	// saves changes ..... 

	router.put('/users/profile/:id', (req,res) => { 

			const name = req.body.name;
			const last_name= req.body.last_name;
			const email = req.body.email;
			const password = req.body.password;

			profile.getProfileUserSave(req.params.id, name , last_name , email , password )
			.then(result => res.json(result))
			.catch(err => res.status(err.status).json({ message: err.message }));
	});

	router.put('/transcriber/profile/:id', (req,res) => { 

			const name = req.body.name;
			const last_name= req.body.last_name;
			const email = req.body.email;
			const password = req.body.password;
			const date_of_birth 	= req.body.date_of_birth;
			const title_string 		= req.body.title_string; 
			const university 		= req.body.university;
			const about 			= req.body.about;

			profile.getProfileTranscriberSave(req.params.id, name , last_name , email , password , date_of_birth, title_string , university , about)
			.then(result => res.json(result))
			.catch(err => res.status(err.status).json({ message: err.message }));
	});
// change user  ....
// access URL : http://localhost:8080/api/v1/users/dagboujhatem2017@gmail.com
	router.put('/users/:id', (req,res) => {

		if (checkToken(req)) {

			const oldPassword = req.body.password;
			const newPassword = req.body.newPassword;

			if (!oldPassword || !newPassword || !oldPassword.trim() || !newPassword.trim()) {

				res.status(400).json({ message: 'Invalid request!' });

			} else {

				password.changePassword(req.params.id, oldPassword, newPassword)

				.then(result => res.status(result.status).json({ message: result.message }))

				.catch(err => res.status(err.status).json({ message: err.message }));

			}
		} else {

			res.status(401).json({ message: 'Invalid token!' });
		}
	});
// reset password by  email 
// access url : http://localhost:8080/api/v1/users/dagboujhatem2017@gmail.com/password
	router.post('/users/:id/password', (req,res) => {

		const email = req.params.id;
		const token = req.body.token;
		const newPassword = req.body.password;

		if (!token || !newPassword || !token.trim() || !newPassword.trim()) {

			password.resetPasswordInit(email)

			.then(result => res.status(result.status).json({ message: result.message }))

			.catch(err => res.status(err.status).json({ message: err.message }));

		} else {

			password.resetPasswordFinish(email, token, newPassword)

			.then(result => res.status(result.status).json({ message: result.message }))

			.catch(err => res.status(err.status).json({ message: err.message }));
		}
	});
	// contact form 
	router.post('/contact/:id', (req,res) => {

		const email = req.params.id; 
		const subject = req.body.subject;
		const message = req.body.message; 

				if(!subject || ! message || !subject.trim() || !message.trim())
				{
					res.status(400).json({ message: 'Invalid request!' });
				}
				else
				{
					contact.contact(email, subject , message)
					.then(result => res.status(result.status).json({ message: result.message }))
					.catch(err => res.status(err.status).json({ message: err.message }));
				}
		 
	});

	// check token  method 
	function checkToken(req) {

		const token = req.headers['x-access-token'];

		if (token) {

			try {

  				var decoded = jwt.verify(token, config.secret);

  				return decoded.message === req.params.id;

			} catch(err) {

				return false;
			}

		} else {

			return false;
		}
	}

	//----------------------------------------------------------------------------
	//		Transcriber  API REST with node js 
	//----------------------------------------------------------------------------

	
	// add user to transcriber users 
	/* 
	{
		"date_of_birth":"Dagbouj Hatem" , 
		"title_string":"dagboujhatem@gmail.com",
		"university":"password",
		"about" : "university"
	}
	*/
	router.post('/transcriber/:id', (req,res) => {

		if (checkToken(req)) {
 
			const date_of_birth 	= req.body.date_of_birth;
			const title_string 		= req.body.title_string; 
			const university 		= req.body.university;
			const about 			= req.body.about;

			if (!date_of_birth || !title_string || !about ||
				!date_of_birth.trim() || !title_string.trim() || !about.trim() ) {
			
				res.status(400).json({ message: 'Invalid request!' });

			} else {

				register_transcriber.register(req.params.id, date_of_birth , title_string , university , about )

				.then(result => res.status(result.status).json({ message: result.message }))

				.catch(err => res.status(err.status).json({ message: err.message }));

			}
		} else {

			res.status(401).json({ message: 'Invalid token!' });
		}
	});

	//----------------------------------------------------------------------------
	//		YouTube API REST with node js 
	//----------------------------------------------------------------------------


	// get video search by : keyword
	// max : optional parameter --> number of max result in json response

	router.get('/videos/:max?/key/:keyword', (req,res) => {

		const keyword = req.params.keyword;
		const max_Result_number= req.params.max;

		var opts = {
		  maxResults: 10,
		  key: 'AIzaSyBQAGnQaE-Niq59-we3cwyYevPSaAwOne0',
		  order:'viewCount',
		  type:'video'
		};

		opts.maxResults= max_Result_number;

		search(keyword, opts, function(err, results) {
		  if(err)
		  {
		  	 console.log(err);
		  	res.status(400).json({ message: 'Invalid request!' , err : err.message});
		  }  
		  	//console.log(results);
		  	res.status(200).json(results);
		});

	});

	//----------------------------------------------------------------------------
	//		Music files API REST with node js 
	//----------------------------------------------------------------------------
    /*{
    	"id" :"id",
    	"link":"link",
    	"title":"title",
    	"description":"description",
    	"thumbnails":"thumbnails"
    }*/
	router.post('/users/:id/order', (req,res) => {

			const email =  req.params.id; 

			const id 	= req.body.id;
			const link 	= req.body.link;
			const title 	= req.body.title;
			const description 	= req.body.description;
			const thumbnails 	= req.body.thumbnails;

			if(!id || !id.trim() || !link || !link.trim() || !title || ! title.trim()
				|| !description || !description.trim() || !thumbnails || !thumbnails.trim())
			{
				res.status(400).json({ message: 'Invalid request!' });

			}else{
			 	order.order(id ,link,title,description,thumbnails,email)
				.then(result => res.status(result.status).json({ message: result.message }))
				.catch(err => res.status(err.status).json({ message: err.message }));
			}
		
	});
    router.get('/users/:id/order/delete/:par', (req,res) => {

		const email = req.params.id; 
		const par = req.params.par;  

		order.delete(email,par)
			.then(result => res.status(result.status).json({ message: result.message }))
			.catch(err => res.status(err.status).json({ message: err.message }));
	});
    router.post('/users/:id/order/accept/', (req,res) => {

		const email = req.params.id;  

		const id 	= req.body.id;
		const link 	= req.body.link;
		const title 	= req.body.title;
		const description 	= req.body.description;
		const thumbnails 	= req.body.thumbnails;

		if(!id || !id.trim() || !link || !link.trim() || !title || ! title.trim()
			|| !description || !description.trim() || !thumbnails || !thumbnails.trim())
		{
			res.status(400).json({ message: 'Invalid request!' });

		}else{

		order.accept(email,id,link,title,description,thumbnails)
			.then(result => res.status(result.status).json({ message: result.message }))
			.catch(err => res.status(err.status).json({ message: err.message }));
		}
	});
	router.get('/users/:id/order', (req,res) => {

			const email =  req.params.id; 
 
			 	order.allOrder(email)	
			 	.then(result => res.json(result))
				.catch(err => res.status(err.status).json({ message: err.message }));
	});	
    router.get('/users/:id/score', (req,res) => {

			const email =  req.params.id; 
 
			 	order.allScore(email)	
			 	.then(result => res.json(result))
				.catch(err => res.status(err.status).json({ message: err.message }));
	});    
	router.get('/users/:id/score/bay/:link', (req,res) => {

			const email =  req.params.id; 
 			const link =  req.params.link; 
			 	order.bayScore(email, link)	
			 	.then(result => res.json(result))
				.catch(err => res.status(err.status).json({ message: err.message }));
	});

	/**********************************************************************************
	/*						file section
	/**********************************************************************************/
    // db.colName.ensureIndex( { 'metadata.user_id' : 1 } );
	// Create a storage object with a given configuration
	const storage = require('multer-gridfs-storage')({
	   url: url, 
	  file: (req, file) => {
	    // instead of an object a string is returned
	    var name = file.fieldname +'-'+ Date.now()+ path.extname(file.originalname);
        insertScore(name,req.params.name);
	    return { filename: name };
	  }
	}); 
   
	var upload = multer({ storage: storage  });
	var insertScore = function(namedb, name){
         //console.log('name db'+namedb +' and '+name);

	    MongoClient.connect(url, (err, db) => {
	        assert.equal(null, err);
	        insertDocuments(db,namedb , name , () => {
	            db.close();
	            //res.json({'message': 'File uploaded successfully'});
	        });
	    });
	};

	var insertDocuments = function(db, filePath , name , callback) {
		 
	    var collection = db.collection('scores');
	    collection.insertOne({'filename' : filePath , 'name' : name }, (err, result) => {
	        assert.equal(err, null);
	        callback(result);
	 });
	};
   // Upload i$mage
	router.post('/upload/:name',upload.single('image'), (req, res, next) => {

	      res.json({'message': 'File uploaded successfully'});
	}); 
	// search score
	router.get('/upload/:name', (req,res) => {

			const name =  req.params.name;  

		    MongoClient.connect(url, (err, db) => {

	                 assert.equal(null, err);

	                 var collection = db.collection('scores');
	                 collection.find({'name':  { "$regex": name , "$options": "i" } }, { _id : 0}).toArray(function(err, result) {
	                 		 
	                 	if(err){
						     return res.json([]);	
							}
							return res.json(result);
	                 });

	        });
	});

	router.get('/image/:filename', (req,res) => {



			const name =  req.params.filename;  
 
            MongoClient.connect(url, (err, db) => {

		    	var mongoDriver = mongoose.mongo;

		    	var gfs = gridfs(db , mongoDriver); 

		    	gfs.findOne({ filename: name }, function (err, file) {

				    if (err) {
				        return res.status(400).send(err);
				    }
				    else if (!file) {
				        return res.status(404).send('Error on the database looking for the file.');
				    }

				    res.set('Content-Type', file.contentType);
				    res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');

				    var readstream = gfs.createReadStream({ filename: name });
				    readstream.on("error", function(err) {  res.end();  });
				    readstream.pipe(res);
	                
	            });
	        });
	});
		


}