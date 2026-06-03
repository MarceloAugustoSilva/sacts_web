const express = require("express");
const controller = require("../controllers/reportsController");

const router = express.Router();

// Endpoint único para o resumo do painel de relatórios.
router.get("/summary", controller.summary);

module.exports = router;
