import React from "react";
import "../../style/NoBookFound.css";

class ExploreBookList extends React.Component {
    render() {
        return(
            <div className="noBookFoundBox">
                <h1 className="noBookFoundText">OOPS! No book found.</h1>
            </div>
        )
    }
}

export default ExploreBookList;