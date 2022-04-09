import { withRouter } from "react-router-dom";
import React from "react";
import { getAuthorName } from "../../actions/explore";
import "../../style/BookDisplay.css"

class BookCard extends React.Component {

    state = { author: "" }

    moveToBook(book) {
        const book_id = book._id;
        const book_url = `/book/${book_id}`;
        this.props.history.push(book_url, { book, book_id });
    }

    render() {
        const { book } = this.props;

        getAuthorName(this, book.author_id);
        return (
            <div className="bookDisplayCard">
                <div className="bookDisplayImgContainer">
                    <img className="bookDisplayImg" src={book.coverUrl} alt="Book Cover" />
                </div>
                <div className="bookCardBodyContainer">
                    <h3 className="bookDisplayTitle">{book.bookTitle}</h3>
                    <h5 className="bookDisplayTitle">by {this.state.author}</h5>
                    <p className="bookCardSummary">{book.summary}</p>
                    <div className="viewButtonContainer">
                        <button className="viewButton" onClick={e => {this.moveToBook(book)}}>View Book</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(BookCard);