import React from "react";
import '../../style/ChapterContent.css'

class ChapterContent extends React.Component {
    // The colors to display when hovering or highlighting over a comment.
    addedHighlightColor = "#ffee00"
    hoverHighlightColor = "darkorange"

    /* There are states that the user can be in, which requires different views (due to the way highlighting works).
     * 1.1. Adding a comments, but hasn't HIGHLIGHTED the text yet.
     * 1.2. Adding a comment, but already HIGHLIGHTED the text yet.
     * 2. Hovering over a comment
     * 3. The general case (none of the above), where we just display the highlighted and non-highlighted text.
     */


    /**
     * 1.1. Adding a comments, but hasn't HIGHLIGHTED the text yet.
     * Just display the text with no highlighting, to make it easier to highlight.
     * @param text The chapter text to be displayed.
     * @returns {JSX.Element}
     */
    onAddingHighlight(text) {
        return <span className={"highlight"}
                     onMouseUp={(e) => this.props.handleSelection(e)}
                     onMouseDown={(e) => this.props.handleSelection(e)}>
                {text}
        </span>
    }

    /**
     * 1.2. Adding a comment, but already HIGHLIGHTED the text yet.
     * Display the highlighted text.
     * @param text The chapter text to be displayed.
     * @returns {JSX.Element}
     */
    onAddedHighlight(text) {
        // Determines the text BEFORE, DURING and AFTER the highlighting.
        // Uses a highlighted span to display the highlighted and non-highlighted sections.
        const before = text.substring(0, this.props.start);
        const during = text.substring(this.props.start, this.props.end);
        const after = text.substring(this.props.end, text.length);

        // The before and after aren't highlighted. The during is the highlighted section.
        return <span className={"highlight"}
                     onMouseUp={(e) => this.props.handleSelection(e)}
                     onMouseDown={(e) => this.props.handleSelection(e)}>
                {before}
            <span className={"highlight"} style={{backgroundColor: this.addedHighlightColor}}>
                {during}
            </span>
            {after}
            </span>
    }

    /**
     * 2. Hovering over a comment
     * Display the highlighted section with a different color, and REMOVE ALL OTHER HIGHLIGHTS.
     * This helps the user track where the comment is highlighting (in case there's too many comments).
     * @param text The chapter text to be displayed.
     * @returns {JSX.Element}
     */
    onHoveringHighlight(text) {
        // Finds the comment that is being hovered over.
        const index = this.props.comment.findIndex((h) => {
            return h._id === this.props.hoverId
        })

        const comment = this.props.comment[index]

        // Calculates the before/during/after (see above for detailed explaination).
        let {start, end} = comment;
        const before = text.substring(0, start);
        const during = text.substring(start, end);
        const after = text.substring(end, text.length);

        return <span className={"highlight"}>
                {before}
            <span className={"highlight"} style={{backgroundColor: this.hoverHighlightColor}}>
                {during}
            </span>
            {after}
            </span>
    }

    /**
     *
     * @param text
     * @param offset
     * @param comment
     * @returns {{newOffset, newText: string, newAfter: string, highlightComp: JSX.Element}}
     */
    handleUpdateHighlight(text, offset, comment) {
        let {_id, start, end, color} = comment;

        // We have already removed the first <offset> character of the text by the current update.
        // Reduces the start by the offset to re-align the start/end with the text.
        start -= offset;
        end -= offset;

        // Calculates the before/during/after (see above for detailed explaination).
        const before = text.substring(0, start);
        const during = text.substring(start, end);
        const after = text.substring(end, text.length);

        // Removes everything up to the highlighted section and updates the offset.
        text = after;
        offset += end;

        // The same as above.
        const highlightComp = (<span className={"highlight"} key={"highlight" + _id}>{before}
            <span className={"highlight"} style={{backgroundColor: color}}
                  onMouseEnter={(e) => this.props.handleHighlight(e, _id)}
                  onMouseLeave={(e) => this.props.handleHighlight(e, _id)}>
            {during}
                </span>
                </span>)

        return {newText: text, newOffset: offset, newAfter: after, highlightComp}
    }

    render() {
        // The text is the text to be displayed.
        // The offset is the number of words from the start of the chapter.
        let text = this.props.getCurrChapterInfo() ? this.props.getCurrChapterInfo().chapterContent : null;
        let offset = 0;

        /*
         * The text is split up into BEFORE the highlight, (DURING) the highlight itself and AFTER the highlight
         * We look at highlights sequentially starting from the start of the chapter to the end.
         * After is the text AFTER the CURRENT highlight.
         */
        let after = "";

        // Runs the function depending on the state.
        if (this.props.isAddComment) {
            if (this.props.isHighlighted) {
                return this.onAddedHighlight(text)
            }

            return this.onAddingHighlight(text)
        }

        if (this.props.isHoverComment) {
            return this.onHoveringHighlight(text)
        }

        // Special case: There are no highlights.
        // Just display the text.
        if (this.props.highlight.length === 0) {
            return (<span className={"highlight"}>{text}</span>)
        }

        /*
         * The general case, where you just display the highlights on the screen.
         * We look at highlights sequentially starting from the start of the chapter to the end.
         *
         * Text is the remaining text to be displayed.
         * Offset is the number of characters since the start of the chapter.
         * After is the text AFTER the CURRENT highlight.
         *
         * We calculate these values with the function, and also return the component to display.
         * This component displays everything UP TO the current mapped highlight (the BEFORE and DURING).
         * Everything remaining will be stored in AFTER and will be displayed after all highlights.
         */
        return (<span className={"highlight"}>
                {
                    this.props.highlight.map((c) => {
                        const {
                            newText,
                            newOffset,
                            newAfter,
                            highlightComp
                        } = this.handleUpdateHighlight(text, offset, c);

                        text = newText;
                        offset = newOffset;
                        after = newAfter;

                        return highlightComp;
                    })
                }
            {after}
            </span>)
    }
}

export default ChapterContent;