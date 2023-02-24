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

module.exports = {
  checkIfEmailExists,
  checkIfCredentialsAreEmpty,
  filterURLByUserID
};