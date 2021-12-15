const parkingRoutes = require("./parkings");
const userRoutes = require("./users");
const dashboardRoutes = require("./dashboard");
const reviewRoutes = require("./parkingReviews");
const listingRoutes = require("./listings");
const constructorMethod = (app) => {
  //keep "/" route first always!
  app.use("/", dashboardRoutes);
  app.use("/users", userRoutes);
  app.use("/parkings", parkingRoutes);
  app.use("/reviews", reviewRoutes);
  app.use("/listings", listingRoutes);
  app.use("*", (req, res) => {
    res.status(404).json({ error: "Path Not Found" });
  });
};

module.exports = constructorMethod;