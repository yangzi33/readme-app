import {BACKEND_URL} from "./Utils";

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }  
    return array;
 }

function getRandomBooks(bookList) {
    const url = `${BACKEND_URL}/api/book`;

    fetch(url, { method: "get", credentials: "include" })
        .then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                console.log("Failed to fetch books");
            }
        }).then(bookArray => {
            if (bookArray.book.length <= 10) {
                bookList.setState({ bookList: bookArray.book })
            } else {
                let randomBookList = bookArray.book.slice(0);
                shuffle(randomBookList);
                bookList.setState({ bookList: randomBookList.slice(0, 10) })
            }
        })
}


function getBooks(bookList) {
    const url = `${BACKEND_URL}/api/book`;

    fetch(url, { method: "get", credentials: "include" })
        .then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                console.log("Failed to fetch books");
            }
        }).then(bookArray => {
            bookList.setState({ bookList: bookArray.book })
        })
}


function getAuthorName(bookDisplay, author_id) {
    const url = `${BACKEND_URL}/api/user/${author_id}`;
    fetch(url, { method: "get", credentials: "include" })
        .then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                console.log("Failed to fetch author name")
            }
        }).then(json => {bookDisplay.setState({ author: json.username })});
}

export { getBooks, getAuthorName, getRandomBooks };