const express = require('express');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const checkIfEmailExists = require('./helpers').checkIfEmailExists;
const checkIfCredentialsAreEmpty = require('./helpers').checkIfCredentialsAreEmpty;
const generateRandomString = require('./helpers').generateRandomString;
const filterURLByUserID = require('./helpers').filterURLByUserID;
const PORT = 8080;


const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['hi', 'hello', 'bye', 'goodbye', 'later'],
  maxAge: 24 * 60 * 60 * 1000
}))

// database that stores all users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$vfcy0r8CzERsyxjU.VkZHue0L.uEmb9quWnCMtPqwLfxZshuyVtbK",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$EXX5oB9HBN8IIi/NUAKkA.A0fnya4a.QAhF48KrkfVqJZo0dGcLgK",
  },
};

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID:"user2RandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "userRandomID"}
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID]
  const filteredUrlDatabase = filterURLByUserID(urlDatabase, userID); // returns an obj holding all the urls owned by user
  const templateVars = { urls: filteredUrlDatabase, user: user };
  if (userID) {
    return res.render("urls_index", templateVars);
  }
  res.redirect('/login');
  
});

app.post('/urls', (req, res) => {
  const userID = req.session.user_id; // gets userID from cookie
  if (!userID) {
    return res.send("Please login or register for an account to create your own short URLS\n");
  }
  const randomString = generateRandomString();
  urlDatabase[randomString] = {longURL: req.body.longURL, userID: userID}; // adds new short URL object to database containing longURL and userID
  res.redirect('/urls/' + randomString);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL; // gets longURL from urlDatabase using id from path
  if (longURL) {
    return res.redirect(longURL);
  }
  res.send('Sorry the short URL you have entered does not match any in our records');
});

app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID]
  templateVars = {user: user};
  if (userID) {
    return res.render('urls_new', templateVars)
  }
  res.redirect('/login');
});

app.get('/urls/:id', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) { // if user is not logged in
    res.send('Sorry you have to be logged in to view this page');
  }
  if (!urlDatabase[req.params.id]) { // if short url from path does not match an short url object from urlDatabase
    return res.send('Sorry this short URL does not exist.')
  }
  const user = users[userID]
  const urlOwnerID = urlDatabase[req.params.id].userID; // gets owners id from url database using id from path
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: user};
  if (userID === urlOwnerID) { // is user is the owner of the url
    return res.render('urls_show', templateVars)
  }
  res.send('Sorry you must be the owner to view this page');
  
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send(`<html><body>Hello <b>World</b></body></html>\n`);
});

app.post('/urls/:id/delete', (req, res) => {
  const userID = req.session.user_id;
  if (!urlDatabase[req.params.id]) { 
    return res.send('Sorry this short URL does not exist.\n')
  }
  const urlOwnerID = urlDatabase[req.params.id].userID;
  if (userID === urlOwnerID) { // if user trying to delete object is the owner
    delete urlDatabase[req.params.id];
    return res.redirect('/urls');
  }
  res.send('Sorry you must be the owner of this short URL to delete it.\n');
  
});

app.post('/urls/:id', (req, res) => {
  const userID = req.session.user_id;
  if (!urlDatabase[req.params.id]) { // if short url from path does not exist in urlDatabase
    return res.send('Sorry this short URL does not exist.\n')
  }
  const urlOwnerID = urlDatabase[req.params.id].userID;
  if (userID === urlOwnerID) { // if user trying to edit object is the owner 
    urlDatabase[req.params.id].longURL = req.body.updatedURL;
    return res.redirect('/urls');
  }
  res.send('Sorry you must be the owner of this short URL to make changes.\n');
  
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const result = checkIfEmailExists(email, users); // checks if email exists in users database and stores result in variable result
  if (result === null) { // if email is not found in users database
    res.status(403);
    return res.send('Email not found, please try again, or register for an account')
  }
  if (email === result.email && !bcrypt.compareSync(password, result.password)) { // if email is found in users database, but password does not match
    res.status(403);
    return res.send('Incorrect password.');
  }
  if (email === result.email && bcrypt.compareSync(password, result.password)) { // if email and password both match email and password in users object
  req.session.user_id = result.id; // sets a cookie for the user
  return res.redirect('/urls');
  }
  res.status(400);
  return res.send('Invalid credentials.') // if email and password both do not match email and password in users object
});

app.post('/logout', (req, res) => {
  req.session = null; // removes all active cookies
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID]
  const templateVars = {user: user}
  if (userID) { // if user exists
    return res.redirect("urls")
  }
  res.render('urls_registration', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const randomID = generateRandomString(); // variable randomID holds a random generated string
  const result = checkIfEmailExists(email, users); // variable result holds return of function that checks if email is already assigned to a user
  const result1 = checkIfCredentialsAreEmpty(email, password); // checks if user left email and password fields empty
  if (result) { // if email is already in use (function returned a user object)
    res.status(400);
    return res.send('Email is already in use');
  }
  if (result1) { // if user left email and password fields empty (function returned "error")
    res.status(400);
    return res.send('Please make sure both fields are filled in.');
  }
  users[randomID] = {id: randomID, email: email, password: bcrypt.hashSync(password, 10)}; // creates a new user obj contaning new id, new email, and new hashed password
  req.session.user_id = randomID; // sets a cookie with the value of the new objects id
  res.redirect("urls");
});

app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID]
  const templateVars = {user: user}
  if (userID) { // if user is logged in
    return res.redirect("/urls")
  }
  return res.render('urls_login', templateVars);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
