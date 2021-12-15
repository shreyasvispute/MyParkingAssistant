const express = require("express");
const session = require("express-session");
const app = express();
const static = express.static(__dirname + "/public");
var bodyParser = require("body-parser");

const configRoutes = require("./routes");
const exphbs = require("express-handlebars");

app.use("/public", static);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const handlebarsInstance = exphbs.create({
  defaultLayout: "main",
  // Specify helpers which are only registered on this instance.
  helpers: {
    asJSON: (obj, spacing) => {
      if (typeof spacing === "number")
        return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));

      return new Handlebars.SafeString(JSON.stringify(obj));
    },
  },
  partialsDir: ["views/partials/"],
});

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  // if (req.body && req.body._method) {
  //   req.method = req.body._method;
  //   delete req.body._method;
  // }
  if (req.url == "/parkings/update/") {
    req.method = "PUT";
  }

  if (req.url == "/reviews/updateReview/") {
    req.method = "PUT";
  }

  if (req.url == "/listings/bookListing/") {
    req.method = "PUT";
  }
  if (req.url == "/listings/updateListingData/") {
    req.method = "PUT";
  }

  if (req.url.startsWith("/reviews/deleteReview/")) {
    req.method = "DELETE";
  }

  if(req.url.startsWith("/listings/reportListing/")) {
    req.method = "PUT"
  }

  if (req.url.startsWith("/parkings/delete/")) {
    req.method = "DELETE";
  }
  // let the next middleware run:
  next();
};
app.use(
  session({
    name: "AuthCookie",
    secret: "Beer Battered chicken wings with salsa!",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, //cookie day timeout
  })
);

app.use(function (req, res, next) {
  userStatus = !req.session.user
    ? "Non-Authenticated User"
    : "Authenticated User";
  console.log(
    "[" +
      new Date().toUTCString() +
      "]:" +
      " " +
      req.method +
      " " +
      req.originalUrl +
      " (" +
      userStatus +
      ")"
  );
  next();
});


app.use("/", (req, res, next) => {
  if (
    !req.session.user &&
    !(
      req.url == "/users/createProfile" ||
      req.url == "/users/login" ||
      req.url == "/users/createUser"
    )
  ) {
    res.redirect("/users/login");
    return;
  }
  next();
});

app.use("/listings/bookListing/:id", (req,res,next) => {
    req.method = 'put';
    next();
});

app.use("/listings/updateListingData/:id", (req,res,next) => {
  req.method = 'put';
  next();
});

app.use("/listings/removeListing/:id", (req,res,next) => {
  req.method = 'delete';
  next();
});

app.use("/listings/cancelBooking/:id", (req,res,next) => {
  req.method = 'put';
  next();
});

app.use("/", (req, res, next) => {
  if (
    req.session.user &&
    (req.url == "/users/createProfile" ||
      req.url == "/users/login" ||
      req.url == "/users/createUser")
  ) {
    res.redirect("/");
    return;
  }
  next();
});

app.use(rewriteUnsupportedBrowserMethods);

app.engine("handlebars", handlebarsInstance.engine);
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});