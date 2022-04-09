import React from "react";
import Button from "@material-ui/core/Button";

import { logout } from "./../../actions/user";

import "./../../App.css";
import "./styles.css";

/* The Header Component */
class Header extends React.Component {
    
    // logs out the user
    logoutUser = (app) => {
        this.props.history.push("/login");
        logout(app);
    };

    render() {
        const { title, subtitle, app } = this.props;

        return (
            <div className="header">
                <h1>{title}</h1>
                <h3>{subtitle}</h3>
                <Button
                    onClick={() => this.logoutUser(app)}
                    className="app__horizontal-center"
                    variant="contained"
                >
                    Logout
                </Button>
            </div>
        );
    }
}

export default Header;
