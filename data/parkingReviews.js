const mongoCollections = require("../config/mongoCollections");
const parkings = mongoCollections.parkings;
const users = mongoCollections.users;
const errorCheck = require("./errorHandling");
const common = require("./common");
const { ObjectId } = require("mongodb");

const updateRating = (checkParking, rating) => {
  rating = parseInt(rating);
  let avgRating = rating;
  checkParking.parkingReviews.forEach((element) => {
    avgRating += element.rating;
  });

  avgRating = Number(avgRating/(checkParking.parkingReviews.length + 1)).toFixed(1);
  return avgRating;
};

let exportedMethods = {
  async createReview(parkingId, userId, rating, dateOfReview, comment, username) {
    if (
      common.xssCheck(parkingId) ||
      common.xssCheck(userId) ||
      common.xssCheck(rating) ||
      common.xssCheck(dateOfReview) ||
      common.xssCheck(comment) ||
      common.xssCheck(username)
    ) {
      throw `XSS Attempt`;
    }
    if (!errorCheck.checkId(parkingId)) throw "parkingId is not a valid input";
    if (!errorCheck.checkId(userId)) throw "userId is not a valid input";
    if (!errorCheck.checkRating(rating)) throw "Rating is not a valid input";
    if (!errorCheck.checkString(comment)) throw "Comment is not a valid input";
    if (!errorCheck.checkDate(dateOfReview))
      throw "The date provided is not a valid date. Please enter a valid date of today";

    const userCollection = await users();
    const userData = await userCollection.findOne({ _id: ObjectId(userId) });

    if (userData === null) throw "User does not exist";

    const parkingCollection = await parkings();
    const checkParking = await parkingCollection.findOne({
      _id: ObjectId(parkingId),
    });

    if (checkParking === null) throw "Parking does not exist";

    const averageRating = updateRating(checkParking, rating);

    const newReview = {
      _id: new ObjectId(),
      parkingId: parkingId,
      userId: userId,
      rating: rating,
      dateOfReview: dateOfReview,
      comment: comment,
      username: username
    };

    const ratingUpdate = await parkingCollection.updateOne(
      { _id: ObjectId(parkingId) },
      {
        $set: { overallRating: averageRating },
        $push: { parkingReviews: newReview },
      }
    );

    if (!ratingUpdate.matchedCount && !ratingUpdate.modifiedCount)
      throw "Creating reviews have been failed";

    const userUpdate = await userCollection.updateOne(
      { _id: ObjectId(userId) },
      { $push: { reviews: newReview } }
    );

    if (!userUpdate.matchedCount && !userUpdate.modifiedCount)
      throw "Cannot add Reviews to the User collection";

    const sameReview = await parkingCollection.findOne({
      _id: ObjectId(parkingId),
    });

    if (sameReview === null)
      throw "Parking does not exist, review cannot be displayed";

    return sameReview;
  },

  async getReview(reviewId) {
    if (common.xssCheck(reviewId)) {
      throw `XSS Attempt`;
    }

    if (!errorCheck.checkId(reviewId)) throw "Review Id is not a valid input";

    let resultData = {};
    const parkingCollection = await parkings();
    const parking = await parkingCollection.find({}).toArray();

    if (parking === null) throw "No review present with that ID";

    parking.forEach((element) => {
      element.parkingReviews.forEach((data) => {
        if (data._id.toString() === reviewId.toString()) {
          resultData = {
            _id: data._id,
            parkingId: data.parkingId,
            userId: data.userId,
            rating: data.rating,
            dateOfReview: data.dateOfReview,
            comment: data.comment,
            username: data.username
          };
        }
      });
    });
    return resultData;
  },

  async getAllReviewsOfParking(parkingId) {
    if (common.xssCheck(parkingId)) {
      throw `XSS Attempt`;
    }

    if (!errorCheck.checkId(parkingId)) throw "Parking Id is not a valid input";

    const parkingCollection = await parkings();
    const parking = await parkingCollection.findOne({
      _id: ObjectId(parkingId),
    });

    if (parking === null) throw "No parking found with that ID";
    return parking.parkingReviews;
  },

  async getAllReviewsOfUser(listerId) {
    if (common.xssCheck(listerId)) {
      throw `XSS Attempt`;
    }

    if (!errorCheck.checkId(listerId)) throw "Lister Id is not a valid input";

    let resultData = {};
    const parkingCollection = await parkings();
    const parking = await parkingCollection.find({}).toArray();

    if (parking === null) throw "No review present with that ID";

    parking.forEach((element) => {
      element.parkingReviews.forEach((data) => {
        if (data.userId.toString() === listerId.toString()) {
          resultData = {
            _id: data._id,
            parkingId: data.parkingId,
            userId: data.userId,
            rating: data.rating,
            dateOfReview: data.dateOfReview,
            comment: data.comment,
            username: data.username
          };
        }
      });
    });
    return resultData;
  },

  async removeReview(reviewId) {
    if (common.xssCheck(reviewId)) {
      throw `XSS Attempt`;
    }

    if (!errorCheck.checkId(reviewId)) throw "Review Id is not a valid input";

    let avgRating = 0;
    let resultData = {};
    const parkingCollection = await parkings();
    const parking = await parkingCollection
      .aggregate([
        { $unwind: "$parkingReviews" },
        { $match: { "parkingReviews._id": ObjectId(reviewId) } },
        { $replaceRoot: { newRoot: "$parkingReviews" } },
      ])
      .toArray();

    if (parking === null) throw "No review present with that Id";

    const removeReview = await parkingCollection.updateOne(
      {},
      { $pull: { parkingReviews: { _id: ObjectId(reviewId) } } }
    );

    if (!removeReview.matchedCount && !removeReview.modifiedCount)
      throw "Removal of review has failed";

    const getParkingData = await parkingCollection.findOne({
      _id: ObjectId(parking[0].parkingId),
    });

    if (getParkingData === null) throw "No parking found with that ID";

    getParkingData.parkingReviews.forEach((element) => {
      avgRating += element.rating;
    });

    if (getParkingData.parkingReviews.length !== 0) {
      avgRating = Number(
        avgRating / getParkingData.parkingReviews.length
      ).toFixed(1);
    } else {
      avgRating = 0;
    }

    const reviewUpdate = await parkingCollection.updateOne(
      { _id: ObjectId(parking[0].parkingId) },
      { $set: { overallRating: avgRating } }
    );

    if (!reviewUpdate.matchedCount && !reviewUpdate.modifiedCount)
      throw "Update of the rating has been failed";

    const userCollection = await users();
    const removeUserReview = await userCollection.updateOne(
      {},
      { $pull: { reviews: { _id: ObjectId(reviewId) } } }
    );

    if (!removeUserReview.matchedCount && !removeUserReview.modifiedCount)
      throw "Removal of review from the user has failed";

    resultData = {
      reviewId: reviewId,
      deleted: true,
      parkingId: parking[0].parkingId,
    };
    return resultData;
  },

  async updateReview(reviewId, rating, comment) {
    if (
      common.xssCheck(reviewId) ||
      common.xssCheck(rating) ||
      common.xssCheck(comment)
    ) {
      throw `XSS Attempt`;
    }

    if (!errorCheck.checkId(reviewId)) throw "Review Id is not a valid input";
    if (!errorCheck.checkRating(rating)) throw "Rating is not a valid input";
    if (!errorCheck.checkString(comment)) throw "Comment is not a valid input";

    rating = parseInt(rating);
    const userCollection = await users();
    const parkingCollection = await parkings();
    const findReview = await parkingCollection
      .aggregate([
        { $unwind: "$parkingReviews" },
        { $match: { "parkingReviews._id": ObjectId(reviewId) } },
        { $replaceRoot: { newRoot: "$parkingReviews" } },
      ])
      .toArray();

    if (findReview === null) throw "Review does not exist";

    const extractReview = await parkingCollection.updateOne(
      {},
      { $pull: { parkingReviews: { _id: ObjectId(reviewId) } } }
    );

    if (!extractReview.matchedCount && !extractReview.modifiedCount)
      throw "Review update has been failed";

    const getParkingData = await parkingCollection.findOne({
      _id: ObjectId(findReview[0].parkingId),
    });

    if (getParkingData === null) throw "No parking found with that ID";

    let avgRating = rating;
    getParkingData.parkingReviews.forEach((element) => {
      avgRating += element.rating;
    });

    if (getParkingData.parkingReviews.length !== 0) {
      avgRating = Number(
        avgRating / (getParkingData.parkingReviews.length + 1)
      ).toFixed(1);
    } else {
      avgRating = rating;
    }

    const newReviewInfo = {
      _id: findReview[0]._id,
      parkingId: findReview[0].parkingId,
      userId: findReview[0].userId,
      rating: rating,
      dateOfReview: findReview[0].dateOfReview,
      comment: comment,
      username: findReview[0].username
    };

    const updateReview = await parkingCollection.updateOne(
      { _id: ObjectId(findReview[0].parkingId) },
      {
        $set: { overallRating: avgRating },
        $push: { parkingReviews: newReviewInfo },
      }
    );

    if (!updateReview.matchedCount && !updateReview.modifiedCount)
      throw "Update has been failed";

    if (!updateReview.modifiedCount)
      throw "Same values has been provided for update. Please change the values";

    const extractUserReview = await userCollection.updateOne(
      {},
      { $pull: { reviews: { _id: ObjectId(reviewId) } } }
    );

    if (!extractUserReview.matchedCount && !extractUserReview.modifiedCount)
      throw "Review remove from the user have been failed";

    const updateNewReview = await userCollection.updateOne(
      { _id: ObjectId(findReview[0].userId) },
      { $push: { reviews: newReviewInfo } }
    );

    if (!updateNewReview.matchedCount && !updateNewReview.modifiedCount)
      throw "Update has been failed in the user collection";

    return await this.getReview(reviewId);
  },
};

module.exports = exportedMethods;
