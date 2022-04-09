import React, {Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import Header from '../Header/Header'
import '../../style/BookMainPage.css'
import "../../style/DefaultButton.css"
import {uid} from 'react-uid'
import Warning from '../Admin/warning';
import Donation from "./Donation";
import star from "../../assets/Star.png"
import bannedBookCover from "../../assets/bannedBook.jpg"
import starInactive from "../../assets/StarInactive.png"
import {BACKEND_URL} from "../../actions/Utils";
import Cookies from 'js-cookie';

const HARD_CODED_BOOK_ID = "";

class BookMainPage extends React.Component {
    state = {

        user: Cookies.get("username"),//this.props.history.location.state.user, //username
        isAdmin: false, // admin status
        isAuthor: false, // is the current user the author of the book?

        // various data relating to the book displayed
        followedBook: false,
        followedAuthor: false,
        gaveKudos: false,
        novelName: '',
        book_id: HARD_CODED_BOOK_ID,
        novelSummary: '',
        coverImage: '',
        novelTags: [],
        novelFollows: 0,
        novelPublishDate: '',
        novelAvgScore: 0,
        novelKudos: 0,
        novelChapters: [],
        reviews: [],
        authorProfile: '',
        authorName: '', 
        authorFollowers: 0,
        author_id: '',

        // profile pic of author and current user
        authorPic: '',//authorpic,
        profilepic: '',//userpic,

        // review currently being written
        newReview: '',

        // origContent: [],
        locked: false, // true = locked, false = normal
        toggleWarning: false, // true = popup for send warning
        showDonation: false, // true = popup for donation
        warningParams: [], // parameters sent to warning.js for sending warning messages

        alreadyRated: false, // users can only set one rating
        stars: [false, false, false, false, false],
        selectedStar: -1,
        hoveredStar: -1,
    }

    // preset for the state. 
    componentDidMount() {
        const id = window.location.pathname.replace("/book/", "")

        fetch(`${BACKEND_URL}/api/book/${id}`, {
                        credentials: "include"
                    }).then(response => {
            return response.json()
        })
        
        // 
            .then(currBook => {
                

                fetch(`${BACKEND_URL}/api/user/${currBook.author_id}`, {
                        credentials: "include"
                    }).then(response => 
                        response.json())
                    .then(currAuthor => {
                        const isfollowingAuthor = currAuthor.followers.includes(Cookies.get("user_id"))
                        if(Cookies.get("user_id") === currBook.author_id){
                            this.setState({isAuthor: true})
                        }

                        this.setState({
                            authorName: currAuthor.username, 
                            authorFollowers: currAuthor.followers.length,
                            authorPic: currAuthor.profilePicUrl,
                            author_id: currBook.author_id,
                            followedAuthor: isfollowingAuthor
                        })
                    })
                fetch(`${BACKEND_URL}/api/book/${id}/reviews`, {
                        credentials: "include"
                    }).then(response => response.json())
                .then(data3 => {
                    data3.reviews.forEach((i)=>{
                        if(i.username === this.state.user){
                            this.setState({alreadyRated: true})
                        }
                    })

                    this.setState({
                        reviews: data3.reviews
                    })
                })
                .catch(error => {
                    console.log(error);
                });

                

                this.setState({
                    novelName: currBook.bookTitle,
                    novelSummary: currBook.summary,
                    coverImage: currBook.coverUrl,
                    novelChapters: currBook.chapters,
                    
                    novelPublishDate: currBook.publishDate,
                    novelAvgScore: currBook.avgScore,
                    novelKudos: currBook.kudos,
                    novelFollows: currBook.follows.length,
                    novelTags: currBook.tags,
                    
                })

                fetch(`${BACKEND_URL}/api/user/${Cookies.get("user_id")}`, {
                        credentials: "include"
                    }).then(response => response.json())
                    .then(currUser => {
                        const isfollowingBook = currUser.books.includes(id)
                        this.setState({
                            profilepic: currUser.profilePicUrl,
                            isAdmin: currUser.isAdmin,
                            locked: currUser.locked,
                            followedBook: isfollowingBook
                        })
                    })
            })

            this.setState({book_id: id})
    };

    // show warning message popup
    togglePopup = (type, purpose, func = null) => {
        if (!this.state.toggleWarning) {
            this.setState({warningParams: [type, purpose, func]})
        } else {
            this.setState({warningParams: []})
        }
        this.setState({toggleWarning: !this.state.toggleWarning});

    }

    // change text fields
    handleChange(event, id, fieldName) {
        const target = event.target;
        const value = target.value;

        if (target.id === id) {
            this.setState({[fieldName]: value});
        }
    }

    // handle clicks of these 3 buttons
    // will make server call to change author follows, novel follows, user book list, and novel kudos count
    handleClick(event) {
        const target = event.target;
        if (target.id === "followAuthorButton"){
            if(!this.state.followedAuthor && this.state.isAuthor){
                window.alert("You just followed yourself! Wait, you can't");
            }
            else{
                fetch(`${BACKEND_URL}/api/user/followAuthor/${this.state.author_id}`, {
                    credentials: "include",
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }).then(response => response.json())
                .then(newAuthorFollowersList => {
                    this.setState({
                        authorFollowers: newAuthorFollowersList.length
                    })
                })

                // this.setState({authorFollowers: this.state.followedAuthor ? this.state.authorFollowers - 1 : this.state.authorFollowers + 1})
                this.setState({followedAuthor: !this.state.followedAuthor})}
            }
        
        
            
        if (target.id === "followNovelButton") {
            if(this.state.isAuthor && !this.state.followedBook){
                window.alert("You just followed your own book! Wait, you can't");
            }
            else if (this.state.locked && !this.state.followedBook){
                window.alert("This book is locked")
            }
            else{
                fetch(`${BACKEND_URL}/api/user/followNovel/${this.state.book_id}`, {
                    credentials: "include",
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }).then(response => response.json())
                .then(newFollowingUsersList => {
                        this.setState({
                            novelFollows: newFollowingUsersList.length
                        })
                })
                this.setState({followedBook: !this.state.followedBook})
            }
        }
        if (target.id === "kudosNovelButton") {
            if(this.state.isAuthor && !this.state.gaveKudos){
                window.alert("Y'know what? Give yourself a pat on the back :)\n You worked hard on this book");
            }
            var newKudos = this.state.novelKudos
            if (this.state.gaveKudos){
                newKudos -= 1
            }
            else{
                newKudos += 1
            }

            const bookJson = {
                "kudos" : newKudos,
            }
            fetch(`${BACKEND_URL}/api/book/${this.state.book_id}`,
                    {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        method: "PATCH",
                        body: JSON.stringify(bookJson),
                        credentials: "include"
                    }).then(response => response.json())
                    .then(updatedBook => {
                        this.setState({
                            novelKudos: updatedBook.kudos,
                        });
                    })
            this.setState({gaveKudos: !this.state.gaveKudos})
        }
            

    }

    // onclick for add new review
    // will make server call to add to reviews
    // Sends the review details (user/content/profile/selected star), already rated and gives the updated review list.
    addReview(event) {
        if(this.state.locked){
            window.alert("This book is locked")
            return;
        }
        if (this.state.newReview === '') {
            window.alert("You can't leave an empty review!");
            return;
        }

        if (this.state.isAuthor) {
            window.alert("Authors can't review their own book!");
            return;
        }

        if (this.state.alreadyRated) {
            window.alert("You already rated the book!");
            return;
        }

        // const reviewList = this.state.reviews
        // reviewList.push([this.state.user, this.state.newReview, this.state.profilepic, this.state.selectedStar])

        // this.setState({reviews: reviewList});
        

        const reviewJson = {
            review:
                {
                    reviewContent: this.state.newReview,
                    username: this.state.user,
                    userProfilePic: this.state.profilepic,
                    score: this.state.selectedStar
                }
        }
        fetch(`${BACKEND_URL}/api/book/${this.state.book_id}/reviews`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify(reviewJson),
                    credentials: "include"
                }).then(response => response.json())
                .then(newBook => {
                    this.setState({
                        reviews: newBook.book.reviews,
                        novelAvgScore: newBook.book.avgScore
                    });
                })

        this.setState({newReview: ''})
        this.setState({alreadyRated: true})
    }

    // delete review (can be done by admins or authors) 
    // will make server call to delete from reviews
    // Gives the uidKey of the review to delete.
    deleteReview(event, review, id) {
        // this.setState({reviews: this.state.reviews.filter(review => review !== uKey)});
        fetch(`${BACKEND_URL}/api/book/${this.state.book_id}/reviews/${id}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "DELETE",
                credentials: "include"}).then(response => response.json())
            .then(newBook => {
                this.setState({
                    reviews: newBook.reviews,
                    novelAvgScore: newBook.avgScore
                })
            })
        if (this.state.toggleWarning) {
            this.setState({toggleWarning: false})
        }
        if (this.state.user === review.username){
            this.setState({alreadyRated: false})
        }
    }

    // an admin can ban a book
    // will make server call to mark book as locked
    // Sends the novelName, returns the updated name and summary.
    banBook() {

        const bookJson = {
            "locked": true
        }
        fetch(`${BACKEND_URL}/api/book/${this.state.book_id}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "PATCH",
                    body: JSON.stringify(bookJson),
                    credentials: "include"
                }).then(response => response.json())
                .then(lockedBook => {
                    this.setState({
                        locked: lockedBook.locked,
                    });
                })

        // this.setState({origContent: [this.state.novelName, this.state.novelSummary]})
        // this.setState({novelName: "<LOCKED>"});
        // this.setState({novelSummary: "<This book has been locked by admins>"});
        // this.setState({locked: true})
        if (this.state.toggleWarning) {
            this.setState({toggleWarning: false})
        }
    }

    // or restore it
    // server call to mark book as unlocked
    // Sends the novelName, returns the updated name and summary.
    unbanBook() {

        const bookJson = {
            "locked": false
        }
        fetch(`${BACKEND_URL}/api/book/${this.state.book_id}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "PATCH",
                    body: JSON.stringify(bookJson),
                    credentials: "include"
                }).then(response => response.json())
                .then(unlockedBook => {
                    this.setState({
                        locked: unlockedBook.locked,
                    });
                })
        // this.setState({novelName: this.state.origContent[0]});
        // this.setState({novelSummary: this.state.origContent[1]});
        // this.setState({origContent: []})
        // this.setState({locked: false})
    }

    // submit a donation 
    submitDonation() {
        // This should be a backend call.
        // See donation view for details.
        this.setState({showDonation: false})
        window.alert("Thanks for the donation!");
    }

    // close donation popup
    cancelDonation() {
        this.setState({showDonation: false})
    }

    // render stars for review rating
    renderStars() {

        return this.state.stars.map((_, index) => {
            let selectedStar = this.state.selectedStar;

            if (this.state.hoveredStar >= 0) {
                selectedStar = this.state.hoveredStar;
            }

            let img = star;

            if (index > selectedStar)
                img = starInactive;

            return <img key={"star" + uid(index)} className="star" src={img} alt={"star"}
                        onMouseEnter={(e) => this.setState({hoveredStar: index})}
                        onMouseLeave={(e) => this.setState({hoveredStar: -1})}
                        onClick={(e) => {
                            if (this.state.selectedStar === index) {
                                this.setState({selectedStar: -1})
                            } else {
                                this.setState({selectedStar: index})
                            }
                        }}/>
        })
    }

    render() {
        // render "ban" or "unban" based on whether book is currently locked
        // if not admin, show nothing
        const renderBanButton = () => {
            if (this.state.isAdmin && !this.state.locked) {
                return <button className='margin1 defaultButton' id='banBook'
                               onClick={() => this.togglePopup("Book", "banned", this.banBook.bind(this))}>Ban</button>
            } else if (this.state.isAdmin && this.state.locked) {
                return <button className='margin1 defaultButton' id='unbanBook'
                               onClick={() => this.unbanBook()}>Unlock</button>
            } else {
                return null
            }
        }
        // show popup for warning message, using warning Params as props
        const renderPopup = () => {
            if (this.state.toggleWarning && this.state.warningParams !== []) {
                return <Warning
                    type={this.state.warningParams[0]}
                    handleClose={this.togglePopup}
                    purpose={this.state.warningParams[1]}
                    func={this.state.warningParams[2]}
                />

            }
        }
        // show donation popup
        const renderDonation = () => {
            return this.state.showDonation &&
                <Donation submitDonation={() => this.submitDonation()} cancelDonation={() => this.cancelDonation()}/>
        }

        // show remove button and warning button for admins, remove button for authors, or nothing for regular users
        const renderRemoveReviewButton = (review) => {
            if (this.state.isAdmin) {
                return <Fragment>
                    <button className='defaultButton' id='removeReview'
                            onClick={(event) => this.togglePopup("Review", "removed",
                                this.deleteReview.bind(this, event, review, review._id))}>Remove
                    </button>
                    <button className='defaultButton' id='flagReview'
                            onClick={(event) => this.togglePopup("Review", "warning"
                            )}>Warning
                    </button>
                </Fragment>
            } else if (this.state.user === review.username) {
                return <button className='defaultButton' id='removeReview'
                               onClick={(event) => this.deleteReview(event, review, review._id)}>Remove</button>
            }
        }
        return (
            <div id='main'>
                <Header user={this.state.user}/>
                <div className='content'>
                    <div id='novelTitle'>
                        <h1 className={"inlineBlock"}><em id={"bookTitle"}>{this.state.locked ? "<Locked>" : this.state.novelName} </em></h1>

                        {renderBanButton()}

                        {this.state.isAdmin ? <button className='margin1 defaultButton'
                                                    onClick={() => this.togglePopup("Book", "warning")}> Warning</button> : null}
                        {renderPopup()}
                        {renderDonation()}

                        {(this.state.isAuthor || this.state.isAdmin) ?
                            <button className='margin1 defaultButton' onClick={(e) => {
                                this.props.history.push(`/book/edit?bookid=${this.state.book_id}`)
                            }}>Edit</button> :
                            null}


                    </div>

                    <div className='row'>
                        <div className='coverContainer1'>
                            <img src={this.state.locked ? bannedBookCover : this.state.coverImage} alt="Book Cover" id="BookCover1"></img>
                        </div>
                        

                        <div id='summary'>
                            <p>{this.state.locked ? "<Locked>" : this.state.novelSummary}</p>
                        </div>
                        <div id='infoBMP'>
                            <img src={this.state.authorPic} alt="Author Pic" id='authorProfilePic'></img>
                            <div id='authorInfo' className={"blackBorder"}>
                                <p><strong>Author:</strong> {this.state.authorName} </p>
                                <p><strong>Author Followers:</strong> {this.state.authorFollowers}</p>
                                <button id='followAuthorButton' className='defaultButton'
                                        onClick={(event) => {
                                            this.handleClick(event)
                                        }}
                                        style={{backgroundColor: this.state.followedAuthor ? "lightBlue" : "white"}}>
                                    {this.state.followedAuthor ? "Unfollow Author" : "Follow Author"}
                                </button>

                                <hr className={"slightTopMargin"}/>

                                <p><strong>Date Published:</strong> {this.state.novelPublishDate}</p>
                                <p><strong>Kudos:</strong> {this.state.novelKudos}</p>
                                <p><strong>Average Score:</strong> {this.state.novelAvgScore}</p>
                            </div>

                        </div>


                    </div>
                    <br/>
                    <div className='row'>
                        <div id='buttons'>
                            <button id='followNovelButton' className='defaultButton'
                                    onClick={(event) => {
                                        this.handleClick(event)
                                    }}
                                    style={{backgroundColor: this.state.followedBook ? "lightBlue" : "white"}}>
                                {this.state.followedBook ? "Unfollow" : "Follow"}
                            </button>
                            <button id='kudosNovelButton' className='defaultButton'
                                    onClick={(event) => {
                                        this.handleClick(event)
                                    }}
                                    style={{backgroundColor: this.state.gaveKudos ? "lightpink" : "white"}}>
                                {this.state.gaveKudos ? "Remove Kudos" : "Kudos"}
                            </button>
                            <button id='supportNovelButton' className='defaultButton'
                                    onClick={(e) => this.state.isAuthor ? window.alert("You can't donate to yourself") : this.setState({showDonation: true})}>Donate
                            </button>
                        </div>

                        <ul id='tags'>
                            {this.state.novelTags.map((tag) => {
                                return (
                                    <li key={uid(tag)} className={"tagentry"}> 
                                        #{tag}
                                        
                                    </li>)
                            })}
                        </ul>
                    </div>


                    <div className='row'>

                    <span id="chapters">
                            <h3>Chapters</h3>
                            <hr></hr>
                            <table>
                                <tbody>
                            {this.state.novelChapters.map((chapter) => {
              
                                return (
                               
                                    <tr key={uid(chapter)} className={"cursorGrab"}>

                                    <th>
                                    <b id={"chapterTitle"} onClick={(e) => {this.state.locked ? window.alert("This book is locked") :
                                        this.props.history.push(`/book/${this.state.book_id}/view?start=${chapter.chapterNumber}`)
                                    }}>Chapter {chapter.chapterNumber}: <em>{this.state.locked ? "<Locked>" : chapter.chapterTitle}</em></b>
                                    </th>
                                    <th>
                                    <button className="defaultButton" onClick={(e) => { this.state.locked ? window.alert("This book is locked") :
                                        this.props.history.push(`/book/${this.state.book_id}/view?start=${chapter.chapterNumber}`)
                                    }}>Read Chapter</button>
                                    </th>
                                    </tr>
                                    
                                )
                            })}
                                </tbody>
                            </table>
                        </span>

                        <span id='reviews'>
                            <div className='row'>
                                <h3>Reviews</h3>
                            </div>
                            
                            <hr></hr>
                            <ul>
                                <li key={uid(99)}>
                                    <div className='row'>
                                        <img src={this.state.profilepic} alt="Profile Pic" className='profilepic'></img>
                                        <span id='username'>
                                            {this.state.user}
                                            <div id={"starDiv"}>
                                                {this.renderStars()}
                                            </div>
                                        </span>
                                        
                                    </div>
                                    <div id='reviewContent'>
                                        <textarea rows={2} id='newReview' onChange={(e) => {
                                            this.handleChange(e, 'newReview', 'newReview')
                                        }} value={this.state.newReview}/>
                                    </div>
                                    <button id='addReviewButton' className='defaultButton'
                                            onClick={(event) => this.addReview(event)}>Add Review</button>
                                    <hr></hr>
                                    
                                    
                                </li>
                                {this.state.reviews.map((review) => {
                             
                                    return (
                                        
                                        <li key={review._id}>
                                            <div className='row'>
                                                <img src={review.userProfilePic} alt="Profile Pic" className='profilepic'></img>
                                                <span id='username'>
                                                <b>{review.username}</b>
                                                </span>
                                                {
                                                    review.score >= 0 ? [...Array(review.score + 1)].map((_, index) => {
                                                        return <img key={"star" + index} src={star} alt="star"
                                                                    className='starDisplay'/>
                                                    }) : null
                                                }

                                            </div>
                                            <div id='reviewContent' className='row'>
                                                {review.reviewContent}
                                                {renderRemoveReviewButton(review)}
                                            </div>
                                            <hr></hr>
                                        </li>)
                                })}

                            </ul>
                        </span>
                    </div>

                </div>
            </div>
        )
    }
}

export default withRouter(BookMainPage);