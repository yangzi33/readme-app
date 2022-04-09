import React from "react";
import ProfileBookDisplay from "../UserProfile/ProfileBookDisplay";

class BookList extends React.Component {
    //present the booklist on profile page
    //booklist is passed from the userprofile, should be stored
    // in database separately
    render() {
        const {user, UserProfile} = this.props;
        const listItems = UserProfile.state.books.map((book,index) => (
            <li className={"noBullets"} key={"bookinlist"+index}>
                <ProfileBookDisplay user={user} UserProfile={UserProfile} book={book}/>
            </li>
        ));

        return (
            <ul>{listItems}</ul>
        );
    }
}

export default BookList;
