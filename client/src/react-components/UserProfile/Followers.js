import React from "react";
import "../../style/Followers.css";
import profileimg from "../../assets/profileimg.jpg";
//present the followers of you in the profile page
// followers should be stored in a database separately
class Followers extends React.Component {
    state = {
        // Will replace with database values in Phase 2
        // Should have server call to retrieve all of the follower data (names and icon).
        followers: [
            {
                name: "user3",
                icon: profileimg,
            },
            {
                name: "user4",
                icon: profileimg,
            },
        ],
    };

    render() {
        /**
         * present the list of users followed the user on the user's profile page
         * follower from the state
         */
         const {UserProfile} = this.props;
        const listItems = UserProfile.state.followers.map((follower, index) => (
            <li className={"noBullets"} key={"followerUsers" + index}>
                <div className="FollowerDisplay">
                    <div className="iconContainer">
                        <img
                            alt="The follower"
                            className="icon blackBorder"
                            src={follower.icon}
                        />
                    </div>
                    <div className="followerName">
                        <p id={"followerName"}>
                            <strong>Name: </strong>
                            {follower.name}
                        </p>
                    </div>
                </div>
            </li>
        ));
        return <ul>{listItems}</ul>;
    }
}

export default Followers;
