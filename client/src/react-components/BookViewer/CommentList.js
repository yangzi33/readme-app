import React from "react";
import {formatUser} from "../../actions/Utils";
import '../../style/CommentList.css'
import '../../style/Alignment.css'
import '../../style/VoteButton.css'
import userpic from "../../assets/Profile.png";
import adminpic from "../../assets/Admin.png";
import VoteButton from "./VoteButton";

class CommentList extends React.Component {
    getProfilePic() {
        return this.props.user === "admin" ? adminpic : userpic;
    }

    // We format the username to capitalize the first letter.
    // On hovering over the comments, highlights the section in the chapter text.
    // ADMINS CAN REMOVE COMMENTS.
    render() {
        return (<div id="commentList">
            {this.props.comment.map((comment) => {
                const {_id, username, profilePicUrl, commentContent, commentColor, vote, lastVote, removable} = comment;

                return (<div className="comment"
                             onMouseEnter={(e) => this.props.handleHoverComment(e, _id)}
                             onMouseLeave={(e) => this.props.handleHoverComment(e, _id)}
                             style={{backgroundColor: commentColor}} key={"comment" + _id}>
                    <div className="alignHorizontalCenter">
                        <img className="userLogo" alt="User profile" src={profilePicUrl}/>
                        <label className="commentUser"><i>{formatUser(username)}</i></label>
                    </div>

                    <p className="newLine">{commentContent}</p>

                    <div className="alignAllCenter">
                        <VoteButton lastVote={lastVote} increment={false}
                                    incrementVote={(inc) => this.props.incrementVote(_id, inc)}/>
                        <label id="voteText">Votes: {vote}</label>
                        <VoteButton lastVote={lastVote} increment={true}
                                    incrementVote={(inc) => this.props.incrementVote(_id, inc)}/>
                    </div>

                    <div className="alignVerticalCenter">
                        {
                            removable &&
                            <button className="removeComment"
                                    onClick={(e) => this.props.removeComment(e, _id)}>
                                Remove
                            </button>
                        }
                    </div>
                </div>)
            })}

        </div>)
    }
}

export default CommentList;