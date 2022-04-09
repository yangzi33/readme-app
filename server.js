/* server.js, with mongodb API */
'use strict';
const log = console.log
const path = require('path')

/*
* ======================================================
* EXPRESS SETUP
* ======================================================
 */

const express = require('express')
// starting the express server
const app = express();
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

if (process.env.NODE_ENV !== 'production') {
	const cors = require('cors');

	var corsOptions = {
		origin: ['http://localhost:5000', 'http://localhost:3000', 'https://csc309-readme.herokuapp.com', 'https://csc309-readme-backend.herokuapp.com'],
		credentials: true,
	};

	app.use(cors(corsOptions))
}

const cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: 'csc309-readme',
	api_key: '798285427216147',
	api_secret: 'iOVf7wKWiTC-5FbTWMsy5lUBth0'
});

const { ObjectID, ObjectId} = require('mongodb')

const bcrypt = require('bcryptjs')

// body-parser: middleware for parsing HTTP JSON body into a usable object
const bodyParser = require('body-parser')
app.use(bodyParser.json())

// mongoose and mongo connection
const { mongoose } = require('./db/mongoose')
mongoose.set('bufferCommands', false);  // don't buffer db requests if the db server isn't connected - minimizes http requests hanging if this is the case.

const session = require("express-session");
const MongoStore = require('connect-mongo') // to store session information on the database in production


const { Book, User } = require('./models/ReadMe.js')

// Half a day in milliseconds
const HALFDAY = 12 * 60 * 60 * 1000;

// For authentication and sessions.
app.use(
	session({
		secret: process.env.SESSION_SECRET || "afawofuboawawfgawfboauw141",
		resave: false,
		saveUninitialized: false,
		cookie: {
			expires: HALFDAY,
			httpOnly: false
		},
		// store the sessions on the database in production
		store: MongoStore.create({
			mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/ReadMe'
		})
	})
);



// Configurable parameters
const DEFAULT_PROFILE_URL = "/assets/Profile.png"
const DEFAULT_COVER_URL = "/assets/defaultBookCover.png"

const DEFAULT_SUMMARY = "This user has not submitted a summary."

// Free heroku servers are garbage - 10 rounds should be enough.
const SALT_ROUND = 10;


/*
* ======================================================
* HELPER FUNCTIONS
* ======================================================
 */

// From lecture. Checks for first error returned by promise rejection if Mongo database suddently disconnects
function isMongoError(error) {
	return typeof error === 'object' && error !== null && error.name === "MongoNetworkError"
}

// From lecture. Checks if the DB is read to be used.
function isDBReady(res) {
	if (mongoose.connection.readyState !== 1) {
		log('Issue with mongoose connection')
		res.status(500).send('Internal server error')
		return false;
	}

	return true;
}

/**
 * Middleware to check if the user is authenticated, then runs callback.
 * @param req The req
 * @param res The res
 * @param next Callback if authenticated
 */
const authenticate = (req, res, next) => {
	if (req.session.user_id) {
		User.findById(req.session.user_id).then((user) => {
			if (!user) {
				return Promise.reject()
			} else {
				req.user = user
				next()
			}
		}).catch((error) => {
			console.log("authenticate error", error)
			res.status(401).send("Unauthorized. Please login.")
		})
	} else {
		console.log("not req.session.user_id")
		res.status(401).send("Unauthorized. Please login.")
	}
}

/**
 * Checks if the id is valid. Sends 404 if not found.
 * @param id The id
 * @param res The response (will send 404 if not found)
 * @returns {boolean}
 */
function isIdValid(id, res) {
	if (ObjectID.isValid(id)) {
		return true;
	}

	res.status(404).send("Resource not found")
	return false;
}


/**
 * Saves the document to the database.
 * @param doc
 * @param res
 */
function saveToDb(doc, res) {
	doc.save().then((result) => {
		res.send(result)
	}).catch((error) => {
		console.log(error)
		if (isMongoError(error)) {
			res.status(500).send('Internal server error')
		} else {
			res.status(400).send('Bad Request1')
		}
	})
}

/**
 * Get all of the docs of a model
 * @param model The model
 * @param res The docs in an array
 */
function getAllDocs(model, res) {
	model.find().then((book) => {
		res.send({book})
	}).catch((error) => {
		log(error)
		res.status(500).send("Internal Server Error")
	})
}

/**
 * Gets a doc by _id
 * @param id The id to get
 * @param model The model to search in
 * @param res The document with the id.
 */
function getDocById(id, model, res) {
	model.findById(id).then((book) => {
		res.send(book)
	}).catch((error) => {
		log(error)
		res.status(500).send("Internal Server Error")
	})
}

/**
 * A function to add a user to the session
 * @param req
 *	body.username: String, the username
 *	body.password: String, the password
 * @param res
 *	username: String, username
 *  user_id: ObjectId, id of user in db
 *  profilePicUrl: String, url to profile pic
 * @returns {Promise<*>}
 */
