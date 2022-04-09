import React from "react";
import {withRouter} from "react-router-dom";
import Header from "../Header/Header";
import "../../style/BookViewer.css";
import "../../style/Alignment.css";
import "../../style/DefaultButton.css";
import CommentList from "./CommentList";
import InfoBar from "./InfoBar";
import ChapterContent from "./ChapterContent";
import {authFetch, BACKEND_URL} from "../../actions/Utils";


import Cookies from "js-cookie";

const COMMENT_COLOR = "#F8DF78"
const HIGHLIGHT_COMMENT_COLOR = "darkorange"
const HIGHLIGHT_COLOR = "#fffe00"

function getBookId(url) {
    const start = url.indexOf("/book")+"/book".length+1
    const end = url.lastIndexOf("/view")

    // Should replace with regex

    const book_id = url.substring(start, end)

    if (book_id) {
        return book_id;
    }

    return null;
}

class BookViewer extends React.Component {
    state = {
        // The user that is currently logged in (or null if not logged in)
        user: "User",

        book_id: getBookId(window.location.pathname),


        // The current chapter we're viewing
        // List of ALL chapters, format: List(Obj(chapterNumber, title, contents))
        currChapter: 1,
        novelChapters: [],

        novelName: null,
        authorName: null,
        coverImage: null,

        // Assume all highlights are disjoint and must be SORTED by start position.
        // comment: List(Obj(id, start, profilePic, vote))
        // highlight: List(Obj(id, start, end, comment_ids, color)
        // Comments_ids corresponds a list of comment ids.
        comment: [],
        highlight: [],
        numComments: 0,
        numHighlights: 0,

        // States when adding comments, highlighting a section, hovering over a comment.
        isAddComment: false,
        isHighlighted: false,
        isHoverComment: false,

        // Id of comment when hovering over it.
        hoverId: -1,

        // Text of textbox.
        text: "",

        // The start and ending characters when highlighting text.
        start: -1,
        end: -1,
    };

    updateComments() {

    }

    componentDidMount() {
        let currChapter = 1;

        if (this.props.location.search.startsWith("?start="))
            currChapter = parseInt(this.props.location.search.replace("?start=", ""))

        if (isNaN(currChapter) || isNaN(parseFloat(currChapter))) {
            currChapter = 1
        }

        authFetch(this, `${BACKEND_URL}/api/book/${this.state.book_id}`)
            .then(data => {
                const chapterId = data.chapters[currChapter-1]._id;

                authFetch(this, `${BACKEND_URL}/api/user/${data.author_id}`)
                    .then(data2 => {
                        this.setState({
                            authorName: data2.username,
                        })
                    })

                authFetch(this, `${BACKEND_URL}/api/comment/${this.state.book_id}/${chapterId}`)
                    .then(data3 => {
                        const {comments, highlights} = data3;

                        this.setState({
                            comment: comments.sort((a, b) => (a.vote <= b.vote ? 1 : -1)),
                            highlight: highlights,
                            numComments: comments.length,
                            numHighlights: highlights.length,
                        })
                    })

                // Displays the book information
                this.setState({
                    currChapter: currChapter, //Change with parameter in URL
                    novelChapters: data.chapters,
                    novelName: data.bookTitle,
                    coverImage: data.coverUrl
                })

                this.updateComments();
            });
    }

    /**
     * When hovering over a comment.
     * Change the state to hoveringComment.
     * Change the color to red when hovering over, yellow when no longer hovering over.
     * @param event The event
     * @param id The id of the comment
     */
    handleHoverComment(event, id) {
        if (this.state.isAddComment) {
            return;
        }

        const index = this.state.comment.findIndex((c) => {
            return c._id === id;
        });

        let comment = this.state.comment;
        let isHoverComment;

        if (event.type === "mouseenter") {
            comment[index].commentColor = HIGHLIGHT_COMMENT_COLOR;
            isHoverComment = true;
        } else {
            comment[index].commentColor = COMMENT_COLOR;
            isHoverComment = false;
        }
        this.setState({
            comment: comment,
            hoverId: id,
            isHoverComment: isHoverComment,
        });
    }

    /**
     * Updates the field with the component value.
     * @param event The event.
     * @param fieldName The field to update.
     */
    handleChange(event, fieldName) {
        const target = event.target;
        const value = target.value;

        this.setState({[fieldName]: value});
    }

