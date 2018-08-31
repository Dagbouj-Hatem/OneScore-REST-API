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
	router.post('/auth', (req, res) => {

		const credentials = auth(req);

		if (!credentials) {

			res.status(400).json({ message: 'Invalid Request !' });

		} else {

			login.loginUser(credentials.name, credentials.pass)

			.then(result => {

				const token = jwt.sign(result, config.secret, { expiresIn: 1440 });

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

			res.status(400).json({message: 'Invalid Request 1 !'+ req.body.email +" :"+ req.query});

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

		if (checkToken(req)) {

			profile.getProfile(req.params.id)

			.then(result => res.json(result))

			.catch(err => res.status(err.status).json({ message: err.message }));

		} else {

			res.status(401).json({ message: 'Invalid Token !' });
		}
	});
// change user  ....
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
	// contact form 
	router.post('/contact/:id', (req,res) => {

		const email = req.params.id; 
		const subject = req.body.subject;
		const message = req.body.message; 

		if (checkToken(req)) {

				if(!subject || ! message || !subject.trim() || !message.trim())
				{
					res.status(400).json({ message: 'Invalid Request !' });
				}
				else
				{
					contact.contact(email, subject , message)
					.then(result => res.status(result.status).json({ message: result.message }))
					.catch(err => res.status(err.status).json({ message: err.message }));

				}
		} else {

			res.status(401).json({ message: 'Invalid Token !' });
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

			if (!date_of_birth || !title_string || !university || !about ||
				!date_of_birth.trim() || !title_string.trim() || 
				!university.trim() || !about.trim() ) {
			
				res.status(400).json({ message: 'Invalid Request !' });

			} else {

				register_transcriber.register(req.params.id, date_of_birth , title_string , university , about )

				.then(result => res.status(result.status).json({ message: result.message }))

				.catch(err => res.status(err.status).json({ message: err.message }));

			}
		} else {

			res.status(401).json({ message: 'Invalid Token !' });
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
		  	res.status(400).json({ message: 'Invalid Request !' , err : err.message});
		  }  
		  	//console.log(results);
		  	res.status(200).json(results);
		});

	});

	//----------------------------------------------------------------------------
	//		Music files API REST with node js 
	//----------------------------------------------------------------------------
    
	router.post('/users/:id/order', (req,res) => {

			const id 	= req.body.id;
			const link 	= req.body.link;
			const title 	= req.body.title;
			const description 	= req.body.description;
			const thumbnails 	= req.body.thumbnails;

			if(!id || !id.trim() || !link || !link.trim() || !title || ! title.trim()
				|| !description || !description.trim() || !thumbnails || !thumbnails.trim())
			{
				res.status(400).json({ message: 'Invalid Request !' });

			}else{
			 	order.order(id ,link,title,description,thumbnails)
				.then(result => res.status(result.status).json({ message: result.message }))
				.catch(err => res.status(err.status).json({ message: err.message }));
			}
		
	});
    router.get('/user/:id/order/delete/:par', (req,res) => {

		const email = req.params.id; 
		const par = req.params.par;  

		order.delete(email,par)
			.then(result => res.status(result.status).json({ message: result.message }))
			.catch(err => res.status(err.status).json({ message: err.message }));
	});


}