async function addUser(req, res) {
	return await User.findOne({ username: req.body.username }).then((user) => {
		if (!user) {
			res.status(404).send("Username and/or password invalid")
			return;
		}

		// Hashes the password and saves the user/user_id to the session.
		bcrypt.compare(req.body.password, user.password, async (err, result) => {
			if (err) {
				res.status(500).send("Could not process user/pass. Try again later.")
				return;
			}

			if (!result) {
				res.status(404).send("Username and/or password invalid")
				return;
			}

			req.session.user_id = user._id;
			req.session.username = user.username;
			req.session.save(() => {
			res.send({username: user.username, user_id: user._id, profilePicUrl: user.profilePicUrl});})
		});
	}).catch(err => {
		res.status(400).send(err)
	});
}

/**
 * Validates the fields for signup
 * @param username String
 * @param password String
 * @param repeatPassword String
 * @param email String, Format x@y
 * @param phoneNumber String, Format xxx-xxx-xxxx
 * @param dateOfBirth String, Format yyyy-mm-dd
 * @returns {Promise<string>}
 */
async function validateSignup(username, password, repeatPassword, email, phoneNumber, dateOfBirth) {
	let warnings = ""

	if (password !== repeatPassword) {
		warnings += "Make sure you've matched the passwords! (See above)\n"
	}

	await User.findOne({ username: username }).then((user) => {
		if (user) {
			warnings += "User already exists!\n"
		}
	})

	if (username.length < 4)
		warnings += "The username is too short (min. 4 characters).\n";

	// The following must match the regex
	const emailFormat = "^.+@.+$"

	if (!email.match(emailFormat))
		warnings += "Please use a valid email.\n"

	if (password.length < 4)
		warnings += "The password is too short (min. 4 characters).\n"

	const phoneNumberFormat = "^[0-9]{3}-[0-9]{3}-[0-9]{4}$"

	if (phoneNumber.length !== 12 || !phoneNumber.match(phoneNumberFormat))
		warnings += "Please enter a valid phone number (xxx-xxx-xxxx)!\n";

	// Converts the date to a timestamp and checks if it's valid.
	const birthDateValid = !isNaN(Date.parse(dateOfBirth));

	if (!birthDateValid || Date.parse(dateOfBirth) > Date.parse(Date()))
		warnings += "Please enter a valid birth date!\n";

	return warnings;
}

/**
 * Returns the comments with all fields that are computed from the db values.
 * The lastVote/removable are relative to the VIEWER <user_id>
 *
 * @param comments The comment
 * 	votes: [{user_id: ObjectId, vote: Number}]
 * 	user_id: ObjectId, id of the commenter
 * 	start: c.start,
 * 	end: c.end,
 * 	vote: vote,
 * 	user_id: c.user_id,
 * 	commentContent: String, comment that is displayed
 * 	commentColor: String, Color (in hex)
 * @param user_id ObjectId, the VIEWER of the comment.
 * @returns The above comment and the following:
 * 	vote: number of votes
 * 	lastVote: 0, 1 or -1. The last vote of the VIEWER of this comment.
 * 	removable: If this comment is removable by the user
 */
async function getComments(comments, user_id) {
	return await Promise.all(comments.map((c) => {
		// Sums up the total votes
		let vote = c.votes.reduce((prev, curr) => {
			return prev + curr.vote
		}, 0)

		// All votes made by the VIEWER
		const userVotes = c.votes.filter((v => {
			return v.user_id.toString() === user_id.toString()
		}))

		// Gets the last vote score (0, 1 or -1) made by the VIEWER of the comment
		const lastVote = userVotes.length > 0 ? userVotes[0].vote : 0

		return User.findById(user_id).then((viewer) => User.findById(c.user_id).then((user) => {
			c.username = user.username;
			c.profilePicUrl = user.profilePicUrl;

			// Removable if the viewer is an admin or if he's the commentor.
			const removable = viewer.isAdmin || c.username === viewer.username;

			return 	{
				_id: c._id,
				start: c.start, // Are these even needed? They can be generated.
				end: c.end,
				vote: vote,
				lastVote: lastVote, // Is this even needed? Needs to change for each user.
				user_id: c.user_id,
				commentContent: c.commentContent,
				commentColor: c.commentColor,
				username: c.username,
				profilePicUrl: c.profilePicUrl,
				removable: removable}
		}))
	}))
}

/**
 * Helper function to see if h and newComment intersects.
 * @param h The highlight
 * @param newComment The new comment.
 * @returns {boolean} If it intersects.
 */
function intersects(h, newComment) {
	return (
		(h.start <= newComment.start && newComment.start <= h.end) ||
		(h.start <= newComment.end && newComment.end <= h.end) ||
		(newComment.start <= h.start && h.start <= newComment.end) ||
		(newComment.start <= h.end && h.end <= newComment.end)
	);
}

/*
* ======================================================
* ROUTES
* ======================================================
 */

/**
 * Logins in the user
 * @param req
 *	body.username: String, the username
 *	body.password: String, the password
 * @param res
 *	username: String, username
 *  user_id: ObjectId, id of user in db
 *  profilePicUrl: String, url to profile pic
 */
app.post("/api/user/login", async (req, res) => {
	if (!isDBReady(res)) return;

	return await addUser(req, res)
});

/**
 * Logout in the user
 * @param req
 *	body.user_id: ObjectId, the user_id to log out
 * @param res
 *	user_id: The user id if logged out successfully
 */
