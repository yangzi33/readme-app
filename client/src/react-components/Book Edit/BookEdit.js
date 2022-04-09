import React from 'react';
import {withRouter} from 'react-router-dom';
import Header from '../Header/Header'
import '../../style/BookMainPage.css'
import '../../style/BookEdit.css'
import '../../style/DefaultButton.css'

import Cookies from "js-cookie";
import {BACKEND_URL} from "../../actions/Utils";

class BookEdit extends React.Component {
    state = {
        user: Cookies.get("username"),
        user_id: Cookies.get("user_id"),
        // See BookViewer for explaination
        novelName: '',
        novelSummary: '',
        novelTags: [],
        novelChapters: [{
            chapterNumber: 1,
            chapterTitle: "",
            chapterContent: "",
            comments: [],
            highlights: []
        }],

        // The text of the newTag and the currentTag's id (increment by 1 for each tag).
        newtag: "",

        coverImage: "/assets/defaultBookCover.png",
        file: null
    }

    componentDidMount() {
        let book_id = null;

        if (this.props.location.search.startsWith("?bookid="))
            book_id = this.props.location.search.replace("?bookid=", "")

        this.setState({book_id: book_id})

        if (book_id) {
            fetch(`${BACKEND_URL}/api/book/${book_id}`, {
                credentials: "include"
            }).then(response => {
                return response.json()
            })
                .then(currBook => {
                    this.setState({novelName: currBook.bookTitle})
                    this.setState({novelSummary: currBook.summary})
                    this.setState({novelTags: currBook.tags});
                    this.setState({novelChapters: currBook.chapters})
                    this.setState({coverImage: currBook.coverUrl});
                })
        }
    };

    // For setArrayState
    CHAPTER_NAME = 1
    CHAPTER_CONTENT = 2

    // INDEXED AT 1
    // Sets the value of a single index of the chapter name or state.
    setArrayState(e, state, index, type) {
        const novelChapters = this.state.novelChapters;

        if (type === this.CHAPTER_NAME)
            novelChapters[index].chapterTitle = e.target.value;
        else
            novelChapters[index].chapterContent = e.target.value;

        this.setState({novelChapters: novelChapters})
    }

    /*
     * Renders the list of chapters as a textbook and input field.
     * Allows you to enter the chapter title and contents.
     */
    renderChapterList() {
        // Phase 2: Should retrieve from database.
        return <div id={"chapterlist"}>
            <div id={"chapter"}>
                {
                    this.state.novelChapters.map((c, index) => {
                        return <div key={"novelChapter"+index}><h2 className={"tinyLeftMargin"}>Chapter {index + 1}: <input
                            value={c.chapterTitle} placeholder="Enter chapter name here"
                            className={"tagentry taginput"} id="chaptername" type={"text"}
                            onChange={(e) => {
                                this.setArrayState(e, "chapterName", index, this.CHAPTER_NAME)
                            }}/></h2>

                            <div id={"chapterListing"}><textarea rows={20} id={"growable"} onChange={(e) => {
                                this.setArrayState(e, "chapterName", index, this.CHAPTER_CONTENT)
                            }} value={c.chapterContent}/>
                            </div>
                        </div>
                    })
                }
            </div>

            <button id="addChapter" className="defaultButton editButton tinyLeftMargin" onClick={(e) => {
                this.state.novelChapters.push({
                    chapterNumber: this.state.novelChapters.length+1,
                    chapterTitle: "",
                    chapterContent: "",
                    comments: [],
                    highlights: []
                })
                this.setState({novelChapters: this.state.novelChapters})
            }
            }>Add Chapter
            </button>
        </div>
    }

    /**
     * Removes a tag (when clicked).
     * @param e The event
     * @param id The tag is to remove.
     */
    removeTag(e, id) {
        // In phase 2, this should be a server call.
        const novelTags = this.state.novelTags.filter((t) => t[2] !== id);
        this.setState({novelTags: novelTags})
    }

