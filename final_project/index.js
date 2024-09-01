const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const books = require('./router/booksdb.js');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here

//If user has logged and has valid access
if(req.session.authorization) {
  // Check the validity of the accessToken
  let token = req.session.authorization["accessToken"];
  jwt.verify(token, "access", (err, user) => {
    if(!err) {
      req.user = user;
      next(); // Proceed to next middleware
    }
    else {
      // Return an error for Unauthorization
      return res.status(403).json({ message: "User not authenticated" });
    }
  });
} else {
  // Return an error: Not Login
  return res.status(403).json({ message: "User is not logged in" });
}
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Serve booksdb.js as JSON for Task 10,11,12,13
app.get('/booksdb.js', (req, res) => {
  return res.send(books);
});

app.listen(PORT,()=>console.log("Server is running"));