app.get("/api/user/logout", (req, res) => {
	if (req.session) {
	const user_id = req.session.user_id;

	if (!isDBReady(res) || !isIdValid(user_id, res)) return;

	// Removes the session
	req.session.destroy(err => {
			if (err) {
				res.status(500).send(err);
			} else {
				res.send({user_id: user_id})
			}
		});
	} else {
		res.status(401).send("There is no active session.")
	}
});

/**
 * Checks if the session is active
 * @param res
 *	username: String, username
 *  user_id: ObjectId, id of user in db
 */
app.get("/api/user/check-session", (req, res) => {
	if (!isDBReady(res) || !req.session || !isIdValid(req.session.user_id, res)) return;

	if (req.session.user_id) {
		res.send({ username: req.session.username, user_id: req.session.user_id });
	} else {
		res.status(401).send({username: null, user_id: null});
	}
});

/**
 * Edits the user.
 * Req: profilePicUrl/email/phoneNumber/dateOfBirth/followers/locked/summary
 * Res: Updated user
 */
app.patch('/api/update-user/:id', (req, res) => {
	if (!isDBReady(res)) return;
	const id = req.params.id;

	User.findById(id).then((user) => {
		if (req.body.profilePicUrl)
			user.profilePicUrl = req.body.profilePicUrl

		if (req.body.email)
			user.email = req.body.email

		if (req.body.phoneNumber)
			user.phoneNumber = req.body.phoneNumber

		if (req.body.dateOfBirth)
			user.dateOfBirth = req.body.dateOfBirth

		if (req.body.followers)
			user.followers = req.body.followers

		if (req.body.locked)
			user.locked = req.body.locked

		if (req.body.summary)
			user.summary = req.body.summary

		user.save()
		res.send(user)
	}).catch((error) => {
		log(error)
		res.status(500).send("Internal Server Error")
	})

})

/**
 * Deletes the user
 * Res: The deleted user id
 */
app.delete(`/api/user/:id`, authenticate, (req, res) => {
	const id = req.params.id;

	if (!isDBReady(res) || !isIdValid(id, res)) return;

	Book.find().then(books => {
		if (books) {
			books.forEach((book) => {
				if (book.author_id == id) {
					book.remove();
				}
			})
		}
	})

	User.findById(id).then((user)=>{
		if (!user) {
			return null;
		} else {
			const old_id = user._id;

			user.remove();
			res.send({users: old_id})
		}
	})
})

/**
 * Signs the user up
 * @param req
 * 	username String
 * 	password String
 * 	repeatPassword String
 * 	email String, Format x@y
 * 	phoneNumber String, Format xxx-xxx-xxxx
 * 	dateOfBirth String, Format yyyy-mm-dd
 * @param res
 * 	Returns the user in the db
 */
app.post('/api/user/signup', async (req, res) => {
	if (!isDBReady(res)) return;

	// Appends default profile picture if none specified
	let profilePicUrl = req.body.profilePicUrl

	if (!profilePicUrl) {
		profilePicUrl = DEFAULT_PROFILE_URL;
	}

	let summary = req.body.summary

	if (!summary) {
		summary = DEFAULT_SUMMARY;
	}

	const {username, password, repeatPassword, email, phoneNumber, dateOfBirth} = req.body;

	const setupError = await validateSignup(username, password, repeatPassword, email, phoneNumber, dateOfBirth)
	if (setupError) {
		res.status(400).send(setupError)
		return;
	}

	// Hashes and salts the password.
	bcrypt.genSalt(SALT_ROUND, (err, salt) => {
		bcrypt.hash(req.body.password, salt, (err, passwordHash) => {
			if (err) {
				console.log("Error with password hash.")
				res.status(500).send("Internal server error.")
			}

			const user = new User({
				username: req.body.username,
				password: passwordHash,
				profilePicUrl: profilePicUrl, // WARNING: PROBABLY TO BE REPLACED BY ACTUAL IMAGE DATA.
				email: req.body.email,
				phoneNumber: req.body.phoneNumber,
				dateOfBirth: req.body.dateOfBirth,
				summary: summary,
				isAdmin: req.body.isAdmin ? true : false,
				followers: [],
				locked: false
			})

			saveToDb(user, res);
		});
	})
})

/**
 * Gets all users
 * Res: Array of users
 */
app.get('/api/user', authenticate, (req, res) => {
	if (!isDBReady(res)) return;

	getAllDocs(User, res)
})

/**
 * Get user by id.
 * Res: The user.
 */
app.get('/api/user/:id', authenticate, (req, res) => {
	const id = req.params.id;

	if (!isDBReady(res) || !isIdValid(id, res)) return;

	getDocById(id, User, res)
})

/**
 * Adds a book to the db
 * @param req
 *  req.body.bookTitle: String
 *  author_id: Objectid
 *  summary: String
 *  publishDate: String
 *  avgScore: Number,
 *  kudos: Number,
 *  follows: Number,
 *  tags: [String]
 * The following can be blank (will use defaults).
 * 	body.chapterUrl: String, the url
 * 	body.chapters: [ObjectId]
 * 	body.review: [ObjectId]
 * @param res The book that was added.
 */
