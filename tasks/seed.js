const { json } = require("express");
const connection = require("../config/mongoConnection");
const parkingReviews = require("../data/parkingReviews");
const parkings = require("../data/parkings");
const listings = require("../data/listings");
const users = require("../data/users");

const main = async () => {
  try {
    let user1 = await users.createUser(
      "Harsh",
      "Agrawal",
      "harshagrawal1802@gmail.com",
      1234567890,
      "harshagr1802",
      "12345678",
      "123 Saint Pauls Ave",
      "Hoboken",
      "NJ",
      "07306"
    );

    let user2 = await users.createUser(
      "Shivani",
      "Maurya",
      "smaurya@stevens.edu",
      1234567890,
      "smaurya",
      "12345678",
      "25 Central Ave",
      "Jersey City",
      "NJ",
      "07106"
    );

    let user3 = await users.createUser(
      "Harshal",
      "Vaidya",
      "hvaidya@stevens.edu",
      1234567890,
      "hvaidya",
      "12345678",
      "21 Sherman Ave",
      "Bayonne",
      "NJ",
      "07300"
    );

    let user4 = await users.createUser(
      "Shreyas",
      "Vispute",
      "svisput@stevens.edu",
      1234567890,
      "svisput",
      "12345678",
      "211 Congress St.",
      "Bayonne",
      "NJ",
      "07333"
    );

    let createParking1 = await parkings.createParkings(
      user1,
      "public/images/1.jpg",
      "105 Sherman Ave",
      "Jersey City",
      "NJ",
      "07111",
      "-74.04739671755404",
      "40.74463986230668",
      ["sedan", "suv"],
      "open"
    );
    let createParking2 = await parkings.createParkings(
      user1,
      "public/images/2.jpg",
      "123 Saint Pauls Ave",
      "Jersey City",
      "NJ",
      "07306",
      "-74.05669010392448",
      "40.73640363385621, ",
      ["sedan", "suv"],
      "open"
    );
    let createParking3 = await parkings.createParkings(
      user1,
      "public/images/3.jpg",
      "50 Beach St.",
      "Jersey City",
      "NJ",
      "07201",
      "-74.05651408686698",
      "40.744427548956196",
      ["sedan", "suv"],
      "open"
    );

    let createParking4 = await parkings.createParkings(
      user2,
      "public/images/4.jpg",
      "121 Congress St.",
      "Jersey City",
      "NJ",
      "07300",
      "-74.04623571755381",
      "40.751064743459",
      ["sedan", "suv"],
      "open"
    );

    let createParking5 = await parkings.createParkings(
      user2,
      "public/images/5.jpg",
      "33rd St.",
      "New York",
      "NY",
      "07300",
      "-73.99537621738884",
      "40.75235302226383",
      ["sedan", "suv"],
      "open"
    );

    let createParking6 = await parkings.createParkings(
      user2,
      "public/images/parkingImg-1638473263834.jpg",
      "E 161 St.",
      "New York",
      "NY",
      "07300",
      "-73.92631858638019",
      "40.82974684316919",
      ["sedan", "suv"],
      "open"
    );

    let createListing1 = await listings.createListing(
      user2,
      createParking6._id,
      "2021-12-23",
      "2021-12-23",
      "10",
      "12",
      20
    );

    let createListing2 = await listings.createListing(
      user1,
      createParking3._id,
      "2021-12-24",
      "2021-12-24",
      "10",
      "12",
      20
    );

    let createListing3 = await listings.createListing(
      user1,
      createParking2._id,
      "2021-12-24",
      "2021-12-24",
      "10",
      "12",
      20
    );

    let createListing4 = await listings.createListing(
      user2,
      createParking4._id,
      "2021-12-19",
      "2021-12-19",
      "10",
      "12",
      20
    );

    let createListing5 = await listings.createListing(
      user2,
      createParking5._id,
      "2021-12-19",
      "2021-12-19",
      "10",
      "12",
      20
    );

    let createListing6 = await listings.createListing(
      user2,
      createParking5._id,
      "2021-12-20",
      "2021-12-20",
      "10",
      "12",
      20
    );

    let createListing7 = await listings.createListing(
      user1,
      createParking1._id,
      "2021-12-22",
      "2021-12-22",
      "10",
      "12",
      20
    );

    let createListing8 = await listings.createListing(
      user1,
      createParking2._id,
      "2021-12-26",
      "2021-12-26",
      "10",
      "12",
      20
    );

    let review1 = await parkingReviews.createReview(
      createParking1._id,
      user3,
      5,
      "12/13/2021",
      "This is a very nice parking space",
      "hvaidya"
    );

    let review2 = await parkingReviews.createReview(
      createParking1._id,
      user3,
      2,
      "12/13/2021",
      "Not that good space",
      "hvaidya"
    );

    let review3 = await parkingReviews.createReview(
      createParking2._id,
      user4,
      4,
      "12/13/2021",
      "Excellent space",
      "svisput"
    );

    let review4 = await parkingReviews.createReview(
      createParking2._id,
      user4,
      1,
      "12/13/2021",
      "Bad space",
      "svisput"
    );

    let review5 = await parkingReviews.createReview(
      createParking3._id,
      user3,
      4,
      "12/13/2021",
      "Not that good space",
      "hvaidya"
    );

    let review6 = await parkingReviews.createReview(
      createParking3._id,
      user4,
      2,
      "12/13/2021",
      "Good space",
      "svisput"
    );

    const db = await connection();
    await db._connection.close();
  } catch (error) {
    console.log(error);
  }
};

main().catch((error) => {
  console.log(error);
});
