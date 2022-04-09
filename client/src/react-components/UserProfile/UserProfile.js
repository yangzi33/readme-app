import React from 'react';
import Header from '../Header/Header';
import '../../style/UserProfile.css'
import BookList from "./BookList";
import Followings from "./Followings";
import Followers from "./Followers.js";
import Uploads from "./Uploads";
import logoutButton from '../../assets/logout button.png'
import {withRouter} from "react-router-dom";
import userpic from "../../assets/Profile.png";
import adminpic from "../../assets/Admin.png";
import {formatUser} from "../../actions/Utils";
import Cookies from 'js-cookie';
import {BACKEND_URL} from "../../actions/Utils";

class UserProfile extends React.Component {
    state = {
        user: Cookies.get("username"),
        user_id: Cookies.get("user_id"),
        icon: userpic,
        kudos: 0,
        avg: 0,
        date: "No published books",
        upvotes: 0,
        show: 1,
        followers: [],
        followings: [],
        books: [],
        uploads: [],
        isAdmin: false,
        summary: ""
    }
   
    
    // set the icon picture to the corresponding user
    getIcon() {
        if (this.state.isAdmin) {
            return adminpic;
        } else {
            return this.state.icon;
        }
    }
    // when the profile state bar is clicked, it change the state of show to
    //decide which lists to be shown
    handleClick(event, id) {
        if (id === 1) {
            this.setState({show: 2});

        }
        if (id === 2) {
            this.setState({show: 3});
        }
        if (id === 3) {
            this.setState({show: 4});
        }
        if (id === 4) {
            this.setState({show: 1});

        }

    }
    //fetch a user through the id
    getUserById(id){
        fetch(`${BACKEND_URL}/api/user/${id}`, 
        {method: "get", credentials: "include"}).then(res => {
            if(res.status === 200){
                res.json();
            }
            else{
                console.log("Fail to fetch user")
            }
        }).then(json => {
            return json.username
        })
    }
    //Give the option of updting icon
    renderUpload() {
        return <div><label id="uploadText">Upload Icon:</label><input
            type="file"
            onChange={(event) => {
                const formData  = new FormData();

                formData.append("img", event.target.files[0]);

                fetch(`${BACKEND_URL}/api/images")}`, {
                    method: "POST",
                    body: formData,
                    credentials: "include"
                }).then(response => response.json())
                    .then(data => {
                        const imageInfo = { profilePicUrl: data.image_url }
                        fetch(`${BACKEND_URL}/api/update-user/${Cookies.get("user_id")}`, {
                            method: "PATCH",
                            body: JSON.stringify(imageInfo),
                            headers: {
                                Accept: "application/json, text/plain, */*",
                                "Content-Type": "application/json"
                            },
                            credentials: "include"
                        }).then(response => response.json())
                            .then(data2 => {
                                this.setState({icon: data.image_url})
                                Cookies.set("userpic", data.image_url)
                            })
                    })
            }}
        /></div>
    }

    