app.post('/api/book', (req, res) => {
	if (!isDBReady(res)) return;

	let chapters = req.body.chapters;
	
	let reviews = req.body.reviews;

	if (!chapters) {
		res.status(400).send("You must include at least one chapter")
		return;
	} else {
		let error = false;

		chapters.forEach(c => {
			if (!c.chapterTitle || !c.chapterContent) {
				res.status(400).send("All chapters must have title and content.")
				error = true;
			}
		})

		if (error) {
			return;
		}
	}

	if (!reviews) {
		reviews = []
	}

	let coverUrl = req.body.coverUrl;

	if (!coverUrl) {
		coverUrl = DEFAULT_COVER_URL;
	}

    const authorName = User.findById(req.body.author_id).then(
        user => {
            return user.username
        });

	let publishDate = req.body.publishDate

	if (!publishDate) {
		const date = new Date()

		const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
			"Jul", "Aug", "Sepr", "Oct", "Nov", "Dec"
		];

		publishDate = `${monthNames[date.getMonth()]} ${date.getDay()}, ${date.getFullYear()}`
	}

	if (!req.body.bookTitle || !req.body.summary) {
		res.status(400).send("Must have book title and summary.")
		return;
	}

	// Create a new book using the Book mongoose models
	const book = new Book({
		bookTitle: req.body.bookTitle,
		coverUrl: coverUrl, // WARNING: PROBABLY TO BE REPLACED BY ACTUAL IMAGE DATA.
		author_id: req.body.author_id,
        authorName: authorName,
		chapters: chapters,

		summary: req.body.summary,
		publishDate: publishDate,
		avgScore: req.body.avgScore,
		kudos: req.body.kudos,
		follows: req.body.follows,
		tags: req.body.tags,

		reviews: reviews,

		locked: false
	})

	saveToDb(book, res);
})

/**
 * Gets all books
 */
app.get('/api/book', authenticate, async (req, res) => {
	if (!isDBReady(res)) return;

	getAllDocs(Book, res)
})


/**
 * Gets a random book
 */
app.get('/api/book/random', authenticate, (req, res) => {
	if (!isDBReady(res)) return;

	// Samples a random book.
	Book.aggregate([{ $sample: { size: 1 } }]).then((book) => {
		if (book.length > 0) {
			res.send({book_id: book[0]._id})
		} else {
			res.status(404).send("No books found.")
		}
	}).catch((error) => {
		log(error)
		res.status(500).send("Internal Server Error")
	})
})

/**
 * Gets a specific book.
 * :id The ObjectId of the book
 * res: The book
 */
app.get('/api/book/:id', authenticate, (req, res) => {
	const id = req.params.id;

	if (!isDBReady(res) || !isIdValid(id, res)) return;

	getDocById(id, Book, res)
})

app.patch('/api/book/:id', (req, res) => {
	if (!isDBReady(res)) return;
	const id = req.params.id;

	Book.findById(id).then((book) => {

		if(req.body.coverUrl){
			book.coverUrl = req.body.coverUrl
		}

		if(req.body.novelName){
			book.bookTitle = req.body.novelName
		}
		if(req.body.kudos){
			book.kudos = req.body.kudos
		}
		if (req.body.chapters){
			book.chapters = req.body.chapters
		}
		if (req.body.summary){
			book.summary = req.body.summary
		}
		if (req.body.tags){
			book.tags = req.body.tags
		}
		
		if(req.body.novelAvgScore){
			book.novelAvgScore = req.body.novelAvgScore
		}
		
		if(req.body.locked || req.body.locked === false){
			book.locked = req.body.locked
		}
		

		book.save()
		res.send(book)
	}).catch((error) => {
		log(error)
		res.status(500).send("Internal Server Error")
	})

})

/**
 * Makes the user follow the novel with book_id.
 * Res: The updated follows
 */
app.post('/api/user/followNovel/:book_id', (req, res) => {
	User.findById(req.session.user_id).then((user) => {
		Book.findById(req.params.book_id).then((book) => {
			
			const followingBooks = user.books
			if (followingBooks.includes(req.params.book_id)){
				const filteredFollowingBooks = user.books.filter(a_book_id => a_book_id === req.params.book_id)
				user.books = filteredFollowingBooks
				user.save()

				const filteredFollowingUsers = book.follows.filter(a_user_id => a_user_id === req.session.user_id)
				book.follows = filteredFollowingUsers
				
				book.save()
				res.send(book.follows)
			}
			else{
				user.books.push(req.params.book_id)
				user.save()


				book.follows.push(req.session.user_id)
				book.save()

				res.send(book.follows)
			}
	
		}).catch((error) => {
			log(error)
			res.status(500).send("Internal Server Error")
			return
		})

	}).catch((error) => {
		log(error)
		res.status(500).send("Internal Server Error")
		return
	})

	
})

/**
 * Follows the author with author_id.
 * Res: The updated followings.
 */
