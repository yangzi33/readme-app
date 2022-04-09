import {uid} from "react-uid";
import React from "react";
import {withRouter} from "react-router-dom";
import BookCard from "../BookDisplay/BookCard";
import NoBookFound from "./NoBookFound";
import "../../style/BookList.css";

class ExploreBookList extends React.Component {
    // State keeps track of the logged user
    // This page won't be rendered if user is not logged in (since user props will be null)
    // We prevented user to access this page in the header component.

    render() {

        // filteredBooks are books matching the search input pased by Search component
        const { bookList, isSearch = false } = this.props;

        // Return every book in filteredBooks as a BookDisplay component in a list item
        if (bookList.length > 0 || isSearch) {
            return (
                <div className="bookListWrapper">
                    <ul id="menu">
                        {bookList.map((book) => (
                            <li key={uid(book)}>
                                <BookCard book={book}/>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        } else {
            return (
                <NoBookFound />
            )
        }
    }
}

export default withRouter(ExploreBookList);
