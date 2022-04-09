import React from "react";
// import Search from "./Search.js";
import Header from "../Header/Header";
import {withRouter} from "react-router-dom";
import "../../style/ExplorePage.css";

import Cookies from 'js-cookie';
import {getRandomBooks} from "../../actions/explore";
import ExploreBookList from "./ExploreBookList.js";


class ExplorePage extends React.Component {
    // States
    state = {
        // The user that is currently logged in (or null if not logged in)
        user: Cookies.get("username"),
        bookList: [],
    };

    componentDidMount(){
        getRandomBooks(this)
    }


    // Renders the explore page containing a list of recommended books with a search function
    // User can search books by book name, author name, words in the description, and genre.
    render() {

        return (
            <div className="explorePage">
                <Header/>
            <div className="exploreTitleContainer">
                <h1 className="exploreTitle">Looking for something to read? Check out our books!</h1>
            </div>
                <ExploreBookList bookList={this.state.bookList}/>
            </div>
        );
    }
}

export default withRouter(ExplorePage);