app.post('/api/user/followAuthor/:author_id', (req, res) => {
	User.findById(req.session.user_id).then((user) => {
		User.findById(req.params.author_id).then((author) => {
			
			const followingAuthors = user.followings
			if (followingAuthors.includes(req.params.author_id)){
				const filteredFollowingAuthors = user.followings.filter(a_author_id => a_author_id === req.params.author_id)
				user.followings = filteredFollowingAuthors
				user.save()

				
				const filteredFollowingUsers = author.followers.filter(a_user_id => a_user_id === req.session.user_id)
				author.followers = filteredFollowingUsers
				
				author.save()
				res.send(author.followers)
			}
			else{
				user.followings.push(req.params.author_id)
				user.save()

				author.followers.push(req.session.user_id)
				author.save()

				res.send(author.followers)
			}
	
		}).catch((error) => {
			log(error)
			res.status(500).send("Internal Server Error")
			return
		})

	}).catch((error) => {
		log(error)
		res.status(500).send("Internal Server Error")
		return
	})

	
})

/**
 * Updates the user.
 * Req: followers or locked.
 * Res: The updated user.
 */
app.patch('/api/user/:id', (req, res) => {
	if (!isDBReady(res)) return;
	const id = req.params.id;

	User.findById(id).then((user) => {
		console.log(user)
		user.followers = req.body.followers
	
		user.locked = req.body.locked
		user.save()
		res.send(user)
	}
)}
)

/**
 * Adds a review of the book_id.
 * Res: Reviews - the list of reviews.
 */
app.get("/api/book/:book_id/reviews", async (req, res) => {
	const book_id = req.params.book_id;

	if (!isDBReady(res) || !isIdValid(book_id, res)) return;

	Book.findById(book_id).then(async (book) => {
		if (!book) {
			res.status(404).send("Book not found")
		} else {
			res.send({reviews: book.reviews})

		}
	}).catch((err) => {
		res.status(400).send("Bad Request")
	})
})

/**
 * Gets the total upvotes for a user.
 * Res: The total number of upvootes.
 */
app.get("/api/votes/:user_id", async (req, res) => {
	const user_id = req.params.user_id;

	if (!isDBReady(res) || !isIdValid(user_id, res)) return;

	Book.find().then(books => {
		if (!books) {
			res.status(404).send("Book not found")
		} else {
			let upvotes = 0
			for(let i = 0; i < books.length; i++){
			for(let j = 0; j < books[i].chapters.length; j++){
			for(let k = 0; k < books[i].chapters[j].comments.length; k++){
			for(let n = 0; n < books[i].chapters[j].comments[k].votes.length; n++){
				if(books[i].chapters[j].comments[k].votes[n].user_id === user_id){
					upvotes = upvotes + books[i].chapters[j].comments[k].votes[n].vote
				}
			}
			}
			}
			}
			res.send({upvotes: upvotes})
		}
	}).catch((err) => {
		res.status(400).send("Bad Request")
	})
})


/**
 * Adds a review
 * Req: The review (See BookMainPage.js)
 * Res: The updated reviews
 */
app.post("/api/book/:book_id/reviews", async (req, res) => {
	const book_id = req.params.book_id;

	if (!isDBReady(res) || !isIdValid(book_id, res)) return;

	Book.findById(book_id).then(async (book) => {
		if (!book) {
			res.status(404).send("Book not found")
		} else {

			const review = req.body.review;

			if (!(review === null)){
				book.reviews.push(review);
			}

			let sum = 0

			for (let i = 0; i< book.reviews.length; ++i){
				sum += book.reviews[i].score+1
			}

			let len = 1
			if (book.reviews.length !== 0){
				len = book.reviews.length
			}
			book.avgScore = sum/len


			book.save().then(async (bookRes) => {
				const reviewsRes = await Promise.all(book.reviews)


				res.send({book})
			})


		}
	}).catch((err) => {
		res.status(400).send("Bad Request")
	})
})

/**
 * Deletes a review.
 * Res: The updated reviews
 */
app.delete(`/api/book/:book_id/reviews/:review_id`, authenticate, (req, res) => {
	const book_id = req.params.book_id;
	const review_id = req.params.review_id;

	// const user_id = req.user._id;

	if (!isDBReady(res) || !isIdValid(book_id, res) || !isIdValid(review_id, res)) return;

	Book.findById(book_id).then((book)=>{
		if (!book) {
			res.status(404).send("Resource not found")
		} else {

			let review = book.reviews.id(review_id);

			review.remove();

			let sum = 0

			for (let i = 0; i< book.reviews.length; ++i){
				sum += book.reviews[i].score+1
			}
			let len = 1
			if (book.reviews.length !== 0){
				len = book.reviews.length
			}

			book.avgScore = sum/len
			console.log(book.avgScore)
			book.save().then(async (bookRes) => {
				const reviewsRes = await Promise.all(book.reviews)
				res.send(book)
			})

		}
	})
})

/**
 * Gets a specific comment
 *
 * @param res: comment - a list of comments
 * 	A comment has the following fields:
 * 		votes: [{user_id: ObjectId, vote: Number}]
 * 		user_id: ObjectId, id of the commenter
 * 		start: c.start,
 * 		end: c.end,
 * 		vote: vote,
 * 		user_id: c.user_id,
 * 		commentContent: String, comment that is displayed
 * 		commentColor: String, Color (in hex)
 * 		vote: number of votes
 * 		lastVote: 0, 1 or -1. The last vote of the VIEWER of this comment.
 * 		removable: If this comment is removable by the user
 * 	highlight: [HighlightSchema]
 */
