const express = require('express');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const PORT = 8080;
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const checkIfEmailExists = function(email) {
  for (let userKey in users) {
    if (users[userKey].email === email) {
      return users[userKey];
    }
  }
  return null;
}

const checkIfCredentialsAreEmpty = function(email, password) {
  if (email === '' || password === '') {
    return 'error';
  }
}

const filterURLByUserID = function(urlDatabase, userID) {
  let filteredObj = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      filteredObj[shortURL] = urlDatabase[shortURL];
    }
  }
  return filteredObj;
}

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

function generateRandomString() {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID:"user2RandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "userRandomID"}
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get("/urls", (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID]
  const filteredUrlDatabase = filterURLByUserID(urlDatabase, userID);
  const templateVars = { urls: filteredUrlDatabase, user: user };
  if (userID) {
    return res.render("urls_index", templateVars);
  }
  res.redirect('/login');
  
});

app.post('/urls', (req, res) => {
  const userID = req.cookies['user_id'];
  if (!userID) {
    return res.send("Please login or register for an account to create your own short URLS\n");
  }
  const randomString = generateRandomString();
  urlDatabase[randomString] = {longURL: req.body.longURL, userID: userID};
  res.redirect('/urls/' + randomString);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL) {
    return res.redirect(longURL);
  }
  res.send('Sorry the short URL you have entered does not match any in our records');
});

app.get('/urls/new', (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID]
  templateVars = {user: user};
  if (userID) {
    return res.render('urls_new', templateVars)
  }
  res.redirect('/login');
});

app.get('/urls/:id', (req, res) => {
  const userID = req.cookies['user_id'];
  if (!userID) {
    res.send('Sorry you have to be logged in to view this page');
  }
  if (!urlDatabase[req.params.id]) {
    return res.send('Sorry this short URL does not exist.')
  }
  const user = users[userID]
  const urlOwnerID = urlDatabase[req.params.id].userID;
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: user};
  if (userID === urlOwnerID) {
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
  const userID = req.cookies['user_id'];
  if (!urlDatabase[req.params.id]) {
    return res.send('Sorry this short URL does not exist.\n')
  }
  const urlOwnerID = urlDatabase[req.params.id].userID;
  if (userID === urlOwnerID) {
    delete urlDatabase[req.params.id];
    return res.redirect('/urls');
  }
  res.send('Sorry you must be the owner of this short URL to delete it.\n');
  
});

app.post('/urls/:id', (req, res) => {
  const userID = req.cookies['user_id'];
  if (!urlDatabase[req.params.id]) {
    return res.send('Sorry this short URL does not exist.\n')
  }
  const urlOwnerID = urlDatabase[req.params.id].userID;
  if (userID === urlOwnerID) {
    urlDatabase[req.params.id].longURL = req.body.updatedURL;
    return res.redirect('/urls');
  }
  res.send('Sorry you must be the owner of this short URL to make changes.\n');
  
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const result = checkIfEmailExists(email);
  if (result === null) {
    res.status(403);
    return res.send('Email not found, please try again, or register for an account')
  }
  if (email === result.email && !bcrypt.compareSync(password, result.password)) {
    res.status(403);
    return res.send('Incorrect password.');
  }
  if (email === result.email && bcrypt.compareSync(password, result.password)) {
  res.cookie('user_id', result.id);
  return res.redirect('/urls');
  }
  res.status(400);
  return res.send('Invalid credentials.')
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID]
  const templateVars = {user: user}
  if (userID) {
    return res.redirect("urls")
  }
  res.render('urls_registration', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const randomID = generateRandomString();
  const result = checkIfEmailExists(email);
  const result1 = checkIfCredentialsAreEmpty(email, password);
  if (result) {
    res.status(400);
    return res.send('Email is already in use');
  }
  if (result1) {
    res.status(400);
    return res.send('Please make sure both fields are filled in.');
  }
  users[randomID] = {id: randomID, email: email, password: bcrypt.hashSync(password, 10)};
  res.cookie('user_id', randomID);
  res.redirect("urls");
});

app.get('/login', (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID]
  const templateVars = {user: user}
  if (userID) {
    return res.redirect("/urls")
  }
  return res.render('urls_login', templateVars);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
