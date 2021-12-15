const express = require("express");
const router = express.Router();
const { ObjectId } = require("bson");
const parkingsData = require("../data/parkings");
const common = require("../data/common");
const path = require("path");
const sessionStorage = require("sessionstorage");

//added by sv

//image saving logic
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "./public/images",
  filename: function (req, file, callback) {
    const fullName = file.fieldname + "-" + Date.now() + ".jpg";
    callback(null, fullName);
  },
});

const upload = multer({
  fileFilter: function (req, file, cb) {
    const fileTypes = /png|jpeg|jpg/;
    const extName = fileTypes.test(path.extname(file.originalname));
    file.originalname.toLowerCase();
    const mimeType = fileTypes.test(file.mimetype);
    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb("Error: only png, jpeg, and jpg are allowed!");
    }
  },
  storage: storage,
});

//get the lister id
router.get("/", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/users/login");
    }
    if (!req.query.deleted) {
      req.query.deleted = false;
    }
    const listerId = req.session.user.userId;
    let validId = validate(listerId);
    if (!validId) {
      res.status(400).render("pages/parkings/getParkings", {
        partial: "emptyPartial",
        session: req.session.user.userId,
        title: "My Parkings",
        states: stateList,
        success: false,
        errmsg: `<div class="container alert alert-alert"><p class="empty">Id must be a valid object Id</p></div>`,
      });
      return;
    }
    //username calls user table and fetches lister id to get parkings from logged in user
    //await listingsData.sendReportingMail();
    const getData = await parkingsData.getParkingsOfLister(listerId);
    res.render("pages/parkings/getParkings", {
      partial: "emptyPartial",
      parkdata: getData,
      session: req.session.user.userId,
      title: "My Parkings",
      states: stateList,
      success: req.query.deleted,
      successmsg: `<div class="container alert alert-success"><p class="empty">Parking Deleted</p></div>`,
    });
  } catch (error) {
    res.status(500).render("pages/parkings/getParkings", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      title: "My Parkings",
      states: stateList,
      success: false,
      errmsg: `<div class="container alert alert-alert"><p class="empty">${error}</p></div>`,
    });
    return;
  }
});

router.get("/create", async (req, res) => {
  try {
    res.render("pages/parkings/createParkings", {
      partial: "createParking",
      session: req.session.user.userId,
      title: "Create Parking",
      states: stateList,
    });
  } catch (error) {
    res.status(404).render("pages/error", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      title: "Error",
      errmsg: `<div class="container alert alert-alert"><p class="empty">Page Not found</p></div>`,
    });
  }
});

router.get("/edit/:id", async (req, res) => {
  try {
    let validId = validate(req.params.id);

    if (common.xssCheck(req.params.id)) {
      res.status(400).render("pages/parkings/editParkings", {
        partial: "editParkings",
        session: req.session.user.userId,
        title: "Edit Parking",
        error: true,
        errormsg: "XSS violations found",
      });
      return;
    }

    if (!validId) {
      res.status(400).render("pages/parkings/editParkings", {
        partial: "editParkings",
        session: req.session.user.userId,
        title: "Edit Parking",
        error: true,
        errormsg: "Id must be a valid string and an Object Id",
      });
      return;
    }

    if (!req.session.user) {
      return res.redirect("/users/login");
    }

    const listerId = req.session.user.userId;
    let validListerId = validate(listerId);
    if (!validListerId) {
      res.status(400).render("pages/parkings/editParkings", {
        partial: "editParkings",
        session: req.session.user.userId,
        title: "Edit Parking",
        error: true,
        errormsg: "Id must be a valid string and an Object Id",
      });
      return;
    }

    //session user id
    const getData = await parkingsData.getParkingbyUser(
      listerId,
      req.params.id
    );

    let optionVehicleType = "";
    vehicleType.forEach((x) => {
      if (getData.vehicleType.includes(x)) {
        optionVehicleType += `<option selected>${x}</option>`;
      } else {
        optionVehicleType += `<option>${x}</option>`;
      }
    });

    let optionStateList = "";
    stateList.forEach((x) => {
      if (getData.state.includes(x)) {
        optionStateList += `<option selected>${x}</option>`;
      } else {
        optionStateList += `<option>${x}</option>`;
      }
    });

    let optionParkingType = "";
    let parkingTypeArray = ["open", "closed"];
    parkingTypeArray.forEach((x) => {
      if (getData.parkingType.includes(x)) {
        optionParkingType += `<option selected>${x}</option>`;
      } else {
        optionParkingType += `<option>${x}</option>`;
      }
    });

    res.render("pages/parkings/editParkings", {
      partial: "editParkings",
      session: req.session.user.userId,
      title: "Edit Parking",
      states: optionStateList,
      parkingtype: optionParkingType,
      vehicleType: optionVehicleType,
      data: getData,
      error: false,
    });
  } catch (error) {
    res.status(404).render("pages/parkings/editParkings", {
      partial: "editParkings",
      session: req.session.user.userId,
      title: "Edit Parking",
      error: true,
      errormsg: "No data found",
    });
    return;
  }
});