app.get("/api/comment/:book_id/:chapter_id", authenticate, async (req, res) => {
	const book_id = req.params.book_id;
	const chapter_id = req.params.chapter_id;

	if (!isDBReady(res) || !isIdValid(book_id, res) || !isIdValid(chapter_id, res)) return;

	Book.findById(book_id).then(async (book) => {
		if (!book) {
			res.status(404).send("Book not found")
		} else {
			const chapter = book.chapters.id(chapter_id)

		if (chapter) {
				// Fills up some dynamic comment fields using db data
				const comments = await getComments(chapter.comments, req.user._id)
				const highlights = chapter.highlights

				res.send({comments: comments, highlights: highlights})
			} else {
				res.status(404).send("Chapter not found")
			}
		}
	}).catch((err) => {
		res.status(400).send("Bad Request")
	})
})

/**
 * Creates a new comment
 *
 * @param res: comment - a list of comments
 * 	A comment has the following fields:
 * 		votes: [{user_id: ObjectId, vote: Number}]
 * 		user_id: ObjectId, id of the commenter
 * 		start: c.start,
 * 		end: c.end,
 * 		vote: vote,
 * 		user_id: c.user_id,
 * 		commentContent: String, comment that is displayed
 * 		commentColor: String, Color (in hex)
 * 		vote: number of votes
 * 		lastVote: 0, 1 or -1. The last vote of the VIEWER of this comment.
 * 		removable: If this comment is removable by the user
 * 	highlight: [HighlightSchema]
 */
app.post("/api/comment/:book_id/:chapter_id", authenticate,(req, res) => {
	const book_id = req.params.book_id;
	const chapter_id = req.params.chapter_id;

	const user_id = req.user._id;

	if (!isDBReady(res) || !isIdValid(book_id, res) || !isIdValid(chapter_id, res)) return;

	const comment = req.body.comment;
	comment._id = mongoose.Types.ObjectId();
	comment.user_id = user_id;
	comment.votes = [{user_id: user_id, vote: 1}]
	comment.commentColor = "#F8DF78"

	if (!comment.commentContent) {
		res.status(400).send("Comments must contain content!")
		return;
	}

	let commentStart = comment.start;
	let commentEnd = comment.end;

	if (comment.start > comment.end) {
		commentStart = comment.end;
		commentEnd = comment.start;
	}

	let highlight = {
		start: commentStart,
		end: commentEnd,
		comment_ids: [comment._id],
		color: "#fffe00"
	};

	Book.findById(book_id).then((book) => {
		if (!book) {
			res.status(404).send("Book not found")
		} else {
			const chapter = book.chapters.id(chapter_id)

			if (chapter) {
				// Ensures the comment is within the chapter text
				const chapterContentLen = chapter.chapterContent.length
				if (commentStart < 0 || commentStart > chapterContentLen || commentEnd < 0 || commentEnd > chapterContentLen) {
					res.status(400).send("You must highlight the book with your cursor")
					return;
				}

				// Adds the comment into the chapter.
				chapter.comments.push(comment);

				const highlights = [];
				const prevHighlights = chapter.highlights;

				// Checks to see if it intersects with the highlight.
				// If so, merge them. Note: This ensures disjointness.
				// ALSO ENSURES THE HIGHLIGHTS ARE SORTED BY START AFTER INSERT.
				prevHighlights.forEach((h) => {
					if (highlight == null) {
						highlights.push(h);
					} else {
						// If intersects with existing, merge them
						if (intersects(h, highlight)) {
							// Merge both
							highlight.start = Math.min(h.start, highlight.start);
							highlight.end = Math.max(h.end, highlight.end);
							highlight.comment_ids = [
								...h.comment_ids,
								...highlight.comment_ids,
							];
						} else {
							// Otherwise, keep going until it completely fits BEFORE the existing highlight.
							if (highlight.end < h.start) {
								highlights.push(highlight);
								highlight = null;
							}

							highlights.push(h); // Adds the current highlight back into the list.
						}
					}
				});

				// If it hasn't been inserted at the end, just insert it at the end.
				if (highlight != null) {
					highlights.push(highlight);
				}

				chapter.highlights = highlights;

				book.save().then(async (bookRes) => {
					const commentsRes = await getComments(chapter.comments, user_id)
					const highlightsRes = chapter.highlights

					res.send({comments: commentsRes, highlights: highlightsRes})
				})
			} else {
				res.status(404).send("Chapter not found")
			}
		}
	}).catch((err) => {
		console.log(err)
		res.status(400).send("Bad Request")
	})
})

/**
 * Deletes a specific comment
 *
 * :book_id/:chapter_id/:comment_id - the book/chapter/comment _ids: ObjectId
 *
 * @param res: comment - a list of comments
 * 	A comment has the following fields:
 * 		votes: [{user_id: ObjectId, vote: Number}]
 * 		user_id: ObjectId, id of the commenter
 * 		start: c.start,
 * 		end: c.end,
 * 		vote: vote,
 * 		user_id: c.user_id,
 * 		commentContent: String, comment that is displayed
 * 		commentColor: String, Color (in hex)
 * 		vote: number of votes
 * 		lastVote: 0, 1 or -1. The last vote of the VIEWER of this comment.
 * 		removable: If this comment is removable by the user
 * 	highlight: [HighlightSchema]
 */
