const express = require("express");
const { fetchAllBooks, fetchBook } = require("../controller/book");
const router = express.Router();


router.get("/", fetchAllBooks);
router.get("/:id", fetchBook);


module.exports = router;