//get parkings
router.get("/:id", async (req, res) => {
  let isReviewer = false;
  if (!req.params.id) {
    res.status(400).render("pages/parkings/parkingDetails", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      title: "Parking Details",
      error: true,
      errormsg: "You must supply a parking Id",
    });
    return;
  }
  let validId = validate(req.params.id);
  if (!validId) {
    res.status(400).render("pages/parkings/parkingDetails", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      title: "Parking Details",
      error: true,
      errormsg: "Id must be a valid string and an Object Id",
    });
    return;
  }

  if (common.xssCheck(req.params.id)) {
    res.status(400).render("pages/parkings/parkingDetails", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      title: "Parking Details",
      isReviewer: true,
      userLoggedIn: true,
      error: true,
      errormsg: "XSS violations found",
    });

    return;
  }

  try {
    const getData = await parkingsData.getParking(req.params.id);
    // if (global && global.sessionStorage) {
    sessionStorage.setItem("parkingId", getData._id);
    // }
    for (let key in getData) {
      if (key === "parkingReviews" && Array.isArray(getData[key])) {
        getData[key].forEach((element) => {
          if (req.session.user.userId === element.userId) {
            console.log("inside if statement of foreach");
            isReviewer = true;
            element.isReviewer = true;
          } else {
            isReviewer = false;
            element.isReviewer = false;
          }
        });
      }
    }
    getData.parkingReviews.reverse();

    res.render("pages/parkings/parkingDetails", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      parkdata: getData,
      title: "Parking Details",
      userLoggedIn: true,
    });
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

