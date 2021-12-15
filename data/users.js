const { users } = require("./../config/mongoCollections");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const saltRounds = 16;
const common = require("./common");

async function get(username) {
  const userCollection = await users();
  username = username.toLowerCase();
  const user = await userCollection.findOne({
    username: username,
  });
  return user;
}
//added by sv
function checkAlphanumerics(phrase) {
  let str = phrase;
  const checker = /[^a-z0-9]/g;
  if (checker.test(str)) {
    return true;
  }

  return false;
}

function checkIsProperString(val) {
  if (!val) {
    throw `No input passed`;
  }
  if (typeof val !== "string") {
    throw `Not a string`;
  }

  if (val.length == 0) {
    throw `Length of string is 0`;
  }
  if (val.trim().length == 0) {
    throw `String is only spaces`;
  }
}

function validateID(id) {
  if (typeof id != "string") {
    throw "Argument of type string expected";
  }
  if (id.trim().length === 0) {
    throw "String cannot be blanks or empty";
  }
  if (!ObjectId.isValid(id)) {
    throw "Object Id is not valid";
  }
}

let exportedMethods = {
  async createUser(
    firstName,
    lastName,
    email,
    phoneNumber,
    username,
    password,
    address,
    city,
    state,
    zip
  ) {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !username ||
      !password ||
      !address ||
      !city ||
      !state ||
      !zip
    ) {
      throw `Missing parameter`;
    }

    const usersCollection = await users();

    const uniqueIndex = await usersCollection.createIndex(
      { username: 1 },
      { unique: true }
    );

    username = username.toLowerCase();

    if (
      common.xssCheck(firstName) ||
      common.xssCheck(lastName) ||
      common.xssCheck(email) ||
      common.xssCheck(phoneNumber) ||
      common.xssCheck(username) ||
      common.xssCheck(password) ||
      common.xssCheck(address) ||
      common.xssCheck(city) ||
      common.xssCheck(state) ||
      common.xssCheck(zip)
    ) {
      throw `XSS attempt`;
    }

    checkIsProperString(firstName);
    checkIsProperString(lastName);
    checkIsProperString(address);
    checkIsProperString(city);
    checkIsProperString(username);
    checkIsProperString(password);

    const phoneRegex = /^\d{10}$/im;
    const emailRegex =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    const zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;

    if (!phoneRegex.test(phoneNumber)) {
      throw `Incorrect phone number format`;
    }
    if (!emailRegex.test(email)) {
      throw `Incorrect email format`;
    }
    if (!zipRegex.test(zip)) {
      throw `Incorrect zip code`;
    }

    stateList = [
      "AL",
      "AK",
      "AZ",
      "AR",
      "CA",
      "CO",
      "CT",
      "DE",
      "DC",
      "FL",
      "GA",
      "HI",
      "ID",
      "IL",
      "IN",
      "IA",
      "KS",
      "KY",
      "LA",
      "ME",
      "MD",
      "MA",
      "MI",
      "MN",
      "MS",
      "MO",
      "MT",
      "NE",
      "NV",
      "NH",
      "NJ",
      "NM",
      "NY",
      "NC",
      "ND",
      "OH",
      "OK",
      "OR",
      "PA",
      "PR",
      "RI",
      "SC",
      "SD",
      "TN",
      "TX",
      "UT",
      "VT",
      "VA",
      "WA",
      "WV",
      "WI",
      "WY",
    ];

    const hash = await bcrypt.hash(password, saltRounds);

    found = false;

    for (let i = 0; i < stateList.length; i++) {
      if (state == stateList[i]) found = true;
    }

    if (found == false) {
      throw `State not found`;
    }

    let newUser = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phoneNumber: phoneNumber,
      username: username,
      password: hash,
      address: address,
      city: city,
      state: state,
      zip: zip,
      listings: [],
      bookings: [],
      reviews: [],
    };

    const userCollection = await users();

    const insertInfo = await userCollection
      .insertOne(newUser)
      .catch(function (e) {
        throw "Username already exists";
      });
    if (insertInfo.insertedCount === 0) throw `Could not add user`;

    return insertInfo.insertedId.toString();
  },

  async getUser(id = checkParameters()) {
    id = id.trim();
    id = ObjectId(id);

    const userCollection = await users();
    const userId = await userCollection.findOne({ _id: id });
    if (userId === null) throw "No user found";
    userId._id = userId._id.toString();

    return userId;
  },

  async updateUser(
    userId,
    firstName,
    lastName,
    email,
    phoneNumber,
    username,
    password,
    address,
    city,
    state,
    zip
  ) {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !username ||
      !password ||
      !address ||
      !city ||
      !state ||
      !zip
    ) {
      throw `Missing parameter`;
    }

    const usersCollection = await users();

    const uniqueIndex = await usersCollection.createIndex(
      { username: 1 },
      { unique: true }
    );

    username = username.toLowerCase();

    validateID(userId);
    checkIsProperString(firstName);
    checkIsProperString(lastName);
    checkIsProperString(address);
    checkIsProperString(city);
    checkIsProperString(username);
    checkIsProperString(password);

    if (
      common.xssCheck(firstName) ||
      common.xssCheck(lastName) ||
      common.xssCheck(email) ||
      common.xssCheck(phoneNumber) ||
      common.xssCheck(username) ||
      common.xssCheck(password) ||
      common.xssCheck(address) ||
      common.xssCheck(city) ||
      common.xssCheck(state) ||
      common.xssCheck(zip)
    ) {
      throw `XSS attempt`;
    }

    const phoneRegex = /^\d{10}$/im;
    const emailRegex =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    const zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;

    if (!phoneRegex.test(phoneNumber)) {
      throw `Incorrect phone number format`;
    }
    if (!emailRegex.test(email)) {
      throw `Incorrect email format`;
    }
    if (!zipRegex.test(zip)) {
      throw `Incorrect zip code`;
    }

    stateList = [
      "AL",
      "AK",
      "AZ",
      "AR",
      "CA",
      "CO",
      "CT",
      "DE",
      "DC",
      "FL",
      "GA",
      "HI",
      "ID",
      "IL",
      "IN",
      "IA",
      "KS",
      "KY",
      "LA",
      "ME",
      "MD",
      "MA",
      "MI",
      "MN",
      "MS",
      "MO",
      "MT",
      "NE",
      "NV",
      "NH",
      "NJ",
      "NM",
      "NY",
      "NC",
      "ND",
      "OH",
      "OK",
      "OR",
      "PA",
      "PR",
      "RI",
      "SC",
      "SD",
      "TN",
      "TX",
      "UT",
      "VT",
      "VA",
      "WA",
      "WV",
      "WI",
      "WY",
    ];

    found = false;

    for (let i = 0; i < stateList.length; i++) {
      if (state == stateList[i]) found = true;
    }

    if (found == false) {
      throw `State not found`;
    }

    userId = ObjectId(userId);
    const hash = await bcrypt.hash(password, saltRounds);

    let updatedUser = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phoneNumber: phoneNumber,
      username: username,
      password: hash,
      address: address,
      city: city,
      state: state,
      zip: zip,
      listings: [],
      bookings: [],
      reviews: [],
    };

    const userCollection = await users();

    const updateUser = await userCollection
      .updateOne({ _id: userId }, { $set: updatedUser })
      .catch(function (e) {
        throw "Username already exists";
      });
    if (updateUser.modifiedCount === 0) throw "Parking could not be updated";

    const newUser = await this.getUser(userId.toString());
    return newUser;
  },

  async deleteUser(userId = checkParameters()) {
    validateID(userId);
    userId = userId.trim();
    let result = {};
    userId = ObjectId(userId);

    const userCollection = await users();

    const checkUser = await this.getUser(userId.toString());
    if (!checkUser) throw "User info does not exists ";

    const deleteUser = await userCollection.deleteOne({ _id: userId });
    if (deleteUser.deletedCount == 0) {
      throw "Could not delete the User";
    } else {
      result.parkingId = checkUser._id;
      result.deleted = true;
    }
    return result;
  },

  //modified by sv user checks for password equal to 6 not accepting
  async checkUser(username, password) {
    username = username.toLowerCase();

    if (common.xssCheck(username) || common.xssCheck(password)) {
      throw `XSS attempt`;
    }

    checkIsProperString(username);
    username = username.toLowerCase();
    if (typeof username != "string" || typeof password != "string")
      throw "Error: Username or password must be string";
    if (username.length === 0 || username.length < 4)
      throw "Error: Username cannot be empty or length should be atleast 4 chars long";
    else if (/\s/.test(username)) throw "Error: Username cannot contain spaces";
    if (checkAlphanumerics(username)) {
      throw "Error: Username only accepts alphanumerics";
    }
    checkIsProperString(password);
    if (password.trim().length === 0 || password.length < 6)
      throw "Error: Password cannot be blanks or length should be atleast 6 chars long";
    else if (/\s/.test(password)) throw "Error: Password cannot contain spaces";

    let user = await get(username);
    if (user === null) {
      throw `Username not found`;
    }
    let compare = await bcrypt.compare(password, user.password);
    if (compare) {
      return user;
    } else throw `Incorrect Password`;
  },
};

module.exports = exportedMethods;
