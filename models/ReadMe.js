/* Student mongoose models */
const mongoose = require('mongoose')

const ObjectId = require('mongodb').ObjectID;

const Vote = new mongoose.Schema({
	user_id: ObjectId,
	vote: Number
});

const Comment = new mongoose.Schema({
	start: Number, // Are these even needed? They can be generated.
	end: Number,
	votes: [Vote],
	user_id: ObjectId,
	commentContent: String,
	commentColor: String,
});

const Highlight = new mongoose.Schema({
	start: Number,
	end: Number,
	comment_ids: [ObjectId],
	color: String,
})

const ChapterSchema = new mongoose.Schema({
	chapterNumber: Number,
	chapterTitle: String,
	chapterContent: String,
	comments: [Comment],
	highlights: [Highlight]
});

const Review = new mongoose.Schema({
	reviewContent: String,
	username: String,
	userProfilePic: String,
	score: Number
});

const BookSchema = new mongoose.Schema({
	bookTitle: String,
	coverUrl: String, // WARNING: PROBABLY TO BE REPLACED BY ACTUAL IMAGE DATA.
	author_id: ObjectId,
	chapters: [ChapterSchema],

	// book_id: ObjectId,
	summary: String,
	publishDate: String,
	avgScore: Number,
	kudos: Number,
	follows: [ObjectId],
	tags: [String],

	reviews: [Review],

	locked: Boolean
});

const UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	profilePicUrl: String, // Maybe replaced with image.
	email: String,
	phoneNumber: String,
	dateOfBirth: String,
	isAdmin: Boolean,

	books: [ObjectId],
	uploads: [ObjectId],
	followings: [ObjectId],
	followers: [ObjectId],

	summary: String,

	locked: Boolean
});



// create an image model using the schema

const Book = mongoose.model('Book', BookSchema)
const User = mongoose.model('User', UserSchema)

module.exports = { Book, User }