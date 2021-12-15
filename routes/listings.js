const express = require("express");
const router = express.Router();
const listingsData = require("../data/listings");
const usersData = require("../data/users");
const common = require("../data/common");
let { ObjectId } = require("mongodb");
const session = require("express-session");
const sessionStorage = require("sessionstorage");

const timeSlot = [
  00, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  19, 20, 21, 22, 23, 24,
];

router.get("/createListingPage", async (req, res) => {
  try {
    res.render("pages/parkings/createListing", {
      partial: "emptyPartial",
      startTimeVal: timeSlot,
      endTimeVal: timeSlot,
      session: req.session.user.userId,
      title: "Create Listing",
    });
  } catch (e) {
    res.status(400).render("pages/parkings/createListing", {
      error: e,
      session: req.session.user.userId,
      startTimeVal: timeSlot,
      endTimeVal: timeSlot,
      hasErrors: true,
      title: "Create Listing",
      partial: "emptyPartial",
    });
  }
});

router.post("/createListing", async (req, res) => {
  const requestBody = req.body;
  let parkingId;

  parkingId = sessionStorage.getItem("parkingId");
  userId = req.session.user.userId;

  let startDate = requestBody.startDate;
  let endDate = requestBody.endDate;
  let startTime = requestBody.startTime;
  let endTime = requestBody.endTime;
  let price = parseInt(requestBody.price);

  try {
    if (
      !userId ||
      !parkingId ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      !price
    ) {
      throw `Missing parameter`;
    }

    common.checkObjectId(parkingId);
    common.checkObjectId(userId);
    var today = new Date();
    common.checkInputDate(today, startDate, 1);
    common.checkInputDate(startDate, endDate, 0);
    common.checkInputTime(startTime);
    common.checkInputTime(endTime);
    common.checkIsProperNumber(price);
  } catch (e) {
    res.status(400).render("pages/parkings/createListing", {
      partial: "createListing",
      session: req.session.user.userId,
      hasErrors: true,
      error: e,
      startTimeVal: timeSlot,
      endTimeVal: timeSlot,
      title: "Create Listing",
    });
    return;
  }

  try {
    const data = await listingsData.createListing(
      userId,
      parkingId,
      startDate,
      endDate,
      startTime,
      endTime,
      price
    );
    if (!data) {
      res.status(404).render("pages/parkings/createListing", {
        partial: "createListing",
        session: req.session.user.userId,
        error: "Could not create listing",
        title: "Create Listing",
        startTimeVal: timeSlot,
        endTimeVal: timeSlot,
        hasErrors: true,
      });
      return;
    }
    res.render("pages/parkings/listings", {
      partial: "createListing",
      session: req.session.user.userId,
      getData: data,
      title: "Listing",
    });
  } catch (e) {
    res.status(400).render("pages/parkings/createListing", {
      partial: "emptyPartial",
      error: e,
      partial: "createListing",
      session: req.session.user.userId,
      startTimeVal: timeSlot,
      endTimeVal: timeSlot,
      hasErrors: true,
      title: "Create Listing",
    });
  }
});

router.get("/getMyBookings", async (req, res) => {
  userId = req.session.user.userId;
  try {
    if (!userId) {
      throw `Missing parameter`;
    }
    common.checkObjectId(userId);
  } catch (e) {
    res.status(400).render("pages/parkings/showBookings", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      hasErrors: true,
      error: e,
      title: "My Bookings",
    });
    return;
  }

  try {
    const data = await listingsData.getMyBookings(userId);
    res.render("pages/parkings/showBookings", {
      partial: "emptyPartial",
      bookingdata: data,
      session: req.session.user.userId,
      title: "My Bookings",
    });
  } catch (e) {
    res.status(400).render("pages/parkings/showBookings", {
      partial: "emptyPartial",
      error: e,
      session: req.session.user.userId,
      hasErrors: true,
      title: "My Bookings",
    });
  }
});

