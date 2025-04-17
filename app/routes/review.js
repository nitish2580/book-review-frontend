const { createReview } = require("../controller/reviewController");

const router = require("express").Router();


router.post("/createReview", createReview);


module.exports = router;