'use strict';

const auth = require('basic-auth');
const jwt = require('jsonwebtoken');

const register = require('./functions/register');
const login = require('./functions/login');
const profile = require('./functions/profile');
const password = require('./functions/password');
const config = require('./config/config.json');
// added lib
const search = require('youtube-search');
const file =  require('./functions/file');



module.exports = router => {
/*
*   Home route : return hello message (test api)
*    access URL : http://localhost:8080/api/v1/
*/
	router.get('/', (req, res) => res.end('Welcome to Onescore !'));
/*
*	Auth route : return the result of auth  user 
*   access URL : http://localhost:8080/api/v1/authenticate
*/
	router.post('/authenticate', (req, res) => {

		const credentials = auth(req);

		if (!credentials) {

			res.status(400).json({ message: 'Invalid Request !' });

		} else {

			login.loginUser(credentials.name, credentials.pass)

			.then(result => {

				const token = jwt.sign(result, config.secret, { expiresIn: 1440 });

				res.status(result.status).json({ message: result.message, token: token });

			})

			.catch(err => res.status(err.status).json({ message: err.message }));
		}
	});
/*
   Register route :: the body containt JSON of user data
    exemple of input : 
    
	{
		"name":"hatem" , 
		"email":"mail2",
		"password":"pass2"
	}
*/
	router.post('/users', (req, res) => {

		const name = req.body.name;
		const email = req.body.email;
		const password = req.body.password;

		if (!name || !email || !password || !name.trim() || !email.trim() || !password.trim()) {

			res.status(400).json({message: 'Invalid Request 1 !'+ req.body.email +" :"+ req.query});

		} else {

			register.registerUser(name, email, password)

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

		if (checkToken(req)) {

			profile.getProfile(req.params.id)

			.then(result => res.json(result))

			.catch(err => res.status(err.status).json({ message: err.message }));

		} else {

			res.status(401).json({ message: 'Invalid Token !' });
		}
	});
// change password ....
// access URL : http://localhost:8080/api/v1/users/dagboujhatem2017@gmail.com
	router.put('/users/:id', (req,res) => {

		if (checkToken(req)) {

			const oldPassword = req.body.password;
			const newPassword = req.body.newPassword;

			if (!oldPassword || !newPassword || !oldPassword.trim() || !newPassword.trim()) {

				res.status(400).json({ message: 'Invalid Request !' });

			} else {

				password.changePassword(req.params.id, oldPassword, newPassword)

				.then(result => res.status(result.status).json({ message: result.message }))

				.catch(err => res.status(err.status).json({ message: err.message }));

			}
		} else {

			res.status(401).json({ message: 'Invalid Token !' });
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
	//		YouTube API REST with node js 
	//----------------------------------------------------------------------------


	// get video search by : keyword
	// max : optional parameter --> number of max result in json response

	router.get('/videos/:max?/key/:keyword', (req,res) => {

		const keyword = req.params.keyword;
		const max_Result_number= req.params.max;

		var opts = {
		  maxResults: 10,
		  key: 'AIzaSyC4do4UjwWffbQgz5h4WbbqfeGsYk-0eWE'
		};

		opts.maxResults= max_Result_number;

		search(keyword, opts, function(err, results) {
		  if(err)
		  {
		  	//return console.log(err);
		  	res.status(400).json({ message: 'Invalid Request !' , err : err.message});
		  }  
		  	res.status(200).json(results);
		});

	});

	//----------------------------------------------------------------------------
	//		Music files API REST with node js 
	//----------------------------------------------------------------------------
var mongoose = require('mongoose');
var gridfs = require('gridfs-stream');
var fs = require('fs');
//mongoose.connect('mongodb://localhost:27017/onescore', { useMongoClient: true });
//mongoose.connect('mongodb://2fe367726c5d2bac361bf48ef4e8f7b6:webmaster123@6a.mongo.evennode.com:27017,6b.mongo.evennode.com:27017/2fe367726c5d2bac361bf48ef4e8f7b6?replicaSet=eu-6' , { useMongoClient: true });
mongoose.connect('mongodb://6cc064a3650fdff1771e4c99f684a70b:onscore123@6a.mongo.evennode.com:27017,6b.mongo.evennode.com:27017/6cc064a3650fdff1771e4c99f684a70b?replicaSet=eu-6' , { useMongoClient: true });

mongoose.Promise = global.Promise;
gridfs.mongo = mongoose.mongo;
 
var connection = mongoose.connection;
connection.once('open', function callback () {
  // begin  conx

	// Upload a file from loca file-system to MongoDB
	router.post('/api/file/upload/:file', (req, res) => {
		
		var filename = req.params.file;
		
        var writestream = fs.createWriteStream({ filename: filename });
        fs.createReadStream(__dirname + "/uploads/" + filename).pipe(writestream);
        writestream.on('close', (file) => {
            res.send('Stored File: ' + file.filename);
        });
    });

   	// Download File

   	  router.get('/api/file/download', (req, res) => {
        // Check file exist on MongoDB
		
		var filename = req.query.filename;
		
        gfs.exist({ filename: filename }, (err, file) => {
            if (err || !file) {
                res.status(404).send('File Not Found');
				return
            } 
			
			var readstream = gfs.createReadStream({ filename: filename });
			readstream.pipe(res);            
        });
    });
    

    // Delete a file from MongoDB
    router.get('/api/file/delete', (req, res) => {
		
		var filename = req.query.filename;
		
		gfs.exist({ filename: filename }, (err, file) => {
			if (err || !file) {
				res.status(404).send('File Not Found');
				return;
			}
			
			gfs.remove({ filename: filename }, (err) => {
				if (err) res.status(500).send(err);
				res.send('File Deleted');
			});
		});
    });	

    // get Meta Information

    router.get('/api/file/meta', (req, res) => {
		
		var filename = req.query.filename;
		
		gfs.exist({ filename: filename }, (err, file) => {
			if (err || !file) {
				res.send('File Not Found');
				return;
			}
			
			gfs.files.find({ filename: filename }).toArray( (err, files) => {
				if (err) res.send(err);
				res.json(files);
			});
		});
	});




// end conx 
});


}