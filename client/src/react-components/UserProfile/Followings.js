import React from "react";
import "../../style/Followings.css";
import {BACKEND_URL} from "../../actions/Utils";

//present the users your are following in the profile page
class Followings extends React.Component {
    /**
     * Remove the the user form the following list of a user
     * when click the remove button
     * This should make a server call to remove the user
     * from the list of following users in the database
     * @param  UserProfile the profile of the user
     * @param  user the user is stored in state of profile of the user
     */
    handleRemove(UserProfile, user) {
        // Should send request to server with the username to remove and who requested it.
        // Then the server should remove the following status and return the new following list.
        const following_id = user.id;

        fetch(`${BACKEND_URL}/api/user/followAuthor/${following_id}`,
        {   headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        method: "POST",credentials: "include"}).then(
             () => {
                const newFollowings = UserProfile.state.followings.filter((u) => {
                    return u !== user;
                });
                UserProfile.setState({followings: newFollowings});
             }
         )
    }

    /**
     * Present the list of users
     * that the user is following on the user's profile page
     *  UserProfile is passed from the profile
     */
    render() {
        const {UserProfile} = this.props;
        const listItems = UserProfile.state.followings.map((following, index) => (
            <li className={"noBullets"} key={"followingUser" + index}>
                <div className="FollowingDisplay">
                    <div className="iconContainer">
                        <img
                            alt="The following user"
                            className="icon blackBorder"
                            src={following.icon}
                        />
                    </div>
                    <div className="followingName">
                        <p id={"followerName"}>
                            <strong>Name: </strong>
                            {following.name}
                        </p>
                    </div>

                    <button
                        className="remove defaultButton"
                        onClick={() => this.handleRemove(UserProfile, following)}
                    >
                        Unfollow
                    </button>
                </div>
            </li>
        ));

        return <ul>{listItems}</ul>;
    }
}

export default Followings;
