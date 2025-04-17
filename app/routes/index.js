const express = require("express");
const router = express.Router();
const book = require("./book");
const common = require("./common");
const auth = require("./auth");
const review = require("./review");

router.use("/books",book);
router.use("/misc", common);
router.use("/auth", auth);
router.use("/review", review);

module.exports = router;