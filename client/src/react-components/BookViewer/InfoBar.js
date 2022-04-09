import React, {Fragment}  from "react";
import '../../style/InfoBar.css'
import '../../style/DefaultButton.css'
import '../../style/ChapterTable.css'
class InfoBar extends React.Component {
    /**
     * Makes a chapter selector.
     * When choosing a chapter, you get redirected to it.
     * @returns {JSX.Element}
     */
    makeChapterSelector() {
        return <select id="chapterSelect" name="chapter" value={this.props.currChapter}
                       onChange={(event) => this.props.selectChapter(event)}>
            {
                this.props.novelChapters.map((c) =>
                    <option value={c[0]} key={c.chapterNumber}>
                        {c.chapterNumber}
                    </option>)
            }
        </select>
    }

    /**
     * Makes a textbox to enter a comment.
     * @returns {JSX.Element}
     */
    makeCommentTextbox() {
        if (this.props.isAddComment) {
            return <textarea id="textInput" value={this.props.text} onChange={this.props.handleChange}/>
        }
    }

    /**
     * Makes a button to cancel the comment.
     * @returns {JSX.Element}
     */
    makeCancelButton() {
        if (this.props.isAddComment) {
            return <button id="cancelComment" className="slighterTopMargin fullWidth defaultButton"
                           onClick={(e) => this.props.cancelComment(e)}>Cancel</button>
        }
    }

    render() {
        return <div id="infoBar">
            <h2>{this.props.novelName}</h2>

            <hr></hr>

            <img src={this.props.coverImage} alt="Book Cover" className="fullWidth"/>

            <label id="infoText"><strong>Author: </strong><i>{this.props.authorName}</i></label>

            <hr></hr>

            {this.props.isAddComment && <p id={"InfoText"}>Highlight the page and enter a comment!</p>}

            <div className="slighterTopMargin">
                {this.makeCommentTextbox()}

                <button id="addComment" className="slighterTopMargin fullWidth defaultButton"
                        onClick={(e) => this.props.addComment()}>
                    {this.props.isAddComment ? "Submit Comment" : "Add Comment"}
                </button>

                {this.makeCancelButton()}

            <hr></hr>

            <label id="infoText"><strong>Chapter</strong></label>
            
            {this.makeChapterSelector()}
            <hr></hr>
            <span id="chapters-fit">
                <table className='ctable'>
                    <tbody>
                {this.props.novelChapters.map((chapter) => {
                    return (
                    <Fragment>
                        <tr key={chapter._id} className={"cursorGrab1"} onClick={(e) => {this.props.selectChapter(e, chapter.chapterNumber)
                        }}>

                        <th colSpan="2">
                        <b id={"chapterTitle1"}>Chapter {chapter.chapterNumber}: <em>{chapter.chapterTitle}</em></b>
                        </th>
                    
                        </tr>
                        
                        <tr className='preview'>
                            <td id='chapterPreview' colSpan="2">
                                <i id='previewContent'>"
                                    {chapter.chapterContent.slice(0, 50)}..."
                                </i>
                            </td>
                        </tr>
                    
                    </Fragment>
                        
                    )
                })}
                    </tbody>
                </table>
            </span>

                <button id="exitBookView" className="slighterTopMargin fullWidth defaultButton"
                        onClick={(e) => this.props.gotoBookMainPage()}>
                    Exit Book Viewer
                </button>
            </div>
        </div>
    }
}

export default InfoBar;