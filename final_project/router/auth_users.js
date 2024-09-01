const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid

  // If username parameter is not empty
  if (username) {
    // Check if whether the username exists in the users array, if it was not found => return true;
    // This filter will be returned true if only it has 0 elements inside
    return users.filter(u => u.username === username).length === 0;
  }
  else {
    // Otherwise, if username parameter is empty => return false
    return false;
  }
}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  // If username && password are not empty
  if (username && password) {
    // If a username & password in the users array matches the username && password entered by the user, return true.
    return users.filter(u => u.username === username && u.password === password).length > 0;
  }
  else {
    // If username is empty || password is empty, return false
    return false;
  }
}

// Task 7: only registered users can login
regd_users.post("/login", (req, res) => {
  // input from user
  const username = req.body.username;
  const password = req.body.password;

  // If user entered empty username || empty password, return status 404
  if (!username || !password) {
    return res.status(404).send({ message: "Username or password cannot be empty!" })
  }

  // check authenticated user
  if (authenticatedUser(username, password)) {
    // If username && password provided by user is valid
    const accessToken = jwt.sign({ data: password }, "access", { expiresIn: 60 * 60 });

    // Store in session
    req.session.authorization = {
      accessToken,
      username
    };

    // Return status code 200, notify "Customer successfully logged in"
    return res.status(200).json({ message: "Customer successfully logged in!" });
  }
  else {
    // If the user's credentials are incorrect. Return status code 404.
    return res.status(404).json({ message: "Username or password is incorrect!" });
  }
});

// Task 8: Add/modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Get review data from user
  const review = req.query.review;
  // Get ISBN data from user
  const isbn = req.params.isbn;

  // If the requested data from the user is missing, return error 400: Bad Request.
  if (!isbn || !review) {
    return res.status(400).json({ message: "Your request is invalid!" });
  }

  // If the book matches the ISBN provided by the customer
  if (books[isbn]) {
    // Current username
    const currentUser = req.session.authorization.username;
    // When we use `currentUser` as a key and `review` as a value
    // Case 1: If `currentUser` is not found in this book,
    // -- The new review object will be added.
    // Case 2: If `currentUser` is found in this book,
    // -- The `review` value will be modified.
    // The following line will cover the two cases mentioned above
    books[isbn].reviews[currentUser] = review;

    // Return response
    return res.status(200).json({ message: "The review for the book with ISBN " + isbn + " has been added/updated" });
  }
  else {
    // If the book doesn't match the ISBN provided by the customer
    // Return error 404
    return res.status(404).json({ message: "The book with the given ISBN was not found!" });
  }
});

// Task 9: Delete a review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Get ISBN data from user
  const isbn = req.params.isbn;

  // If the requested data from the user is missing, return error 400: Bad Request.
  if (!isbn) {
    return res.status(400).json({ message: "Your request is invalid!" });
  }

  if (books[isbn]) {
    const currentUser = req.session.authorization.username;
    if (!books[isbn].reviews[currentUser]) {
      // If we cannot find any review that belongs to `currentUser`. Return 404
      return res.status(404).json({ message: "Cannot find any review that belongs to user " + currentUser });
    }
    else {
      // Otherwise, delete it
      delete books[isbn].reviews[currentUser];
    }

    // Return response
    return res.status(200).json({ message: "Review for the ISBN " + isbn + " posted by the user " + currentUser + " deleted!" });
  }
  else {
    // If the book doesn't match the ISBN provided by the customer
    // Return error 404
    return res.status(404).json({ message: "The book with the given ISBN was not found!" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