    fetchPost(coverUrl) {
        const bookInfo = {
            bookTitle: this.state.novelName,
            coverUrl: coverUrl,
            author_id: this.state.user_id,
            chapters: this.state.novelChapters,
            summary: this.state.novelSummary,
            avgScore: 0,
            kudos: 0,
            follows: [],
            tags: this.state.novelTags
        }

        fetch(`${BACKEND_URL}/api/book/`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify(bookInfo),
                credentials: "include"
            }).then(response => {
            if (response.status === 200) {
                return response.json()
            } else {
                return Promise.reject(response.text())
            }})
            .then(book => {
                const upload = {
                    upload: book._id
                }
                fetch(`${BACKEND_URL}/api/uploads/${this.state.user_id}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST", credentials: "include",
                    body: JSON.stringify(upload)
                }).then(() => {
                    this.props.history.push(`/book/${book._id}`)
                })             
            })
            .catch(err => {
                err.then(errMsg => window.alert(errMsg))
            })
    }


    fetchPatch(coverImage) {
        const bookInfo =
            {
                novelName: this.state.novelName,
                coverUrl: coverImage,
                chapters: this.state.novelChapters,
                summary: this.state.novelSummary,
                tags: this.state.novelTags,
            }
        

            if (!bookInfo.novelName || !bookInfo.summary) {
                window.alert("You must enter a title and summary.")
                return
            }

        if (!bookInfo.chapters) {
            window.alert("You must include at least one chapter")
            return;
        } else {
            let error = false;

            bookInfo.chapters.forEach(c => {
                if (!c.chapterTitle || !c.chapterContent) {
                    window.alert("All chapters must have title and content.")
                    error = true;
                }
            })

            if (error) {
                return;
            }
        }

        fetch(`${BACKEND_URL}/api/book/${this.state.book_id}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "PATCH",
                body: JSON.stringify(bookInfo),
                credentials: "include"
            }).then(response => {
            if (response.status === 200) {
                return response.json()
            } else {
                return Promise.reject(response.text())
            }})
            .then(book => {
                this.props.history.push(`/book/${this.state.book_id}`)
            })
            .catch(err => {
                err.then(errMsg => window.alert(errMsg))
            })
    }

    /**
     * Redirects to book main page.
     */
    redirectBook() {
        // This data should be a server call, to update the book's contents.

        if (this.state.file) {
            const formData  = new FormData();

            formData.append("img", this.state.file);

            fetch(`${BACKEND_URL}/api/images")}`, {
                method: "POST",
                body: formData,
                credentials: "include"
            }).then(response => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    return Promise.reject(response.text())
                }})
                .then(data => {
                    if (this.props.history.location.state && this.props.history.location.state.publish) {
                        this.fetchPost(data.image_url)
                    } else {
                        this.fetchPatch(data.image_url)
                    }
                })
                .catch(err => {
                err.then(errMsg => window.alert(errMsg))
            })
        } else {
            if (this.props.history.location.state && this.props.history.location.state.publish) {
                this.fetchPost(this.state.coverImage)
            } else {
                this.fetchPatch(this.state.coverImage)
            }
        }
    }

    render() {
        return (
            <div id='main'>
                <Header user={this.state.user}/>
                <div className='content'>
                    <h1><div id='novelTitle'>
                        <strong>
                        <input value={this.state.novelName} placeholder={"Enter your title here"} id="chaptername" className={"boldable"} type={"text"}
                            onChange={(e) =>
                                this.setState({novelName: e.target.value})} />
                        </strong>
                    </div>
                    </h1>

                    <div className='row minHeightRow'>
                        <img id="BookCover2" alt="Book Cover" src={this.state.coverImage}/>

                        <div id='summaryEdit'>
                            <textarea id="growable" value={this.state.novelSummary} placeholder={"Enter your summary here"}
                               onChange={(e) =>
                                   this.setState({novelSummary: e.target.value})}/>
                        </div>


                    </div>
                    <br/>
                    <div className='row'>
                        <div><label id="uploadText">Upload Book Cover</label><input
                            type="file"
                            onChange={(event) => {
                                this.setState({file: event.target.files[0], coverImage: URL.createObjectURL(event.target.files[0])});
                            }}
                        /></div>

                        <ul id='tags'>
                            {this.state.novelTags.map((tag, index) => {
                                return (
                                    <li key={"tag"+index} onClick={(e) => this.removeTag(e, tag[2])}
                                        className={"tagentry hoverable"}>
                                        #{tag}
                                    </li>)
                            })}
                            {
                                <li className={"tagentry gray"}><span>#
                                    <input value={this.state.newtag} className={"tagentry taginput"}
                                           placeholder="Add tags here!" id="newtag"
                                           onChange={(e) => {
                                               this.setState({newtag: e.target.value})
                                           }
                                           }

                                           onKeyUp={(e) => {
                                               if (e.key === 'Enter' || e.keyCode === 13) {
                                                   this.state.novelTags.push(this.state.newtag)
                                                   this.setState({
                                                       newtag: "",
                                                       novelTags: this.state.novelTags
                                                   })
                                               }
                                           }} type={"text"}/></span></li>
                            }
                        </ul>
                    </div>
                </div>
                <div id="maincomponent">
                {this.renderChapterList()}
                <button id="submitChapter" className="defaultButton editButton tinyLeftMargin"
                        onClick={(e) => this.redirectBook()}>
                    Submit
                </button>
                </div>
            </div>
        )
    }
}

export default withRouter(BookEdit);