//post parkings route
router.post("/post", upload.single("parkingImg"), async function (req, res) {
  const parkingPostData = req.body;
  let error = false;

  if (!parkingPostData.address) {
    res.status(400).render("pages/parkings/createParkings", {
      partial: "createParking",
      session: req.session.user.userId,
      title: "Create Parking",
      states: stateList,
      error: true,
      errmsg: "You must provide address",
    });
    return;
  }
  if (!parkingPostData.city) {
    res.status(400).render("pages/parkings/createParkings", {
      partial: "createParking",
      session: req.session.user.userId,
      title: "Create Parking",
      states: stateList,
      error: true,
      errmsg: "You must provide city",
    });
    return;
  }
  if (!parkingPostData.state) {
    res.status(400).render("pages/parkings/createParkings", {
      partial: "createParking",
      session: req.session.user.userId,
      title: "Create Parking",
      states: stateList,
      error: true,
      errmsg: "You must provide state",
    });
    return;
  }
  if (!parkingPostData.zip) {
    res.status(400).render("pages/parkings/createParkings", {
      partial: "createParking",
      session: req.session.user.userId,
      title: "Create Parking",
      states: stateList,
      error: true,
      errmsg: "You must provide zip",
    });
    return;
  }
  if (!parkingPostData.category) {
    res.status(400).render("pages/parkings/createParkings", {
      partial: "createParking",
      session: req.session.user.userId,
      title: "Create Parking",
      states: stateList,
      error: true,
      errmsg: "You must provide category",
    });
    return;
  }
  if (!parkingPostData.parkingType) {
    res.status(400).render("pages/parkings/createParkings", {
      partial: "createParking",
      session: req.session.user.userId,
      title: "Create Parking",
      states: stateList,
      error: true,
      errmsg: "You must provide parking type",
    });
    return;
  }

  try {
    if (
      common.xssCheck(parkingPostData.address) ||
      common.xssCheck(parkingPostData.city) ||
      common.xssCheck(parkingPostData.state) ||
      common.xssCheck(parkingPostData.zip) ||
      common.xssCheck(parkingPostData.parkingType)
    ) {
      res.status(400).render("pages/parkings/createParkings", {
        partial: "createParking",
        session: req.session.user.userId,
        title: "Create Parking",
        states: stateList,
        error: true,
        errmsg: "XSS violations found",
      });
      return;
    }

    parkingPostData.category.forEach((x) => {
      if (common.xssCheck(x)) {
        res.status(400).render("pages/parkings/createParkings", {
          partial: "createParking",
          session: req.session.user.userId,
          title: "Create Parking",
          states: stateList,
          error: true,
          errmsg: "XSS violations found",
        });
        return;
      }
    });

    let {
      address,
      city,
      state,
      zip,
      longitude,
      latitude,
      category,
      parkingType,
    } = parkingPostData;

    let parkingImg = !req.file
      ? "public/images/no_image.jpg"
      : req.file.path.split("\\").join("/");

    let validateString = validateArguments(
      address,
      city,
      state,
      zip,
      category,
      parkingType,
      parkingImg
    );

    if (validateString != undefined) {
      res.status(400).render("pages/parkings/createParkings", {
        partial: "createParking",
        session: req.session.user.userId,
        title: "Create Parking",
        states: stateList,
        error: true,
        errmsg: validateString,
      });
      return;
    }

    if (!req.session.user) {
      return res.redirect("/users/login");
    }

    const listerId = req.session.user.userId;
    let validListerId = validate(listerId);
    if (!validListerId) {
      res.status(400).render("pages/parkings/createParkings", {
        partial: "createParking",
        session: req.session.user.userId,
        title: "Create Parking",
        states: stateList,
        error: true,
        errmsg: "Id must be a valid string and an Object Id",
      });
      return;
    }

    //Get geolocation information
    let geoAddress =
      parkingPostData.address +
      "," +
      parkingPostData.city +
      "," +
      parkingPostData.state +
      "," +
      "USA";

    const geocodes = await parkingsData.getcodes(geoAddress);

    geocodes.data.forEach((x) => {
      (longitude = x.longitude), (latitude = x.latitude);
    });

    const postParkings = await parkingsData.createParkings(
      listerId,
      parkingImg,
      address.toLowerCase(),
      city.toLowerCase(),
      state.toUpperCase(),
      zip,
      longitude.toString(),
      latitude.toString(),
      category,
      parkingType.toLowerCase()
    );
    res.render("pages/parkings/createParkings", {
      partial: "createParking",
      session: req.session.user.userId,
      title: "Create Parking",
      states: stateList,
      success: true,
    });
    return;
  } catch (e) {
    res.status(500).render("pages/parkings/createParkings", {
      partial: "createParking",
      session: req.session.user.userId,
      title: "Create Parking",
      states: stateList,
      error: true,
      errmsg: e,
    });
    return;
  }
});

