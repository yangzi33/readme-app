import React from "react";
import defaultbookcover from "../../assets/BookCover.jpeg";
import "../../style/Uploads.css";
import {withRouter} from "react-router-dom";

//present the uploads in profile page
// uploads books hsould be stored in database separately
class Uploads extends React.Component {
    state = {
        // The server should retrieve the books in Phase 2.
        // It should return a list of book names and covers.
        books: [
            {
                name: "book1",
                cover: defaultbookcover,
            },
            {
                name: "book2",
                cover: defaultbookcover,
            },
        ],
    };
    //handle the click event, taking the user to the editting page the book
    MovetoEdit(user, user_id,book) {
        const url = "/book/edit/?bookid="+book.id
        this.props.history.push(url, {
            user: user,
            user_id: user_id
        });
    }
    MovetoBook(user, book) {
        this.props.history.push(`/book/${book.id}`, {
            username: user
        });
    }
    
    //give the view of the list of uploaded books
    render() {
        const {UserProfile, user, user_id} = this.props;
        const listItems = UserProfile.state.uploads.map((book, index) => (
            <li className={"noBullets"} key={"upload" + index}>
                <div className="UploadsDisplay">
                    <div className="coverContainerProfile">
                        <img
                            alt="Book Cover"
                            className="cover blackBorder"
                            src={book.cover}
                        />
                    </div>
                    <div className="BookName">
                        <p className={"slightTopMargin"}>
                            <strong>Title: </strong>
                            {book.name}
                        </p>
                    </div>
                    {/** the button ti be clicked to redirect you to the edit page of the book */}
                    <div className="buttons">
                     <button id="view" className={"defaultButton"} onClick={() => this.MovetoBook(user, book)}>
                         Start Viewing
                     </button>
                     <button
                         id="edit"
                         className="defaultButton"
                         onClick={() => this.MovetoEdit(user,user_id, book)}
                     >
                         Edit
                     </button>
                    </div>
                </div>
            </li>
        ));
        return <ul>{listItems}</ul>;
    }
}

export default withRouter(Uploads);
