
function getMatchBooks(searchComponent, allBooks, keyWord) {
    if (!keyWord)  {
        window.alert("You must enter a search term!");
        return;
    }

    const filteredBooks = allBooks.filter((item) =>
        item.bookTitle.toLowerCase().includes(keyWord.toLowerCase())
    );
    searchComponent.setState({ matchBooks: filteredBooks, notFoundText: "No results found." })
}

function updateSearchForm(formComp, field) {
    const value = field.value;
    const name = field.name;
    formComp.setState({
        [name]: value
    })
}


export { updateSearchForm, getMatchBooks }