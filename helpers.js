const checkIfEmailExists = function(email, database) {
  for (let userKey in database) {
    if (database[userKey].email === email) {
      return database[userKey];
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

function generateRandomString() {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }
  return result;
};

module.exports = {
  checkIfEmailExists,
  checkIfCredentialsAreEmpty,
  filterURLByUserID,
  generateRandomString
};