//update parkings
router.put("/update", upload.single("parkingImg"), async (req, res) => {
  const updatedData = req.body;
  let validListerId = validate(updatedData.listerId);
  let error = false;
  if (!validListerId) {
    res.status(400).render("pages/parkings/editParkings", {
      title: "Edit Parking",
      partial: "editParkings",
      session: req.session.user.userId,
      error: true,
      errormsg: "Lister Id must be a valid string and an Object Id",
    });
    return;
  }
  if (!req.file) {
    updatedData.parkingImg =
      updatedData.parkingImghidden == ""
        ? "public/images/no_image.jpg"
        : updatedData.parkingImghidden;
  } else {
    updatedData.parkingImg = req.file.path.split("\\").join("/");
  }

  if (
    !updatedData.address ||
    !updatedData.city ||
    !updatedData.state ||
    !updatedData.zip ||
    !updatedData.category ||
    !updatedData.parkingType
  ) {
    res.status(400).render("pages/parkings/editParkings", {
      title: "Edit Parking",
      partial: "editParkings",
      session: req.session.user.userId,
      error: true,
      errormsg: "You must supply all fields",
    });
    return;
  }

  let validateString = validateArguments(
    updatedData.address,
    updatedData.city,
    updatedData.state,
    updatedData.zip,
    updatedData.category,
    updatedData.parkingType,
    updatedData.parkingImg
  );

  if (validateString != undefined) {
    res.status(400).render("pages/parkings/editParkings", {
      title: "Edit Parking",
      partial: "editParkings",
      session: req.session.user.userId,
      error: true,
      errormsg: validateString,
    });
    return;
  }

  try {
    await parkingsData.getParkingbyUser(
      updatedData.listerId,
      updatedData.parkingId
    );
  } catch (e) {
    res.status(404).render("pages/parkings/editParkings", {
      partial: "editParkings",
      session: req.session.user.userId,
      title: "Edit Parking",
      error: true,
      errormsg: e,
    });
    return;
  }
  try {
    let geoAddress =
      updatedData.address +
      "," +
      updatedData.city +
      "," +
      updatedData.state +
      "," +
      "USA";

    const geocodes = await parkingsData.getcodes(geoAddress);

    geocodes.data.forEach((x) => {
      (updatedData.longitude = x.longitude),
        (updatedData.latitude = x.latitude);
    });
  } catch (error) {
    res.status(500).render("pages/parkings/editParkings", {
      title: "Edit Parking",
      partial: "editParkings",
      session: req.session.user.userId,
      error: true,
      errormsg: "Internal Server Error",
    });
    return;
  }
  try {
    if (
      common.xssCheck(updatedData.parkingImg) ||
      common.xssCheck(updatedData.listerId) ||
      common.xssCheck(updatedData.parkingId) ||
      common.xssCheck(updatedData.address) ||
      common.xssCheck(updatedData.city) ||
      common.xssCheck(updatedData.state) ||
      common.xssCheck(updatedData.zip) ||
      common.xssCheck(updatedData.latitude.toString()) ||
      common.xssCheck(updatedData.longitude.toString()) ||
      common.xssCheck(updatedData.parkingType)
    ) {
      res.status(400).render("pages/parkings/editParkings", {
        title: "Edit Parking",
        partial: "editParkings",
        session: req.session.user.userId,
        error: true,
        errormsg: "XSS violations found",
      });
      return;
    }
    updatedData.category.forEach((x) => {
      if (common.xssCheck(x)) {
        res.status(400).render("pages/parkings/editParkings", {
          title: "Edit Parking",
          partial: "editParkings",
          session: req.session.user.userId,
          error: true,
          errormsg: "XSS violations found",
        });
        return;
      }
    });

    const updatedParking = await parkingsData.updateParking(
      updatedData.parkingId,
      updatedData.listerId,
      updatedData.parkingImg,
      updatedData.address.toLowerCase(),
      updatedData.city.toLowerCase(),
      updatedData.state.toUpperCase(),
      updatedData.zip,
      updatedData.longitude.toString(),
      updatedData.latitude.toString(),
      updatedData.category,
      updatedData.parkingType.toLowerCase()
    );

    let vehicleType = [
      "sedan",
      "suv",
      "hatchback",
      "station wagon",
      "coupe",
      "minivan",
      "pickup truck",
    ];

    let optionVehicleType = "";
    vehicleType.forEach((x) => {
      if (updatedParking.vehicleType.includes(x)) {
        optionVehicleType += `<option selected>${x}</option>`;
      } else {
        optionVehicleType += `<option>${x}</option>`;
      }
    });
    let optionStateList = "";
    stateList.forEach((x) => {
      if (updatedParking.state.includes(x)) {
        optionStateList += `<option selected>${x}</option>`;
      } else {
        optionStateList += `<option>${x}</option>`;
      }
    });

    let optionParkingType = "";
    let parkingTypeArray = ["open", "closed"];
    parkingTypeArray.forEach((x) => {
      if (updatedParking.parkingType.includes(x)) {
        optionParkingType += `<option selected>${x}</option>`;
      } else {
        optionParkingType += `<option>${x}</option>`;
      }
    });

    res.render("pages/parkings/editParkings", {
      partial: "editParkings",
      session: req.session.user.userId,
      title: "Edit Parking",
      error: false,
      data: updatedParking,
      success: true,
      states: optionStateList,
      parkingtype: optionParkingType,
      vehicleType: optionVehicleType,
    });
    return;
  } catch (e) {
    res.status(500).render("pages/parkings/editParkings", {
      title: "Edit Parking",
      partial: "editParkings",
      session: req.session.user.userId,
      error: true,
      errormsg: e,
    });
    return;
  }
});