router.get("/getMyListings", async (req, res) => {
  userId = req.session.user.userId;
  try {
    if (!userId) {
      throw `Missing parameter`;
    }
    common.checkObjectId(userId);
  } catch (e) {
    res.status(400).render("pages/parkings/showListings", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      hasErrors: true,
      error: e,
      title: "My Listings",
    });
    return;
  }

  try {
    const data = await listingsData.getMyListings(userId);
    res.render("pages/parkings/showListings", {
      partial: "emptyPartial",
      bookingdata: data,
      session: req.session.user.userId,
      title: "My Listings",
    });
  } catch (e) {
    res.status(400).render("pages/parkings/showListings", {
      partial: "emptyPartial",
      error: e,
      session: req.session.user.userId,
      hasErrors: true,
      title: "My Listings",
    });
  }
});

router.get("/getAllListing/:id", async (req, res) => {
  let parkingId = req.params.id;
  sessionStorage.setItem("parkingId", parkingId);

  try {
    if (!parkingId) {
      throw `Missing parameter`;
    }
    common.checkObjectId(parkingId);
  } catch (e) {
    res.status(400).render("pages/parkings/listings", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      hasErrors: true,
      error: e,
      title: "Listing",
    });
    return;
  }

  try {
    const data = await listingsData.getAllListings(parkingId);
    if (!data) {
      res.status(404).render("pages/parkings/listings", {
        partial: "emptyPartial",
        error: "No data found.",
        session: req.session.user.userId,
        hasErrors: true,
        title: "Listing",
      });
      return;
    }
    res.render("pages/parkings/listings", {
      partial: "emptyPartial",
      getData: data,
      title: "Listing",
      session: req.session.user.userId,
    });
  } catch (e) {
    res
      .status(400)
      .render("pages/parkings/listings", {
        error: e,
        partial: "emptyPartial",
        session: req.session.user.userId,
        hasErrors: true,
        title: "Listing",
      });
  }
});

router.get("/getListing/:id", async (req, res) => {
  let listingId = req.params.id;
  try {
    if (!listingId) {
      throw `Missing parameter`;
    }
    common.checkObjectId(listingId);
  } catch (e) {
    res.status(400).render("pages/parkings/listings", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      hasErrors: true,
      error: e,
      title: "Listing",
    });
    return;
  }
  try {
    const data = await listingsData.getListing(listingId);
    if (!data) {
      res.status(404).render("pages/parkings/listings", {
        partial: "emptyPartial",
        error: "No data found.",
        session: req.session.user.userId,
        hasErrors: true,
        title: "Listing",
      });
      return;
    }
    res.render("pages/parkings/listingDetail", {
      partial: "emptyPartial",
      data: data,
      title: "Book Listing",
      session: req.session.user.userId,
    });
  } catch (e) {
    res
      .status(400)
      .render("pages/parkings/listingDetail", {
        error: e,
        partial: "emptyPartial",
        session: req.session.user.userId,
        hasErrors: true,
        title: "Book Listing",
      });
  }
});

router.delete("/removeListing/:id", async (req, res) => {
  let userId = req.session.user.userId;
  let listingId = req.params.id;
  try {
    if (!userId || !listingId) {
      throw `Missing parameter`;
    }
    common.checkObjectId(userId);
    common.checkObjectId(listingId);
  } catch (e) {
    res.status(400).render("pages/parkings/listings", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      hasErrors: true,
      error: e,
      title: "Listing",
    });
    return;
  }

  try {
    const data = await listingsData.removeListing(userId, listingId);
    if (!data) {
      res.status(404).render("pages/parkings/listings", {
        partial: "emptyPartial",
        error: "No data found.",
        session: req.session.user.userId,
        hasErrors: true,
        title: "Listing",
      });
      return;
    }
    res.render("pages/parkings/listings", {
      partial: "emptyPartial",
      getData: data,
      title: "Listing",
      session: req.session.user.userId,
    });
  } catch (e) {
    res
      .status(400)
      .render("pages/parkings/listings", {
        error: e,
        partial: "emptyPartial",
        session: req.session.user.userId,
        hasErrors: true,
        title: "Listing",
      });
  }
});

