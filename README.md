# CSC309 Project: "ReadMe"

## Web app URL:

https://readme-csc309.herokuapp.com/

## NOTE TO TA: READ BELOW:
### We submitted on the 6th. Commit to Grade: 938ecdf1a58819e0348e91b2936a7fa9e13ffca3

Link to commit: https://github.com/csc309-winter-2022/team24/tree/938ecdf1a58819e0348e91b2936a7fa9e13ffca3

## How to setup web app locally:

Pre-req: Have node/npm installed.

1. clone the github repo

2. cd to the repo (root file, team24)
3. npm install
4. cd client
5. npm install

The above steps should install all dependencies.
If it doesn't, please install the "dependencies" in package.json and client/package.json
Ex. "react": "^17.0.2" => npm install react@17.0.2

6. cd ..
7. mkdir mongo-data
8. mongod --dbpath mongo-data

This should setup both the frontend and backend.
How see how to use it to start it up!

## How to use it:

### Local:

1. Start at the root folder (team24)
2. cd client
3. npm run build
4. cd ..
5. node server.js
6. On the browser, go to localhost:5000

This should startup both the frontend and the backend.
Follow steps below to see what you can do.

For postman access: localhost:5000/api/<route>
 
Note: You must have ports 3000/5000 unbound.
 
Note: Try it first. If it doesn't work, you may need to add your IP to corsOption.origin in server.js or proxy to localhost:5000 in postman.
 
The detailed instruction for doing the following can be found below (but it should be very intuitive).
 
