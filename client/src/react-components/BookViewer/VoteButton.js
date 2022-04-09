import React from "react";
import '../../style/VoteButton.css'
import upvote from "../../assets/Upvote.png";
import upvoteHover from "../../assets/UpvoteHover.png";
import downvote from "../../assets/Downvote.png";
import downvoteHover from "../../assets/DownvoteHover.png";

class VoteButton extends React.Component {
    state = {
        isHovering: false
    }

    onHover(e) {
        if (e.type === "mouseenter") {
            this.setState({isHovering: true})
        } else {
            this.setState({isHovering: false})
        }
    }

    getSrc() {
        let isHovering = this.state.isHovering;

        if (this.props.lastVote === this.getIncrement()) {
            isHovering = true;
        }

        if (this.props.increment) {
            return isHovering ? upvoteHover : upvote;
        } else {
            return isHovering ? downvoteHover : downvote;
        }
    }

    getIncrement() {
        return this.props.increment ? 1 : -1;
    }

    render() {
        return <img alt="Vote Button" className="voteButton" src={this.getSrc()}
                    onClick={(e) => this.props.incrementVote(this.getIncrement())}
                    onMouseEnter={(e) => this.onHover(e)}
                    onMouseLeave={(e) => this.onHover(e)}/>
    }
}

export default VoteButton;