//delete parkings
router.delete("/delete/:id", async (req, res) => {
  if (common.xssCheck(req.params.id)) {
    res.status(400).render("pages/parkings/getParkings", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      title: "My Parkings",
      success: false,
      errmsg: `<div class="container alert alert-danger"><p class="empty">XSS Attempt</p></div>`,
    });
    return;
  }

  if (!req.params.id) {
    res.status(400).render("pages/parkings/getParkings", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      title: "My Parkings",
      success: false,
      errmsg: `<div class="container alert alert-danger"><p class="empty">You must supply a parking Id</p></div>`,
    });
    return;
  }
  let validResult = validate(req.params.id);
  if (!validResult) {
    res.status(400).render("pages/parkings/getParkings", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      title: "My Parkings",
      success: false,
      errmsg: `<div class="container alert alert-danger"><p class="empty">Id must be a valid string and an Object Id</p></div>`,
    });
    return;
  }
  try {
    const listerId = req.session.user.userId;
    let validListerId = validate(listerId);
    if (!validListerId) {
      res.status(400).render("pages/parkings/getParkings", {
        partial: "emptyPartial",
        session: req.session.user.userId,
        title: "My Parkings",
        success: false,
        errmsg: `<div class="container alert alert-danger"><p class="empty">Id must be a valid string and an Object Id</p></div>`,
      });
      return;
    }

    //session user id
    const getData = await parkingsData.getParkingbyUser(
      listerId,
      req.params.id
    );

    const deleteData = await parkingsData.deleteParking(req.params.id);

    if (deleteData.deleted) {
      const getParkingData = await parkingsData.getParkingsOfLister(listerId);
      return res.redirect("/parkings?deleted=true");
    } else {
      res.status(500).render("pages/parkings/getParkings", {
        partial: "emptyPartial",
        session: req.session.user.userId,
        title: "My Parkings",
        success: false,
        successmsg: `<div class="container alert alert-danger successmsg"><p class="empty">Parking could not be deleted</p></div>`,
      });
      return;
    }
  } catch (error) {
    res.status(404).render("pages/parkings/getParkings", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      title: "My Parkings",
      success: false,
      errmsg: `<div class="container alert alert-danger"><p class="empty">Data not found</p></div>`,
    });
    return;
  }
});

function validate(id) {
  if (typeof id != "string") {
    return false;
  } else if (id.trim().length === 0) {
    return false;
  } else if (!ObjectId.isValid(id)) {
    return false;
  } else return true;
}

//validate inputs
function validateArguments(
  address,
  city,
  state,
  zip,
  category,
  parkingType,
  parkingImg
) {
  const zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
  const addressRegex = /[A-Za-z0-9'\.\-\s\,]/;
  const cityRegex = /^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/;

  if (
    typeof address != "string" ||
    typeof city != "string" ||
    typeof state != "string" ||
    typeof parkingImg != "string"
  ) {
    return "Parameter of defined type not found";
    //        parkingImg.length === 0 ||
  } else if (
    address.trim().length === 0 ||
    city.trim().length === 0 ||
    state.trim().length === 0 ||
    parkingImg.trim().length === 0
  ) {
    return "Parameter cannot be blank spaces or empty values";
  }

  if (
    !addressRegex.test(address) ||
    address.length < 4 ||
    address.length > 35
  ) {
    return "Address contains random characters or length is less than 4";
  }

  if (!cityRegex.test(city) || city.length > 30) {
    return "City contains random characters or length is greater than 30";
  }

  //state validator
  if (typeof state === "string") {
    if (stateList.indexOf(state) == -1) {
      return "State not found";
    }
  }
  if (!/\.(jpg)$/i.test(parkingImg)) {
    return "Picture not defined or only jpg files allowed";
  }

  //zip code validator
  if (!zipRegex.test(zip)) {
    return "Incorrect zip code";
  }

  //vehicletype validator
  if (Array.isArray(category) && category.length > 1) {
    const isString = (x) => typeof x == "string" && x.trim().length != 0;
    if (!category.every(isString)) {
      return "vehicletype must contain strings!";
    }
    category = category.map((X) => X.toLowerCase());
    if (!vehicleType.includes(...category)) {
      return "vehicle type must contain values from dropdown";
    }
  } else {
    return "vehicletype must be an array having atleast 2 string!";
  }

  //parkingtype validator
  if (
    !parkingType.toLowerCase() === "open" ||
    !parkingType.toLowerCase() === "closed"
  ) {
    return "Parking type only accepts open and closed as values";
  }
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

module.exports = router;
