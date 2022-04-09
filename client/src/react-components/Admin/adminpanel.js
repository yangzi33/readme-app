import React, {Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import Header from '../Header/Header'
import {uid} from 'react-uid'
import Warning from './warning';
import '../../style/adminpanel.css'
import { BACKEND_URL} from "../../actions/Utils";
import Cookies from 'js-cookie';
class AdminPanel extends React.Component {
    state = {
        user: Cookies.get("username"), // username
        isAdmin: false, // is current user an admin
        toggleWarning: false, // true = show popup for warning message
        warningParams: [], // props to pass to warning componenet
        // user list will later be queried from database
        // users: [['sammy', p1, true], ['LILYXDDD', guestpic, true], ['Micky', authorpic, true]], // username, profilepic, locked (normal === true, banned === false)
        users: [],
        username: "",
        password: "", 
        refresh: true
    }


    // set initial state 
    componentDidMount() {
        // if username is not admin, admin is false (only for phase 1)
        fetch(`${BACKEND_URL}/api/user/${Cookies.get("user_id")}`, {
            credentials: "include"
        }).then(response => response.json())
            .then(user => {
                this.setState({isAdmin: user.isAdmin})
            })

        fetch(`${BACKEND_URL}/api/user`, {
            credentials: "include"
        }).then(response =>  response.json())
            .then(users => this.setState({users: users.book}))
    }

    // set warning params and change toggleWarning
    togglePopup = (type, purpose, func = null) => {
        if (!this.state.toggleWarning) {
            this.setState({warningParams: [type, purpose, func]});
        } else {
            this.setState({warningParams: []});
        }
        this.setState({toggleWarning: !this.state.toggleWarning});

    }

    resetUsers(){
        fetch(`${BACKEND_URL}/api/user`, {
            credentials: "include"
        }).then(response => {
            if (response.status === 200) return response.json()
        }).then(users => {
            this.setState({users: users.book})
        }).catch(error =>  window.alert({error}))
        
    }

    /*
     * Adds a bare bones user.
     * Should send a server call to create the user with the specified info.
     */
    addUser(event, username, password) {
        if (this.state.users.findIndex(user => user[0] === username) >= 0) {
            window.alert("The username is already taken.");
            return;
        }

        if (username.length < 4 || password.length < 4) {
            window.alert("The username and password must be at least 4 characters");
            return;
        }

        const userInfo = {
            username: this.state.username,
            password: this.state.password,
            repeatPassword: this.state.password,
            email: "changeMe@example.com",
            phoneNumber: "111-111-1111",
            dateOfBirth: "2000-01-01"
        }

        fetch(`${BACKEND_URL}/api/user/signup`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(userInfo),
            credentials: "include"
        }).then(response => {
            this.resetUsers()
            if (response.status === 200) return response.json()
        }).catch(error =>  window.alert({error}))
    }


    // Sends a server call to delete a user.
    // Should specify the username to delete
    // The server will then remove that account from the DB.
    deleteUser(event, uKey, id) {
        fetch(`${BACKEND_URL}/api/user/${id._id}`, {
            method: "DELETE",
            credentials: "include"
        }).then(response => {
            this.resetUsers()
            if (response.status === 200) return response.json()
        }).catch(error =>  console.log(error))
    }

    // Sends a server call to ban a user.
    // Should specify the username to ban
    // The server will then mark that account as "banned."
    banUser(event, uKey, id) {
        fetch(`${BACKEND_URL}/api/user/${id}`, {
            credentials: "include"
        }).then(response => response.json())
            .then(thisUser => {
                const bannedUser = {   
                    followers : thisUser.followers,
                
                    locked : true
                }
        
                fetch(`${BACKEND_URL}/api/user/${id}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "PATCH",
                    body: JSON.stringify(bannedUser),
                    credentials: "include"
                }).then(response => {
                    // console.log(response.json())
                    this.resetUsers()
                    if (response.status === 200) return response.json()
                }).catch(error =>  window.alert({error}))
                })

        // const thisUser = this.getUserById(id)
        

        if (this.state.toggleWarning) {
            this.setState({toggleWarning: false})
        }
        // const newList = this.state.users;
        // let index = newList.findIndex(user => user === uKey);

        // newList[index][2] = false;

        // this.setState({users: newList});
    }

    // Sends a server call to unban a user.
    // Should specify the username to unban
    // The server will then remove the ban.
    unbanUser(event, uKey, id) {
        
        fetch(`${BACKEND_URL}/api/user/${id}`, {
            credentials: "include"
        }).then(response => response.json())
            .then(thisUser => {
                const bannedUser = {
                    followers : thisUser.followers,
                
                    locked : false
                }
        
                fetch(`${BACKEND_URL}/api/user/${id}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "PATCH",
                    body: JSON.stringify(bannedUser),
                    credentials: "include"
                }).then(response => {
                    this.resetUsers()
                    if (response.status === 200) return response.json()
                }).catch(error =>  window.alert({error}))
                })

        if (this.state.toggleWarning) {
            this.setState({toggleWarning: false})
        }

        // const newList = this.state.users;

        // let index2 = newList.findIndex(user => user === uKey);

        // newList[index2][2] = true;

        // this.setState({users: newList});
    }

    render() {
        // if user is locked show ban button, else show unban button
        const renderRemoveUserButton = (user) => {

            if (!user.locked) {
                return <Fragment>
                    <button className='margin1 defaultButton' id='banUser'
                            onClick={(event) => this.togglePopup("Account", "banned", this.banUser.bind(this, event, user, user._id))}>Ban
                        User
                    </button>
                    <button className='defaultButton' id='flagUser' onClick={() => this.togglePopup("Account", "warning"
                    )}>Warning
                    </button>
                    <button className='defaultButton' id='deleteUser'
                            onClick={(event) => this.deleteUser(this, event, user, user._id)}>Delete User
                    </button>
                </Fragment>

            } else if (user.locked) {

                return <Fragment>
                    <button className='margin1 defaultButton' id='unbanUser'
                            onClick={(event) => this.unbanUser(event, user, user._id)}>Unban User
                    </button>
                    <button className='defaultButton' id='flagUser' onClick={() => this.togglePopup("Account", "warning"
                    )}>Warning
                    </button>
                    <button className='defaultButton' id='deleteUser'
                            onClick={(event) => this.deleteUser(event, user, user._id)}>Delete User
                    </button>
                </Fragment>
            }
            return <Fragment>
                <button className='defaultButton' id='removeUser'
                        onClick={(event) => this.togglePopup("Account", "removed",
                            this.banUser.bind(this, event, user, user._id))}>Remove
                </button>
            </Fragment>
        }
        // call warning component
        const renderPopup = () => {
            if (this.state.toggleWarning && this.state.warningParams !== []) {
                return <Warning
                    type={this.state.warningParams[0]}
                    handleClose={this.togglePopup}
                    purpose={this.state.warningParams[1]}
                    func={this.state.warningParams[2]}
                />

            }
        }
        // if current user isn't admin and they got here by mistake, they still cannot access the admin panel
        if (!this.state.isAdmin) {
            return (
                <div>
                    <Header user={this.state.user}/>
                    <h1>{'<'}LOCKED{'>'} <br></br>You are Not an Admin</h1>
                </div>)
        }
        // else show admin panel
        return (
            <Fragment>
                <Header user={this.state.user}/>
                <div id='mainPanel' className='row'>

                    <div id='users' className={"blackBorder"}>
                        <h1>Admin Panel</h1>
                        <p>Use this panel to ban/warn users.</p>
                        <br/>
                        <h2>Manage Users</h2>
                        <hr/>
                        <ul>
                            {renderPopup()}
                            {this.state.users.map((user) => {
                                    return (
                                        <li key={uid(user)}>

                                            <div className='row'>
                                                <img alt="Profile" src={user.profilePicUrl} className='profilepic'></img>
                                                <span id='username'>
                                            {user.locked ? <b>{'<'}BANNED{'>'}</b> : <b>{user.username}</b>}
                                            
                                        </span>
                                        {/* {user._id} */}
                                                {renderRemoveUserButton(user)}

                                            </div>
                                            <hr></hr>
                                        </li>
                                    )
                                }
                            )
                            }

                        </ul>

                        <input type={"text"} placeholder={"Username"} value={this.state.username} onChange={
                            (e) => this.setState({username: e.target.value})
                        }/>
                        <input className={"margin1"} type={"password"} placeholder={"Password"}
                               value={this.state.password} onChange={
                            (e) => this.setState({password: e.target.value})
                        }/>
                        <button className='defaultButton' id='addUser'
                                onClick={(event) => this.addUser(event, this.state.username, this.state.password)}>Add
                            User
                        </button>
                    </div>

                </div>
            </Fragment>

        )
    }
}

export default withRouter(AdminPanel);