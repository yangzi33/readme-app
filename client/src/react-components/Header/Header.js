import React from "react";
import logo from "../../assets/ReadmeIcon.png";
import {withRouter, Link} from "react-router-dom";
import "../../style/Header.css";
import {formatUser} from "../../actions/Utils";

import Cookies from 'js-cookie';

class Header extends React.Component {
    /**
     * user: The user that is logged in
     */
    state = {
        user: Cookies.get("username"),
        user_id: Cookies.get("user_id"),
        userpic: Cookies.get("userpic")
    };

    /**
     * Makes the profile button (the profile picture and username)
     * If not logged in, should replace with login/register links.
     * Will be aligned towards the END OF THE HEADER.
     * @returns {JSX.Element}
     */
    makeProfileButton() {
        if (this.props.showExplore) {
            // Not logged in
            return (
                <div id="endContainer">
                    <Link className="link" to="/">
                        Login
                    </Link>
                    <Link className="link" to="/signup">
                        Register
                    </Link>
                </div>
            );
        } else {
            // Hard coded profile picture and username fetching.
            // Should send request to fetch the user's profile picture and username.
            let pic = this.state.userpic;
            let color = "rgb(255, 230, 145)";

            if (this.state.user === "admin") {
                color = "rgb(220, 6, 4)";
            }

            if (this.props && this.props.userpic) {
                pic = this.props.userpic;
            }

            return (
                <div id="endContainer">
                    <img
                        src={pic}
                        alt="UserProfile"
                        id="userProfilePic"
                        onClick={() => {
                            this.props.history.push("/profile", {user: this.state.user,
                                                                 user_id: this.state.user_id});
                        }}
                    />
                    <div
                        id="userProfileName"
                        onClick={() => {
                            this.props.history.push("/profile", {user: this.state.user,
                                                                 user_id: this.state.user_id});
                        }}
                    >
                        <p id="profileLink" style={{color: color}}>
                            <strong>{formatUser(this.state.user)}</strong>
                        </p>
                    </div>
                </div>
            );
        }
    }

    redirectExplore() {
        if (this.props.showExplore) {
            window.alert("You must log in first!");
            return;
        } else {
            this.props.history.push(`/home`);
        }
    }

    /**
     * Pushes user states to the search page.
     * Used in onClick of Search button in header.
     */
    redirectSearch() {
        // fetch(`${BACKEND_URL}/api/book`).then(response => response.json())
            // .then(data2 => {
        this.props.history.push(`/search`);
            // })
    }

    /**
     * If user is logged in, returns a explore link to the explore page pushing the 
     * user state to ExplorePage; if user is not logged in, returns an alert to tell user to login.
     * @returns {JSX.Element}
     */
    makeExploreButton() {
        if (this.props.showExplore) {
            return (
                <Link className="link" to="/explore-warning">
                    Explore
                </Link>
            );
        } else {
            return (
                <p className="exploreLink" onClick={(e)=>this.redirectExplore()}>
                    Explore
                </p>
            );
        }
    }
    
    makeSearchButton() {
        if (this.props.showExplore) {
            return (
                <Link className="link" to="/explore-warning">
                   Search 
                </Link>
            );
        } else {
            return (
                <p className="exploreLink" onClick={(e)=>this.redirectSearch()}>
                   Search 
                </p>
            );
        }
    }

    makeHomeButton() {
        return <p className="exploreLink" onClick={(e)=>this.redirectExplore()}>
                Home
            </p>
    }

    /**
     * Renders the header.
     * The explore button redirects to ExplorePage if and only if user is logged in;
     * otherwise, an alert will pop up telling user to login.
     * @returns {JSX.Element}
     */
    render() {
        return (
            <div className="header">
                <div id="startContainer">
                    <img id="readMeLogo" src={logo} alt="Book Icon"/>
                    <h2 id="headerTitle">ReadMe</h2>

                    {this.makeHomeButton()}


                    {this.makeSearchButton()}
                </div>

                <div className="flexPadding"/>

                {this.makeProfileButton()}
            </div>
        );
    }
}

export default withRouter(Header);
