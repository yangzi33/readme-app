import React from "react";
import '../../style/warning.css'

class Warning extends React.Component {
    state = {
        message: '',
        custom: '',
        emptymessagenotice: ''
    }

    // some automatic message choices for common misconducts
    generateMessage(choice) {
        if (choice === "ic") {
            this.setState({message: "Inappropriate Content \n\n It contains one of the following: \n1. Explicit Content, \n2. Hateful Content, \n3. Content that threatens the safety of others."});

        } else if (choice === "Spam") {
            this.setState({message: "Spam \n\n Your content consists of one of the following: \n1. Repeated Messages, \n2. Messages with the express purpose of marketing, \n3. Unrelated Content"});

        } else if (choice === "Plagiarism") {
            this.setState({message: "Plagiarism \n\n Your content plagiarises the work of other users or contains work from a copyrighted piece of literature without consent from the author"});

        }
        // if you choose other you need to enter a custom message
        else if (choice === "Other") {
            this.setState({message: ''});
        }
    }

    // change text fields 
    handleChange(event) {
        const target = event.target;
        const value = target.value;

        this.setState({custom: value});

    }


    render() {
        // Tells the server to send a message from current user to the target user.
        // Needs to know the target user, current user, type of comment and the message to send.
        // Then the server will give the message to them.
        // Alternatively, we may use an email messaging system. In which case, we'll send to an email instead.
        // Currently undecided.
        var sendMessage = () => {
            // don't allow empty messages to be sent
            if (this.state.message === '' && this.state.custom === '') {
                this.setState({emptymessagenotice: "Please choose an automatic message or add a custom message"});
            } else {
                // if this isn't a warning, call the ban/remove function passed in props
                if (this.props.func !== null) {
                    this.props.func();
                }
                // close this popup
                this.props.handleClose();
            }
        }
        return (
            <div className="popup-box">
                <div className="box">
                    <span className="close-icon" onClick={this.props.handleClose}>x</span>
                    <h2>Reason for {this.props.func == null ? "Warning" : "Removal"}?</h2>
                    <div className="row" id="choices">
                        <button className="defaultButton" onClick={() => this.generateMessage("ic")}>Inappropriate
                            Content
                        </button>
                        <button className="defaultButton" onClick={() => this.generateMessage("Spam")}>Spam</button>
                        <button className="defaultButton"
                                onClick={() => this.generateMessage("Plagiarism")}>Plagiarism
                        </button>
                        <button className="defaultButton" onClick={() => this.generateMessage("Other")}>Other</button>
                    </div>
                    Automatic Message
                    <div id="autoMessage">
                        <h3>Message from the admins</h3>
                        <p>Your {this.props.type} has been removed because: </p>
                        <p>{this.state.message}</p>
                    </div>

                    Add Custom Message
                    <textarea id="customMessage" rows={5} value={this.state.custom} onChange={(e) => {
                        this.handleChange(e)
                    }}></textarea>
                    <i><p id="remember">{this.state.emptymessagenotice}</p></i>
                    <button className="defaultButton" onClick={() => sendMessage()}>Send</button>
                </div>

            </div>
        )
    }
}

export default Warning;