    /**
     * Increments the number of votes for the comment by 1.
     * @param id The comment id
     * @param value The amount to increment by
     */
    incrementVote(id, value) {
        const voteInfo = {
            vote: value
        }

        const prevIndex = this.state.comment.findIndex((c) => {
            return c._id === id;
        });

        const chapterId = this.getCurrChapterInfo()._id;

        authFetch(this, `${BACKEND_URL}/api/vote/${this.state.book_id}/${chapterId}/${id}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(voteInfo)
        }).then((data)=>{
            const sortedComment = data.comments.sort((a, b) => (a.vote <= b.vote ? 1 : -1));

            const sortedIndex = sortedComment.findIndex((c) => {
                return c._id === id;
            });

            let isHoverComment = this.props.isHoverComment;

            // We won't register mouseLeave if it moves to another location.
            // So we manually update color back to yellow.
            if (prevIndex !== sortedIndex) {
                data.comments[sortedIndex].commentColor = COMMENT_COLOR;
                isHoverComment = false;
            }

            this.setState({comment: sortedComment, isHoverComment: isHoverComment});
        })
    }

    /**
     * When hovering over a HIGHLIGHTED SECTION.
     * Changes the color of the section AND the corresponding comments.
     * @param event The event.
     * @param fieldName The field to update.
     */
    handleHighlight(event, id) {
        // We need to pass the comments and return the highlights.
        const highlight = this.state.highlight;
        const index = highlight.findIndex((h) => {
            return h._id === id;
        });

        if (index < 0) return;

        const comment_ids = highlight[index].comment_ids;

        let highlightColor = HIGHLIGHT_COLOR;
        let commentColor = COMMENT_COLOR;

        if (event.type === "mouseenter") {
            highlightColor = HIGHLIGHT_COMMENT_COLOR;
            commentColor = HIGHLIGHT_COMMENT_COLOR;
        }

        // All of these color changes should be done in the server side.
        // We will then get back the result.
        // Changes the color of the highlight.
        highlight[index].color = highlightColor;

        // Changes the color of each comment.
        const comments = this.state.comment.map((c) => {
            if (comment_ids.includes(c._id)) {
                c.commentColor = commentColor;
            }
            return c;
        });

        this.setState({highlight: highlight, comment: comments});
    }

    /**
     * Handles when the user selects a portion of the chapter text to make a highlight.
     * @param event
     */
    handleSelection(event) {
        if (event.type === "mouseup") {
            // Gets the start and end location of the selection.
            const selection = window.getSelection();
            let start = selection.anchorOffset;
            let end = selection.focusOffset;

            // Selection is INVALID in these states, so cancel it.
            if (start === end || this.state.isHighlighted) {
                return;
            }

            // Ensures start < end.
            if (start > end) {
                const temp = start;
                start = end;
                end = temp;
            }

            this.setState({start: start, end: end, isHighlighted: true});
        } else if (event.type === "mousedown") {
            // Cancels the selection.
            this.setState({start: -1, end: -1, isHighlighted: false});
        }
    }

    /**
     * Adds a comment.
     * If the highlight overlaps with another existing one, then combines them
     */
    addComment() {
        // We need to give them all of the data in comment.push
        // The server will store the data and merge it similar to below.
        if (!this.state.isAddComment) {
            this.setState({isAddComment: true});
        } else {
            // Creates the comment.
            const newComment = {
                comment:
                    {
                        start: this.state.start,
                        end: this.state.end,
                        commentContent: this.state.text,
                    }
            }

            const chapterId = this.getCurrChapterInfo()._id;

            authFetch(this, `${BACKEND_URL}/api/comment/${this.state.book_id}/${chapterId}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify(newComment)
                })
                .then(data => {
                    this.setState({
                        start: -1,
                        end: -1,
                        comment: data.comments.sort((a, b) => (a.vote <= b.vote ? 1 : -1)),
                        highlight: data.highlights,
                        numComments: data.comments.length,
                        numHighlights: data.highlights.length,
                        isHighlighted: false,
                        isAddComment: false,
                        text: "",
                    });
                }).catch(error => {
                error.then(errMsg => window.alert(errMsg))
            })
        }
    }

    /**
     * Redirects to the book main page.
     */
    gotoBookMainPage() {
        this.props.history.push(`/book/${this.state.book_id}`, {
            user: Cookies.get("username"),
            novelName: this.state.novelName,
            novelSummary: this.state.novelSummary,
            novelTags: this.state.novelTags,
            novelChapters: this.state.novelChapters,
            coverImage: this.state.coverImage,
            authorName: this.state.authorName,
            authorPic: this.state.authorPic,
        });
    }

    /**
     * Updates the current displayed chapter.
     * @param event The event.
     */
    selectChapter(event, chapterNum=null) {
        if(!(chapterNum===null)){
            this.setState({
                currChapter: chapterNum,
                comment: [],
                highlights: [],
            }, () => this.resetPage())
        }
        else{
            this.setState({
            currChapter: parseInt(event.target.value),
            comment: [],
            highlights: [],
        }, () => this.resetPage())}
        
    }

    /**
     * Resets the states.
     */
    resetPage() {
        this.setState({
            isHighlighted: false,
            isAddComment: false,
        });

        const chapterId = this.getCurrChapterInfo()._id;

        authFetch(this, `${BACKEND_URL}/api/comment/${this.state.book_id}/${chapterId}`)
            .then(data3 => {
                this.setState({
                    comment: data3.comments.sort((a, b) => (a.vote <= b.vote ? 1 : -1)),
                    highlight: data3.highlights,
                    isHoverComment: false,
                })
            })
    }

    /**
     * Gets the chapter info for the current chapter.
     * @returns {*}
     */
    getCurrChapterInfo() {
        const currChapter = this.state.currChapter;

        return this.state.novelChapters[currChapter - 1];
    }

    /**
     * Removes a comment.
     * Can only be used by an admin.
     * @param e The event
     * @param id The id of the comment
     */
    removeComment(e, id) {
        const chapterId = this.getCurrChapterInfo()._id;
        
        authFetch(this, `${BACKEND_URL}/api/comment/${this.state.book_id}/${chapterId}/${id}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "DELETE"})
            .then(data3 => {
                this.setState({
                    comment: data3.comments,
                    highlight: data3.highlights,
                    isHoverComment: false,
                })
            })
    }

    /**
     * Cancels adding a comment.
     */
    cancelComment() {
        this.setState({isAddComment: false});
    }

    render() {
        return (
            <div id="bookViewBackground">
                <Header/>
                    <div className="alignVerticalCenter">
                        <InfoBar
                            currChapter={this.state.currChapter}
                            novelChapters={this.state.novelChapters}
                            novelName={this.state.novelName}
                            authorName={this.state.authorName}
                            coverImage={this.state.coverImage}
                            text={this.state.text}
                            isAddComment={this.state.isAddComment}
                            addComment={(e) => this.addComment()}
                            cancelComment={(e) => this.cancelComment()}
                            selectChapter={(e, chapterNum) => this.selectChapter(e, chapterNum)}
                            gotoBookMainPage={() => this.gotoBookMainPage()}
                            handleChange={(event) => this.handleChange(event, "text")}
                        />

                        <div id="page" className="blackBorder slightlyTransparent">
                            <div className="alignVerticalCenter">
                                <h1 className="alignAllCenter">
                                    Chapter {this.state.currChapter}: {this.getCurrChapterInfo() ? this.getCurrChapterInfo().chapterTitle : null}
                                </h1>
                            </div>

                            <hr></hr>

                            <div id="chapterContent">
                                <ChapterContent
                                    handleSelection={(e) => this.handleSelection(e)}
                                    handleHighlight={(e, id) => this.handleHighlight(e, id)}
                                    getCurrChapterInfo={() => this.getCurrChapterInfo()}
                                    isAddComment={this.state.isAddComment}
                                    isHighlighted={this.state.isHighlighted}
                                    isHoverComment={this.state.isHoverComment}
                                    comment={this.state.comment}
                                    highlight={this.state.highlight}
                                    hoverId={this.state.hoverId}
                                    start={this.state.start}
                                    end={this.state.end}
                                />
                            </div>

                            <button
                                id="nextChapter"
                                className="defaultButton"
                                onClick={(event) => {
                                    if (this.state.currChapter < this.state.novelChapters.length) {
                                        this.setState({currChapter: this.state.currChapter + 1}, () => this.resetPage())
                                    } else {
                                        this.gotoBookMainPage();
                                    }
                                }}
                            >
                                Next Chapter
                            </button>
                        </div>
                        <CommentList
                            user={this.state.user}
                            comment={this.state.comment}
                            handleHoverComment={(e, id) => this.handleHoverComment(e, id)}
                            removeComment={(e, id) => this.removeComment(e, id)}
                            incrementVote={(id, inc) => this.incrementVote(id, inc)}
                        />
                    </div>
            </div>
        );
    }
}

export default withRouter(BookViewer);
