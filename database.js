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

module.exports = {
  users,
  urlDatabase
}