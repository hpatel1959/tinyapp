const express = require('express');
const cookieParser = require('cookie-parser');
const PORT = 8080;
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get("/urls", (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID]
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});

app.post('/urls', (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect('/urls/' + randomString);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get('/urls/new', (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID]
  templateVars = {user: user};
  res.render('urls_new', templateVars)
});

app.get('/urls/:id', (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID]
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id], user: user};
  res.render('urls_show', templateVars)
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send(`<html><body>Hello <b>World</b></body></html>\n`);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id/update', (req, res) => {
  urlDatabase[req.params.id] = req.body.updatedURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  res.cookie('user_id', req.body['email']);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID]
  const templateVars = {user: user}
  res.render('urls_registration', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const randomID = generateRandomString();
  users[randomID] = {id: randomID, email: email, password: password};
  res.cookie('user_id', randomID);
  res.redirect("urls");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});