router.get("/updateListing/:id", async (req, res, next) => {
  let listingId = req.params.id;
  try {
    if (!listingId) {
      throw `Missing parameter`;
    }
    common.checkObjectId(listingId);
  } catch (e) {
    res.status(400).render("pages/parkings/listings", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      hasErrors: true,
      error: e,
      title: "Listing",
    });
    return;
  }

  try {
    sessionStorage.setItem("listingId", listingId);
    res.render("pages/parkings/listingUpdate", {
      partial: "emptyPartial",
      id: listingId,
      startTimeVal: timeSlot,
      endTimeVal: timeSlot,
      title: "Update Listing",
      session: req.session.user.userId,
    });
  } catch (e) {
    return res.status(400).render("pages/parkings/listings", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      hasErrors: true,
      error: e,
      title: "Listing",
    });
  }
});

router.put("/cancelBooking/:id", async (req, res) => {
  let parkingId;
  let userId;
  let listingId;
  // parkingId = sessionStorage.getItem("parkingId");
  userId = req.session.user.userId;
  listingId = req.params.id;

  try {
    if (!userId || !listingId) {
      throw `Missing parameter`;
    }
    common.checkObjectId(userId);
    common.checkObjectId(listingId);
  } catch (e) {
    res.status(400).render("pages/parkings/showBookings", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      hasErrors: true,
      error: e,
      title: "My Bookings",
    });
    return;
  }

  try {
    // if (parkingId == req.session.user.userId) { // update by lister
    const data = await listingsData.cancelBooking(
      // parkingId,
      userId,
      listingId
    );
    if (!data) {
      res.status(404).render("pages/parkings/showBookings", {
        partial: "emptyPartial",
        error: "No data found.",
        session: req.session.user.userId,
        hasErrors: true,
        title: "My Bookings",
      });
      return;
    }
    res.render("pages/parkings/showBookings", {
      partial: "emptyPartial",
      bookingdata: data,
      title: "My Bookings",
      session: req.session.user.userId,
      successMsg: "Booking Cancelled!."
    });
    return;
  } catch (e) {
    res.status(400).render("pages/parkings/showBookings", {
      partial: "emptyPartial",
      error: e,
      session: req.session.user.userId,
      hasErrors: true,
      title: "My Bookings",
    });
  }
});

router.put("/updateListingData/:id", async (req, res) => {
  const requestBody = req.body;
  let parkingId;
  parkingId = sessionStorage.getItem("parkingId");
  let userId = req.session.user.userId;

  let startDate = requestBody.startDate;
  let endDate = requestBody.endDate;
  let startTime = requestBody.startTime;
  let endTime = requestBody.endTime;
  let price = parseInt(requestBody.price);

  try {
// PENDING
    common.checkObjectId(parkingId);
    common.checkObjectId(userId);
    var today = new Date();
    if(startDate != '' && startDate != null) 
      common.checkInputDate(today, startDate, 1);
    if(endDate != "" && endDate != null) 
      common.checkInputDate(today, endDate, 1);
    if(startTime != 'Select Start Time' && startTime != "" && startTime != null) 
      common.checkInputTime(startTime);
    if(endTime != 'Select End Time' && endTime != "" && endTime != null) 
      common.checkInputTime(endTime);
    if(price != "" || price != null) 
      common.checkIsProperNumber(price);

  } catch (e) {
    res.status(400).render("pages/parkings/listingUpdate", {
      partial: "listingUpdate",
      session: req.session.user.userId,
      hasErrors: true,
      error: e,
      startTimeVal: timeSlot,
      endTimeVal: timeSlot,
      title: "Update Listing",
    });
    return;
  }
  
  try {
    const data = await listingsData.updateListingByLister(
      userId,
      parkingId,
      req.params.id,
      startDate,
      endDate,
      startTime,
      endTime,
      price
    );
    if (!data) {
      res.status(404).render("pages/parkings/listingUpdate", {
        partial: "listingUpdate",
        error: "No data found.",
        session: req.session.user.userId,
        hasErrors: true,
        title: "Listing",
        startTimeVal: timeSlot,
        endTimeVal: timeSlot,
      });
      return;
    }
    res.render("pages/parkings/listings", {
      partial: "listingUpdate",
      getData: data,
      session: req.session.user.userId,
      title: "Update Listing",
    });
    return;
  } catch (e) {
    res.status(400).render("pages/parkings/listingUpdate", {
      partial: "listingUpdate",
      error: e,
      session: req.session.user.userId,
      title: "Update Listing",
      hasErrors: true,
      startTimeVal: timeSlot,
      endTimeVal: timeSlot,
    });
  }
});

