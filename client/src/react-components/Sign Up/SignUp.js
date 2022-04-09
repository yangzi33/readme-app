import React from 'react';
import {withRouter} from 'react-router-dom';
import "../../style/Login.css"
import '../../style/Alignment.css'
import Header from '../Header/Header';
import logo from "../../assets/ReadmeIcon.png";
import {formatPhoneNumber} from "../../actions/Utils";
import {BACKEND_URL} from "../../actions/Utils";

class SignUp extends React.Component {
    state = {
        // Exactly as you'd expect.
        user: "",
        email: "",
        pass: "",
        repeatPass: "",
        phone: "",
        birthdate: "",

        // The text/color to display when the password/repeat password matches or doesn't match.
        matchPassword: "Please enter a password",
        matchPassColor: "black",

        // Any warnings when validating states.
        warnings: "",
    }

    /**
     * Validates the register fields are valid. Then, redirect to the login page.
     * If it isn't valid, then display warnings.
     */
    validateRegister() {
            const userInfo = {
                username: this.state.user,
                password: this.state.pass,
                repeatPassword: this.state.repeatPass,
                email: this.state.email,
                phoneNumber: this.state.phone,
                dateOfBirth: this.state.birthdate
            }
            // This should send a request to the server.
            // It should create a new user in the server side.
            fetch(`${BACKEND_URL}/api/user/signup`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify(userInfo)
            }).then(response => {
                if (response.status === 200) return response.json()
                else return Promise.reject(response.text())
            }).then((data) => {
                this.props.history.push("/");
            }).catch(error => error.then(errMsg => this.setState({warnings: errMsg})))
    }

    /**
     * Updates a field in the states using the component's value.
     * @param event The event
     * @param fieldName The fieldname
     */
    handleChange(event, fieldName) {
        const target = event.target;
        let value = target.value;

        if (fieldName === "phone") {
            value = formatPhoneNumber(value);
        }

        this.setState({[fieldName]: value}, () => this.validateStates());
    }

    /**
     * Validates the states in real-time.
     * Can be used to provide dynamic feedback (ex. whether the passwords match).
     */
    validateStates() {
        const {pass, repeatPass, phone} = this.state;

        // Checks the passwords match or not.
        if (pass.length > 0) {
            if (pass === repeatPass) {
                this.setState({matchPassword: "The passwords match", matchPassColor: "green"})
            } else {
                this.setState({matchPassword: "The passwords do not match", matchPassColor: "red"})
            }
        } else {
            this.setState({matchPassword: "Please enter a password", matchPassColor: "black"})
        }

        // Ensure the phone number can only be 12 digits long (including the dashes).
        if (phone.length > 12) {
            this.setState({phone: phone.substring(0, 12)})
        }
    }

    // NOTE TO TA: We used in-line styles ONLY to dynamically change styles with React (ie. in-line styles was necessary).
    // Everything else was put into the CSS files.

    render() {
        return (
            <div className="loginBackground">
                <Header showExplore={true}/>

                <div className="alignVerticalCenter">
                    <div id="signupBar" className="loginBar">
                        <div className="alignAllCenter">
                            <img className="logoIcon" src={logo} alt="Book Icon"/>
                            <h1 className="centerOffset">Register</h1>
                        </div>

                        <p>Create an account to start reading today!</p>

                        <h3>Username</h3>
                        <input className="loginInput" type="text" value={this.state.user}
                               onChange={(event) => {
                                   this.handleChange(event, "user")
                               }}/>

                        <h3>Email</h3>
                        <input className="loginInput" type="text" value={this.state.email}
                               onChange={(event) => {
                                   this.handleChange(event, "email")
                               }}/>

                        <h3>Password</h3>
                        <input className="loginInput" type="password" value={this.state.pass}
                               onChange={(event) => {
                                   this.handleChange(event, "pass")
                               }}/>

                        <h3>Repeat Password</h3>
                        <input className="loginInput" type="password" value={this.state.repeatPass}
                               onChange={(event) => {
                                   this.handleChange(event, "repeatPass")
                               }}/>

                        <h3>Phone Number</h3>
                        <input className="loginInput" type="tel" value={this.state.phone}
                               placeholder="999-999-9999"
                               onChange={(event) => {
                                   this.handleChange(event, "phone")
                               }}/>

                        <h3>Date of Birth</h3>
                        <input className="loginInput" type="date" value={this.state.birthdate}
                               onChange={(event) => {
                                   this.handleChange(event, "birthdate")
                               }}/>

                        <p style={{color: this.state.matchPassColor}}>{this.state.matchPassword}</p>

                        <i><p id="multiWarning" className="warning">{this.state.warnings}</p></i>

                        <div>
                            <button id="signUpButton" className="loginButton defaultButton"
                                    onClick={(e) => this.validateRegister()}>Sign Up
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}


export default withRouter(SignUp);
