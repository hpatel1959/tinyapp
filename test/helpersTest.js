const {assert} = require('chai');

const {checkIfEmailExists} = require('../helpers');
const {checkIfCredentialsAreEmpty} = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe ('---Tests for checkIfEmailExists function', () => {
  it ('should return user object if email exists', () => {
    const user = checkIfEmailExists('user@example.com', testUsers);
    const expected = testUsers.userRandomID;
    assert.deepEqual(user, expected, "returns entire user object");
  });

  it ('should return null if email does not exist', () => {
    const user = checkIfEmailExists('user@exmaple.com', testUsers);
    const expected = null;
    assert.equal(user, expected, "returns entire user object");
  });
});

describe ('---Tests for checkIfCredentialsAreEmpty function', () => {
  it ('should return error if credentials are empty', () => {
    const actual = checkIfCredentialsAreEmpty('', '');
    const expected = 'error';
    assert.equal(actual, expected, "returns error");
  });
});