app.delete('/api/comment/:book_id/:chapter_id/:comment_id', authenticate, (req, res) => {
	const book_id = req.params.book_id;
	const chapter_id = req.params.chapter_id;
	const comment_id = req.params.comment_id;

	const user_id = req.user._id;

	if (!isDBReady(res) || !isIdValid(book_id, res) || !isIdValid(chapter_id, res) || !isIdValid(comment_id, res)) return;

	Book.findById(book_id).then((book)=>{
		if (!book) {
			res.status(404).send("Resource not found")
		} else {
			const chapter = book.chapters.id(chapter_id)
			let comment;

			chapter ? comment = chapter.comments.id(comment_id) : comment = null;

			if (chapter && comment) {
				// Above code just finds the correct book/chapter/comment.
				comment.remove();

				// Remove the deleted comment from all highlights
				const highlights = chapter.highlights;

				highlights.forEach((h) => {
					// Do not touch !=
					h.comment_ids = h.comment_ids.filter((c) => {
						return c != comment_id
					});
				});

				// If highlights are empty, remove them.
				chapter.highlights = highlights.filter(h => h.comment_ids.length > 0)

				book.save().then(async (bookRes)=> {
					const commentsRes = await getComments(chapter.comments, user_id)
					const highlightsRes = chapter.highlights

					res.send({comments: commentsRes, highlights: highlightsRes})
				})
			} else {
				res.status(404).send("Resource not found")
			}
		}
	})
})


/**
 * Modifies the vote on a comment
 *
 * :book_id/:chapter_id/:comment_id - the book/chapter/comment _ids: ObjectId
 *
 * @param res: comment - a list of comments
 * 	vote: Number, either [0, 1, -1] to adjust the vote (can only be done once per user)
 * 	highlight: [HighlightSchema]
 */
app.post('/api/vote/:book_id/:chapter_id/:comment_id', authenticate,(req, res) => {
	const book_id = req.params.book_id;
	const chapter_id = req.params.chapter_id;
	const comment_id = req.params.comment_id;

	const user_id = req.user._id;

	if (!isDBReady(res) || !isIdValid(book_id, res) || !isIdValid(chapter_id, res) || !isIdValid(comment_id, res) || !isIdValid(user_id, res)) return;

	Book.findById(book_id).then((book)=>{
		if (!book) {
			res.status(404).send("Resource not found")
		} else {
			const chapter = book.chapters.id(chapter_id)
			let comment;

			chapter ? comment = chapter.comments.id(comment_id) : comment = null;

			if (chapter && comment) {
				// The above code finds the specific book/chapter/comment.
				const votes = comment.votes;

				if (req.body.vote > 1 || req.body.vote < -1) {
					res.status(400).send("You can only vote up by 1 or -1")
					return;
				}

				// List of all votes by THIS user
				const userVotes = votes.filter((v => {
					return v.user_id.toString() === user_id.toString()
				}))

				// If they've already voted:
				//	 and it's the same vote -> vote is cancelled.
				//   and if it's different  -> vote is modified.
				if (userVotes.length > 0) {
					if (userVotes[0].vote === req.body.vote) {
						userVotes[0].vote = 0
					} else {
						userVotes[0].vote = req.body.vote
					}
				} else { // If they haven't voted, add their vote.
					votes.push({user_id: req.user._id, vote: req.body.vote})
				}

				book.save().then(async (bookRes)=> {
					const commentsRes = await getComments(chapter.comments, user_id)
					const highlightsRes = chapter.highlights

					res.send({comments: commentsRes, highlights: highlightsRes})
				})
			} else {
				res.status(404).send("Resource not found")
			}
		}
	})
})

/**
 * Updates the booklist with a new book.
 * Res: The booklist.
 */
app.post('/api/booklist/:id', authenticate, (req, res) => {
	const id = req.params.id;
	const book = req.body.book;
	if (!isDBReady(res) || !isIdValid(id, res) || !isIdValid(book, res)) return;
	User.findById(id).then((user) => {
		if(!user){
			res.status(404).send("Resource not found")
		}
		else{
			user.books.push(book);
			user.save().then((result) => {
				res.send(result)
			})	
		}
	}).catch((error) => {
		log(error)
		res.status(500).send('Internal Server Error')
	})
})

/**
 * Adds to the uploads.
 * Res: The uploads.
 */
app.post('/api/uploads/:id', authenticate, (req, res) => {
	const id = req.params.id;
	const upload = req.body.upload;
	if (!isDBReady(res) || !isIdValid(id, res) || !isIdValid(upload, res)) return;
	User.findById(id).then((user) => {
		if(!user){
			res.status(404).send("Resource not found")
		}
		else{
			if(!user.uploads.includes(upload)){
				user.uploads.push(upload)
			}
			user.save().then((result) => {res.send(result)})
		}
	}).catch((error) => {
		log(error)
		res.status(500).send('Internal Server Error')
	})
})

/**
 * Adds to the following.
 * Res: The following.
 */
