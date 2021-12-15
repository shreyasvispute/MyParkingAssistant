const { ObjectId } = require("bson");
const mongoCollections = require("../config/mongoCollections");
const parkings = mongoCollections.parkings;
const { default: axios } = require("axios");
const settings = require("../config/settings.json");
const { json } = require("body-parser");
const apikey = settings.apikey;
const geocodingKey = settings.geocodingKey;
const common = require("./common");

//get distance from google
async function getDistance(p1, p2) {
  const { data } = await axios
    .get(
      "https://maps.googleapis.com/maps/api/distancematrix/json?origins=Washington%2C%20DC&destinations=New%20York%20City%2C%20NY&units=imperial&key=" +
        apikey +
        ""
    )
    .catch(function (error) {
      throw "Error: " + error;
    });
  return JSON.stringify(data);
}

//geocoding api
async function getcodes(address) {
  const params = {
    access_key: geocodingKey,
    query: address,
  };

  const { data } = await axios
    .get("http://api.positionstack.com/v1/forward", { params })
    .catch((error) => {
      throw error;
    });
  return data;
}

//get parkings by city/state/zipcode - Dashboard Route
async function getParkingsByCityStateZip(
  city,
  state,
  zipcode,
  parkingType = checkParameters()
) {
  if (
    common.xssCheck(city) ||
    common.xssCheck(state) ||
    common.xssCheck(zipcode) ||
    common.xssCheck(parkingType)
  ) {
    throw `XSS Attempt`;
  }

  let q = {};
  q["$and"] = [];

  const zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
  //string and trim length checks
  if (
    typeof zipcode != "string" ||
    typeof city != "string" ||
    typeof state != "string" ||
    typeof parkingType != "string"
  ) {
    throw "Parameter of defined type not found";
  }
  //state validator
  if (city != "") {
    if (city.trim().length === 0) throw "City cannot be blanks";
    else {
      q["$and"].push({ city: new RegExp(city) });
    }
  }

  //state validator+
  if (state != "") {
    if (stateList.indexOf(state.toUpperCase()) == -1) {
      throw "State not found";
    } else {
      q["$and"].push({ state: state });
    }
  }
  if (zipcode != "") {
    //zip code validator
    if (!zipRegex.test(zipcode)) {
      throw "Incorrect zip code";
    } else {
      q["$and"].push({ zip: zipcode });
    }
  }
  //parking type validator
  if (parkingType != "") {
    if (
      !parkingType.toLowerCase() === "open" ||
      !parkingType.toLowerCase() === "closed"
    ) {
      throw "Parking type only accepts open and closed as values";
    } else {
      q["$and"].push({ parkingType: parkingType });
    }
  }
  const parkingCollection = await parkings();
  let listedParkings;
  //if (city != "") {
  listedParkings = await parkingCollection.find(q).toArray();
  //} else {
  //  listedParkings = await parkingCollection.find(noCityFilter).toArray();
  //}

  if (listedParkings === null) throw "No parking found";
  //parkingId._id = parkingId._id.toString();

  return listedParkings;
}

//get parkings of logged in users
async function getParkingbyUser(userId, parkingId = checkParameters()) {
  userId = userId.trim();
  parkingId = parkingId.trim();

  validateID(userId);
  validateID(parkingId);

  userId = ObjectId(userId);
  parkingId = ObjectId(parkingId);

  const parkingCollection = await parkings();
  const parkingsbyUser = await parkingCollection.findOne({
    _id: parkingId,
    listerId: userId,
  });
  if (parkingsbyUser === null) throw "No parkings found";
  return parkingsbyUser;
}

//get Parking based on listerid
async function getParkingsOfLister(id = checkParameters()) {
  id = id.trim();
  validateID(id);
  id = ObjectId(id);

  const parkingCollection = await parkings();
  const listedParkings = await parkingCollection
    .find({ listerId: id })
    .toArray();

  if (listedParkings === null) throw "No parking found";
  //parkingId._id = parkingId._id.toString();

  return listedParkings;
}

