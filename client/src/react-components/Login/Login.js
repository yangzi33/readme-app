import React from "react";
import {withRouter, Link} from "react-router-dom";
import Header from "../Header/Header";
import "../../style/Login.css";
import "../../style/Alignment.css";
import "../../style/DefaultButton.css";
import logo from "../../assets/ReadmeIcon.png";
import {BACKEND_URL} from "../../actions/Utils";

import Cookies from 'js-cookie';

class Login extends React.Component {
    /**
     * user: username
     * pass: password
     * remember: Whether to remember username
     * warnings: Displays errors such as wrong user/pass.
     */
    state = {
        user: "",
        pass: "",
        remember: false,
        warnings: ""
    };

    componentDidMount() {
        if (Cookies.get("remember") === undefined) {
            Cookies.set("remember", this.state.remember)
        }

        const remember = Cookies.get("remember") === "true"

        if (remember && Cookies.get("rememberUser") !== undefined) {
            this.setState({user: Cookies.get("rememberUser")})
        }

        this.setState({remember: remember})

        let redirectMsg = null;

        if (this.props.history.location.state)
            redirectMsg = this.props.history.location.state.redirect

        if (redirectMsg) {
            this.setState({warnings: redirectMsg})
        }
    }

    /**
     * Checks that the login states are all valid.
     * If valid, proceeds to the main page.
     * Otherwise, displays a wrong user/pass warning.
     */
    validateLoginState() {
        const loginInfo = {
            username: this.state.user,
            password: this.state.pass
        }

        // Send the request with fetch()
        fetch(`${BACKEND_URL}/api/user/login`, {
            method: "post",
            body: JSON.stringify(loginInfo),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            credentials: "include"
        })
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    return Promise.reject(res.text())
                }
            })
            .then(json => {
                if (json.username) {
                    Cookies.set("username", json.username)
                    Cookies.set("user_id", json.user_id)
                    Cookies.set("userpic", json.profilePicUrl)

                    if (this.state.remember) {
                        Cookies.set("rememberUser", this.state.user)
                    }
                }

                this.props.history.push("/home");
            })
            .catch(error => {
                console.log(error);
                error.then((errMsg) => this.setState({warnings: errMsg}));
  
                })
           
                    
            // });
    }

    /**
     * Updates the field with the component's value.
     * @param event The event
     * @param fieldName The name of the field
     */
    handleInputChange(event, fieldName) {
        const target = event.target;
        const value = target.value;

        this.setState({[fieldName]: value});
    }

    /**
     * Toggles whether to remember the username.
     */
    toggleRememberMe() {
        if (this.state.remember) {
            this.setState({remember: false});
            Cookies.set("remember", false)
        } else {
            this.setState({remember: true});
            Cookies.set("remember", true)
        }
    }

    /**
     * Renders the Login Screen.
     * @returns {JSX.Element}
     */
    render() {
        return (
            <div className="loginBackground">
                <Header showExplore={true}/>

                <div className="alignVerticalCenter">
                    <div className="loginBar">
                        <div className="alignAllCenter">
                            <img className="logoIcon" src={logo} alt="Book Icon"/>
                            <h1 className="centerOffset">Sign In</h1>
                        </div>

                        <h3>Username</h3>
                        <input
                            className="loginInput"
                            type="text"
                            value={this.state.user}
                            onChange={(e) => this.handleInputChange(e, "user")}
                        />

                        <h3>Password</h3>
                        <input
                            className="loginInput"
                            type="password"
                            value={this.state.pass}
                            onChange={(e) => this.handleInputChange(e, "pass")}
                        />

                        <i>
                            <p className="warning">{this.state.warnings}</p>
                        </i>

                        <div>
                            <input
                                id="rememberInput"
                                type="checkbox"
                                checked={this.state.remember}
                                onChange={(e) => this.toggleRememberMe()}
                            />

                            <p>Remember Me?</p>
                        </div>

                        <div>
                            <button
                                id="signInButton"
                                className="loginButton defaultButton"
                                onClick={(e) => this.validateLoginState()}
                            >
                                Login
                            </button>
                        </div>

                        <p id="resetPassword">Don't have an account?</p>

                        <Link to="/signup">Make one here.</Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Login);
