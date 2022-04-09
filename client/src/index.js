import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import SignUp from "./react-components/Sign Up/SignUp";
import Login from "./react-components/Login/Login";
import BookViewer from "./react-components/BookViewer/BookViewer";
import BookMainPage from "./react-components/Book Main Page/BookMainPage";
import BookEdit from "./react-components/Book Edit/BookEdit";
import reportWebVitals from "./reportWebVitals";
import UserProfile from "./react-components/UserProfile/UserProfile.js";
import AdminPanel from "./react-components/Admin/adminpanel";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import ExplorePage from "./react-components/Explore/ExplorePage";
import ExploreWarning from "./react-components/Header/ExploreWarning";
import Search from './react-components/Search/Search'

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route exact path="/book/edit" render={() => <BookEdit />} />
      <Route exact path="/book/:id/view" render={() => <BookViewer />} />
      <Route exact path="/signup" render={() => <SignUp />} />
      <Route exact path="/" render={() => <Login />} />
      <Route exact path="/adminpanel" render={() => <AdminPanel />} />
      <Route exact path="/book/:id" render={() => <BookMainPage />} />
      <Route exact path="/profile" render={() => <UserProfile />} />
      <Route exact path="/home" render={() => <ExplorePage />} />
      <Route exact path="/search" render={() => <Search />} />
      <Route exact path="/explore-warning" render={() => <ExploreWarning />} />
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
// serviceWorker.unregister();