    componentDidMount(){
        fetch(`${BACKEND_URL}/api/user/${this.state.user_id}`,
            {method: "get", credentials: "include"}).then(response => {
            if(response.status === 200){
                return response.json();
            }
            else{
                console.log("Fail to fetch user")
                return Promise.reject(response.text())
            }
        }).then(json => {
            this.setState({isAdmin: json.isAdmin})
        })
        fetch(`${BACKEND_URL}/api/votes/${this.state.user_id}`,
        {method: "get", credentials: "include"}).then(response => {
            if(response.status === 200){
                return response.json();
            }
            else{
                console.log("Fail to fetch user")
                return Promise.reject(response.text())
            }
        }).then(json => {this.setState({upvotes: json.upvotes})})
        
        fetch(`${BACKEND_URL}/api/user/${this.state.user_id}`,
            {method: "get", credentials: "include"}).then(response => {
            if(response.status === 200){
                return response.json();
            }
            else{
                console.log("Fail to fetch user")
                return Promise.reject(response.text())
            }
        }).then(json => {
            this.setState({icon: json.profilePicUrl, summary: json.summary, isAdmin: json.isAdmin})

            const followerList = []

        //    this.setState({show: 2})

            for(let i = 0; i < json.followers.length; i++){
                let temp_id = json.followers[i];
                fetch(`${BACKEND_URL}/api/user/${temp_id}`,
                    {method: "get", credentials: "include"}).then(response => {
                    if(response.status === 200){
                        return response.json();
                    }
                    else{
                        console.log("Fail to fetch user")
                        return Promise.reject(response.text())
                    }
                }).then(json => {
                    const user_info = {
                        id: json._id,
                        name: json.username,
                        icon: json.profilePicUrl
                    }

                    followerList.push(user_info)

                    this.setState({followers: followerList})
                })
            }
        })
        fetch(`${BACKEND_URL}/api/user/${this.state.user_id}`,
            {method: "get", credentials: "include"}).then(response => {
            if(response.status === 200){
                return response.json();
            }
            else{
                console.log("Fail to fetch user")
                return Promise.reject(response.text())
            }
        }).then(json => {
            const followingList = []

        //    this.setState({show: 2})

            for(let i = 0; i < json.followings.length; i++){
                let temp_id = json.followings[i];
                fetch(`${BACKEND_URL}/api/user/${temp_id}`,
                    {method: "get", credentials: "include"}).then(response => {
                    if(response.status === 200){
                        return response.json();
                    }
                    else{
                        console.log("Fail to fetch user")
                        return Promise.reject(response.text())
                    }
                }).then(json => {
                    const user_info = {
                        id: json._id,
                        name: json.username,
                        icon: json.profilePicUrl
                    }

                    followingList.push(user_info)

                    this.setState({followings: followingList})
                })
            }
        })
        fetch(`${BACKEND_URL}/api/user/${this.state.user_id}`,
            {method: "get", credentials: "include"}).then(response => {
            if(response.status === 200){
                return response.json();
            }
            else{
                console.log("Fail to fetch user")
                return Promise.reject(response.text())
            }
        }).then(json => {
            const bookList = []

        //    this.setState({show: 2})

            for(let i = 0; i < json.books.length; i++){
                let temp_id = json.books[i];
                fetch(`${BACKEND_URL}/api/book/${temp_id}`,
                    {method: "get", credentials: "include"}).then(response => {
                    if(response.status === 200){
                        return response.json();
                    }
                    else{
                        console.log("Fail to fetch book")
                        return Promise.reject(response.text())
                    }
                }).then(json => {
                    fetch(`${BACKEND_URL}/api/user/${json.author_id}`,
                    {method: "get", credentials: "include"}).then(response => {
                    if(response.status === 200){
                        return response.json();
                    }
                    else{
                        console.log("Fail to fetch user")
                        return Promise.reject(response.text())
                        }
                    }).then((user) => {
                    const user_info = {
                        id: json._id,
                        name: json.bookTitle,
                        author: user.username,
                        bookCoverPath: json.coverUrl
                    }

                    bookList.push(user_info)

                    this.setState({books: bookList})
                })
            })
        }
    })
        fetch(`${BACKEND_URL}/api/user/${this.state.user_id}`,
            {method: "get", credentials: "include"}).then(response => {
            if(response.status === 200){
                return response.json();
            }
            else{
                console.log("Fail to fetch user")
                return Promise.reject(response.text())
            }
        }).then(json => {
            const uploadList = []
            let kudos = 0
            let avg = 0
            let num = 1
           
            let date = ""
        //    this.setState({show: 2})

            for(let i = 0; i < json.uploads.length; i++){
                let temp_id = json.uploads[i];
                fetch(`${BACKEND_URL}/api/book/${temp_id}`,
                    {method: "get", credentials: "include"}).then(response => {
                    if(response.status === 200){
                        return response.json();
                    }
                    else{
                        console.log("Fail to fetch book")
                        return Promise.reject(response.text())
                    }
                }).then(json => {
                    const user_info = {
                        id: json._id,
                        name: json.bookTitle,
                        cover: json.coverUrl
                    }

                    uploadList.push(user_info)
                    kudos = kudos + json.kudos
                    num = num + 1
                    avg = (avg + json.avgScore)
                    date = json.publishDate
                    this.setState({uploads: uploadList})
                    this.setState({
                        kudos: kudos,
                        avg: avg/num,
                        date: date
                    })
                })
            }
        })

        
}
/**Show the summary */
renderSummary() {
    if (this.state.editing)
        return <textarea rows="10" className={"newLine"} value={this.state.summary} onChange={(e)=>{
            this.setState({summary: e.target.value})
        }
        }/>
    else
        return <p id="sum">{this.state.summary}</p>

}
/**Give the edit summary button */
renderEdit() {
        if (this.state.editing) {
            return <button onClick={(e) => {
                const summaryInfo = {
                    summary: this.state.summary
                }

                fetch(`${BACKEND_URL}/api/update-user/${Cookies.get("user_id")}`, {
                    method: "PATCH",
                    body: JSON.stringify(summaryInfo),
                    headers: {
                        Accept: "application/json, text/plain, */*",
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                }).then(response => response.json())
                    .then(data => {
                        this.setState({editing: false})
                    })
            }}>Submit</button>
        } else {
            return <button onClick={(e) => {
                if (this.state.editing) {
                    this.setState({editing: false})
                } else {
                    this.setState({editing: true})
                }
            }}>Edit Summary</button>
        }
}
    /*Log out and move to the login page */
    logout(){
        fetch(`${BACKEND_URL}/api/user/logout`, {
            credentials: "include"
        }).then(response => {
            if (response.status === 200) return response.json()
        }).then(users => {
            Cookies.set("username", null)
            Cookies.set("user_id", null)
            Cookies.set("userpic", null)
            this.props.history.push("/");
        }).catch(error =>  window.alert({error}))
    }

    /*Give the notice when the list is empty */
    makeNotice(){
        if(this.state.show === 1 && this.state.books.length === 0){
            return <p>add your books :)</p>
        }
        else if(this.state.show === 2 && this.state.followers.length === 0){
            return <p>be active, more followers</p>
        }
        if(this.state.show === 3 && this.state.followings.length === 0){
            return <p>go find users you like :)</p>
        }
        if(this.state.show === 4 && this.state.uploads.length === 0){
            return <p>upload your work :)</p>
        }
    }
    //give the view of the profile page
    render() {
        const makePanel = () => {
            if (this.state.isAdmin === true) {
                return (<div>
                    <button id="adminRealButton" onClick={() => {
                        this.props.history.push("/adminpanel", {user: this.state.user})
                    }}>
                        Admin Panel
                    </button>
                </div>)
            }
                
            // const currUser = this.getUserById(Cookies.get("user_id"))
            
        }

        let showing;
        //set the list showing section based on show state
        if (this.state.show === 1) {
            showing = <div id='list' className={"blackBorder"}>
                <div className='listHeader'>
                    <h3>
                        BookList (Books I Like):
                    </h3>
                    {this.makeNotice()}
                    <hr/>
                </div>
                {/* <BookDisplay /> */}
                <BookList user={this.state.user} UserProfile={this}/>
            </div>
        } else if (this.state.show === 2) {
            showing = <div id='list' className={"blackBorder"}>
                <div className='listHeader'>
                    <h3>
                        Your followers:
                    </h3>
                    {this.makeNotice()}
                    <hr/>
                </div>
                <Followers UserProfile={this}/>
            </div>
        } else if (this.state.show === 3) {
            showing = <div id='list' className={"blackBorder"}>
                <div className='listHeader'>
                    <h3>
                        You are following:
                    </h3>
                    {this.makeNotice()}
                    <hr/>
                </div>
                <Followings UserProfile={this}/>
            </div>
        } else if (this.state.show === 4) {
            showing = <div id='list' className={"blackBorder"}>
                <div className='listHeader'>
                    <h3>
                        Your uploads:
                    </h3>
                    {this.makeNotice()}
                    <hr/>
                    <div>
                        <button id="publishBook" className='margin1 defaultButton' onClick={(e) => {
                            this.props.history.push("/book/edit",
                                {
                                    publish: true
                                })
                        }}><strong>Publish New Book</strong>
                        </button>
                    </div>
                </div>
                <Uploads user={this.state.user} UserProfile={this} user_id={this.state.user_id}/>
            </div>
        }
        //the default presenting section
        return (
            <div className="UserProfile">
                <Header user={this.state.user} userpic={this.state.icon}/>

                <div id='info'>
                    <div id='profileData' className={"slightTopMargin blackBorder"}>
                        <img src={this.getIcon()} alt="Profile" id="profileIconImg" className={"blackBorder"}></img>
                        {this.renderUpload()}
                        <p><strong>Name:</strong> <i>{formatUser(this.state.user)}</i></p>
                        <p><strong>Total Upvotes:</strong> {this.state.upvotes}</p>

                        <hr className={"slightTopMargin"}/>

                        <p><strong>Latest Publish:</strong> {this.state.date}</p>
                        <p><strong>Kudos:</strong> {this.state.kudos}</p>
                        <p><strong>Average Score:</strong> {this.state.avg}</p>

                        <hr className={"slightTopMargin"}/>

                        <p><strong>Profile Summary:</strong></p>
                        
                        {this.renderSummary()}

                        {this.renderEdit()}

                        
                    </div>
                </div>

                <div id="profileStats" className={"slightTopMargin"}>
    
                    <ul>
                        <li id="clickable1" className={"blackBorder"} onClick={(event) => {
                            this.handleClick(event, 1)
                        }}>
                            Followers<br/><span className="profileStatsNumber">{this.state.followers.length}</span></li>
                        <li id="clickable2" className={"blackBorder"} onClick={(event) => {
                            this.handleClick(event, 2)
                        }}>
                            Following<br/><span className="profileStatsNumber">{this.state.followings.length}</span></li>
                        <li id="clickable3" className={"blackBorder"} onClick={(event) => {
                            this.handleClick(event, 3)
                        }}>
                            Uploads<br/><span className="profileStatsNumber">{this.state.uploads.length}</span></li>
                        <li id="clickable4" className={"blackBorder"} onClick={(event) => {
                            this.handleClick(event, 4)
                        }}>
                            Booklist<br/><span className="profileStatsNumber">{this.state.books.length}</span></li>
                    </ul>
                </div>
                {showing}

                <img id="logoutButton" src={logoutButton} alt={"logout"} onClick={(e) => this.logout()}/>
                <div id="adminButton">
                {makePanel()}
                </div>

                <img id="logoutButton" src={logoutButton} alt={"logout"} onClick={(e) => this.logout()}/>

            </div>
        )
    }
}

export default withRouter(UserProfile);
