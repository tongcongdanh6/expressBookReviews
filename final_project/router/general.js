const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require("axios");
const public_users = express.Router();

// Task 6: register a new user
public_users.post("/register", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  // if username && password is not empty
  if (username && password) {
    // Check if the username entered by the user exists in the users array
    if (isValid(username)) {
      // If username does not exist
      // Push it to users array
      users.push({
        username,
        password
      });
      return res.status(200).json({ message: "User successfully registered. Now you can login!" });
    }
    else {
      // If username exists
      // Return 404, with error "User already exists!"
      return res.status(404).json({ message: "User already exists! Please try another username" });
    }
  }

  // Return error if username or password is missing from user input
  return res.status(404).json({ message: "Unable to register user." });
});

// Task 1: Get the book list available in the shop
// http://localhost:5000/booksdb.js serves in index.js by app.get('/booksdb.js', ... )
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/booksdb.js');
    return res.send(JSON.stringify({ books: response.data }, null, 4));
  }
  catch (error) {
    return res.status(500).json({ message: "Unexpected error! " + error.message });
  }
});

// Task 2: Get book details based on ISBN
// http://localhost:5000/booksdb.js serves in index.js by app.get('/booksdb.js', ... )
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    // Get the "isbn" parameter from user
    const isbn = req.params.isbn;
    // Get books with the given "isbn" in the database
    const response = await axios.get('http://localhost:5000/booksdb.js');
    const currentBook = response.data[isbn];

    if (currentBook) {
      // Return a response with currentBook
      return res.send(currentBook);
    }
    else {
      // Return a response with error NOT FOUND if the book was not found in the database
      return res.status(404).json({ message: "The book with the ISBN you just searched for was not found" });
    }
  }
  catch (error) {
    return res.status(500).json({ message: "Unexpected error! " + error.message });
  }
});

// Task 3: Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    // Get author data from user input
    const author = req.params.author;
    // Initialize `booksByAuthor` to store books that meet requirements
    const booksByAuthor = [];
    // Retrieve books data using axios
    const response = await axios.get('http://localhost:5000/booksdb.js');
    // Loop through the elements in `books`
    for (b in response.data) {
      // if we found the book
      if (response.data[b].author === author) {
        // clone all attributes except "author" to `rest`
        let { author, ...rest } = response.data[b];
        // create new object with "rest" and add the "isbn" attribute. Then push it to `booksByAuthor`
        booksByAuthor.push({ "isbn": b, ...rest });
      }
    }
    // Return response success if we found books with that author
    if (booksByAuthor.length > 0) {
      return res.send(JSON.stringify({ booksByAuthor }, null, 4));
    }
    else {
      // Return a response with error NOT FOUND if no books are found for the given author
      return res.status(404).json({ message: "The book by the author you searched for was not found" });
    }
  }
  catch (error) {
    return res.status(500).json({ message: "Unexpected error! " + error.message });
  }
});

// Task 4: Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    // Get the "title" data from user input
    let title = req.params.title;
    // Initialize `booksByTitle` to store books that meet requirements
    let booksByTitle = [];
    // Retrieve books data using axios
    const response = await axios.get('http://localhost:5000/booksdb.js');
    // Loop through elements in the database
    for (b in response.data) {
      // If the book is found
      if (response.data[b].title === title) {
        // Clone all attributes except "title" to `rest`
        let { title, ...rest } = response.data[b];
        // Create a new object with `rest` and add the "isbn" attribute, then push it to `booksByTitle`
        booksByTitle.push({ "isbn": b, ...rest });
      }
    }
    // Return a success response if books with that title are found
    if (booksByTitle.length > 0) {
      return res.send(JSON.stringify({ booksByTitle }, null, 4));
    }
    else {
      // Return a response with error "NOT FOUND" if no books are found with the given title
      return res.status(404).json({ message: "The book with the title you searched for was not found" });
    }
  }
  catch (error) {
    return res.status(500).json({ message: "Unexpected error! " + error.message });
  }
});

//  Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  // Get isbn parameter from user
  let isbn = req.params.isbn;

  // Get book with given isbn in database
  let currentBook = books[isbn];

  if (currentBook) {
    // Return response with "reviews" from currentBook
    return res.send(currentBook.reviews);
  }
  else {
    // Return response with error NOT FOUND if that book was not found in the database
    return res.status(404).json({ message: "The book with the ISBN you just searched for was not found" });
  }

});

module.exports.general = public_users;