router.put("/bookListing/:id", async (req, res) => {
  const requestBody = req.body;
  let parkingId;
  let bookerId;
  let numberPlate;
  let listingId = req.params.id;

  parkingId = sessionStorage.getItem("parkingId");
  bookerId = req.session.user.userId;
  numberPlate = requestBody.numberPlate;
  userId = req.session.user.userId;

  try {
    if (
      !userId ||
      !parkingId ||
      !numberPlate
    ) {
      throw `Missing parameter`;
    }

    common.checkObjectId(parkingId);
    common.checkObjectId(userId);
    common.checkNumberPlate(numberPlate);

  } catch (e) {
    res.status(400).render("pages/parkings/listingDetail", {
      partial: "listingDetail",
      session: req.session.user.userId,
      hasErrors: true,
      error: e,
      startTimeVal: timeSlot,
      endTimeVal: timeSlot,
      title: "Book Listing",
    });
    return;
  }

  try {
    const data = await listingsData.bookListing(
      userId,
      parkingId,
      listingId,
      bookerId,
      numberPlate
    );
    if (!data) {
      res.status(404).render("pages/parkings/listingDetail", {
        partial: "listingDetail",
        error: "No data found.",
        session: req.session.user.userId,
        hasErrors: true,
        title: "Listing",
      });
      return;
    }
    res.render("pages/parkings/listings", {
      partial: "listingDetail",
      getData: data,
      title: "Listing Detail",
      session: req.session.user.userId,
    });
    return;
  } catch (e) {
    res.status(400).render("pages/parkings/listingDetail", {
      partial: "listingDetail",
      error: e,
      session: req.session.user.userId,
      hasErrors: true,
      title: "Book Listing",
    });
  }
});

router.put("/reportListing", async (req, res) => {
  try {
      reportListingInfo = req.body;
      
      const data = await listingsData.reportListing(reportListingInfo._id, reportListingInfo.bookerId);

      const parkingData = await listingsData.getAllListings(data._id.toString());
      if (!parkingData) {
        res.status(404).render("pages/parkings/listings", {
        partial: "emptyPartial",
        error: "Error 404 :No data found.",
      });
      return;
      }
      res.render("pages/parkings/listings", {
      partial: "emptyPartial",
      getData: parkingData,
      title: "Listing",
    });
  }
  catch (e) {
    res.status(404).json({ message: "Data not found " });  
  }
});

// router.put("/updateByUser/:id", async (req, res) => {
//     const requestBody = req.body;
//     let parkingId;

//     try {
//       const userData = await usersData.getUser(req.session.user.userId);
//       parkingId = userData.parkingId.toString();
//     } catch (e) {
//       res.status(400).render("users/login", { error: e });
//     }

//     let startDate = requestBody.startDate;
//     let endDate = requestBody.endDate;
//     let startTime = requestBody.startTime;
//     let endTime = requestBody.endTime;
//     let price = requestBody.price;

//     try {
//       const data = await listingsData.updateListingByLister(
//         parkingId,
//         req.params.id,
//         startDate,
//         endDate,
//         startTime,
//         endTime,
//         //   userCarCategory,
//         price
//       );
//       res.render("users/login", { data: data, title: "Create Listing" });
//     } catch (e) {
//       res.status(400).render("users/login", { error: e });
//     }
//   });

module.exports = router;