//get Parking based on id
async function getParking(id = checkParameters()) {
  id = id.trim();
  validateID(id);
  id = ObjectId(id);

  const parkingCollection = await parkings();
  const parkingId = await parkingCollection.findOne({ _id: id });

  if (parkingId === null) throw "No parking found";
  parkingId._id = parkingId._id.toString();

  return parkingId;
}

//create parkings
async function createParkings(
  listerId,
  parkingImg,
  address,
  city,
  state,
  zip,
  longitude,
  latitude,
  vehicleType,
  parkingType = checkParameters()
) {
  //trim values to reject blank spaces or empty
  parkingImg = parkingImg.trim();
  state = state.trim().toUpperCase();
  zip = zip.trim();
  longitude = longitude.trim(); //optional to be filled by Geolocation API
  latitude = latitude.trim(); ////optional to be filled by Geolocation API
  parkingType = parkingType.trim().toLowerCase();

  validateID(listerId);

  listerId = ObjectId(listerId);
  validate(
    parkingImg,
    address.toLowerCase(),
    city.toLowerCase(),
    state.toUpperCase(),
    zip,
    longitude,
    latitude,
    vehicleType,
    parkingType
  );

  let newParking = {
    listerId: listerId,
    listing: [],
    parkingImg,
    overallRating: "0.0",
    address,
    city,
    zip,
    state,
    longitude,
    latitude,
    vehicleType,
    parkingType,
    parkingReviews: [],
  };

  const parkingCollection = await parkings();
  const insertParking = await parkingCollection.insertOne(newParking);
  if (insertParking.insertedCount === 0) throw "Error adding parking";

  const newParkingId = insertParking.insertedId;
  const newParkingData = await getParking(newParkingId.toString());

  return newParkingData;
}

//update parkings with parameters
async function updateParking(
  parkingId,
  listerId,
  parkingImg,
  address,
  city,
  state,
  zip,
  longitude,
  latitude,
  category,
  parkingType = checkParameters()
) {
  //trim values to reject blank spaces or empty
  listerId = listerId.trim();
  parkingImg = parkingImg.trim();
  state = state.trim().toUpperCase();
  zip = zip.trim();
  longitude = longitude.trim(); //optional to be filled by Geolocation API
  latitude = latitude.trim(); ////optional to be filled by Geolocation API

  validateID(parkingId);
  validateID(listerId);

  validate(
    parkingImg,
    address,
    city,
    state,
    zip,
    longitude,
    latitude,
    category,
    parkingType
  );

  //check if parking exists
  const parkingCollection = await parkings();
  const checkParking = await getParkingbyUser(listerId, parkingId);

  if (!checkParking) throw "Parking not available";
  parkingId = ObjectId(parkingId);

  let updateParkingObj = {
    listerId: ObjectId(listerId),
    parkingImg: parkingImg,
    address: address,
    city: city,
    state: state,
    zip: zip,
    longitude: longitude,
    latitude: latitude,
    vehicleType: category,
    parkingType: parkingType,
  };

  //update parkings
  const updateParking = await parkingCollection.updateOne(
    { _id: parkingId },
    { $set: updateParkingObj }
  );
  if (!updateParking) throw "Parking could not be updated";

  const newParking = await getParking(parkingId.toString());

  return newParking;
}

//delete parkings with id
async function deleteParking(parkingId = checkParameters()) {
  if (common.xssCheck(parkingId)) {
    throw `XSS Attempt`;
  }

  validateID(parkingId);
  parkingId = parkingId.trim();
  let result = {};
  parkingId = ObjectId(parkingId);

  const parkingCollection = await parkings();

  //check if parking exists
  const checkparking = await getParking(parkingId.toString());
  if (!checkparking) throw "Parking info does not exists ";

  //delete parking
  const deleteParking = await parkingCollection.deleteOne({ _id: parkingId });
  if (deleteParking.deletedCount == 0) {
    throw "Could not delete the parking";
  } else {
    result.parkingId = checkparking._id;
    result.deleted = true;
  }
  return result;
}

