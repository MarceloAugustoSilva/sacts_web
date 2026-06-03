const express = require("express");
const controller = require("../controllers/seedController");

const router = express.Router();

router.post("/", controller.seed);

module.exports = router;