1. First, create a user (see how to create an admin below)
2. Then, login using the user.
3. There shouldn't be any books since none exist yet.
4. Click on your profile and click on "Uploads"
5. Then click "Publish a book" to create a book.
6. Now go back to home (click on navbar) and you can see your book.
7. Now you can click into it, read it, edit it, etc.
8. Alternatively, create an admin (see below) and test admin functionality. Many of these features are found in the admin panel (click on your profile after logging in as admin and go to "Admin Panel." Ex. Removing comments/votes/adding users. User manipulation is in admin panel, the rest is on book main page

### Heroku:

Go to https://readme-csc309.herokuapp.com/
You may need to wait for a bit, if it's sleeping.
 
Follow steps below to see what you can do.

For postman access: https://readme-csc309.herokuapp.com/api/<route>
NOTE: NOT RECOMMENDED TO POSTMAN TO FRONTEND, IT'S BEST TO USE LOCAL TO TEST.

## Edits since Phase 1:

 Added many routes (see below)
 Website now runs frontend and backend.
 Deployed to heroku.
 Frontend now connects to backend and stores data in database.
 Frontend improvements:
  - Navbar changed colors.
  - Reduced navbar height
  - Added dropshadow to navbar, login, etc.
  - Changed book main page to use background image
  - Centered profile a bit more.
  - Added edit profile information feature.
  - Added logout button.
  - Explore now is the home page after logging in. Searching is separated from explore.
  - Fixed visual cue for editing information.
  - Link to chapters now due and contain a view button.
  - Bookviewer now has a chapter overview table
  - Made things look less vanilla.
 
## How to create an admin.
 
 As specified in the handout, admins don't need to be created by the website. Thus, the web server only creates normal users.
 Admins must be MANUALLY created.
 
 You need to install Mongo Compass.
 
 First, create a normal user using either the website or postman.
 Then, go to Mongo Compass.
 Connect to to mongodb://localhost:27017 (by default)
 Go to the users collection.
 Look for the user you created.
 Change the field "isAdmin" from false to true.

## What can you do?

* You start on the Login page. You MUST login or register before proceeding.
* Thus, **you can login to the webapp** to access all features.
  * Click on the "Login" button in the header.
  * Enter the credentials (see below) and click "Login."
  * If the credentials are wrong, you will be warned.
* **Never attempt to access pages by manually typing links.** (e.g. directly accessing `localhost:PORT/book` or `localhost:PORT/explore` by manually entering paths. Doing so will break functionality of the app.

### Credentials:

* User login (a regular user, hasn't published any books):
  * Username: user
  * Password: user

* User2 login (the author of book "Try to edit me", use to test edit functionality):
  * Username: user2
  * Password: user2
  
* Admin login (all admin functionality):
  * Username: admin
  * Password: admin
 
  There may be more users added.

* **You can register a new account**
  * Click on the "Make one here" link in the Login screen OR click on the "Register" button on the header.
  * Enter your username/password/email/phone/date of birth
  * Click "Register."
  * If there are errors, you wil be notified.
  * Otherwise, you will be redirected to the Login Screen.
  * You can login with your new account!
 
  There may be more users added than listed above, thus some usernames might be taken.

* **You can explore random books in Home and search for books in Search**
  * In the home page, you can view a list of 5 books we provide you to read, randomly generated everytime. (or less if there's less books in the db)
  * Each book is shown in a card-like display, with book name, book author, and a short book description.
  * If you are interested in finding a book, you can search it in the search tab with either
    * name of the book;
    * name of the book author;
    * words or phrases in the description;
    * genre of the book.
  * If you want to view a book, you will have to login first.

* **You can follow authors**
  * Go to the book's info page.
  * There is a button to follow the author.
  * Click on the button. It will turn blue.
  * Used to track favorite authors (when database available)

* **You can explore the book's info page**
  * There in a book's main page there is it's title, cover image, summary, and chapters,
  * as well as metadata such as number of kudos and date it was published. There is information
  * about the author, the author's username, profile pic, and number of followers.
  * Lower down there are comments and chapters. 
  * Click on a chapter to read it.
  * You can scroll through the comments, or write your own comment.
  * You can only post non empty comments.
  * Authors of the book have the ability to edit it or instantly delete a comment
  * Admins have the ability to ban the book or remove a comment by sending an admin message
  * Admins can also just send a warning message  

* **ADMINS: You can send warnings to authors, commentors, or users**
  * Warnings include one of 3 automatic options: inappropriate content, spam, or plagarism.
  * An admin can add a custom message to it
  * Warnings cannot be empty, there must either be an automatic or custom message.

* **ADMINS: You can remove comments**
  * Removing a comment involves sending a message similar to the warning message for the reason 
  * of removal, but the comment will be permanently deleted

* **You can give kudos to books**
  * Click on Kudos button. It will turn pink and kudos will go up

* **You can donate to authors**
  * Click on support and enter an amount to tip to authors

* **You can edit books**
  * Authors of a book can click on edit, where they can edit title, summary, etc, as well as edit
  * chapters, tags, or add new ones
  * To test this, sign in as "user2" and click on the book that is authored by "user2"

* **You can add comments**
  * Any user can add comments on the main page of a book,
  * showing their user name at this site

* **You can read books**
  * When you're on the Book info page (see above)
  * Click on any of the chapters.
  * You will be redirected to the book reader.
  * In the book reader, you can click "Next page" or select a chapter in the dropdown to navigate.
  * You will see book info on the left and annotations (if any) on the right.
  * Allows for faster navigation.

* **You create in-text comments (highlights)**
  * In the book reader (see above), click on "Add Comment"
  * Enter a comment in the text area
  * Highlight a section of the chapter text.
  * Click enter.

* **You look for in-text comments**
  * Hover over the highlighted text or comment to see what it's linked to.
  * Lets you find the corresponding element faster.

* **You vote for in-text comments**
  * On an existing comment, click on the upvote/downvote keys.
  * The highest rated comments will be on top. 

* **ADMINS OR AUTHOR: You remove in-text comments**
  * If you created the comment (or is an ADMIN), there will be a button to remove comments.
  * Click on it to remove the comment.
  
* **You can view your profile page**
  * By clicking the icon at the top-right conner, a user would be redirected to the profile page of oneself.
  * All users can see their follwoings, followers, booklist and uploads
  * This lets you remove following users/books in booklist and edit books. It also provides a shortcut to view books in booklist.
  * admin user have a button lead to admin panel

* **You can publish a new book**
  * When a user click the uploads in the profile, there would be a button for add new uploads, which leads you to a book edit page
  * on this page a uer can add the title and chapters for a book

* **ADMINS: You can use the admin panel to ban users**
  * Upon logging in, an admin will be directed to the admin panel. Here users can be sent 
  * warnings or banned. The admin must send a reason for the ban. A banned user can later be
  * unbanned by an admin.
  * You can DELETE user accounts.
  * You can add user accounts.
 
## Route overview:
 
 =======================================
 
 #### POST /api/user/login
 
 Logins the user into the server
 
 Req: {
    "username": "user78",
    "password": "user78"
}
 
 Res: {
    "username": "user78",
    "user_id": "624bac5ddaf2b79b24a4cf48",
    "profilePicUrl": "/assets/Profile.png"
}
 
#### GET /api/user/logout
 
 * Logout in the user
 *req:
 *    body.user_id: ObjectId, the user_id to log out
 * res:
 * user_id: The user id if logged out successfully
 
 
 #### GET /api/user/check-session
 
 
 * Checks if the session is active
 * @param res
 *	username: String, username
 *  user_id: ObjectId, id of user in db
 
 
 #### PATCH /api/update-user/:id
 
 * Edits the user.
 * Req: profilePicUrl/email/phoneNumber/dateOfBirth/followers/locked/summary
 * Res: Updated user
 
 
 #### DELETE /api/user/:id

 * Deletes the user
 * Res: The deleted user id
 
 
 #### POST /api/user/signup
 
 
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
 
 
 #### GET /api/user
 
 
 * Gets all users
 * Res: Array of users
 
 
 #### GET /api/user/:id
 
 
 * Get user by id.
 * Res: The user object.
 
 
 #### POST /api/book
 
 
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
 
 
 #### GET /api/book
 
 * Gets all books
 
 
 #### GET /api/book/random
 
 * Gets a random book
 
 
 #### GET /api/book/:id
 
 * Gets a specific book.
 * :id The ObjectId of the book
 * res: The book
 
 
 #### PATCH /api/book/:id
 
 * Edits book with id
 * :id the id of the book
 * res: The book
 
 
 #### POST /api/user/followNovel/:book_id
 
 * Makes the user follow the novel with book_id.
 * Res: The updated follows
 
 
 #### POST /api/user/followAuthor/:author_id
 
 * Follows the author with author_id.
 * Res: The updated followings.
 
 
 #### PATCH /api/user/:id
 
 * Updates the user.
 * Req: followers or locked.
 * Res: The updated user.
 
 
 #### GET /api/book/:book_id/reviews
 
 * Adds a review of the book_id.
 * Res: Reviews - the list of reviews.
 
 
 #### GET /api/votes/:user_id
 
 * Gets the total upvotes for a user.
 * Res: The total number of upvootes.
 
 
 #### POST /api/book/:book_id/reviews
 
 
 * Adds a review
 * Req: The review (See BookMainPage.js)
 * Res: The updated reviews
 
 
 #### DELETE /api/book/:book_id/reviews/:review_id
 
 * Deletes a review.
 * Res: The updated reviews
 
 
 #### GET /api/comment/:book_id/:chapter_id
 
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
 
 
 #### POST /api/comment/:book_id/:chapter_id
 
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
 
 
 #### DELETE /api/comment/:book_id/:chapter_id/:comment_id
 
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

 
 #### POST /api/vote/:book_id/:chapter_id/:comment_id
 
 * Modifies the vote on a comment
 *
 * :book_id/:chapter_id/:comment_id - the book/chapter/comment _ids: ObjectId
 *
 * @param res: comment - a list of comments
 * 	vote: Number, either [0, 1, -1] to adjust the vote (can only be done once per user)
 * 	highlight: [HighlightSchema]
 
 
 #### POST /api/booklist/:id
 
 * Updates the booklist with a new book.
 * Res: The booklist.
 
 
 
 #### POST /api/uploads/:id
 
 * Adds to the uploads.
 * Res: The uploads.
 
 
 #### POST /api/followings/:id
 
 * Adds to the following.
 * Res: The following.
 
 
 #### POST /api/followers/:id
 
 * Adds to followers.
 * Res: The followers.
 
 
 #### DELETE /api/user/booklist/:book_id
 
 * Removes a book from booklist.
 * Res: The booklist.
 
 
 #### DELETE /api/user/followings/:user_id
 
 * Deletes a book from the followings.
 * Res: The following.
 
 
 #### POST /api/images*
 
 * Uploads an image to the cloud.
 * Req: The file.
 * Res: Gets the uploaded url.
 
 
 #### GET *
  
 * Enables server-client interaction of the router
 * Redirects to index.html (catch all method)
 
 =======================================
  
## Third Party Libraries:

* React (+ dom/scripts): Used to build our own component classes.
  * React-router: Used to handle redirection in our web app.
  * React-uid: Used to generate unique uids.
* History: Also used to handle redirects in our web app.
* Express: For API calls.
* Connect-Mutli: For parsing form data (used for images)
* Cloudinary: For uploading images to the cloud
* Cors: To stop cors from messing us up
* Mongodb: The database
* Mongoose: Schemas for mongodb
* Body-parser: Parsing body in Express
* Bcryptjs: For encryption
* JS-Cookie: For storing cookies

Defunc libraries:
* htmlparser2 - as a dependency, not directly used.
* interweave - may use in Phase 2, removed related code for Phase 1.
* dotenv(+ cli): For running development build

