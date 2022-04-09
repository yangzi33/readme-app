//The function that handle the event that a remove button is clicked for 
//a book in the booklist. This should call the server to change the data of
//inside the booklist
import {BACKEND_URL} from "../../actions/Utils";

export const handleRemove = (UserProfile, key) => {
    
    const book_id = key.id;
    fetch(`${BACKEND_URL}/api/user/followNovel/${book_id}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST", credentials: "include"}).then(
                () => {
                    const newBooks = UserProfile.state.books.filter((b) => {
                        return b !== key
                    });
                    UserProfile.setState({books: newBooks});
                })
};