//validate inputs
function validate(
  parkingImg,
  address,
  city,
  state,
  zip,
  longitude,
  latitude,
  category,
  parkingType
) {
  if (
    common.xssCheck(parkingImg) ||
    common.xssCheck(address) ||
    common.xssCheck(city) ||
    common.xssCheck(state) ||
    common.xssCheck(zip) ||
    common.xssCheck(latitude) ||
    common.xssCheck(longitude) ||
    common.xssCheck(parkingType)
  ) {
    throw `XSS Attempt`;
  }

  category.forEach((x) => {
    if (common.xssCheck(x)) {
      throw `XSS Attempt`;
    }
  });

  const zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
  const longLatRegex = new RegExp("^-?([1-8]?[1-9]|[1-9]0)\\.{1}\\d{1,6}");
  const addressRegex = /[A-Za-z0-9'\.\-\s\,]/;
  const cityRegex = /^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/;

  //string and trim length checks
  if (
    typeof parkingImg != "string" ||
    typeof address != "string" ||
    typeof city != "string" ||
    typeof state != "string" ||
    typeof parkingType != "string" ||
    typeof longitude != "string" ||
    typeof latitude != "string" ||
    typeof parkingImg != "string"
  ) {
    throw "Parameter of defined type not found";
  } else if (
    parkingImg.trim().length === 0 ||
    address.trim().length === 0 ||
    city.trim().length === 0 ||
    state.trim().length === 0 ||
    parkingType.trim().length === 0 ||
    longitude.trim().length === 0 ||
    latitude.trim().length === 0 ||
    parkingImg.trim().length === 0
  ) {
    throw "Parameter cannot be blank spaces or empty values";
  }

  //state validator
  if (typeof state === "string") {
    if (stateList.indexOf(state) == -1) {
      throw "State not found";
    }
  }

  if (
    !addressRegex.test(address) ||
    address.length < 4 ||
    address.length > 35
  ) {
    throw "Address contains random characters or length is less than 4";
  }

  if (!cityRegex.test(city) || city.length > 30) {
    throw "City contains random characters or length is greater than 30";
  }

  //zip code validator
  if (!zipRegex.test(zip)) {
    throw "Incorrect zip code";
  }

  if (!longLatRegex.test(latitude)) {
    throw "Incorrect latitude";
  }

  if (!longLatRegex.test(longitude)) {
    throw "Incorrect longitude";
  }

  if (!/\.(jpg)$/i.test(parkingImg)) {
    throw "Picture not defined or only jpg files allowed";
  }

  if (Array.isArray(category) && category.length > 1) {
    //vehicletype validator
    category.forEach((x) => {
      if (typeof x != "string") throw "Vehicle type must be a string";
      if (x.trim().length === 0) throw "Vehicle type cannot be empty or blanks";
    });
    category = category.map((X) => X.toLowerCase());

    if (!vehicleType.includes(...category)) throw "Vehicle type not found";
  } else {
    throw "Vehicle type must be an array having atleast 2 string!";
  }

  //parkingtype validator
  if (
    !parkingType.toLowerCase() === "open" ||
    !parkingType.toLowerCase() === "closed"
  ) {
    throw "Parking type only accepts open and closed as values";
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

//check for defined parameters else throw error
function checkParameters() {
  throw "Expected arguments not found";
}

const stateList = [
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
const vehicleType = [
  "sedan",
  "suv",
  "hatchback",
  "station wagon",
  "coupe",
  "minivan",
  "pickup truck",
];

module.exports = {
  createParkings,
  getParking,
  updateParking,
  deleteParking,
  getParkingsOfLister,
  getParkingsByCityStateZip,
  getParkingbyUser,
  getDistance,
  getcodes,
};
