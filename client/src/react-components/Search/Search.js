import React from "react";
import {withRouter} from "react-router-dom";
import ExploreBookList from "./../Explore/ExploreBookList";
import Header from "./../Header/Header"
import { updateSearchForm, getMatchBooks } from "./../../actions/search";
import "../../style/Search.css";
import { getBooks } from "../../actions/explore";

class Search extends React.Component {
    state = { searchInput: "", matchBooks: [], bookList: [], notFoundText: "Please enter a search term." }


    componentDidMount() {
        getBooks(this);
    }

    render() {

        const { searchInput } = this.state;

        return (
            <div className="searchPage">
                <Header/>
                <div className="search-field-wrapper">
                    <input
                        name="searchInput"
                        value={searchInput}
                        placeholder="Search Book by Title"
                        className="search-textfield"
                        onChange={e => updateSearchForm(this, e.target)}
                    />
                    <button class="searchButton"
                    onClick={() => getMatchBooks(this, this.state.bookList, this.state.searchInput)}
                >Search</button>
                </div>
            <div>
                {
                    this.state.matchBooks && this.state.matchBooks.length > 0 ?
                        <ExploreBookList bookList={this.state.matchBooks} isSearch={true}/> :
                        <div className={"alignVerticalCenter"}>
                            <p id={"notFoundText"}>{this.state.notFoundText}</p>
                        </div>
                }
            </div>
            </div>
        );
    }
}

export default withRouter(Search);