app.post('/api/followings/:id', authenticate, (req, res) => {
	const id = req.params.id;
	const following = req.body.following;
	if (!isDBReady(res) || !isIdValid(id, res) || !isIdValid(following, res)) return;
	User.findById(id).then((user) => {
		if(!user){
			res.status(404).send("Resource not found")
		}
		else{
			user.followings.push(following);
			user.save().then((result) => {
				res.send(result)
			})	
		}
	}).catch((error) => {
		log(error)
		res.status(500).send('Internal Server Error')
	})
})

/**
 * Adds to followers.
 * Res: The followers.
 */
app.post('/api/followers/:id', authenticate, (req, res) => {
	const id = req.params.id;
	const follower = req.body.follower;
	if (!isDBReady(res) || !isIdValid(id, res) || !isIdValid(follower, res)) return;
	User.findById(id).then((user) => {
		if(!user){
			res.status(404).send("Resource not found")
		}
		else{
			user.followers.push(follower);
			user.save().then((result) => {
				res.send(result)
			})	
		}
	}).catch((error) => {
		log(error)
		res.status(500).send('Internal Server Error')
	})
})

/**
 * Removes a book from booklist.
 * Res: The booklist.
 */
app.delete('/api/user/booklist/:book_id', authenticate, (req, res) => {
	const id = req.session.user_id;
	const book_id = req.params.book_id;
	if (!isDBReady(res) || !isIdValid(book_id, res) || !isIdValid(id, res)) return;
	User.findById(id).then((user) => {
		if(!user){
			res.status(404).send("Resource not found")
		}
		else{
			const r = []
			for(let i = 0; i < user.books.length; i++){
			if(user.books[i] != book_id){
				r.push(user.books[i])
			}
			}
				user.books = r;
				user.save().then(() => {
					Book.findById(book_id).then((book) => {
						if(!book){
							res.status(404).send("Resource not found")
						}
						else{
							const k = []
							for(let j = 0; j < book.follows.length; j++){
							if(book.follows[j] != id){
							k.push(book.follows[j])
							}
							}
							book.follows = k
							book.save().then(() => {
								res.send(book.follows)
							})
						}
					})
					})
			}
		}	
	).catch((error) => {
		log(error)
		res.status(500).send('Internal Server Error')
	})
})

/**
 * Deletes a book from the followings.
 * Res: The following.
 */
app.delete('/api/user/followings/:user_id', authenticate, (req, res) => {
	const id = req.session.user_id;
	const user_id = req.params.user_id;
	if (!isDBReady(res) || !isIdValid(user_id, res) || !isIdValid(id, res)) return;
	User.findById(id).then((user) => {
		if(!user){
			res.status(404).send("Resource not found")
		}
		else{
			const r = []
			for(let i = 0; i < user.followings.length; i++){
				if(user.followings[i] != user_id){
					r.push(user.followings[i])
				}
			}
			user.followings = r;
			user.save().then(() => {
				User.findById(user_id).then((user1) => {
					if(!user1){
						res.status(404).send("Resource not found")
					}
					else{
						const k = []
			for(let j = 0; j < user1.followers.length; j++){
				if(user1.followers[j] != id){
					k.push(user.followers[j])
				}
			}
			user1.followers = k;
			user1.save().then(() => {
				res.send(user1.followers);
			})
					}
				})
			})
		}
	}).catch((error) => {
		log(error)
		res.status(500).send('Internal Server Error')
	})
})

/**
 * Uploads an image to the cloud.
 * Req: The file.
 * Res: Gets the uploaded url.
 */
app.post("/api/images*", multipartMiddleware, (req, res) => {

	if (!req.files.img) {
		res.status(400).send("Please send a valid image")
		return;
	}

    // Use uploader.upload API to upload image to cloudinary server.
    cloudinary.uploader.upload(
		req.files.img.path, // req.files contains uploaded files
        function (result) {
			if (result.url) {
				// Cookies.set("userpic", result.url)
				res.send({public_id: result.public_id, image_url: result.url});
			} else {
				res.status(400).send("File could not be uploaded. Ensure it's a valid path/file.")
			}
        });
});



/*
* ==========================================================
* STARTS THE PORT
* ==========================================================
 */

const port = process.env.PORT || 5000
app.listen(port, () => {
	log(`Listening on port ${port}...`)
})

/*
* ==========================================================
* SETS UP THE FRONTEND AND ASSETS
* ==========================================================
 */

// Static folders for the react and assets.
app.use(express.static(path.join(__dirname, "/book-img")));
app.use(express.static(path.join(__dirname, "/assets")));
app.use(express.static(path.join(__dirname, "/client/build")));

// Enables server-client interaction of the router
// Redirects to index.html (catch all method)
app.get("*", (req, res) => {
	// check for page routes that we expect in the frontend to provide correct status code.
	const goodPageRoutes = ["/", "/home", "/book", "/book/view", "/profile", "/adminpanel"];
	if (goodPageRoutes.reduce((prev, curr) => {
		if (prev) return true;
		else return req.url.startsWith(curr)
	}, false)) {
		// if url not in expected page routes, set status to 404.
		console.log(req.url, " route was a special case")
	} else {
		res.status(404);
		console.log(req.url, " route was not found")
	}

	res.sendFile(path.join(__dirname, "/client/build/index.html"));
});
