import React from "react";
import {withRouter} from "react-router-dom";
import "../../style/ProfileBookDisplay.css";
import {handleRemove} from "./action";

class ProfileBookDisplay extends React.Component {
   
    //handleing the click event of the button view
    // this will redirect the user to the main page of the book
    MovetoBook(user, book) {
        this.props.history.push(`/book/${book.id}`, {
            username: user
        });
    }

    // gives the view of list of books
    render() {
        const {user, UserProfile, book} = this.props;
        return (
            <div className="ProfileBookDisplay">
                <div className="bookCoverContainer">
                    <img className="bookCover" alt="book cover" src={book.bookCoverPath}/>
                </div>
                <div className="bookTitle">
                    <p><strong>Title: </strong>{book.name}</p>
                    <p><strong>By: </strong><i>{book.author}</i></p>
                </div>
                <div className="buttons">
                    <button id="view" className={"defaultButton"} onClick={() => this.MovetoBook(user, book)}>
                        Start Viewing
                    </button>
                    <button
                        id="remove" className={"defaultButton"}
                        onClick={() => handleRemove(UserProfile, book)}
                    >
                        Remove Book
                    </button>
                </div>
            </div>
        );
    }
}

export default withRouter(ProfileBookDisplay);
