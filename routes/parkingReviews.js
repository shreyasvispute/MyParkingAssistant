const express = require("express");
const router = express.Router();
const data = require("../data");
const parkingsData = data.parkings;
const reviewData = data.parkingReviews;
const common = require("../data/common");
const errorCheck = require("../data/errorHandling");

router.get("/:id", async (req, res) => {
  if (common.xssCheck(req.params.id)) {
    res.status(400).json({ error: "XSS Attempt" });
    return;
  }
  if (!req.session.user) {
    return res.redirect("/users/login");
  }
  if (!errorCheck.checkId(req.params.id.trim())) {
    res.status(400).json({ error: "You must supply a valid Parking Id" });
    return;
  }
  try {
    const reviewParking = await parkingsData.getParking(req.params.id);
    res.json(reviewParking);
  } catch (e) {
    res.status(404).json({ error: "Parking not found" });
    return;
  }
});

router.get("/userreviews/:id", async (req, res) => {
  if (common.xssCheck(req.params.id)) {
    res.status(400).json({ error: "XSS Attempt" });
    return;
  }

  if (!req.session.user) {
    return res.redirect("/users/login");
  }
  if (!errorCheck.checkId(req.params.id.trim())) {
    res.status(400).json({ error: "You must supply a valid Parking Id" });
    return;
  }

  try {
    const reviewsOfUser = await reviewData.getAllReviewsOfUser(req.params.id);
    res.json(reviewsOfUser);
  } catch (e) {
    res.status(404).json({ error: "Reviews of user not found" });
    return;
  }
});

router.get("/parkingreviews/:id", async (req, res) => {
  if (common.xssCheck(req.params.id)) {
    res.status(400).json({ error: "XSS Attempt" });
    return;
  }
  if (!req.session.user) {
    return res.redirect("/users/login");
  }
  if (!errorCheck.checkId(req.params.id.trim())) {
    res.status(400).json({ error: "You must supply a valid Parking Id" });
    return;
  }

  try {
    const reviewsOfParking = await reviewData.getAllReviewsOfParking(
      req.params.id
    );
    res.json(reviewsOfParking);
  } catch (e) {
    res.status(404).json({ error: "Reviews of parking not found" });
    return;
  }
});

router.post("/:id", async (req, res) => {
  if (common.xssCheck(req.params.id)) {
    res.status(400).json({ error: "XSS Attempt" });
    return;
  }
  if (!req.session.user) {
    return res.redirect("/users/login");
  }
  let reviewInfo = req.body;

  const currentDate = new Date();
  const dateOfReview = currentDate.getMonth() +
            1 + '/' +
            currentDate.getDate() + '/' +
            currentDate.getFullYear()

  console.log(dateOfReview);
  reviewInfo.rating = parseInt(reviewInfo.rating);

  if (!errorCheck.checkId(req.params.id.trim())) {
    res.status(400).json({ error: "You must supply a valid Parking Id" });
    return;
  }

  if (!errorCheck.checkRating(reviewInfo.rating)) {
    res.status(400).json({ error: "You must supply a valid Rating" });
    return;
  }

  if (!errorCheck.checkString(reviewInfo.comment.trim())) {
    res.status(400).json({ error: "You must supply a valid Date" });
    return;
  }

  if (!errorCheck.checkDate(dateOfReview.trim())) {
    res.status(400).json({
      error:
        "Date provided is not in proper format. Also please enter today's date",
    });
    return;
  }

  try {
    if (
      common.xssCheck(reviewInfo.rating) ||
      common.xssCheck(reviewInfo.comment)
    ) {
      res.status(400).json({ error: "XSS Attempt" });
      return;
    }
    await parkingsData.getParking(req.params.id);
  } catch (e) {
    res.status(404).json({ error: "Parking not found" });
    return;
  }

  try {
    const newReview = await reviewData.createReview(
      req.params.id,
      req.session.user.userId.trim(),
      reviewInfo.rating,
      dateOfReview.trim(),
      reviewInfo.comment.trim(),
      req.session.user.username.trim()
    );
    const redirectUrl = "/parkings/" + req.params.id;
    res.redirect(redirectUrl);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.get("/editReview/:id", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/users/login");
  }
  if (!errorCheck.checkId(req.params.id.trim())) {
    res.status(400).json({ error: "You must supply a valid Review Id" });
    return;
  }
  try {
    const reviewDetails = await reviewData.getReview(req.params.id);
    res.status(200).render("pages/reviews/editReview", {
      partial: "emptyPartial",
      session: req.session.user.userId,
      reviewId: req.params.id,
      review: reviewDetails.comment,
      rating: reviewDetails.rating,
      userLoggedIn: true,
    });
  } catch (e) {
    res.status(404).json({ error: "Review not found" });
    return;
  }
});

router.put("/updateReview/", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/users/login");
  }
  let updateReviewInfo = req.body;
  console.log("Inside update review ", updateReviewInfo.reviewId);
  updateReviewInfo.rating = parseInt(updateReviewInfo.rating);

  if (!errorCheck.checkId(updateReviewInfo.reviewId.trim())) {
    res.status(400).json({ error: "You must supply a valid Review Id" });
    return;
  }

  if (!errorCheck.checkRating(updateReviewInfo.rating)) {
    res.status(400).json({ error: "You must supply a valid Rating" });
    return;
  }

  if (!errorCheck.checkString(updateReviewInfo.comment.trim())) {
    res.status(400).json({ error: "You must supply a valid Date" });
    return;
  }

  try {
    await reviewData.getReview(updateReviewInfo.reviewId);
  } catch (e) {
    res.status(404).json({ error: "Review not found" });
    return;
  }
  try {
    if (
      common.xssCheck(updateReviewInfo.reviewId) ||
      common.xssCheck(updateReviewInfo.rating) ||
      common.xssCheck(updateReviewInfo.comment)
    ) {
      res.status(400).json({ error: "XSS Attempt" });
      return;
    }

    const updatedReview = await reviewData.updateReview(
      updateReviewInfo.reviewId,
      updateReviewInfo.rating,
      updateReviewInfo.comment,
      req.session.user.username
    );
    res.redirect("/parkings/" + updatedReview.parkingId);
  } catch (e) {
    res.status(404).json({ error: e });
  }
});

router.delete("/deleteReview/:id", async (req, res) => {
  if (common.xssCheck(req.params.id)) {
    res.status(400).json({ error: "XSS Attempt" });
    return;
  }

  if (!req.session.user) {
    return res.redirect("/users/login");
  }
  deleteReviewInfo = req.body;
  if (!errorCheck.checkId(req.params.id.trim())) {
    res.status(400).json({ error: "You must supply a valid Parking Id" });
    return;
  }
  try {
    await reviewData.getReview(req.params.id);
  } catch (e) {
    res.status(404).json({ error: "Review not found" });
    return;
  }
  try {
    const deletedReview = await reviewData.removeReview(req.params.id);
    res.redirect("/parkings/" + deletedReview.parkingId);
  } catch (e) {
    res.status(404).json({ error: "Review cannot be deleted due to some error" });
  }
});

module.exports = router;
