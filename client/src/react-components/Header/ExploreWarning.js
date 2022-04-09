import React from "react";
import {withRouter, Redirect} from "react-router-dom";

class ExploreWarning extends React.Component {
    render() {
        alert("Please login to view the explore page.");
        return <Redirect to="/"/>;
    }
}

export default withRouter(ExploreWarning);
